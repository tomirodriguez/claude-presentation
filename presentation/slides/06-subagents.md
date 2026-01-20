# Slide 6: Sub-agents

## Agentes especializados con contexto aislado

---

## El Concepto

Los sub-agents son **asistentes AI especializados** que corren en su propio contexto, separado de la conversacion principal.

```
Claude principal
     |
     |-- Sub-agent "Explore"    (contexto aislado)
     |        '-- Investiga, reporta, termina
     |
     |-- Sub-agent "Plan"       (contexto aislado)
     |        '-- Diseña, planifica, reporta
     |
     '-- Claude continua con el reporte
```

**Beneficio clave:** El sub-agent no contamina el contexto principal.

---

## Task: El Mecanismo de Delegacion

**Task es la herramienta interna que Claude usa para invocar sub-agents.**

```
Usuario: "Investiga donde esta la autenticacion"
                    ↓
Claude decide: "Esto es exploracion"
                    ↓
         Invoca Task(Explore)
                    ↓
    Explore corre en contexto aislado
                    ↓
         Reporta resultado a Claude
                    ↓
      Claude continua con la info
```

### Task aplica a TODOS los sub-agents

| Tipo | Como se invoca |
|------|----------------|
| Built-in | `Task(Explore)`, `Task(Plan)`, `Task(general-purpose)` |
| Custom | `Task(code-reviewer)`, `Task(security-auditor)` |

**No hay diferencia en el mecanismo** — Task es siempre el que los ejecuta.

---

## Por que usar Sub-agents?

| Beneficio | Descripcion |
|-----------|-------------|
| **Preservar contexto** | La exploracion no "ensucia" tu conversacion principal |
| **Restringir herramientas** | Dar acceso read-only a reviewers, por ejemplo |
| **Controlar costos** | Usar Haiku para tareas simples y frecuentes |
| **Especializar comportamiento** | System prompts enfocados en un dominio |

---

## Sub-agents Built-in

### 1. Explore Agent
- **Proposito:** Buscar archivos, codigo y entender el codebase
- **Tools:** `Read`, `Glob`, `Grep`
- **Ejemplo:** "Donde esta implementada la autenticacion?"

### 2. Plan Agent
- **Proposito:** Investigar antes de proponer un plan (en plan mode)
- **Tools:** `Read`, `Glob`, `Grep` + herramientas de exploracion
- **Ejemplo:** "Planifica como agregar dark mode"

### 3. General-Purpose Agent
- **Proposito:** Tareas complejas que requieren exploracion Y accion
- **Tools:** Todas las herramientas estandar
- **Ejemplo:** "Investiga por que falla el test de login"

---

## Regla de Oro

> **Sub-agents son INVESTIGADORES, no IMPLEMENTADORES**

| Usar para | NO usar para |
|-----------|--------------|
| Buscar informacion | Escribir codigo |
| Analizar codigo existente | Hacer cambios |
| Planificar approach | Ejecutar comandos |
| Code review | Commitear |

**Por que?** El sub-agent no tiene el contexto completo de tu conversacion. Que investigue, y vos implementas con toda la info.

---

## Seleccion de Modelo

| Modelo | Velocidad | Costo | Usar para |
|--------|-----------|-------|-----------|
| `haiku` | Rapido | Bajo | Busquedas simples, tareas repetitivas |
| `sonnet` | Balanceado | Medio | **Default** - la mayoria de tareas |
| `opus` | Lento | Alto | Razonamiento complejo, auditorias profundas |

**Estrategia de costos:**
1. Haiku para exploracion inicial
2. Sonnet para implementacion
3. Opus para verificacion final

---

## Custom Sub-agents

### Ubicacion
```
~/.claude/agents/     # Disponible en TODOS tus proyectos
.claude/agents/       # Solo para este proyecto (compartir con equipo)
```

### Crear uno nuevo
```bash
/agents   # Wizard interactivo
```

### Estructura basica

```markdown
---
name: code-reviewer
description: Revisa codigo para calidad y seguridad
tools:
  - Read
  - Glob
  - Grep
model: sonnet
---

# System Prompt

Sos un reviewer experto. Al revisar codigo:

1. Buscar vulnerabilidades de seguridad
2. Evaluar calidad y mantenibilidad
3. Verificar manejo de errores

Output:
- **Critico:** Bloquea merge
- **Sugerencias:** Mejoras opcionales
- **Positivo:** Que se hizo bien
```

---

## Tool Presets Comunes

| Tipo de Agent | Tools |
|---------------|-------|
| **Read-only** (reviewers, auditores) | `Read`, `Glob`, `Grep` |
| **Research** (analistas) | + `WebFetch`, `WebSearch` |
| **Writers** (docs, tests) | + `Write`, `Edit` |
| **Full access** | Omitir `tools` = todas |

---

## Dar Skills a Sub-agents

> **Importante:** Los sub-agents **NO heredan skills** automaticamente.

Para dar acceso a skills, usar el campo `skills`:

```markdown
---
name: security-auditor
description: Auditor de seguridad especializado
tools:
  - Read
  - Glob
  - Grep
model: sonnet
skills: vulnerability-scanner, owasp-guidelines, dependency-checker
---

Sos un auditor de seguridad. Usa tus skills para...
```

**Limitacion clave:** Los agents built-in (`Explore`, `Plan`, `general-purpose`) **NO pueden usar skills**. Solo los custom agents con campo `skills` explicito.

---

## Pitfalls Comunes

### Claude no usa tus sub-agents?
Agrega un recordatorio en `CLAUDE.md`:
```markdown
## Specialists disponibles
- `code-reviewer`: Para revisar cambios
- `security-auditor`: Para analisis de seguridad
```

### El sub-agent ignora instrucciones?
- Se mas especifico en el system prompt
- Agrega instrucciones "NO hagas X"
- Define formato de output esperado

### Gatekeeping: Agent que "roba" trabajo

**Problema:** Creas `PythonTests` agent y ahora Claude lo usa para TODO lo relacionado a tests, incluso cuando no es necesario.

```
Usuario: "Fijate si hay tests para auth"
Claude: Task(PythonTests)  ← Overkill, solo querias saber si existen
```

**Solucion:** Preferir los built-in flexibles (`Explore`, `general-purpose`) para tareas genericas. Reservar custom agents para tareas muy especificas.

### Deshabilitar un agent molesto

```json
// settings.json
{
  "permissions": {
    "deny": ["Task(mi-agent-molesto)"]
  }
}
```

---

## Foreground vs Background

| Modo | Comportamiento | Permisos |
|------|----------------|----------|
| **Foreground** (default) | Bloqueante, espera resultado | Puede pedir permisos interactivos |
| **Background** | Corre en paralelo | Auto-deniega permisos no aprobados |

**Activar background:**
- Decir "run this in the background"
- Presionar `Ctrl+B`

> **Nota:** Los sub-agents NO pueden spawnar otros sub-agents (previene nidacion infinita).

---

## Quick Reference

```
UBICACIONES:
  ~/.claude/agents/    (global)
  .claude/agents/      (proyecto)

CREAR: /agents

MODELOS: haiku | sonnet | opus

BUILT-IN (invocados via Task):
  Task(Explore)  -> buscar codigo
  Task(Plan)     -> planificar features
  Task(general-purpose) -> tareas complejas

CUSTOM (tambien via Task):
  Task(mi-agent) -> tu agent personalizado

DAR SKILLS A AGENTS:
  skills: skill-a, skill-b   (solo custom agents)

DESHABILITAR:
  "deny": ["Task(agent-name)"]

REGLA #1: Investigar, no implementar
```

---

`/slide 7` -> Skills
