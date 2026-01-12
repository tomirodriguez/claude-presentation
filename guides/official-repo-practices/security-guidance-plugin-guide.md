# Security Guidance Plugin for Claude Code

## Complete Guide to Automatic Security Pattern Monitoring with PreToolUse Hooks

---

## Table of Contents

1. [What is Security Guidance?](#1-what-is-security-guidance)
2. [How It Works (PreToolUse Hook Mechanism)](#2-how-it-works-pretooluse-hook-mechanism)
3. [The 9 Security Patterns Monitored](#3-the-9-security-patterns-monitored)
4. [What Gets Flagged vs What Doesn't](#4-what-gets-flagged-vs-what-doesnt)
5. [Installation and Setup](#5-installation-and-setup)
6. [Understanding Warnings](#6-understanding-warnings)
7. [Customizing the Security Checks](#7-customizing-the-security-checks)
8. [Best Practices for Secure Code with Claude](#8-best-practices-for-secure-code-with-claude)
9. [Integration with Other Security Tools](#9-integration-with-other-security-tools)
10. [When to Disable (and Why You Usually Shouldn't)](#10-when-to-disable-and-why-you-usually-shouldnt)
11. [Troubleshooting False Positives](#11-troubleshooting-false-positives)

---

## 1. What is Security Guidance?

The Security Guidance plugin is an official Anthropic plugin for Claude Code that provides **real-time security warnings** when Claude is about to write potentially vulnerable code. It acts as a safety net, catching common security anti-patterns before they make it into your codebase.

### Key Features

- **Automatic Detection**: Monitors file edits in real-time without requiring manual intervention
- **9 Security Patterns**: Covers the most common vulnerability categories
- **Non-Intrusive**: Only warns once per pattern per file per session
- **Educational**: Provides detailed explanations and safe alternatives
- **Configurable**: Can be customized or disabled when needed

### Why It Matters

Even experienced developers can inadvertently introduce security vulnerabilities. When using AI coding assistants like Claude, this plugin ensures that:

1. **Command injection vulnerabilities** are caught before execution
2. **XSS (Cross-Site Scripting)** patterns are flagged
3. **Unsafe deserialization** is prevented
4. **Dynamic code evaluation** is highlighted for review

The plugin was created by David Dworken at Anthropic and is part of the official Claude Code plugins repository.

---

## 2. How It Works (PreToolUse Hook Mechanism)

### Understanding Hooks in Claude Code

Claude Code uses a hook system that allows code to execute at specific points during Claude's operation. The Security Guidance plugin uses the **PreToolUse** hook type, which runs *before* Claude executes any tool.

### The PreToolUse Hook Flow

```
User Request
     |
     v
Claude Decides to Edit/Write File
     |
     v
[PreToolUse Hook Triggered] <-- Security Guidance runs here
     |
     v
Security Patterns Checked
     |
     +---> Pattern Found? ---> Display Warning ---> Exit Code 2 (Block)
     |                                                    |
     |                                                    v
     |                                           Claude Receives Feedback
     |                                                    |
     v                                                    v
No Pattern Found                               Claude Adjusts Approach
     |
     v
File Edit Proceeds
```

### Hook Configuration (hooks.json)

The plugin is configured through a `hooks.json` file:

```json
{
  "description": "Security reminder hook that warns about potential security issues when editing files",
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/security_reminder_hook.py"
          }
        ],
        "matcher": "Edit|Write|MultiEdit"
      }
    ]
  }
}
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `PreToolUse` | Hook type that runs before tool execution |
| `matcher` | Regex pattern matching `Edit`, `Write`, or `MultiEdit` tools |
| `command` | Python script that performs security checks |
| `${CLAUDE_PLUGIN_ROOT}` | Variable pointing to plugin installation directory |

### Exit Codes

The hook uses specific exit codes to communicate with Claude:

| Exit Code | Meaning | Behavior |
|-----------|---------|----------|
| `0` | Success/Allow | Tool execution proceeds normally |
| `2` | Block | Tool execution is halted; stderr message sent to Claude |
| Other non-zero | Error | Non-blocking error shown to user |

When the security hook exits with code `2`, Claude receives the warning message from stderr and must acknowledge or address the security concern before proceeding.

---

## 3. The 9 Security Patterns Monitored

### Overview Table

| # | Pattern Name | Detection Type | Language/Context | Severity |
|---|--------------|----------------|------------------|----------|
| 1 | GitHub Actions Workflow | Path-based | YAML | High |
| 2 | Child Process Exec | Content-based | JavaScript/Node.js | High |
| 3 | New Function Injection | Content-based | JavaScript | High |
| 4 | Eval Injection | Content-based | JavaScript | Critical |
| 5 | React dangerouslySetInnerHTML | Content-based | React/JSX | High |
| 6 | document.write XSS | Content-based | JavaScript | Medium |
| 7 | innerHTML XSS | Content-based | JavaScript | High |
| 8 | Pickle Deserialization | Content-based | Python | Critical |
| 9 | os.system Injection | Content-based | Python | High |

---

### Pattern 1: GitHub Actions Workflow Injection

**Detection Method**: Path-based (files in `.github/workflows/` with `.yml` or `.yaml` extension)

**Risk**: Command injection through untrusted input in workflow files

**What Gets Flagged**:
```yaml
# DANGEROUS - user-controlled input directly in run command
run: echo "${{ github.event.issue.title }}"
```

**Safe Alternative**:
```yaml
# SAFE - using environment variable with proper quoting
env:
  TITLE: ${{ github.event.issue.title }}
run: echo "$TITLE"
```

**Risky GitHub Context Variables**:
- `github.event.issue.title` / `github.event.issue.body`
- `github.event.pull_request.title` / `github.event.pull_request.body`
- `github.event.comment.body`
- `github.event.review.body`
- `github.event.commits.*.message`
- `github.event.head_commit.message`
- `github.event.pull_request.head.ref`
- `github.head_ref`

---

### Pattern 2: Child Process Exec (Node.js)

**Substrings Detected**: `child_process.exec`, `exec(`, `execSync(`

**Risk**: Shell command injection when user input is concatenated into commands

**What Gets Flagged**:
```javascript
const { exec } = require('child_process');
exec(`ls -la ${userInput}`);  // DANGEROUS
```

**Safe Alternative**:
```javascript
import { execFileNoThrow } from '../utils/execFileNoThrow.js';
await execFileNoThrow('ls', ['-la', userInput]);  // SAFE
```

**Why execFile is Safer**:
- `exec()` spawns a shell, enabling command chaining with `;`, `&&`, `|`
- `execFile()` calls the executable directly without shell interpretation
- Arguments are passed as array, preventing injection

---

### Pattern 3: New Function Injection

**Substring Detected**: `new Function`

**Risk**: Dynamic code execution similar to eval

**What Gets Flagged**:
```javascript
// DANGEROUS - can execute arbitrary code
const dynamicFunc = new Function('arg', userProvidedCode);
```

**Safe Alternatives**:
- Use predefined functions with configuration objects
- Implement a safe expression parser
- Use a sandboxed interpreter if dynamic code is truly needed

---

### Pattern 4: Eval Injection

**Substring Detected**: `eval(`

**Risk**: Arbitrary code execution - one of the most dangerous patterns

**What Gets Flagged**:
```javascript
// CRITICAL DANGER - executes any code
eval(userInput);

// Also dangerous - JSON parsing via eval
const data = eval('(' + jsonString + ')');
```

**Safe Alternatives**:
```javascript
// For JSON parsing
const data = JSON.parse(jsonString);

// For mathematical expressions
// Use a safe expression evaluator library
```

---

### Pattern 5: React dangerouslySetInnerHTML

**Substring Detected**: `dangerouslySetInnerHTML`

**Risk**: XSS vulnerabilities when rendering untrusted HTML

**What Gets Flagged**:
```jsx
// DANGEROUS without sanitization
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**Safe Alternatives**:
```jsx
// Option 1: Use textContent for plain text
<div>{userContent}</div>

// Option 2: Sanitize with DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

---

### Pattern 6: document.write XSS

**Substring Detected**: `document.write`

**Risk**: XSS attacks and performance/compatibility issues

**What Gets Flagged**:
```javascript
// DANGEROUS - can inject scripts
document.write('<div>' + userInput + '</div>');
```

**Safe Alternatives**:
```javascript
// Use DOM manipulation
const div = document.createElement('div');
div.textContent = userInput;
document.body.appendChild(div);
```

---

### Pattern 7: innerHTML XSS

**Substrings Detected**: `.innerHTML =`, `.innerHTML=`

**Risk**: XSS when setting HTML content from untrusted sources

**What Gets Flagged**:
```javascript
// DANGEROUS with user content
element.innerHTML = userProvidedHTML;
```

**Safe Alternatives**:
```javascript
// For plain text
element.textContent = userText;

// For HTML with sanitization
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userProvidedHTML);
```

---

### Pattern 8: Pickle Deserialization (Python)

**Substring Detected**: `pickle`

**Risk**: Arbitrary code execution during deserialization

**What Gets Flagged**:
```python
import pickle

# CRITICAL DANGER - can execute arbitrary code
data = pickle.loads(untrusted_bytes)
```

**Safe Alternatives**:
```python
import json

# SAFE - JSON cannot execute code
data = json.loads(json_string)

# For complex objects, use a schema validator
import marshmallow
# or
import pydantic
```

**Why Pickle is Dangerous**:
Pickle can deserialize arbitrary Python objects, including those that execute code during unpickling via `__reduce__` methods.

---

### Pattern 9: os.system Injection (Python)

**Substrings Detected**: `os.system`, `from os import system`

**Risk**: Shell command injection

**What Gets Flagged**:
```python
import os

# DANGEROUS with user input
os.system(f"ls -la {user_directory}")
```

**Safe Alternatives**:
```python
import subprocess

# SAFE - no shell, arguments as list
subprocess.run(['ls', '-la', user_directory], check=True)

# Or with shell=False explicitly
subprocess.run(['command', 'arg1', 'arg2'], shell=False)
```

---

## 4. What Gets Flagged vs What Doesn't

### Detection Mechanism Summary

The plugin uses two detection methods:

1. **Path-based detection**: Checks the file path (e.g., GitHub workflows)
2. **Content-based detection**: Searches for specific substrings in the new code

### What Gets Flagged

| Scenario | Flagged? | Reason |
|----------|----------|--------|
| Writing `eval(userInput)` | Yes | Contains `eval(` substring |
| Writing `document.write()` | Yes | Contains `document.write` |
| Editing `.github/workflows/deploy.yml` | Yes | Path matches workflow pattern |
| Using `pickle.dumps()` | Yes | Contains `pickle` substring |
| Using `.innerHTML = ` | Yes | Matches exact substring pattern |

### What Doesn't Get Flagged

| Scenario | Flagged? | Reason |
|----------|----------|--------|
| Variable named `evaluation` | No | `eval(` requires the parenthesis |
| `innerHTML` in comments | Yes* | Substring matching doesn't exclude comments |
| Safe `JSON.parse()` | No | Not in pattern list |
| `subprocess.run()` | No | Only `os.system` is flagged |
| `innerHTMLContent` variable | No | Requires ` = ` after `.innerHTML` |
| Second edit to same file/pattern | No | Warning shown only once per session |

### Session-Based Warning Behavior

The plugin tracks which warnings have been shown using session-scoped state files:
- Location: `~/.claude/security_warnings_state_{session_id}.json`
- Each warning is keyed by `{file_path}-{rule_name}`
- Warnings older than 30 days are automatically cleaned up

---

## 5. Installation and Setup

### Prerequisites

- Claude Code installed and configured
- Python 3 available in PATH
- Write access to `~/.claude/` directory

### Installation Steps

#### Step 1: Clone or Download the Plugin

```bash
# Clone the official repository
git clone https://github.com/anthropics/claude-code.git

# Navigate to the plugin
cd claude-code/plugins/security-guidance
```

#### Step 2: Plugin Structure

Ensure the following structure exists:

```
security-guidance/
├── .claude-plugin/
│   └── plugin.json
└── hooks/
    ├── hooks.json
    └── security_reminder_hook.py
```

#### Step 3: Install the Plugin

Copy the plugin to your Claude Code plugins directory:

```bash
# Create plugins directory if it doesn't exist
mkdir -p ~/.claude/plugins

# Copy the security-guidance plugin
cp -r security-guidance ~/.claude/plugins/
```

#### Step 4: Verify Installation

Start Claude Code and check that the plugin is loaded:

```bash
claude-code --list-plugins
```

### Configuration Files

#### plugin.json
```json
{
  "name": "security-guidance",
  "version": "1.0.0",
  "author": "David Dworken <dworken@anthropic.com>",
  "description": "Security reminder hook that warns about potential security issues when editing files, including command injection, XSS, and unsafe code patterns."
}
```

#### hooks.json
```json
{
  "description": "Security reminder hook that warns about potential security issues when editing files",
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ${CLAUDE_PLUGIN_ROOT}/hooks/security_reminder_hook.py"
          }
        ],
        "matcher": "Edit|Write|MultiEdit"
      }
    ]
  }
}
```

---

## 6. Understanding Warnings

### Warning Format

When a security pattern is detected, you'll see a warning like:

```
⚠️ Security Warning: eval() executes arbitrary code and is a major security risk.
Consider using JSON.parse() for data parsing or alternative design patterns that
don't require code evaluation. Only use eval() if you truly need to evaluate
arbitrary code.
```

### Warning Components

Each warning includes:

1. **Alert indicator**: Visual marker (⚠️) to draw attention
2. **Pattern identification**: What was detected
3. **Risk explanation**: Why this is a security concern
4. **Safe alternatives**: Recommended approaches
5. **Acknowledgment**: Guidance on when the pattern might be acceptable

### How Claude Responds to Warnings

When a warning is triggered:

1. **Execution is blocked** (exit code 2)
2. **Warning is sent to Claude** via stderr
3. **Claude acknowledges** the security concern
4. **Claude may**:
   - Suggest a safer alternative
   - Ask for user confirmation to proceed
   - Refactor the code to avoid the pattern

### Example Interaction

```
User: Write a function to execute a shell command

Claude: I'll create a function to execute shell commands.
[Attempts to use exec()]

[Security Warning Triggered]
⚠️ Security Warning: Using child_process.exec() can lead to command injection...

Claude: I see a security warning about exec(). Let me use a safer approach
with execFile instead, which prevents shell injection by not spawning a shell...
```

---

## 7. Customizing the Security Checks

### Adding New Patterns

To add custom security patterns, edit `security_reminder_hook.py`:

```python
SECURITY_PATTERNS = [
    # ... existing patterns ...

    # Add your custom pattern
    {
        "ruleName": "sql_injection",
        "substrings": ["execute(f\"", "execute(f'", "cursor.execute(user"],
        "reminder": """⚠️ Security Warning: Potential SQL injection detected.

Use parameterized queries instead:
cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))

Never concatenate user input into SQL strings.""",
    },
]
```

### Creating Path-Based Patterns

```python
{
    "ruleName": "env_file_exposure",
    "path_check": lambda path: path.endswith(".env") or ".env." in path,
    "reminder": """⚠️ Security Warning: You are editing an environment file.

Ensure this file:
1. Is listed in .gitignore
2. Does not contain production secrets in development
3. Uses proper secret management in production""",
}
```

### Modifying Existing Patterns

To make a pattern less strict:

```python
# Original - flags any use of pickle
{
    "ruleName": "pickle_deserialization",
    "substrings": ["pickle"],
    ...
}

# Modified - only flags loads/load (not dumps/dump)
{
    "ruleName": "pickle_deserialization",
    "substrings": ["pickle.load", "pickle.loads"],
    ...
}
```

### Environment Variables

Control the plugin behavior with environment variables:

```bash
# Disable security reminders entirely
export ENABLE_SECURITY_REMINDER=0

# Enable debug logging
# (Logs are written to /tmp/security-warnings-log.txt)
```

---

## 8. Best Practices for Secure Code with Claude

### General Guidelines

1. **Trust the warnings**: When Claude receives a security warning, review the suggestion carefully
2. **Understand the context**: Some patterns are safe in specific contexts (e.g., eval for a code playground)
3. **Prefer safe alternatives**: The warnings usually suggest better approaches
4. **Document exceptions**: If you must use a flagged pattern, document why

### Language-Specific Best Practices

#### JavaScript/Node.js

```javascript
// AVOID
exec(`command ${userInput}`);
eval(dynamicCode);
element.innerHTML = content;

// PREFER
execFile('command', [userInput]);
// Use a safe parser or predefined functions
element.textContent = content;
// Or use DOMPurify for HTML
```

#### Python

```python
# AVOID
import pickle
os.system(f"command {user_input}")
exec(user_code)

# PREFER
import json
subprocess.run(['command', user_input], shell=False)
# Use ast.literal_eval for safe evaluation of literals
```

#### React

```jsx
// AVOID
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// PREFER
<div>{userContent}</div>
// Or sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />
```

### Working with Claude Effectively

1. **Be specific about security requirements**: Tell Claude your security constraints upfront
2. **Review generated code**: Always review code that handles user input
3. **Ask for explanations**: Have Claude explain why a particular approach is safe
4. **Request security reviews**: Ask Claude to review code for security issues

---

## 9. Integration with Other Security Tools

### Complementary Tools

The Security Guidance plugin works alongside other security measures:

| Tool | Purpose | Integration |
|------|---------|-------------|
| ESLint Security Plugin | Static analysis for JS | Catches issues at lint time |
| Bandit (Python) | Python security linter | CI/CD integration |
| Snyk | Dependency scanning | Monitors vulnerabilities |
| SonarQube | Code quality/security | Comprehensive analysis |
| GitHub Security Advisories | Dependency alerts | Repository integration |

### CI/CD Integration

The Security Guidance plugin is designed for development-time feedback. For CI/CD, consider:

```yaml
# Example GitHub Actions workflow
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Bandit (Python)
        run: bandit -r src/

      - name: Run npm audit
        run: npm audit

      - name: Run ESLint Security
        run: npx eslint --plugin security src/
```

### Pre-Commit Hooks

Complement the plugin with pre-commit hooks:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/PyCQA/bandit
    rev: 1.7.5
    hooks:
      - id: bandit

  - repo: https://github.com/eslint/eslint
    rev: v8.50.0
    hooks:
      - id: eslint
        additional_dependencies:
          - eslint-plugin-security
```

---

## 10. When to Disable (and Why You Usually Shouldn't)

### Valid Reasons to Disable

| Scenario | Reason | Recommendation |
|----------|--------|----------------|
| Building a code sandbox | eval() is the feature | Disable for specific files only |
| Legacy code maintenance | Many existing patterns | Address warnings incrementally |
| Educational content | Teaching about vulnerabilities | Document the disabled status |
| Performance testing | Hook overhead measurement | Temporary disable only |

### How to Disable

#### Temporarily (Session-Based)
```bash
ENABLE_SECURITY_REMINDER=0 claude-code
```

#### Permanently (Not Recommended)
```bash
# Add to shell profile
export ENABLE_SECURITY_REMINDER=0
```

### Why You Shouldn't Disable

1. **Silent vulnerabilities**: Without warnings, dangerous patterns slip through
2. **Learning opportunity lost**: Warnings teach secure coding practices
3. **Minimal overhead**: The hook adds negligible latency
4. **One-time warnings**: Each pattern only warns once per file per session

### Alternative to Disabling

Instead of disabling, consider:

1. **Customizing patterns**: Remove specific patterns that don't apply to your use case
2. **Adding exceptions**: Modify the hook to skip specific files
3. **Acknowledging and proceeding**: The warning only blocks once; subsequent edits proceed

---

## 11. Troubleshooting False Positives

### Common False Positive Scenarios

#### 1. Variable Names Containing Keywords

**Problem**: Variable named `evaluation` triggers `eval` warning

**Solution**: This shouldn't happen with the current pattern (`eval(` requires parenthesis), but if you encounter similar issues, modify the pattern:

```python
# More specific pattern
"substrings": ["eval(", " eval(", "\teval(", "(eval("],
```

#### 2. Comments and Documentation

**Problem**: Security patterns in comments trigger warnings

**Solution**: Add comment detection to the hook:

```python
def is_in_comment(content, substring_pos, file_extension):
    # Find the line containing the substring
    line_start = content.rfind('\n', 0, substring_pos) + 1
    line = content[line_start:substring_pos]

    if file_extension in ['.js', '.ts', '.jsx', '.tsx']:
        return '//' in line or line.strip().startswith('*')
    elif file_extension == '.py':
        return '#' in line
    # Add more languages as needed
    return False
```

#### 3. Test Files

**Problem**: Security patterns in test files trigger warnings

**Solution**: Add test file exclusion:

```python
def should_skip_file(file_path):
    test_indicators = ['test_', '_test.', '.test.', 'spec.', '__tests__']
    return any(indicator in file_path.lower() for indicator in test_indicators)
```

#### 4. Third-Party Code

**Problem**: Warnings for code in `node_modules` or vendor directories

**Solution**: Add exclusion paths:

```python
EXCLUDED_PATHS = [
    'node_modules/',
    'vendor/',
    '.venv/',
    'site-packages/',
]

def is_excluded_path(file_path):
    return any(excluded in file_path for excluded in EXCLUDED_PATHS)
```

### Debugging the Hook

Enable debug logging:

```python
# In security_reminder_hook.py
DEBUG_LOG_FILE = "/tmp/security-warnings-log.txt"

def debug_log(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
    with open(DEBUG_LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")
```

View logs:
```bash
tail -f /tmp/security-warnings-log.txt
```

### Resetting Warning State

If warnings are not appearing when expected:

```bash
# Clear all session state files
rm ~/.claude/security_warnings_state_*.json
```

### Reporting Issues

If you find a genuine false positive or missing pattern:

1. Check the [Claude Code repository issues](https://github.com/anthropics/claude-code/issues)
2. Provide the code sample that triggered the false positive
3. Suggest the expected behavior

---

## Quick Reference Card

### Security Patterns at a Glance

| Pattern | Trigger | Safe Alternative |
|---------|---------|------------------|
| `eval()` | `eval(` | `JSON.parse()`, safe parsers |
| `exec()` | `exec(`, `execSync(` | `execFile()`, `spawn()` |
| `new Function` | `new Function` | Predefined functions |
| `innerHTML` | `.innerHTML =` | `textContent`, DOMPurify |
| `dangerouslySetInnerHTML` | Full string | DOMPurify sanitization |
| `document.write` | `document.write` | DOM methods |
| `pickle` | `pickle` | `json`, schema validators |
| `os.system` | `os.system` | `subprocess.run()` |
| GitHub Workflows | `.github/workflows/*.yml` | Use `env:` for user input |

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Allow | Tool proceeds |
| 2 | Block | Claude receives warning |
| Other | Error | User sees error |

### Environment Variables

| Variable | Values | Default |
|----------|--------|---------|
| `ENABLE_SECURITY_REMINDER` | `0` or `1` | `1` |

---

## Additional Resources

- [Claude Code Official Repository](https://github.com/anthropics/claude-code)
- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Python Security Guidelines](https://docs.python.org/3/library/security.html)

---

*This guide is based on the official Security Guidance plugin from the Anthropic Claude Code repository. For the latest updates, always refer to the [source repository](https://github.com/anthropics/claude-code/tree/main/plugins/security-guidance).*
