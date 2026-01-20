# CLAUDE.md - La Constitucion

> Instrucciones permanentes para Claude que se cargan al inicio de cada sesion

---

## Que es?

Un archivo markdown que Claude lee **siempre** al inicio de cada sesion.

**Contiene:**
- Reglas del proyecto
- Convenciones de codigo
- Comandos frecuentes
- Arquitectura del proyecto
- Lo que NO debe hacer

---

## Jerarquia

| Ubicacion | Scope | Prioridad |
|-----------|-------|-----------|
| `~/.claude/CLAUDE.md` | Personal (todos tus proyectos) | Menor |
| `proyecto/CLAUDE.md` | Proyecto (root del repo) | Media |
| `proyecto/src/CLAUDE.md` | Subdirectorio (reglas especificas) | Mayor |

**Se combinan. El mas especifico tiene prioridad.**

---

## Ejemplo Real: Header

```markdown
# Claude Development Guidelines

**Project**: Mi App - Sistema de gestion
**Stack**: Next.js + TypeScript + Drizzle
**Architecture**: Clean Architecture + DDD
```

---

## Ejemplo Real: Reglas Esenciales

```markdown
## Essential Rules (ALWAYS Follow)

### 1. No Type Casting (`as`)
NEVER use `as` to cast types. Fix the actual type issue.

### 2. No Non-Null Assertions (`!`)
NEVER use `!`. Use nullish coalescing or guards.

### 3. Validate Before Commit
ALWAYS run: pnpm typecheck && pnpm lint
```

---

## Ejemplo Real: Comandos y Skills

```markdown
## Common Commands

pnpm dev              # Development server
pnpm typecheck        # TypeScript checking
pnpm lint             # Linting
pnpm db:migrate       # Run migrations

## Available Skills

/repository    -> Repository pattern with ResultAsync
/use-case      -> Use case pattern with authorization
/contracts     -> Zod schema patterns
/form          -> React Hook Form + shadcn/ui patterns
```

---

`/slide 3` -> Tools
