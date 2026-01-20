# Ralph by ky-zo Analysis

An analysis of [ky-zo/ralph](https://github.com/ky-zo/ralph) - A pure Shell-based autonomous development system with comprehensive safety mechanisms.

---

## Overview

Ralph by ky-zo is a 100% Shell-based implementation that orchestrates Claude Code to autonomously implement features from structured PRDs (Product Requirements Documents). Unlike Python-based alternatives, this implementation embraces Unix philosophy with modular shell scripts and leverages native bash patterns for state management.

| Aspect | Official Ralph Plugin | ky-zo/ralph | Ralph Orchestrator |
|--------|----------------------|-------------|-------------------|
| **Architecture** | Claude Code hook-based | Standalone Shell orchestrator | Standalone Python orchestrator |
| **Language** | Bash + Claude Code | 100% Shell (Bash) | Python (async-first) |
| **State Management** | `.claude/ralph-loop.local.md` | `status.json` + `prd.json` | `.agent/` directory |
| **Task Definition** | Markdown-based | JSON user stories from PRD | Markdown prompts |
| **Safety Mechanisms** | `--max-iterations` only | Circuit breaker + Rate limiting | Iterations, runtime, cost, failures |
| **Monitoring** | None built-in | Real-time tmux dashboard | Metrics JSON |
| **PRD Workflow** | Manual task definition | Automated PRD → JSON conversion | Manual prompts |

---

## Six-Layer Architecture

This implementation introduces a sophisticated 6-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 6: Structured PRD                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  prd.md → convert.sh → prd.json                     │    │
│  │  User stories with ID, category, priority, passes   │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Context Prompt                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PROMPT.md template + PRD + progress.txt            │    │
│  │  Dynamic instruction generation per iteration       │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Circuit Breaker                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  No progress detection, error repetition, output    │    │
│  │  decline → OPEN state halts execution               │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Completion Token                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ---RALPH_STATUS--- block with EXIT_SIGNAL          │    │
│  │  Agent explicitly signals when work is done         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Timeout Protection                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  gtimeout/timeout with configurable duration        │    │
│  │  Retry logic (up to 3 attempts) on timeout          │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Task List                                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  prd.json with prioritized user stories             │    │
│  │  passes: true/false tracking completion             │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Differentiators

### 1. PRD-to-JSON Conversion Pipeline

A unique two-stage workflow that transforms human-readable requirements into machine-actionable tasks:

```bash
# Stage 1: Write PRD in markdown
vim projects/my-feature/prd.md

# Stage 2: Claude converts to structured JSON
./convert.sh my-feature
```

**Generated prd.json structure:**
```json
{
  "branchName": "feature/my-feature",
  "userStories": [
    {
      "id": "1.1",
      "category": "technical",
      "story": "Setup database schema for users",
      "steps": [
        "Create migration file",
        "Define table structure",
        "Add indexes"
      ],
      "acceptance": "Migration runs without errors",
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

**Useful Ideas:**
- **Automated conversion** removes manual JSON creation overhead
- **Hierarchical IDs** (1.1, 1.2, 2.1) enable logical grouping
- **Category classification** (technical, functional, UI) enables filtered views
- **Priority sequencing** ensures proper task ordering

### 2. Circuit Breaker Pattern

A sophisticated failure detection system with three trigger mechanisms:

```bash
# lib/circuit_breaker.sh

# Mechanism 1: No Progress Detection
# Triggers after N consecutive loops without file changes
if [ "$consecutive_no_changes" -ge "$NO_PROGRESS_THRESHOLD" ]; then
    transition_to_open "No file changes in $consecutive_no_changes loops"
fi

# Mechanism 2: Error Repetition
# Triggers when same error appears N times
if [ "$same_error_count" -ge "$ERROR_REPEAT_THRESHOLD" ]; then
    transition_to_open "Same error repeated $same_error_count times"
fi

# Mechanism 3: Output Decline
# Warns when output shrinks beyond 70% threshold
if [ "$output_ratio" -lt "$OUTPUT_DECLINE_THRESHOLD" ]; then
    log "WARN" "Output declined by ${decline_percent}%"
fi
```

**State Transitions:**
```
CLOSED ──(failure threshold)──▶ OPEN ──(manual reset)──▶ CLOSED
   │                              │
   │                              ├── Halts all execution
   │                              └── Requires --reset flag
   │
   └── Normal operation
```

**Useful Ideas:**
- **Three-signal detection** catches different failure modes
- **10-item history window** provides context for pattern detection
- **Manual reset requirement** ensures human review before continuing

### 3. Rate Limiting System

Built-in API usage management to prevent hitting rate limits:

```bash
# Configuration
MAX_CALLS_PER_HOUR=100
CALL_COUNT=0
HOUR_START=$(date +%s)

# Rate limiting functions
can_make_call() {
    local current_hour=$(date +%s)
    local elapsed=$((current_hour - HOUR_START))

    # Reset counter every hour
    if [ $elapsed -ge 3600 ]; then
        CALL_COUNT=0
        HOUR_START=$current_hour
    fi

    [ $CALL_COUNT -lt $MAX_CALLS_PER_HOUR ]
}

wait_for_reset() {
    local remaining=$((3600 - elapsed))
    log "WARN" "Rate limit reached. Waiting ${remaining}s for reset..."
    # Displays countdown with progress bar
    while [ $remaining -gt 0 ]; do
        printf "\r⏳ Reset in: %02d:%02d " $((remaining/60)) $((remaining%60))
        sleep 1
        ((remaining--))
    done
}
```

**Useful Ideas:**
- **Proactive rate limiting** prevents API errors
- **Visual countdown** keeps user informed during waits
- **Configurable limits** via environment variables or CLI flags

### 4. Structured Response Analysis

Claude outputs a standardized status block that the system parses:

```markdown
---RALPH_STATUS---
STATUS: IN_PROGRESS
TASKS_COMPLETED_THIS_LOOP: 1
FILES_MODIFIED: 3
TESTS_STATUS: PASSING
WORK_TYPE: IMPLEMENTATION
EXIT_SIGNAL: false
RECOMMENDATION: Continue with story 1.2
---END_STATUS---
```

**Parser Implementation:**
```bash
# lib/response_analyzer.sh

analyze_response() {
    local output_file="$1"

    # Extract status block
    local status_block=$(sed -n '/---RALPH_STATUS---/,/---END_STATUS---/p' "$output_file")

    # Parse fields
    local status=$(echo "$status_block" | grep "^STATUS:" | cut -d: -f2 | xargs)
    local tasks=$(echo "$status_block" | grep "^TASKS_COMPLETED" | cut -d: -f2 | xargs)
    local exit_signal=$(echo "$status_block" | grep "^EXIT_SIGNAL:" | cut -d: -f2 | xargs)

    # Generate analysis JSON
    cat > .last_analysis.json <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "$status",
    "tasks_completed": $tasks,
    "exit_signal": $exit_signal
}
EOF
}
```

**Useful Ideas:**
- **Structured output format** enables reliable parsing
- **EXIT_SIGNAL flag** gives agent explicit completion control
- **RECOMMENDATION field** provides context for next iteration

### 5. Real-Time Tmux Dashboard

Live monitoring with split-pane tmux integration:

```bash
# start.sh --monitor launches:
┌────────────────────────────────┬────────────────────────────────┐
│                                │  RALPH MONITOR                 │
│                                │  ════════════════════════════  │
│  Claude Code execution         │  Project: my-feature           │
│  (left pane)                   │  Status: 🟢 RUNNING            │
│                                │                                │
│  $ claude --dangerously...     │  Progress: ████████░░ 80%      │
│                                │  Stories: 8/10 complete        │
│                                │                                │
│                                │  API Calls: ███░░░░░░░ 34/100  │
│                                │                                │
│                                │  Circuit: 🟢 CLOSED            │
│                                │  Failures: 0/3                 │
│                                │                                │
│                                │  Last Update: 2m ago           │
└────────────────────────────────┴────────────────────────────────┘
```

**Monitor Features:**
- 5-second auto-refresh with minimal flicker
- Color-coded status indicators
- Progress bars using Unicode block characters
- Circuit breaker state visualization
- Story list with completion status

**Useful Ideas:**
- **Background execution** with tmux detach/reattach
- **Visual progress tracking** improves developer experience
- **Multiple data sources** aggregated in one view

### 6. Branch Isolation

Strict git branch enforcement per feature:

```bash
# start.sh

validate_branch() {
    local required_branch=$(jq -r '.branchName' "$PROJECT_DIR/prd.json")
    local current_branch=$(git branch --show-current)

    if [ "$current_branch" != "$required_branch" ]; then
        log "ERROR" "Wrong branch! Expected: $required_branch, Current: $current_branch"
        exit 1
    fi
}

confirm_branch() {
    local branch=$(jq -r '.branchName' "$PROJECT_DIR/prd.json")
    echo "⚠️  This will run Claude on branch: $branch"
    read -p "Continue? [y/N] " confirm
    [ "$confirm" = "y" ] || exit 0
}
```

**Useful Ideas:**
- **PRD-defined branch names** ensure consistency
- **Pre-execution validation** prevents wrong-branch accidents
- **User confirmation** adds safety checkpoint

### 7. Dual Documentation System

Two-tier knowledge preservation:

```
┌─────────────────────────────────────────────────┐
│  Session Memory: progress.txt                    │
│  ─────────────────────────────────────────────  │
│  - What was tried this session                   │
│  - Errors encountered and solutions              │
│  - Current state and blockers                    │
│  - Session-specific learnings                    │
│  (Ephemeral - per feature implementation)        │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  Permanent Knowledge: AGENTS.md                  │
│  ─────────────────────────────────────────────  │
│  - Reusable patterns discovered                  │
│  - Codebase conventions                          │
│  - Architecture decisions                        │
│  - Cross-project learnings                       │
│  (Persistent - survives feature completion)      │
└─────────────────────────────────────────────────┘
```

**Useful Ideas:**
- **Separation of concerns** - session vs permanent knowledge
- **AGENTS.md accumulates wisdom** across multiple features
- **progress.txt provides context** without polluting permanent docs

---

## Component Analysis

### Main Scripts

| Script | Purpose | Key Features |
|--------|---------|--------------|
| `new.sh` | Project scaffolding | Name sanitization, template copying, JSON initialization |
| `convert.sh` | PRD → JSON | Claude-powered conversion, category detection, priority assignment |
| `start.sh` | Main loop execution | Rate limiting, circuit breaker, timeout handling, tmux integration |
| `monitor.sh` | Live dashboard | 5s refresh, progress bars, status aggregation |

### Library Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| `utils.sh` | Shared utilities | Logging, JSON ops, time formatting, dependency checking |
| `circuit_breaker.sh` | Failure detection | State management, history tracking, threshold monitoring |
| `response_analyzer.sh` | Output parsing | Status block extraction, exit signal detection, analysis JSON |

### Templates

| Template | Purpose |
|----------|---------|
| `PROMPT.md` | System prompt for Claude with status reporting format |
| `prd-template.md` | 13-section PRD structure template |
| `prd-schema.json` | JSON schema for prd.json validation |

---

## Complete Execution Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. PROJECT INITIALIZATION                                        │
│     ./new.sh my-feature                                          │
│     └─▶ Creates projects/my-feature/ with templates              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. PRD AUTHORING                                                 │
│     Edit projects/my-feature/prd.md                              │
│     └─▶ Write requirements in structured markdown                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. PRD CONVERSION                                                │
│     ./convert.sh my-feature                                      │
│     └─▶ Claude transforms prd.md → prd.json + requirements.md   │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. AUTONOMOUS LOOP                                               │
│     ./start.sh my-feature --monitor                              │
│                                                                   │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │  while incomplete_stories > 0:                          │  │
│     │      if not can_make_call(): wait_for_reset()          │  │
│     │      if should_halt_execution(): break                  │  │
│     │                                                         │  │
│     │      prompt = generate_full_prompt()                    │  │
│     │      result = execute_claude(prompt, timeout=20min)     │  │
│     │                                                         │  │
│     │      analysis = analyze_response(result)                │  │
│     │      record_loop_result(analysis)                       │  │
│     │                                                         │  │
│     │      if analysis.exit_signal: break                     │  │
│     │      update_status()                                    │  │
│     └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. COMPLETION                                                    │
│     All stories marked passes: true                              │
│     Git commits created per story                                │
│     AGENTS.md updated with learnings                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## Ideas Worth Adopting

### High Priority

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Circuit breaker** | Prevents infinite stuck loops | Medium - state file + detection logic |
| **Rate limiting** | Avoids API errors | Low - counter with hourly reset |
| **PRD → JSON conversion** | Reduces manual task definition | Low - Claude prompt |
| **Structured status output** | Reliable completion detection | Low - prompt instruction |

### Medium Priority

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Tmux monitoring** | Visual feedback during execution | Medium - tmux scripting |
| **Branch validation** | Prevents wrong-branch commits | Low - git check |
| **Dual documentation** | Separates session vs permanent knowledge | Low - two files |
| **Response analysis** | Parses structured output for decisions | Medium - parsing logic |

### Worth Exploring

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Category classification** | Filter stories by type | Low - JSON field |
| **Progress bars** | Visual progress indication | Low - Unicode rendering |
| **Timeout retry logic** | Handles transient failures | Low - retry loop |

---

## Prompt Engineering Insights

The PROMPT.md template contains several valuable patterns:

### 1. One-Story-Per-Loop Discipline
```markdown
CRITICAL: You must complete exactly ONE story per loop.
Do not attempt multiple stories - the orchestrator manages sequencing.
```

### 2. Search-Before-Assume Pattern
```markdown
Before implementing anything:
1. Search the codebase for existing patterns
2. Check if similar functionality exists
3. Use subagents for expensive operations
```

### 3. Testing Allocation Rule
```markdown
Allocate ~20% effort to testing.
Implementation takes priority - write tests only for new functionality.
Do not test existing code unless specifically asked.
```

### 4. Structured Exit Conditions
```markdown
Set EXIT_SIGNAL: true ONLY when ALL conditions are met:
1. All fix_plan.md items marked complete
2. Tests passing (or no tests needed)
3. No errors in execution
4. All spec requirements implemented
5. No meaningful work remains
```

---

## Configuration Reference

### Environment Variables

```bash
# Rate limiting
MAX_CALLS_PER_HOUR=100      # API calls before waiting
CLAUDE_TIMEOUT_MINUTES=20   # Per-execution timeout

# Loop control
MAX_ITERATIONS=50           # Hard cap on loops

# Circuit breaker thresholds
NO_PROGRESS_THRESHOLD=3     # Loops without file changes
ERROR_REPEAT_THRESHOLD=5    # Same error occurrences
OUTPUT_DECLINE_THRESHOLD=70 # Minimum output ratio %
```

### CLI Flags

```bash
./start.sh <project> [OPTIONS]

Options:
  -m, --monitor           Start with tmux monitoring
  -n, --max-iterations N  Override iteration limit
  -c, --calls NUM         Set hourly call limit
  -t, --timeout MIN       Set Claude timeout (minutes)
  --complete-token STR    Override completion signal
  -s, --status            Show status only
  -r, --reset             Reset circuit breaker
```

---

## Comparison: ky-zo/ralph vs ralph-orchestrator

| Aspect | ky-zo/ralph | ralph-orchestrator |
|--------|-------------|-------------------|
| **Language** | Pure Shell | Python (async) |
| **Dependencies** | jq, tmux, coreutils | Python ecosystem |
| **Task Format** | JSON from PRD conversion | Markdown prompts |
| **Multi-Agent** | Claude only | Claude, Gemini, Kiro, ACP |
| **Cost Tracking** | Rate limiting only | Token/cost metrics |
| **Checkpointing** | Manual commits | Automatic git checkpoints |
| **Rollback** | Manual | Automatic after failures |
| **Loop Detection** | Output decline + no progress | Fuzzy string matching |
| **Learning** | AGENTS.md + progress.txt | Scratchpad |

**Key Insight:** ky-zo/ralph prioritizes simplicity and Unix philosophy, while ralph-orchestrator provides more sophisticated automation. The Shell-based approach is more accessible and easier to modify, while Python offers richer abstractions.

---

## Conclusion

Ralph by ky-zo demonstrates that sophisticated autonomous development loops can be built with pure Shell scripting. Key innovations include:

1. **PRD-to-JSON pipeline** - Bridges human requirements to machine-actionable tasks
2. **Circuit breaker pattern** - Multi-signal failure detection prevents stuck loops
3. **Structured status output** - Reliable agent-to-orchestrator communication
4. **Rate limiting** - Proactive API management
5. **Tmux integration** - Developer-friendly monitoring
6. **Dual documentation** - Session vs permanent knowledge separation

The 6-layer architecture provides a robust framework that balances automation with safety, making it suitable for production feature development.

---

## References

- [ky-zo/ralph](https://github.com/ky-zo/ralph) - Source repository
- [Ralph Orchestrator Analysis](./ralph-orchestrator-analysis.md) - Python-based alternative
- [Geoffrey Huntley's Original Article](https://ghuntley.com/ralph/) - The technique's origin

---

*Analysis created: January 2026*
