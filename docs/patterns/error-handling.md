# Error Handling with neverthrow

## Introduction

This document describes the error handling pattern using **neverthrow** for type-safe, explicit error handling without exceptions.

---

## 1. Why neverthrow?

### Problems with Exceptions

```typescript
// Traditional approach - problems:
async function createUser(data: UserData): Promise<User> {
  // 1. Caller doesn't know what errors can occur
  // 2. Easy to forget try/catch
  // 3. Type system doesn't help
  const user = await db.insert(users).values(data)
  if (!user) throw new Error('Failed to create user')
  return user
}
```

### neverthrow Solution

```typescript
// neverthrow approach - benefits:
async function createUser(data: UserData): ResultAsync<User, CreateUserError> {
  // 1. Errors are explicit in the return type
  // 2. Caller MUST handle the error case
  // 3. TypeScript enforces error handling
  return ResultAsync.fromPromise(
    db.insert(users).values(data),
    (error) => ({ type: 'repository_error', cause: error })
  )
}
```

---

## 2. Core Concepts

### Result Type

```typescript
import { ok, err, Result } from 'neverthrow'

// Synchronous operations
function validateEmail(email: string): Result<string, ValidationError> {
  if (!email.includes('@')) {
    return err({ type: 'validation_error', message: 'Invalid email' })
  }
  return ok(email.toLowerCase())
}
```

### ResultAsync Type

```typescript
import { ResultAsync, okAsync, errAsync } from 'neverthrow'

// Asynchronous operations
function findUser(id: string): ResultAsync<User | null, RepositoryError> {
  return ResultAsync.fromPromise(
    db.select().from(users).where(eq(users.id, id)).then(rows => rows[0] ?? null),
    (error) => ({ type: 'repository_error', operation: 'findUser', cause: error })
  )
}
```

---

## 3. Error Type Patterns

### Discriminated Union Errors

```typescript
// Define error types as discriminated unions
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'duplicate_email'; message: string }
  | { type: 'repository_error'; cause: unknown }

// TypeScript knows exactly what errors are possible
function handleError(error: CreateUserError) {
  switch (error.type) {
    case 'forbidden':
      return { status: 403, message: error.message }
    case 'validation_error':
      return { status: 400, message: error.message }
    case 'duplicate_email':
      return { status: 409, message: error.message }
    case 'repository_error':
      console.error('DB error:', error.cause)
      return { status: 500, message: 'Internal error' }
  }
}
```

### Repository Errors

```typescript
// Standard repository error
export type RepositoryError = {
  type: 'repository_error'
  operation: string
  cause: unknown
}

// Helper to create repository errors
const wrapError = (operation: string) => (cause: unknown): RepositoryError => ({
  type: 'repository_error',
  operation,
  cause,
})
```

### Domain Errors

```typescript
// Domain validation errors
export type ValidationError = {
  type: 'validation_error'
  entity: string
  field: string
  message: string
}

export const validationError = (
  entity: string,
  field: string,
  message: string
): ValidationError => ({
  type: 'validation_error',
  entity,
  field,
  message,
})
```

---

## 4. Chaining Operations

### andThen (flatMap)

Chain operations that can fail:

```typescript
function createUser(input: CreateUserInput): ResultAsync<User, CreateUserError> {
  return deps.userRepository
    .existsByEmail(ctx, input.email)
    .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
    .andThen((exists) => {
      if (exists) {
        return errAsync<User, CreateUserError>({
          type: 'duplicate_email',
          message: 'Email already exists',
        })
      }

      return deps.userRepository
        .create(ctx, input)
        .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
    })
}
```

### map

Transform the success value:

```typescript
function getUser(id: string): ResultAsync<UserDTO, Error> {
  return deps.userRepository
    .findById(ctx, id)
    .map((user) => ({
      id: user.id,
      name: user.name,
      // Transform to DTO
    }))
}
```

### mapErr

Transform the error value:

```typescript
function findUser(id: string): ResultAsync<User, UseCaseError> {
  return deps.userRepository
    .findById(ctx, id)
    .mapErr((e): UseCaseError => ({
      type: 'repository_error',
      cause: e.cause,
    }))
}
```

---

## 5. Repository Pattern

```typescript
// src/server/repositories/user.repository.ts
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

  create: (ctx, data) =>
    ResultAsync.fromPromise(
      db.insert(usersTable)
        .values({ ...data, organizationId: ctx.organizationId })
        .returning()
        .then((rows) => rows[0]),
      wrapError('create')
    ),
})
```

---

## 6. Use Case Pattern

```typescript
// src/server/use-cases/users/create-user.ts
export type CreateUserError =
  | { type: 'forbidden'; message: string }
  | { type: 'validation_error'; message: string }
  | { type: 'duplicate_email'; message: string }
  | { type: 'repository_error'; cause: unknown }

export const makeCreateUser =
  (deps: Dependencies) =>
  (input: CreateUserInput): ResultAsync<User, CreateUserError> => {
    // 1. Authorization (returns early if forbidden)
    if (!hasPermission(input.memberRole, 'users:write')) {
      return errAsync({
        type: 'forbidden',
        message: 'No permission to create users',
      })
    }

    // 2. Domain validation
    const userResult = createUserEntity({
      id: deps.generateId(),
      ...input.user,
    })

    if (userResult.isErr()) {
      return errAsync({
        type: 'validation_error',
        message: userResult.error.message,
      })
    }

    const ctx = { organizationId: input.organizationId }

    // 3. Business rule check (duplicate)
    return deps.userRepository
      .existsByEmail(ctx, input.user.email)
      .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
      .andThen((exists) => {
        if (exists) {
          return errAsync<User, CreateUserError>({
            type: 'duplicate_email',
            message: 'A user with this email already exists',
          })
        }

        // 4. Persist
        return deps.userRepository
          .create(ctx, userResult.value)
          .mapErr((e): CreateUserError => ({ type: 'repository_error', cause: e.cause }))
      })
  }
```

---

## 7. Procedure Pattern

```typescript
// src/server/procedures/users/create-user.ts
export const createUser = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create users' },
    DUPLICATE_EMAIL: { message: 'A user with this email already exists' },
    VALIDATION_ERROR: { message: 'Invalid input' },
  })
  .input(createUserInputSchema)
  .output(userSchema)
  .handler(async ({ input, context, errors }) => {
    const result = await makeCreateUser({
      userRepository: createUserRepository(context.db),
      generateId: () => crypto.randomUUID(),
    })({
      organizationId: context.organization.id,
      memberRole: context.organization.role,
      user: input,
    })

    // Handle all error cases with switch
    if (result.isErr()) {
      const error = result.error
      switch (error.type) {
        case 'forbidden':
          throw errors.FORBIDDEN()
        case 'duplicate_email':
          throw errors.DUPLICATE_EMAIL()
        case 'validation_error':
          throw errors.VALIDATION_ERROR()
        case 'repository_error':
          console.error('Repository error:', error.cause)
          throw new Error('Internal error')
      }
    }

    return result.value
  })
```

---

## 8. Type Annotations

**Important**: Always annotate `okAsync` and `errAsync` generics:

```typescript
// WRONG - TypeScript can't infer the type
return errAsync({ type: 'not_found', message: 'User not found' })

// CORRECT - Explicit type annotation
return errAsync<User, CreateUserError>({
  type: 'not_found',
  message: 'User not found',
})

// CORRECT - okAsync too
return okAsync<User, CreateUserError>(user)
```

---

## 9. Common Patterns

### Null Handling

```typescript
.andThen((user) => {
  if (!user) {
    return errAsync<User, Error>({
      type: 'not_found',
      message: 'User not found',
    })
  }
  return okAsync<User, Error>(user)
})
```

### Multiple Repository Calls

```typescript
return deps.userRepository
  .findById(ctx, id)
  .andThen((user) => {
    if (!user) {
      return errAsync({ type: 'not_found', message: 'User not found' })
    }
    return deps.userRepository.update(ctx, id, data)
  })
  .andThen(() => deps.auditRepository.log(ctx, { action: 'update', userId: id }))
```

### Combining Results

```typescript
import { combine } from 'neverthrow'

const results = await combine([
  deps.userRepository.findById(ctx, userId),
  deps.orgRepository.findById(ctx, orgId),
])

if (results.isErr()) {
  return errAsync({ type: 'repository_error', cause: results.error })
}

const [user, org] = results.value
```

---

## 10. Best Practices

1. **Never throw in repositories or use cases** - Always return Result/ResultAsync
2. **Define explicit error types** - Use discriminated unions
3. **Transform errors at boundaries** - mapErr when crossing layers
4. **Annotate generics** - Always specify types for okAsync/errAsync
5. **Handle all cases** - Use switch with exhaustive checking
6. **Log at the edge** - Log repository errors in procedures, not use cases

---

## See Also

- `/repository` skill - Repository implementation with ResultAsync
- `/use-case` skill - Use case error handling patterns
- `/procedure` skill - Mapping errors to API responses
