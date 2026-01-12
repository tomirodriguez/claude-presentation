# Claude Code Knowledge Center

A centralized repository of reusable documentation, skills, commands, and hooks for Claude Code projects.

---

## Overview

This folder serves as a **knowledge base** for Claude Code configurations that can be applied across multiple projects. Instead of reinventing patterns for each new project, reference or copy the relevant pieces from here.

### What's Inside

```
.
├── .claude/
│   ├── agents/       # Specialized sub-agents for complex tasks
│   ├── commands/     # Reusable slash commands
│   ├── skills/       # Reusable Claude skills
│   └── templates/    # Project starter templates (CLAUDE.md)
├── docs/             # Technical documentation (architecture, patterns)
├── guides/           # Claude Code extension guides (skills, hooks, commands)
├── README.md         # This file
└── RULES.md          # Universal coding rules
```

---

## Quick Start

### Setting Up a New Project

1. **Copy the CLAUDE.md template**:
   ```bash
   cp .claude/templates/CLAUDE.md /path/to/your-project/CLAUDE.md
   ```

2. **Select relevant skills**:
   ```bash
   cp -r .claude/skills/repository /path/to/your-project/.claude/skills/
   cp -r .claude/skills/use-case /path/to/your-project/.claude/skills/
   ```

3. **Add relevant commands**:
   ```bash
   cp .claude/commands/commit.md /path/to/your-project/.claude/commands/
   ```

4. **Customize** the copied files for your project's specific needs.

### Using Documentation

The `docs/` folder contains reference documentation. You can:

- **Reference directly**: Point Claude to read specific docs
- **Copy to project**: Copy relevant docs to your project's `ai_docs/` folder
- **Link in CLAUDE.md**: Reference paths in your project's CLAUDE.md

---

## Folder Structure

### `/docs/` - Technical Documentation

| Folder | Contents |
|--------|----------|
| `architecture/` | Clean Architecture, DDD, Ports & Adapters |
| `patterns/` | Multi-tenancy, RBAC, Error handling |
| `frontend/` | shadcn/ui, React Hook Form patterns |

### `/.claude/skills/` - Claude Skills

Skills extend Claude's capabilities with specialized knowledge and workflows. They are lazy-loaded only when needed.

| Skill | Purpose |
|-------|---------|
| `repository` | Repository pattern with ResultAsync |
| `use-case` | Use case pattern with factory functions |
| `contracts` | Zod schema patterns (3-layer) |
| `procedure` | Thin handler pattern for API endpoints |
| `domain-entity` | Domain entity creation |
| `port` | Port/interface definitions |
| `authorization` | RBAC authorization patterns |
| `mutation-errors` | Error handling in mutations |
| `data-table` | DataTable component patterns |
| `form` | React Hook Form + shadcn/ui patterns |
| `date-management` | Date handling across the stack |
| `test-runner` | Code validation (typecheck, lint, test) |
| `skill-creator` | How to create new skills |

### `/.claude/commands/` - Slash Commands

| Command | Purpose |
|---------|---------|
| `commit.md` | Git commit with conventions |
| `typecheck.md` | TypeScript type checking |
| `lint-fix.md` | Biome lint with auto-fix |
| `build.md` | Build commands |
| `test.md` | Run tests |
| `format.md` | Code formatting |
| `debug.md` | Debugging assistance |
| `explain.md` | Code explanation |
| `refactor.md` | Code refactoring |
| `security.md` | Security analysis |

### `/.claude/agents/` - Sub-Agents

Specialized agents for complex, isolated tasks.

| Agent | Purpose |
|-------|---------|
| `architect` | Architecture research and design |
| `code-reviewer` | Code review and quality analysis |
| `security-scanner` | Security vulnerability detection |
| `test-generator` | Test case generation |
| `docs-writer` | Documentation writing |
| `refactor-analyst` | Refactoring opportunities |
| `perf-analyst` | Performance analysis |
| `dependency-analyst` | Dependency analysis |
| `docker-expert` | Docker/containerization |
| `cicd-helper` | CI/CD pipeline configuration |
| `migrator` | Code migrations and upgrades |

### `/.claude/templates/` - Project Templates

| Template | Use Case |
|----------|----------|
| `CLAUDE.md` | Base CLAUDE.md template for new projects |

### `/guides/` - Claude Code Extension Guides

| Guide | Contents |
|-------|----------|
| `skills-guide.md` | How to create and use skills |
| `slash-commands-guide.md` | How to create slash commands |
| `sub-agents-guide.md` | How to create sub-agents |
| `hooks-guide.md` | How to use hooks |
| `hooks-advanced-guide.md` | Advanced hook patterns |
| `official-repo-practices/` | Best practices from official repos |

---

## Universal Rules

See `RULES.md` for the universal coding rules that apply to all TypeScript/React projects.

Key rules:
- No type casting (`as`)
- No non-null assertions (`!`)
- No barrel files
- Validation before commit
- ResultAsync for error handling

---

## Language Convention

- **Communication**: User's preferred language (conversations, explanations)
- **Code & Docs**: Always English (code, comments, documentation, commits)

---

## Contributing

When adding new content:

1. **Keep it agnostic**: No project-specific references
2. **Use placeholders**: `{project_name}`, `{component_path}`, etc.
3. **Document when to use**: Clear triggers for skills
4. **Provide examples**: Show both correct and incorrect patterns

---

## Origin

This knowledge base is derived from battle-tested patterns developed in production projects, refined through iterative development with Claude Code.

---

**Last updated**: 2026-01-12
