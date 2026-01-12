# Claude Code Sub-Agents: The Complete Guide
## From Beginner to Expert

> **What you'll learn:** Everything you need to master Claude Code sub-agents — from understanding the basics to building production-ready multi-agent workflows.

---

## Table of Contents

1. [What Are Sub-Agents?](#what-are-sub-agents)
2. [Built-in Sub-Agents](#built-in-sub-agents)
3. [Sub-Agents vs Other Claude Code Features](#sub-agents-vs-other-claude-code-features)
4. [When to Use What](#when-to-use-what)
5. [Creating Custom Sub-Agents](#creating-custom-sub-agents)
6. [Best Use Cases & Examples](#best-use-cases--examples)
7. [Useful Sub-Agent Templates](#useful-sub-agent-templates)
8. [Model Selection Guide](#model-selection-guide)
9. [Common Pitfalls & How to Avoid Them](#common-pitfalls--how-to-avoid-them)
10. [Best Practices](#best-practices)
11. [Advanced Patterns](#advanced-patterns)
12. [Resources](#resources)

---

## What Are Sub-Agents?

Sub-agents are **specialized AI assistants** that handle specific types of tasks. Think of them as expert team members you can call upon for particular jobs.

### Key Characteristics

Each sub-agent:
- **Runs in its own context window** — separate from your main conversation
- **Has a custom system prompt** — defining its expertise and behavior
- **Has specific tool access** — limited to what it needs (read-only, write access, etc.)
- **Has independent permissions** — can be more restricted than the main agent

### Why Use Sub-Agents?

| Benefit | Description |
|---------|-------------|
| **Preserve Context** | Keep exploration and research out of your main conversation, preventing context pollution |
| **Enforce Constraints** | Limit which tools a sub-agent can use (e.g., read-only for code reviewers) |
| **Reuse Configurations** | User-level sub-agents work across all your projects |
| **Specialize Behavior** | Focused system prompts for specific domains (security, testing, documentation) |
| **Control Costs** | Route simple tasks to faster, cheaper models like Haiku |

### How Delegation Works

When Claude encounters a task, it automatically decides whether to delegate based on:
1. The task description in your request
2. The `description` field in sub-agent configurations
3. The current conversation context
4. Available tools needed

---

## Built-in Sub-Agents

Claude Code includes three built-in sub-agents that work automatically:

### 1. Explore Agent

**Purpose:** File discovery, code search, and codebase exploration.

**When Claude uses it:**
- Searching for files or code patterns
- Understanding codebase structure
- Finding implementations without making changes

**Tools available:** `Read`, `Glob`, `Grep`

**Best for:** "Where is X implemented?", "Find all uses of Y", "What files handle Z?"

### 2. Plan Agent

**Purpose:** Research agent used during plan mode to gather context before presenting a plan.

**When Claude uses it:**
- When you're in plan mode (after using `/plan` or `EnterPlanMode`)
- When Claude needs to understand your codebase before proposing changes

**Tools available:** `Read`, `Glob`, `Grep`, exploration tools

**Best for:** Complex feature planning, architectural decisions

### 3. General-Purpose Agent

**Purpose:** A capable agent for complex, multi-step tasks requiring both exploration AND action.

**When Claude uses it:**
- Tasks requiring exploration + modification
- Complex reasoning to interpret results
- Multiple dependent steps
- Research that needs to span many files

**Tools available:** All standard tools

**Best for:** Multi-file refactoring research, dependency analysis, complex debugging

---

## Sub-Agents vs Other Claude Code Features

Claude Code offers several ways to extend and customize behavior. Here's how they compare:

### Feature Comparison Table

| Feature | What It Is | Context | Invocation | Best For |
|---------|------------|---------|------------|----------|
| **CLAUDE.md** | Project configuration file | Always loaded | Automatic | Short, always-true conventions |
| **Skills** | Markdown instruction files | Loaded when relevant | Automatic (description-based) | Reusable expertise, workflows |
| **Slash Commands** | Custom `/command` shortcuts | Current conversation | Manual (`/command`) | Frequent, predictable tasks |
| **Sub-Agents** | Isolated AI assistants | **Separate context window** | Automatic (task-based) | Complex tasks, isolation needed |

### Detailed Comparison

#### CLAUDE.md
```
Location: .claude/CLAUDE.md or ~/.claude/CLAUDE.md
Purpose: Project-wide conventions that ALWAYS apply
```

**Use for:**
- Coding standards ("use TypeScript strict mode")
- Project rules ("don't commit until approved")
- Framework preferences ("use Tailwind for styling")

**Limitations:**
- Always loaded = uses context even when irrelevant
- Not reusable across different project types

---

#### Skills
```
Location: .claude/skills/ or ~/.claude/skills/
Format: Markdown with YAML frontmatter
```

**Use for:**
- Automatically applied expertise based on context
- Portable, reusable workflows
- Language-specific best practices

**Key difference from sub-agents:** Skills add knowledge to the CURRENT conversation. Sub-agents run in a SEPARATE context.

**Example skill:**
```markdown
---
name: react-patterns
description: Best practices for React component development
---

When writing React components:
1. Use functional components with hooks
2. Prefer composition over inheritance
3. Keep components small and focused
```

---

#### Slash Commands
```
Location: .claude/commands/ or ~/.claude/commands/
Format: Markdown files (command-name.md)
```

**Use for:**
- Frequently repeated tasks
- Tasks you want to trigger explicitly
- Simple, predictable operations

**Example:** `/review` for code review, `/test` for running tests

---

#### Sub-Agents

**Use for:**
- Tasks that need isolation from main context
- Specialized expertise with specific tool restrictions
- Complex, multi-step workflows
- Cost optimization (using cheaper models)

---

## When to Use What

### Decision Flowchart

```
Is this a project-wide convention that always applies?
├── YES → Use CLAUDE.md
└── NO ↓

Is this knowledge that should auto-apply based on context?
├── YES → Use Skills
└── NO ↓

Is this a predictable task you'll trigger manually?
├── YES → Use Slash Commands
└── NO ↓

Does this task need:
  - Separate context window?
  - Different tool access?
  - Different model (Haiku for speed)?
  - Isolation from main conversation?
├── YES → Use Sub-Agents
└── NO → Just ask Claude directly
```

### Quick Reference

| Scenario | Use |
|----------|-----|
| "Always use ESLint before committing" | CLAUDE.md |
| "Apply TypeScript best practices when writing TS" | Skill |
| "Run my test suite" | Slash Command |
| "Review this code without cluttering my context" | Sub-Agent |
| "Research this codebase structure" | Built-in Explore sub-agent |
| "Plan this feature implementation" | Built-in Plan sub-agent |

### Combining Features

You can use them together for powerful workflows:

```markdown
# Sub-agent that uses a Skill

---
name: python-reviewer
description: Reviews Python code for quality
tools:
  - Read
  - Glob
  - Grep
skills:
  - python-best-practices  # This skill is loaded for the sub-agent
model: sonnet
---

You are a Python code reviewer. Analyze code for quality, security, and best practices.
```

---

## Creating Custom Sub-Agents

### File Location

Sub-agents are defined as Markdown files in:

| Location | Scope |
|----------|-------|
| `~/.claude/agents/` | Available across ALL your projects |
| `.claude/agents/` | Project-specific, shareable with team |

### Basic Structure

```markdown
---
name: agent-name
description: When Claude should use this agent
tools:
  - Tool1
  - Tool2
model: sonnet  # Optional: haiku, sonnet, or opus
---

# System Prompt

Your instructions for the agent go here.
This becomes the agent's system prompt.
```

### Creating via Slash Command

The easiest way to create a sub-agent:

```
/agents
```

This opens an interactive wizard to create your sub-agent.

### Example: Code Reviewer Agent

```markdown
---
name: code-reviewer
description: Reviews code changes for quality, security, and best practices
tools:
  - Read
  - Glob
  - Grep
model: sonnet
---

# Code Review Specialist

You are an expert code reviewer. When reviewing code:

## Your Process
1. First understand the context and purpose of the changes
2. Check for security vulnerabilities (OWASP Top 10)
3. Evaluate code quality and maintainability
4. Look for performance issues
5. Verify error handling

## Output Format
Provide feedback in this structure:
- **Critical Issues:** Must fix before merge
- **Suggestions:** Improvements to consider
- **Positive Notes:** What was done well

Be specific and actionable. Reference line numbers when possible.
```

### Tool Options

Common tool configurations by agent type:

| Agent Type | Tools |
|------------|-------|
| Read-only (reviewers, auditors) | `Read`, `Glob`, `Grep` |
| Research (analysts) | `Read`, `Glob`, `Grep`, `WebFetch`, `WebSearch` |
| Code writers | `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep` |
| Full access | All tools (or omit `tools` field) |

---

## Best Use Cases & Examples

### 1. Code Review Agent

**Use case:** Review code without polluting your main conversation context.

```markdown
---
name: reviewer
description: Reviews code for quality issues and provides feedback
tools:
  - Read
  - Glob
  - Grep
model: sonnet
---

You are a senior code reviewer. Focus on:
- Security vulnerabilities
- Performance issues
- Code clarity and maintainability
- Test coverage gaps

Provide specific, actionable feedback with line references.
```

### 2. Documentation Writer

**Use case:** Generate documentation without needing full code modification access.

```markdown
---
name: docs-writer
description: Writes and updates documentation based on code analysis
tools:
  - Read
  - Glob
  - Grep
  - Write
  - Edit
model: sonnet
---

You are a technical writer. Generate clear, concise documentation.

For each component/function:
1. Brief description of purpose
2. Parameters and return values
3. Usage examples
4. Edge cases and notes
```

### 3. Security Auditor

**Use case:** Scan code for security vulnerabilities.

```markdown
---
name: security-auditor
description: Audits code for security vulnerabilities
tools:
  - Read
  - Glob
  - Grep
model: opus  # Use Opus for deeper analysis
---

You are a security expert. Scan for:
- SQL injection
- XSS vulnerabilities
- Authentication/authorization issues
- Sensitive data exposure
- Dependency vulnerabilities
- OWASP Top 10 issues

Provide severity ratings and remediation steps.
```

### 4. Test Generator

**Use case:** Generate test cases for existing code.

```markdown
---
name: test-generator
description: Generates comprehensive test cases for code
tools:
  - Read
  - Glob
  - Grep
  - Write
model: sonnet
---

You are a QA engineer. Generate comprehensive tests:
- Unit tests for individual functions
- Integration tests for workflows
- Edge cases and error conditions
- Use the project's existing test framework and patterns
```

### 5. Refactoring Assistant

**Use case:** Research refactoring opportunities before implementing.

```markdown
---
name: refactor-analyst
description: Analyzes code for refactoring opportunities
tools:
  - Read
  - Glob
  - Grep
model: haiku  # Fast analysis
---

You analyze code for refactoring opportunities. Identify:
- Code duplication
- Long methods/functions
- Complex conditionals
- Unclear naming
- Architecture improvements

DON'T make changes - just report findings with recommendations.
```

### 6. Dependency Analyzer

**Use case:** Understand project dependencies and their implications.

```markdown
---
name: dependency-analyst
description: Analyzes project dependencies for issues and updates
tools:
  - Read
  - Glob
  - Grep
  - Bash
  - WebSearch
model: sonnet
---

Analyze project dependencies:
1. Check for outdated packages
2. Identify security vulnerabilities
3. Find unused dependencies
4. Check for license compatibility
5. Suggest consolidation opportunities
```

---

## Useful Sub-Agent Templates

Here are production-ready templates you can use immediately:

### Research & Analysis Agents

#### Architecture Researcher
```markdown
---
name: architect
description: Researches codebase architecture and design patterns
tools:
  - Read
  - Glob
  - Grep
model: opus
---

You are a software architect. Analyze:
- Project structure and organization
- Design patterns in use
- Component relationships
- Data flow patterns
- Areas for improvement

Provide visual diagrams using Mermaid when helpful.
```

#### Performance Analyzer
```markdown
---
name: perf-analyst
description: Analyzes code for performance issues
tools:
  - Read
  - Glob
  - Grep
model: sonnet
---

You are a performance engineer. Look for:
- N+1 queries
- Unnecessary re-renders (React)
- Memory leaks
- Inefficient algorithms
- Missing caching opportunities
- Bundle size issues
```

### Development Agents

#### API Designer
```markdown
---
name: api-designer
description: Designs RESTful APIs following best practices
tools:
  - Read
  - Glob
  - Grep
  - Write
model: sonnet
---

You design REST APIs. Follow:
- RESTful conventions
- Consistent naming
- Proper HTTP methods
- Comprehensive error responses
- OpenAPI/Swagger documentation
```

#### Migration Helper
```markdown
---
name: migrator
description: Helps with code migrations and upgrades
tools:
  - Read
  - Glob
  - Grep
  - Edit
  - Write
model: sonnet
---

You assist with code migrations. For each migration:
1. Analyze current implementation
2. Identify breaking changes
3. Create step-by-step migration plan
4. Implement changes incrementally
5. Verify functionality preserved
```

### DevOps Agents

#### Docker Specialist
```markdown
---
name: docker-expert
description: Helps with Docker and containerization
tools:
  - Read
  - Glob
  - Grep
  - Write
  - Bash
model: sonnet
---

You are a Docker expert. Help with:
- Dockerfile optimization
- Multi-stage builds
- docker-compose configurations
- Image size reduction
- Security best practices
```

#### CI/CD Helper
```markdown
---
name: cicd-helper
description: Assists with CI/CD pipeline configuration
tools:
  - Read
  - Glob
  - Grep
  - Write
model: sonnet
---

You help configure CI/CD pipelines. Support for:
- GitHub Actions
- GitLab CI
- Jenkins
- CircleCI

Focus on: fast builds, caching, parallel jobs, security scanning.
```

---

## Model Selection Guide

Sub-agents can use different Claude models for different tasks:

### Model Comparison

| Model | Best For | Speed | Cost | Capability |
|-------|----------|-------|------|------------|
| **Haiku** | Simple, repetitive tasks | Fastest | Lowest | Good |
| **Sonnet** | Daily development work | Balanced | Medium | Great |
| **Opus** | Complex reasoning, deep analysis | Slower | Highest | Best |

### When to Use Each

#### Use Haiku for:
- High-frequency tasks (10+ invocations per session)
- Simple, straightforward operations
- Linting and formatting checks
- Quick code searches
- Worker agents in multi-agent systems

```markdown
model: haiku
```

#### Use Sonnet for:
- Daily coding tasks
- Bug fixes and debugging
- Writing tests and documentation
- Code reviews
- Most refactoring work
- **Default choice for most sub-agents**

```markdown
model: sonnet
```

#### Use Opus for:
- Complex architectural decisions
- Large-scale refactoring analysis
- Deep security audits
- Ambiguous requirements clarification
- Final review before major releases

```markdown
model: opus
```

### Cost-Saving Strategy

Use a tiered approach:
1. **Haiku** for initial exploration and simple checks
2. **Sonnet** for implementation and standard reviews
3. **Opus** for final verification and complex decisions

---

## Common Pitfalls & How to Avoid Them

### Pitfall 1: Context Isolation Problems

**The Problem:** Each sub-agent only knows about its own task and has no context about the entire project.

**Solution:**
- Put key project context in `CLAUDE.md` (sub-agents can read it)
- Use `skills` field to give sub-agents relevant expertise
- Don't over-specialize — sometimes the main agent is better

### Pitfall 2: Using Sub-Agents as Implementers

**The Problem:** Most developers treat sub-agents as junior developers to delegate implementation to. This often leads to poor results.

**The Truth:** Sub-agents work best as **researchers, not implementers**.

**Solution:**
- Use sub-agents for research, analysis, and review
- Do implementation in the main conversation where you have full context
- Let sub-agents gather information that informs your decisions

### Pitfall 3: Sub-Agents Ignoring Instructions

**The Problem:** Sub-agents sometimes do their own thing instead of following your system prompt.

**Solution:**
- Be extremely specific in your instructions
- Use structured output formats
- Add explicit "DO NOT" instructions for common deviations
- Test and iterate on your prompts

### Pitfall 4: Claude Not Using Your Sub-Agents

**The Problem:** You create sub-agents but Claude never delegates to them.

**Solution:**
Add reminders to your `CLAUDE.md`:
```markdown
## Available Specialists

Remember to use these sub-agents when appropriate:
- `code-reviewer`: For reviewing code changes
- `security-auditor`: For security analysis
- `test-generator`: For generating test cases
```

### Pitfall 5: Resource Overload

**The Problem:** Multiple sub-agents running simultaneously can overwhelm your system.

**Solution:**
- Limit concurrent sub-agents
- Use Haiku for simpler tasks
- Monitor token usage
- Consider sequential workflows instead of parallel

### Pitfall 6: Custom Sub-Agents Gatekeeping Context

**The Problem:** If you make a `PythonTests` sub-agent, your main agent can no longer reason holistically about testing.

**Solution:**
Consider using Claude's built-in `Task(...)` feature instead:
- Put context in `CLAUDE.md`
- Let Claude spawn general-purpose clones as needed
- Gets benefits of context isolation without rigid specialization

---

## Best Practices

### 1. Single Responsibility Principle

Give each sub-agent ONE clear job:
- One goal
- One type of input
- One type of output
- Clear handoff rules

**Bad:** "You handle all code quality tasks"
**Good:** "You review Python code for security vulnerabilities"

### 2. Scope Tools Appropriately

Match tools to the job:

| Role | Tools |
|------|-------|
| Reviewers/Auditors | `Read`, `Glob`, `Grep` only |
| Researchers | Add `WebFetch`, `WebSearch` |
| Implementers | Add `Write`, `Edit`, `Bash` |

### 3. Write Action-Oriented Descriptions

The `description` field determines when Claude delegates:

**Bad:** "This agent knows about testing"
**Good:** "Generates unit tests for Python functions after implementation is complete"

### 4. Use Strategic Model Selection

- Start with **Haiku** for speed
- Upgrade to **Sonnet** if quality suffers
- Reserve **Opus** for complex reasoning

### 5. Test Your Sub-Agents

Before relying on a sub-agent:
1. Test with representative tasks
2. Check if it follows your system prompt
3. Verify it stays within tool constraints
4. Measure token usage

### 6. Keep System Prompts Focused

Effective system prompts are:
- **Specific:** Clear about what to do
- **Structured:** Step-by-step process
- **Bounded:** Clear about what NOT to do
- **Formatted:** Define expected output structure

### 7. Version Control Your Agents

Keep `.claude/agents/` in version control:
- Share with team
- Track changes
- Review improvements

---

## Advanced Patterns

### Pipeline Architecture

Chain sub-agents in a sequence where each output feeds the next:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Spec Agent │ ──▶ │  Architect  │ ──▶ │ Implementer │
│  (analyze)  │     │  (design)   │     │   (build)   │
└─────────────┘     └─────────────┘     └─────────────┘
```

**Example workflow:**
1. `pm-spec`: Reads enhancement request, writes spec, sets status `READY_FOR_ARCH`
2. `architect`: Validates design, produces Architecture Decision Record (ADR)
3. `implementer`: Implements code and tests, updates docs

### Parallel Development

Run multiple Claude instances in parallel for independent tasks:

```
Main Agent
    ├── Feature A (Claude instance 1)
    ├── Feature B (Claude instance 2)
    └── Feature C (Claude instance 3)
```

Best for:
- Independent features
- Multiple file types (frontend + backend)
- Parallel research on different aspects

### Research-Then-Implement Pattern

Use sub-agents for research, main agent for implementation:

```
┌─────────────────┐
│  Main Agent     │
│  (implements)   │
└────────┬────────┘
         │ delegates research
         ▼
┌─────────────────┐
│  Explore Agent  │
│  (researches)   │
└─────────────────┘
         │ returns findings
         ▼
┌─────────────────┐
│  Main Agent     │
│  (continues)    │
└─────────────────┘
```

### Test-Driven Development with Sub-Agents

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Test Writer  │ ──▶ │ Implementer  │ ──▶ │ Code Reviewer│
│ (write tests)│     │ (make pass)  │     │ (verify)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. Test sub-agent writes failing tests
2. Implementer sub-agent makes tests pass
3. Review sub-agent verifies quality

### Master-Clone Architecture

Instead of specialized sub-agents, use the built-in `Task()` feature:

```
Main Agent (CLAUDE.md context)
    │
    ├── Task(clone) for research A
    ├── Task(clone) for research B
    └── Task(clone) for research C
```

Benefits:
- All clones share CLAUDE.md context
- Flexible delegation based on need
- No rigid specialization

---

## Resources

### Official Documentation
- [Claude Code Sub-Agents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)
- [Claude Agent SDK Overview](https://code.claude.com/docs/en/sdk/sdk-overview)

### Community Collections
- [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) - 100+ specialized sub-agents
- [rahulvrane/awesome-claude-agents](https://github.com/rahulvrane/awesome-claude-agents) - Community-driven collection
- [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) - Curated workflows and patterns

### Tutorials & Best Practices
- [Claude Code: Best Practices for Agentic Coding](https://www.anthropic.com/engineering/claude-code-best-practices) - Official Anthropic guide
- [How to Use Claude Code Subagents to Parallelize Development](https://zachwills.net/how-to-use-claude-code-subagents-to-parallelize-development/)
- [Claude Code Skills vs Subagents - When to Use What?](https://dev.to/nunc/claude-code-skills-vs-subagents-when-to-use-what-4d12)
- [Claude Code Customization Guide](https://alexop.dev/posts/claude-code-customization-guide-claudemd-skills-subagents/)

### Alternative Perspectives
- [Claude Code Sub-Agents: Researchers, Not Coders](https://www.aiagentshub.net/blog/claude-code-subagents-researchers-not-coders)

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│                 CLAUDE CODE SUB-AGENTS                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LOCATIONS:                                                 │
│  • User:    ~/.claude/agents/                               │
│  • Project: .claude/agents/                                 │
│                                                             │
│  CREATE:    /agents (slash command)                         │
│                                                             │
│  MODELS:                                                    │
│  • haiku  → Fast, cheap, simple tasks                       │
│  • sonnet → Balanced, daily work (default)                  │
│  • opus   → Deep reasoning, complex analysis                │
│                                                             │
│  TOOL PRESETS:                                              │
│  • Read-only: Read, Glob, Grep                              │
│  • Research:  + WebFetch, WebSearch                         │
│  • Writer:    + Write, Edit, Bash                           │
│                                                             │
│  BUILT-IN AGENTS:                                           │
│  • Explore        → Codebase search & analysis              │
│  • Plan           → Planning mode research                  │
│  • General-purpose → Complex multi-step tasks               │
│                                                             │
│  GOLDEN RULES:                                              │
│  1. Sub-agents = researchers, not implementers              │
│  2. One job per agent (single responsibility)               │
│  3. Scope tools to match the role                           │
│  4. Use cheaper models when possible                        │
│  5. Put shared context in CLAUDE.md                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Last updated: January 2026*
*Guide based on Claude Code documentation and community best practices*
