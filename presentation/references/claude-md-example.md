# Claude Development Guidelines

**Project**: Mi App - Sistema de gestión

---

## Quick Reference

**Stack**: Next.js + TypeScript + Drizzle
**Architecture**: Clean Architecture + DDD

---

## Essential Rules (ALWAYS Follow)

### 1. No Type Casting (`as`)

**NEVER** use `as` to cast types. Fix the actual type issue instead.

```typescript
// BAD - Hiding type problems
const user = data as User

// GOOD - Proper typing
const userResult = userSchema.safeParse(data)
if (!userResult.success) throw new Error('Invalid user')
const user = userResult.data
```

### 2. No Non-Null Assertions (`!`)

**NEVER** use `!` (non-null assertion). Use nullish coalescing or guards.

```typescript
// BAD - Dangerous assumption
const name = user!.name

// GOOD - Safe alternatives
const name = user?.name ?? 'Default'
```

### 3. No Barrel Files

**NEVER** create `index.ts` files that just re-export. Use direct imports.

```typescript
// BAD
import { usersTable } from '@/db'

// GOOD - Direct imports
import { usersTable } from '@/db/schema/users'
```

### 4. Validate Before Commit

**ALWAYS** run validations before committing:
```bash
pnpm typecheck && pnpm lint
```

---

## Common Commands

```bash
pnpm dev              # Development server
pnpm typecheck        # TypeScript checking
pnpm lint             # Linting
pnpm lint:fix         # Lint with auto-fix
pnpm db:migrate       # Run migrations
pnpm db:studio        # Database GUI
```

---

## Available Skills

| Skill | Description |
|-------|-------------|
| `/repository` | Repository pattern with ResultAsync |
| `/use-case` | Use case pattern with authorization |
| `/contracts` | Zod schema patterns |
| `/procedure` | Thin API handler pattern |
| `/form` | React Hook Form + shadcn/ui patterns |
| `/data-table` | DataTable compound component |

---

## Project Structure

```
src/
├── app/           → Next.js pages and API routes
├── core/          → Domain entities and use cases
├── infrastructure/→ Database, external services
└── presentation/  → React components
```
