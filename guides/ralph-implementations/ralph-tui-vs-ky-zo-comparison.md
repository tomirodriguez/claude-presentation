# Ralph TUI vs ky-zo/ralph: Comparative Analysis

A comprehensive comparison between **Ralph TUI** (the commercial/official tool from ralph-tui.com) and **ky-zo/ralph** (the open-source Shell-based implementation).

---

## Executive Summary

| Aspect | Ralph TUI | ky-zo/ralph |
|--------|-----------|-------------|
| **Type** | Commercial product | Open-source project |
| **Language** | TypeScript/Bun | 100% Shell (Bash) |
| **Agent Support** | Claude, OpenCode, Droid | Claude only |
| **Task Tracking** | JSON, Beads, Beads-BV | JSON from PRD conversion |
| **UI** | Full TUI with keyboard controls | Tmux dashboard |
| **Installation** | `npm install -g ralph-tui` | Clone repo + dependencies |
| **Configuration** | TOML config files | Environment variables + CLI |
| **Maturity** | v0.1.7 (active development) | Community project |

**Bottom Line:** Ralph TUI is a polished, feature-rich product with multi-agent support and sophisticated task selection algorithms. ky-zo/ralph is a transparent, hackable Shell implementation ideal for users who want full control and simplicity.

---

## 1. Architecture Comparison

### Ralph TUI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  TUI Interface (Ink/React)                                       │
│  - Real-time dashboard                                           │
│  - Keyboard shortcuts (s/p/q/+/-/d/i/t/T/u)                     │
│  - Progress visualization                                        │
├─────────────────────────────────────────────────────────────────┤
│  Execution Engine                                                │
│  - Iteration management                                          │
│  - Session persistence (.ralph-tui-session.json)                │
│  - Rate limit handling with fallback agents                     │
├─────────────────────────────────────────────────────────────────┤
│  Plugin Layer                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                │
│  │ Agent       │ │ Tracker     │ │ Template    │                │
│  │ Plugins     │ │ Plugins     │ │ Engine      │                │
│  │ Claude      │ │ JSON        │ │ Handlebars  │                │
│  │ OpenCode    │ │ Beads       │ │             │                │
│  │ Droid       │ │ Beads-BV    │ │             │                │
│  └─────────────┘ └─────────────┘ └─────────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  Configuration Layer (TOML)                                      │
│  - Global: ~/.config/ralph-tui/config.toml                      │
│  - Project: .ralph-tui/config.toml                              │
│  - CLI overrides                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### ky-zo/ralph Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 6: Structured PRD                                         │
│  prd.md → convert.sh → prd.json                                 │
├─────────────────────────────────────────────────────────────────┤
│  Layer 5: Context Prompt                                         │
│  PROMPT.md + PRD + progress.txt → dynamic generation            │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Circuit Breaker                                        │
│  No progress detection → OPEN state halts execution             │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Completion Token                                       │
│  ---RALPH_STATUS--- block with EXIT_SIGNAL                      │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Timeout Protection                                     │
│  gtimeout/timeout + retry logic (3 attempts)                    │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Task List                                              │
│  prd.json with prioritized user stories                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Differences

| Aspect | Ralph TUI | ky-zo/ralph |
|--------|-----------|-------------|
| **Design Philosophy** | Plugin-based extensibility | Unix philosophy (composable scripts) |
| **State Management** | JSON session files + lock files | status.json + prd.json |
| **Extension Model** | Add plugins via code | Modify Shell scripts directly |
| **Dependency Model** | Bun runtime + npm packages | Standard Unix tools (jq, tmux) |

---

## 2. Agent Support

### Ralph TUI Agents

| Agent | Installation | Models | Subagent Tracing |
|-------|--------------|--------|------------------|
| **Claude Code** | `npm i -g @anthropic-ai/claude-code` | sonnet, opus, haiku | Yes (4 levels) |
| **OpenCode** | `curl -fsSL opencode.ai/install \| bash` | anthropic/*, openai/*, google/*, ollama/* | No |
| **Factory Droid** | Droid CLI + FACTORY_API_KEY | claude-opus-4-5, etc. | Yes (JSONL) |

**Fallback System:** Ralph TUI supports automatic fallback to alternative agents during rate limiting:
```toml
fallbackAgents = ["opencode"]
[rateLimitHandling]
enabled = true
maxRetries = 3
recoverPrimaryBetweenIterations = true
```

### ky-zo/ralph Agents

| Agent | Notes |
|-------|-------|
| **Claude Code** | Only supported agent |

**Rate Limiting:** Manual hourly counter with visual countdown:
```bash
MAX_CALLS_PER_HOUR=100
# Waits with countdown when limit reached
```

### Verdict: Agent Support

**Ralph TUI wins** with multi-agent support and intelligent fallback. This is critical for production use where rate limits are common.

**ky-zo/ralph** is simpler but locked to Claude Code only.

---

## 3. Task Management & Selection

### Ralph TUI Task Selection

**JSON Tracker:**
- Priority-based selection (ascending)
- Dependency resolution (skips blocked tasks)
- Simple and predictable

**Beads Tracker:**
- Git-backed issue tracking
- Team synchronization via `bd sync`
- Epic-based organization
- Statuses: open, in_progress, closed, cancelled

**Beads-BV Tracker (Graph-Optimized):**
- PageRank scoring for node importance
- Betweenness centrality for critical path
- Blocker ratio analysis
- Staleness detection
- Cycle detection

```bash
# Beads-BV uses graph algorithms for intelligent task selection
ralph-tui run --tracker beads-bv --epic beads-xyz
```

### ky-zo/ralph Task Selection

**JSON-based with PRD Conversion:**
```bash
# Convert human-readable PRD to structured tasks
./convert.sh my-feature
```

**Selection Algorithm:**
1. Filter incomplete stories (`passes: false`)
2. Sort by priority (ascending)
3. Select first available

**prd.json Structure:**
```json
{
  "branchName": "feature/my-feature",
  "userStories": [
    {
      "id": "1.1",
      "category": "technical",
      "story": "Setup database schema",
      "steps": ["Create migration", "Define tables"],
      "acceptance": "Migration runs successfully",
      "priority": 1,
      "passes": false
    }
  ]
}
```

### Verdict: Task Management

**Ralph TUI wins** for complex projects with its graph-based selection (Beads-BV), dependency tracking, and team collaboration features.

**ky-zo/ralph wins** for simplicity with its PRD-to-JSON conversion pipeline that bridges human requirements to machine tasks without additional tooling.

---

## 4. Safety Mechanisms

### Ralph TUI Safety

| Mechanism | Configuration | Default |
|-----------|---------------|---------|
| Max Iterations | `maxIterations` | 10 |
| Iteration Delay | `iterationDelay` | 1000ms |
| Error Strategy | `errorHandling.strategy` | skip |
| Max Retries | `errorHandling.maxRetries` | 3 |
| Rate Limit Handling | `rateLimitHandling.enabled` | true |
| Fallback Agents | `fallbackAgents` | [] |

**Error Handling Strategies:**
- `retry` - Retry failed iteration
- `skip` - Skip to next task
- `abort` - Stop execution

### ky-zo/ralph Safety

| Mechanism | Configuration | Default |
|-----------|---------------|---------|
| Circuit Breaker | `NO_PROGRESS_THRESHOLD` | 3 loops |
| Error Repetition | `ERROR_REPEAT_THRESHOLD` | 5 times |
| Output Decline | `OUTPUT_DECLINE_THRESHOLD` | 70% |
| Rate Limiting | `MAX_CALLS_PER_HOUR` | 100 |
| Timeout | `CLAUDE_TIMEOUT_MINUTES` | 20 min |
| Max Iterations | `MAX_ITERATIONS` | 50 |

**Circuit Breaker States:**
```
CLOSED ──(failure threshold)──▶ OPEN ──(manual --reset)──▶ CLOSED
```

**Three-Signal Detection:**
1. No file changes for N consecutive loops
2. Same error repeated N times
3. Output size declined below threshold

### Verdict: Safety Mechanisms

**ky-zo/ralph wins** with its sophisticated circuit breaker pattern that detects stuck loops, repeated errors, and output decline. This multi-signal approach catches more failure modes.

**Ralph TUI** has basic error handling but lacks loop detection and output decline monitoring.

---

## 5. Prompt Templates

### Ralph TUI Templates

**Engine:** Handlebars with full syntax support

**Variables Available:**
```handlebars
{{taskTitle}}           - Task name
{{taskDescription}}     - Full description
{{acceptanceCriteria}}  - Success criteria
{{taskId}}              - Unique identifier
{{dependsOn}}           - Blocking tasks
{{blocks}}              - Tasks this blocks
{{recentProgress}}      - Cross-iteration context
{{currentDate}}         - Today's date
{{epicId}}              - Parent epic (Beads)
{{model}}               - Current model name
{{cwd}}                 - Working directory
```

**Block Helpers:**
```handlebars
{{#if acceptanceCriteria}}
### Criteria
{{acceptanceCriteria}}
{{/if}}

{{#each steps}}
- {{this}}
{{/each}}
```

**Customization:**
```bash
ralph-tui template init           # Create local template
ralph-tui template init --global  # Create global template
```

### ky-zo/ralph Templates

**Engine:** Shell variable substitution + Claude-based generation

**PROMPT.md Structure:**
```markdown
# Current Task
You are implementing: {{current_story}}

# Context
- Project: {{project_name}}
- Branch: {{branch_name}}
- Progress: See progress.txt

# Instructions
1. Complete exactly ONE story per loop
2. Search codebase before implementing
3. Allocate ~20% effort to testing

# Status Report Format
---RALPH_STATUS---
STATUS: IN_PROGRESS|COMPLETE
TASKS_COMPLETED_THIS_LOOP: N
EXIT_SIGNAL: true|false
---END_STATUS---
```

### Verdict: Prompt Templates

**Ralph TUI wins** with Handlebars support, rich variable set, and easy customization workflow.

**ky-zo/ralph** has a functional but simpler template system with manual variable substitution.

---

## 6. Monitoring & Observability

### Ralph TUI Monitoring

**TUI Dashboard Features:**
- Real-time iteration progress
- Task status visualization
- Keyboard controls during execution
- Subagent tracing (tool calls, duration, tokens, cost)

**Keyboard Controls:**
| Key | Action |
|-----|--------|
| `s` | Start execution |
| `p` | Pause/Resume |
| `+/-` | Add/Remove 10 iterations |
| `d` | Toggle progress dashboard |
| `i` | Toggle iteration history |
| `t` | Cycle tracing detail level |
| `T` | Toggle tree panel |
| `q` | Quit |

**Subagent Tracing Levels:**
- `off` - No tracing
- `minimal` - Basic tool names
- `moderate` - Tool names + duration
- `full` - Complete details with tokens/cost

**CLI Status:**
```bash
ralph-tui status --json
# Returns: status, iteration, tasks, activeTask, locked
```

### ky-zo/ralph Monitoring

**Tmux Dashboard:**
```
┌────────────────────────────┬────────────────────────────┐
│  Claude Code execution     │  RALPH MONITOR             │
│  (live output)             │  Project: my-feature       │
│                            │  Status: 🟢 RUNNING        │
│                            │  Progress: ████████░░ 80%  │
│                            │  Stories: 8/10 complete    │
│                            │  API Calls: 34/100         │
│                            │  Circuit: 🟢 CLOSED        │
└────────────────────────────┴────────────────────────────┘
```

**Features:**
- 5-second auto-refresh
- Progress bars with Unicode blocks
- Circuit breaker state
- API call counter
- Story completion list

**CLI Status:**
```bash
./start.sh my-feature --status
```

### Verdict: Monitoring

**Ralph TUI wins** with integrated TUI, keyboard controls, and subagent tracing.

**ky-zo/ralph** provides good monitoring via tmux but requires external terminal multiplexer and lacks subagent visibility.

---

## 7. Session Management

### Ralph TUI Sessions

**Session Persistence:**
```json
// .ralph-tui-session.json
{
  "iteration": 7,
  "tasks": {...},
  "config": {...},
  "startedAt": "2025-01-10T14:30:00Z"
}
```

**Resume Capability:**
```bash
ralph-tui resume              # Continue previous session
ralph-tui resume --force      # Override stale locks
```

**Lock Management:**
- Automatic lock detection
- Stale lock handling with `--force`
- Cross-process safety

### ky-zo/ralph Sessions

**State Files:**
```
projects/my-feature/
├── status.json       # Current state
├── prd.json          # Task definitions
├── progress.txt      # Session memory
└── logs/             # Execution logs
```

**Resume:** Manual via re-running `./start.sh`

**Background Execution:**
```bash
# Tmux allows detach/reattach
Ctrl+B, D             # Detach (Ralph continues)
tmux attach -t ralph  # Reattach later
```

### Verdict: Session Management

**Ralph TUI wins** with explicit resume command, lock management, and session state restoration.

**ky-zo/ralph** relies on tmux for background execution and manual state recovery.

---

## 8. PRD & Workflow

### Ralph TUI PRD Workflow

**AI-Assisted PRD Creation:**
```bash
ralph-tui create-prd --chat
```

**Interactive Phases:**
1. Feature Goal definition
2. Target Users identification
3. Scope Definition
4. User Stories generation
5. Quality Gates definition
6. Task Creation

**Conversion to JSON:**
```bash
ralph-tui convert ./tasks/prd-feature.md --to json
```

**Setup Wizard:**
```bash
ralph-tui setup
# 1. Detects installed agents
# 2. Creates config files
# 3. Installs Claude Code skills
# 4. Detects existing trackers
```

### ky-zo/ralph PRD Workflow

**Manual PRD Authoring:**
```bash
./new.sh my-feature              # Create project
vim projects/my-feature/prd.md   # Write PRD
```

**13-Section PRD Template:**
1. Project Overview
2. Goals & Objectives
3. Target Users
4. User Stories
5. Technical Requirements
6. Acceptance Criteria
7. Dependencies
8. Timeline
9. Risks
10. Success Metrics
11. Out of Scope
12. Questions
13. Appendix

**Automated Conversion:**
```bash
./convert.sh my-feature
# Claude converts prd.md → prd.json + requirements.md
```

### Verdict: PRD Workflow

**Tie** - Both offer PRD-to-task conversion.

**Ralph TUI** has interactive AI-assisted creation.
**ky-zo/ralph** has a comprehensive template and automated Claude conversion.

---

## 9. Configuration

### Ralph TUI Configuration

**Format:** TOML with 3-layer cascade

**Global:** `~/.config/ralph-tui/config.toml`
**Project:** `.ralph-tui/config.toml`
**CLI:** Flags override everything

**Full Configuration:**
```toml
# Core
agent = "claude"
tracker = "json"
maxIterations = 10
iterationDelay = 1000
outputDir = ".ralph-tui/iterations"
progressFile = ".ralph-tui/progress.md"
autoCommit = false
prompt_template = "./custom-prompt.hbs"
subagentTracingDetail = "moderate"

# Agent Options
[agentOptions]
model = "sonnet"

# Tracker Options
[trackerOptions]
path = "./prd.json"

# Error Handling
[errorHandling]
strategy = "skip"
maxRetries = 3
retryDelayMs = 5000

# Rate Limit Handling
fallbackAgents = ["opencode"]
[rateLimitHandling]
enabled = true
maxRetries = 3
baseBackoffMs = 5000

# Notifications
[notifications]
enabled = true
sound = "system"
```

### ky-zo/ralph Configuration

**Format:** Environment variables + CLI flags

**Environment Variables:**
```bash
MAX_CALLS_PER_HOUR=100
CLAUDE_TIMEOUT_MINUTES=20
MAX_ITERATIONS=50
NO_PROGRESS_THRESHOLD=3
ERROR_REPEAT_THRESHOLD=5
OUTPUT_DECLINE_THRESHOLD=70
```

**CLI Flags:**
```bash
./start.sh <project> [OPTIONS]
  -m, --monitor           Tmux monitoring
  -n, --max-iterations N  Iteration limit
  -c, --calls NUM         Hourly API limit
  -t, --timeout MIN       Claude timeout
  --complete-token STR    Completion signal
  -s, --status            Show status
  -r, --reset             Reset circuit breaker
```

### Verdict: Configuration

**Ralph TUI wins** with structured TOML configuration, 3-layer cascade, and Zod validation.

**ky-zo/ralph** is simpler with environment variables but less organized for complex setups.

---

## 10. Installation & Dependencies

### Ralph TUI

**Requirements:**
- Bun >= 1.0.0 (required runtime)
- At least one AI agent (Claude Code, OpenCode, or Droid)

**Installation:**
```bash
# Recommended
bun install -g ralph-tui

# Alternatives
npm install -g ralph-tui
pnpm add -g ralph-tui
bunx ralph-tui  # No install

# From source
git clone <repo> && bun install && bun run build && bun link
```

**Verification:**
```bash
ralph-tui --version
ralph-tui plugins agents
ralph-tui plugins trackers
```

### ky-zo/ralph

**Requirements:**
- jq (JSON processor)
- tmux (terminal multiplexer)
- coreutils (gtimeout/timeout)
- Claude Code CLI

**Installation:**
```bash
# macOS
brew install jq tmux coreutils
npm install -g @anthropic-ai/claude-code

# Clone ralph
git clone https://github.com/ky-zo/ralph
```

**Verification:**
```bash
which jq tmux gtimeout claude
```

### Verdict: Installation

**Ralph TUI wins** for easier installation via npm/bun with fewer system dependencies.

**ky-zo/ralph** requires manual setup of Unix tools but has zero runtime dependencies beyond standard utilities.

---

## 11. Unique Features

### Ralph TUI Exclusive Features

| Feature | Description |
|---------|-------------|
| **Multi-Agent Support** | Claude, OpenCode, Droid with fallback |
| **Beads Integration** | Git-backed team issue tracking |
| **Beads-BV** | Graph-optimized task selection (PageRank, betweenness) |
| **Subagent Tracing** | Real-time tool call visualization |
| **TUI Interface** | Full terminal UI with keyboard controls |
| **Headless Mode** | CI/CD integration without TUI |
| **Notifications** | Sound alerts on completion |
| **Skills Installation** | Auto-installs Claude Code skills |
| **TOML Configuration** | Structured, validated config files |

### ky-zo/ralph Exclusive Features

| Feature | Description |
|---------|-------------|
| **Circuit Breaker** | Multi-signal failure detection (no progress, error repeat, output decline) |
| **PRD Conversion Pipeline** | Claude-powered prd.md → prd.json |
| **Structured Status Output** | `---RALPH_STATUS---` block parsing |
| **Dual Documentation** | progress.txt (session) + AGENTS.md (permanent) |
| **Branch Validation** | Enforces PRD-defined branch |
| **6-Layer Architecture** | Clear separation of concerns |
| **100% Shell** | No runtime dependencies, fully transparent |
| **Rate Limit Countdown** | Visual wait timer during limits |

---

## 12. Use Case Recommendations

### Choose Ralph TUI When:

1. **Team Collaboration** - Beads tracker enables team sync
2. **Multi-Model Strategy** - Need to use different AI providers
3. **Complex Task Graphs** - Beads-BV optimizes selection for dependencies
4. **Production CI/CD** - Headless mode for automation
5. **Cost Sensitivity** - Fallback agents reduce primary model costs
6. **Polished UX** - Full TUI with keyboard controls
7. **Subagent Debugging** - Need visibility into tool calls

### Choose ky-zo/ralph When:

1. **Maximum Transparency** - Want to read/modify every line of code
2. **Unix Philosophy** - Prefer composable Shell scripts
3. **Single Developer** - Don't need team collaboration features
4. **Learning** - Understanding how Ralph loops work internally
5. **Customization** - Need to heavily modify orchestrator behavior
6. **Minimal Dependencies** - Only standard Unix tools
7. **Circuit Breaker** - Need sophisticated stuck-loop detection
8. **PRD Workflow** - Have well-defined markdown requirements

---

## 13. Feature Matrix

| Feature | Ralph TUI | ky-zo/ralph |
|---------|:---------:|:-----------:|
| **Agents** | | |
| Claude Code | ✅ | ✅ |
| OpenCode | ✅ | ❌ |
| Factory Droid | ✅ | ❌ |
| Fallback Agents | ✅ | ❌ |
| **Task Management** | | |
| JSON Tasks | ✅ | ✅ |
| Dependency Resolution | ✅ | ❌ |
| Graph-Based Selection | ✅ (Beads-BV) | ❌ |
| Priority Sorting | ✅ | ✅ |
| Team Sync | ✅ (Beads) | ❌ |
| **Safety** | | |
| Max Iterations | ✅ | ✅ |
| Timeout | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ |
| Circuit Breaker | ❌ | ✅ |
| Loop Detection | ❌ | ✅ |
| Output Decline | ❌ | ✅ |
| Error Retry | ✅ | ✅ |
| **Monitoring** | | |
| TUI Dashboard | ✅ | ❌ |
| Tmux Dashboard | ❌ | ✅ |
| Subagent Tracing | ✅ | ❌ |
| Progress Bars | ✅ | ✅ |
| Status Command | ✅ | ✅ |
| **Session** | | |
| Pause/Resume | ✅ | ⚠️ (tmux) |
| Session Lock | ✅ | ❌ |
| Auto-Recovery | ✅ | ❌ |
| **Templates** | | |
| Handlebars | ✅ | ❌ |
| Custom Templates | ✅ | ✅ |
| Template Variables | Many | Basic |
| **PRD Workflow** | | |
| AI-Assisted Creation | ✅ | ❌ |
| PRD Conversion | ✅ | ✅ |
| Quality Gates | ✅ | ✅ |
| **Configuration** | | |
| TOML Config | ✅ | ❌ |
| Env Variables | ❌ | ✅ |
| CLI Flags | ✅ | ✅ |
| Global Config | ✅ | ❌ |
| **Other** | | |
| Headless Mode | ✅ | ❌ |
| Notifications | ✅ | ❌ |
| Documentation | Extensive | README + Guide |
| Open Source | ❌ | ✅ |

---

## 14. Migration Guide

### From ky-zo/ralph to Ralph TUI

1. **Convert prd.json format:**
   ```bash
   # ky-zo format has 'story' field
   # Ralph TUI expects 'title' and 'description'
   jq '.userStories[] | {
     id: .id,
     title: .story,
     description: .acceptance,
     priority: .priority,
     passes: .passes
   }' prd.json > ralph-tui-prd.json
   ```

2. **Install Ralph TUI:**
   ```bash
   bun install -g ralph-tui
   ralph-tui setup
   ```

3. **Create config:**
   ```toml
   # .ralph-tui/config.toml
   agent = "claude"
   tracker = "json"
   [trackerOptions]
   path = "./ralph-tui-prd.json"
   ```

4. **Run:**
   ```bash
   ralph-tui run
   ```

### From Ralph TUI to ky-zo/ralph

1. **Export tasks:**
   ```bash
   # Convert Ralph TUI format to ky-zo format
   jq '{
     branchName: "feature/from-ralph-tui",
     userStories: [.userStories[] | {
       id: .id,
       category: "functional",
       story: .title,
       steps: [],
       acceptance: .description,
       priority: .priority,
       passes: .passes,
       notes: ""
     }]
   }' ralph-tui-prd.json > prd.json
   ```

2. **Setup ky-zo/ralph:**
   ```bash
   git clone https://github.com/ky-zo/ralph
   brew install jq tmux coreutils
   ```

3. **Create project:**
   ```bash
   ./ralph/new.sh my-project
   cp prd.json ralph/projects/my-project/
   ```

4. **Run:**
   ```bash
   ./ralph/start.sh my-project --monitor
   ```

---

## 15. Conclusion

### Overall Verdict

**Ralph TUI** is the better choice for **production use** with its:
- Multi-agent support and fallback
- Polished TUI interface
- Team collaboration via Beads
- Sophisticated graph-based task selection
- Extensive documentation

**ky-zo/ralph** is the better choice for **learning, customization, and transparency** with its:
- 100% readable Shell code
- Sophisticated circuit breaker
- PRD-to-JSON conversion pipeline
- Zero runtime dependencies
- Full hackability

### Recommendation

| Scenario | Recommendation |
|----------|----------------|
| Production feature development | **Ralph TUI** |
| Team projects | **Ralph TUI** (Beads) |
| Learning Ralph technique | **ky-zo/ralph** |
| Heavy customization needed | **ky-zo/ralph** |
| CI/CD automation | **Ralph TUI** (headless) |
| Debugging stuck loops | **ky-zo/ralph** (circuit breaker) |
| Cost optimization | **Ralph TUI** (fallback agents) |
| Minimal dependencies | **ky-zo/ralph** |

### Future Considerations

**Ralph TUI could adopt from ky-zo:**
- Circuit breaker pattern for stuck loop detection
- Output decline monitoring
- Dual documentation system (session vs permanent)

**ky-zo/ralph could adopt from Ralph TUI:**
- Multi-agent support with adapter pattern
- Graph-based task selection
- Subagent tracing
- TOML configuration

---

## References

- [Ralph TUI Documentation](https://ralph-tui.com/docs/getting-started/introduction)
- [Ralph TUI GitHub](https://github.com/subsy/ralph-tui)
- [ky-zo/ralph GitHub](https://github.com/ky-zo/ralph)
- [Geoffrey Huntley's Original Ralph Article](https://ghuntley.com/ralph/)

---

*Analysis created: January 2026*
*Version: 1.0*
