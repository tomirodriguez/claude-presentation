# Claude Code Hooks: Advanced Techniques & Undocumented Patterns

> Beyond the basics - production-tested patterns, hidden features, and creative hacks

## Table of Contents

1. [Instructing Claude via Hook Output](#instructing-claude-via-hook-output)
2. [Modifying Tool Parameters with updatedInput](#modifying-tool-parameters-with-updatedinput)
3. [Stop Hook Control Flow](#stop-hook-control-flow)
4. [Undocumented Environment Variables](#undocumented-environment-variables)
5. [transcript_path - Conversation History Access](#transcript_path---conversation-history-access)
6. [Hook Chaining Patterns](#hook-chaining-patterns)
7. [Hooks in Slash Commands](#hooks-in-slash-commands)
8. [MCP Tool Interception](#mcp-tool-interception)
9. [Creative Real-World Hacks](#creative-real-world-hacks)
10. [Autonomous Loop Patterns](#autonomous-loop-patterns)
11. [Type-Safe Hooks with Bun & TypeScript](#type-safe-hooks-with-bun--typescript)
12. [UserPromptSubmit Advanced Patterns](#userpromptsubmit-advanced-patterns)
13. [Structured JSON Output with HookJSONOutput](#structured-json-output-with-hookjsonoutput)
14. [Settings Hierarchy & Global Hooks](#settings-hierarchy--global-hooks)

---

## Instructing Claude via Hook Output

**The most powerful undocumented pattern**: Hooks can print instructions to stdout, and Claude will see and act on them.

### How It Works

When a hook prints to stdout (exit code 0), that output becomes part of Claude's context. This means you can **give Claude instructions** at specific lifecycle points, not just inject passive information.

### Pattern: Contextual Review Instructions

```typescript
// .claude/hooks/review-trigger.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PostToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

if (filePath.includes("/mutations/")) {
  console.log("REVIEW REQUIRED: You modified a mutation file.")
  console.log("Before continuing, verify error handling according to Docs/error-handling.md")
  console.log("Check: 1) Try/catch blocks 2) Error logging 3) User-facing messages")
} else if (filePath.includes("/auth/")) {
  console.log("REVIEW REQUIRED: You modified auth code.")
  console.log("Verify against Docs/authorization.md before proceeding.")
}
```

### Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "bun run .claude/hooks/review-trigger.ts"
        }]
      }
    ]
  }
}
```

### Why This Works Better Than CLAUDE.md

| Approach | Timing | Reliability |
|----------|--------|-------------|
| CLAUDE.md | Session start | Can be "forgotten" as context grows |
| Hook instructions | Exactly when needed | In-your-face, hard to ignore |

### Production Example (PubNub)

PubNub uses this pattern for multi-agent workflows:
```typescript
// Hook reads queue status and prints next action
const queueFile = Bun.file(".claude/queue.json")
if (await queueFile.exists()) {
  const queue = await queueFile.json()
  if (queue.nextTask) {
    console.log(`Use the architect-review subagent on '${queue.nextTask}'.`)
  }
}
```

Claude sees this instruction and acts on it.

---

## Modifying Tool Parameters with updatedInput

**Available since v2.0.10+**

PreToolUse and PermissionRequest hooks can modify tool parameters before execution using the `updatedInput` field.

### Basic Pattern

```json
{
  "decision": "approve",
  "updatedInput": {
    "command": "rm -i dangerous-file.txt"
  }
}
```

### Use Cases

#### 1. Auto-Add Safety Flags

```typescript
// .claude/hooks/auto-safety-flags.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const command = (input.tool_input as { command?: string }).command ?? ""

// Add interactive flag to rm commands
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

#### 2. Redirect File Paths to Safe Directories

```typescript
// .claude/hooks/redirect-paths.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

// Redirect production paths to staging
if (filePath.includes("/production/")) {
  const safePath = filePath.replace("/production/", "/staging/")
  console.log(JSON.stringify({
    decision: "approve",
    updatedInput: { file_path: safePath },
    reason: `Redirected to staging: ${safePath}`
  }))
} else {
  console.log(JSON.stringify({ decision: "approve" }))
}
```

#### 3. Inject Environment Variables

```typescript
// .claude/hooks/inject-env.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const command = (input.tool_input as { command?: string }).command ?? ""

// Inject required env vars
const modified = `export NODE_ENV=development && ${command}`

console.log(JSON.stringify({
  decision: "approve",
  updatedInput: { command: modified }
}))
```

#### 4. Auto-Inject Headers/Licenses

```typescript
// .claude/hooks/auto-license.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const content = (input.tool_input as { content?: string }).content ?? ""
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

const LICENSE_HEADER = `/*
 * Copyright 2024 MyCompany
 * SPDX-License-Identifier: MIT
 */

`

if ((filePath.endsWith(".ts") || filePath.endsWith(".js")) && !content.includes("Copyright")) {
  console.log(JSON.stringify({
    decision: "approve",
    updatedInput: { content: LICENSE_HEADER + content }
  }))
} else {
  console.log(JSON.stringify({ decision: "approve" }))
}
```

---

## Stop Hook Control Flow

Stop hooks have special powers to control Claude's continuation behavior.

### Force Continuation

```json
{
  "decision": "block",
  "reason": "Tests are failing. Fix them before stopping."
}
```

When a Stop hook returns `"decision": "block"`, Claude receives the `reason` and continues working.

### The `continue` Field

```json
{
  "continue": false,
  "stopReason": "Session limit reached"
}
```

- `continue: true` (default) - Claude continues
- `continue: false` - Forces stop regardless of other output

### Priority Hierarchy

1. `continue: false` (highest) - Always stops
2. `"decision": "block"` - Prevents stopping, continues work
3. Exit code 2 - Basic blocking
4. Exit code 0 - Allows stopping

### Task Completion Validation

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the conversation. Are ALL tasks complete? Check: 1) Code changes done 2) Tests passing 3) No TODOs remaining. Return {\"decision\": \"approve\"} if complete, or {\"decision\": \"block\", \"reason\": \"Incomplete: [details]\"} if not."
          }
        ]
      }
    ]
  }
}
```

### "What's Next?" Pattern

Force Claude to ask for next task instead of stopping:

```typescript
// .claude/hooks/whats-next.ts
console.log(JSON.stringify({
  decision: "block",
  reason: "Before stopping, ask the user what they want to work on next using AskUserQuestion."
}))
```

---

## Undocumented Environment Variables

Hooks have access to special environment variables not fully documented:

| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_DIR` | Root directory of the project |
| `CLAUDE_FILE_PATHS` | Files being modified (for Edit/Write) |
| `CLAUDE_TOOL_INPUT` | JSON-formatted tool input |
| `CLAUDE_TOOL_INPUT_FILE_PATH` | Direct access to file_path parameter |
| `CLAUDE_TOOL_INPUT_COMMAND` | Direct access to command parameter |
| `CLAUDE_STDIN` | Full JSON input (alternative to stdin) |

### Usage Example

```typescript
// .claude/hooks/check-env-vars.ts
// Access environment variables directly (alternative to stdin parsing)
const filePath = process.env.CLAUDE_TOOL_INPUT_FILE_PATH ?? ""

if (filePath.includes(".env")) {
  console.error("Cannot modify .env files")
  process.exit(2)
}
```

---

## transcript_path - Conversation History Access

All hooks receive `transcript_path` in their input - the path to the full conversation transcript.

### Input Structure

```typescript
type BaseHookInput = {
  session_id: string;
  transcript_path: string;  // Path to conversation file
  cwd: string;
  permission_mode?: string;
};
```

### Creative Applications

#### 1. Context-Aware Decisions

```typescript
// .claude/hooks/context-aware.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const transcriptPath = input.transcript_path

// Read conversation history
const transcriptFile = Bun.file(transcriptPath)
const transcript = await transcriptFile.text()

// Check if user mentioned "production" earlier
if (transcript.toLowerCase().includes("production") && transcript.toLowerCase().includes("deploy")) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Detected production deployment context. Please confirm before proceeding."
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

console.log(JSON.stringify({ decision: "approve" }))
```

#### 2. Semantic Backups Before Compaction

```typescript
// .claude/hooks/backup-decisions.ts
import type { PreCompactHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreCompactHookInput
const transcriptPath = input.transcript_path

const transcript = await Bun.file(transcriptPath).text()

// Extract key decisions before they're compacted
const decisionPatterns = /(decided|agreed|confirmed|requirement).*/gi
const decisions = transcript.match(decisionPatterns)

if (decisions?.length) {
  const backupPath = `.claude/backups/decisions_${Date.now()}.txt`
  await Bun.write(backupPath, decisions.join("\n"))
}
```

#### 3. Conversation-Based Rate Limiting

```typescript
// .claude/hooks/rate-limit.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const transcriptPath = input.transcript_path

const transcript = await Bun.file(transcriptPath).text()

// Count tool uses in this session
const editCount = (transcript.match(/"tool_name": "Edit"/g) ?? []).length

if (editCount > 50) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Too many edits (${editCount}). Review changes before continuing.`
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

console.log(JSON.stringify({ decision: "approve" }))
```

---

## Hook Chaining Patterns

### Pre/Post Coordination

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{"type": "command", "command": "./hooks/pre-edit.sh"}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{"type": "command", "command": "./hooks/post-edit.sh"}]
      }
    ]
  }
}
```

**Use case**: GitButler integration - prepare branch before edits, commit after.

### State Sharing via Files

```typescript
// .claude/hooks/pre-edit.ts
await Bun.write("/tmp/claude-edit-start", Date.now().toString())

// .claude/hooks/post-edit.ts
const startFile = Bun.file("/tmp/claude-edit-start")
if (await startFile.exists()) {
  const start = parseInt(await startFile.text())
  const duration = Date.now() - start
  const logFile = Bun.file("/tmp/claude-metrics.log")
  const existing = await logFile.exists() ? await logFile.text() : ""
  await Bun.write(logFile, existing + `Edit took ${duration}ms\n`)
}
```

### Multi-Phase Validation Pipeline

```
SessionStart (load context)
    ↓
UserPromptSubmit (enhance prompt)
    ↓
PreToolUse (validate/modify)
    ↓
[Tool executes]
    ↓
PostToolUse (format/log)
    ↓
Stop (verify completion)
```

---

## Hooks in Slash Commands

Slash commands can define their own hooks via frontmatter:

```markdown
---
description: Safe deployment workflow
hooks:
  PreToolUse:
    - matcher: "Bash"
      script: "./scripts/validate-deploy.sh"
  PostToolUse:
    - matcher: "Bash"
      script: "./scripts/log-deploy.sh"
---

Deploy the application with proper validation.
```

This creates command-specific enforcement that only applies when running that command.

---

## MCP Tool Interception

Hooks can target MCP server tools using special matchers:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__github__*",
        "hooks": [{"type": "command", "command": "./validate-github.sh"}]
      },
      {
        "matcher": "mcp__database__query",
        "hooks": [{"type": "command", "command": "./validate-query.sh"}]
      }
    ]
  }
}
```

### Pattern: API Rate Limiting

```typescript
// .claude/hooks/rate-limit-api.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const RATE_FILE = "/tmp/mcp-api-calls"
const LIMIT = 10 // calls per minute

const input = await Bun.stdin.json() as PreToolUseHookInput

// Read recent calls
const rateFile = Bun.file(RATE_FILE)
let calls: number[] = []
if (await rateFile.exists()) {
  const content = await rateFile.text()
  calls = content.split("\n").filter(Boolean).map(Number)
}

// Filter to last minute
const now = Date.now()
const recent = calls.filter(t => now - t < 60000)

if (recent.length >= LIMIT) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: `Rate limit exceeded (${LIMIT}/min). Wait before making more API calls.`
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

// Log this call
recent.push(now)
await Bun.write(rateFile, recent.join("\n"))

console.log(JSON.stringify({ decision: "approve" }))
```

---

## Creative Real-World Hacks

### 1. Audio Notifications

```typescript
// .claude/hooks/audio-notify.ts
// Stop hook - announce completion using macOS say command
const isMac = process.platform === "darwin"

if (isMac) {
  Bun.spawn(["say", "Claude has finished the task"])
} else {
  // Linux with espeak
  Bun.spawn(["espeak", "Claude has finished the task"])
}
```

### 2. Slack Integration

```typescript
// .claude/hooks/slack-notify.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PostToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? "unknown"

const webhookUrl = process.env.SLACK_WEBHOOK_URL
if (webhookUrl) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `Claude completed: ${filePath}` })
  })
}
```

### 3. Smart Light Integration

```typescript
// .claude/hooks/hue-lights.ts
const isError = process.argv[2] === "error"

const hue = isError ? 0 : 25500 // Red for error, green for success

await fetch("http://hue-bridge/api/lights/1/state", {
  method: "PUT",
  body: JSON.stringify({ hue })
})
```

### 4. Auto-Backup Before Edits

```typescript
// .claude/hooks/auto-backup.ts
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path

if (filePath) {
  const file = Bun.file(filePath)
  if (await file.exists()) {
    const backupPath = `${filePath}.claude-backup-${Date.now()}`
    await Bun.write(backupPath, file)
  }
}
```

### 5. Usage Analytics

```typescript
// .claude/hooks/analytics.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PostToolUseHookInput

const row = [
  new Date().toISOString(),
  input.session_id,
  input.tool_name,
  (input.tool_input as { file_path?: string }).file_path ?? ""
].join(",")

const csvFile = Bun.file("/tmp/claude-usage.csv")
const existing = await csvFile.exists() ? await csvFile.text() : ""
await Bun.write(csvFile, existing + row + "\n")
```

---

## Autonomous Loop Patterns

### The "ralph-wiggum" Pattern

An extreme pattern for long-running autonomous sessions:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [{
          "type": "command",
          "command": "bun run .claude/hooks/continue-loop.ts"
        }]
      }
    ]
  }
}
```

```typescript
// .claude/hooks/continue-loop.ts
const MAX_ITERATIONS = 10
const iterFile = Bun.file("/tmp/claude-iterations")

let iterations = 0
if (await iterFile.exists()) {
  iterations = parseInt(await iterFile.text())
}

if (iterations < MAX_ITERATIONS) {
  await Bun.write(iterFile, (iterations + 1).toString())
  console.log(JSON.stringify({
    decision: "block",
    reason: "Continue with the next task from the queue."
  }))
} else {
  await iterFile.delete()
  console.log(JSON.stringify({ decision: "approve" }))
}
```

**Safety Critical**: Always set iteration limits to prevent runaway loops.

### Hard Stop Markers

Include escape hatches in your autonomous loops:

```typescript
// .claude/hooks/check-hard-stop.ts
import type { StopHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as StopHookInput
const transcript = await Bun.file(input.transcript_path).text()

if (transcript.includes("**HARD STOP**")) {
  console.log(JSON.stringify({
    decision: "approve",
    stopReason: "Hard stop requested"
  }))
  process.exit(0)
}
```

---

## Security Considerations

### Hooks Run with Your Permissions

Hooks execute with full user permissions. They can:
- Access all your files
- Use your credentials
- Make network requests
- Execute any command

### Always Review External Hooks

Never copy hooks from untrusted sources without review. Malicious hooks can:
- Exfiltrate code/secrets
- Modify files silently
- Install backdoors

### Input Validation

```typescript
// .claude/hooks/validate-input.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

let input: PreToolUseHookInput
try {
  input = await Bun.stdin.json() as PreToolUseHookInput
} catch {
  console.error("Invalid JSON")
  process.exit(1)
}

const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

// Prevent path traversal
if (filePath.includes("..")) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Path traversal blocked"
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

// With Bun.spawn, use array args to avoid shell injection
// This is safer than shell quoting
await Bun.spawn(["cat", filePath]).exited
```

---

## Quick Reference

### JSON Output Fields

```json
{
  "decision": "approve|block",
  "reason": "Explanation for Claude",
  "continue": true|false,
  "stopReason": "Message for user",
  "updatedInput": { "modified": "parameters" },
  "additionalContext": "Extra context for Claude"
}
```

### Exit Codes

| Code | Effect |
|------|--------|
| 0 | Success, stdout shown |
| 2 | Block action, stderr to Claude |
| Other | Warning, continue |

### Matcher Patterns

| Pattern | Matches |
|---------|---------|
| `"Edit\|Write"` | Edit OR Write tools |
| `"Bash(npm test*)"` | Bash starting with "npm test" |
| `"mcp__github__*"` | All GitHub MCP tools |
| `"*"` | All tools |

---

## Bun & TypeScript Reference

All examples in this guide use Bun with TypeScript. Here's a quick reference for setting up and structuring your hooks.

### Project Setup

```bash
mkdir -p .claude/hooks && cd .claude/hooks
bun init -y
bun add @anthropic-ai/claude-agent-sdk
```

### Basic Type-Safe Hook

```typescript
// .claude/hooks/UserPromptSubmit.ts
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as UserPromptSubmitHookInput
const { cwd, prompt } = input

// Full type safety - autocomplete for all fields
console.log(`Processing prompt in ${cwd}`)
```

### PreToolUse with Typed Tool Inputs

```typescript
// .claude/hooks/PreToolUse.ts
import { type PreToolUseHookInput, type HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput

// Tool-specific input types
type BashToolInput = {
  command: string
  description: string
}

type WriteToolInput = {
  file_path: string
  content: string
}

if (input.tool_name === "Bash") {
  const toolInput = input.tool_input as BashToolInput

  if (toolInput.command.startsWith("npm")) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Use pnpm instead of npm"
      }
    }
    console.log(JSON.stringify(output, null, 2))
  }
}
```

### Configuration

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "bun run .claude/hooks/UserPromptSubmit.ts"
      }]
    }],
    "PreToolUse": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bun run .claude/hooks/PreToolUse.ts"
      }]
    }]
  }
}
```

### Why TypeScript?

- **Type safety**: SDK types catch errors at write-time
- **One-line parsing**: `Bun.stdin.json()` replaces complex pipes
- **NPM ecosystem**: Use any package for advanced automation
- **Maintainability**: Complex hooks become readable

---

## UserPromptSubmit Advanced Patterns

UserPromptSubmit hooks can transform prompts before Claude sees them. This enables custom syntax, dynamic data injection, and template systems.

### Custom Command Syntax

Create your own prompt modifiers:

```typescript
// .claude/hooks/UserPromptSubmit.ts
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as UserPromptSubmitHookInput

// :plan suffix - transforms into detailed planning request
if (input.prompt.endsWith(":plan")) {
  const task = input.prompt.replace(/:plan$/, "")
  console.log(`Create a detailed step-by-step plan for: ${task}`)
}

// :test suffix - add testing context
else if (input.prompt.endsWith(":test")) {
  const code = input.prompt.replace(/:test$/, "")
  console.log(`Write comprehensive tests for: ${code}`)
}

// :explain suffix - ELI5 mode
else if (input.prompt.endsWith(":explain")) {
  const topic = input.prompt.replace(/:explain$/, "")
  console.log(`Explain like I'm 5: ${topic}`)
}

// No match = original prompt passes through (no output)
```

**Usage:**
```
build a CLI app :plan
→ "Create a detailed step-by-step plan for: build a CLI app"

the auth middleware :test
→ "Write comprehensive tests for: the auth middleware"
```

### Dynamic Data Injection with load()

Fetch live data and inject it into prompts:

```typescript
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as UserPromptSubmitHookInput

// Match load(param) pattern
const match = input.prompt.match(/load\((.*)\)/)
if (match) {
  const username = match[1]
  const response = await fetch(`https://api.github.com/users/${username}`)
  const data = await response.json()

  // Replace load() with actual data
  console.log(
    input.prompt.replace(
      `load(${username})`,
      JSON.stringify(data, null, 2)
    )
  )
}
```

**Usage:**
```
How many repos does octocat have? load(octocat)
```

Claude receives the prompt with GitHub API data embedded.

### Extension Ideas

- `weather(city)` - Inject current conditions
- `stock(AAPL)` - Latest price data
- `db(query)` - Internal database results
- `jira(PROJ-123)` - Issue details
- `pr(123)` - Pull request context

### Template-Driven Variations

Load templates from disk with placeholders:

**`.claude/prompts/variations.md`:**
```markdown
Generate $count possible solutions for the following instruction:

Format each solution with this template:

Steps:
1. ...
2. ...
3. ...

Reasoning:
...

Tradeoffs:
...

Instruction: $instruction
```

**Hook:**
```typescript
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as UserPromptSubmitHookInput

// Match v(N) pattern for variations
const match = input.prompt.match(/v\((\d+)\)/)
if (match) {
  const count = match[1]
  const template = await Bun.file(".claude/prompts/variations.md").text()

  // Strip command, keep instruction
  const instruction = input.prompt.replace(match[0], "").trim()

  // Fill template
  const prompt = template
    .replace("$count", count)
    .replace("$instruction", instruction)

  console.log(prompt)
}
```

**Usage:**
```
desktop app for capturing dictation v(5)
```

Claude receives the full template with 5 solutions requested.

### Blocking Prompts with Guardrails

Reject prompts before Claude processes them:

```typescript
import { type UserPromptSubmitHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as UserPromptSubmitHookInput

// Block in production directories
if (input.cwd.includes("/production")) {
  console.error("⚠️ Claude Code disabled in production directories")
  process.exit(2)
}

// Enforce team conventions
if (input.prompt.match(/\bnpm install\b/)) {
  console.error("Use 'pnpm install' instead (team convention)")
  process.exit(2)
}

// Block sensitive content
if (input.prompt.includes("API_KEY") || input.prompt.includes("SECRET")) {
  console.error("Potential secret detected in prompt")
  process.exit(2)
}
```

---

## Structured JSON Output with HookJSONOutput

For fine-grained control, return structured JSON instead of exit codes. This enables self-correcting feedback loops.

### The HookJSONOutput Structure

```typescript
import { type HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const output: HookJSONOutput = {
  hookSpecificOutput: {
    hookEventName: "PreToolUse",  // Match the hook type
    permissionDecision: "deny",   // "allow" | "deny" | "ask"
    permissionDecisionReason: "Explanation shown to Claude"
  }
}
console.log(JSON.stringify(output, null, 2))
```

### Permission Decisions

| Decision | Effect | Use Case |
|----------|--------|----------|
| `"deny"` | Block tool + show reason to Claude | Enforce conventions with guidance |
| `"allow"` | Bypass permission + show reason to user | Auto-approve safe operations |
| `"ask"` | Prompt user for confirmation | Require manual approval for sensitive ops |

### Self-Correcting Feedback

The key advantage over exit code 2: Claude receives structured feedback and can self-correct.

```typescript
if (toolInput.command.startsWith("echo")) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "echo is not allowed. Always use node -e and console.log instead."
    }
  }
  console.log(JSON.stringify(output, null, 2))
}
```

**What happens:**
1. Claude attempts `echo "hello"`
2. Hook denies with reason: "use node -e and console.log"
3. Claude **immediately retries** with `node -e 'console.log("hello")'`
4. Command succeeds

### Exit Code vs JSON Comparison

| Approach | Blocks? | Feedback? | Self-Correction? |
|----------|---------|-----------|------------------|
| Exit code 2 | Yes | stderr only | Limited |
| JSON `deny` | Yes | Structured reason | Full guidance |

---

## Settings Hierarchy & Global Hooks

Claude Code merges hooks from multiple locations with clear priority.

### Priority Order (Highest to Lowest)

1. **Enterprise managed policy** - Organization-enforced rules
2. **`~/.claude/settings.json`** - User-level (all projects)
3. **`.claude/settings.json`** - Project-level (shared via git)
4. **`.claude/settings.local.json`** - Local project (gitignored)

### Global User Hooks

Apply hooks to ALL your projects:

```bash
# Setup global hooks directory
mkdir -p ~/.claude/hooks && cd ~/.claude/hooks
bun init
bun i @anthropic-ai/claude-agent-sdk
git init  # Version control your hooks!
```

**`~/.claude/settings.json`:**
```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "bun run ~/.claude/hooks/PreToolUse.ts"
      }]
    }]
  }
}
```

> **Important**: Use absolute paths (`~/` or full path) for global hooks since they run from any directory.

### Global Hook Example

Enforce pnpm across all projects:

```typescript
// ~/.claude/hooks/PreToolUse.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput

type BashToolInput = { command: string; description: string }

if (input.tool_name === "Bash") {
  const toolInput = input.tool_input as BashToolInput

  if (toolInput.command.startsWith("npm")) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Never use npm. Always use pnpm"
      }
    }
    console.log(JSON.stringify(output, null, 2))
  }
}
```

Now from ANY project:
```bash
cd ~/projects/any-repo
claude
> npm install lodash
# Hook denies: "Never use npm. Always use pnpm"
# Claude auto-corrects to: pnpm install lodash
```

### Team Hook Sharing

Share user-level hooks with your team via dotfiles:

```bash
# In your dotfiles repo
cp -r ~/.claude/hooks ./claude-hooks
git add claude-hooks
git commit -m "Add team Claude hooks"

# Teammates clone and symlink
ln -s ~/dotfiles/claude-hooks ~/.claude/hooks
```

---

*This guide documents advanced patterns discovered through community research and production usage. Last updated: January 2026.*
