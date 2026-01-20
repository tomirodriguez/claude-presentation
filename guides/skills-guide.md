# Claude Code Skills: The Complete Guide
## From Beginner to Expert

This guide will take you from understanding nothing about Claude Code Skills to mastering them for your development workflow.

---

## Table of Contents

1. [What Are Skills?](#what-are-skills)
2. [Skills vs Other Claude Code Features](#skills-vs-other-claude-code-features)
3. [When to Use Skills (And When Not To)](#when-to-use-skills-and-when-not-to)
4. [Creating Your First Skill](#creating-your-first-skill)
5. [Advanced Skill Features](#advanced-skill-features)
6. [Best Practices](#best-practices)
7. [Real-World Use Cases](#real-world-use-cases)
8. [Useful Skills to Get Started](#useful-skills-to-get-started)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

---

## What Are Skills?

**Skills are folders of instructions, scripts, and resources that Claude loads dynamically to perform better at specific tasks.**

Think of Skills as training materials for Claude. When you ask Claude something that matches a Skill's purpose, Claude automatically applies it — no manual invocation required.

### The Core Concept: Progressive Disclosure

Skills use a principle called **progressive disclosure**. Like a well-organized manual with a table of contents, Claude loads information only as needed:

1. **Metadata Scan** (~100 tokens): Claude scans skill descriptions to find relevant ones
2. **Full Load** (<5k tokens): When activated, the skill content loads
3. **Resources** (on-demand): Bundled scripts and references only load when needed

This means Skills are incredibly token-efficient compared to putting everything in your system prompt.

### What's Inside a Skill?

At minimum, a Skill is just a folder with a `SKILL.md` file:

```
my-skill/
└── SKILL.md
```

The `SKILL.md` file has two parts:

1. **YAML Frontmatter** — Metadata (name, description)
2. **Markdown Content** — Instructions for Claude

```markdown
---
name: my-awesome-skill
description: Helps with X when the user asks about Y or mentions Z
---

# Instructions

When activated, follow these steps:
1. Do this first
2. Then do this
3. Finally do this

## Examples

Here's how to handle common scenarios...
```

---

## Skills vs Other Claude Code Features

Understanding when to use Skills versus other Claude Code features is crucial. Here's a comprehensive comparison:

### Quick Reference Table

| Feature | Purpose | Invocation | Best For |
|---------|---------|------------|----------|
| **Skills** | Teach Claude HOW to do things | Auto-invoked when relevant | Reusable workflows, standards, procedures |
| **Slash Commands** | Quick shortcuts for specific tasks | Manual (`/command`) | Explicit, repeatable terminal commands |
| **CLAUDE.md** | Project context and conventions | Always loaded | Short, always-true project facts |
| **Hooks** | React to specific events | Event-triggered | Enforcing rules, notifications, automation |
| **Subagents** | Delegate specialized work | Auto or manual | Parallel execution, isolated contexts |
| **MCP Servers** | Connect to external systems | Always available | Data access, API integrations |

### Detailed Comparisons

#### Skills vs CLAUDE.md

| Aspect | Skills | CLAUDE.md |
|--------|--------|-----------|
| **Loading** | On-demand when relevant | Always loaded at session start |
| **Size** | Can be large (500+ lines) | Should be concise |
| **Scope** | Specific tasks/workflows | Project-wide conventions |
| **Location** | `.claude/skills/` folder | Project root |

**Rule of thumb:**
- **CLAUDE.md** → Short, always-true facts (stack, commands, directories)
- **Skills** → Detailed procedures loaded only when needed

#### Skills vs Slash Commands

| Aspect | Skills | Slash Commands |
|--------|--------|----------------|
| **Invocation** | Automatic (Claude decides) | Manual (`/command-name`) |
| **Structure** | Folder with SKILL.md + resources | Single markdown file |
| **Discovery** | Claude reads descriptions | Autocomplete in terminal |
| **Complexity** | Can bundle scripts, templates | Usually single-purpose |

**Rule of thumb:**
- **Slash Commands** → Explicit shortcuts you type yourself
- **Skills** → Background expertise Claude applies automatically

#### Skills vs Subagents

| Aspect | Skills | Subagents |
|--------|--------|-----------|
| **Context** | Shared with main conversation | Separate context window |
| **Purpose** | Guidance and standards | Independent task execution |
| **Reusability** | Portable across projects | Purpose-built for workflows |
| **Execution** | Within main conversation | Parallel, isolated |

**Rule of thumb:**
- **Skills** → Expertise that any conversation can use
- **Subagents** → Heavy, independent tasks that shouldn't pollute main context

#### Skills vs MCP Servers

This is one of the most important distinctions:

| Aspect | Skills | MCP Servers |
|--------|--------|-------------|
| **Purpose** | Teach Claude HOW | Give Claude ACCESS |
| **What it provides** | Instructions, procedures | Connections, data, APIs |
| **Analogy** | Employee expertise | Store inventory |

**The Hardware Store Analogy:**
- **MCP** = Having access to all the aisles and inventory
- **Skills** = The expert employee who knows which items you need and how to use them

**They work together:**
```
MCP → "Here's access to your database"
Skill → "When querying the database, always filter by date first and format results as..."
```

---

## When to Use Skills (And When Not To)

### Use Skills When:

1. **You have repeatable workflows**
   - PR review procedures
   - Commit message formats
   - Code style enforcement

2. **You need specialized expertise**
   - Security review checklists
   - Data analysis methods
   - Documentation standards

3. **Multiple conversations need the same knowledge**
   - Team coding standards
   - Company brand guidelines
   - Project-specific procedures

4. **You want to bundle resources**
   - Templates
   - Scripts
   - Reference documentation

### Don't Use Skills When:

1. **Information should always be available**
   → Use CLAUDE.md instead

2. **You need explicit manual invocation**
   → Use Slash Commands instead

3. **You need to access external systems**
   → Use MCP Servers instead

4. **You need isolated execution**
   → Use Subagents instead

5. **You need to react to specific events**
   → Use Hooks instead

---

## Creating Your First Skill

### Step 1: Create the Skill Directory

Skills can live in two locations:

```bash
# Personal skills (all your projects)
~/.config/claude/skills/my-skill/

# Project skills (shared with team)
.claude/skills/my-skill/
```

### Step 2: Create SKILL.md

```bash
mkdir -p .claude/skills/code-reviewer
touch .claude/skills/code-reviewer/SKILL.md
```

### Step 3: Write the Skill

```markdown
---
name: code-reviewer
description: Reviews code for quality, security, and best practices. Use when the user asks for a code review, PR review, or mentions reviewing changes.
---

# Code Review Skill

When reviewing code, follow this checklist:

## Security
- [ ] No hardcoded secrets or credentials
- [ ] Input validation on user data
- [ ] SQL injection prevention
- [ ] XSS protection in frontend code

## Quality
- [ ] Functions are small and focused
- [ ] Variable names are descriptive
- [ ] No code duplication
- [ ] Error handling is comprehensive

## Performance
- [ ] No N+1 query issues
- [ ] Efficient algorithms used
- [ ] No memory leaks
- [ ] Caching where appropriate

## Output Format

Provide feedback in this format:

### Summary
One paragraph overview of the code quality.

### Issues Found
List each issue with severity (Critical/High/Medium/Low).

### Suggestions
Actionable improvements for the author.
```

### Step 4: Test Your Skill

Open Claude Code and ask for a code review. Claude should automatically apply your skill.

---

## Advanced Skill Features

### Multi-File Skills

For complex skills, organize resources in directories:

```
my-skill/
├── SKILL.md           # Core instructions (required)
├── scripts/           # Executable code
│   ├── validate.py
│   └── format.sh
├── references/        # Documentation (loaded when needed)
│   ├── api-docs.md
│   └── examples.md
└── assets/            # Templates, icons, etc.
    └── template.html
```

### Using Scripts

Scripts run without loading their contents into context — only the output consumes tokens:

```markdown
---
name: data-validator
description: Validates data files against schemas
---

# Data Validation Skill

To validate a data file, run the bundled script:

```bash
python scripts/validate.py <file_path>
```

The script will output validation results.
```

### Tool Restrictions

Limit which tools Claude can use when a Skill is active:

```yaml
---
name: safe-reviewer
description: Reviews code without making changes
allowed-tools: Read, Grep, Glob
---
```

> **Note:** `allowed-tools` only works in Claude Code CLI, not the SDK.

### Reference Files

Keep SKILL.md focused by moving detailed docs to reference files:

```markdown
---
name: api-builder
description: Builds REST APIs following our patterns
---

# API Builder

For basic endpoints, follow the quick patterns below.
For advanced usage, see `references/advanced-patterns.md`.

## Quick Patterns

### GET endpoint
...
```

### Forked Context (Isolated Execution)

Skills can run in a **forked subagent context** with their own isolated conversation history. This is powerful for complex, multi-step operations that shouldn't clutter the main conversation.

#### Basic Fork

Use `context: fork` in the YAML frontmatter:

```yaml
---
name: code-analysis
description: Analyzes code quality and generates detailed reports
context: fork
---
```

When this skill activates, Claude spawns a separate context to execute it. The main conversation stays clean while the skill does its work.

#### Fork with Specific Agent Type

Combine `context: fork` with `agent` to use a specific subagent:

```yaml
---
name: deep-exploration
description: Thoroughly explores and documents codebase architecture
context: fork
agent: Explore
---
```

Available agent types:
- `Explore` — Fast codebase exploration and search
- `Plan` — Architecture and implementation planning
- `general-purpose` — Generic agent (default)
- Custom agent names defined in `.claude/agents/`

#### When to Use Forked Context

**Use `context: fork` when:**
- The skill performs complex multi-step operations
- You need isolated conversation history
- You want to avoid polluting the main context
- The operation has its own workflow that doesn't need user interaction

**Don't use fork when:**
- The skill is simple or single-operation
- You need to maintain main conversation context
- Real-time user interaction is required

### Skills in Custom Subagents

Subagents **do not automatically inherit** skills from the main conversation. To give a custom subagent access to specific skills, list them in the `skills` field:

```markdown
# .claude/agents/code-reviewer.md
---
name: code-reviewer
description: Reviews code for quality and best practices
skills: pr-review, security-check, style-guide
---
```

The listed skills load into the subagent's context when it starts.

#### Important Limitation

> **Built-in agents (`Explore`, `Plan`, `general-purpose`) do NOT have access to your skills.**
>
> Only custom subagents defined in `.claude/agents/` with an explicit `skills` field can use skills.

#### Example: Skill + Subagent Combo

Create a powerful workflow by combining a forked skill with a custom agent that has its own skills:

```yaml
# .claude/skills/security-audit/SKILL.md
---
name: security-audit
description: Comprehensive security audit of the codebase
context: fork
agent: security-specialist
---

# Security Audit

Run a full security analysis using the security-specialist agent...
```

```markdown
# .claude/agents/security-specialist.md
---
name: security-specialist
description: Security-focused code analysis
skills: vulnerability-scanner, dependency-checker, owasp-guidelines
---

You are a security specialist. Use your skills to thoroughly analyze code...
```

This creates a chain: the `security-audit` skill forks into the `security-specialist` agent, which has access to three specialized security skills.

---

## Best Practices

### 1. Write Excellent Descriptions

The description is how Claude decides whether to use your Skill. Be specific:

**Bad:**
```yaml
description: Helps with documents
```

**Good:**
```yaml
description: Extract tables from PDFs and convert to CSV format. Use when the user mentions PDF tables, data extraction, or converting PDF to spreadsheet.
```

### 2. Use the WHEN / WHEN NOT Pattern

```yaml
description: Applies TDD patterns when writing tests. Auto-invoke when user mentions testing, TDD, or test-driven development. Do NOT load for general code questions unrelated to testing.
```

### 3. Keep SKILL.md Concise

- Target under 500 lines for optimal performance
- Move detailed documentation to `references/` folder
- Keep references one level deep (avoid A → B → C chains)

### 4. Bundle Scripts for Efficiency

Scripts execute without loading into context:

```
✅ Claude runs script → gets output (few tokens)
❌ Claude reads script → executes manually (many tokens)
```

### 5. Test in Isolation

Before deploying, test your skill:
1. Ask Claude questions that SHOULD trigger the skill
2. Ask questions that should NOT trigger it
3. Verify the behavior matches your expectations

### 6. Version Your Skills

```yaml
---
name: my-skill
description: ...
version: 1.2.0
---
```

---

## Real-World Use Cases

### Development Workflows

**TDD Skill:**
- Enforces test-driven development
- Ensures tests are written before implementation
- Provides 90% test coverage vs 40% without

**PR Review Skill:**
- Consistent review standards across team
- Security and performance checklists
- Reduces review time by standardizing feedback format

**Commit Message Skill:**
- Enforces conventional commit format
- Auto-generates changelog entries
- Maintains consistent history

### Documentation

**API Documentation Skill:**
- Generates OpenAPI specs from code
- Creates consistent endpoint documentation
- Includes request/response examples

**README Generator Skill:**
- Follows project template
- Includes installation, usage, contributing sections
- Adds badges and status indicators

### Data Analysis

**Data Validation Skill:**
- Validates data against schemas
- Reports data quality issues
- Suggests data cleaning approaches

**Report Generator Skill:**
- Creates standardized reports
- Applies company formatting
- Generates charts and visualizations

### DevOps

**Deployment Skill:**
- Follows deployment checklist
- Verifies environment configuration
- Creates rollback plans

**Incident Response Skill:**
- Guides through incident procedures
- Collects diagnostic information
- Generates post-mortem templates

---

## Useful Skills to Get Started

### Official Anthropic Skills

From [github.com/anthropics/skills](https://github.com/anthropics/skills):

| Skill | Description |
|-------|-------------|
| **skill-creator** | Interactive tool for building new skills |
| **docx** | Create and edit Word documents |
| **pdf** | PDF manipulation and extraction |
| **xlsx** | Excel spreadsheet operations |
| **pptx** | PowerPoint presentations |
| **brand-guidelines** | Apply brand colors and typography |
| **internal-comms** | Write status reports, newsletters, FAQs |

### Community Skills

From [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills):

| Collection | Description |
|------------|-------------|
| **obra/superpowers** | 20+ battle-tested skills for TDD, debugging, collaboration |
| **claude-code-showcase** | Complete project configuration examples |
| **claude-skills** | Real-world usage examples with subagents and commands |

### Installing Skills

```bash
# Via plugin system
/plugin install document-skills@anthropic-agent-skills

# Manual installation
git clone https://github.com/anthropics/skills.git
cp -r skills/skill-creator ~/.config/claude/skills/
```

---

## Troubleshooting

### Skill Not Being Detected

1. **Check the description** — Is it specific enough? Does it match what users would say?

2. **Check file location** — Must be in `.claude/skills/` or `~/.config/claude/skills/`

3. **Check SKILL.md format** — Frontmatter must have `---` delimiters and valid YAML

### Skill Loading Wrong Context

1. **Refine your description** — Add WHEN NOT conditions
2. **Check for conflicts** — Multiple skills with similar descriptions

### Scripts Not Executing

1. **Check permissions** — `chmod +x scripts/my-script.sh`
2. **Check paths** — Use relative paths from skill directory
3. **Check dependencies** — Ensure required tools are installed

### High Token Usage

1. **Move content to references** — Only core instructions in SKILL.md
2. **Use scripts** — Output consumes fewer tokens than loaded code
3. **Keep under 500 lines** — Split large skills

---

## Resources

### Official Documentation
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Agent Skills Platform Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Skill Authoring Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### Repositories
- [anthropics/skills](https://github.com/anthropics/skills) — Official Anthropic skills
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) — Community curated list

### Tutorials
- [How to Build Claude Skills (Codecademy)](https://www.codecademy.com/article/how-to-build-claude-skills)
- [Claude Skills Tutorial (Sid Bharath)](https://www.siddharthbharath.com/claude-skills/)
- [Skills Deep Dive](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)

### Blog Posts
- [Equipping Agents with Skills (Anthropic)](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Explained (Claude Blog)](https://claude.com/blog/skills-explained)
- [Claude Skills vs MCP (IntuitionLabs)](https://intuitionlabs.ai/articles/claude-skills-vs-mcp)

---

## Quick Reference Card

### Skill File Structure
```
my-skill/
├── SKILL.md           # Required
├── scripts/           # Optional executables
├── references/        # Optional docs
└── assets/            # Optional templates
```

### Minimal SKILL.md
```yaml
---
name: my-skill
description: What it does and when to use it
---

# Instructions

Your instructions here...
```

### Advanced SKILL.md (Forked)
```yaml
---
name: complex-skill
description: Does complex analysis
context: fork
agent: my-custom-agent
allowed-tools: Read, Grep, Glob
---

# Instructions for isolated execution...
```

### Custom Agent with Skills
```markdown
# .claude/agents/my-agent.md
---
name: my-agent
description: Specialized agent
skills: skill-a, skill-b, skill-c
---

Agent instructions...
```

### Skill Locations
```
~/.config/claude/skills/   # Personal (all projects)
.claude/skills/            # Project (team-shared)
```

### Feature Comparison Cheatsheet
```
Need Claude to...              → Use...
─────────────────────────────────────────
Learn a procedure              → Skill
Access external data           → MCP Server
Follow project conventions     → CLAUDE.md
Run explicit command           → Slash Command
React to events                → Hook
Do isolated work               → Subagent
Complex skill, isolated        → Skill + context: fork
Give skills to subagent        → Custom agent + skills field
```

---

*Last updated: January 2025*
*Based on official Claude Code documentation and community best practices*
