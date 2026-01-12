# The Complete Guide to Feature Dev Plugin for Claude Code

> A comprehensive guide to the 7-phase structured feature development workflow from Anthropic's official Claude Code repository.

---

## Table of Contents

1. [What is Feature Dev?](#1-what-is-feature-dev)
2. [The 7-Phase Workflow](#2-the-7-phase-workflow)
3. [Specialized Agents](#3-specialized-agents)
4. [Command Usage](#4-command-usage)
5. [Best Practices for Each Phase](#5-best-practices-for-each-phase)
6. [When to Use Feature Dev](#6-when-to-use-feature-dev)
7. [Real-World Examples](#7-real-world-examples)
8. [Tips for Better Results](#8-tips-for-better-results)
9. [Integration with Other Tools](#9-integration-with-other-tools)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. What is Feature Dev?

Feature Dev is an official plugin for Claude Code that provides a **structured, 7-phase workflow** for developing features in any codebase. It embodies the philosophy that *"building features requires more than just writing code."*

### Core Philosophy

The plugin is built on four fundamental principles:

1. **Understand the codebase** before making changes
2. **Ask questions** to clarify ambiguous requirements
3. **Design thoughtfully** before implementing
4. **Review for quality** after building

### Why Use Feature Dev?

Traditional feature development often leads to:
- Code that does not follow existing patterns
- Missed edge cases and incomplete requirements
- Architectural decisions made without full context
- Quality issues discovered too late

Feature Dev addresses these problems by enforcing a structured workflow with specialized AI agents that explore your codebase, design architectures, and review code quality.

### Plugin Information

| Attribute | Value |
|-----------|-------|
| **Name** | feature-dev |
| **Version** | 1.0.0 |
| **Author** | Sid Bidasaria (Anthropic) |
| **Repository** | [anthropics/claude-code/plugins/feature-dev](https://github.com/anthropics/claude-code/tree/main/plugins/feature-dev) |

---

## 2. The 7-Phase Workflow

Feature Dev guides you through seven distinct phases, each with a specific purpose and deliverable. The workflow is designed to be interactive, with checkpoints where you provide input before proceeding.

```
Discovery -> Exploration -> Clarification -> Design -> Implementation -> Review -> Summary
   (1)          (2)            (3)           (4)          (5)            (6)       (7)
```

### Phase 1: Discovery

**Goal**: Understand what needs to be built

The Discovery phase is your starting point. Claude Code takes your initial feature request and works to fully understand the scope and purpose before any code analysis begins.

#### What Happens in This Phase

1. **Request Clarification**: Claude asks what problem you are solving
2. **Constraint Identification**: Identifies technical and business constraints
3. **Requirement Gathering**: Collects functional and non-functional requirements
4. **Scope Confirmation**: Summarizes understanding and asks for confirmation

#### Example Interaction

```
User: /feature-dev Add user authentication with OAuth

Claude: I understand you want to add user authentication with OAuth support.
Let me clarify a few things:

1. What OAuth providers do you want to support? (Google, GitHub, etc.)
2. Do you need to support multiple providers simultaneously?
3. Is this for a new application or adding to existing auth?
4. What should happen for users who already have accounts?

Please share any additional context about your authentication requirements.
```

#### Key Outputs

- Clear understanding of the feature purpose
- Identified constraints and requirements
- Confirmed scope with user agreement

---

### Phase 2: Codebase Exploration

**Goal**: Understand relevant existing code and patterns

This is where Feature Dev truly shines. It launches **2-3 parallel `code-explorer` agents**, each investigating different aspects of your codebase.

#### What Happens in This Phase

1. **Agent Launch**: Multiple code-explorer agents are spawned
2. **Parallel Investigation**: Each agent explores different areas:
   - Similar existing features
   - Architecture patterns
   - UI patterns and components
   - Data flow patterns
3. **File Identification**: Key files are identified and read
4. **Pattern Recognition**: Codebase conventions are documented

#### Example Agent Assignments

For an authentication feature, agents might explore:

| Agent | Focus Area | Investigation |
|-------|------------|---------------|
| Agent 1 | Similar Features | How does existing login/logout work? |
| Agent 2 | Architecture | What is the overall auth architecture? |
| Agent 3 | UI Patterns | How are forms and validation handled? |

#### Key Outputs

- Comprehensive summary of relevant codebase patterns
- List of key files to understand
- Identified conventions and standards
- Execution flow diagrams for similar features

---

### Phase 3: Clarifying Questions

**Goal**: Fill in gaps and resolve all ambiguities

Before any design work begins, Feature Dev ensures every ambiguity is resolved. This phase prevents costly mid-implementation pivots.

#### What Gets Clarified

- **Edge Cases**: What happens when X fails?
- **Error Handling**: How should errors be presented to users?
- **Integration Points**: How does this connect to existing systems?
- **Backward Compatibility**: Will this break existing functionality?
- **Performance Requirements**: Are there latency or throughput constraints?
- **Security Considerations**: What security measures are required?

#### Example Questions

```
Based on my exploration of your codebase, I have the following questions:

1. Edge Cases:
   - What should happen if OAuth provider is unavailable?
   - How do you want to handle expired tokens?

2. Integration:
   - Should this integrate with your existing session management in /lib/auth?
   - Do you want to emit events to your analytics system?

3. Data:
   - Should OAuth users be stored in the same users table?
   - What user profile fields should be populated from OAuth data?

Please answer these before I proceed with architecture design.
```

#### Important Note

**This phase blocks until you provide answers.** Claude will not proceed to design until all critical questions are resolved.

---

### Phase 4: Architecture Design

**Goal**: Design multiple implementation approaches

This phase launches **2-3 `code-architect` agents**, each designing a different approach to the feature.

#### Design Approaches

Each architect agent takes a different philosophical approach:

| Approach | Philosophy | Trade-offs |
|----------|------------|------------|
| **Minimal Changes** | Smallest change, maximum reuse | Faster to implement, may accumulate tech debt |
| **Clean Architecture** | Maintainability, elegant abstractions | More upfront work, better long-term |
| **Pragmatic Balance** | Speed + quality compromise | Balanced approach, good for most cases |

#### What Each Design Includes

1. **Patterns Analysis**: Which existing patterns to follow
2. **Architecture Decision**: Why this approach was chosen
3. **Component Design**: All components with responsibilities
4. **Implementation Map**: Every file to create or modify
5. **Data Flow**: How data moves through the system
6. **Build Sequence**: Order of implementation

#### Example Architecture Presentation

```
## Architecture Options

### Option A: Minimal Changes
- Add OAuth to existing AuthService
- Reuse current session handling
- 3 files modified, 1 new file
- Est. complexity: Low
- Trade-off: Less flexibility for future providers

### Option B: Clean Architecture
- New OAuthProvider abstraction layer
- Strategy pattern for multiple providers
- 6 files modified, 4 new files
- Est. complexity: Medium
- Trade-off: More upfront work, excellent extensibility

### Option C: Pragmatic Balance
- Lightweight provider abstraction
- Extend existing auth patterns
- 4 files modified, 2 new files
- Est. complexity: Low-Medium
- Trade-off: Good balance of speed and flexibility

**Recommendation**: Option C provides the best balance for your codebase.

Which approach would you like to proceed with?
```

#### Important Note

**You must choose an approach before implementation begins.** This ensures you have control over architectural decisions.

---

### Phase 5: Implementation

**Goal**: Build the feature following the chosen architecture

With requirements clarified and architecture approved, implementation begins.

#### What Happens in This Phase

1. **Explicit Approval**: Claude waits for your go-ahead
2. **File Reading**: All relevant files are read for context
3. **Convention Following**: Strict adherence to codebase patterns
4. **Progress Tracking**: TodoWrite tracks implementation progress
5. **Incremental Building**: Features built in logical sequence

#### Implementation Principles

- **Follow codebase conventions strictly**: Naming, formatting, patterns
- **Build in the sequence defined**: Architecture phases respected
- **Test as you go**: Where testing patterns exist
- **Communicate progress**: Regular updates on what is being built

#### Example Progress Updates

```
Implementation Progress:

[x] Created OAuth provider interface
[x] Implemented Google OAuth provider
[x] Added OAuth routes to API
[ ] Integrating with existing session management
[ ] Adding frontend login buttons
[ ] Writing integration tests
```

---

### Phase 6: Quality Review

**Goal**: Ensure code is simple, DRY, elegant, and functionally correct

Three `code-reviewer` agents run in parallel, each with a different focus.

#### Review Focus Areas

| Reviewer | Focus | Checks |
|----------|-------|--------|
| **Simplicity Reviewer** | Code Quality | DRY violations, complexity, elegance |
| **Correctness Reviewer** | Bugs | Logic errors, null handling, edge cases |
| **Conventions Reviewer** | Standards | Project patterns, naming, abstractions |

#### Confidence-Based Filtering

Code reviewers use a **confidence scoring system (0-100)**. Only issues with **confidence >= 80** are reported, reducing false positives.

#### Issue Severity Levels

- **Critical (75-100)**: Must fix before shipping
- **Important (50-74)**: Should fix soon
- **Minor (<50)**: Not reported (noise reduction)

#### Example Review Output

```
## Code Review Results

### Critical Issues

1. **Potential null reference** (confidence: 92)
   - File: /src/auth/oauth.ts:45
   - Issue: user.profile accessed without null check
   - Fix: Add `user?.profile` or guard clause

2. **Security concern** (confidence: 88)
   - File: /src/api/routes/oauth.ts:23
   - Issue: State parameter not validated
   - Fix: Validate state matches session state

### Important Issues

1. **DRY violation** (confidence: 82)
   - Files: /src/auth/google.ts:12, /src/auth/github.ts:14
   - Issue: Token refresh logic duplicated
   - Fix: Extract to shared utility

---

What would you like to do?
1. Fix all issues now
2. Fix critical only, defer important
3. Proceed without fixes
```

---

### Phase 7: Summary

**Goal**: Document what was accomplished

The final phase creates a comprehensive summary of the feature development.

#### Summary Contents

1. **What Was Built**: Feature overview and capabilities
2. **Key Decisions Made**: Architecture choices and rationale
3. **Files Modified**: Complete list of changed files
4. **Files Created**: New files added to the codebase
5. **Suggested Next Steps**: What to do after this feature

#### Example Summary

```
## Feature Development Complete

### What Was Built
OAuth authentication supporting Google and GitHub providers, integrated
with existing session management and user database.

### Key Decisions
- Used Strategy pattern for OAuth providers (Option C)
- Stored OAuth data in separate oauth_connections table
- Reused existing session token system

### Files Modified
- /src/auth/AuthService.ts
- /src/api/routes/auth.ts
- /src/db/schema.ts
- /src/components/LoginForm.tsx

### Files Created
- /src/auth/oauth/OAuthProvider.ts
- /src/auth/oauth/GoogleProvider.ts
- /src/auth/oauth/GitHubProvider.ts
- /src/api/routes/oauth.ts

### Suggested Next Steps
1. Add additional OAuth providers (Microsoft, Apple)
2. Implement account linking for existing users
3. Add OAuth-specific analytics events
4. Write comprehensive integration tests
```

---

## 3. Specialized Agents

Feature Dev uses three specialized agents, each designed for a specific role in the development workflow.

### code-explorer

**Purpose**: Deeply analyze existing codebase features by tracing execution paths

#### Visual Indicator
Yellow color in the interface

#### When It Is Used
- Phase 2: Codebase Exploration
- Manual invocation for understanding features

#### What It Does

1. **Feature Discovery**: Locates entry points, core files, configuration
2. **Code Flow Tracing**: Follows call chains, documents data transformations
3. **Architecture Analysis**: Maps abstraction layers, identifies patterns
4. **Implementation Details**: Examines algorithms, error handling, performance

#### Available Tools

| Tool | Purpose |
|------|---------|
| Glob | File pattern matching |
| Grep | Content searching |
| LS | Directory listing |
| Read | File reading |
| NotebookRead | Jupyter notebook reading |
| WebFetch | External documentation fetching |
| TodoWrite | Progress tracking |
| WebSearch | External searching |

#### Output Format

```
## Feature Analysis: User Authentication

### Entry Points
- /src/api/routes/auth.ts:15 - POST /login
- /src/api/routes/auth.ts:42 - POST /logout
- /src/components/LoginForm.tsx:1 - UI component

### Execution Flow
1. User submits credentials via LoginForm
2. Form calls AuthService.login()
3. AuthService validates against database
4. Session token generated and stored
5. Token returned to client in cookie

### Key Components
- AuthService: Central authentication logic
- SessionManager: Token lifecycle management
- UserRepository: Database operations

### Architecture Insights
- Uses repository pattern for data access
- JWT tokens with 24-hour expiry
- Sessions stored in Redis

### Essential Files to Read
1. /src/auth/AuthService.ts
2. /src/auth/SessionManager.ts
3. /src/db/repositories/UserRepository.ts
```

---

### code-architect

**Purpose**: Design feature architectures and implementation blueprints

#### Visual Indicator
Distinct color (varies by implementation)

#### When It Is Used
- Phase 4: Architecture Design
- Manual invocation for design planning

#### What It Does

1. **Codebase Analysis**: Extracts patterns, conventions, tech stack
2. **Architecture Design**: Creates integrated feature architectures
3. **Implementation Blueprints**: Specifies all files with component designs
4. **Build Sequencing**: Defines order of implementation

#### Design Philosophy

The code-architect makes **confident architectural choices** rather than presenting endless options. It commits to a single approach with clear rationale.

#### Output Format

```
## Architecture Blueprint: OAuth Authentication

### Patterns Found
- Repository pattern in /src/db/repositories/
- Service layer in /src/services/
- Route handlers in /src/api/routes/
- Component composition in /src/components/

### Architecture Decision
**Strategy Pattern for OAuth Providers**

Rationale: Your codebase already uses dependency injection and
interface-based abstractions. A strategy pattern allows easy addition
of new OAuth providers without modifying existing code.

### Component Design

#### OAuthProvider (Interface)
- Location: /src/auth/oauth/OAuthProvider.ts
- Responsibility: Define contract for all providers
- Methods: getAuthUrl(), exchangeCode(), getUserProfile()

#### GoogleProvider (Implementation)
- Location: /src/auth/oauth/GoogleProvider.ts
- Responsibility: Google-specific OAuth logic
- Dependencies: OAuthProvider interface, HttpClient

### Implementation Map

| Phase | Files | Description |
|-------|-------|-------------|
| 1 | OAuthProvider.ts | Create interface |
| 2 | GoogleProvider.ts | First implementation |
| 3 | oauth.ts (routes) | API endpoints |
| 4 | AuthService.ts | Integration |
| 5 | LoginForm.tsx | UI updates |

### Data Flow
User -> LoginForm -> OAuth Route -> Provider -> External OAuth
-> Callback Route -> AuthService -> Session -> Response

### Build Sequence Checklist
[ ] 1. Create OAuthProvider interface
[ ] 2. Implement GoogleProvider
[ ] 3. Add OAuth API routes
[ ] 4. Integrate with AuthService
[ ] 5. Update LoginForm component
[ ] 6. Add error handling
[ ] 7. Write tests
```

---

### code-reviewer

**Purpose**: Review code for bugs, quality issues, and project conventions

#### Visual Indicator
Red color in the interface

#### When It Is Used
- Phase 6: Quality Review
- Manual invocation for code review

#### What It Does

1. **Guideline Compliance**: Checks CLAUDE.md and project standards
2. **Bug Detection**: Finds logic errors, null issues, security problems
3. **Quality Assessment**: Evaluates DRY, error handling, test coverage
4. **Confidence Scoring**: Only reports issues with >= 80 confidence

#### Review Categories

| Category | What It Checks |
|----------|----------------|
| Simplicity | Code complexity, unnecessary abstractions |
| DRY | Duplicated logic, copy-paste code |
| Elegance | Readability, idiomatic patterns |
| Correctness | Logic errors, edge cases, null handling |
| Security | Vulnerabilities, injection risks |
| Conventions | Naming, formatting, project patterns |

#### Output Format

```
## Code Review: OAuth Implementation

### Critical Issues (Confidence >= 80)

#### Issue 1: Missing null check (Confidence: 95)
- **File**: /src/auth/oauth/GoogleProvider.ts:34
- **Code**: `const email = response.data.email`
- **Problem**: OAuth response may not include email
- **Fix**:
  ```typescript
  const email = response.data.email ?? throw new OAuthError('Email required')
  ```
- **Guideline Reference**: See CLAUDE.md section on error handling

#### Issue 2: State validation missing (Confidence: 91)
- **File**: /src/api/routes/oauth.ts:28
- **Problem**: OAuth state parameter not validated against session
- **Security Risk**: CSRF vulnerability
- **Fix**: Compare `req.query.state` with `req.session.oauthState`

### Important Issues (Confidence 50-79)

#### Issue 3: Potential performance issue (Confidence: 72)
- **File**: /src/auth/AuthService.ts:45
- **Problem**: User lookup on every token refresh
- **Suggestion**: Consider caching user data

### Summary
- Critical Issues: 2
- Important Issues: 1
- Files Reviewed: 8
- Lines Analyzed: 342
```

---

## 4. Command Usage

### Basic Usage

```bash
/feature-dev [description]
```

### Examples

```bash
# With description
/feature-dev Add user authentication with OAuth support

# Without description (interactive mode)
/feature-dev

# Specific feature request
/feature-dev Implement rate limiting for API endpoints with Redis backend

# Complex multi-part feature
/feature-dev Build a notification system with email, SMS, and push support
```

### Manual Agent Invocation

You can also invoke individual agents outside the full workflow:

```bash
# Explore a feature
"Launch code-explorer to trace how authentication works"

# Design architecture
"Launch code-architect to design the caching layer"

# Review code
"Launch code-reviewer to check my recent changes"
```

### Interactive vs. Directed Mode

| Mode | Command | Behavior |
|------|---------|----------|
| Interactive | `/feature-dev` | Asks for description, then guides through all phases |
| Directed | `/feature-dev Add X` | Starts with the description, still interactive at checkpoints |

---

## 5. Best Practices for Each Phase

### Phase 1: Discovery

**Do:**
- Provide context about why you need this feature
- Mention any constraints upfront (time, technology, compatibility)
- Be specific about success criteria

**Avoid:**
- Vague descriptions like "make it better"
- Implementation details (save for later phases)
- Assuming Claude knows your business context

### Phase 2: Codebase Exploration

**Do:**
- Let the exploration complete fully
- Read the key files identified
- Ask for more exploration if areas were missed

**Avoid:**
- Skipping this phase for "simple" features
- Ignoring patterns that do not match your expectations
- Rushing to implementation

### Phase 3: Clarifying Questions

**Do:**
- Answer every question thoroughly
- Provide examples where helpful
- Ask your own questions if you need clarification

**Avoid:**
- Giving vague answers like "whatever works"
- Skipping questions you are unsure about
- Assuming defaults without confirming

### Phase 4: Architecture Design

**Do:**
- Evaluate all options against your priorities
- Consider long-term maintenance
- Ask for clarification on trade-offs

**Avoid:**
- Always picking the "fastest" option
- Ignoring recommendations without reason
- Making decisions based on unfamiliarity with patterns

### Phase 5: Implementation

**Do:**
- Monitor progress updates
- Raise concerns immediately if something looks wrong
- Test incrementally where possible

**Avoid:**
- Interrupting mid-implementation with major changes
- Ignoring warning signs in progress updates
- Assuming everything is correct without review

### Phase 6: Quality Review

**Do:**
- Take critical issues seriously
- Fix security issues immediately
- Consider "important" issues for future sprints

**Avoid:**
- Dismissing all issues as "minor"
- Ignoring convention violations
- Shipping without addressing critical issues

### Phase 7: Summary

**Do:**
- Review the summary for accuracy
- Save the summary for documentation
- Act on suggested next steps

**Avoid:**
- Skipping the summary phase
- Ignoring suggested improvements
- Forgetting to document decisions

---

## 6. When to Use Feature Dev

### Ideal Use Cases

| Scenario | Why Feature Dev Helps |
|----------|----------------------|
| **New features touching multiple files** | Ensures all connections are understood |
| **Features requiring architectural decisions** | Presents options with trade-offs |
| **Complex integrations** | Maps existing patterns before changes |
| **Unclear requirements** | Structured clarification process |
| **Team onboarding** | Educates while implementing |
| **Legacy codebase modifications** | Explores patterns before changes |

### When NOT to Use Feature Dev

| Scenario | Better Alternative |
|----------|-------------------|
| **Single-line bug fixes** | Direct editing |
| **Trivial changes** | Quick implementation |
| **Well-defined simple tasks** | Standard development |
| **Urgent hotfixes** | Fast, focused fixes |
| **Pure documentation updates** | Direct writing |
| **Configuration changes** | Direct modification |

### Decision Framework

Ask yourself these questions:

1. **Does this touch more than 3 files?** If yes, consider Feature Dev
2. **Are the requirements ambiguous?** If yes, use Feature Dev
3. **Will this affect system architecture?** If yes, use Feature Dev
4. **Is this a simple, well-understood change?** If yes, skip Feature Dev
5. **Is this time-critical (hotfix)?** If yes, skip Feature Dev

---

## 7. Real-World Examples

### Example 1: Adding OAuth Authentication

```bash
/feature-dev Add OAuth authentication supporting Google and GitHub
```

**Phase 1 - Discovery:**
- Clarified: Google and GitHub providers needed
- Confirmed: Integrate with existing session system
- Scope: New users and existing user linking

**Phase 2 - Exploration:**
- Agent 1: Traced existing password authentication flow
- Agent 2: Analyzed session management patterns
- Agent 3: Reviewed user database schema

**Phase 3 - Clarification:**
- Q: What if user email exists? A: Allow account linking
- Q: Token storage approach? A: Use existing session tokens
- Q: Error display? A: Toast notifications

**Phase 4 - Design:**
- Option A (Minimal): Extend AuthService directly
- Option B (Clean): New OAuthProvider abstraction
- Option C (Pragmatic): Lightweight provider pattern
- Chosen: Option C

**Phase 5 - Implementation:**
- Created OAuthProvider interface
- Implemented Google and GitHub providers
- Added OAuth routes
- Updated login UI

**Phase 6 - Review:**
- Critical: State parameter validation missing (fixed)
- Important: Token refresh logic duplicated (deferred)

**Phase 7 - Summary:**
- 4 new files, 6 modified files
- OAuth working for both providers
- Next: Add Apple provider

---

### Example 2: API Rate Limiting

```bash
/feature-dev Implement rate limiting for API with Redis backend
```

**Phase 1 - Discovery:**
- Clarified: Per-user and per-IP limiting needed
- Limits: 100 requests/minute for authenticated, 20 for anonymous
- Confirmed: Redis already in use for caching

**Phase 2 - Exploration:**
- Agent 1: Traced API middleware chain
- Agent 2: Analyzed Redis usage patterns
- Agent 3: Reviewed error response formats

**Phase 3 - Clarification:**
- Q: Different limits per endpoint? A: Yes, configurable
- Q: Response for rate limited? A: 429 with retry-after header
- Q: Bypass for admin users? A: Yes

**Phase 4 - Design:**
- Chosen: Sliding window algorithm with Redis
- Middleware-based approach
- Configuration in environment variables

**Phase 5 - Implementation:**
- Created RateLimiter middleware
- Added Redis sliding window implementation
- Configured per-route limits
- Added bypass logic for admins

**Phase 6 - Review:**
- All issues addressed
- Performance validated

**Phase 7 - Summary:**
- 2 new files, 4 modified files
- Rate limiting active on all API routes
- Next: Add rate limit dashboard

---

### Example 3: Notification System

```bash
/feature-dev Build notification system with email, SMS, and push support
```

**Phase 1 - Discovery:**
- Clarified: Multi-channel notifications
- Priority: Email (required), SMS (optional), Push (optional)
- Templates needed for each channel

**Phase 2 - Exploration:**
- Agent 1: Analyzed existing email sending code
- Agent 2: Reviewed queue system for async jobs
- Agent 3: Checked user preference storage

**Phase 3 - Clarification:**
- Q: User preferences for channels? A: Per-notification-type
- Q: Retry failed notifications? A: 3 retries with exponential backoff
- Q: Template storage? A: Database with versioning

**Phase 4 - Design:**
- Strategy pattern for notification channels
- Queue-based async processing
- Template engine with variable substitution

**Phase 5 - Implementation:**
- NotificationChannel interface
- Email, SMS, Push implementations
- Queue worker for async processing
- Template management system

**Phase 6 - Review:**
- Critical: Missing unsubscribe handling (fixed)
- Important: SMS character limit handling (fixed)

**Phase 7 - Summary:**
- 12 new files, 8 modified files
- Full notification system operational
- Next: Add notification analytics

---

## 8. Tips for Better Results

### Preparation Tips

1. **Know your codebase basics**
   - Have CLAUDE.md up to date
   - Document existing patterns
   - Keep dependencies current

2. **Write clear feature descriptions**
   - Include the "why" not just the "what"
   - Mention constraints upfront
   - Be specific about success criteria

3. **Prepare for questions**
   - Think about edge cases beforehand
   - Know your performance requirements
   - Understand security needs

### During the Workflow

1. **Engage actively in every phase**
   - Do not just accept defaults
   - Ask questions when uncertain
   - Provide context Claude might miss

2. **Read suggested files**
   - Phase 2 identifies key files for a reason
   - Understanding context improves communication
   - You might catch issues Claude missed

3. **Choose architecture thoughtfully**
   - Consider your team's expertise
   - Think about maintenance burden
   - Balance speed vs. quality for your situation

### After Implementation

1. **Review the code yourself**
   - Claude's review is good but not perfect
   - You know edge cases Claude might miss
   - Catch project-specific issues

2. **Test thoroughly**
   - Automated tests where possible
   - Manual testing for UI features
   - Edge case verification

3. **Document decisions**
   - Save the Phase 7 summary
   - Update architectural documentation
   - Share learnings with team

### Communication Tips

1. **Be specific in answers**
   - "Use the existing UserService pattern" (good)
   - "Whatever works" (not helpful)

2. **Provide examples**
   - "Like how we handle payments in /src/payments" (good)
   - "Similar to what we have" (vague)

3. **Correct misunderstandings immediately**
   - Do not let wrong assumptions compound
   - Clarify before design phase if possible

---

## 9. Integration with Other Tools

### Works Well With

| Tool | Integration |
|------|-------------|
| **Git** | Feature Dev respects your git workflow |
| **Testing frameworks** | Implementations include tests where patterns exist |
| **CI/CD** | Generated code follows existing pipelines |
| **Linters/Formatters** | Code follows project configuration |
| **Documentation generators** | Code includes appropriate comments |

### Complementary Plugins

| Plugin | When to Use Together |
|--------|---------------------|
| **code-review** | Additional review after Feature Dev |
| **commit-commands** | Structured commits after implementation |
| **frontend-design** | UI-heavy features |

### IDE Integration

Feature Dev works within Claude Code, which integrates with:
- VS Code via Claude Code extension
- Terminal-based workflows
- Git-based project management

### Project Requirements

For best results, your project should have:

1. **Git repository**: Required for code review features
2. **Existing codebase**: Workflow assumes patterns to learn from
3. **CLAUDE.md** (optional but recommended): Project guidelines
4. **Consistent patterns**: More patterns = better suggestions

---

## 10. Troubleshooting

### Common Issues

#### Issue: Agents not finding relevant code

**Symptoms:**
- Phase 2 exploration seems incomplete
- "No similar features found" messages

**Solutions:**
1. Provide more specific feature descriptions
2. Mention existing similar features by name
3. Point to specific directories to explore
4. Check if code is in unusual locations

---

#### Issue: Clarifying questions seem excessive

**Symptoms:**
- Too many questions in Phase 3
- Questions about obvious things

**Solutions:**
1. Provide more context in initial description
2. Reference existing documentation
3. Answer with "standard" or "follow existing pattern" where appropriate
4. Update CLAUDE.md with common answers

---

#### Issue: Architecture options do not fit needs

**Symptoms:**
- None of the Phase 4 options are appropriate
- Options miss important constraints

**Solutions:**
1. Provide feedback and ask for alternatives
2. Describe your ideal approach
3. Mention constraints not previously shared
4. Ask to combine elements from different options

---

#### Issue: Implementation deviates from design

**Symptoms:**
- Phase 5 code differs from Phase 4 plan
- Unexpected changes to files

**Solutions:**
1. Stop and ask for clarification
2. Reference the specific architecture decision
3. Ask for explanation of deviation
4. Request rollback if necessary

---

#### Issue: Review finds too many issues

**Symptoms:**
- Phase 6 overwhelmed with findings
- Many false positives

**Solutions:**
1. Focus on critical issues only
2. Update CLAUDE.md with clarified conventions
3. Request re-review after CLAUDE.md update
4. Ignore issues below confidence threshold

---

#### Issue: Workflow interrupted mid-process

**Symptoms:**
- Connection lost during phase
- Need to restart from middle

**Solutions:**
1. Describe current state when resuming
2. Reference previous phase outputs
3. Ask to continue from specific phase
4. Provide summary of decisions made

---

### Getting Help

If you encounter persistent issues:

1. **Check the official repository**: [anthropics/claude-code](https://github.com/anthropics/claude-code)
2. **Review plugin documentation**: `/plugins/feature-dev/README.md`
3. **File issues**: Use GitHub issues for bugs
4. **Community support**: Claude Code community channels

---

## Quick Reference Card

### Command
```bash
/feature-dev [description]
```

### Phases
1. **Discovery** - Clarify requirements
2. **Exploration** - Analyze codebase (code-explorer agents)
3. **Clarification** - Resolve ambiguities
4. **Design** - Choose architecture (code-architect agents)
5. **Implementation** - Build the feature
6. **Review** - Check quality (code-reviewer agents)
7. **Summary** - Document results

### Agents
- **code-explorer** (yellow) - Traces existing code
- **code-architect** - Designs implementations
- **code-reviewer** (red) - Reviews code quality

### Key Principles
- Understand before changing
- Ask before assuming
- Design before implementing
- Review before shipping

---

*This guide is based on the official Feature Dev plugin from the Anthropic Claude Code repository (v1.0.0).*

*Last updated: January 2026*
