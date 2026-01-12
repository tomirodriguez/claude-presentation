---
allowed-tools: Bash, Read, Edit
argument-hint: [test pattern]
description: Run and fix failing tests
---

## Task
1. Detect the test framework (Jest, pytest, vitest, etc.)
2. Run tests matching: $ARGUMENTS (or all tests if empty)
3. If tests fail:
   - Analyze the failure
   - Propose and implement fixes
   - Re-run to verify
4. Report final results