# Ralph TUI - Guia Completa para Humanos

## Que es Ralph TUI?

Ralph TUI es un **orquestador de loops de agentes de IA** - una herramienta de terminal que conecta asistentes de codigo IA (Claude Code, OpenCode, Factory Droid) a sistemas de seguimiento de tareas y los ejecuta autonomamente hasta completar todas las tareas.

### El Ciclo Autonomo (5 etapas)

```
1. Seleccionar Tarea  ->  2. Construir Prompt  ->  3. Ejecutar Agente
                                    ^                        |
                                    |                        v
                          5. Siguiente Tarea  <-  4. Detectar Completado
```

---

## Instalacion Rapida

### Requisitos
- **Bun Runtime** >= 1.0.0 (obligatorio)
- Al menos un agente de IA instalado:
  - Claude Code: `npm install -g @anthropic-ai/claude-code`
  - OpenCode: `curl -fsSL https://opencode.ai/install | bash`

### Instalar Ralph TUI

```bash
# Recomendado
bun install -g ralph-tui

# Alternativas
npm install -g ralph-tui
pnpm add -g ralph-tui
```

### Configuracion Inicial

```bash
cd tu-proyecto
ralph-tui setup
```

Esto:
1. Detecta agentes instalados
2. Crea `.ralph-tui/config.toml`
3. Instala skills en `~/.claude/skills/`

---

## Estructura del prd.json

El `prd.json` es el corazon de Ralph TUI - define las tareas que el agente ejecutara autonomamente.

### Campos Requeridos vs Opcionales

#### Nivel Raiz

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `name` | string | **Si** | Nombre del proyecto/feature |
| `userStories` | array | **Si** | Array de tareas |
| `description` | string | No | Descripcion extendida |
| `branchName` | string | No | Rama Git asociada |
| `metadata` | object | No | Datos adicionales personalizados |

#### User Stories (Tareas)

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `id` | string | **Si** | ID unico (ej: "US-001") |
| `title` | string | **Si** | Titulo breve |
| `passes` | boolean | **Si** | Estado: `false` = pendiente, `true` = completado |
| `description` | string | No | Descripcion detallada |
| `acceptanceCriteria` | string[] | No | Criterios de exito |
| `priority` | number | No | 1 = maxima, 2 = default, 3+ = menor |
| `labels` | string[] | No | Etiquetas categoricas |
| `dependsOn` | string[] | No | IDs de tareas bloqueantes |
| `notes` | string | No | Notas adicionales |

### Ejemplo Minimo

```json
{
  "name": "Mi Feature",
  "userStories": [
    {
      "id": "US-001",
      "title": "Primera tarea",
      "passes": false
    }
  ]
}
```

### Ejemplo Completo

```json
{
  "name": "Sistema de Autenticacion",
  "description": "Implementar autenticacion segura con email/password",
  "branchName": "feature/auth",
  "userStories": [
    {
      "id": "US-001",
      "title": "Crear componente de formulario de login",
      "description": "Construir formulario responsivo con campos de email y password",
      "acceptanceCriteria": [
        "Formulario se muestra en ruta /login",
        "Tiene campos de email y password",
        "Valida campos requeridos",
        "pnpm typecheck pasa",
        "pnpm lint pasa"
      ],
      "priority": 1,
      "passes": false,
      "labels": ["frontend", "auth"],
      "dependsOn": [],
      "notes": "Usar componentes de shadcn/ui"
    },
    {
      "id": "US-002",
      "title": "Implementar API de autenticacion",
      "description": "Crear endpoint de autenticacion en el backend",
      "acceptanceCriteria": [
        "POST /api/auth/login acepta email y password",
        "Retorna JWT token en exito",
        "Retorna 401 en credenciales invalidas"
      ],
      "priority": 2,
      "passes": false,
      "labels": ["backend", "auth"],
      "dependsOn": ["US-001"]
    }
  ],
  "metadata": {
    "author": "Tu Nombre",
    "createdAt": "2026-01-17"
  }
}
```

---

## Mejores Practicas para prd.json

### 1. Tamano de Stories

> "Si no puedes describir el cambio en 2-3 oraciones, es muy grande."

**Mal:**
```json
{
  "id": "US-001",
  "title": "Implementar sistema completo de autenticacion"
}
```

**Bien - Dividir en multiples stories:**
```json
[
  { "id": "US-001", "title": "Crear formulario de login" },
  { "id": "US-002", "title": "Crear endpoint de autenticacion" },
  { "id": "US-003", "title": "Implementar manejo de sesiones" },
  { "id": "US-004", "title": "Agregar funcionalidad de logout" }
]
```

### 2. Criterios de Aceptacion

Los criterios deben ser **testeables y verificables**.

**Evitar (vago):**
- "Funciona correctamente"
- "Tiene buena UX"
- "Maneja edge cases"

**Usar (especifico):**
- "Boton muestra dialogo de confirmacion antes de eliminar"
- "Formulario valida formato de email"
- "pnpm typecheck pasa"
- "pnpm lint pasa"
- "pnpm test pasa"

### 3. Quality Gates

Siempre incluir comandos de validacion en los criterios de aceptacion:

```json
"acceptanceCriteria": [
  "Criterio especifico del feature",
  "pnpm typecheck pasa",
  "pnpm lint pasa",
  "pnpm build pasa"
]
```

### 4. Manejo de Dependencias

Usar `dependsOn` para establecer orden logico:

```json
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Crear esquema de base de datos",
      "priority": 1,
      "dependsOn": []
    },
    {
      "id": "US-002",
      "title": "Crear logica de backend",
      "priority": 2,
      "dependsOn": ["US-001"]
    },
    {
      "id": "US-003",
      "title": "Crear componentes de UI",
      "priority": 3,
      "dependsOn": ["US-002"]
    }
  ]
}
```

**Orden recomendado:**
1. Cambios de esquema/DB
2. Logica de backend
3. Componentes de UI
4. Integracion

### 5. Sistema de Prioridades

| Prioridad | Nivel | Significado |
|-----------|-------|-------------|
| 1 | Maxima | Ejecutar primero |
| 2 | Media | Default |
| 3 | Menor | Despues de prioridades altas |
| 4+ | Backlog | Ultimo |

### 6. Convencion de IDs

- Usar IDs secuenciales: `US-001`, `US-002`, `US-003`...
- Los IDs se usan para referencias de dependencias
- Mantener consistencia en todo el proyecto

---

## Configuracion del Proyecto

### Archivo `.ralph-tui/config.toml`

```toml
# Configuracion de agente
agent = "claude"
[agentOptions]
model = "sonnet"

# Configuracion de tracker
tracker = "json"
[trackerOptions]
path = "./prd.json"

# Control de ejecucion
maxIterations = 10        # 0 = ilimitado
iterationDelay = 1000     # ms entre iteraciones
outputDir = ".ralph-tui/iterations"
progressFile = ".ralph-tui/progress.md"
autoCommit = false

# Manejo de errores
[errorHandling]
strategy = "skip"         # "retry", "skip", "abort"
maxRetries = 3
retryDelayMs = 5000

# Rate limiting
fallbackAgents = ["opencode"]

[rateLimitHandling]
enabled = true
maxRetries = 3
baseBackoffMs = 5000

# Notificaciones
[notifications]
enabled = true
sound = "off"
```

---

## Comandos Principales

### Ejecucion

```bash
# Iniciar ejecucion autonoma
ralph-tui run --prd ./prd.json

# Con limite de iteraciones
ralph-tui run --prd ./prd.json --iterations 10

# Sin interfaz grafica (headless)
ralph-tui run --prd ./prd.json --headless

# Continuar sesion interrumpida
ralph-tui resume

# Ver estado
ralph-tui status --json
```

### Creacion de PRD

```bash
# Crear PRD con asistencia de IA
ralph-tui create-prd --chat

# Convertir markdown a JSON
ralph-tui convert prd.md --to json --output ./prd.json
```

### Logs y Debug

```bash
# Ver logs de iteracion especifica
ralph-tui logs --iteration 5 --verbose

# Limpiar logs antiguos
ralph-tui logs --clean --keep 10

# Ver configuracion actual
ralph-tui config show

# Ver template actual
ralph-tui template show
```

### Controles del TUI

| Tecla | Funcion |
|-------|---------|
| `s` | Iniciar ejecucion |
| `p` | Pausar/Reanudar |
| `+`/`=` | Extender iteraciones +10 |
| `-`/`_` | Reducir iteraciones -10 |
| `d` | Toggle dashboard |
| `i` | Toggle historial |
| `q` | Salir |
| `?` | Mostrar atajos |

---

## Deteccion de Completado

Ralph marca una tarea como completada cuando el agente emite el token:

```
<promise>COMPLETE</promise>
```

Esto se incluye automaticamente en las instrucciones del template.

---

## Errores Comunes y Soluciones

### "No tasks available"

**Causas:**
- Archivo prd.json no existe o path incorrecto
- Todas las tareas tienen `passes: true`
- Dependencias no resueltas

**Solucion:**
```bash
# Verificar archivo
cat prd.json | jq '.userStories[] | {id, title, passes}'
```

### Tarea atascada en "in_progress"

**Solucion:**
```bash
ralph-tui resume  # Auto-resetea tareas estancadas
```

### Agente no encontrado

**Solucion:**
```bash
which claude           # Verificar instalacion
ralph-tui plugins agents  # Listar agentes detectados
```

### Tarea no marcada como completa

**Causas:**
- Agente no emitio `<promise>COMPLETE</promise>`
- Template no incluye instrucciones de completado

**Solucion:**
```bash
ralph-tui template show  # Verificar template
```

---

## Flujo de Trabajo Recomendado

### 1. Planificacion

```bash
# Crear PRD interactivamente
ralph-tui create-prd --chat
```

El wizard te guia a traves de:
1. Objetivo del feature
2. Usuarios target
3. Alcance (incluir/excluir)
4. User stories
5. Quality gates
6. Generacion de archivo

### 2. Ejecucion

```bash
# Ejecutar con limite seguro
ralph-tui run --prd ./prd.json --iterations 35
```

### 3. Monitoreo

- Observar progreso en el TUI
- Revisar `.ralph-tui/progress.md` para contexto
- Verificar logs en `.ralph-tui/iterations/`

### 4. Iteracion

```bash
# Si se interrumpe
ralph-tui resume

# Ver estado
ralph-tui status --json
```

---

## Cuando Usar (y Cuando No)

### Ideal para:
- Endpoints CRUD
- Migraciones de patrones
- Expansion de cobertura de tests
- Wiring de UI
- Cambios de esquema de DB
- Implementacion de endpoints de API

### No recomendado para:
- Requisitos de producto ambiguos
- Decisiones arquitecturales
- Cambios sensibles de seguridad

> "Si no le darias esta tarea a un dev junior sin supervision durante la noche, no se la des a Ralph."

---

## Recursos Adicionales

- [Documentacion Oficial](https://ralph-tui.com/docs/getting-started/introduction)
- [GitHub - subsy/ralph-tui](https://github.com/subsy/ralph-tui)
- [GitHub - snarktank/ralph](https://github.com/snarktank/ralph)
