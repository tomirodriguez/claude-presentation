# Multi-Tenancy and Organizations

## Introduction

This document describes the **multi-tenancy** pattern that allows isolating data between organizations in a single shared database.

---

## 1. What is Multi-Tenancy?

**Multi-tenancy** is an architecture where a single application instance serves multiple customers (tenants), keeping their data completely isolated.

### Example

- **Tenant 1**: Company XYZ with 50 employees
- **Tenant 2**: Company ABC with 100 employees
- **Requirement**: Users from XYZ cannot see data from ABC (and vice versa)

### Common Approaches

1. **Database per Tenant**: Each tenant has its own database
   - ✅ Perfect isolation
   - ❌ Expensive, hard to scale

2. **Schema per Tenant**: Each tenant has its own PostgreSQL schema
   - ✅ Good isolation
   - ❌ Complex to manage with many tenants

3. **Shared Database + Row-Level Security**: One DB, filter by `tenantId`
   - ✅ Scalable, cost effective
   - ⚠️ Requires discipline to avoid data leaks
   - **This is the recommended approach**

---

## 2. OrganizationContext Pattern

### 2.1 Definition

The **OrganizationContext** is a type that is passed to all operations requiring isolation:

```typescript
// src/core/ports/types.ts
export type OrganizationContext = {
  organizationId: string
}
```

**Golden Rule**: Every tenant-scoped operation MUST receive `OrganizationContext`.

### 2.2 Data Flow

```
┌─────────────────────────────────────────────────┐
│  Frontend (React)                               │
│  - User selects organization                    │
│  - Stored in auth plugin                        │
└────────────┬────────────────────────────────────┘
             │ HTTP Request
             │ Header: X-Organization-Slug: acme-corp
             ↓
┌─────────────────────────────────────────────────┐
│  Middleware (authProcedure)                     │
│  - Reads header X-Organization-Slug             │
│  - Resolves slug → organizationId               │
│  - Verifies user is a member                    │
│  - Injects into context                         │
└────────────┬────────────────────────────────────┘
             │ context.organization.id
             ↓
┌─────────────────────────────────────────────────┐
│  Use Case                                       │
│  - Receives organizationId in parameters        │
│  - Passes to repository as OrganizationContext  │
└────────────┬────────────────────────────────────┘
             │ { organizationId: 'uuid' }
             ↓
┌─────────────────────────────────────────────────┐
│  Repository                                     │
│  - ALWAYS filters by organizationId             │
│  - Queries use WHERE organizationId = ...       │
│  - Inserts include organizationId               │
└─────────────────────────────────────────────────┘
```

---

## 3. Database Implementation

### 3.1 Schema Design

**Rule**: All tenant-scoped entities include `organization_id` column:

```typescript
// src/db/schema/users.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { organizationsTable } from './organizations'

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Multi-tenancy key (ALWAYS include for tenant-scoped entities)
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizationsTable.id, { onDelete: 'cascade' }),

  // Data
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Composite index for multi-tenant queries
export const usersByOrgIdx = index('users_org_email_idx')
  .on(usersTable.organizationId, usersTable.email)
```

**Important notes**:
- `organization_id` is **NOT NULL** (every user belongs to an org)
- Foreign key with `ON DELETE CASCADE` (deleting org deletes users)
- Composite index to optimize multi-tenant queries

### 3.2 Global vs Tenant-Scoped Entities

**Global** (no `organization_id`):
- `plans` - Subscription plans are global
- `system_config` - System configuration
- Reference data shared across all tenants

**Tenant-Scoped** (with `organization_id`):
- `users` - Users belong to organizations
- `projects` - Projects are per organization
- `invitations` - Invitations are per organization
- Any data that belongs to a specific tenant

---

## 4. Repository Implementation

### 4.1 Always Filter by organizationId

```typescript
// src/server/repositories/user.repository.ts
export const createUserRepository = (db: DbClient): UserRepository => ({
  findById: (ctx: OrganizationContext, id: string) =>
    ResultAsync.fromPromise(
      db.select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.id, id),
            eq(usersTable.organizationId, ctx.organizationId) // CRITICAL
          )
        )
        .then((rows) => rows[0] ?? null),
      wrapError('findById')
    ),

  create: (ctx: OrganizationContext, data: CreateUserData) =>
    ResultAsync.fromPromise(
      db.insert(usersTable).values({
        ...data,
        organizationId: ctx.organizationId, // CRITICAL
      }).returning(),
      wrapError('create')
    ).map((rows) => rows[0]),

  findAll: (ctx: OrganizationContext, filters?: UserFilters) =>
    ResultAsync.fromPromise(
      db.select()
        .from(usersTable)
        .where(
          and(
            eq(usersTable.organizationId, ctx.organizationId), // CRITICAL
            // ... other filters
          )
        ),
      wrapError('findAll')
    ),
})
```

### 4.2 Common Mistakes

```typescript
// WRONG - Missing organizationId filter
findById: (id: string) =>
  db.select().from(usersTable).where(eq(usersTable.id, id))

// WRONG - organizationId not in WHERE clause
findAll: () =>
  db.select().from(usersTable)

// CORRECT - Always filter by organizationId
findById: (ctx: OrganizationContext, id: string) =>
  db.select().from(usersTable).where(
    and(
      eq(usersTable.id, id),
      eq(usersTable.organizationId, ctx.organizationId)
    )
  )
```

---

## 5. Use Case Implementation

```typescript
// src/server/use-cases/users/create-user.ts
export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<User, CreateUserError> => {
    // Create context from input
    const ctx = { organizationId: input.organizationId }

    // Pass context to all repository calls
    return deps.userRepository
      .existsByEmail(ctx, input.email) // Uses context
      .andThen((exists) => {
        if (exists) {
          return errAsync({ type: 'duplicate_email', message: 'Email exists' })
        }
        return deps.userRepository.create(ctx, input) // Uses context
      })
  }
```

---

## 6. Procedure Implementation

```typescript
// src/server/procedures/users/create-user.ts
export const createUser = authProcedure
  .input(createUserInputSchema)
  .output(userSchema)
  .handler(async ({ input, context }) => {
    const result = await makeCreateUser({
      userRepository: createUserRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })({
      organizationId: context.organization.id, // From middleware
      memberRole: context.organization.role,
      user: input,
    })

    // ... error handling
    return result.value
  })
```

---

## 7. Security Checklist

When implementing multi-tenancy:

- [ ] All tenant-scoped tables have `organization_id` column
- [ ] Foreign key references organizations with `ON DELETE CASCADE`
- [ ] Composite indexes include `organization_id` first
- [ ] All repository methods receive `OrganizationContext`
- [ ] All queries filter by `organizationId`
- [ ] All inserts include `organizationId`
- [ ] Middleware validates user membership in organization
- [ ] Use cases create context from input and pass to repositories

---

## 8. Debugging Multi-Tenancy Issues

### Symptom: User sees data from other organizations

**Fix**: Ensure ALL queries filter by `organizationId`:

```typescript
.where(
  and(
    eq(table.id, id),
    eq(table.organizationId, context.organizationId) // Don't forget!
  )
)
```

### Symptom: Data created in wrong organization

**Fix**: Ensure inserts include `organizationId` from context:

```typescript
db.insert(table).values({
  ...data,
  organizationId: context.organizationId, // Must come from context
})
```

---

## See Also

- `/repository` skill - Repository implementation with context
- `/port` skill - Port definitions with OrganizationContext
- `docs/architecture/clean-architecture.md` - Overall architecture
