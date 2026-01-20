# Slash Commands

> Atajos para tareas repetitivas que se ejecutan con `/`

---

## Dos tipos de Slash Commands

### Built-in (vienen con Claude Code)

| Comando | Descripcion |
|---------|-------------|
| `/help` | Muestra todos los comandos disponibles |
| `/clear` | Borra historial completamente (fresh start) |
| `/compact` | Comprime el contexto preservando lo importante |
| `/model` | Cambiar modelo (haiku/sonnet/opus) |
| `/config` | Configuracion de Claude Code |
| `/cost` | Uso de tokens y costos |

### Custom (los creas vos)

| Ubicacion | Scope | Uso |
|-----------|-------|-----|
| `.claude/commands/` | Proyecto | Workflows del equipo (commit a git) |
| `~/.claude/commands/` | Global | Shortcuts personales |

---

## Anatomia de un Comando Custom

**Archivo**: `.claude/commands/commit.md`

```markdown
---
description: Crear commit con conventional commits
allowed-tools: Bash(git:*), Read
argument-hint: [mensaje opcional]
---

## Estado actual
!`git status`
!`git diff --staged`

## Tarea
Analiza los cambios y crea un commit siguiendo conventional commits.
Si se provee mensaje: $ARGUMENTS
```

**Uso**: `/commit` o `/commit fix: auth validation bug`

---

## Frontmatter Disponible

| Opcion | Proposito | Ejemplo |
|--------|-----------|---------|
| `description` | Aparece en autocomplete | `"Crear git commit"` |
| `allowed-tools` | Herramientas permitidas | `Read, Grep, Bash(git:*)` |
| `argument-hint` | Muestra argumentos esperados | `[branch-name]` |
| `model` | Forzar modelo especifico | `claude-3-5-haiku-20241022` |

---

## Variables y Contenido Dinamico

### Argumentos

```markdown
$ARGUMENTS    # Todo lo que escribis despues del comando
$1, $2, $3    # Argumentos posicionales

# Ejemplo:
/deploy prod api
# $1 = "prod", $2 = "api", $ARGUMENTS = "prod api"
```

### Contenido embebido

```markdown
!`git status`     # Ejecuta bash y embebe el output
@package.json     # Embebe el contenido del archivo
```

---

## Organizacion con Namespaces

```
.claude/commands/
  git/
    commit.md      -> /git/commit
    pr.md          -> /git/pr
  test/
    unit.md        -> /test/unit
    e2e.md         -> /test/e2e
  review.md        -> /review
```

---

## Ejemplos Practicos

### /review - Code Review

```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
description: Code review comprehensivo
---

## Changes
!`git diff HEAD~1`

## Checklist
1. Code quality y readability
2. Security vulnerabilities
3. Performance issues
4. Test coverage

Organiza feedback por prioridad: Critical > High > Medium > Low
```

### /catchup - Retomar Trabajo

```markdown
---
description: Entender el estado actual del trabajo
---

!`git status`
!`git diff`

Resumir:
1. Que se esta trabajando
2. Que esta completo vs en progreso
3. Que falta hacer
```

---

## Best Practices

1. **Comandos enfocados**: Un comando = un job
2. **Nombres descriptivos**: `/review-security` mejor que `/rs`
3. **Restringir tools** para comandos sensibles (solo `Read, Grep` para audits)
4. **Commitear** `.claude/commands/` a git para compartir con el equipo
5. **Usar Haiku** para tareas simples/rapidas, **Opus** para complejas

---

## Quick Reference

```bash
# Built-in esenciales
/help        # Ver todos los comandos
/clear       # Fresh start
/compact     # Comprimir contexto

# Crear comando custom
mkdir -p .claude/commands
# crear .claude/commands/mi-comando.md

# Sintaxis del comando
---
description: "Que hace"
allowed-tools: Read, Edit, Bash(git:*)
argument-hint: [arg1] [arg2]
---
Contenido del prompt con !`bash` y @archivo
```

---

`/slide 6` -> Sub-agents
