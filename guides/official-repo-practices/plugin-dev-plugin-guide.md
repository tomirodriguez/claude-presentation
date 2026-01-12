# Plugin Dev: The Complete Toolkit for Creating Claude Code Plugins

> **Source**: [Anthropic Claude Code Repository - Plugin Dev](https://github.com/anthropics/claude-code/tree/main/plugins/plugin-dev)
> **Version**: 0.1.0
> **Author**: Daisy Hollman (daisy@anthropic.com)
> **License**: MIT

---

## Table of Contents

1. [What is Plugin Dev?](#1-what-is-plugin-dev)
2. [The 7 Core Skills](#2-the-7-core-skills)
3. [The /plugin-dev:create-plugin Command](#3-the-plugin-devcreate-plugin-command)
4. [Plugin Structure](#4-plugin-structure)
5. [Creating Different Component Types](#5-creating-different-component-types)
6. [Utility Scripts Available](#6-utility-scripts-available)
7. [Best Practices for Plugin Development](#7-best-practices-for-plugin-development)
8. [Security Considerations](#8-security-considerations)
9. [Testing Your Plugin](#9-testing-your-plugin)
10. [Distribution Options](#10-distribution-options)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What is Plugin Dev?

**Plugin Dev** is the official, comprehensive toolkit from Anthropic for developing Claude Code plugins. It provides expert guidance, working examples, utility scripts, and AI-assisted agents to help you create professional-grade plugins that extend Claude Code's functionality.

### Key Features

- **7 Specialized Skills**: Each covering a core aspect of plugin development
- **Progressive Disclosure**: Information organized in three levels to minimize context overhead
- **Working Examples**: 12+ production-ready examples across all component types
- **Utility Scripts**: 6 production-ready scripts for validation and testing
- **AI-Assisted Agents**: 3 specialized agents for creating and validating plugins
- **Comprehensive Workflow**: An 8-phase guided process for creating plugins from scratch

### What You Can Build

With Plugin Dev, you can create plugins that include:

- **Slash Commands**: User-initiated actions triggered with `/command-name`
- **Agents**: Autonomous subprocesses that handle specialized tasks
- **Skills**: Auto-activating capabilities that provide domain knowledge
- **Hooks**: Event handlers that intercept and modify Claude's behavior
- **MCP Integrations**: Connections to external services and APIs

### Installation

```bash
# Install from the marketplace
/plugin install plugin-dev@claude-code-marketplace

# Or for development, run Claude with the plugin directory
cc --plugin-dir /path/to/plugin-dev
```

---

## 2. The 7 Core Skills

Plugin Dev organizes knowledge into seven specialized skills, each focusing on a critical aspect of plugin development. These skills use **progressive disclosure** with three levels:

1. **Metadata** (~100 words, always loaded): Concise descriptions with strong triggers
2. **Core SKILL.md** (loaded when triggered): Essential reference (1,500-2,000 words)
3. **References/Examples** (loaded as needed): Detailed guides and working code

### 2.1 Hook Development

**Triggers**: "create a hook", "add a PreToolUse hook", "validate tool use", "block dangerous commands"

Hooks allow you to intercept events during Claude Code's execution lifecycle. They enable validation, policy enforcement, context loading, and workflow automation.

#### Supported Hook Events

| Event | Description | Use Case |
|-------|-------------|----------|
| `PreToolUse` | Before a tool is executed | Validate tool calls, block dangerous commands |
| `PostToolUse` | After a tool completes | React to results, log actions |
| `Stop` | When session stops | Enforce completion standards |
| `SubagentStop` | When a subagent stops | Validate subagent work |
| `SessionStart` | When session begins | Load project context |
| `SessionEnd` | When session ends | Cleanup, save state |
| `UserPromptSubmit` | When user submits prompt | Filter or augment user input |
| `PreCompact` | Before context compaction | Preserve important information |
| `Notification` | System notifications | React to status changes |

#### Hook Types

**Prompt-based hooks** (recommended for flexibility):
```json
{
  "type": "prompt",
  "prompt": "Evaluate if this tool use is appropriate: $TOOL_INPUT",
  "timeout": 30
}
```

**Command hooks** (for deterministic checks):
```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate-bash.sh",
  "timeout": 60
}
```

#### Resources Included
- 3 example hook scripts
- 3 reference documents
- 3 utility scripts (validate-hook-schema.sh, test-hook.sh, hook-linter.sh)

---

### 2.2 MCP Integration

**Triggers**: "add MCP server", "integrate MCP", "configure .mcp.json", "connect external service"

MCP (Model Context Protocol) integration allows your plugin to connect to external services and APIs.

#### Server Types

| Type | Best For | Key Features |
|------|----------|--------------|
| **stdio** | Local tools, custom servers, NPM packages | Lowest latency, runs locally |
| **SSE** | Cloud services with OAuth | Automatic token refresh, browser OAuth flow |
| **HTTP** | REST APIs | Stateless, token-based auth |
| **WebSocket** | Real-time updates | Persistent bidirectional communication |

#### Configuration Approach

**Recommended**: Use a dedicated `.mcp.json` file at the plugin root:

```json
{
  "mcpServers": {
    "my-database": {
      "type": "stdio",
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/servers/db-server.js"],
      "env": {
        "DB_CONNECTION": "${DB_CONNECTION_STRING}"
      }
    }
  }
}
```

**Alternative**: Embed in `plugin.json` for simpler single-server setups.

#### Best Practices
- Use `${CLAUDE_PLUGIN_ROOT}` for all file paths
- Store credentials in environment variables, never hardcode
- Use HTTPS/WSS exclusively; avoid unencrypted connections
- Pre-allow specific MCP tools in commands rather than wildcards

---

### 2.3 Plugin Structure

**Triggers**: "plugin structure", "plugin.json manifest", "auto-discovery", "component organization"

This skill teaches the standardized directory layout and manifest format for Claude Code plugins.

#### Standard Directory Layout

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          # Required: Plugin manifest
├── commands/                 # Slash commands (auto-discovered)
│   ├── build.md
│   └── deploy.md
├── agents/                   # Autonomous agents (auto-discovered)
│   └── code-reviewer.md
├── skills/                   # Auto-activating skills
│   └── my-skill/
│       └── SKILL.md
├── hooks/
│   └── hooks.json           # Hook configurations
├── .mcp.json                # MCP server configurations (optional)
└── README.md                # Plugin documentation
```

#### Key Principle

> **"The `plugin.json` manifest MUST be in `.claude-plugin/` directory"**

Components (commands, agents, skills, hooks) are placed at the plugin root and auto-discovered by Claude Code.

---

### 2.4 Plugin Settings

**Triggers**: "plugin settings", "store plugin configuration", ".local.md files", "per-project settings"

Plugin settings enable per-project configuration through `.claude/plugin-name.local.md` files.

#### Structure

Settings files combine YAML frontmatter with markdown content:

```markdown
---
auto_review: true
test_coverage_threshold: 80
excluded_paths:
  - node_modules
  - dist
---

## Additional Instructions

Focus on security vulnerabilities during code review.
```

#### Reading Settings in Hooks/Commands

```bash
SETTINGS_FILE="${CLAUDE_PROJECT_DIR}/.claude/my-plugin.local.md"

if [[ -f "$SETTINGS_FILE" ]]; then
  # Extract frontmatter
  FRONTMATTER=$(sed -n '/^---$/,/^---$/p' "$SETTINGS_FILE" | sed '1d;$d')

  # Parse individual fields
  AUTO_REVIEW=$(echo "$FRONTMATTER" | grep '^auto_review:' | sed 's/auto_review: *//')
fi
```

#### Best Practices
- Use `.local.md` suffix to indicate user-local files
- Add `.claude/*.local.md` to `.gitignore`
- Provide sensible defaults when settings do not exist
- Document that Claude Code requires restart after file changes

---

### 2.5 Command Development

**Triggers**: "create a slash command", "command frontmatter", "define command arguments"

Commands are reusable Markdown-based prompts that users invoke with `/plugin-name:command-name`.

#### Critical Principle

> **"Commands are written for agent consumption, not human consumption."**

You are instructing Claude what to do, not messaging the user.

#### Command Structure

```markdown
---
description: Run linting checks on the codebase
allowed-tools: Bash(eslint:*), Read
model: inherit
argument-hint: <file-path>
---

Analyze the specified file or the entire codebase for linting issues.

If an argument is provided, lint only that file:
- File to lint: $1

Use ESLint with the project configuration. Report all warnings and errors.
```

#### YAML Frontmatter Fields

| Field | Description |
|-------|-------------|
| `description` | Brief explanation shown in `/help` |
| `allowed-tools` | Restricts tool access (e.g., `Bash(git:*)`) |
| `model` | Specifies which Claude model to use |
| `argument-hint` | Documents expected arguments |

#### Dynamic Features

- **Arguments**: Use `$ARGUMENTS` for all args or `$1`, `$2` for positional
- **File references**: Prefix with `@` to include file contents (e.g., `@$1`)
- **Bash execution**: Use backticks to gather context dynamically

---

### 2.6 Agent Development

**Triggers**: "create an agent", "write a subagent", "agent frontmatter", "autonomous agent"

Agents are autonomous subprocesses that handle specialized tasks independently.

#### Key Distinction

> **"Agents are FOR autonomous work, commands are FOR user-initiated actions."**

#### Agent Structure

```markdown
---
name: code-reviewer
description: |
  Use this agent when reviewing code changes. Examples:
  <example>
    <context>User has made changes to authentication logic</context>
    <user-request>Review my changes</user-request>
    <commentary>Code review agent handles security-sensitive reviews</commentary>
  </example>
model: inherit
color: blue
allowed-tools: Read, Grep, Glob
---

You are a code review specialist. Your responsibilities include:

1. **Security Analysis**: Check for vulnerabilities
2. **Code Quality**: Assess maintainability and clarity
3. **Best Practices**: Verify adherence to coding standards

## Process

1. Read the changed files
2. Analyze for issues
3. Provide actionable feedback

## Output Format

Organize findings by severity: Critical, Major, Minor.
```

#### Required Frontmatter Fields

| Field | Description |
|-------|-------------|
| `name` | Identifier (lowercase letters, numbers, hyphens, 3-50 chars) |
| `description` | Triggering conditions with 2-4 example scenarios |
| `model` | Usually `inherit`, or specify `sonnet`, `opus`, `haiku` |
| `color` | Visual identifier (`blue`, `cyan`, `green`, `yellow`, `magenta`, `red`) |

#### System Prompt Guidelines
- Address the agent in second person: "You are [role]..."
- Keep between 500-3,000 characters
- Structure with clear sections: responsibilities, process, standards, output format

---

### 2.7 Skill Development

**Triggers**: "create a skill", "write a new skill", "improve skill description"

Skills are modular packages that extend Claude's capabilities through auto-activating knowledge.

#### Skill Structure

```
my-skill/
├── SKILL.md              # Required: Core skill content
├── references/           # Optional: Detailed documentation
├── examples/             # Optional: Working code samples
└── scripts/              # Optional: Utility scripts
```

#### SKILL.md Structure

```markdown
---
description: |
  This skill should be used when the user asks to optimize database queries,
  improve query performance, or analyze slow database operations.
---

# Database Query Optimization

## Core Principles

1. Index appropriately
2. Avoid N+1 queries
3. Use query analysis tools

## Optimization Patterns

[Detailed patterns and techniques...]
```

#### Progressive Disclosure

Keep SKILL.md lean (1,500-2,000 words ideally). Move detailed patterns, API documentation, and advanced techniques to reference files.

#### Writing Requirements
- Use imperative/infinitive form in the body
- Use third person in the description frontmatter
- Include specific trigger phrases users would naturally say

---

## 3. The /plugin-dev:create-plugin Command

The `/plugin-dev:create-plugin` command provides a comprehensive, end-to-end workflow for creating plugins from scratch.

### Usage

```bash
/plugin-dev:create-plugin
/plugin-dev:create-plugin A plugin for managing database migrations
```

### The 8-Phase Workflow

#### Phase 1: Discovery
**Goal**: Clarify plugin purpose and target users

- What problem does this plugin solve?
- Who are the target users?
- What is the scope of functionality?

**User confirmation required before proceeding**

---

#### Phase 2: Component Planning
**Goal**: Determine what components are needed

- Skills (what knowledge should auto-activate?)
- Commands (what user-initiated actions?)
- Agents (what autonomous work?)
- Hooks (what events to intercept?)
- MCP (what external services?)
- Settings (what configuration needed?)

**User confirmation required before proceeding**

---

#### Phase 3: Detailed Design
**Goal**: Resolve all ambiguities before coding

- Ask clarifying questions about each component
- Define exact triggering conditions
- Specify input/output formats
- Plan component interactions

**User confirmation required before proceeding**

---

#### Phase 4: Plugin Structure
**Goal**: Create directory layout and manifest

- Create `.claude-plugin/plugin.json`
- Set up component directories
- Configure auto-discovery paths

---

#### Phase 5: Component Implementation
**Goal**: Build each component following best practices

For each component type, the workflow:
1. Loads the relevant skill (hook-development, command-development, etc.)
2. Uses specialized agents (agent-creator) when appropriate
3. Follows established patterns from plugin-dev's own implementation

---

#### Phase 6: Validation and Quality Check
**Goal**: Run validation and fix issues

- Run plugin-validator agent
- Check manifest structure
- Validate component files
- Review security considerations

**User confirmation required before proceeding**

---

#### Phase 7: Testing and Verification
**Goal**: Test plugin functionality in Claude Code

- Load the plugin
- Test each component
- Verify expected behavior
- Check edge cases

**User confirmation required before proceeding**

---

#### Phase 8: Documentation and Next Steps
**Goal**: Finalize README and prepare for distribution

- Complete README with usage examples
- Document configuration requirements
- List dependencies
- Prepare for publication

---

## 4. Plugin Structure

### Minimal Plugin

The simplest possible plugin has just two elements:

```
minimal-plugin/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    └── hello.md
```

**plugin.json** (minimal):
```json
{
  "name": "minimal-plugin"
}
```

### Standard Plugin

A production-ready plugin with multiple components:

```
standard-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── lint.md
│   ├── test.md
│   └── review.md
├── agents/
│   ├── code-reviewer.md
│   └── test-generator.md
├── skills/
│   ├── code-standards/
│   │   ├── SKILL.md
│   │   └── examples/
│   └── testing-patterns/
│       ├── SKILL.md
│       └── references/
├── hooks/
│   └── hooks.json
├── .mcp.json
└── README.md
```

### Advanced/Enterprise Plugin

A sophisticated plugin for large-scale operations:

```
enterprise-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── ci/
│   │   ├── deploy.md
│   │   └── rollback.md
│   ├── monitoring/
│   │   ├── status.md
│   │   └── alerts.md
│   └── admin/
│       └── configure.md
├── agents/
│   └── deployment-orchestrator.md
├── skills/
│   └── infrastructure/
│       ├── SKILL.md
│       ├── references/
│       ├── examples/
│       └── scripts/
├── hooks/
│   └── hooks.json
├── servers/              # MCP server implementations
│   ├── k8s-server/
│   ├── terraform-server/
│   └── github-actions-server/
├── lib/                  # Shared utilities
│   ├── core/
│   ├── integrations/
│   └── utils/
├── .mcp.json
└── README.md
```

### The plugin.json Manifest

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "A comprehensive plugin for code quality management",
  "author": {
    "name": "Your Name",
    "email": "you@example.com",
    "url": "https://yoursite.com"
  },
  "homepage": "https://github.com/you/my-plugin",
  "repository": "https://github.com/you/my-plugin.git",
  "license": "MIT",
  "keywords": ["code-quality", "linting", "testing", "review"]
}
```

#### Required Fields

| Field | Format | Description |
|-------|--------|-------------|
| `name` | kebab-case | Unique identifier; must start with a letter |

#### Optional Fields

| Field | Format | Description |
|-------|--------|-------------|
| `version` | semver | e.g., "1.0.0"; defaults to "0.1.0" |
| `description` | string | 50-200 characters; focus on what, not how |
| `author` | object | name, email, url |
| `homepage` | URL | Documentation link |
| `repository` | URL | Source code location |
| `license` | SPDX ID | e.g., "MIT", "Apache-2.0" |
| `keywords` | array | 5-10 tags for discovery |

#### Naming Validation

Names must match: `/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/`

Valid: `my-plugin`, `code-review`, `db-tools`
Invalid: `MyPlugin`, `my_plugin`, `1st-plugin`

---

## 5. Creating Different Component Types

### Commands

**Location**: `commands/` directory
**Format**: Markdown files with YAML frontmatter

```markdown
---
description: Generate a commit message for staged changes
allowed-tools: Bash(git:*)
argument-hint: [--emoji]
---

Analyze the staged changes and generate an appropriate commit message.

Steps:
1. Run `git diff --staged` to see the changes
2. Analyze the nature of the changes
3. Generate a conventional commit message

If $ARGUMENTS contains --emoji, include an appropriate emoji prefix.
```

#### Organization

- **Small teams**: Flat structure
- **15+ commands**: Use namespaced subdirectories (`git/`, `docs/`, `ci/`)
- **Naming**: verb-noun pattern (`review-pr`, `fix-issue`)

---

### Agents

**Location**: `agents/` directory
**Format**: Markdown files with YAML frontmatter

```markdown
---
name: security-auditor
description: |
  Use this agent when performing security reviews. Examples:
  <example>
    <context>New authentication code added</context>
    <user-request>Check this for security issues</user-request>
    <commentary>Security agent handles vulnerability detection</commentary>
  </example>
model: inherit
color: red
allowed-tools: Read, Grep, Glob, Bash(npm audit:*)
---

You are a security specialist focused on identifying vulnerabilities.

## Responsibilities

1. Identify security vulnerabilities
2. Check for common attack vectors
3. Verify input validation
4. Review authentication and authorization

## Process

1. Scan for sensitive patterns (credentials, tokens)
2. Check dependency vulnerabilities
3. Review code for injection risks
4. Assess access control logic

## Output Format

Organize findings by severity:
- **Critical**: Immediate action required
- **High**: Address before release
- **Medium**: Address in next sprint
- **Low**: Track for future improvement
```

---

### Skills

**Location**: `skills/[skill-name]/` directories
**Required file**: `SKILL.md`

```markdown
---
description: |
  This skill should be used when the user asks about API design,
  REST conventions, endpoint structure, or HTTP status codes.
---

# API Design Patterns

## RESTful Conventions

### Resource Naming
- Use nouns, not verbs: `/users` not `/getUsers`
- Use plural forms: `/items` not `/item`
- Nest for relationships: `/users/{id}/orders`

### HTTP Methods
- GET: Retrieve resources
- POST: Create resources
- PUT: Replace resources
- PATCH: Partial updates
- DELETE: Remove resources

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Additional Resources

See `references/openapi-patterns.md` for detailed OpenAPI specifications.
See `examples/` for complete API implementations.
```

---

### Hooks

**Location**: `hooks/hooks.json`
**Format**: JSON configuration

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate-bash.sh",
          "timeout": 30
        }
      ]
    }
  ],
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Before completing, verify all tests pass and code is formatted.",
          "timeout": 60
        }
      ]
    }
  ],
  "SessionStart": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/load-context.sh"
        }
      ]
    }
  ]
}
```

---

## 6. Utility Scripts Available

Plugin Dev includes production-ready utility scripts in the hook-development skill:

### validate-hook-schema.sh

Validates `hooks.json` structure and configuration:

```bash
./validate-hook-schema.sh hooks/hooks.json
```

**Checks performed**:
- Valid JSON syntax
- Valid event types
- Required fields (matcher, hooks, type)
- Type-specific requirements (command or prompt fields)
- Timeout ranges (5-600 seconds)
- Hardcoded path warnings

**Output**:
- Exit 0: All checks passed
- Warnings: Non-blocking issues
- Errors: Validation failures

---

### test-hook.sh

Tests hooks with sample input:

```bash
# Basic test
./test-hook.sh validate-bash.sh test-input.json

# Verbose with timeout
./test-hook.sh -v -t 30 validate-write.sh write-input.json

# Generate sample input
./test-hook.sh --create-sample PreToolUse
```

**Options**:
- `-h, --help`: Show help
- `-v, --verbose`: Detailed output
- `-t, --timeout N`: Set timeout (default: 60s)
- `--create-sample <event>`: Generate sample input

**Exit codes**:
- 0: Hook approved/succeeded
- 2: Hook blocked/denied
- 124: Hook timed out

---

### hook-linter.sh

Lints hook scripts for best practices:

```bash
./hook-linter.sh my-hook.sh
```

**Checks performed** (13 total):
1. Executable permission
2. Shebang presence (`#!/bin/bash`)
3. Safety settings (`set -euo pipefail`)
4. Input reading method
5. JSON parsing with `jq`
6. Variable quoting (injection prevention)
7. Hardcoded path detection
8. Plugin root usage
9. Exit code presence
10. Decision hook output format
11. Long-running command warnings
12. Error handling (stderr redirection)
13. Input validation

---

## 7. Best Practices for Plugin Development

### Portability

**Always use `${CLAUDE_PLUGIN_ROOT}` for file paths**:

```bash
# Correct
"${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"

# Incorrect
"/home/user/plugins/my-plugin/scripts/validate.sh"
"./scripts/validate.sh"
"~/plugins/my-plugin/scripts/validate.sh"
```

### Naming Conventions

- **Files**: kebab-case (`my-command.md`, `hook-linter.sh`)
- **Directories**: kebab-case (`my-skill/`, `mcp-integration/`)
- **Plugin names**: kebab-case, start with letter

### Component Design

- **Commands**: Single responsibility, verb-noun naming
- **Agents**: Clear triggering conditions, 2-4 examples
- **Skills**: Lean core content, details in references
- **Hooks**: Fast execution, proper error handling

### Documentation

- Include a comprehensive README
- Document all environment variables
- Provide usage examples
- List dependencies and requirements

---

## 8. Security Considerations

### Credential Management

```bash
# Correct: Environment variables
"env": {
  "API_KEY": "${MY_API_KEY}"
}

# Incorrect: Hardcoded
"env": {
  "API_KEY": "sk-abc123..."
}
```

### Network Security

- Use HTTPS/WSS exclusively
- Never use unencrypted HTTP/WS
- Validate SSL certificates

### Hook Security

```bash
#!/bin/bash
set -euo pipefail

# Validate input before processing
INPUT=$(cat)
if [[ -z "$INPUT" ]]; then
  echo "Error: Empty input" >&2
  exit 1
fi

# Parse safely with jq
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
if [[ -z "$TOOL_NAME" ]]; then
  echo "Error: Missing tool_name" >&2
  exit 1
fi
```

### Tool Access

- Pre-allow only specific MCP tools in commands
- Avoid wildcards in `allowed-tools`
- Use principle of least privilege

---

## 9. Testing Your Plugin

### Manual Testing

1. Load your plugin:
   ```bash
   cc --plugin-dir /path/to/my-plugin
   ```

2. Test commands:
   ```bash
   /my-plugin:my-command
   ```

3. Verify agent triggering by describing relevant tasks

4. Check hook execution with `claude --debug`

### Using Plugin Dev's Test Utilities

```bash
# Validate hooks configuration
./validate-hook-schema.sh hooks/hooks.json

# Test individual hooks
./test-hook.sh scripts/validate-bash.sh test-input.json

# Lint hook scripts
./hook-linter.sh scripts/*.sh
```

### Validation Checklist

Run the plugin-validator agent:
- Manifest structure and fields
- Directory organization
- Component file validation
- Security assessment
- File organization review

---

## 10. Distribution Options

### Local Development

```bash
cc --plugin-dir /path/to/my-plugin
```

### Team Sharing

1. Host in a shared repository
2. Team members clone and use `--plugin-dir`

### Claude Code Marketplace

```bash
/plugin publish my-plugin
```

Requirements:
- Valid `plugin.json` with all metadata
- Comprehensive README
- License file
- Passing validation checks

### Private Registry

Configure a private registry for enterprise distribution.

---

## 11. Troubleshooting

### Plugin Not Loading

1. **Check manifest location**: Must be `.claude-plugin/plugin.json`
2. **Validate JSON syntax**: Use `jq . .claude-plugin/plugin.json`
3. **Check name format**: Must be kebab-case, start with letter

### Commands Not Appearing

1. **Check directory**: Must be in `commands/`
2. **Verify file extension**: Must be `.md`
3. **Check frontmatter**: Must have valid YAML between `---` markers

### Hooks Not Executing

1. **Validate hooks.json**: Run `validate-hook-schema.sh`
2. **Check executable permissions**: `chmod +x script.sh`
3. **Use debug mode**: `claude --debug`
4. **Check paths**: Use `${CLAUDE_PLUGIN_ROOT}`

### Agent Not Triggering

1. **Review description**: Must include specific trigger phrases
2. **Check examples**: Must include 2-4 realistic scenarios
3. **Verify frontmatter**: All required fields present

### MCP Server Issues

1. **Check server type**: Match type to server implementation
2. **Verify credentials**: Environment variables set correctly
3. **Test connectivity**: Server accessible and responding
4. **Check logs**: MCP server logs for errors

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Plugin not found" | Wrong manifest location | Move to `.claude-plugin/plugin.json` |
| "Invalid name" | Bad naming format | Use kebab-case, start with letter |
| "Hook timeout" | Script too slow | Optimize or increase timeout |
| "Permission denied" | Script not executable | `chmod +x script.sh` |
| "MCP connection failed" | Server not running | Start server, check config |

---

## Quick Reference Card

### File Locations

| Component | Location |
|-----------|----------|
| Manifest | `.claude-plugin/plugin.json` |
| Commands | `commands/*.md` |
| Agents | `agents/*.md` |
| Skills | `skills/[name]/SKILL.md` |
| Hooks | `hooks/hooks.json` |
| MCP Config | `.mcp.json` |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `CLAUDE_PLUGIN_ROOT` | Plugin installation directory |
| `CLAUDE_PROJECT_DIR` | Current project directory |

### Hook Events

| Event | Timing |
|-------|--------|
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool execution |
| `Stop` | Session completion |
| `SubagentStop` | Subagent completion |
| `SessionStart` | Session beginning |
| `SessionEnd` | Session ending |
| `UserPromptSubmit` | User input received |
| `PreCompact` | Before context compaction |
| `Notification` | System notification |

### MCP Server Types

| Type | Use Case |
|------|----------|
| `stdio` | Local tools, NPM packages |
| `sse` | Cloud services with OAuth |
| `http` | REST APIs |
| `websocket` | Real-time updates |

---

## Additional Resources

- **Official Repository**: [github.com/anthropics/claude-code/tree/main/plugins/plugin-dev](https://github.com/anthropics/claude-code/tree/main/plugins/plugin-dev)
- **Plugin Dev Skills**: 7 comprehensive skills with ~11,000+ words of documentation
- **Working Examples**: 12+ production-ready examples
- **Utility Scripts**: 6 validation and testing tools

---

*This guide is based on the official Plugin Dev toolkit from the Anthropic Claude Code repository, version 0.1.0.*
