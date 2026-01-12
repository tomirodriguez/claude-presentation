---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Creates a git commit with a well-formed message based on staged and unstaged changes
model: claude-3-5-haiku-20241022
---

# Git Commit Command

## Context

- Current git status: !`git status`
- Current git diff (staged and unstaged changes): !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`

## Your Task

Based on the above changes, create a single git commit.

## Conventional Commits Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

| Type       | Description                                      | SemVer Impact |
|------------|--------------------------------------------------|---------------|
| `feat`     | Introduces a new feature                         | MINOR         |
| `fix`      | Patches a bug                                    | PATCH         |
| `docs`     | Documentation only changes                       | -             |
| `style`    | Formatting, whitespace (no code logic change)    | -             |
| `refactor` | Code change that neither fixes a bug nor adds a feature | -      |
| `perf`     | Performance improvement                          | -             |
| `test`     | Adding or correcting tests                       | -             |
| `build`    | Changes to build system or dependencies          | -             |
| `ci`       | Changes to CI configuration                      | -             |
| `chore`    | Other changes that don't modify src or test      | -             |

## Guidelines

1. **Type is required** - Must be lowercase, followed by a colon and space
2. **Scope is optional** - Use parentheses to provide context: `feat(auth): add login`
3. **Description** - Imperative mood, lowercase, no period at end
4. **Body** - Separated by blank line, explains *what* and *why* (not how)
5. **Footer** - For metadata like `Reviewed-by:`, `Refs:`, issue references

## Breaking Changes

Indicate breaking changes (MAJOR version bump) using either:

1. **Exclamation mark** before the colon: `feat!: remove deprecated API`
2. **Footer notation**: Add `BREAKING CHANGE: description` in the footer

Breaking changes can be part of any type.

## Example Commits

```bash
# Simple feature
git commit -m "feat: add user profile page"

# Feature with scope
git commit -m "feat(api): add endpoint for user preferences"

# Bug fix with body
git commit -m "fix: prevent null pointer in user validation

The email validation was failing when user object was undefined.
Added null check before accessing email property."

# Breaking change with exclamation mark
git commit -m "feat(auth)!: require email verification for signup"

# Breaking change with footer
git commit -m "refactor: drop support for Node 14

BREAKING CHANGE: Node 14 is no longer supported. Minimum version is now Node 18."

# Commit with issue reference
git commit -m "fix(parser): handle edge case in date parsing

Closes #142"
```

## Important

- Stage all relevant files before committing
- Don't commit unrelated changes together
- Ensure all validation passes before committing (typecheck, lint)
