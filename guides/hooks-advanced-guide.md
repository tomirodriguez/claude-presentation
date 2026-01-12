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

```bash
#!/bin/bash
# .claude/hooks/review-trigger.sh

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE" == *"/mutations/"* ]]; then
  echo "REVIEW REQUIRED: You modified a mutation file."
  echo "Before continuing, verify error handling according to Docs/error-handling.md"
  echo "Check: 1) Try/catch blocks 2) Error logging 3) User-facing messages"
elif [[ "$FILE" == *"/auth/"* ]]; then
  echo "REVIEW REQUIRED: You modified auth code."
  echo "Verify against Docs/authorization.md before proceeding."
fi
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
          "command": ".claude/hooks/review-trigger.sh"
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
```bash
# Hook reads queue status and prints next action
echo "Use the architect-review subagent on 'use-case-presets'."
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

```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")

# Add interactive flag to rm commands
if command.startswith("rm ") and "-i" not in command:
    safe_command = command.replace("rm ", "rm -i ", 1)
    print(json.dumps({
        "decision": "approve",
        "updatedInput": {"command": safe_command}
    }))
else:
    print(json.dumps({"decision": "approve"}))
```

#### 2. Redirect File Paths to Safe Directories

```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
file_path = data.get("tool_input", {}).get("file_path", "")

# Redirect production paths to staging
if "/production/" in file_path:
    safe_path = file_path.replace("/production/", "/staging/")
    print(json.dumps({
        "decision": "approve",
        "updatedInput": {"file_path": safe_path},
        "reason": f"Redirected to staging: {safe_path}"
    }))
    sys.exit(0)

print(json.dumps({"decision": "approve"}))
```

#### 3. Inject Environment Variables

```bash
#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Inject required env vars
MODIFIED="export NODE_ENV=development && $COMMAND"

echo "{\"decision\": \"approve\", \"updatedInput\": {\"command\": \"$MODIFIED\"}}"
```

#### 4. Auto-Inject Headers/Licenses

```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
content = data.get("tool_input", {}).get("content", "")
file_path = data.get("tool_input", {}).get("file_path", "")

LICENSE_HEADER = """/*
 * Copyright 2024 MyCompany
 * SPDX-License-Identifier: MIT
 */

"""

if file_path.endswith((".ts", ".js")) and "Copyright" not in content:
    print(json.dumps({
        "decision": "approve",
        "updatedInput": {"content": LICENSE_HEADER + content}
    }))
else:
    print(json.dumps({"decision": "approve"}))
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

```bash
#!/bin/bash
echo '{"decision": "block", "reason": "Before stopping, ask the user what they want to work on next using AskUserQuestion."}'
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

```bash
#!/bin/bash
# Access without parsing JSON
if [[ "$CLAUDE_TOOL_INPUT_FILE_PATH" == *".env"* ]]; then
  echo "Cannot modify .env files" >&2
  exit 2
fi
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

```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
transcript_path = data.get("transcript_path", "")

# Read conversation history
with open(transcript_path, 'r') as f:
    transcript = f.read()

# Check if user mentioned "production" earlier
if "production" in transcript.lower() and "deploy" in transcript.lower():
    print(json.dumps({
        "decision": "block",
        "reason": "Detected production deployment context. Please confirm before proceeding."
    }))
    sys.exit(0)

print(json.dumps({"decision": "approve"}))
```

#### 2. Semantic Backups Before Compaction

```bash
#!/bin/bash
# PreCompact hook - save important context
INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path')

# Extract key decisions before they're compacted
grep -E "(decided|agreed|confirmed|requirement)" "$TRANSCRIPT" > .claude/backups/decisions_$(date +%s).txt
```

#### 3. Conversation-Based Rate Limiting

```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
transcript_path = data.get("transcript_path", "")

with open(transcript_path, 'r') as f:
    content = f.read()

# Count tool uses in this session
edit_count = content.count('"tool_name": "Edit"')

if edit_count > 50:
    print(json.dumps({
        "decision": "block",
        "reason": f"Too many edits ({edit_count}). Review changes before continuing."
    }))
    sys.exit(0)

print(json.dumps({"decision": "approve"}))
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

```bash
# pre-edit.sh
echo $(date +%s) > /tmp/claude-edit-start

# post-edit.sh
START=$(cat /tmp/claude-edit-start)
NOW=$(date +%s)
DURATION=$((NOW - START))
echo "Edit took ${DURATION}s" >> /tmp/claude-metrics.log
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

```python
#!/usr/bin/env python3
import sys
import json
import time

RATE_FILE = "/tmp/mcp-api-calls"
LIMIT = 10  # calls per minute

# Read recent calls
try:
    with open(RATE_FILE, 'r') as f:
        calls = [float(t) for t in f.readlines()]
except FileNotFoundError:
    calls = []

# Filter to last minute
now = time.time()
recent = [t for t in calls if now - t < 60]

if len(recent) >= LIMIT:
    print(json.dumps({
        "decision": "block",
        "reason": f"Rate limit exceeded ({LIMIT}/min). Wait before making more API calls."
    }))
    sys.exit(0)

# Log this call
recent.append(now)
with open(RATE_FILE, 'w') as f:
    f.write('\n'.join(str(t) for t in recent))

print(json.dumps({"decision": "approve"}))
```

---

## Creative Real-World Hacks

### 1. Audio Notifications

```python
#!/usr/bin/env python3
# Stop hook - announce completion
import pyttsx3
engine = pyttsx3.init()
engine.say("Claude has finished the task")
engine.runAndWait()
```

### 2. Slack Integration

```bash
#!/bin/bash
# PostToolUse hook
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Claude completed: '"$CLAUDE_TOOL_INPUT_FILE_PATH"'"}' \
  $SLACK_WEBHOOK_URL
```

### 3. Smart Light Integration

```bash
#!/bin/bash
# Change light color based on hook type
if [ "$1" == "error" ]; then
  curl "http://hue-bridge/api/lights/1/state" -d '{"hue": 0}'  # Red
else
  curl "http://hue-bridge/api/lights/1/state" -d '{"hue": 25500}'  # Green
fi
```

### 4. Auto-Backup Before Edits

```bash
#!/bin/bash
# PreToolUse hook for Edit
FILE="$CLAUDE_TOOL_INPUT_FILE_PATH"
if [ -f "$FILE" ]; then
  cp "$FILE" "$FILE.claude-backup-$(date +%s)"
fi
```

### 5. Usage Analytics

```python
#!/usr/bin/env python3
import sys
import json
import csv
from datetime import datetime

data = json.load(sys.stdin)

with open('/tmp/claude-usage.csv', 'a', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        datetime.now().isoformat(),
        data.get('session_id'),
        data.get('tool_name'),
        data.get('tool_input', {}).get('file_path', '')
    ])
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
          "command": "./continue-loop.sh"
        }]
      }
    ]
  }
}
```

```bash
#!/bin/bash
# continue-loop.sh
ITERATIONS=$(cat /tmp/claude-iterations 2>/dev/null || echo 0)
MAX_ITERATIONS=10

if [ "$ITERATIONS" -lt "$MAX_ITERATIONS" ]; then
  echo $((ITERATIONS + 1)) > /tmp/claude-iterations
  echo '{"decision": "block", "reason": "Continue with the next task from the queue."}'
else
  echo '{"decision": "approve"}'
  rm /tmp/claude-iterations
fi
```

**Safety Critical**: Always set iteration limits to prevent runaway loops.

### Hard Stop Markers

Include escape hatches in your autonomous loops:

```bash
if grep -q "**HARD STOP**" "$TRANSCRIPT_PATH"; then
  echo '{"decision": "approve", "stopReason": "Hard stop requested"}'
  exit 0
fi
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

```python
#!/usr/bin/env python3
import sys
import json
import shlex

try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    print("Invalid JSON", file=sys.stderr)
    sys.exit(1)

file_path = data.get("tool_input", {}).get("file_path", "")

# Prevent path traversal
if ".." in file_path:
    print("Path traversal blocked", file=sys.stderr)
    sys.exit(2)

# Safe shell quoting
safe_path = shlex.quote(file_path)
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

## Type-Safe Hooks with Bun & TypeScript

Writing hooks in bash works but lacks structure. For complex hooks, use Bun + TypeScript with the official SDK for type safety and better DX.

### Setup

```bash
mkdir .claude/hooks && cd .claude/hooks
bun init
bun i @anthropic-ai/claude-agent-sdk
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
