# Ralph Orchestrator Analysis

An analysis of [mikeyobrien/ralph-orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) - an alternative Ralph implementation with advanced features.

---

## Overview

Ralph Orchestrator is a Python-based implementation of the Ralph Wiggum technique that introduces several architectural improvements over the original bash-based approach. While the official Ralph plugin uses Claude Code's hooks system, this implementation takes a standalone orchestrator approach with multi-agent support.

| Aspect | Official Ralph Plugin | Ralph Orchestrator |
|--------|----------------------|-------------------|
| **Architecture** | Claude Code hook-based | Standalone Python orchestrator |
| **Agent Support** | Claude Code only | Claude, Kiro, Gemini, Q Chat, ACP-compliant |
| **Language** | Bash + Claude Code | Python (async-first) |
| **State Management** | `.claude/ralph-loop.local.md` | `.agent/` directory with metrics |
| **Checkpointing** | Manual git commits | Automatic async git checkpoints |
| **Safety Limits** | `--max-iterations` only | Iterations, runtime, cost, failure count |

---

## Key Differentiators

### 1. Multi-Agent Architecture

Ralph Orchestrator supports multiple AI backends through an adapter pattern:

```
src/ralph_orchestrator/adapters/
├── claude.py    # Claude via Agent SDK
├── kiro.py      # Kiro CLI
├── gemini.py    # Gemini CLI
├── qchat.py     # Q Chat (legacy)
└── acp.py       # Any ACP-compliant agent
```

**Useful Idea:** The adapter pattern enables agent-agnostic orchestration. Tasks could potentially be distributed across different models based on complexity or cost.

### 2. ACP (Agent Client Protocol) Support

A protocol-based approach for universal agent integration:

```python
# Enables any ACP-compliant agent
ralph run -a acp --acp-agent gemini
```

**Permission Modes:**
- `auto_approve` - Grants all requests (trusted environments)
- `deny_all` - Rejects all (testing/sandboxing)
- `allowlist` - Pattern-based approval
- `interactive` - User prompts for each request

**Useful Idea:** A standardized protocol for agent communication could enable hybrid workflows where different agents handle different aspects of a task.

### 3. Comprehensive Safety Mechanisms

```python
class SafetyGuard:
    max_iterations: int = 100        # Hard cap
    max_runtime: int = 14400         # 4 hours
    max_cost: float = 10.0           # $10 default
    max_consecutive_failures: int = 5
```

**Loop Detection:** Uses fuzzy string matching to detect output similarity:
```python
# Flags loops when >90% similarity to recent outputs
# Maintains rolling window of 5 most recent outputs
```

**Useful Ideas:**
- **Cost ceiling** - Prevents runaway API costs
- **Loop detection** - Catches the agent repeating itself
- **Failure counter** - Stops after consecutive failures instead of wasting iterations

### 4. Async-First Architecture

The entire orchestrator is built on Python's async/await:

```python
async def arun(self):
    while not self._should_stop():
        await self._aexecute_iteration()
        await self._async_checkpoint()  # Non-blocking
```

**Benefits:**
- Git checkpoints don't block iteration execution
- Logging is thread-safe and non-blocking
- Multiple operations can run concurrently

**Useful Idea:** Non-blocking operations improve throughput. Our hook-based approach blocks during git operations.

### 5. Intelligent Checkpointing

Automatic git-based checkpointing with rollback capability:

```python
# Checkpoint every N iterations (default: 5)
async def _create_checkpoint():
    git add -A
    git commit -m "Ralph checkpoint {iteration}"

# Rollback after 3+ consecutive failures
async def _rollback_checkpoint():
    git reset --hard HEAD~1
```

**Useful Ideas:**
- **Automatic rollback** - Reverts bad changes automatically
- **Configurable interval** - Balance between safety and performance
- **Async commits** - Don't block iteration execution

### 6. Rich Metrics Collection

Three-tier metrics system:

```python
# Orchestration Metrics
- iteration_count, success_count, failed_count
- error_count, checkpoint_count, rollback_count
- elapsed_time, success_rate

# Cost Metrics (CostTracker)
- input_tokens, output_tokens
- cost_per_tool (claude, gemini, etc.)
- total_cost with per-1K-token rates

# Per-Iteration Stats
- duration, success/failure status
- error_messages, trigger_reasons
- token_consumption, tools_invoked
```

**Useful Ideas:**
- **Token/cost tracking** - Know exactly what each iteration costs
- **Success rate calculation** - Understand task difficulty
- **Trigger reason tracking** - Debug why iterations happened

### 7. Agent Scratchpad

Persistent context between iterations:

```
.agent/
├── scratchpad.md      # Agent notes persist across iterations
├── prompt.md          # Current task
├── metrics.json       # Session metrics
└── checkpoints/       # Version history
```

**Useful Idea:** The scratchpad allows agents to maintain notes and context that survive session boundaries, enabling continuation without full context replay.

### 8. Enhanced Completion Detection

Three completion mechanisms:

```python
# 1. Checkbox markers in prompt file
- [x] TASK_COMPLETE

# 2. Completion promise in output (case-insensitive)
<promise>DONE</promise>

# 3. Safety limits (graceful termination)
max_iterations, max_runtime, max_cost
```

**Useful Idea:** Checkbox-based completion in the prompt file itself provides a more natural way to track multi-step tasks.

---

## Ideas Worth Adopting

### High Priority

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Cost ceiling** | Prevents runaway costs | Low - add cost tracking to state |
| **Loop detection** | Catches stuck iterations | Medium - fuzzy matching on outputs |
| **Failure counter** | Stop wasting iterations on broken states | Low - counter in state file |
| **Automatic rollback** | Recover from bad changes | Medium - git reset after failures |

### Medium Priority

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Metrics tracking** | Understand iteration efficiency | Medium - JSON metrics file |
| **Async checkpointing** | Non-blocking git operations | High - architectural change |
| **Runtime limit** | Time-based safety in addition to iteration count | Low - timestamp comparison |
| **Scratchpad file** | Agent can persist notes between iterations | Low - additional file in state |

### Worth Exploring

| Feature | Benefit | Implementation Complexity |
|---------|---------|--------------------------|
| **Multi-agent support** | Different models for different tasks | High - adapter pattern |
| **ACP protocol** | Universal agent integration | High - new protocol layer |
| **Checkpoint intervals** | Balance safety vs performance | Low - configurable parameter |

---

## Implementation Suggestions

### 1. Add Cost Tracking

```yaml
# .claude/ralph-loop.local.md
---
active: true
iteration: 5
max_iterations: 50
max_cost: 25.0          # NEW: Cost ceiling
estimated_cost: 12.50   # NEW: Running total
---
```

The stop hook could track approximate costs and halt when the ceiling is reached.

### 2. Implement Loop Detection

```bash
# In stop-hook.sh
# Store hash of last 5 outputs
# Compare new output similarity
# If >90% similar to any recent output, flag as loop
```

### 3. Add Failure Counter

```yaml
---
consecutive_failures: 0
max_consecutive_failures: 5
---
```

Reset on success, increment on failure, stop when exceeded.

### 4. Scratchpad Support

```
# Tell agent to use .claude/ralph-scratchpad.md
# for persistent notes between iterations
```

Add instruction in prompt template:
```
You have a scratchpad at .claude/ralph-scratchpad.md for notes
that persist between iterations. Use it to track:
- What you've tried
- What worked/didn't work
- Current progress
```

### 5. Runtime Limit

```yaml
---
started_at: "2025-01-10T14:30:00Z"
max_runtime: 14400  # 4 hours in seconds
---
```

Check elapsed time in stop hook before allowing continuation.

---

## Architecture Comparison

### Official Ralph (Hook-Based)

```
┌─────────────────────────────────────────┐
│  Claude Code Session                     │
│  ┌─────────────────────────────────┐    │
│  │  /ralph-loop command            │    │
│  │         │                       │    │
│  │         ▼                       │    │
│  │  Creates state file             │    │
│  │         │                       │    │
│  │         ▼                       │    │
│  │  Registers stop hook            │    │
│  │         │                       │    │
│  │         ▼                       │    │
│  │  Agent works on task ◄──────┐   │    │
│  │         │                   │   │    │
│  │         ▼                   │   │    │
│  │  Agent tries to exit        │   │    │
│  │         │                   │   │    │
│  │         ▼                   │   │    │
│  │  Stop hook intercepts       │   │    │
│  │         │                   │   │    │
│  │    ┌────┴────┐              │   │    │
│  │    ▼         ▼              │   │    │
│  │ Promise   No Promise        │   │    │
│  │ Found     Found             │   │    │
│  │    │         │              │   │    │
│  │    ▼         └──────────────┘   │    │
│  │  EXIT                            │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Pros:** Simple, integrated with Claude Code, leverages existing hooks system
**Cons:** Single-agent, blocking operations, limited safety mechanisms

### Ralph Orchestrator (Standalone)

```
┌─────────────────────────────────────────┐
│  Ralph Orchestrator                      │
│  ┌─────────────────────────────────┐    │
│  │  SafetyGuard                    │    │
│  │  - iterations, runtime, cost    │    │
│  │  - failure counter, loop detect │    │
│  └─────────────────────────────────┘    │
│         │                               │
│         ▼                               │
│  ┌─────────────────────────────────┐    │
│  │  Orchestrator (async)           │    │
│  │  - manages iteration loop       │    │
│  │  - handles checkpointing        │    │
│  │  - tracks metrics               │    │
│  └─────────────────────────────────┘    │
│         │                               │
│         ▼                               │
│  ┌─────────────────────────────────┐    │
│  │  Adapter Layer                  │    │
│  │  ┌───────┐ ┌───────┐ ┌───────┐ │    │
│  │  │Claude │ │Gemini │ │ ACP   │ │    │
│  │  └───────┘ └───────┘ └───────┘ │    │
│  └─────────────────────────────────┘    │
│         │                               │
│         ▼                               │
│  ┌─────────────────────────────────┐    │
│  │  AI Agent (subprocess)          │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Pros:** Multi-agent, async operations, comprehensive safety, rich metrics
**Cons:** External tool, more complex setup, separate from Claude Code

---

## Conclusion

Ralph Orchestrator provides several valuable innovations that could improve the official Ralph plugin:

1. **Safety improvements** (cost ceiling, loop detection, failure counter) are low-hanging fruit
2. **Metrics tracking** provides valuable visibility into iteration efficiency
3. **Scratchpad pattern** enables better context preservation
4. **Automatic rollback** adds resilience to failing iterations

The multi-agent and ACP features are interesting for future consideration but require more significant architectural changes.

---

## References

- [mikeyobrien/ralph-orchestrator](https://github.com/mikeyobrien/ralph-orchestrator) - Source repository
- [Official Ralph Plugin Guide](../official-repo-practices/ralph-wiggum-guide.md) - Our current implementation
- [Geoffrey Huntley's Original Article](https://ghuntley.com/ralph/) - The technique's origin

---

*Analysis created: January 2026*
