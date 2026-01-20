# Claude Code Hooks: The Complete Guide

> From beginner to expert - everything you need to know about mastering Claude Code hooks.

## Table of Contents

1. [What Are Hooks?](#what-are-hooks)
2. [Why Use Hooks?](#why-use-hooks)
3. [Hook Events Reference](#hook-events-reference)
4. [Configuration Basics](#configuration-basics)
5. [Matchers and Targeting](#matchers-and-targeting)
6. [Exit Codes and Communication](#exit-codes-and-communication)
7. [Hooks vs Other Features](#hooks-vs-other-features)
8. [Real-World Use Cases](#real-world-use-cases)
9. [Production-Ready Examples](#production-ready-examples)
10. [Best Practices](#best-practices)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)
13. [Resources](#resources)

---

## What Are Hooks?

**Hooks are user-defined shell commands that execute automatically at specific points in Claude Code's lifecycle.**

Think of hooks as event listeners for your AI coding assistant. When certain events happen (like Claude editing a file, or finishing a response), your custom scripts run automatically.

### Key Principle: Prompts Suggest, Hooks Guarantee

The fundamental difference between prompts and hooks:

| Approach | Behavior | Reliability |
|----------|----------|-------------|
| **Prompts** | Ask Claude to do something | May or may not happen |
| **Hooks** | Force something to happen | Always executes |

**Example:** You can tell Claude "always run prettier after editing files" in your CLAUDE.md, but Claude might forget. With a hook, prettier runs **every single time** - guaranteed.

---

## Why Use Hooks?

### 1. Deterministic Control
Hooks ensure certain actions **always** happen, removing reliance on the LLM's decision-making.

### 2. Automation
Eliminate repetitive manual tasks like formatting, linting, or running tests.

### 3. Quality Gates
Enforce standards automatically - block dangerous commands, validate outputs, ensure tests pass.

### 4. Context Injection
Automatically provide Claude with relevant information at the right time.

### 5. Security
Prevent modifications to sensitive files or dangerous command execution.

---

## Hook Events Reference

Claude Code provides **8 hook events** that trigger at different lifecycle points:

### PreToolUse
**When:** Before Claude executes any tool (Write, Edit, Bash, etc.)
**Use for:** Blocking dangerous operations, validating inputs, modifying tool parameters

```
User prompt → Claude plans action → [PreToolUse] → Tool executes
```

### PostToolUse
**When:** After a tool completes successfully
**Use for:** Auto-formatting, linting, logging, triggering follow-up actions

```
Tool executes → [PostToolUse] → Claude continues
```

### UserPromptSubmit
**When:** When you submit a prompt, before Claude processes it
**Use for:** Injecting context, validating prompts, adding dynamic information

```
You type prompt → [UserPromptSubmit] → Claude receives enhanced prompt
```

### PermissionRequest
**When:** When Claude requests permission to use a tool
**Use for:** Auto-approving safe operations, auto-denying risky ones

```
Claude wants to run npm test → [PermissionRequest] → Auto-approved
```

### Stop
**When:** When Claude finishes responding
**Use for:** Validating completion, forcing continuation, quality checks

```
Claude says "Done!" → [Stop] → Verify actually done
```

### SubagentStop
**When:** When a subagent (spawned by Claude) finishes
**Use for:** Validating subagent output, triggering follow-up actions

```
Subagent completes → [SubagentStop] → Validate output
```

### SessionStart
**When:** When a Claude Code session begins
**Use for:** Injecting project context, git status, TODOs

```
You start Claude Code → [SessionStart] → Context loaded
```

### PreCompact
**When:** Before context compaction (conversation summary)
**Use for:** Backing up transcripts, preserving context

```
Context getting long → [PreCompact] → Backup transcript
```

---

## Configuration Basics

### Configuration File Locations

Hooks are configured in JSON settings files:

| File | Scope | Use Case |
|------|-------|----------|
| `.claude/settings.json` | Project | Shared with team via git |
| `.claude/settings.local.json` | Project | Personal settings (gitignored) |
| `~/.claude/settings.json` | User | All your projects |

### Basic Structure

```json
{
  "hooks": {
    "EVENT_NAME": [
      {
        "matcher": "TOOL_PATTERN",
        "hooks": [
          {
            "type": "command",
            "command": "your-script.sh"
          }
        ]
      }
    ]
  }
}
```

### Using the Interactive UI

The easiest way to configure hooks is through Claude Code's built-in UI:

```bash
# Inside Claude Code, type:
/hooks
```

This opens an interactive menu for creating and managing hooks without editing JSON directly.

### Setting Up Bun for Hooks

For type-safe, maintainable hooks, use Bun with the official SDK:

```bash
# Create hooks directory
mkdir -p .claude/hooks && cd .claude/hooks

# Initialize Bun project
bun init -y

# Install the Claude Agent SDK for type definitions
bun add @anthropic-ai/claude-agent-sdk
```

This gives you full TypeScript support with autocomplete for all hook inputs and outputs.

### Hook Types

**Command hooks** - Run shell commands:
```json
{
  "type": "command",
  "command": "prettier --write \"$FILE_PATH\"",
  "timeout": 30000
}
```

**Prompt hooks** - Use an LLM to evaluate (for Stop/SubagentStop):
```json
{
  "type": "prompt",
  "prompt": "Evaluate if the task is complete. Respond with JSON: {\"decision\": \"approve\"} or {\"decision\": \"block\", \"reason\": \"...\"}"
}
```

---

## Matchers and Targeting

Matchers let you target specific tools. They only apply to tool-based hooks (PreToolUse, PostToolUse, PermissionRequest).

### Matcher Syntax

| Pattern | Matches |
|---------|---------|
| `"Write"` | Only the Write tool |
| `"Edit"` | Only the Edit tool |
| `"Write\|Edit"` | Write OR Edit |
| `"Bash"` | All Bash commands |
| `"Bash(npm test*)"` | Bash commands starting with `npm test` |
| `"Bash(git push*)"` | Bash commands starting with `git push` |
| `"mcp__github__*"` | All GitHub MCP tools |
| `"*"` | All tools |
| `""` (empty) | All tools |

### Examples

**Target file writes only:**
```json
{
  "matcher": "Write|Edit",
  "hooks": [{ "type": "command", "command": "run-formatter.sh" }]
}
```

**Target specific Bash commands:**
```json
{
  "matcher": "Bash(rm -rf*)",
  "hooks": [{ "type": "command", "command": "echo 'Blocked!' && exit 2" }]
}
```

**Target MCP tools:**
```json
{
  "matcher": "mcp__memory__.*",
  "hooks": [{ "type": "command", "command": "log-memory-access.sh" }]
}
```

---

## Exit Codes and Communication

Hooks communicate with Claude Code through exit codes and stdout/stderr.

### Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| `0` | Success | Hook passes, stdout shown to user |
| `2` | Blocking error | Action is blocked, stderr sent to Claude |
| Other | Non-blocking error | Warning shown, execution continues |

### JSON Output

For more control, output JSON to stdout:

```json
{
  "decision": "approve",
  "reason": "All checks passed"
}
```

**Decision values:**
- `"approve"` - Allow the action (PreToolUse, PermissionRequest)
- `"block"` - Stop the action (PreToolUse, PermissionRequest)
- `"allow"` - Grant permission (PermissionRequest)
- `"deny"` - Deny permission (PermissionRequest)

**Additional fields:**
- `"reason"` - Explanation shown to Claude
- `"continue"` - For Stop hooks: `true` to force Claude to continue
- `"updatedInput"` - Modified tool parameters (PreToolUse, v2.0.10+)

### Example: Blocking with Feedback

```typescript
// .claude/hooks/block-sensitive-files.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

if (filePath.includes(".env")) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Cannot modify .env files - they contain secrets"
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}
```

---

## Hooks vs Other Features

Understanding when to use hooks versus other Claude Code customization options:

### Comparison Table

| Feature | Trigger | Purpose | Execution |
|---------|---------|---------|-----------|
| **Hooks** | Automatic at lifecycle events | Enforcement, automation | Deterministic, always runs |
| **Skills** | Auto-invoked by context matching | Domain expertise, workflows | LLM decides if relevant |
| **Commands** | Manual (`/command`) or auto | Explicit workflows | User or LLM triggered |
| **MCP Servers** | Claude calls as tools | External integrations | LLM decides when needed |
| **CLAUDE.md** | Always loaded | Project context, rules | Suggestions, not guarantees |

### When to Use Each

**Use Hooks when:**
- You need something to **always** happen (formatting, linting)
- You want to **block** certain actions (security)
- You need **automatic** quality gates
- You want to **inject context** at specific times

**Use Skills when:**
- You have domain expertise Claude should apply when relevant
- You have complex workflows with supporting files
- You want Claude to auto-activate based on task type

**Use Commands when:**
- You want explicit `/command` entry points
- You need repeatable workflows triggered manually
- You're building pipelines of actions

**Use MCP Servers when:**
- You need to connect external services (GitHub, databases, APIs)
- You want Claude to interact with third-party tools
- You need bidirectional communication with external systems

**Use CLAUDE.md when:**
- You want to provide project context and guidelines
- You're setting conventions Claude should follow
- You need to document project-specific information

### The Mental Model

> **Skills inform, Hooks enforce, Commands invoke, MCP integrates**

---

## Real-World Use Cases

### 1. Automatic Code Formatting

**Problem:** You want consistent code style but don't want to manually run formatters.

**Solution:** PostToolUse hook that runs formatters after every file edit.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### 2. Security: Block Dangerous Commands

**Problem:** Prevent Claude from running destructive commands.

**Solution:** PreToolUse hook that blocks specific patterns.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/security-check.ts"
          }
        ]
      }
    ]
  }
}
```

**security-check.ts:**
```typescript
// .claude/hooks/security-check.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const command = (input.tool_input as { command?: string }).command ?? ""

const BLOCKED_PATTERNS = [
  "rm -rf /",
  "rm -rf ~",
  "git push --force",
  "git reset --hard",
  "> /dev/sda",
]

for (const pattern of BLOCKED_PATTERNS) {
  if (command.includes(pattern)) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Blocked dangerous command: ${pattern}`
      }
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }
}
```

### 3. Protect Sensitive Files

**Problem:** Prevent modifications to `.env`, config files, or production directories.

**Solution:** PreToolUse hook that checks file paths.

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

**protect-files.ts:**
```typescript
// .claude/hooks/protect-files.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

const PROTECTED = [".env", "credentials", "secrets", "production/", ".git/"]

for (const pattern of PROTECTED) {
  if (filePath.includes(pattern)) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: `Cannot modify protected file: ${filePath}`
      }
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }
}
```

### 4. Auto-Approve Safe Commands

**Problem:** Tired of approving `npm test` every time.

**Solution:** PermissionRequest hook that auto-approves safe commands.

```json
{
  "hooks": {
    "PermissionRequest": [
      {
        "matcher": "Bash(npm test*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '{\"decision\": \"allow\"}'"
          }
        ]
      },
      {
        "matcher": "Bash(npm run lint*)",
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

### 5. Inject Sprint Context

**Problem:** Claude doesn't know your current sprint priorities.

**Solution:** UserPromptSubmit hook that adds context.

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/inject-sprint-context.ts"
          }
        ]
      }
    ]
  }
}
```

**inject-sprint-context.ts:**
```typescript
// .claude/hooks/inject-sprint-context.ts
const sprintFile = Bun.file("./SPRINT.md")

if (await sprintFile.exists()) {
  const content = await sprintFile.text()
  console.log("## Current Sprint Context")
  console.log(content)
} else {
  console.log("No sprint file")
}
```

### 6. Session Startup Context

**Problem:** Claude doesn't know project status when starting.

**Solution:** SessionStart hook that provides initial context.

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

**session-start.ts:**
```typescript
// .claude/hooks/session-start.ts
const gitStatus = Bun.spawn(["git", "status", "--short"])
const statusOutput = await new Response(gitStatus.stdout).text()

const gitLog = Bun.spawn(["git", "log", "--oneline", "-5"])
const logOutput = await new Response(gitLog.stdout).text()

console.log("## Git Status")
console.log(statusOutput || "Working tree clean")
console.log("## Recent Commits")
console.log(logOutput)
```

### 7. Force Task Completion

**Problem:** Claude sometimes stops before fully completing tasks.

**Solution:** Stop hook that verifies completion.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Review the conversation and determine if ALL requested tasks are complete. Check for: 1) All code changes implemented, 2) Tests passing if requested, 3) No outstanding TODOs mentioned. Respond with JSON: {\"decision\": \"approve\"} if complete, or {\"decision\": \"block\", \"reason\": \"Incomplete: [specific missing items]\"} if not."
          }
        ]
      }
    ]
  }
}
```

### 8. Custom Notifications

**Problem:** You want desktop notifications when Claude needs input.

**Solution:** Stop hook that sends notifications.

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/notify.ts"
          }
        ]
      }
    ]
  }
}
```

**notify.ts:**
```typescript
// .claude/hooks/notify.ts
const isMac = process.platform === "darwin"

if (isMac) {
  Bun.spawn([
    "osascript", "-e",
    'display notification "Claude needs your attention" with title "Claude Code"'
  ])
} else {
  // Linux
  Bun.spawn(["notify-send", "Claude Code", "Awaiting your input"])
}
```

### 9. Logging and Auditing

**Problem:** You need to track all commands for compliance.

**Solution:** PostToolUse hook that logs everything.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/audit-log.ts"
          }
        ]
      }
    ]
  }
}
```

**audit-log.ts:**
```typescript
// .claude/hooks/audit-log.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PostToolUseHookInput

const logEntry = {
  timestamp: new Date().toISOString(),
  tool: input.tool_name,
  input: input.tool_input,
  session: input.session_id
}

const logFile = Bun.file("/tmp/claude-audit.log")
const existing = await logFile.exists() ? await logFile.text() : ""
await Bun.write(logFile, existing + JSON.stringify(logEntry) + "\n")
```

### 10. GitButler Integration

**Problem:** Multiple Claude sessions create chaotic git changes.

**Solution:** Hooks that integrate with GitButler for automatic branch isolation.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "but claude pre-tool"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "but claude post-tool"
          }
        ]
      }
    ]
  }
}
```

---

## Production-Ready Examples

### Complete Project Configuration

Here's a production-ready `.claude/settings.json`:

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
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/inject-context.ts"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/security-check.ts",
            "timeout": 5000
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/protect-files.ts",
            "timeout": 5000
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/format-file.ts",
            "timeout": 30000
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Bash(pnpm test*)",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/auto-allow.ts"
          }
        ]
      },
      {
        "matcher": "Bash(pnpm run build*)",
        "hooks": [
          {
            "type": "command",
            "command": "bun run .claude/hooks/auto-allow.ts"
          }
        ]
      }
    ]
  }
}
```

**auto-allow.ts:**
```typescript
// .claude/hooks/auto-allow.ts
console.log(JSON.stringify({ decision: "allow" }))
```

**format-file.ts:**
```typescript
// .claude/hooks/format-file.ts
import type { PostToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PostToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path

if (filePath) {
  await Bun.spawn(["prettier", "--write", filePath]).exited
}
```

### Universal User Configuration

For `~/.claude/settings.json` (applies to all projects):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bun run ~/.claude/hooks/global-security.ts"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bun run ~/.claude/hooks/notify.ts"
          }
        ]
      }
    ]
  }
}
```

**~/.claude/hooks/global-security.ts:**
```typescript
// ~/.claude/hooks/global-security.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const command = (input.tool_input as { command?: string }).command ?? ""

const BLOCKED = [
  { pattern: "rm -rf /", reason: "Blocked rm -rf / for safety" },
  { pattern: "rm -rf ~", reason: "Blocked rm -rf ~ for safety" },
  { pattern: "git push --force", reason: "Force push blocked - use with care" },
]

for (const { pattern, reason } of BLOCKED) {
  if (command.includes(pattern)) {
    const output: HookJSONOutput = {
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason
      }
    }
    console.log(JSON.stringify(output))
    process.exit(0)
  }
}
```

---

## Best Practices

### 1. Start Simple
Begin with one or two hooks and expand as needed. Don't try to automate everything at once.

### 2. Test in Safe Environments
Always test hooks in a sandbox before using them on important projects.

### 3. Use Specific Matchers
Target specific tools rather than broad patterns to maintain performance.

```json
// Good - specific
"matcher": "Write|Edit"

// Avoid - too broad unless necessary
"matcher": "*"
```

### 4. Set Appropriate Timeouts
Default timeout is 60 seconds. Adjust based on your hook's needs:

```json
{
  "type": "command",
  "command": "slow-linter.sh",
  "timeout": 120000
}
```

### 5. Handle Errors Gracefully
Make hooks fail gracefully when dependencies are missing:

```typescript
// Safe execution with fallback
try {
  await Bun.spawn(["prettier", "--write", filePath]).exited
} catch {
  // Prettier not installed, continue silently
}
```

### 6. Use Absolute Paths for Global Hooks
Avoid path issues by using absolute paths for user-level hooks:

```json
"command": "bun run ~/.claude/hooks/my-hook.ts"
```

Or relative paths for project-level hooks:

```json
"command": "bun run .claude/hooks/my-hook.ts"
```

### 7. Validate Inputs Safely
Always validate data from stdin:

```typescript
import type { PreToolUseHookInput } from "@anthropic-ai/claude-agent-sdk"

const input = await Bun.stdin.json() as PreToolUseHookInput
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

// Prevent path traversal
if (filePath.includes("..")) {
  console.error("Path traversal blocked")
  process.exit(2)
}
```

### 8. Keep Hooks Fast
Slow hooks degrade the experience. Optimize for speed:
- Use compiled languages for complex logic
- Cache results when possible
- Skip unnecessary work

### 9. Log for Debugging
Add logging to troubleshoot issues:

```typescript
// Add at the start of any hook for debugging
const logFile = Bun.file("/tmp/claude-hooks.log")
const existing = await logFile.exists() ? await logFile.text() : ""
await Bun.write(logFile, existing + `[${new Date().toISOString()}] Hook triggered\n`)
```

### 10. Organize Hook Scripts
Keep hooks organized:

```
.claude/
├── settings.json
├── settings.local.json
└── hooks/
    ├── package.json          # Bun project config
    ├── tsconfig.json         # TypeScript config (optional)
    ├── security-check.ts
    ├── protect-files.ts
    ├── format-file.ts
    └── audit-log.ts
```

---

## Security Considerations

### Hooks Run with Your Permissions

Hooks execute with your full user permissions. They can:
- Access all your files
- Use your credentials
- Make network requests
- Execute any command you can

### Review All Hooks

**Always review hooks before enabling them**, especially:
- Hooks from external sources
- Project-level hooks (someone could add malicious hooks to a repo)
- Hooks that access network or sensitive files

### Built-in Safeguards

Claude Code includes a safeguard: direct edits to hook configuration files require review in the `/hooks` menu before taking effect. This prevents malicious code from silently adding hooks.

### Best Security Practices

1. **Validate inputs**: Always sanitize data from stdin
2. **Use allowlists**: Prefer allowlisting safe operations over blocklisting dangerous ones
3. **Minimize permissions**: Run scripts with minimal required access
4. **Avoid secrets in hooks**: Don't hardcode credentials in hook scripts
5. **Review external hooks**: Be cautious with community hook scripts

### Example: Safe Input Handling

```typescript
// .claude/hooks/safe-input-example.ts
import type { PreToolUseHookInput, HookJSONOutput } from "@anthropic-ai/claude-agent-sdk"

// Safely parse JSON input
let input: PreToolUseHookInput
try {
  input = await Bun.stdin.json() as PreToolUseHookInput
} catch {
  console.error("Invalid JSON input")
  process.exit(1)
}

// Safely extract and validate paths
const filePath = (input.tool_input as { file_path?: string }).file_path ?? ""

// Prevent path traversal
if (filePath.includes("..") || filePath.startsWith("/etc") || filePath.startsWith("/var")) {
  const output: HookJSONOutput = {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Invalid file path - potential security risk"
    }
  }
  console.log(JSON.stringify(output))
  process.exit(0)
}

// For shell commands, use Bun.spawn with array args (no shell injection possible)
await Bun.spawn(["cat", filePath]).exited
```

---

## Troubleshooting

### Hook Not Firing

1. **Check matcher syntax**: Matchers are case-sensitive
2. **Verify file location**: Ensure settings file is in the right place
3. **Restart Claude Code**: Changes may require restart
4. **Test the hook directly**: Run it manually to verify it works

```bash
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}}' | bun run .claude/hooks/my-hook.ts
```

### Hook Timing Out

1. **Increase timeout**: Add `"timeout": 120000` for longer operations
2. **Optimize script**: Look for slow operations
3. **Add progress logging**: Track where time is spent

### Exit Code 2 Not Blocking

1. **Check stderr**: Error message must go to stderr, not stdout
2. **Verify exit code**: Ensure script exits with code 2
3. **Consider using JSON output**: More reliable than exit codes

```typescript
// Using exit code 2
console.error("Error message")  // stderr
process.exit(2)

// Better: Using JSON output (recommended)
const output: HookJSONOutput = {
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: "Error message"
  }
}
console.log(JSON.stringify(output))
```

### JSON Output Not Recognized

1. **Validate JSON**: Test your output with `JSON.parse()`
2. **Use stdout only**: JSON must go to stdout
3. **No extra output**: Don't mix JSON with other stdout content

```typescript
// Good - only JSON to stdout
console.log(JSON.stringify({ decision: "approve" }))

// Bad - mixed output
console.log("Processing...")
console.log(JSON.stringify({ decision: "approve" }))
```

### Debugging Tips

1. **Enable verbose logging in your hooks**
2. **Check `/tmp/claude-hooks.log`** (if you set up logging)
3. **Use the transcript**: Access via `transcript_path` in stdin
4. **Test hooks manually**: Run your script with sample input

```bash
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}}' | bun run .claude/hooks/my-hook.ts
```

---

## Resources

### Official Documentation
- [Claude Code Hooks Guide](https://code.claude.com/docs/en/hooks-guide) - Getting started guide
- [Hooks Reference](https://docs.claude.com/en/docs/claude-code/hooks) - Complete reference
- [How to Configure Hooks](https://claude.com/blog/how-to-configure-hooks) - Official blog post

### Community Resources
- [claude-code-hooks-mastery](https://github.com/disler/claude-code-hooks-mastery) - Comprehensive examples
- [claude-code-showcase](https://github.com/ChrisWiles/claude-code-showcase) - Production configuration
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Curated list

### Learning Articles
- [Production-Ready Hooks Guide](https://alirezarezvani.medium.com/the-production-ready-claude-code-hooks-guide-7-hooks-that-actually-matter-823587f9fc61)
- [Complete Guide to Hooks](https://www.eesel.ai/blog/hooks-in-claude-code)
- [Hooks for Automated Quality Checks](https://www.letanure.dev/blog/2025-08-06--claude-code-part-8-hooks-automated-quality-checks)

### Related Features
- [Understanding Skills, Commands, Subagents](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [GitButler Integration](https://docs.gitbutler.com/features/ai-integration/claude-code-hooks)

---

## Quick Reference Card

### Hook Events

| Event | When | Matchers? |
|-------|------|-----------|
| PreToolUse | Before tool runs | Yes |
| PostToolUse | After tool completes | Yes |
| PermissionRequest | Permission dialog | Yes |
| UserPromptSubmit | Prompt submitted | No |
| Stop | Claude finishes | No |
| SubagentStop | Subagent finishes | No |
| SessionStart | Session begins | No |
| PreCompact | Before compaction | No |

### Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| 0 | Success | Continue |
| 2 | Block | Stop action, feed error to Claude |
| Other | Warning | Continue with warning |

### JSON Decisions

```json
{"decision": "approve"}     // Allow action
{"decision": "block", "reason": "..."}  // Block with feedback
{"decision": "allow"}       // Grant permission
{"decision": "deny"}        // Deny permission
{"continue": true}          // Force continuation (Stop hooks)
{"updatedInput": {...}}     // Modify tool input (PreToolUse)
```

### File Locations

```
~/.claude/settings.json          # User-level (all projects)
.claude/settings.json            # Project-level (shared)
.claude/settings.local.json      # Project-level (personal)
```

---

*This guide was created based on official Claude Code documentation and community best practices. Last updated: January 2026.*
