# Commit Commands Plugin Guide

A comprehensive guide to the Commit Commands plugin for Claude Code, which automates git workflows including commits, pull requests, and branch cleanup.

## Table of Contents

1. [What is Commit Commands?](#what-is-commit-commands)
2. [Command Reference](#command-reference)
3. [How Each Command Works](#how-each-command-works)
4. [Commit Message Generation](#commit-message-generation)
5. [PR Description Generation](#pr-description-generation)
6. [Best Practices](#best-practices)
7. [Integration with GitHub CLI](#integration-with-github-cli)
8. [Workflow Examples](#workflow-examples)
9. [Configuration Options](#configuration-options)
10. [Troubleshooting](#troubleshooting)

---

## What is Commit Commands?

The Commit Commands plugin is an official Anthropic plugin that streamlines git workflows by automating common operations through simple slash commands. Instead of executing multiple git commands individually, you can use a single command to handle entire workflows, from creating commits to opening pull requests.

### Key Benefits

- **Reduced Context Switching**: Stay focused on coding while Claude handles git operations
- **Consistent Commit Messages**: Claude analyzes your repository's commit history to match your team's style
- **Smart PR Descriptions**: Automatic generation of comprehensive PR summaries with test plans
- **Branch Cleanup Automation**: Keep your local repository tidy with automated cleanup of stale branches

### Installation

The Commit Commands plugin is included in the official Anthropic plugin marketplace. To install:

```bash
# Within Claude Code, run:
/plugin

# Navigate to the Discover tab and search for "commit-commands"
# Or install directly from command line:
claude plugin install @anthropic/commit-commands
```

### Plugin Structure

```
plugins/commit-commands/
├── .claude-plugin        # Plugin manifest
├── commands/
│   ├── commit.md         # /commit command definition
│   ├── commit-push-pr.md # /commit-push-pr command definition
│   └── clean_gone.md     # /clean_gone command definition
└── README.md             # Plugin documentation
```

---

## Command Reference

### /commit - Smart Git Commits

Creates a git commit with an automatically generated commit message based on your staged and unstaged changes.

**Usage:**
```bash
/commit
```

**What It Does:**
1. Analyzes current git status
2. Reviews both staged and unstaged changes
3. Examines recent commit messages to match repository style
4. Drafts an appropriate commit message
5. Stages relevant files
6. Creates the commit

**Allowed Tools:**
- `Bash(git add:*)`
- `Bash(git status:*)`
- `Bash(git commit:*)`

**Key Features:**
- Automatically matches your repository's commit message style
- Follows conventional commit practices
- Avoids committing files containing secrets
- Includes Claude Code attribution in the commit message

---

### /commit-push-pr - Full PR Workflow

A complete workflow command that commits, pushes, and creates a pull request in one step.

**Usage:**
```bash
/commit-push-pr
```

**What It Does:**
1. Creates a new branch (if currently on main/master)
2. Stages and commits changes with an appropriate message
3. Pushes the branch to origin
4. Creates a pull request using `gh pr create`
5. Provides the PR URL

**Allowed Tools:**
- `Bash(git checkout --branch:*)`
- `Bash(git add:*)`
- `Bash(git status:*)`
- `Bash(git push:*)`
- `Bash(git commit:*)`
- `Bash(gh pr create:*)`

**Requirements:**
- GitHub CLI (`gh`) must be installed and authenticated
- Repository must have a remote named `origin`

**Key Features:**
- Analyzes ALL commits in the branch (not just the latest)
- Creates comprehensive PR descriptions with summary and test plan
- Handles branch creation automatically
- Uses GitHub CLI for PR creation

---

### /clean_gone - Branch Cleanup

Cleans up local branches that have been deleted from the remote repository.

**Usage:**
```bash
/clean_gone
```

**What It Does:**
1. Lists all local branches to identify `[gone]` status
2. Identifies and removes worktrees associated with `[gone]` branches
3. Deletes all branches marked as `[gone]`
4. Provides feedback on removed branches

**Key Features:**
- Handles both regular branches and worktree branches
- Safely removes worktrees before deleting branches
- Shows clear feedback about what was removed
- Reports if no cleanup was needed

**When to Use:**
- After merging and deleting remote branches
- When local branch list is cluttered with stale branches
- During regular repository maintenance

---

## How Each Command Works

### /commit Deep Dive

When you run `/commit`, Claude executes a carefully orchestrated workflow:

**Step 1: Gather Context**

Claude runs three git commands in parallel to understand the current state:

```bash
# Check repository status
git status

# View all changes (staged and unstaged)
git diff HEAD

# Review recent commit history for style matching
git log --oneline -10
```

**Step 2: Analyze Changes**

Claude examines:
- Which files were modified, added, or deleted
- The nature of the changes (new feature, bug fix, refactoring, etc.)
- Patterns in your existing commit messages

**Step 3: Draft Commit Message**

Based on the analysis, Claude drafts a commit message that:
- Summarizes the nature of the changes
- Uses imperative mood ("Add" not "Added")
- Matches your repository's existing style
- Focuses on the "why" rather than the "what"

**Step 4: Create Commit**

Claude stages the appropriate files and creates the commit:

```bash
git add <relevant-files>
git commit -m "$(cat <<'EOF'
Your commit message here

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

**Step 5: Verify Success**

Claude runs `git status` after the commit to verify everything succeeded.

---

### /commit-push-pr Deep Dive

This command handles the complete PR workflow:

**Step 1: Assess Current State**

Claude runs parallel commands to understand:
- Current branch and status
- All staged and unstaged changes
- Whether the branch is tracking a remote
- Full commit history since diverging from the base branch

```bash
git status
git diff HEAD
git branch --show-current
git log origin/main..HEAD
git diff main...HEAD
```

**Step 2: Branch Creation (If Needed)**

If you're on the main branch, Claude creates a feature branch:

```bash
git checkout -b feature/descriptive-name
```

**Step 3: Commit Changes**

Following the same process as `/commit`, Claude creates an appropriate commit.

**Step 4: Push to Remote**

Claude pushes with the upstream flag:

```bash
git push -u origin feature-branch-name
```

**Step 5: Create Pull Request**

Using GitHub CLI, Claude creates a PR with a comprehensive description:

```bash
gh pr create --title "Your PR Title" --body "$(cat <<'EOF'
## Summary
- First change bullet point
- Second change bullet point
- Third change bullet point

## Test plan
- [ ] Step 1 to test
- [ ] Step 2 to test
- [ ] Step 3 to test

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### /clean_gone Deep Dive

This maintenance command keeps your local repository clean:

**Step 1: Identify Stale Branches**

```bash
git branch -v
```

This shows all local branches with their tracking status. Branches prefixed with `+` have worktrees attached, and those marked `[gone]` have been deleted from the remote.

**Step 2: Check Worktree Associations**

```bash
git worktree list
```

Claude identifies which worktrees are linked to `[gone]` branches.

**Step 3: Remove Worktrees**

For each `[gone]` branch with an associated worktree:

```bash
git worktree remove /path/to/worktree --force
```

**Step 4: Delete Branches**

```bash
git branch -D branch-name
```

**Step 5: Report Results**

Claude provides a summary of what was cleaned up or reports that no cleanup was necessary.

---

## Commit Message Generation

### How Claude Analyzes Changes

Claude uses a multi-step analysis process to generate appropriate commit messages:

**1. Diff Analysis**

Claude examines the actual code changes to understand:
- What files were modified
- The type of change (addition, modification, deletion)
- The scope of the change (single file, multiple files, entire feature)

**2. Change Classification**

Based on the diff, Claude classifies the change into categories:

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | Adding a new API endpoint |
| `fix` | Bug fix | Fixing a null pointer exception |
| `refactor` | Code restructure (no behavior change) | Extracting a helper function |
| `docs` | Documentation changes | Updating README |
| `test` | Adding or modifying tests | Adding unit tests |
| `style` | Code formatting (no logic change) | Fixing indentation |
| `perf` | Performance improvements | Optimizing a database query |
| `chore` | Maintenance tasks | Updating dependencies |

**3. Context Understanding**

Claude considers:
- File paths and directory structure
- Function and variable names
- Comments and documentation in the code
- Related changes across multiple files

### Style Matching with Existing Commits

One of the most powerful features of the `/commit` command is its ability to match your repository's existing commit style.

**How It Works:**

1. **History Analysis**: Claude reviews your last 10 commits to identify patterns:
   - Commit message format (conventional commits, sentence case, etc.)
   - Use of prefixes or tags
   - Line length preferences
   - Use of bullet points or paragraphs

2. **Pattern Recognition**: Claude identifies:
   - Common prefixes (`feat:`, `fix:`, `[JIRA-123]`, etc.)
   - Capitalization conventions
   - Punctuation preferences
   - Emoji usage (if any)

3. **Style Application**: The generated commit message follows the detected patterns.

**Examples of Style Matching:**

If your recent commits look like:
```
feat(auth): add JWT token validation
fix(api): handle null response in user service
docs(readme): update installation instructions
```

Claude will generate:
```
feat(ui): add dark mode toggle to settings
```

If your recent commits look like:
```
Add user authentication module
Fix sidebar navigation bug
Update API documentation
```

Claude will generate:
```
Add export functionality to dashboard
```

### Commit Message Format

Claude uses a HEREDOC format to ensure proper message formatting:

```bash
git commit -m "$(cat <<'EOF'
Commit message title (max 50 chars recommended)

Optional body explaining the "why" behind the changes.
Can include multiple paragraphs if needed.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

The Co-Authored-By line provides attribution to Claude Code while maintaining full credit for human developers.

---

## PR Description Generation

### What Gets Included

Claude generates comprehensive PR descriptions that include:

**1. Title**
- Concise summary of the overall change
- Follows similar conventions to commit messages
- Usually matches the main commit message or summarizes multiple commits

**2. Summary Section**
- 1-3 bullet points describing the changes
- Focuses on the "why" and impact, not just the "what"
- Covers all significant changes across all commits in the branch

**3. Test Plan Section**
- Bulleted checklist of testing steps
- Specific, actionable items for reviewers
- Covers key functionality and edge cases

**4. Attribution**
- Link to Claude Code for transparency

### Summary and Test Plan Format

**Standard PR Template:**

```markdown
## Summary
- Added new authentication flow using OAuth 2.0
- Implemented refresh token rotation for improved security
- Updated user session management to handle token expiration

## Test plan
- [ ] Verify login flow works with valid credentials
- [ ] Confirm refresh token rotates on each use
- [ ] Test session timeout behavior after token expiration
- [ ] Verify logout properly invalidates all tokens

Generated with [Claude Code](https://claude.com/claude-code)
```

### Analyzing All Commits

A key feature of `/commit-push-pr` is that it analyzes ALL commits in the branch, not just the latest one. This ensures the PR description accurately reflects the complete set of changes.

Claude uses:
```bash
git diff main...HEAD        # All changes since branching
git log origin/main..HEAD   # All commits since branching
```

This approach ensures:
- No changes are missed in the summary
- The test plan covers all new functionality
- Reviewers get a complete picture of the PR

---

## Best Practices

### Using /commit Effectively

**Do:**
- Let Claude analyze your changes naturally
- Trust the automated message, but verify accuracy
- Use for routine commits during development
- Review the staged changes before confirming

**Don't:**
- Commit files containing secrets (.env, credentials.json)
- Create empty commits (ensure you have changes first)
- Skip reviewing the generated message

**Recommended Workflow:**
```bash
# Make your code changes
# Review what will be committed
git status

# Let Claude handle the commit
/commit

# Continue development
```

### Using /commit-push-pr Effectively

**Do:**
- Use when you're ready to create a PR
- Ensure all changes are complete and tested locally
- Review the PR description after creation and edit if needed
- Use when you want to minimize context switching

**Don't:**
- Use for work-in-progress branches (use `/commit` instead)
- Skip reviewing the generated PR description
- Force push after the PR is created

**Recommended Workflow:**
```bash
# Complete your feature development
# Run local tests
npm test

# Create PR with full workflow
/commit-push-pr

# Review the PR on GitHub and make any description edits
```

### Using /clean_gone Effectively

**Do:**
- Run periodically to keep your branch list clean
- Use especially after merging multiple PRs
- Run after completing a sprint or release

**Don't:**
- Worry about losing work (only removes already-deleted remote branches)
- Run if you haven't synced with remote recently

**Recommended Workflow:**
```bash
# After merging PRs and switching back to main
git checkout main
git pull

# Clean up stale branches
/clean_gone

# Ready for next feature
git checkout -b feature/new-feature
```

### General Best Practices

1. **Trust but Verify**: Claude's automated messages are usually accurate, but always review them before pushing.

2. **Keep Commits Focused**: Make atomic commits that address a single concern. This helps Claude generate better commit messages.

3. **Regular Maintenance**: Run `/clean_gone` weekly or after major merge sessions.

4. **Combine Commands**: Use `/commit` during active development, then `/commit-push-pr` when ready for review.

5. **Review Before Push**: Always review changes before they leave your machine.

---

## Integration with GitHub CLI

### Prerequisites

The `/commit-push-pr` command requires GitHub CLI (`gh`) to be installed and authenticated.

**Installation:**

macOS:
```bash
brew install gh
```

Ubuntu/Debian:
```bash
sudo apt install gh
```

Windows:
```bash
winget install GitHub.cli
```

**Authentication:**

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

**Verification:**

```bash
gh auth status
```

### How Claude Uses GitHub CLI

Claude uses `gh pr create` with specific formatting:

```bash
gh pr create \
  --title "Your PR Title" \
  --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] Test step 1
- [ ] Test step 2

Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Additional gh Commands

While the plugin uses `gh pr create`, you can also use Claude for other GitHub operations:

```bash
# View PR status
gh pr status

# Check out a PR locally
gh pr checkout 123

# View PR diff
gh pr diff 123

# Merge a PR
gh pr merge 123
```

---

## Workflow Examples

### Quick Development Cycle

```bash
# Start working on a feature
git checkout -b feature/user-dashboard

# Make initial changes
# ...coding...

# Commit progress
/commit

# Continue development
# ...more coding...

# Another checkpoint commit
/commit

# Feature complete, create PR
/commit-push-pr
```

### Bug Fix Workflow

```bash
# Branch from main
git checkout main
git pull
git checkout -b fix/login-error

# Fix the bug
# ...coding...

# Commit and create PR in one step
/commit-push-pr
```

### Multi-Feature Sprint

```bash
# Feature 1
git checkout -b feature/auth
/commit
/commit
/commit-push-pr

# Feature 2
git checkout main
git pull
git checkout -b feature/dashboard
/commit
/commit-push-pr

# Clean up after merges
git checkout main
git pull
/clean_gone
```

### Code Review Response

```bash
# Address review comments
# ...make changes...

# Commit the fixes
/commit

# Push to existing PR
git push
```

### End of Sprint Maintenance

```bash
# Return to main and sync
git checkout main
git pull --prune

# Clean all merged branches
/clean_gone

# Verify clean state
git branch -v
```

---

## Configuration Options

### Disabling Co-Author Attribution

If you prefer not to include the Claude Code attribution in commits, add to your settings:

**`.claude/settings.local.json`:**
```json
{
  "includeCoAuthoredBy": false
}
```

### Custom Commit Command

You can create a customized version of the commit command by adding a file to your project:

**`.claude/commands/commit.md`:**
```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a commit following our team conventions
---

# Commit Guidelines

## Commit Format
Use conventional commits: `<type>(<scope>): <description>`

## Allowed Types
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

## Rules
- Title max 50 characters
- Use imperative mood
- Reference Jira tickets when applicable

$GIT_STATUS
$GIT_DIFF

Create a commit following these guidelines.
```

### Commit Message Template

For teams with specific commit message requirements, you can include a template in your custom command:

```markdown
## Template
```
<type>(<scope>): <title>

<body>

Refs: JIRA-XXX
```

Example:
```
feat(auth): add password reset flow

Implemented password reset functionality including:
- Email verification link generation
- Secure token handling
- Password update endpoint

Refs: JIRA-1234
```
```

---

## Troubleshooting

### /commit Creates Empty Commit

**Symptom:** Claude reports no changes to commit.

**Solutions:**
1. Verify you have actual changes:
   ```bash
   git status
   git diff HEAD
   ```

2. Ensure changes are in tracked files (not ignored by .gitignore)

3. Stage files manually if needed:
   ```bash
   git add .
   /commit
   ```

### /commit-push-pr Fails to Create PR

**Symptom:** Error when running `gh pr create`.

**Solutions:**

1. **Install GitHub CLI:**
   ```bash
   # macOS
   brew install gh

   # Ubuntu
   sudo apt install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Verify authentication:**
   ```bash
   gh auth status
   ```

4. **Check remote:**
   ```bash
   git remote -v
   ```
   Ensure you have an `origin` remote pointing to GitHub.

### /clean_gone Doesn't Find Branches

**Symptom:** No branches are cleaned up even though you've merged PRs.

**Solutions:**

1. **Update remote tracking:**
   ```bash
   git fetch --prune
   ```

2. **Verify branch status:**
   ```bash
   git branch -vv
   ```
   Look for `[gone]` status next to branch names.

3. **Check remote deletion:**
   - Ensure branches were actually deleted on GitHub after merge
   - Some repositories don't auto-delete branches after merge

### Commit Message Doesn't Match Style

**Symptom:** Generated commit message doesn't follow your team's conventions.

**Solutions:**

1. **Ensure sufficient history:**
   - Claude needs ~10 recent commits to learn your style
   - New repositories may need time to establish patterns

2. **Use a custom command:**
   - Create `.claude/commands/commit.md` with explicit guidelines
   - Specify your exact format requirements

3. **Be consistent:**
   - The more consistent your existing commits, the better Claude learns

### PR Description Is Incomplete

**Symptom:** PR description misses some changes or commits.

**Solutions:**

1. **Check branch divergence:**
   ```bash
   git log origin/main..HEAD
   ```
   Ensure all commits are visible.

2. **Verify base branch:**
   - The command compares against `main` by default
   - If using a different base, you may need manual adjustment

3. **Review and edit:**
   - Always review the generated PR description
   - Edit on GitHub if needed to add missing context

### Push Fails Due to Branch Protection

**Symptom:** Push is rejected by GitHub branch protection rules.

**Solutions:**

1. **Create a proper feature branch:**
   - Don't try to push directly to protected branches
   - The command should create a new branch if on main

2. **Check branch protection settings:**
   - Review repository settings on GitHub
   - Ensure you have permission to push to the target

### Authentication Issues

**Symptom:** GitHub operations fail with authentication errors.

**Solutions:**

1. **Re-authenticate with gh:**
   ```bash
   gh auth logout
   gh auth login
   ```

2. **Check token scopes:**
   ```bash
   gh auth status
   ```
   Ensure you have `repo` scope for private repositories.

3. **Use SSH vs HTTPS:**
   - Ensure your remote URL matches your authentication method
   - `gh repo set-default` can help configure this

---

## Summary

The Commit Commands plugin transforms git workflows from a series of manual commands into simple, intelligent operations. By leveraging Claude's understanding of your codebase and commit history, you get:

- **Consistent commit messages** that match your team's style
- **Comprehensive PR descriptions** that help reviewers understand your changes
- **Automated cleanup** that keeps your repository organized
- **Reduced context switching** so you can focus on coding

Start with `/commit` for daily development, graduate to `/commit-push-pr` when features are ready for review, and keep your workspace clean with periodic `/clean_gone` runs.

---

## Resources

- [Official Plugin Repository](https://github.com/anthropics/claude-code/tree/main/plugins/commit-commands)
- [Claude Code Documentation](https://code.claude.com/docs/en/overview)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)

---

**Plugin Author:** Anthropic
**Version:** 1.0.0
**Support:** support@anthropic.com
