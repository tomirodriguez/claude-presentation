# Presentacion Claude Code - Guia del Presentador

**Duracion total**: 60-65 minutos
**Audiencia**: Desarrolladores
**Formato**: Discurso guiado con demos en vivo

---

## Setup Previo (Checklist)

### Terminal y ambiente

- [ ] Terminal con fuente grande (Cmd+Plus varias veces)
- [ ] Theme oscuro con buen contraste
- [ ] Split terminal si es posible (una para Claude, otra para output)

### Proyecto de demo

- [ ] Directorio `presentation/demo-files/` listo
- [ ] Prettier instalado (`npm install -D prettier`)
- [ ] Archivos de referencia accesibles

### Claude Code

- [ ] Sesion limpia (`/clear`)
- [ ] Verificar que funciona: `claude` en terminal
- [ ] MCP servers desconectados (para no confundir)
- [ ] Permisos reseteados para mostrar prompts

### Archivos a tener abiertos (tabs)

1. `presentation/references/claude-md-example.md`
2. `presentation/references/command-commit.md`
3. `presentation/references/skill-reviewer.md`
4. `presentation/references/hook-autoformat.json`
5. `presentation/demo-files/src/unformatted.ts`

---

## Slide 0: Introduccion - Claude Code es un AGENTE (2 min)

### Objetivo

Establecer qué es un agente de código.

### Ahora decir

> "Claude Code es un agente de código que corre en tu terminal."

- **Agente** = puede ejecutar acciones en tu sistema
- Lee tu codebase completo
- Edita archivos directamente
- Ejecuta comandos (git, npm, tests)
- Se auto-corrige cuando algo falla

> "Le das una tarea, y la completa. Vos supervisas, el ejecuta."

### Ahora mostrar

Qué puede hacer:

```
- Leer y entender todo tu proyecto
- Modificar archivos
- Correr comandos de terminal
- Planificar antes de actuar
- Iterar hasta que funcione
```

### Ahora decir (transicion)

> "Pero con todo este poder, necesitan controlarlo. Veamos como."

---

## Slide 1: Modos y Permisos (7 min)

### Objetivo

Ensenar a controlar el comportamiento de Claude Code.

### Ahora decir

> "Lo primero que necesitan saber es como controlar a Claude."

### Los 3 modos de permiso

Explicar cada modo:

```
MODO             COMPORTAMIENTO                    CUANDO USAR
----             --------------                    -----------
Normal (ask)     Pregunta antes de cada accion    Trabajo normal, control total
Accept Edits     Auto-aprueba edits de archivo    Cuando confias en los cambios
Plan Mode        Solo analiza, NO ejecuta nada    Investigacion, planificacion
```

### Ahora probar

1. Abrir Claude Code: `claude`
2. Presionar `Shift+Tab` y mostrar como cicla entre modos
3. Mostrar el indicador visual que cambia

### Ahora decir

> "El modo mas importante para empezar es Plan Mode. Si no estas seguro de que va a hacer, ponelo en Plan Mode y pedile que investigue primero."

### Permisos permanentes

> "Hay ciertas acciones que son seguras siempre - como leer archivos. Pueden configurar permisos permanentes."

### Ahora probar

1. Ejecutar `/permissions`
2. Mostrar las opciones disponibles
3. Explicar que `Read`, `Glob`, `Grep` son seguros de auto-aprobar

### Ahora mostrar

Ejemplo de permisos utiles:

```
PERMISO SEGURO                    PARA QUE
--------------                    --------
Read                              Leer cualquier archivo
Glob, Grep                        Buscar en el codebase
Bash(git status:*)                Comandos git read-only
Bash(ls:*)                        Listar directorios
```

### Extended Thinking

> "Un tip extra: si Claude parece confundido o el problema es complejo, activen Extended Thinking con Option+T (Mac) o Alt+T."

### Ahora decir (transicion)

> "Ahora que controlan a Claude, veamos como configurarlo permanentemente para su proyecto."

---

## Slide 2: CLAUDE.md - La Memoria del Proyecto (4 min)

### Objetivo

Entender CLAUDE.md como la "constitucion" del proyecto.

### Ahora decir

> "CLAUDE.md es la feature mas importante que tiene Claude Code. Es la memoria permanente del proyecto."

- Todo lo que pongan ahi, Claude lo sigue SIEMPRE
- Es su onboarding automatizado
- Cada sesion empieza con las mismas reglas

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/claude-md-example.md`

Destacar las secciones clave:

```markdown
# Quick Reference
- Stack, comandos, estructura

# Essential Rules (ALWAYS Follow)
- Las reglas que NUNCA debe violar
- Ejemplo: No Type Casting, No Non-Null Assertions

# Available Skills
- Tabla de skills disponibles
```

### Ahora decir

> "Miren esta seccion de reglas..."

```markdown
### 1. No Type Casting (`as`)
NUNCA usar `as`. Resolver el tipo correctamente.

### 2. No Non-Null Assertions (`!`)
NUNCA usar `!`. Usar `?.` y `??`.
```

> "Esto NO es una sugerencia. Claude va a seguir esto al pie de la letra. Si le piden que use `as`, se va a rehusar."

### Tip clave: Reglas anti-alucinacion

> "Agreguen esto a su CLAUDE.md para reducir alucinaciones:"

```markdown
## Comportamiento
- Si no estas seguro, pregunta antes de asumir
- Siempre verifica que los archivos existen antes de referenciarlos
- Cita lineas especificas cuando hagas afirmaciones
```

### Ahora decir (transicion)

> "Ahora veamos exactamente QUE herramientas tiene Claude para trabajar."

---

## Slide 3: Tools de Claude Code (3 min)

### Objetivo

Explicar las herramientas que tiene Claude Code.

### Ahora decir

> "Claude Code tiene TOOLS - herramientas que usa para interactuar con tu sistema."

- Cada acción que hace, la hace a través de un tool
- Son ~15 herramientas principales

### Ahora mostrar

Tabla de tools principales:

```
CATEGORIA        TOOLS                  QUE HACE
---------        -----                  --------
Archivos         Read, Write, Edit      Leer, crear, modificar archivos
Busqueda         Glob, Grep             Encontrar archivos y contenido
Ejecucion        Bash                   Ejecutar comandos de terminal
Gestion          TodoWrite              Trackear tareas en progreso
Interaccion      AskUserQuestion        Preguntar cuando tiene dudas
Navegacion       WebFetch, WebSearch    Buscar documentacion online
```

### Ahora decir

> "Cuando le piden 'agrega validación al login', Claude:"

1. Usa `Read` para leer el archivo
2. Usa `Edit` para modificarlo
3. Usa `Bash` para correr tests
4. Si falla, usa `Edit` de nuevo para corregir

> "Todo esto pidiendo permiso en cada paso - a menos que configuren lo contrario (como vimos en modos y permisos)."

### Ahora decir (transicion)

> "Ahora veamos los comandos que van a usar todos los dias para interactuar con Claude."

---

## Slide 4: Comandos Esenciales (5 min)

### Objetivo

Memorizar los comandos mas importantes.

### Ahora decir

> "Hay comandos que van a usar constantemente. Les muestro los esenciales."

### Ahora mostrar

Tabla de comandos criticos:

```
COMANDO      QUE HACE                          FRECUENCIA
-------      --------                          ----------
/clear       Limpia TODO el historial          MUY FRECUENTE
/compact     Comprime contexto, preserva key   Cuando bajo de contexto
/context     Ver que archivos tiene            Debugging
/model       Cambiar modelo                    Segun complejidad
/cost        Ver tokens y costo                Monitorear gasto
/help        Ver todos los comandos            Cuando no recordas algo
```

### Ahora probar

1. Ejecutar `/context` - mostrar que archivos conoce
2. Ejecutar `/model` - mostrar las opciones (haiku, sonnet, opus)
3. Ejecutar `/cost` - mostrar cuanto llevan gastado

### La decision mas importante: /clear vs /compact

> "Esta es probablemente la decision mas importante que van a tomar usando Claude Code..."

### Ahora decir

**Usar `/clear` cuando:**
- Empezas una tarea nueva no relacionada
- La conversacion se descarrilo
- Al empezar el dia
- Cambias de feature/modulo

**Usar `/compact` cuando:**
- Estas mid-task pero bajo de contexto
- Quieres preservar decisiones importantes
- Llegaste a un breakpoint natural

> "La regla general: ante la duda, usa /clear. Es mejor empezar fresco que arrastrar contexto contaminado."

### Ahora probar

Mostrar la diferencia:

```bash
# Compact con foco especifico
/compact Preservar las decisiones de arquitectura de auth
```

### Ahora decir (transicion)

> "Ahora que saben los comandos basicos, veamos como crear sus propios comandos."

---

## Slide 5: Slash Commands (5 min)

### Objetivo

Crear comandos personalizados para tareas repetitivas.

### Ahora decir

> "Los slash commands son atajos que ustedes definen para tareas que hacen frecuentemente."

- Se invocan con `/nombre`
- Son archivos markdown en `.claude/commands/`
- Pueden tener contenido dinamico

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/command-commit.md`

Explicar las partes:

```markdown
---
description: Crear commit con conventional commits
allowed-tools: Bash, Read, Glob, Grep
---

Analiza los cambios y crea un commit siguiendo conventional commits.

## Pasos
1. Ejecutar `git status` para ver el estado
2. Ejecutar `git diff --staged` para ver cambios staged
...
```

### Ahora decir

> "El frontmatter es clave..."

```yaml
---
description: Lo que aparece en /help
allowed-tools: Limita que tools puede usar
argument-hint: Muestra que argumentos espera
---
```

### Contenido dinamico

> "Pueden insertar contenido dinamico:"

```
!`comando`     → Ejecuta bash e inserta output
@archivo       → Inserta contenido de archivo
$ARGUMENTS     → Lo que el usuario escribe despues del comando
```

### Ahora probar (si hay tiempo)

```bash
# En Claude Code
/commit arreglar bug de autenticacion
```

Mostrar como analiza los cambios y crea el commit.

### Ahora decir (transicion)

> "Los commands los invocan ustedes. Pero que pasa si quieren que Claude use algo automaticamente?"

---

## Slide 6: Skills (5 min)

### Objetivo

Entender skills como expertise que Claude aplica automaticamente.

### Ahora decir

> "Los skills son diferentes a los commands. Claude decide SOLO cuando usarlos."

### Diferencia clave

```
SLASH COMMANDS              SKILLS
--------------              ------
Ustedes invocan (/commit)   Claude invoca automaticamente
Un archivo .md              Directorio con SKILL.md + recursos
Atajos explicitos           Expertise aplicada por contexto
```

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/skill-reviewer.md`

Explicar la estructura:

```markdown
---
description: >-
  Activar cuando el usuario pide revisar codigo, hacer code review,
  analizar calidad de codigo, revisar PR, o buscar problemas.
---

# Code Review Skill

Cuando hagas code review:
### 1. Obtener los cambios
### 2. Analizar por categorias
### 3. Formato de output
```

### El campo description es CRITICO

> "La descripcion es como Claude decide si usar el skill o no."

```yaml
# MAL - muy vago
description: Helps with code

# BIEN - especifico
description: >-
  Activar cuando el usuario pide revisar codigo, hacer code review,
  analizar calidad de codigo, revisar PR, o buscar problemas.
```

### Ahora probar (opcional)

```bash
# En Claude Code
"Podes revisar los cambios que hice?"
```

Mostrar como Claude activa automaticamente el skill de code review.

### Ahora decir (transicion)

> "Los skills son expertise. Pero que pasa si necesitan que otra instancia de Claude investigue algo? Para eso estan los sub-agents."

---

## Slide 7: Sub-agents (5 min)

### Objetivo

Entender sub-agents como asistentes especializados.

### Ahora decir

> "Los sub-agents son como asistentes especializados que corren en su propio contexto."

### Por que usar sub-agents

- **Contexto separado**: No contamina la conversacion principal
- **Restriccion de herramientas**: Pueden ser read-only
- **Modelos diferentes**: Haiku para tareas simples = ahorro
- **Especializacion**: Prompts enfocados en una tarea

### Sub-agents built-in

```
AGENT         MODELO    PROPOSITO
-----         ------    ---------
Explore       Haiku     Busqueda rapida en codebase
Plan          Hereda    Investigacion para planificacion
General       Sonnet    Tareas complejas multi-paso
```

### Ahora decir

> "La regla de oro: sub-agents son investigadores, no implementadores."

- Usar para: analisis, review, exploracion
- Implementar en: conversacion principal

### Crear sub-agents custom

> "Pueden crear sus propios sub-agents:"

```markdown
# .claude/agents/spec-agent.md
---
description: Investigar codebase para specs
model: sonnet
tools: Glob, Grep, Read
---

Investigar el codebase para obtener informacion
antes de escribir specs de features.
```

### Seleccion de modelo

```
MODELO    USAR PARA                          COSTO
------    ---------                          -----
Haiku     Tareas simples, alta frecuencia    $
Sonnet    Trabajo diario, balance            $$
Opus      Analisis complejo, arquitectura    $$$
```

### Ahora decir (transicion)

> "Hasta ahora vimos features que sugieren comportamiento. Pero que pasa si quieren GARANTIZAR algo? Para eso estan los hooks."

---

## Slide 8: Hooks (7 min)

### Objetivo

Entender hooks como garantias de comportamiento.

### Ahora decir

> "Esta es probablemente la feature mas poderosa de Claude Code."

### La diferencia fundamental

> "Prompts SUGIEREN, Hooks GARANTIZAN"

- Un prompt dice "formatea el codigo despues de editar"
- Claude puede olvidarse, o decidir no hacerlo
- Un hook EJECUTA prettier automaticamente despues de cada edit
- No hay forma de que Claude lo evite

### Eventos disponibles

```
EVENTO              CUANDO                          USA MATCHERS?
------              ------                          -------------
PreToolUse          Antes de ejecutar herramienta   Si
PostToolUse         Despues de ejecutar             Si
Stop                Claude termina de responder     No
PermissionRequest   Al pedir permiso                Si
```

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/hook-autoformat.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": {
          "tool": "Edit|Write",
          "input": {
            "file_path": ".*\\.(ts|tsx|js|jsx)$"
          }
        },
        "command": "prettier --write \"$FILE_PATH\""
      }
    ]
  }
}
```

### Ahora decir

> "Analicemos esto..."

- `PostToolUse`: Se ejecuta DESPUES de que Claude usa un tool
- `matcher.tool`: Se activa con Edit O Write
- `matcher.input.file_path`: Solo archivos JS/TS
- `command`: Ejecuta prettier en el archivo modificado

### Ahora probar

**Demo en vivo del hook de auto-format:**

1. Mostrar archivo mal formateado: `presentation/demo-files/src/unformatted.ts`
2. Pedirle a Claude que edite algo menor en el archivo
3. Ver como prettier se ejecuta automaticamente despues del edit

> "Miren como el archivo se formateo solo. Claude no tuvo que pensarlo, el hook lo hizo automaticamente."

### Exit codes

```
CODIGO    SIGNIFICADO         EFECTO
------    -----------         ------
0         Exito               Continua normalmente
2         Error bloqueante    BLOQUEA la accion
Otro      Warning             Continua con advertencia
```

### Caso de uso avanzado: Bloquear edits a archivos inexistentes

```json
{
  "PreToolUse": [
    {
      "matcher": { "tool": "Edit" },
      "command": "test -f \"$FILE_PATH\" || exit 2"
    }
  ]
}
```

> "Si Claude intenta editar un archivo que no existe, el hook lo bloquea con exit code 2."

### Ahora decir (transicion)

> "Los hooks son garantias locales. Pero que pasa si quieren conectar Claude a servicios externos?"

---

## Slide 9: MCP Servers (2 min)

### Objetivo

Introducir MCP como forma de conectar herramientas externas.

### Ahora decir

> "MCP, Model Context Protocol, es como conectar Claude a servicios externos."

- Es un protocolo abierto de Anthropic
- Permite agregar tools custom
- Hay servidores para muchas cosas

### Servidores populares

```
SERVIDOR      PARA QUE
--------      --------
PostgreSQL    Queries a base de datos
GitHub        PRs, issues, repos
Filesystem    Operaciones de archivos
Memory        Memoria persistente
Slack         Mensajeria
```

### Como agregar

```bash
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres

# Ver servidores conectados
/mcp
```

### Ahora decir

> "No vamos a profundizar en MCP hoy, pero sepan que existe y es muy poderoso para integraciones."

### Ahora decir (transicion)

> "Ahora viene algo critico. Todo esto es muy poderoso, pero hay un problema: las alucinaciones."

---

## Slide 10: Alucinaciones y Manejo de Contexto (5 min)

### Objetivo

Entender y prevenir alucinaciones.

### Ahora decir

> "Este es probablemente el tema mas importante de toda la charla."

### El dato que importa

> "Cuando se permite a Claude admitir incertidumbre en lugar de forzar respuestas, las alucinaciones se reducen en un 76%"

### Que son las alucinaciones

Claude "alucina" cuando:
- Inventa archivos que no existen
- Describe funciones incorrectamente
- Mezcla comportamientos de diferentes partes del codigo
- Afirma cosas con confianza que son falsas

### Causas principales

```
CAUSA                      PROBLEMA
-----                      --------
Contexto excesivo          Demasiada info → confusion
Contexto insuficiente      Falta de info → suposiciones
Sesiones muy largas        Datos obsoletos, contaminacion
Instrucciones ambiguas     Multiples interpretaciones
```

### La regla de oro

> "Sesiones cortas y enfocadas son MUCHO mejores que sesiones largas."

- Contexto limpio = menos confusion
- Sin "bagaje" de conversaciones anteriores
- Cada tarea empieza sin suposiciones incorrectas

### Metricas de contexto saludable

```
INDICADOR            SALUDABLE     PROBLEMATICO
---------            ---------     ------------
Mensajes en sesion   < 20          > 50
Archivos en contexto 5-15          > 30
Tareas por sesion    1-2           > 5 no relacionadas
```

### Senales de alerta

> "Estas son senales de que Claude puede estar alucinando:"

- Menciona archivos que no existen
- Describe funciones incorrectamente
- Contradicciones con mensajes anteriores
- Confianza excesiva en detalles muy especificos

### Que hacer

1. **Verificar**: "Podes mostrarme donde esta eso?"
2. **Limpiar**: `/clear` si hay mucha confusion
3. **Ser especifico**: Dar mas contexto relevante
4. **Dividir**: Tareas mas pequenas = menos confusion

### Tecnica Document & Clear

> "Para tareas largas que requieren multiples sesiones:"

```
1. Antes de limpiar:
   "Documenta el progreso actual en progress.md"

2. Ejecutar /clear

3. Nueva sesion:
   "Lee progress.md y continua donde quedamos"
```

### Ahora decir (transicion)

> "Ahora que entienden el problema, veamos las mejores practicas para usar Claude Code efectivamente."

---

## Slide 11: Best Practices (5 min)

### Objetivo

Tips concretos para el dia a dia.

### Ahora decir

> "Les dejo las mejores practicas que van a hacer la diferencia."

### 1. Workflow Explore-Plan-Code-Commit

```
1. Explorar   → Entender el codebase (subagent Explore)
2. Planificar → Claude crea plan detallado (Plan Mode)
3. Codear     → Ejecutar plan paso a paso
4. Commit     → Commits atomicos
```

### 2. Seleccion de modelo

```
TAREA                              MODELO
-----                              ------
Tareas simples, rapidas            Haiku
Trabajo diario                     Sonnet
Decisiones complejas, arquitectura Opus
```

### 3. Tratar a Claude como un junior dev muy trabajador

- Dar instrucciones claras
- Revisar su trabajo
- Guiar cuando se desvia
- No esperar perfeccion a la primera

### 4. Especificidad en prompts

```
# MAL
"Mejora este codigo"

# BIEN
"En src/auth/login.ts, mejora el manejo de errores:
- Agregar try/catch alrededor de la llamada a API
- Retornar mensajes de error especificos
- Loggear errores al servicio de monitoreo"
```

### 5. Cosas a evitar

- Instrucciones vagas ("mejoralo")
- CLAUDE.md demasiado largo (max 100-200 lineas)
- No usar /clear entre tareas
- Sesiones de mas de 1-2 horas sin limpiar
- Mezclar tareas no relacionadas

### Ahora decir (transicion)

> "Para cerrar, les quiero mostrar como se ve todo esto junto en un setup avanzado."

---

## Slide 12: Ralph Demo - Setup Avanzado (8-10 min)

### Objetivo

Mostrar un ejemplo real de orquestacion avanzada.

### Ahora decir

> "Ralph es un ejemplo de como se pueden combinar todas estas features para desarrollo autonomo."

### Concepto de Ralph

```
PRD (documento de requisitos)
    ↓
Spec Agent → Analiza y descompone
    ↓
Architect Agent → Disena solucion
    ↓
Implementer → Escribe codigo (con hooks de validacion)
    ↓
Reviewer → Valida calidad
```

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/ralph-setup/ralph-skill.md`

Destacar:

```markdown
## Workflow

### 1. Spec Phase
1. Leer el PRD/Epic correspondiente
2. Invocar `/spec-write` para generar user stories
3. Validar acceptance criteria

### 2. Implementation Phase
Por cada archivo:
1. Leer el archivo actual completo
2. Implementar cambios incrementalmente
3. Correr validaciones despues de cada cambio
```

### Ahora mostrar ejemplo de

**Abrir**: `presentation/references/ralph-setup/hooks-ralph.json`

```json
{
  "PostToolUse": [
    {
      "matcher": { "tool": "Edit|Write" },
      "command": "pnpm typecheck --noEmit 2>&1 | head -20"
    }
  ],
  "Stop": [
    {
      "matcher": {},
      "command": "pnpm typecheck && pnpm lint"
    }
  ]
}
```

> "Miren estos hooks..."
> - Despues de cada edit: corre typecheck
> - Cuando Claude termina: validacion final completa
> - Si falla, Claude tiene que corregir antes de declarar "done"

### Mensaje clave

> "Esto es el nivel avanzado. Primero dominen los fundamentos - CLAUDE.md, hooks basicos, skills simples - antes de saltar a orquestacion multi-agente."

### Ahora decir (cierre)

> "Para resumir lo que vimos hoy..."

---

## Cierre y Resumen (2 min)

### Puntos clave

1. **Claude Code es un AGENTE** - ejecuta, no solo sugiere
2. **Ustedes controlan** con modos y permisos
3. **CLAUDE.md** es la memoria permanente del proyecto
4. **Tiene TOOLS** - Read, Write, Edit, Bash, etc.
5. **Hooks garantizan** comportamiento (prompts solo sugieren)
6. **Sesiones frescas** > sesiones largas (evitar alucinaciones)

### Recursos

- Documentacion oficial: https://docs.anthropic.com/en/docs/claude-code
- Este repositorio tiene guias detalladas de cada tema

### Preguntas frecuentes (tener preparadas)

**Costos**: `/cost` para monitorear, haiku para ahorrar
**Seguridad**: permisos, hooks de bloqueo, Plan Mode
**Trabajo en equipo**: CLAUDE.md y commands en git (compartido)
**IDE integration**: Se puede usar con cualquier IDE, es independiente

---

## Timing Final

| Slide | Tema | Tiempo | Acumulado |
|-------|------|--------|-----------|
| 0 | Intro - Agente | 2 min | 2 min |
| 1 | Modos y Permisos | 7 min | 9 min |
| 2 | CLAUDE.md | 4 min | 13 min |
| 3 | Tools | 3 min | 16 min |
| 4 | Comandos | 5 min | 21 min |
| 5 | Slash Commands | 5 min | 26 min |
| 6 | Skills | 5 min | 31 min |
| 7 | Sub-agents | 5 min | 36 min |
| 8 | Hooks | 7 min | 43 min |
| 9 | MCP | 2 min | 45 min |
| 10 | Alucinaciones | 5 min | 50 min |
| 11 | Best Practices | 5 min | 55 min |
| 12 | Ralph Demo | 8 min | 63 min |
| - | Cierre | 2 min | 65 min |

---

## Si se quedan cortos de tiempo

**Prioridad Alta** (no saltear):
- Slide 0, 1, 2 (intro, control, CLAUDE.md)
- Slide 10 (alucinaciones)

**Prioridad Media** (resumir si falta tiempo):
- Slide 3, 4 (tools, comandos)
- Slide 5, 6, 7 (commands, skills, agents)
- Slide 8 (hooks - al menos mostrar el concepto)

**Prioridad Baja** (saltar si es necesario):
- Slide 9 (MCP - solo mencionar que existe)
- Slide 12 (Ralph - resumir en 2 min)

---

*Ultima actualizacion: Enero 2026*
