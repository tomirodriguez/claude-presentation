# Hookify Plugin: Complete Guide

> Create custom hooks using markdown instead of JSON - the simple, no-code approach to behavioral guardrails in Claude Code.

---

## Table of Contents

1. [What is Hookify?](#what-is-hookify)
2. [Why Hookify vs JSON Hooks?](#why-hookify-vs-json-hooks)
3. [Commands Reference](#commands-reference)
4. [Rule File Structure](#rule-file-structure)
5. [Configuration Fields](#configuration-fields)
6. [Event Types](#event-types)
7. [Pattern Syntax](#pattern-syntax)
8. [Operators Reference](#operators-reference)
9. [Field Reference for Each Event Type](#field-reference-for-each-event-type)
10. [Practical Examples](#practical-examples)
11. [Managing Rules](#managing-rules)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

---

## What is Hookify?

Hookify is an official Claude Code plugin that enables you to create custom behavioral guardrails without writing any code. Instead of complex JSON configuration files, you write simple markdown files with YAML frontmatter to define rules that:

- **Detect patterns** in commands, file edits, and prompts
- **Warn** you about potentially problematic actions
- **Block** dangerous operations before they execute
- **Enforce workflows** like requiring tests before stopping

### Key Features

- **Conversation Analysis**: Automatically detect behaviors you have corrected or been frustrated by
- **Markdown Configuration**: Simple, readable rule files anyone can understand
- **Regex Pattern Matching**: Powerful matching with Python regex syntax
- **Instant Activation**: Rules take effect immediately without restarting Claude Code
- **Easy Management**: Enable, disable, or delete rules with simple commands

### How It Works

1. You describe unwanted behavior (or let Hookify analyze your conversation)
2. Hookify creates a markdown rule file in your `.claude/` directory
3. The rule matches against tool usage in real-time
4. When a match occurs, Hookify warns you or blocks the action

---

## Why Hookify vs JSON Hooks?

Claude Code supports native JSON hooks, but Hookify offers significant advantages for most users:

| Aspect | JSON Hooks | Hookify |
|--------|-----------|---------|
| **Syntax** | Complex JSON structure | Simple YAML + Markdown |
| **Readability** | Technical, hard to scan | Human-friendly |
| **Creation** | Manual file editing | Natural language or auto-analysis |
| **Messages** | Embedded in JSON | Rich markdown formatting |
| **Learning Curve** | Steep | Gentle |
| **Maintenance** | Error-prone | Easy to modify |

### When to Use Hookify

- You want quick, simple rules without learning JSON hook syntax
- You prefer describing rules in plain English
- You want Claude to analyze your conversation and suggest rules
- You need readable rule files your team can understand

### When to Use JSON Hooks

- You need programmatic hook logic beyond pattern matching
- You are integrating with external systems
- You require maximum performance for many complex rules

---

## Commands Reference

Hookify provides several slash commands for creating and managing rules.

### `/hookify [instructions]` - Create from Description

Provide explicit instructions to create a rule:

```
/hookify Warn me when I use rm -rf commands
```

```
/hookify Don't use console.log in TypeScript files
```

```
/hookify Block any command that modifies /etc
```

The command analyzes your instructions and creates an appropriate rule file in `.claude/hookify.*.local.md`.

### `/hookify` (no arguments) - Analyze Conversation

Run without arguments to have Hookify analyze your recent conversation:

```
/hookify
```

The conversation-analyzer agent will:

1. **Scan for frustration signals** - Look for phrases like "Don't use X", "Stop doing Y", or "That's not what I meant"
2. **Identify tool patterns** - Find which Bash commands or file edits caused issues
3. **Extract regex patterns** - Convert behaviors into matchable patterns
4. **Categorize by severity** - Rate issues as high (dangerous), medium (style), or low (preference)
5. **Suggest rules** - Present findings and ask which rules to create

This is particularly useful after a session where Claude made repeated mistakes you had to correct.

### `/hookify:list` - List All Rules

Display all Hookify rules in your project:

```
/hookify:list
```

Output shows each rule's name, enabled status, event type, pattern, and action.

### `/hookify:configure` - Enable/Disable Rules

Interactive interface for managing rule states:

```
/hookify:configure
```

Toggle rules on or off without editing files directly.

### `/hookify:help` - Get Help

Display help information about Hookify commands and usage:

```
/hookify:help
```

---

## Rule File Structure

Hookify rules are stored as markdown files with a specific format and location.

### File Location

All rule files must be placed in your project's `.claude/` directory with the naming pattern:

```
.claude/hookify.<rule-name>.local.md
```

Examples:
- `.claude/hookify.dangerous-rm.local.md`
- `.claude/hookify.warn-console-log.local.md`
- `.claude/hookify.require-tests.local.md`

The `.local.md` extension indicates these are local configuration files that should typically be in `.gitignore` (unless you want to share rules with your team).

### YAML Frontmatter Format

Every rule file starts with YAML frontmatter enclosed in `---` delimiters:

```yaml
---
name: my-rule-name
enabled: true
event: bash
pattern: dangerous-pattern
action: warn
---
```

### Markdown Message Body

After the frontmatter, write the message that appears when the rule triggers:

```markdown
---
name: block-dangerous-rm
enabled: true
event: bash
pattern: rm\s+-rf
action: block
---

**Dangerous rm command detected!**

This command could delete important files. Please:
- Verify the path is correct
- Consider using a safer approach
- Make sure you have backups
```

The markdown body supports full formatting including:
- **Bold** and *italic* text
- Bullet lists and numbered lists
- Code blocks
- Links
- Headers (though typically not needed in short messages)

---

## Configuration Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique identifier for the rule (lowercase, hyphens allowed) |
| `enabled` | boolean | Whether the rule is active (`true` or `false`) |
| `event` | string | Event type to match: `bash`, `file`, `stop`, `prompt`, or `all` |
| `action` | string | Response type: `warn` or `block` |

### Pattern vs Conditions

Rules use **either** a simple `pattern` field **or** an advanced `conditions` array - not both.

#### Simple Pattern

Use for straightforward single-pattern matching:

```yaml
---
name: warn-console-log
enabled: true
event: file
pattern: console\.log\(
action: warn
---
```

The `pattern` field contains a Python regex that matches against the primary field for that event type (e.g., `command` for bash, `new_text` for file edits).

#### Advanced Conditions

Use for complex matching with multiple criteria:

```yaml
---
name: api-key-in-typescript
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: (API_KEY|SECRET|TOKEN)\s*=\s*["']
---
```

**Important**: All conditions must match for the rule to trigger (logical AND).

Each condition requires:
- `field`: The field to match against (see [Field Reference](#field-reference-for-each-event-type))
- `operator`: How to match (see [Operators Reference](#operators-reference))
- `pattern`: The value or regex to match

### Action Types

| Action | Behavior |
|--------|----------|
| `warn` | Shows the message but allows the operation to proceed (default) |
| `block` | Prevents the operation from executing (PreToolUse) or stops the session (Stop events) |

---

## Event Types

Hookify can intercept five different event types:

| Event | Trigger | Use Case |
|-------|---------|----------|
| `bash` | Bash tool commands | Block dangerous shell commands |
| `file` | Edit, Write, MultiEdit tools | Warn about debug code, protect files |
| `stop` | When Claude wants to stop | Enforce completion checks |
| `prompt` | User prompt submission | Input validation |
| `all` | All of the above | Broad pattern detection |

### `bash` Event

Triggers when Claude executes shell commands via the Bash tool.

```yaml
---
name: block-dangerous-ops
enabled: true
event: bash
pattern: rm\s+-rf|dd\s+if=|mkfs|format
action: block
---
```

### `file` Event

Triggers when Claude edits or creates files using Edit, Write, or MultiEdit tools.

```yaml
---
name: warn-debug-code
enabled: true
event: file
pattern: console\.log\(|debugger;|print\(
action: warn
---
```

### `stop` Event

Triggers when Claude attempts to end the conversation or mark a task as complete.

```yaml
---
name: require-tests-run
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: npm test|pytest|cargo test
---
```

### `prompt` Event

Triggers on user prompt submission (before Claude processes it).

```yaml
---
name: detect-urgent-requests
enabled: true
event: prompt
pattern: (urgent|asap|immediately)
action: warn
---
```

### `all` Event

Triggers on all event types. Use sparingly as it can impact performance.

```yaml
---
name: general-safety-check
enabled: true
event: all
pattern: password|secret|credential
action: warn
---
```

---

## Pattern Syntax

Hookify uses Python regex syntax for pattern matching. Here are essential patterns:

### Basic Patterns

| Pattern | Matches | Example Input |
|---------|---------|---------------|
| `rm` | Literal text "rm" | `rm file.txt` |
| `rm\s+-rf` | rm followed by whitespace and -rf | `rm -rf /tmp` |
| `console\.log\(` | console.log( (escaped dot) | `console.log("hi")` |
| `\.env$` | Files ending in .env | `.env`, `.env.local` |

### Character Classes

| Pattern | Meaning |
|---------|---------|
| `\s` | Any whitespace (space, tab, newline) |
| `\d` | Any digit (0-9) |
| `\w` | Word character (a-z, A-Z, 0-9, _) |
| `.` | Any character except newline |
| `\.` | Literal dot (escaped) |

### Quantifiers

| Pattern | Meaning |
|---------|---------|
| `*` | Zero or more |
| `+` | One or more |
| `?` | Zero or one |
| `{3}` | Exactly 3 |
| `{2,5}` | Between 2 and 5 |

### Alternation and Grouping

| Pattern | Matches | Example |
|---------|---------|---------|
| `(foo\|bar)` | foo OR bar | `foo`, `bar` |
| `(eval\|exec)\(` | eval( or exec( | `eval("x")` |
| `chmod\s+(777\|666)` | chmod 777 or chmod 666 | `chmod 777 file` |

### Anchors

| Pattern | Meaning |
|---------|---------|
| `^` | Start of string |
| `$` | End of string |
| `^#!/bin/bash` | Starts with shebang |
| `\.py$` | Ends with .py |

### Common Regex Examples

```python
# Dangerous rm commands
rm\s+-rf

# Console logging
console\.log\(

# Eval or exec calls
(eval|exec)\(

# Environment files
\.env$|\.env\.

# Hardcoded secrets
(API_KEY|SECRET|TOKEN)\s*=\s*["']

# Chmod 777
chmod\s+777

# Sudo commands
sudo\s+

# Python print statements
print\s*\(

# Debugger statements
debugger;

# innerHTML (XSS risk)
innerHTML\s*=
```

### Testing Your Patterns

Test regex patterns in Python before adding to rules:

```bash
python3 -c "import re; print(re.search(r'rm\s+-rf', 'rm -rf /tmp'))"
```

---

## Operators Reference

When using advanced `conditions`, specify how each condition matches:

| Operator | Description | Example Use |
|----------|-------------|-------------|
| `regex_match` | Pattern matches anywhere in field (most common) | Detect patterns like `console\.log` |
| `contains` | Field contains the literal string | Check for presence of "TODO" |
| `equals` | Field exactly equals the string | Match specific filename |
| `not_contains` | Field does NOT contain the string | Ensure tests were run |
| `starts_with` | Field starts with the string | Match file paths |
| `ends_with` | Field ends with the string | Match file extensions |

### Operator Examples

```yaml
# Regex match - pattern found anywhere
conditions:
  - field: command
    operator: regex_match
    pattern: rm\s+-rf

# Contains - literal substring
conditions:
  - field: new_text
    operator: contains
    pattern: TODO

# Equals - exact match
conditions:
  - field: file_path
    operator: equals
    pattern: /etc/passwd

# Not contains - absence check
conditions:
  - field: transcript
    operator: not_contains
    pattern: npm test

# Starts with - prefix match
conditions:
  - field: file_path
    operator: starts_with
    pattern: /etc/

# Ends with - suffix match
conditions:
  - field: file_path
    operator: ends_with
    pattern: .env
```

---

## Field Reference for Each Event Type

Different event types expose different fields for matching.

### Bash Event Fields

| Field | Description | Example Value |
|-------|-------------|---------------|
| `command` | The complete bash command string | `rm -rf /tmp/test` |

**Note**: When using simple `pattern` (not `conditions`), the pattern matches against `command` by default.

### File Event Fields

| Field | Description | Event Types |
|-------|-------------|-------------|
| `file_path` | Path to file being edited | Edit, Write, MultiEdit |
| `new_text` | New content being added | Edit, Write |
| `old_text` | Content being replaced | Edit only |
| `content` | Complete file content | Write only |

**Note**: When using simple `pattern` (not `conditions`), the pattern matches against `new_text` by default.

### Prompt Event Fields

| Field | Description |
|-------|-------------|
| `user_prompt` | The user's submitted prompt text |

### Stop Event Fields

| Field | Description |
|-------|-------------|
| `transcript` | The complete conversation transcript |

**Note**: Stop events are useful for enforcing that certain actions occurred during the session.

### Examples by Event Type

**Bash - matching command**:
```yaml
conditions:
  - field: command
    operator: regex_match
    pattern: sudo\s+rm
```

**File - matching path AND content**:
```yaml
conditions:
  - field: file_path
    operator: ends_with
    pattern: .tsx
  - field: new_text
    operator: contains
    pattern: console.log
```

**Stop - checking transcript**:
```yaml
conditions:
  - field: transcript
    operator: not_contains
    pattern: pytest
```

---

## Practical Examples

### Example 1: Block Dangerous Commands

**File**: `.claude/hookify.block-dangerous-ops.local.md`

```yaml
---
name: block-dangerous-ops
enabled: true
event: bash
pattern: rm\s+-rf|dd\s+if=|mkfs|format
action: block
---

**Destructive operation detected!**

This command can cause irreversible data loss. Operation blocked for safety.

Please:
- Verify the exact path is correct
- Consider using a safer alternative
- Ensure you have backups before proceeding

If you're certain, ask me to help you with a safer approach.
```

### Example 2: Warn About Debug Code

**File**: `.claude/hookify.warn-debug-code.local.md`

```yaml
---
name: warn-debug-code
enabled: true
event: file
pattern: console\.log\(|debugger;|print\(
action: warn
---

**Debug code detected**

I'm adding debugging statements to this file. Remember to:
- Remove these before committing to main
- Consider using a proper logging library
- Check if this is test code (where debug statements may be acceptable)
```

### Example 3: Require Tests Before Stopping

**File**: `.claude/hookify.require-tests.local.md`

```yaml
---
name: require-tests-run
enabled: true
event: stop
action: block
conditions:
  - field: transcript
    operator: not_contains
    pattern: npm test|pytest|cargo test|go test
---

**Tests not detected!**

Before completing this task, please run the test suite to verify changes work correctly.

Supported test commands:
- `npm test` for JavaScript/TypeScript
- `pytest` for Python
- `cargo test` for Rust
- `go test` for Go
```

### Example 4: API Key Detection

**File**: `.claude/hookify.api-key-detection.local.md`

```yaml
---
name: api-key-in-source
enabled: true
event: file
action: block
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.(js|ts|tsx|py|go|rs)$
  - field: new_text
    operator: regex_match
    pattern: (API_KEY|SECRET_KEY|ACCESS_TOKEN|PRIVATE_KEY)\s*[=:]\s*["'][A-Za-z0-9_-]{20,}["']
---

**Hardcoded credential detected!**

This appears to be a hardcoded API key or secret. This is blocked because:
- Secrets in source code can be exposed in version control
- They're difficult to rotate when compromised
- They may leak through logs or error messages

**Instead, use:**
- Environment variables: `process.env.API_KEY`
- Secret management tools: AWS Secrets Manager, HashiCorp Vault
- `.env` files (with `.env` in `.gitignore`)
```

### Example 5: Protect Sensitive Files

**File**: `.claude/hookify.protect-sensitive-files.local.md`

```yaml
---
name: warn-sensitive-files
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$|\.env\.|credentials|secrets|\.pem$|\.key$
---

**Sensitive file edit detected!**

This file may contain secrets or credentials. Please ensure:

- [ ] No hardcoded credentials are being added
- [ ] The file is listed in `.gitignore`
- [ ] Changes won't be committed to version control
- [ ] A secrets management solution is being used
```

### Example 6: Enforce TypeScript Best Practices

**File**: `.claude/hookify.typescript-practices.local.md`

```yaml
---
name: warn-any-type
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: :\s*any\b|\bas\s+any\b
---

**TypeScript `any` type detected**

Using `any` defeats TypeScript's type checking. Consider:
- Using a more specific type
- Creating an interface or type alias
- Using `unknown` if the type is truly unknown
- Using generics for flexible typing
```

### Example 7: Warn About Large File Edits

**File**: `.claude/hookify.warn-node-modules.local.md`

```yaml
---
name: warn-generated-files
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: node_modules/|dist/|build/|\.min\.js$|vendor/
---

**Generated/vendor file edit detected!**

This appears to be a generated or third-party file. Editing it directly:
- Will be overwritten on next build/install
- May cause version control conflicts
- Could introduce subtle bugs

Consider editing the source file instead.
```

---

## Managing Rules

### Viewing All Rules

List all Hookify rules in your project:

```
/hookify:list
```

### Enabling/Disabling Rules

**Method 1: Edit the file**

Open the rule file and change `enabled: true` to `enabled: false`:

```yaml
---
name: warn-console-log
enabled: false  # Changed from true
event: file
pattern: console\.log\(
action: warn
---
```

**Method 2: Use the configure command**

```
/hookify:configure
```

This provides an interactive interface to toggle rules.

### Deleting Rules

Simply delete the rule file:

```bash
rm .claude/hookify.my-rule.local.md
```

### Sharing Rules with Your Team

By default, `.local.md` files are typically in `.gitignore`. To share rules:

1. Remove the `.local` part of the filename:
   ```
   .claude/hookify.team-rule.md
   ```

2. Commit the file to version control

3. Team members will have the rule active automatically

### Temporarily Disabling All Rules

Set `enabled: false` in each rule, or move rule files to a backup directory:

```bash
mkdir -p .claude/hookify-backup
mv .claude/hookify.*.local.md .claude/hookify-backup/
```

---

## Best Practices

### 1. Start with Warnings, Then Block

Begin with `action: warn` to understand how often a rule triggers before switching to `action: block`:

```yaml
action: warn  # Start here
# action: block  # Switch after verifying it works correctly
```

### 2. Use Specific Patterns

Avoid overly broad patterns that cause false positives:

```yaml
# Too broad - matches any file with "test" in path
pattern: test

# Better - matches only test file extensions
pattern: \.(test|spec)\.(ts|js)$
```

### 3. Keep Patterns Simple

Complex regex can slow down hook execution:

```yaml
# Simple and fast
pattern: console\.log\(

# Avoid overly complex patterns
# pattern: (?:console\.(?:log|warn|error|info|debug))\s*\(\s*(?:["'`].*?["'`]|[^)]+)\s*\)
```

### 4. Use Specific Event Types

Prefer specific event types over `all`:

```yaml
# Good - only triggers on bash commands
event: bash

# Avoid - triggers on everything, impacts performance
event: all
```

### 5. Write Helpful Messages

Include actionable guidance in your markdown messages:

```markdown
**Issue detected**

What happened: [brief explanation]

How to fix:
- Option 1: [specific action]
- Option 2: [alternative approach]

Why this matters: [context]
```

### 6. Test Patterns Before Deploying

Use Python to verify your regex works:

```bash
python3 -c "import re; print(bool(re.search(r'your-pattern', 'test-string')))"
```

### 7. Document Your Rules

Add comments in the markdown body explaining why the rule exists:

```markdown
---
name: block-force-push
enabled: true
event: bash
pattern: git\s+push\s+.*--force
action: block
---

**Force push blocked!**

<!-- Rule added after incident on 2024-01-15 where main branch was overwritten -->

Force pushing can overwrite team members' work. Please:
- Use `--force-with-lease` instead
- Coordinate with the team before force pushing
```

### 8. Review Rules Periodically

Schedule time to review your rules:
- Remove obsolete rules
- Update patterns that cause false positives
- Adjust severity (warn vs block) based on experience

---

## Troubleshooting

### Rule Not Triggering

**Check 1: File location**
Ensure the rule file is in the `.claude/` directory at your project root:
```bash
ls -la .claude/hookify.*.local.md
```

**Check 2: Enabled status**
Verify `enabled: true` in the frontmatter:
```yaml
enabled: true  # Not "false" or missing
```

**Check 3: Event type**
Confirm the event type matches what you're testing:
- Testing a bash command? Use `event: bash`
- Testing a file edit? Use `event: file`

**Check 4: Pattern syntax**
Test your regex pattern:
```bash
python3 -c "import re; print(re.search(r'your-pattern', 'test-input'))"
```

**Check 5: List loaded rules**
```
/hookify:list
```
Verify your rule appears in the list.

### Pattern Not Matching

**Issue: Special characters not escaped**
```yaml
# Wrong - dot matches any character
pattern: console.log

# Right - dot is escaped to match literal dot
pattern: console\.log
```

**Issue: Whitespace handling**
```yaml
# Wrong - requires exactly one space
pattern: rm -rf

# Right - matches any whitespace
pattern: rm\s+-rf
```

**Issue: Case sensitivity**
Regex is case-sensitive by default:
```yaml
# Only matches lowercase
pattern: todo

# Matches any case
pattern: [Tt][Oo][Dd][Oo]
# Or use: (?i)todo
```

### Rule Triggers Too Often (False Positives)

**Solution 1: Make pattern more specific**
```yaml
# Too broad - matches comments mentioning rm
pattern: rm

# Better - matches actual rm command
pattern: ^rm\s+|;\s*rm\s+|\|\s*rm\s+
```

**Solution 2: Add conditions to filter**
```yaml
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: regex_match
    pattern: console\.log
```

### Hook Seems Slow

**Solution 1: Use specific event types**
```yaml
event: bash  # Instead of "all"
```

**Solution 2: Simplify patterns**
Avoid complex regex with many alternations or nested groups.

**Solution 3: Reduce active rules**
Disable rules you don't actively need:
```
/hookify:configure
```

### Import Errors

**Check Python version**
Hookify requires Python 3.7+:
```bash
python3 --version
```

**Check plugin installation**
Verify Hookify is properly installed as a Claude Code plugin.

### YAML Parsing Errors

**Common issues:**

1. **Missing quotes around patterns with special characters:**
```yaml
# May cause issues
pattern: [a-z]+

# Safer
pattern: "[a-z]+"
```

2. **Incorrect indentation:**
```yaml
# Wrong
conditions:
- field: command
  operator: regex_match

# Right
conditions:
  - field: command
    operator: regex_match
```

3. **Tabs instead of spaces:**
YAML requires spaces for indentation, not tabs.

### Getting Help

If you're still stuck:

1. Run `/hookify:help` for built-in documentation
2. Check the [official repository](https://github.com/anthropics/claude-code/tree/main/plugins/hookify)
3. Review example rules in the `examples/` directory

---

## Quick Reference Card

### File Naming
```
.claude/hookify.<rule-name>.local.md
```

### Minimal Rule Template
```yaml
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
pattern: your-regex-pattern
action: warn|block
---

Your message here with **markdown** support.
```

### Advanced Rule Template
```yaml
---
name: rule-name
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.tsx?$
  - field: new_text
    operator: contains
    pattern: TODO
---

Your message here.
```

### Common Patterns
| Purpose | Pattern |
|---------|---------|
| rm -rf | `rm\s+-rf` |
| console.log | `console\.log\(` |
| .env files | `\.env$` |
| Hardcoded secrets | `(API_KEY\|SECRET)\s*=\s*["']` |
| chmod 777 | `chmod\s+777` |
| sudo commands | `sudo\s+` |
| eval() calls | `eval\(` |

### Commands
| Command | Purpose |
|---------|---------|
| `/hookify [text]` | Create rule from description |
| `/hookify` | Analyze conversation |
| `/hookify:list` | List all rules |
| `/hookify:configure` | Toggle rules |
| `/hookify:help` | Get help |

---

*This guide is based on the official Hookify plugin from the [Anthropic Claude Code repository](https://github.com/anthropics/claude-code/tree/main/plugins/hookify).*
