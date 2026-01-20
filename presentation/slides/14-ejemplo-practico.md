# Ejemplo Practico

> Construyendo nuestro propio framework de desarrollo

---

## El Objetivo

Crear un mini-framework que:

1. **Valide automaticamente** cada cambio (hooks)
2. **Tenga comandos** para tareas comunes (commands)
3. **Use conocimiento especializado** (skills)
4. **Investigue de forma aislada** (sub-agents)

**La estructura:**
```
.claude/
├── CLAUDE.md           # Reglas del proyecto
├── settings.json       # Hooks de validacion
├── commands/
│   ├── implement.md    # Implementar feature
│   └── review.md       # Code review
├── skills/
│   └── feature-dev/
│       └── SKILL.md    # Guia de desarrollo
└── agents/
    └── researcher.md   # Investigador aislado
```

---

## Paso 1: CLAUDE.md

```markdown
# Proyecto Demo

## Stack
- Next.js 14 con App Router
- TypeScript strict
- Drizzle ORM + PostgreSQL
- Tailwind + shadcn/ui

## Reglas Criticas
1. NO usar `as` para castear tipos
2. NO usar `!` (non-null assertion)
3. Validar con zod antes de usar datos externos
4. Imports directos, no barrel files

## Antes de Commit
pnpm typecheck && pnpm lint && pnpm test
```

**Proposito:** Establecer contexto y reglas que Claude siempre seguira.

---

## Paso 2: Hooks de Validacion

**`.claude/settings.json`**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{
          "type": "command",
          "command": "pnpm typecheck 2>&1 | head -20"
        }]
      }
    ],
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "pnpm typecheck && pnpm lint"
        }]
      }
    ]
  }
}
```

**PostToolUse:** Valida tipos despues de cada edicion.
**Stop:** No permite terminar si hay errores.

---

## Paso 3: Command /implement

**`.claude/commands/implement.md`**
```markdown
# Implement Feature

Implementa el feature descrito en $ARGUMENTS.

## Proceso

1. **Analizar** el feature requerido
2. **Planificar** los archivos a crear/modificar
3. **Implementar** siguiendo patrones del proyecto
4. **Validar** con typecheck y lint
5. **Testear** si aplica

## Criterio de Exito

- Codigo compila sin errores
- Lint pasa sin warnings
- Tests pasan (si existen)

Cuando termines exitosamente, indica:
<promise>FEATURE_IMPLEMENTED</promise>
```

**Uso:** `/implement agregar filtro de busqueda en lista de usuarios`

---

## Paso 4: Skill de Desarrollo

**`.claude/skills/feature-dev/SKILL.md`**
```markdown
# Feature Development Guide

## Cuando se Activa
- Usuario pide implementar un feature
- Usuario usa /implement

## Patron de Archivos

### API Endpoint
src/app/api/[recurso]/route.ts

### Componentes
src/components/[feature]/[Componente].tsx

### Hooks
src/hooks/use[Feature].ts

## Checklist Pre-Commit
- [ ] Types correctos (no any, no as)
- [ ] Error handling en APIs
- [ ] Loading states en UI
- [ ] pnpm typecheck pasa
- [ ] pnpm lint pasa
```

**Proposito:** Conocimiento especializado que guia la implementacion.

---

## Paso 5: Sub-Agent Investigador

**`.claude/agents/researcher.md`**
```markdown
# Researcher Agent

Investiga el codebase para responder preguntas especificas.

## Capacidades
- Glob: buscar archivos por patron
- Grep: buscar contenido
- Read: leer archivos

## NO puede
- Modificar archivos
- Ejecutar comandos

## Output esperado
Resumen conciso con:
- Archivos relevantes encontrados
- Patrones identificados
- Recomendaciones
```

**Uso desde CLAUDE.md:**
```markdown
## Investigacion
Antes de implementar features complejos, usa el
researcher agent para entender patrones existentes.
```

---

## El Flujo Completo

```
Usuario: /implement sistema de notificaciones
                    |
                    v
         Lee CLAUDE.md (reglas)
                    |
                    v
         Activa skill feature-dev
                    |
                    v
    Lanza researcher agent (patrones)
                    |
                    v
         Implementa codigo
                    |
        PostToolUse hook (typecheck)
                    |
           Error? -> Corrige -> Repite
                    |
                    v
         Intenta terminar
                    |
          Stop hook (typecheck + lint)
                    |
           Error? -> Corrige -> Repite
                    |
                    v
    <promise>FEATURE_IMPLEMENTED</promise>
```

---

## Hook Avanzado: Forzar Continuidad

Para comportamiento tipo Ralph, agregamos al Stop hook:

```bash
#!/bin/bash
# .claude/hooks/check-promise.sh

# Buscar promise en el ultimo mensaje
if grep -q "<promise>.*</promise>" /dev/stdin; then
  exit 0  # Permitir salir
else
  echo '{"decision":"block","reason":"No completion promise found"}'
  exit 2  # Forzar continuidad
fi
```

```json
{
  "hooks": {
    "Stop": [{
      "type": "command",
      "command": ".claude/hooks/check-promise.sh"
    }]
  }
}
```

---

## Ejemplo: Implementando un Feature

```
> /implement filtro de busqueda en tabla de usuarios

Claude:
1. Leo CLAUDE.md -> Next.js, TypeScript strict, Drizzle
2. Skill feature-dev activado -> patron de archivos
3. Lanzo researcher -> encuentro UserTable existente
4. Implemento:
   - src/components/users/UserSearchFilter.tsx
   - src/hooks/useUserSearch.ts
   - Modifico UserTable para integrar filtro

[PostToolUse hook corre typecheck]
Error: Type 'string | undefined' not assignable...

5. Corrijo el tipo, uso nullish coalescing
6. Typecheck pasa

[Intento terminar]
[Stop hook corre typecheck + lint]
Todo pasa.

<promise>FEATURE_IMPLEMENTED</promise>
```

---

## Recapitulando

| Componente | Funcion |
|------------|---------|
| **CLAUDE.md** | Contexto y reglas siempre presentes |
| **PostToolUse hook** | Validacion inmediata de cada cambio |
| **Stop hook** | Gate final antes de terminar |
| **Command** | Workflow estructurado para tareas |
| **Skill** | Conocimiento especializado |
| **Sub-agent** | Investigacion aislada |

**La combinacion** de estos elementos crea un agente que:
- Sigue reglas consistentemente
- Se auto-corrige en cada paso
- No puede terminar con errores
- Tiene conocimiento del dominio

---

## Para Llevarse

1. **Empeza simple** - CLAUDE.md + un hook de typecheck
2. **Itera** - Agrega comandos cuando veas patrones repetidos
3. **Especializa** - Skills para dominios especificos
4. **Aisla** - Sub-agents para investigacion pesada

**El framework crece con tu proyecto.**

---

`/slide 0` -> Intro
