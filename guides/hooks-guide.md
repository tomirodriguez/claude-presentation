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

```bash
#!/bin/bash
# block-sensitive-files.sh

FILE_PATH=$(echo "$CLAUDE_STDIN" | jq -r '.tool_input.file_path')

if [[ "$FILE_PATH" == *".env"* ]]; then
  echo "Cannot modify .env files - they contain secrets" >&2
  exit 2
fi

exit 0
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
            "command": "python3 ~/.claude/hooks/security-check.py"
          }
        ]
      }
    ]
  }
}
```

**security-check.py:**
```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
command = data.get("tool_input", {}).get("command", "")

BLOCKED_PATTERNS = [
    "rm -rf /",
    "rm -rf ~",
    "git push --force",
    "git reset --hard",
    "> /dev/sda",
]

for pattern in BLOCKED_PATTERNS:
    if pattern in command:
        print(f"Blocked dangerous command: {pattern}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
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
            "command": "python3 ~/.claude/hooks/protect-files.py"
          }
        ]
      }
    ]
  }
}
```

**protect-files.py:**
```python
#!/usr/bin/env python3
import sys
import json

data = json.load(sys.stdin)
file_path = data.get("tool_input", {}).get("file_path", "")

PROTECTED = [".env", "credentials", "secrets", "production/", ".git/"]

for pattern in PROTECTED:
    if pattern in file_path:
        print(f"Cannot modify protected file: {file_path}", file=sys.stderr)
        sys.exit(2)

sys.exit(0)
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
            "command": "echo '## Current Sprint Context' && cat ./SPRINT.md 2>/dev/null || echo 'No sprint file'"
          }
        ]
      }
    ]
  }
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
            "command": "echo '## Git Status' && git status --short && echo '## Recent Commits' && git log --oneline -5"
          }
        ]
      }
    ]
  }
}
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

**Solution:** Notification hook (or use Stop hook).

**macOS:**
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude needs your attention\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

**Linux:**
```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send 'Claude Code' 'Awaiting your input'"
          }
        ]
      }
    ]
  }
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
            "command": "python3 ~/.claude/hooks/audit-log.py"
          }
        ]
      }
    ]
  }
}
```

**audit-log.py:**
```python
#!/usr/bin/env python3
import sys
import json
from datetime import datetime

data = json.load(sys.stdin)
log_entry = {
    "timestamp": datetime.now().isoformat(),
    "tool": data.get("tool_name"),
    "input": data.get("tool_input"),
    "session": data.get("session_id")
}

with open("/tmp/claude-audit.log", "a") as f:
    f.write(json.dumps(log_entry) + "\n")
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
            "command": "echo '## Project Status' && git status --short && echo '## TODO' && head -20 TODO.md 2>/dev/null"
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "cat .claude/context/sprint.md 2>/dev/null || true"
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
            "command": "python3 .claude/hooks/security-check.py",
            "timeout": 5000
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "python3 .claude/hooks/protect-files.py",
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
            "command": ".claude/hooks/format-file.sh",
            "timeout": 30000
          }
        ]
      }
    ],
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
        "matcher": "Bash(npm run build*)",
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

### Universal User Configuration

For `~/.claude/settings.json` (applies to all projects):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash(rm -rf*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Blocked rm -rf for safety' >&2 && exit 2"
          }
        ]
      },
      {
        "matcher": "Bash(git push --force*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Force push blocked - use with care' >&2 && exit 2"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Task complete\" with title \"Claude Code\"' 2>/dev/null || notify-send 'Claude Code' 'Task complete' 2>/dev/null || true"
          }
        ]
      }
    ]
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

```bash
prettier --write "$FILE" 2>/dev/null || true
```

### 6. Use Absolute Paths for Scripts
Avoid path issues by using absolute paths:

```json
"command": "/Users/you/.claude/hooks/my-script.sh"
```

Or relative to common locations:

```json
"command": "python3 ~/.claude/hooks/check.py"
```

### 7. Quote Variables
Always quote shell variables to prevent injection:

```bash
# Good
prettier --write "$FILE_PATH"

# Bad - potential injection
prettier --write $FILE_PATH
```

### 8. Keep Hooks Fast
Slow hooks degrade the experience. Optimize for speed:
- Use compiled languages for complex logic
- Cache results when possible
- Skip unnecessary work

### 9. Log for Debugging
Add logging to troubleshoot issues:

```bash
#!/bin/bash
echo "[$(date)] Hook triggered: $@" >> /tmp/claude-hooks.log
# ... rest of script
```

### 10. Organize Hook Scripts
Keep hooks organized:

```
.claude/
├── settings.json
├── settings.local.json
└── hooks/
    ├── security-check.py
    ├── format-file.sh
    ├── protect-files.py
    └── audit-log.py
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

```python
#!/usr/bin/env python3
import sys
import json
import shlex

# Safely parse JSON input
try:
    data = json.load(sys.stdin)
except json.JSONDecodeError:
    print("Invalid JSON input", file=sys.stderr)
    sys.exit(1)

# Safely extract and validate paths
file_path = data.get("tool_input", {}).get("file_path", "")

# Prevent path traversal
if ".." in file_path or file_path.startswith("/"):
    print("Invalid file path", file=sys.stderr)
    sys.exit(2)

# Use shlex.quote for shell commands
safe_path = shlex.quote(file_path)
```

---

## Troubleshooting

### Hook Not Firing

1. **Check matcher syntax**: Matchers are case-sensitive
2. **Verify file location**: Ensure settings file is in the right place
3. **Restart Claude Code**: Changes may require restart
4. **Check permissions**: Hook scripts must be executable

```bash
chmod +x .claude/hooks/my-script.sh
```

### Hook Timing Out

1. **Increase timeout**: Add `"timeout": 120000` for longer operations
2. **Optimize script**: Look for slow operations
3. **Add progress logging**: Track where time is spent

### Exit Code 2 Not Blocking

1. **Check stderr**: Error message must go to stderr, not stdout
2. **Verify exit code**: Ensure script exits with code 2

```bash
echo "Error message" >&2  # stderr
exit 2
```

### JSON Output Not Recognized

1. **Validate JSON**: Use `jq` to verify format
2. **Use stdout only**: JSON must go to stdout
3. **No extra output**: Don't mix JSON with other stdout content

```bash
# Good
echo '{"decision": "approve"}'

# Bad - mixed output
echo "Processing..."
echo '{"decision": "approve"}'
```

### Debugging Tips

1. **Enable verbose logging in your hooks**
2. **Check `/tmp/claude-hooks.log`** (if you set up logging)
3. **Use the transcript**: Access via `transcript_path` in stdin
4. **Test hooks manually**: Run your script with sample input

```bash
echo '{"tool_name": "Write", "tool_input": {"file_path": "test.js"}}' | python3 my-hook.py
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
