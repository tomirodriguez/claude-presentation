# Ralph TUI - Guia para Agentes de IA

> Esta guia esta optimizada para que agentes de IA (Claude, GPT, etc.) comprendan como generar prd.json de alta calidad para Ralph TUI.

---

## CONTEXTO CRITICO

Ralph TUI es un orquestador que ejecuta agentes de IA en loop autonomo. El `prd.json` define las tareas. El agente:

1. Recibe una tarea con su contexto
2. Ejecuta el codigo necesario
3. Emite `<promise>COMPLETE</promise>` cuando termina
4. Ralph marca `passes: true` y pasa a la siguiente tarea

**IMPORTANTE**: Las tareas se ejecutan secuencialmente, una a la vez, sin intervencion humana.

---

## SCHEMA EXACTO DE prd.json

### Estructura Valida

```typescript
interface PrdJson {
  // REQUERIDOS
  name: string;              // Nombre del proyecto/feature
  userStories: UserStory[];  // Array de tareas

  // OPCIONALES
  description?: string;      // Descripcion extendida
  branchName?: string;       // Rama git (ej: "feature/auth")
  slug?: string;             // Version slugificada del nombre
  targetUsers?: string;      // Usuarios objetivo
  problemStatement?: string; // Problema a resolver
  solution?: string;         // Solucion propuesta
  successMetrics?: string;   // Metricas de exito
  constraints?: string;      // Limitaciones
  technicalNotes?: string;   // Notas tecnicas
  createdAt?: string;        // ISO timestamp
  metadata?: Record<string, unknown>;
}

interface UserStory {
  // REQUERIDOS
  id: string;      // Formato: "US-001", "US-002", etc.
  title: string;   // Titulo breve y descriptivo
  passes: boolean; // SIEMPRE false inicialmente

  // OPCIONALES
  description?: string;           // Descripcion completa
  acceptanceCriteria?: string[];  // Criterios verificables
  priority?: number;              // 1=maxima, 2=default, 3+=menor
  labels?: string[];              // Tags categoricos
  dependsOn?: string[];           // IDs de tareas bloqueantes
  notes?: string;                 // Notas adicionales
  completionNotes?: string;       // Notas post-completado
}
```

### CAMPOS RECHAZADOS (Errores Comunes)

El validador **RECHAZA** estos campos - NUNCA los uses:

| Campo Incorrecto | Error | Campo Correcto |
|------------------|-------|----------------|
| `prd` (wrapper raiz) | "found 'prd' instead of expected structure" | Usar estructura plana |
| `tasks` | "found 'tasks' instead of expected structure" | `userStories` |
| `status` | "found 'status' field but expected 'passes'" | `passes` (boolean) |
| `subtasks` | "unsupported fields" | Dividir en stories separadas |
| `estimated_hours` | "unsupported fields" | NO soportado |
| `files` | "unsupported fields" | NO soportado |

### ERRORES DE TIPO COMUNES

```json
// INCORRECTO - status como string
{ "status": "pending" }

// CORRECTO - passes como boolean
{ "passes": false }

// INCORRECTO - wrapper prd
{ "prd": { "name": "...", "userStories": [] } }

// CORRECTO - estructura plana
{ "name": "...", "userStories": [] }

// INCORRECTO - tasks en lugar de userStories
{ "tasks": [] }

// CORRECTO
{ "userStories": [] }
```

---

## REGLAS PARA GENERAR prd.json OPTIMO

### 1. TAMANO DE STORIES

**REGLA**: Cada story debe ser completable en UNA sesion de contexto del agente.

**HEURISTICA**: Si la descripcion necesita mas de 2-3 oraciones, DIVIDIR.

```json
// MAL - Muy grande
{
  "id": "US-001",
  "title": "Implementar autenticacion completa con OAuth, JWT, refresh tokens y MFA"
}

// BIEN - Atomico
[
  { "id": "US-001", "title": "Crear formulario de login con email/password" },
  { "id": "US-002", "title": "Implementar endpoint POST /api/auth/login" },
  { "id": "US-003", "title": "Agregar generacion de JWT tokens" },
  { "id": "US-004", "title": "Implementar refresh token rotation" },
  { "id": "US-005", "title": "Agregar soporte MFA con TOTP" }
]
```

### 2. CRITERIOS DE ACEPTACION

**REGLA**: SIEMPRE incluir quality gates tecnicos al final.

**FORMATO RECOMENDADO**:
```json
"acceptanceCriteria": [
  // 1-3 criterios especificos del feature
  "Formulario muestra error si email es invalido",
  "Password debe tener minimo 8 caracteres",

  // SIEMPRE incluir quality gates
  "pnpm typecheck pasa",
  "pnpm lint pasa"
]
```

**CRITERIOS BUENOS** (verificables):
- "Endpoint retorna 401 si token expirado"
- "Componente renderiza loading state durante fetch"
- "Migracion crea columna `priority` tipo VARCHAR(10)"

**CRITERIOS MALOS** (ambiguos):
- "Funciona bien"
- "Tiene buena UX"
- "Es performante"
- "Maneja errores"

### 3. DEPENDENCIAS

**REGLA**: Ordenar por dependencias logicas usando `dependsOn`.

**ORDEN TIPICO**:
1. Schema/DB changes (priority: 1)
2. Backend logic (priority: 2)
3. Frontend components (priority: 3)
4. Integration/tests (priority: 4)

```json
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Agregar columna status a tabla users",
      "priority": 1,
      "dependsOn": []
    },
    {
      "id": "US-002",
      "title": "Crear endpoint GET /api/users/:id/status",
      "priority": 2,
      "dependsOn": ["US-001"]
    },
    {
      "id": "US-003",
      "title": "Mostrar badge de status en perfil",
      "priority": 3,
      "dependsOn": ["US-002"]
    }
  ]
}
```

**IMPORTANTE**: NO crear dependencias circulares.

### 4. PRIORIDADES

| Valor | Uso |
|-------|-----|
| 1 | Tareas fundacionales (DB, schemas) |
| 2 | Logica core (APIs, services) - DEFAULT |
| 3 | UI/UX (componentes, estilos) |
| 4+ | Nice-to-have, cleanup |

**REGLA**: La prioridad debe reflejar el orden de dependencias.

### 5. CONTEXTO EN DESCRIPTION

Incluir contexto relevante que el agente necesitara:

```json
{
  "id": "US-001",
  "title": "Crear hook useAuth",
  "description": "Crear custom hook useAuth en src/hooks/useAuth.ts que maneje el estado de autenticacion. Debe usar el AuthContext existente en src/context/AuthContext.tsx. Exponer: user, isLoading, login(), logout(), isAuthenticated.",
  "acceptanceCriteria": [
    "Hook exportado desde src/hooks/useAuth.ts",
    "Usa AuthContext internamente",
    "Expone user, isLoading, login, logout, isAuthenticated",
    "pnpm typecheck pasa"
  ]
}
```

### 6. LABELS

Usar para categorizar y filtrar:

```json
"labels": ["frontend", "auth"]      // Componente de autenticacion
"labels": ["backend", "api"]        // Endpoint de API
"labels": ["db", "migration"]       // Cambio de base de datos
"labels": ["testing"]               // Tests
"labels": ["refactor"]              // Refactorizacion
```

---

## TEMPLATE DE prd.json COMPLETO

```json
{
  "name": "Feature Name",
  "description": "Descripcion clara del feature y su proposito",
  "branchName": "feature/feature-name",
  "targetUsers": "Usuarios especificos que usaran este feature",
  "problemStatement": "Problema que este feature resuelve",
  "solution": "Como este feature resuelve el problema",
  "successMetrics": "Como medimos el exito de este feature",
  "constraints": "Limitaciones tecnicas o de negocio",
  "technicalNotes": "Consideraciones tecnicas importantes",
  "createdAt": "2026-01-17T00:00:00.000Z",
  "userStories": [
    {
      "id": "US-001",
      "title": "Titulo conciso de la tarea",
      "description": "Descripcion detallada con contexto necesario. Mencionar archivos relevantes, patrones a seguir, y cualquier informacion que el agente necesite.",
      "acceptanceCriteria": [
        "Criterio especifico y verificable 1",
        "Criterio especifico y verificable 2",
        "pnpm typecheck pasa",
        "pnpm lint pasa"
      ],
      "priority": 1,
      "passes": false,
      "labels": ["categoria"],
      "dependsOn": [],
      "notes": "Notas adicionales si son necesarias"
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "createdAt": "2026-01-17T00:00:00.000Z"
  }
}
```

---

## CHECKLIST DE VALIDACION

Antes de finalizar el prd.json, verificar:

- [ ] `name` esta presente y es descriptivo
- [ ] `userStories` es un array (no `tasks`)
- [ ] Cada story tiene `id`, `title`, `passes`
- [ ] Todos los `passes` estan en `false`
- [ ] IDs son secuenciales: US-001, US-002, etc.
- [ ] Criterios de aceptacion incluyen quality gates
- [ ] Dependencias no forman ciclos
- [ ] Prioridades reflejan orden de dependencias
- [ ] Cada story es completable en una sesion
- [ ] NO hay campos rechazados (status, subtasks, etc.)

---

## ALGORITMO DE SELECCION DE TAREAS

Ralph selecciona tareas asi:

```
1. Filtrar: userStories donde passes === false
2. Excluir: tareas donde alguna dependsOn tiene passes === false
3. Ordenar: por priority (menor numero = mayor prioridad)
4. Seleccionar: primera tarea disponible
```

**IMPLICACION**: Una tarea con `dependsOn: ["US-001"]` NO se ejecutara hasta que US-001 tenga `passes: true`.

---

## EJEMPLO COMPLETO: Sistema de Autenticacion

```json
{
  "name": "User Authentication System",
  "description": "Implementar sistema de autenticacion con email/password usando JWT",
  "branchName": "feature/auth",
  "targetUsers": "Usuarios finales de la aplicacion",
  "problemStatement": "Los usuarios no pueden acceder a funcionalidades protegidas",
  "solution": "Sistema de login/registro con JWT tokens",
  "technicalNotes": "Usar bcrypt para hashing, jose para JWT. Seguir patrones existentes en src/lib/",
  "userStories": [
    {
      "id": "US-001",
      "title": "Crear schema de usuario en base de datos",
      "description": "Agregar tabla users con campos: id (uuid), email (unique), password_hash, created_at, updated_at. Usar Drizzle ORM siguiendo patron de src/db/schema/",
      "acceptanceCriteria": [
        "Schema definido en src/db/schema/users.ts",
        "Campos: id, email, password_hash, created_at, updated_at",
        "Email tiene constraint unique",
        "Migracion generada y aplicada",
        "pnpm typecheck pasa"
      ],
      "priority": 1,
      "passes": false,
      "labels": ["db", "auth"],
      "dependsOn": []
    },
    {
      "id": "US-002",
      "title": "Implementar funcion de hash de password",
      "description": "Crear utilidad en src/lib/auth/password.ts con funciones hashPassword y verifyPassword usando bcrypt",
      "acceptanceCriteria": [
        "Funcion hashPassword(plain: string): Promise<string>",
        "Funcion verifyPassword(plain: string, hash: string): Promise<boolean>",
        "Usa bcrypt con cost factor 12",
        "pnpm typecheck pasa"
      ],
      "priority": 1,
      "passes": false,
      "labels": ["backend", "auth"],
      "dependsOn": []
    },
    {
      "id": "US-003",
      "title": "Crear endpoint de registro",
      "description": "POST /api/auth/register que acepta email y password, crea usuario y retorna token JWT",
      "acceptanceCriteria": [
        "Endpoint en src/app/api/auth/register/route.ts",
        "Valida email formato y password minimo 8 chars",
        "Retorna 400 si email ya existe",
        "Retorna 201 con token JWT en exito",
        "pnpm typecheck pasa"
      ],
      "priority": 2,
      "passes": false,
      "labels": ["backend", "api", "auth"],
      "dependsOn": ["US-001", "US-002"]
    },
    {
      "id": "US-004",
      "title": "Crear endpoint de login",
      "description": "POST /api/auth/login que verifica credenciales y retorna token JWT",
      "acceptanceCriteria": [
        "Endpoint en src/app/api/auth/login/route.ts",
        "Retorna 401 si credenciales invalidas",
        "Retorna 200 con token JWT en exito",
        "Token incluye userId y email en payload",
        "pnpm typecheck pasa"
      ],
      "priority": 2,
      "passes": false,
      "labels": ["backend", "api", "auth"],
      "dependsOn": ["US-001", "US-002"]
    },
    {
      "id": "US-005",
      "title": "Crear componente LoginForm",
      "description": "Formulario de login en src/components/auth/LoginForm.tsx usando React Hook Form y shadcn/ui",
      "acceptanceCriteria": [
        "Componente en src/components/auth/LoginForm.tsx",
        "Campos: email (type=email), password (type=password)",
        "Boton submit con loading state",
        "Muestra errores de validacion inline",
        "Llama a POST /api/auth/login on submit",
        "pnpm typecheck pasa"
      ],
      "priority": 3,
      "passes": false,
      "labels": ["frontend", "auth"],
      "dependsOn": ["US-004"]
    },
    {
      "id": "US-006",
      "title": "Crear pagina /login",
      "description": "Pagina de login en src/app/(auth)/login/page.tsx que renderiza LoginForm",
      "acceptanceCriteria": [
        "Pagina en src/app/(auth)/login/page.tsx",
        "Renderiza LoginForm centrado",
        "Redirige a /dashboard si ya autenticado",
        "Link a /register para nuevos usuarios",
        "pnpm typecheck pasa"
      ],
      "priority": 3,
      "passes": false,
      "labels": ["frontend", "auth"],
      "dependsOn": ["US-005"]
    }
  ],
  "metadata": {
    "createdAt": "2026-01-17T00:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## NOTAS FINALES PARA IAs

1. **ATOMICIDAD**: Cada story = 1 cambio discreto y verificable
2. **CONTEXTO**: Incluir paths de archivos, patrones a seguir
3. **QUALITY GATES**: SIEMPRE incluir typecheck/lint en criterios
4. **DEPENDENCIAS**: Modelar flujo logico de implementacion
5. **SIN AMBIGUEDAD**: Criterios deben ser binarios (pasa/no pasa)
6. **PASS = FALSE**: Todas las stories inician en `passes: false`
7. **NO SUBTASKS**: Si necesitas subtasks, crear stories separadas
8. **NO STATUS STRINGS**: Usar `passes: boolean`, nunca `status: string`

---

## PROMPT PARA GENERAR prd.json

Cuando necesites generar un prd.json, usa este prompt como guia:

```
Genera un prd.json para: [DESCRIPCION DEL FEATURE]

REGLAS:
1. Cada story debe ser completable en 1 sesion de agente
2. Incluir quality gates (typecheck, lint) en acceptanceCriteria
3. Ordenar por dependencias logicas (DB -> Backend -> Frontend)
4. Usar IDs secuenciales: US-001, US-002, etc.
5. Todos passes: false
6. Incluir paths de archivos especificos en description
7. NO usar: status, subtasks, tasks, prd wrapper

Stack tecnico: [ESPECIFICAR]
Patrones existentes: [MENCIONAR SI APLICA]
```
