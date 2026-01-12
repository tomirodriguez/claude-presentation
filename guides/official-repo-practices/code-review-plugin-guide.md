# Code Review Plugin Guide

A comprehensive guide to the Claude Code Review Plugin - the automated PR review system with 4 parallel agents and confidence scoring.

**Source**: [Official Anthropic Repository](https://github.com/anthropics/claude-code/tree/main/plugins/code-review)
**Author**: Boris Cherny (boris@anthropic.com)
**Version**: 1.0.0

---

## Table of Contents

1. [What is the Code Review Plugin?](#what-is-the-code-review-plugin)
2. [How It Works (The 4-Agent Architecture)](#how-it-works-the-4-agent-architecture)
3. [Confidence Scoring System](#confidence-scoring-system)
4. [Command Usage](#command-usage)
5. [Output Formats](#output-formats)
6. [CLAUDE.md Integration](#claudemd-integration)
7. [False Positive Filtering](#false-positive-filtering)
8. [Best Practices](#best-practices)
9. [When to Use (and When Not To)](#when-to-use-and-when-not-to)
10. [Configuration and Customization](#configuration-and-customization)
11. [Troubleshooting](#troubleshooting)

---

## What is the Code Review Plugin?

The Code Review Plugin is an automated pull request auditing system built for Claude Code. It launches **multiple AI agents in parallel** to independently review code changes from different perspectives, using a sophisticated confidence scoring system to minimize false positives and deliver high-signal feedback.

### Key Features

- **Multi-agent architecture**: 4 specialized agents working in parallel for comprehensive coverage
- **Confidence-based filtering**: Scores from 0-100 eliminate noise while maintaining quality
- **CLAUDE.md compliance checking**: Verifies adherence to project-specific guidelines
- **Bug detection**: Identifies obvious bugs in new changes (not pre-existing issues)
- **Historical context analysis**: Uses git blame and commit history for context-aware reviews
- **Direct GitHub integration**: Posts inline comments directly to pull requests
- **Parallel execution**: Fast reviews through concurrent agent processing

### Requirements

- Git repository with GitHub integration
- GitHub CLI (`gh`) installed and authenticated
- CLAUDE.md files (optional but recommended for compliance checking)

---

## How It Works (The 4-Agent Architecture)

The plugin employs a unique multi-agent approach where **4 independent agents run simultaneously**, each focusing on a specific aspect of code review. This design prevents groupthink and improves detection breadth.

### The Review Process (8 Steps)

```
Step 1: Pre-flight Checks (Haiku Agent)
         |
Step 2: Locate CLAUDE.md Files (Haiku Agent)
         |
Step 3: Summarize PR Changes (Sonnet Agent)
         |
Step 4: Parallel Multi-Agent Review (4 Agents)
         |
Step 5: Validation Subagents (Verify Findings)
         |
Step 6: Filter Results (Remove Low-Confidence)
         |
Step 7: Post Inline Comments
         |
Step 8: Summary Comment
```

### Agent Breakdown

#### Agent 1 and 2: CLAUDE.md Compliance Auditors

**Model**: Claude Sonnet
**Purpose**: Verify that code changes comply with project guidelines

These two agents work redundantly (for reliability) to:
- Read all relevant CLAUDE.md files in the repository
- Check each code change against documented guidelines
- Flag violations with explicit quotes from CLAUDE.md
- Ensure consistency with project coding standards

**Example Finding**:
```
Missing error handling for OAuth callback
(CLAUDE.md says: "Always handle OAuth errors gracefully")
```

The redundancy of having two compliance auditors ensures that important guideline violations are not missed due to any single agent's oversight.

#### Agent 3: Bug Detector

**Model**: Claude Opus
**Purpose**: Scan for obvious bugs in the changed code

This agent focuses exclusively on:
- Compilation and parse errors
- Definite logic errors
- Runtime exceptions waiting to happen
- Type mismatches and null pointer risks
- Memory leaks and resource management issues

**Important**: Agent 3 only reviews **new changes** - it does not flag pre-existing issues in the codebase. This prevents noise from legacy code problems.

**Example Finding**:
```
Memory leak: OAuth state not cleaned up after authentication
(Missing cleanup in finally block at src/auth.ts#L88-L95)
```

#### Agent 4: History and Context Analyzer

**Model**: Claude Opus
**Purpose**: Provide context-based issue identification using git history

This agent leverages:
- `git blame` to understand code ownership and evolution
- Commit history to identify patterns and previous fixes
- Repository context to understand the broader impact of changes
- Historical precedent for similar code patterns

This contextual awareness helps identify issues that might not be obvious from the code alone, such as:
- Regression risks (changing code that was previously fixed)
- Pattern violations (doing something differently than established norms)
- Integration concerns (changes that might conflict with other work)

### Why Multiple Agents?

The multi-agent approach provides several advantages:

1. **Diversity of Perspective**: Each agent approaches the code with different priorities
2. **Reduced Groupthink**: Independent analysis prevents confirmation bias
3. **Specialized Focus**: Agents can be experts in their specific domain
4. **Parallel Processing**: All agents run simultaneously for faster results
5. **Redundancy**: Critical checks (like CLAUDE.md compliance) are verified twice

---

## Confidence Scoring System

Every issue flagged by the review agents receives a **confidence score from 0 to 100**. This scoring system is central to the plugin's ability to provide high-signal feedback.

### Score Ranges

| Score | Confidence Level | Interpretation |
|-------|-----------------|----------------|
| **0** | Not confident | Definitely a false positive |
| **25** | Somewhat confident | Might be a real issue |
| **50** | Moderately confident | Real issue, but minor |
| **75** | Highly confident | Real and important issue |
| **100** | Absolutely certain | Definitely a real problem |

### Default Threshold: 80

By default, only issues with a confidence score of **80 or higher** are included in the final report. This aggressive filtering eliminates:

- Pre-existing issues not introduced by the PR
- Pedantic nitpicks that do not affect functionality
- Issues that linters or type checkers will catch
- Code with explicit lint ignore comments (intentionally silenced)
- Subjective style preferences

### How Confidence is Determined

The validation subagents (Step 5) determine confidence based on:

1. **Certainty of the issue**: Is this definitely a bug, or just potentially problematic?
2. **Evidence quality**: Can we point to specific code and explain why it is wrong?
3. **Context support**: Does git history or CLAUDE.md back up this finding?
4. **Reproducibility**: Would other reviewers independently flag this?

### Adjusting the Threshold

You can customize the confidence threshold by editing the command definition file:

**File**: `commands/code-review.md`

Find this line:
```markdown
Filter out any issues with a score less than 80.
```

Change `80` to your preferred threshold:
- **Lower threshold (60-70)**: More findings, potentially more noise
- **Higher threshold (90-100)**: Fewer findings, only critical issues
- **Default (80)**: Balanced approach, recommended for most projects

---

## Command Usage

### Basic Usage

```bash
# Review the current PR and output to terminal
/code-review

# Review and post comments directly to the PR
/code-review --comment
```

### The `--comment` Flag

When you include the `--comment` flag, the plugin:

1. Posts inline comments on specific lines of the PR
2. Uses the GitHub CLI (`gh`) to interact with the PR
3. Creates one comment per unique issue found
4. Posts a summary comment if no issues are found

Without `--comment`, results are displayed in your terminal for local review before deciding to post.

### Automatic Skip Conditions

The plugin intelligently skips reviews when they are not needed:

| Condition | Behavior |
|-----------|----------|
| PR is closed | Skips review |
| PR is a draft | Skips review |
| Trivial/automated PR | Skips review |
| Claude already commented | Skips review |
| Claude-generated PR | Still reviews (self-review is valuable) |

---

## Output Formats

### Terminal Output

When running without `--comment`, you will see formatted output in your terminal:

```markdown
## Code Review

Found 3 issues:

1. Missing error handling for OAuth callback
   (CLAUDE.md says "Always handle OAuth errors")
   https://github.com/owner/repo/blob/abc123def456.../src/auth.ts#L67-L72

2. Memory leak: OAuth state not cleaned up
   (Bug: missing cleanup in finally block)
   https://github.com/owner/repo/blob/abc123def456.../src/auth.ts#L88-L95

3. Potential null pointer when user session expires
   (Historical: similar bug was fixed in commit a1b2c3d)
   https://github.com/owner/repo/blob/abc123def456.../src/session.ts#L42-L48
```

### PR Comment Format

When using `--comment`, inline comments are posted with:

**For small fixes (6 lines or fewer)**:
```markdown
Brief description of the issue.

```suggestion
// Corrected code here
```
```

**For larger fixes (more than 6 lines)**:
```markdown
Brief description of the issue.

This requires a structural change: [narrative explanation of what needs to change and why].
```

### Link Format Requirements

All code references use this format:
```
https://github.com/owner/repo/blob/[FULL_SHA]/path/to/file#L[start]-L[end]
```

- **Full SHA**: Never abbreviated (ensures permanent links)
- **Line notation**: Uses `#L` format for line ranges
- **Context**: Minimum 1 line of surrounding context included

### No Issues Found

If the review finds no issues meeting the confidence threshold:

```markdown
No issues found. Checked for bugs and CLAUDE.md compliance.
```

---

## CLAUDE.md Integration

The plugin heavily relies on CLAUDE.md files for compliance checking. These files define project-specific guidelines that Agents 1 and 2 verify.

### How CLAUDE.md Files Are Located

1. **Root CLAUDE.md**: The main guidelines file in the repository root
2. **Directory-specific**: CLAUDE.md files in directories containing modified files
3. **Hierarchical**: Guidelines are inherited from parent directories

### What Makes Effective CLAUDE.md Guidelines

For the best code review results, your CLAUDE.md should include:

```markdown
# Project Guidelines

## Error Handling
- Always handle OAuth errors gracefully
- Log errors before re-throwing
- Never swallow exceptions without logging

## Code Style
- Use TypeScript strict mode
- Prefer async/await over raw Promises
- Document all public API functions

## Security
- Never store secrets in code
- Always validate user input
- Use parameterized queries for databases

## Testing
- All new features require tests
- Maintain 80% code coverage minimum
- Mock external services in unit tests
```

### Compliance Violation Format

When a CLAUDE.md violation is found:

```markdown
[Issue description]
(CLAUDE.md says: "[exact quote from guidelines]")
```

The explicit quoting ensures transparency about why the issue was flagged.

---

## False Positive Filtering

One of the plugin's strengths is its aggressive filtering of false positives. Understanding what gets filtered helps you trust the results.

### Automatically Excluded Issues

| Category | Reason |
|----------|--------|
| **Pre-existing issues** | Not introduced by this PR |
| **Style concerns** | Subjective, not bugs |
| **Potential issues** | Require specific inputs to manifest |
| **Linter-catchable** | Dedicated tools handle these better |
| **Silenced code** | Explicit lint ignore comments respected |
| **Pedantic nitpicks** | Low value, high noise |
| **General quality** | Unless explicitly in CLAUDE.md |

### High-Signal Issues (Always Flagged)

| Category | Examples |
|----------|----------|
| **Compilation errors** | Syntax errors, type mismatches |
| **Definite logic errors** | Off-by-one, null dereference |
| **CLAUDE.md violations** | With explicit rule quotes |
| **Security issues** | Injection vulnerabilities, exposed secrets |

### The Validation Layer

After the 4 agents complete their parallel review, **validation subagents** verify each finding:

1. Re-examine the flagged code
2. Verify the issue is real (not a false positive)
3. Assign a confidence score
4. Filter out anything below threshold

This two-stage approach significantly reduces noise.

---

## Best Practices

### For Optimal Results

1. **Maintain detailed CLAUDE.md files**
   - Specific guidelines get better compliance checking
   - Include examples of good and bad patterns

2. **Run on all meaningful PRs**
   - Skip trivial changes (the plugin does this automatically)
   - Review Claude-generated PRs too (self-review is valuable)

3. **Use `--comment` for team visibility**
   - Inline comments help all reviewers
   - Creates a record of automated findings

4. **Review findings before merging**
   - Automated review is a starting point, not final judgment
   - Use your expertise to evaluate suggestions

5. **Iterate on your threshold**
   - Start with default (80)
   - Lower if you want more coverage
   - Raise if you are getting noise

### For Team Adoption

1. **Integrate with CI/CD**
   - Run code review on every PR automatically
   - Block merges for high-confidence issues

2. **Establish feedback loops**
   - Track false positive rates
   - Update CLAUDE.md based on common issues

3. **Train the team**
   - Explain the confidence scoring system
   - Set expectations for automated vs. human review

---

## When to Use (and When Not To)

### Ideal Use Cases

| Scenario | Why It Works |
|----------|--------------|
| **Feature PRs** | Complex changes benefit from multi-agent review |
| **Cross-team PRs** | Compliance checking ensures consistency |
| **Large PRs** | Parallel agents handle scale efficiently |
| **Security-sensitive code** | Bug detection catches vulnerabilities |
| **Onboarding new developers** | CLAUDE.md compliance helps learning |

### When to Skip

| Scenario | Why to Skip |
|----------|------------|
| **Draft PRs** | Plugin skips these automatically |
| **Documentation-only PRs** | Limited value for pure docs |
| **Automated dependency updates** | Trivial changes, auto-skipped |
| **Emergency hotfixes** | May need faster human review |
| **Already heavily reviewed** | Diminishing returns |

### Complementary Tools

The Code Review plugin works best alongside:

- **Linters** (ESLint, Pylint): Handle style and formatting
- **Type checkers** (TypeScript, MyPy): Catch type errors
- **Security scanners** (Snyk, Dependabot): Dependency vulnerabilities
- **Human reviewers**: Final judgment and architectural review

---

## Configuration and Customization

### Plugin Structure

```
plugins/code-review/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata
├── commands/
│   └── code-review.md    # Command definition and agent prompts
└── README.md             # Documentation
```

### Plugin Metadata (plugin.json)

```json
{
  "name": "code-review",
  "description": "Automated code review for pull requests using multiple specialized agents with confidence-based scoring",
  "version": "1.0.0",
  "author": {
    "name": "Boris Cherny",
    "email": "boris@anthropic.com"
  }
}
```

### Customizing Agent Focus

Edit `commands/code-review.md` to modify agent behavior:

**Add a security-focused agent**:
```markdown
## Agent 5: Security Auditor
- Check for SQL injection vulnerabilities
- Verify input validation on all endpoints
- Ensure secrets are not exposed
```

**Add a performance analysis agent**:
```markdown
## Agent 6: Performance Analyzer
- Identify N+1 query patterns
- Flag expensive operations in loops
- Check for memory allocation issues
```

**Add accessibility checking**:
```markdown
## Agent 7: Accessibility Checker
- Verify ARIA labels on interactive elements
- Check color contrast ratios
- Ensure keyboard navigation works
```

### Allowed Tools

The plugin uses these tools for GitHub interaction:

```markdown
Bash commands:
- gh issue view
- gh search
- gh issue list
- gh pr comment
- gh pr diff
- gh pr view
- gh pr list

MCP GitHub tool:
- create_inline_comment
```

---

## Troubleshooting

### Common Issues

#### "No issues found" when you expected findings

**Possible causes**:
1. Confidence threshold is too high (try lowering from 80)
2. Issues are pre-existing (not introduced by this PR)
3. CLAUDE.md guidelines are too vague

**Solutions**:
- Review terminal output for filtered issues
- Check if issues exist in the base branch
- Add more specific guidelines to CLAUDE.md

#### Plugin skips the PR

**Check if**:
- PR is marked as draft
- PR is already closed
- PR appears trivial/automated
- Claude has already commented

**Solution**: For draft PRs, mark as ready for review first

#### Comments not posting

**Check**:
1. GitHub CLI is authenticated: `gh auth status`
2. You have write access to the repository
3. The PR is not locked

**Solution**: Run `gh auth login` to refresh authentication

#### Too many false positives

**Solutions**:
1. Raise the confidence threshold (try 85 or 90)
2. Update CLAUDE.md to be more precise
3. Add explicit lint ignore comments for intentional patterns

#### Review is slow

**Possible causes**:
- Very large PR with many files
- Network latency to GitHub API

**Solutions**:
- Break large PRs into smaller ones
- The parallel agent architecture already optimizes for speed

### Getting Help

1. **Check the official repository**: [anthropics/claude-code](https://github.com/anthropics/claude-code)
2. **Review the README**: Most common questions are answered there
3. **File an issue**: For bugs or feature requests

---

## Summary

The Code Review Plugin brings sophisticated, multi-agent automated review to your pull requests. By combining:

- **4 parallel agents** for comprehensive coverage
- **Confidence scoring** to filter noise
- **CLAUDE.md integration** for project-specific compliance
- **Flexible output** for terminal or PR comments

You get high-signal code review feedback that complements your existing tools and human reviewers. Start with the defaults, iterate on your configuration, and let the plugin catch issues before they reach production.

---

*This guide was created based on the official Anthropic repository at [github.com/anthropics/claude-code](https://github.com/anthropics/claude-code/tree/main/plugins/code-review).*
