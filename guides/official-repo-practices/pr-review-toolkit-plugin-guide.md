# PR Review Toolkit: Complete Guide

A comprehensive guide to the PR Review Toolkit plugin for Claude Code, featuring 6 specialized agents for thorough pull request review.

**Source**: [Official Anthropic Repository](https://github.com/anthropics/claude-code/tree/main/plugins/pr-review-toolkit)

---

## Table of Contents

1. [What is PR Review Toolkit?](#what-is-pr-review-toolkit)
2. [The 6 Specialized Agents](#the-6-specialized-agents)
3. [Command Usage](#command-usage)
4. [How to Trigger Each Agent](#how-to-trigger-each-agent)
5. [Understanding Agent Outputs](#understanding-agent-outputs)
6. [Workflow Recommendations](#workflow-recommendations)
7. [Best Practices](#best-practices)
8. [Real-World Examples](#real-world-examples)
9. [Configuration Options](#configuration-options)
10. [Troubleshooting](#troubleshooting)

---

## What is PR Review Toolkit?

The PR Review Toolkit is an official Claude Code plugin that provides a comprehensive collection of specialized agents designed to perform thorough pull request reviews. Rather than relying on a single generic code review, the toolkit breaks down the review process into six distinct concerns, each handled by a purpose-built agent.

### Key Benefits

- **Comprehensive Coverage**: Each agent specializes in a specific aspect of code quality
- **Automatic Triggering**: Agents activate based on natural language requests
- **Structured Feedback**: All output includes file/line references and actionable recommendations
- **Flexible Execution**: Run agents individually or combine them for full PR analysis
- **Proactive Detection**: Agents identify issues before they reach production

### Installation

```bash
/plugins
# Search for "pr-review-toolkit"
# Install the plugin
```

Once installed, the agents become available automatically and can be triggered through natural conversation or explicit commands.

---

## The 6 Specialized Agents

### 1. Comment Analyzer

**Purpose**: Validates code documentation accuracy and identifies outdated or misleading comments.

**What It Analyzes**:

| Dimension | Description |
|-----------|-------------|
| Factual Verification | Ensures documented parameters, return types, behavior, and edge cases match actual implementation |
| Completeness Assessment | Confirms critical preconditions, side effects, error handling, and business logic rationale are documented |
| Long-term Value | Prioritizes "why" over "what," removes obvious restatements |
| Misleading Content Detection | Identifies ambiguous language, outdated references, and unsupported assumptions |
| Targeted Improvements | Provides specific rewrite suggestions |

**Core Philosophy**: Comments should explain *why* code exists, not *what* it does. The agent identifies "comment rot" - documentation that has drifted from the actual implementation over time.

**Output Structure**:
- Summary of documentation health
- Critical issues requiring immediate attention
- Enhancement opportunities
- Recommended removals (unnecessary comments)
- Positive examples worth preserving

---

### 2. PR Test Analyzer

**Purpose**: Assesses test coverage quality and identifies critical gaps in test suites.

**What It Analyzes**:

| Dimension | Description |
|-----------|-------------|
| Behavioral Coverage | Examines critical code paths and edge cases (not just line coverage metrics) |
| Gap Identification | Detects untested error handling, missing negative test cases, uncovered business logic |
| Test Quality | Ensures tests verify behavior contracts and would catch meaningful regressions |
| Implementation Coupling | Flags tests that are too tightly coupled to implementation details |

**Rating Scale (1-10)**:

| Score | Category | Description |
|-------|----------|-------------|
| 9-10 | Critical Gaps | Address potential data loss, security issues, or system failures |
| 5-7 | Important Improvements | Target edge cases and business logic branches |
| 1-4 | Optional Enhancements | Nice-to-have tests that improve coverage marginally |

**Analysis Process**:
1. Examines PR changes to understand modifications
2. Maps test coverage to new functionality
3. Identifies critical paths that could cause production issues
4. Checks for implementation-coupled tests
5. Evaluates missing negative cases and error scenarios

---

### 3. Silent Failure Hunter

**Purpose**: Detects inadequate error handling, silent failures, and problematic fallback behavior.

**Core Philosophy**: "Zero tolerance for silent failures."

**What It Detects**:

| Issue Type | Description |
|------------|-------------|
| Empty Catch Blocks | Try-catch statements that swallow errors without logging or handling |
| Silent Returns | Functions that return default values on error without notification |
| Vague Error Messages | Generic messages that don't help users understand what went wrong |
| Broad Exception Catching | Catch-all handlers that hide unrelated errors |
| Unsafe Fallbacks | Production code falling back to mock implementations |
| Optional Chaining Abuse | Excessive use of `?.` that masks real errors |

**Five-Step Review Methodology**:
1. **Locate** - Systematically find all error handling code
2. **Scrutinize** - Evaluate logging quality, user feedback, catch block specificity
3. **Examine** - Check if error messages are clear, specific, and actionable
4. **Check** - Look for hidden failures (empty catches, silent returns)
5. **Validate** - Ensure compliance with project standards

**Severity Levels**:
- **CRITICAL**: Errors that could cause data loss or security issues
- **HIGH**: Errors that significantly impact user experience
- **MEDIUM**: Errors that cause confusion or minor issues

---

### 4. Type Design Analyzer

**Purpose**: Evaluates type designs for encapsulation quality and invariant strength.

**Four Critical Dimensions (1-10 scale each)**:

| Dimension | What It Evaluates |
|-----------|-------------------|
| **Encapsulation** | Whether internal details remain hidden and invariants cannot be violated externally |
| **Invariant Expression** | How clearly constraints communicate through type structure (compile-time guarantees) |
| **Invariant Usefulness** | Whether invariants prevent actual bugs and align with business needs |
| **Invariant Enforcement** | Whether "illegal states remain unrepresentable" through constructor validation |

**Common Anti-Patterns Detected**:
- Anemic models (types with no behavior, just data)
- Exposed mutable internals
- Invariants enforced only through documentation
- Types that allow invalid states

**Core Philosophy**: Pragmatic improvements over perfection. The agent prefers compile-time safety mechanisms and clarity without unnecessary complexity.

---

### 5. Code Reviewer

**Purpose**: Validates code against project guidelines (CLAUDE.md) and detects bugs.

**What It Reviews**:

| Category | Focus Areas |
|----------|-------------|
| **Guidelines Compliance** | Import patterns, naming conventions, framework-specific rules |
| **Bug Detection** | Logic errors, null handling, security issues, performance problems |
| **Code Quality** | Duplication, error handling gaps, test coverage adequacy |

**Confidence Scoring (0-100)**:

| Score Range | Priority | Description |
|-------------|----------|-------------|
| 91-100 | Critical | Definite bugs or explicit guideline violations |
| 80-90 | High | Strong likelihood of issues requiring attention |
| Below 80 | Not Reported | Filtered out to minimize false positives |

**Default Behavior**:
- Analyzes unstaged changes via `git diff`
- Can be directed to specific files or directories
- Groups issues by severity with file:line references

---

### 6. Code Simplifier

**Purpose**: Refactors code for improved clarity and maintainability while preserving functionality.

**What It Improves**:

| Focus Area | Action |
|------------|--------|
| Nested Ternaries | Converts to switch statements or if/else chains |
| Deep Nesting | Flattens complex control flow |
| Redundant Abstractions | Removes unnecessary layers |
| Overly Compact Code | Expands "clever" solutions for readability |
| Inconsistent Patterns | Aligns with project standards |

**Guiding Principle**: "Readable, explicit code over overly compact solutions."

**Balance Imperative**: The agent avoids over-simplification that reduces clarity or creates unmaintainable solutions. The goal is elegant maintainability, not minimal line count.

**Scope**: Focuses refinements on recently modified code sections unless explicitly instructed otherwise.

---

## Command Usage

### Main Command

```
/pr-review-toolkit:review-pr
```

This command provides a comprehensive review using all applicable agents.

### Review Categories

The toolkit supports six review categories that map to the agents:

| Category | Agent Used |
|----------|------------|
| `comments` | comment-analyzer |
| `tests` | pr-test-analyzer |
| `errors` | silent-failure-hunter |
| `types` | type-design-analyzer |
| `code` | code-reviewer |
| `simplify` | code-simplifier |

### Execution Modes

**Sequential Execution** (Default):
- Agents run one at a time
- Clearer output, easier to follow
- Best for detailed review sessions

**Parallel Execution**:
- Faster comprehensive evaluation
- All agents run simultaneously
- Best for quick pre-commit checks

---

## How to Trigger Each Agent

Agents can be triggered automatically through natural language. Here are the trigger phrases for each:

### Comment Analyzer

```
"Check if the comments are accurate"
"Review the documentation I added"
"Analyze comments for technical debt"
"Are the docstrings up to date?"
"Verify my JSDoc comments"
```

### PR Test Analyzer

```
"Check if the tests are thorough"
"Review test coverage for this PR"
"Are there any critical test gaps?"
"Do I need more tests for this feature?"
"Analyze the test quality"
```

### Silent Failure Hunter

```
"Review the error handling"
"Check for silent failures"
"Analyze catch blocks in this PR"
"Are there any swallowed exceptions?"
"Find error handling issues"
```

### Type Design Analyzer

```
"Review the UserAccount type design"
"Analyze type design in this PR"
"Check if this type has strong invariants"
"Evaluate the encapsulation of my types"
"Are these types well-designed?"
```

### Code Reviewer

```
"Review my recent changes"
"Check if everything looks good"
"Review this code before I commit"
"Does this follow the project guidelines?"
"General code review please"
```

### Code Simplifier

```
"Simplify this code"
"Make this clearer"
"Refine this implementation"
"Can this be more readable?"
"Clean up this function"
```

### Comprehensive Review Request

For a full PR review, combine multiple requests:

```
"I'm ready to create this PR. Please:
1. Review test coverage
2. Check for silent failures
3. Verify code comments are accurate
4. Review any new types
5. General code review"
```

---

## Understanding Agent Outputs

### Common Output Elements

All agents provide structured output that includes:

| Element | Description |
|---------|-------------|
| **File Location** | Exact file path where issue was found |
| **Line Number** | Specific line(s) affected |
| **Issue Description** | Clear explanation of the problem |
| **Severity/Rating** | Prioritization of the issue |
| **Recommendation** | Specific suggestion for resolution |
| **Code Example** | Corrected code when applicable |

### Severity Tiers (General)

| Tier | Description | Action Required |
|------|-------------|-----------------|
| **Critical** | Blocking issues that must be fixed | Mandatory before merge |
| **Important** | Should be addressed | Strongly recommended |
| **Suggestions** | Optional improvements | Nice to have |
| **Strengths** | Positive patterns to preserve | Keep as-is |

### Agent-Specific Scoring

**Code Reviewer** (0-100 scale):
- 91-100: Critical - definite bugs or violations
- 80-90: High confidence issues
- Below 80: Not reported (noise reduction)

**PR Test Analyzer** (1-10 scale):
- 9-10: Critical gaps (data loss, security)
- 5-7: Important improvements
- 1-4: Optional enhancements

**Type Design Analyzer** (1-10 per dimension):
- Four separate scores for encapsulation, expression, usefulness, enforcement
- Overall assessment combines all dimensions

**Silent Failure Hunter** (Severity levels):
- CRITICAL: Data loss or security risk
- HIGH: Significant user impact
- MEDIUM: Confusion or minor issues

---

## Workflow Recommendations

### When to Use Each Agent

#### Before Committing Code

| Agent | Trigger Condition |
|-------|------------------|
| code-reviewer | Always - catches guideline violations and bugs |
| silent-failure-hunter | If you modified error handling or catch blocks |

#### Before Creating a PR

| Agent | Trigger Condition |
|-------|------------------|
| pr-test-analyzer | Always - verify adequate test coverage |
| comment-analyzer | If you added or modified comments/docs |
| type-design-analyzer | If you added or modified types |
| code-reviewer | Final sweep for any missed issues |

#### After PR is Approved

| Agent | Trigger Condition |
|-------|------------------|
| code-simplifier | Improve clarity and maintainability |

### Recommended Order

For a complete review, follow this sequence:

```
1. code-reviewer        (catch obvious issues first)
2. silent-failure-hunter (verify error handling)
3. pr-test-analyzer     (ensure test coverage)
4. comment-analyzer     (validate documentation)
5. type-design-analyzer (assess type quality)
6. code-simplifier      (final polish)
```

### Combining Agents

**Quick Pre-Commit Check**:
```
"Quick review: check for bugs and silent failures"
```

**Full PR Review**:
```
"Complete PR review: tests, errors, types, comments, and code"
```

**Documentation Focus**:
```
"Review comments and simplify the code"
```

**Safety Focus**:
```
"Check error handling and type safety"
```

---

## Best Practices

### General Guidelines

1. **Be Specific in Requests**
   - Instead of "review this," try "review error handling in the auth module"
   - Specific requests yield more targeted, useful feedback

2. **Use Proactively**
   - Run agents before creating PRs, not after
   - Catch issues early when they're cheaper to fix

3. **Address Critical Issues First**
   - Focus on blocking issues before improvements
   - Don't get distracted by style suggestions when there are bugs

4. **Iterate and Re-run**
   - After fixing issues, run the agent again
   - Verify fixes don't introduce new problems

5. **Don't Over-Use**
   - Focus on changed code, not entire codebase
   - Avoid analysis paralysis

### Agent-Specific Tips

**Comment Analyzer**:
- Run after finishing documentation
- Focus on public API documentation first
- Delete comments that just restate code

**PR Test Analyzer**:
- Run before claiming "tests complete"
- Pay attention to critical (9-10) gaps
- Consider both happy path and error cases

**Silent Failure Hunter**:
- Run whenever you touch error handling
- Every try-catch should be reviewed
- Prefer explicit error messages over generic ones

**Type Design Analyzer**:
- Run when introducing new domain types
- Focus on types with business invariants
- Consider "can this type represent invalid states?"

**Code Reviewer**:
- Have CLAUDE.md configured for best results
- Run after every significant change
- Trust the 80+ confidence threshold

**Code Simplifier**:
- Run as the final step
- Review suggestions carefully - not all simplifications are improvements
- Preserve readability over cleverness

---

## Real-World Examples

### Example 1: Silent Failure Detection

**Input Code**:
```typescript
async function fetchUserData(userId: string) {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    return null; // Silent failure!
  }
}
```

**Agent Output**:
```
ISSUE: Silent failure in error handling
Location: src/api/users.ts:15
Severity: CRITICAL

Description:
The catch block returns null without logging the error or
notifying the user. API failures will be indistinguishable
from "user not found" scenarios.

Hidden Errors:
- Network failures
- Authentication errors
- Server errors (500)
- Rate limiting

User Impact:
Users may see blank screens or incorrect "not found" messages
when the actual issue is a server problem.

Recommendation:
Log the error and either throw a typed error or return an
error result that callers can distinguish from valid null.

Corrected Code:
async function fetchUserData(userId: string): Promise<Result<User>> {
  try {
    const response = await api.get(`/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    logger.error('Failed to fetch user', { userId, error });
    return { success: false, error: 'Unable to load user data' };
  }
}
```

### Example 2: Test Coverage Analysis

**Context**: PR adds user registration validation

**Agent Output**:
```
TEST COVERAGE ANALYSIS

Summary:
Tests cover happy path registration but miss critical edge cases.

Critical Gaps (Score: 9):
- No test for duplicate email registration
- No test for SQL injection in username field
- No test for concurrent registration race condition

Important Improvements (Score: 6):
- Missing test for password strength validation failure
- No test for email format validation
- Missing test for empty required fields

Suggested Tests (Score: 9):
1. "should reject registration with existing email"
   - Prevents: Duplicate accounts, data integrity issues

2. "should sanitize username input"
   - Prevents: SQL injection, XSS attacks

3. "should handle concurrent registration atomically"
   - Prevents: Race condition creating duplicate users
```

### Example 3: Type Design Review

**Input Type**:
```typescript
interface Order {
  id: string;
  status: string;
  items: Item[];
  total: number;
}
```

**Agent Output**:
```
TYPE DESIGN ANALYSIS: Order

Encapsulation: 3/10
- All fields are directly exposed
- No control over mutations
- Status can be set to any arbitrary string

Invariant Expression: 2/10
- Status should be a union type, not string
- Total should be computed, not stored
- No distinction between draft and submitted orders

Invariant Usefulness: 4/10
- The type allows invalid states (negative total, empty items)
- Status transitions are not enforced

Invariant Enforcement: 2/10
- No constructor validation
- Mutations uncontrolled
- Illegal states are representable

Recommended Improvement:
type OrderStatus = 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered';

class Order {
  private constructor(
    readonly id: string,
    private _status: OrderStatus,
    private _items: readonly Item[]
  ) {
    if (_items.length === 0) throw new Error('Order must have items');
  }

  get status(): OrderStatus { return this._status; }
  get items(): readonly Item[] { return [...this._items]; }
  get total(): number { return this._items.reduce((sum, i) => sum + i.price, 0); }

  static create(items: Item[]): Order {
    return new Order(generateId(), 'draft', items);
  }
}
```

### Example 4: Comment Analysis

**Input Code**:
```typescript
// Fetches user data from the API
// Returns null if user doesn't exist
async function getUserById(id: string) {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}
```

**Agent Output**:
```
COMMENT ANALYSIS

Critical Issues:
1. Comment claims "returns null if user doesn't exist"
   Location: line 2
   Reality: Function throws an error for any non-OK response
   Impact: Callers expecting null will have unhandled exceptions

   Recommendation: Either update code to return null for 404,
   or update comment to document the throwing behavior.

Enhancement Opportunities:
- Add JSDoc with @throws annotation
- Document what "non-OK response" means

Recommended Removal:
- Line 1 "Fetches user data from the API" - obvious from function name
```

---

## Configuration Options

### Plugin Configuration

The PR Review Toolkit integrates with your project's existing configuration:

**CLAUDE.md Integration**:
- code-reviewer uses CLAUDE.md for project-specific guidelines
- code-simplifier follows CLAUDE.md style preferences
- Define custom rules that all agents respect

**Example CLAUDE.md additions**:
```markdown
## Code Review Guidelines

### Error Handling
- All errors must be logged with context
- User-facing errors must be actionable
- Never use empty catch blocks

### Type Design
- Domain types must validate invariants in constructors
- Prefer readonly properties
- Use union types over string for finite sets

### Testing
- All public functions require tests
- Test both success and failure paths
- Mock external dependencies
```

### Integration with Other Plugins

The PR Review Toolkit works well with:

| Plugin | Integration |
|--------|-------------|
| build-validator | Run build-validator first, then PR review |
| Custom project agents | Combine with project-specific review agents |

### Customizing Agent Behavior

While agents have default behaviors, you can guide them with specific requests:

```
"Review error handling, focusing on database operations"
"Check test coverage for the authentication module only"
"Analyze types in the domain layer"
```

---

## Troubleshooting

### Common Issues and Solutions

#### Agent Not Triggering

**Problem**: Natural language request doesn't activate expected agent.

**Solutions**:
- Be more explicit: "Use the pr-test-analyzer to review my tests"
- Use the direct command: `/pr-review-toolkit:review-pr`
- Check that the plugin is installed: `/plugins`

#### Too Many False Positives

**Problem**: Agent reports issues that aren't real problems.

**Solutions**:
- The code-reviewer uses 80+ confidence threshold by default
- For other agents, ask for "high-confidence issues only"
- Add context about your project's conventions

#### Agent Scope Too Broad

**Problem**: Agent analyzes entire codebase, not just changes.

**Solutions**:
- Be specific: "Review error handling in the files I changed"
- Use git-based scope: "Review my unstaged changes"
- Specify files: "Review src/auth/login.ts"

#### Missing Context

**Problem**: Agent suggestions don't fit project conventions.

**Solutions**:
- Ensure CLAUDE.md is configured with project guidelines
- Provide context: "We use X pattern for error handling"
- Add exceptions: "Ignore Y convention for this case"

#### Conflicting Recommendations

**Problem**: Different agents give contradictory advice.

**Solutions**:
- Prioritize by severity (critical > important > suggestions)
- Use judgment when simplification conflicts with clarity
- Ask for clarification: "Why does X conflict with Y?"

### Performance Tips

1. **Run Focused Reviews**
   - Specify files or modules to review
   - Avoid "review everything" requests on large codebases

2. **Use Sequential Mode for Debugging**
   - When issues are unclear, run agents one at a time
   - Easier to understand and address each concern

3. **Cache Project Context**
   - Ensure CLAUDE.md is up to date
   - Include common patterns and exceptions

### Getting Help

- Check the [official repository](https://github.com/anthropics/claude-code/tree/main/plugins/pr-review-toolkit)
- Review agent configurations in the `agents/` directory
- File issues for bugs or feature requests

---

## Quick Reference Card

| Agent | Focus | Trigger Phrase | Scoring |
|-------|-------|----------------|---------|
| comment-analyzer | Documentation | "Check comments" | Severity levels |
| pr-test-analyzer | Test coverage | "Review test coverage" | 1-10 scale |
| silent-failure-hunter | Error handling | "Check for silent failures" | CRITICAL/HIGH/MEDIUM |
| type-design-analyzer | Type design | "Review type design" | 1-10 (4 dimensions) |
| code-reviewer | General quality | "Review my code" | 0-100 confidence |
| code-simplifier | Code clarity | "Simplify this" | Suggestions |

### Recommended Workflow Cheat Sheet

```
Write Code
    |
    v
[code-reviewer] --> Fix critical issues
    |
    v
[silent-failure-hunter] --> Fix error handling
    |
    v
[pr-test-analyzer] --> Add missing tests
    |
    v
[comment-analyzer] --> Update documentation
    |
    v
[type-design-analyzer] --> Improve types (if applicable)
    |
    v
[code-simplifier] --> Final polish
    |
    v
Create PR
```

---

*Guide Version: 1.0*
*Last Updated: January 2026*
*Source: Official Anthropic Claude Code Repository*
