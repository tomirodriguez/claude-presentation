# Slide 7: Hooks

## Hooks

> **"Los prompts sugieren, los hooks GARANTIZAN"**

Shell commands que se ejecutan automaticamente en puntos especificos del ciclo de vida de Claude Code.

---

## Por que usar Hooks?

| CLAUDE.md | Hooks |
|-----------|-------|
| "Por favor, correr biome" | Biome corre SIEMPRE |
| Claude puede olvidar | Ejecucion garantizada |
| Sugerencia | Enforcement |

**Casos de uso:**
- Auto-formateo de codigo
- Bloquear comandos peligrosos
- Proteger archivos sensibles
- Inyectar contexto dinamico
- Notificaciones al terminar

---

## Los 8 Eventos

| Evento | Cuando | Usa Matcher? |
|--------|--------|--------------|
| **PreToolUse** | Antes de ejecutar herramienta | Si |
| **PostToolUse** | Despues de ejecutar herramienta | Si |
| **PermissionRequest** | Cuando pide permiso | Si |
| **UserPromptSubmit** | Al enviar un prompt | No |
| **Stop** | Cuando Claude termina | No |
| **SubagentStop** | Cuando un subagente termina | No |
| **SessionStart** | Al iniciar sesion | No |
| **PreCompact** | Antes de compactar contexto | No |

---

## Configuracion

Ubicaciones de archivos:

```
~/.claude/settings.json          # Global (todos tus proyectos)
.claude/settings.json            # Proyecto (compartido via git)
.claude/settings.local.json      # Proyecto (personal, gitignored)
```

Estructura basica:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "biome check --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

---

## Matchers

Filtran en que herramientas aplica el hook:

| Patron | Matchea |
|--------|---------|
| `"Write"` | Solo Write |
| `"Write\|Edit"` | Write O Edit |
| `"Bash"` | Todos los comandos Bash |
| `"Bash(npm test*)"` | Bash que empieza con "npm test" |
| `"mcp__github__*"` | Todas las tools de GitHub MCP |
| `""` o `"*"` | Todas las herramientas |

---

## Exit Codes

| Codigo | Significado | Efecto |
|--------|-------------|--------|
| `0` | Exito | Continua, stdout mostrado al usuario |
| `2` | Bloquear | Accion bloqueada, stderr enviado a Claude |
| Otro | Warning | Continua con advertencia |

---

## JSON Output (mas control)

En lugar de exit codes, podes retornar JSON estructurado:

```json
{
  "decision": "block",
  "reason": "No se puede modificar archivos .env"
}
```

**Decisions disponibles:**
- `"approve"` - Permitir la accion
- `"block"` - Bloquear con feedback a Claude
- `"allow"` - Aprobar permiso automaticamente
- `"deny"` - Denegar permiso

**Campos adicionales:**
- `"continue": true` - Forzar que Claude continue (Stop hooks)
- `"updatedInput": {...}` - Modificar parametros de la herramienta

---

## Ejemplo: Bloquear archivos protegidos

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/protect-files.ts"
          }
        ]
      }
    ]
  }
}
```

```typescript
// .claude/hooks/protect-files.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

type WriteToolInput = { file_path: string; content: string }

const input: PreToolUseHookInput = await Bun.stdin.json()
const filePath = (input.tool_input as WriteToolInput).file_path ?? ""

const PROTECTED = [".env", "credentials", "secrets", ".git/"]

for (const pattern of PROTECTED) {
  if (filePath.includes(pattern)) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Archivo protegido: ${filePath}`
      }
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }
}
```

---

## Ejemplo: Auto-aprobar comandos seguros

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "Bash(pnpm test*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"decision\": \"allow\"}'"
          }
        ]
      }
    ]
  }
}
```

Ahora `pnpm test` nunca pide confirmacion.

---

## Ejemplo: Inyectar contexto al inicio

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/session-start.ts"
          }
        ]
      }
    ]
  }
}
```

```typescript
// .claude/hooks/session-start.ts
import type { SessionStartHookInput } from "@anthropic-ai/claude-agent-sdk"

const input: SessionStartHookInput = await Bun.stdin.json()

const gitStatus = Bun.spawn(["git", "status", "--short"])
const statusOutput = await new Response(gitStatus.stdout).text()

const gitLog = Bun.spawn(["git", "log", "--oneline", "-5"])
const logOutput = await new Response(gitLog.stdout).text()

console.log("## Estado del proyecto")
console.log(`Directorio: ${input.cwd}`)
console.log(statusOutput || "Working tree clean")
console.log("## Commits recientes")
console.log(logOutput)
```

---

## Patron Avanzado: Instrucciones via stdout

Lo que imprimas a stdout, Claude lo ve y actua en consecuencia:

```typescript
// .claude/hooks/review-trigger.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

type WriteToolInput = { file_path: string; content: string }

const input: PostToolUseHookInput = await Bun.stdin.json()
const filePath = (input.tool_input as WriteToolInput).file_path ?? ""

if (filePath.includes("/auth/")) {
  console.log("ATENCION: Modificaste codigo de auth.")
  console.log("Verifica contra docs/authorization.md antes de continuar.")
} else if (filePath.includes("/mutations/")) {
  console.log("REVIEW REQUIRED: Modificaste una mutation.")
  console.log("Verifica el error handling segun docs/error-handling.md")
}
```

Esto es mas efectivo que CLAUDE.md porque aparece **en el momento exacto** que lo necesitas.

---

## Patron Avanzado: Modificar parametros

Con `updatedInput` podes modificar los parametros antes de ejecutar:

```typescript
// .claude/hooks/auto-safety-flags.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

type BashToolInput = { command: string; description: string }

const input: PreToolUseHookInput = await Bun.stdin.json()
const command = (input.tool_input as BashToolInput).command ?? ""

// Agregar flag -i a comandos rm
if (command.startsWith("rm ") && !command.includes("-i")) {
  const safeCommand = command.replace("rm ", "rm -i ")
  console.log(JSON.stringify({
    decision: "approve",
    updatedInput: { command: safeCommand }
  }))
} else {
  console.log(JSON.stringify({ decision: "approve" }))
}
```

---

## Setup con Bun + TypeScript

```bash
mkdir -p .claude/hooks && cd .claude/hooks
bun init -y
bun add @anthropic-ai/claude-agent-sdk
```

Esto te da tipos para todos los inputs y outputs:

```typescript
// Tipos de input disponibles por evento
import type {
  PreToolUseHookInput,      // tool_name, tool_input
  PostToolUseHookInput,     // tool_name, tool_input, tool_result
  UserPromptSubmitHookInput, // prompt, cwd
  SessionStartHookInput,    // cwd, session_id
  StopHookInput,            // stop_hook_active, transcript_path
  HookJSONOutput            // Para respuestas estructuradas
} from "@anthropic-ai/claude-agent-sdk"

// Tipado basico
const input: PreToolUseHookInput = await Bun.stdin.json()
// Autocomplete para: tool_name, tool_input, session_id, etc.

// Tipado de tool_input especifico
type BashToolInput = { command: string; description: string }
type WriteToolInput = { file_path: string; content: string }

const command = (input.tool_input as BashToolInput).command
```

---

## Seguridad

Los hooks corren con **tus permisos completos**:
- Acceso a todos tus archivos
- Pueden hacer requests de red
- Pueden ejecutar cualquier comando

**Siempre revisar hooks externos antes de usarlos.**

Claude Code requiere revision en `/hooks` antes de activar cambios directos a la configuracion.

---

## Tips

1. **Empezar simple** - Un hook a la vez
2. **Usar matchers especificos** - `"Write|Edit"` mejor que `"*"`
3. **Timeouts** - Default 60s, ajustar con `"timeout": 120000`
4. **Testear manualmente** primero:
   ```bash
   echo '{"tool_name":"Write","tool_input":{"file_path":"test.js"}}' | bun run .claude/hooks/mi-hook.ts
   ```
5. **Paths absolutos** para hooks globales: `~/.claude/hooks/mi-hook.ts`

---

`/slide 9` -> MCP Servers
