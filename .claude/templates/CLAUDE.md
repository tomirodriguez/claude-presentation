# Claude Development Guidelines

**Project**: {PROJECT_NAME} - {PROJECT_DESCRIPTION}

---

## Quick Reference

**Stack**: {STACK_DESCRIPTION}
**Deploy**: {DEPLOYMENT_TARGET}
**Architecture**: Clean Architecture + DDD
**UI**: {UI_FRAMEWORK}

**Central Documentation**: See `{CLAUDE_DOCS_PATH}` for detailed patterns and guides.

---

## Communication & Language

**Communication with developers**: {PREFERRED_LANGUAGE}
**Code and documentation**: Always in English (code comments, commit messages, function names)
**User-facing text**: {USER_LANGUAGE} (validation messages, UI labels)

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

### 5. OrganizationContext for Multi-Tenancy

If using multi-tenancy, **ALL** tenant-scoped operations MUST receive `OrganizationContext`.

```typescript
// Repository method with context
findById(id: string, context: OrganizationContext) {
  return this.db.select()
    .from(table)
    .where(
      and(
        eq(table.id, id),
        eq(table.organizationId, context.organizationId) // CRITICAL
      )
    )
}
```

---

## Project Structure

```
{PROJECT_STRUCTURE}
```

### Data Flow

```
{DATA_FLOW_DIAGRAM}
```

---

## Available Skills

The following skills are available from the central documentation:

| Skill | Description |
|-------|-------------|
| `/repository` | Repository pattern with ResultAsync |
| `/use-case` | Use case pattern with authorization |
| `/contracts` | Zod schema patterns (3-layer) |
| `/procedure` | Thin API handler pattern |
| `/port` | Repository interface definitions |
| `/domain-entity` | Domain entities with validation |
| `/authorization` | RBAC permission checks |
| `/mutation-errors` | TanStack Query error handling |
| `/data-table` | DataTable compound component |
| `/date-management` | Date handling across the stack |
| `/form` | React Hook Form + shadcn/ui patterns |
| `/test-runner` | Validation workflow |
| `/skill-creator` | How to create new skills |

---

## Common Commands

### Development

```bash
pnpm dev              # Development server
pnpm typecheck        # TypeScript checking
pnpm lint             # Linting
pnpm lint:fix         # Lint with auto-fix
```

### Build & Deploy

```bash
pnpm build            # Production build
pnpm deploy           # Deploy (if configured)
```

### Database (if applicable)

```bash
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate migrations
pnpm db:studio        # Database GUI
```

---

## Implementation Checklist

When implementing a new feature:

- [ ] **Define contracts** - Zod schemas for input/output
- [ ] **Create entities** (if new domain model)
- [ ] **Define port** - Repository interface
- [ ] **Implement use case** - Business logic
- [ ] **Implement repository** - Database access
- [ ] **Create procedure/route** - API endpoint
- [ ] **Add authorization** - Permission checks
- [ ] **Multi-tenancy check** - Filter by organizationId
- [ ] **Create UI** - Frontend components
- [ ] **Run validations** - typecheck, lint, tests

---

## Project-Specific Rules

{PROJECT_SPECIFIC_RULES}

---

## References

- Central Documentation: `{CLAUDE_DOCS_PATH}`
- Architecture Guide: `{CLAUDE_DOCS_PATH}/docs/architecture/clean-architecture.md`
- Error Handling: `{CLAUDE_DOCS_PATH}/docs/patterns/error-handling.md`
- Authorization: `{CLAUDE_DOCS_PATH}/docs/patterns/authorization-rbac.md`
- Multi-Tenancy: `{CLAUDE_DOCS_PATH}/docs/patterns/multi-tenancy.md`

---

**Last updated**: {DATE}
**Maintainer**: {MAINTAINER}
