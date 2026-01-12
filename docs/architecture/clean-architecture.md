# Clean Architecture and Domain-Driven Design

## Introduction

This document describes the Clean Architecture pattern combined with Domain-Driven Design (DDD). This architecture keeps code decoupled, testable, and scalable.

## Fundamental Principles

### 1. Layer Separation

The architecture is divided into three main layers with unidirectional dependencies:

```
┌─────────────────────────────────────┐
│   Infrastructure Layer              │
│   (Database, External APIs)         │
└────────────┬────────────────────────┘
             │ implements
             ↓
┌─────────────────────────────────────┐
│   Application Layer                 │
│   (Use Cases, Procedures)           │
└────────────┬────────────────────────┘
             │ uses
             ↓
┌─────────────────────────────────────┐
│   Domain Layer                      │
│   (Entities, Services, Ports)       │
└─────────────────────────────────────┘
```

**Dependency Rule**: Outer layers depend on inner layers, never the reverse.

### 2. Ports and Adapters (Hexagonal Architecture)

**Ports** are interfaces that define contracts:

```typescript
// Port (interface) in src/core/ports/
export interface UserRepository {
  create(data: CreateUserData, context: OrganizationContext): ResultAsync<User, RepositoryError>
  findById(id: string, context: OrganizationContext): ResultAsync<User | null, RepositoryError>
  update(id: string, data: UpdateUserData, context: OrganizationContext): ResultAsync<void, RepositoryError>
}
```

**Adapters** are concrete implementations:

```typescript
// Adapter (implementation) in src/server/repositories/
export class DrizzleUserRepository implements UserRepository {
  constructor(private db: DbClient) {}

  create(data: CreateUserData, context: OrganizationContext): ResultAsync<User, RepositoryError> {
    return ResultAsync.fromPromise(
      this.db.insert(usersTable).values({
        ...data,
        organizationId: context.organizationId
      }).returning(),
      (error) => new RepositoryError('Failed to create user', error)
    ).map((rows) => rows[0])
  }

  // ... other implementations
}
```

### 3. Dependency Injection with Factory Pattern

Use cases **do not instantiate** their dependencies, they receive them as parameters:

```typescript
// Factory function for use case
export function makeCreateUser(deps: {
  userRepository: UserRepository
  generateId: () => string
}) {
  return async function createUser(input: CreateUserInput): Promise<Result<User, Error>> {
    // Uses deps.userRepository instead of instantiating it
    const result = await deps.userRepository.create(input, context)
    return result
  }
}
```

This enables:
- **Testability**: Inject mocks in tests
- **Flexibility**: Change implementations without modifying use cases
- **Decoupling**: Use cases don't know infrastructure details

---

## Domain Layer (src/core/)

This layer contains **pure business logic**, without dependencies on frameworks or external libraries.

### Folder Structure

```
src/core/
├── domain/
│   ├── entities/          # Domain models
│   ├── services/          # Pure domain logic
│   └── errors/            # Domain errors
├── ports/                 # Repository interfaces
│   ├── types.ts           # Shared types (OrganizationContext)
│   ├── user-repository.ts
│   └── ...
└── index.ts               # Exports (NOT a barrel file)
```

### Entities (Domain Entities)

Entities represent business concepts with identity and lifecycle:

```typescript
// src/core/domain/entities/user.ts
export type User = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
}

export type CreateUserData = {
  name: string
  email: string
  role?: string
}
```

Characteristics:
- **Immutable**: No methods that mutate state
- **Plain objects**: Not classes with behavior
- **External validation**: Validation is done in use cases or services

### Domain Services

Business logic that **doesn't belong to a specific entity**:

```typescript
// src/core/domain/services/authorization.ts
export type Role = 'owner' | 'admin' | 'member'
export type Permission = 'users:read' | 'users:write' | ...

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
```

---

## Application Layer (src/server/use-cases/)

Contains use cases that orchestrate domain logic and infrastructure.

### Folder Structure

```
src/server/use-cases/
├── users/
│   ├── create-user.ts
│   ├── update-user.ts
│   └── delete-user.ts
├── organizations/
│   └── ...
└── ...
```

### Use Case Structure

```typescript
// src/server/use-cases/users/create-user.ts
import { hasPermission } from '@/core/services/authorization'
import { createUser as createUserEntity } from '@/core/entities/user'
import type { UserRepository } from '@/core/ports/user-repository'
import { errAsync, type ResultAsync } from 'neverthrow'

type Dependencies = {
  userRepository: UserRepository
  generateId: () => string
}

export type CreateUserInput = {
  organizationId: string
  memberRole: Role
  user: { name: string; email: string }
}

export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'repository_error'; cause: unknown }

export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<User, CreateUserError> => {
    // 1. Authorization first
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({ type: 'forbidden', message: 'No permission' })
    }

    // 2. Domain validation
    const userResult = createUserEntity({
      id: deps.generateId(),
      ...input.user
    })

    if (userResult.isErr()) {
      return errAsync({ type: 'validation_error', message: userResult.error.message })
    }

    // 3. Persist
    return deps.userRepository
      .create(userResult.value, { organizationId: input.organizationId })
      .mapErr((e) => ({ type: 'repository_error', cause: e }))
  }
```

---

## Infrastructure Layer (src/server/repositories/)

Contains concrete implementations of ports.

### Repository Structure

```typescript
// src/server/repositories/user.repository.ts
import { ResultAsync } from 'neverthrow'
import { eq, and } from 'drizzle-orm'

const wrapError = (operation: string) => (cause: unknown): RepositoryError => ({
  type: 'repository_error',
  operation,
  cause,
})

export const createUserRepository = (db: DbClient): UserRepository => ({
  findById: (ctx, id) =>
    ResultAsync.fromPromise(
      db.select()
        .from(usersTable)
        .where(and(
          eq(usersTable.id, id),
          eq(usersTable.organizationId, ctx.organizationId)
        ))
        .then((rows) => rows[0] ?? null),
      wrapError('findById')
    ),

  // ... other methods
})
```

---

## Data Flow

```
Route → Component → API Query/Mutation → Procedure → Use Case → Repository → Database
                                                          ↓
                                                    Authorization Check
                                                    (via core/services/authorization.ts)
```

---

## Key Rules

1. **Domain layer has no external dependencies** - Only pure TypeScript
2. **Use cases receive dependencies** - Never instantiate repositories
3. **Repositories always filter by context** - Multi-tenancy security
4. **Authorization checks first** - Before any business logic
5. **Error handling with ResultAsync** - No throwing exceptions

---

## See Also

- `/repository` skill - Repository implementation patterns
- `/use-case` skill - Use case implementation patterns
- `/port` skill - Port/interface definitions
- `/authorization` skill - Authorization patterns
