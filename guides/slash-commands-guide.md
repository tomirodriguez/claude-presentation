# Claude Code Slash Commands: The Complete Guide

> From Beginner to Expert - Everything You Need to Master Slash Commands

## Table of Contents

1. [What Are Slash Commands?](#what-are-slash-commands)
2. [Built-in Slash Commands](#built-in-slash-commands)
3. [Creating Custom Slash Commands](#creating-custom-slash-commands)
4. [Slash Commands vs Other Features](#slash-commands-vs-other-features)
5. [Best Use Cases & Examples](#best-use-cases--examples)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Community Resources](#community-resources)

---

## What Are Slash Commands?

Slash commands are **shortcuts that start with `/`** that you type directly in Claude Code to perform specific actions. They fall into two categories:

1. **Built-in commands**: Pre-defined commands like `/help`, `/clear`, `/compact`
2. **Custom commands**: User-defined commands stored as Markdown files

### When Should You Use Them?

Use slash commands when you:

- Have **repetitive workflows** you want to automate
- Need quick access to **frequently used prompts**
- Want to **share standardized workflows** with your team
- Need to manage **context and conversation state**
- Want to enforce **consistent processes** across projects

### How to Discover Available Commands

Type `/` anywhere in your input to see all available commands with autocomplete. You can also run `/help` to see the complete list.

---

## Built-in Slash Commands

### Essential Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/help` | Shows all available commands | When you need to discover commands |
| `/clear` | Wipes conversation history completely | Starting a new task, conversation went off track |
| `/compact` | Compresses context by summarizing | Running low on context mid-task |
| `/config` | Opens configuration settings | Adjusting Claude Code settings |
| `/hooks` | Interactive hook configuration | Setting up automation triggers |
| `/model` | Change the AI model | Switching between models |
| `/cost` | Shows token usage and costs | Monitoring API spending |
| `/status` | Shows current session status | Checking session state |

### `/clear` vs `/compact`: When to Use Each

This is one of the most important decisions for context management:

#### Use `/clear` when:
- Starting a completely **new, unrelated task**
- The conversation has gone **too far off track**
- You want a **completely fresh start**
- Switching between **distinct projects or features**

```
Tip: Use /clear often! Every time you start something new,
clear the chat. You don't need old history eating your tokens.
```

#### Use `/compact` when:
- You're **mid-task** but running out of context
- You need to **preserve important context** from the conversation
- You've reached a **natural breakpoint** (feature complete, bug fixed)
- You want to **control what gets summarized**

```bash
# Compact with specific focus
/compact Focus on preserving our authentication implementation decisions
```

### Pro Technique: Document & Clear

For large tasks spanning multiple sessions:

1. Have Claude dump its plan/progress into a `.md` file
2. Run `/clear` to reset the state
3. Start new session by telling Claude to read the `.md` and continue

This gives you durable, external "memory" for complex tasks.

---

## Creating Custom Slash Commands

Custom slash commands let you save frequently used prompts as Markdown files.

### File Locations

| Location | Scope | Use Case |
|----------|-------|----------|
| `.claude/commands/` | Project-specific | Team-shared workflows, project standards |
| `~/.claude/commands/` | Personal (global) | Your personal productivity shortcuts |

### Basic Structure

Create a Markdown file where:
- **Filename** = Command name (e.g., `review.md` → `/review`)
- **Content** = The prompt Claude will execute

### Your First Custom Command

**Step 1:** Create the directory structure

```bash
mkdir -p .claude/commands
```

**Step 2:** Create a command file

```bash
# .claude/commands/review.md
Review the current changes for:
- Code quality and readability
- Security vulnerabilities
- Performance issues
- Test coverage

Provide specific, actionable feedback.
```

**Step 3:** Use it

```
/review
```

That's it! The command is immediately available.

---

## Slash Commands vs Other Features

Claude Code offers multiple customization options. Here's how to choose:

### Comparison Table

| Feature | Trigger | Best For | Complexity |
|---------|---------|----------|------------|
| **Slash Commands** | User types `/command` | Quick, repeatable manual tasks | Simple |
| **Skills** | Claude auto-invokes when relevant | Complex workflows, conditional logic | Medium-High |
| **CLAUDE.md** | Auto-loaded at session start | Project context, coding standards | Simple |
| **Hooks** | Auto-triggered by events | Quality gates, automatic enforcement | Medium |
| **MCP Tools** | Auto-discovered from servers | External integrations | High |
| **Subagents** | Claude spawns for complex tasks | Specialized domain work | High |
| **Plugins** | Installed from marketplace | Pre-packaged extensions | Varies |

### Decision Flowchart

```
Do you need to trigger this manually?
├─ YES → Do you repeat it often?
│        ├─ YES → Slash Command
│        └─ NO → Just type the prompt
│
└─ NO → Should Claude decide when to use it?
         ├─ YES → Should it work across Claude.ai/Desktop too?
         │        ├─ YES → Skill
         │        └─ NO → Skill or Subagent
         │
         └─ NO → Should it run automatically on events?
                  ├─ YES → Hook
                  └─ NO → CLAUDE.md (for persistent context)
```

### Key Differences: Slash Commands vs Skills

| Aspect | Slash Commands | Skills |
|--------|---------------|--------|
| **Who triggers** | You (manually) | Claude (automatically) |
| **Structure** | Single `.md` file | Directory with multiple files |
| **Best for** | Atomic, predictable shortcuts | Complex multi-step workflows |
| **Cross-platform** | Claude Code only | Works in Claude.ai, Desktop, and Code |
| **Scripts** | Limited (via frontmatter) | Can bundle full scripts |

**Rule of thumb:**
- **Slash Commands** = "I want to do X right now"
- **Skills** = "Claude should know how to do X when needed"

---

## Best Use Cases & Examples

### 1. Git Workflow Automation

**`/commit` - Smart Git Commits**

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*), Bash(git diff:*)
argument-hint: [commit message]
description: Create a smart git commit
---

## Current State
- Status: !`git status`
- Changes: !`git diff --staged`

## Task
If no message provided, analyze the changes and write an appropriate commit message.
If message provided: $ARGUMENTS

Before committing, verify:
1. No temporary/debug code is included
2. No sensitive data is being committed
3. Changes are logically grouped
```

**`/pr` - Pull Request Creation**

```markdown
---
allowed-tools: Bash(git:*), Bash(gh:*)
description: Create a pull request with summary
---

## Context
- Branch: !`git branch --show-current`
- Commits: !`git log main..HEAD --oneline`
- Diff: !`git diff main...HEAD`

## Task
1. Push current branch if needed
2. Create a PR with:
   - Clear title summarizing the change
   - Description with what/why/how
   - Link any related issues
```

### 2. Code Review & Quality

**`/review` - Comprehensive Code Review**

```markdown
---
allowed-tools: Read, Grep, Glob, Bash(git diff:*)
description: Comprehensive code review
---

## Changes to Review
!`git diff --name-only HEAD~1`

## Detailed Diff
!`git diff HEAD~1`

## Review Checklist
1. **Code Quality**: Readability, maintainability, DRY principles
2. **Security**: Input validation, injection risks, exposed secrets
3. **Performance**: N+1 queries, memory leaks, unnecessary computation
4. **Testing**: Coverage, edge cases, mocking strategy
5. **Documentation**: Comments where needed, updated README

Provide feedback organized by priority (Critical → High → Medium → Low).
```

**`/security` - Security Audit**

```markdown
---
allowed-tools: Read, Grep, Glob
description: Run security vulnerability scan
---

Analyze the codebase for:
- SQL injection vulnerabilities
- XSS attack vectors
- Exposed credentials or API keys
- Insecure dependencies
- OWASP Top 10 issues

Flag severity levels and provide remediation steps.
```

### 3. Testing & Debugging

**`/test` - Smart Test Runner**

```markdown
---
allowed-tools: Bash, Read, Edit
argument-hint: [test pattern]
description: Run and fix failing tests
---

## Task
1. Detect the test framework (Jest, pytest, vitest, etc.)
2. Run tests matching: $ARGUMENTS (or all tests if empty)
3. If tests fail:
   - Analyze the failure
   - Propose and implement fixes
   - Re-run to verify
4. Report final results
```

**`/debug` - Debug Investigation**

```markdown
---
argument-hint: [error message or symptom]
description: Debug an issue systematically
---

Investigate: $ARGUMENTS

## Approach
1. Reproduce the issue
2. Identify the root cause using logs, stack traces, code analysis
3. Propose fix options with trade-offs
4. Implement the chosen fix
5. Verify the fix works
```

### 4. Documentation & Refactoring

**`/explain` - Code Explanation**

```markdown
---
argument-hint: [file or function name]
description: Explain code in detail
---

Explain $ARGUMENTS at multiple levels:
1. **High-level**: What does it do and why?
2. **Flow**: Step-by-step walkthrough
3. **Key decisions**: Why was it built this way?
4. **Gotchas**: Potential issues or non-obvious behavior
```

**`/refactor` - Smart Refactoring**

```markdown
---
argument-hint: [file path]
description: Refactor code for better quality
---

Refactor: $ARGUMENTS

Focus on:
- Improving readability
- Reducing complexity
- Applying SOLID principles
- Maintaining backward compatibility

Show before/after comparisons and explain each change.
```

### 5. Context Recovery

**`/catchup` - Restore Working Context**

```markdown
---
description: Catch up on current work in progress
---

Read all uncommitted changes and understand the current state:

!`git status`
!`git diff`

Summarize:
1. What's currently being worked on
2. What's completed vs in-progress
3. What likely needs to happen next
```

### 6. Project-Specific Workflows

**`/deploy` - Deployment Checklist**

```markdown
---
allowed-tools: Bash, Read
description: Pre-deployment checklist
---

## Pre-Deployment Verification
1. Check all tests pass: !`npm test`
2. Check build succeeds: !`npm run build`
3. Check for uncommitted changes: !`git status`
4. Verify environment config
5. Review recent changes for breaking issues

Report deployment readiness with any blockers.
```

---

## Advanced Features

### Frontmatter Options

Control command behavior with YAML frontmatter:

```markdown
---
description: Brief description shown in autocomplete
allowed-tools: Bash(git:*), Read, Edit
argument-hint: [required-arg] [optional-arg]
model: claude-3-5-haiku-20241022
disable-model-invocation: true
---
```

| Option | Purpose | Example |
|--------|---------|---------|
| `description` | Shown in `/help` and autocomplete | `"Create git commit"` |
| `allowed-tools` | Restrict which tools Claude can use | `"Read, Grep, Glob"` |
| `argument-hint` | Show expected arguments | `"[branch-name]"` |
| `model` | Use a specific model | `"claude-3-5-haiku-20241022"` |
| `disable-model-invocation` | Prevent Claude from auto-invoking | `true` |

### Using Arguments

#### Single Argument

```markdown
---
argument-hint: [filename]
---
Analyze the file: $ARGUMENTS
```

Usage: `/analyze src/auth.ts`

#### Positional Arguments

```markdown
---
argument-hint: [issue-number] [priority]
---
Fix issue #$1 with priority $2.
```

Usage: `/fix-issue 123 high`

### Embedding Dynamic Content

#### Bash Output with `!`

```markdown
## Current Git Status
!`git status`

## Recent Commits
!`git log --oneline -5`
```

The `!` prefix executes the command and embeds the output.

#### File Contents with `@`

```markdown
Review these configuration files:
- @package.json
- @tsconfig.json
- @.env.example

Check for security issues and misconfigurations.
```

The `@` prefix reads and embeds the file content.

### Hooks Integration

Commands can define hooks for event-driven behavior:

```markdown
---
description: Safe commit workflow
hooks:
  PreToolUse:
    - matcher: "Bash"
      script: "./scripts/validate-commit.sh"
---
Create a git commit with proper validation.
```

### Organizing with Namespaces

Structure commands in subdirectories:

```
.claude/commands/
├── git/
│   ├── commit.md      → /git/commit
│   ├── pr.md          → /git/pr
│   └── release.md     → /git/release
├── test/
│   ├── unit.md        → /test/unit
│   └── e2e.md         → /test/e2e
└── review.md          → /review
```

---

## Best Practices

### 1. Context Management

```
Use /clear often. Every time you start something new, clear the chat.
Don't trust auto-compaction alone.
```

- Use `/clear` between unrelated tasks
- Use `/compact` at natural breakpoints with specific focus instructions
- Use the "Document & Clear" pattern for multi-session work

### 2. Command Design

- **Keep commands focused**: One command = one job
- **Use descriptive names**: `/review-security` > `/rs`
- **Add helpful descriptions**: Future you will thank you
- **Include argument hints**: Make commands self-documenting

### 3. Model Selection

```markdown
---
model: claude-3-5-haiku-20241022
---
```

- Use **Haiku** for simple, fast tasks (lint checks, simple formatting)
- Use **Sonnet** for standard development work
- Use **Opus** for complex reasoning and architecture decisions

### 4. Tool Restrictions

Restrict tools for security-sensitive commands:

```markdown
---
allowed-tools: Read, Grep, Glob
---
# No Bash, no edits - safe for auditing
```

### 5. Team Standardization

- Store project commands in `.claude/commands/` and commit to git
- Document custom commands in your README
- Use consistent naming conventions across projects

### 6. Version Control Integration

Keep your `.claude/commands/` directory in git:

```bash
git add .claude/commands/
git commit -m "Add team slash commands for code review and deployment"
```

---

## Troubleshooting

### Command Not Appearing

1. Check file location: `.claude/commands/` or `~/.claude/commands/`
2. Verify `.md` extension
3. Check for YAML syntax errors in frontmatter
4. Restart Claude Code session

### Command Not Working as Expected

1. Test the embedded bash commands manually
2. Check file paths in `@` references
3. Verify tool permissions in `allowed-tools`
4. Review argument placeholder usage (`$ARGUMENTS`, `$1`, `$2`)

### Frontmatter Errors

```yaml
# Wrong - missing quotes around special characters
allowed-tools: Bash(git:*)

# Right - quote if needed
allowed-tools: "Bash(git:*)"
```

---

## Community Resources

### Official Documentation
- [Claude Code Slash Commands](https://code.claude.com/docs/en/slash-commands)
- [SDK Slash Commands](https://platform.claude.com/docs/en/agent-sdk/slash-commands)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

### Community Collections
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Curated commands, workflows, and CLAUDE.md files
- [wshobson/commands](https://github.com/wshobson/commands) - Production-ready slash commands collection

### Tutorials & Guides
- [How I use Claude Code](https://www.builder.io/blog/claude-code) - Real-world tips
- [Claude Code Tips: Custom Slash Commands](https://cloudartisan.com/posts/2025-04-14-claude-code-tips-slash-commands/)
- [Cooking with Claude Code](https://www.siddharthbharath.com/claude-code-the-complete-guide/) - Complete guide

---

## Quick Reference Cheat Sheet

```
# Built-in Commands
/help          - Show all commands
/clear         - Fresh start (wipes history)
/compact       - Compress context (preserves key info)
/config        - Settings
/model         - Switch models
/cost          - Token usage

# Command Locations
.claude/commands/     - Project commands (commit to git)
~/.claude/commands/   - Personal commands (global)

# Frontmatter Options
---
description: "What the command does"
allowed-tools: Read, Edit, Bash(git:*)
argument-hint: [arg1] [arg2]
model: claude-3-5-haiku-20241022
---

# Dynamic Content
!`command`    - Embed bash output
@file.txt     - Embed file contents
$ARGUMENTS    - All user arguments
$1, $2        - Positional arguments
```

---

## Summary

Slash commands are your **productivity multipliers** in Claude Code. Start simple:

1. **Learn the built-ins**: Master `/clear` and `/compact` first
2. **Create your first command**: Start with a simple `/review` or `/commit`
3. **Iterate**: Add frontmatter options as needed
4. **Share**: Commit project commands to git for your team

Remember: The goal isn't to create the most complex commands—it's to **remove friction** from your daily workflows.

---

*Last updated: January 2026*
*Based on official Claude Code documentation and community best practices*
