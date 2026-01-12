# Agent SDK Dev Plugin Guide

A comprehensive guide to using the Agent SDK Dev plugin for building Claude Agent SDK applications.

---

## Table of Contents

1. [What is Agent SDK Dev?](#what-is-agent-sdk-dev)
2. [The /new-sdk-app Command](#the-new-sdk-app-command)
3. [Verifier Agents](#verifier-agents)
4. [Project Structure Generated](#project-structure-generated)
5. [Typical Workflow](#typical-workflow)
6. [Best Practices for SDK Development](#best-practices-for-sdk-development)
7. [Verification Checks Explained](#verification-checks-explained)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Resources](#resources)

---

## What is Agent SDK Dev?

The **Agent SDK Dev** plugin is a comprehensive development tool included in Claude Code that streamlines the entire lifecycle of building Claude Agent SDK applications. Whether you are creating a coding assistant, a business automation agent, or a custom AI-powered tool, this plugin provides:

- **Scaffolding**: Quickly create new Agent SDK projects with the `/new-sdk-app` command
- **Verification**: Validate your projects against best practices using specialized verifier agents
- **Guidance**: Get SDK-specific recommendations and documentation references

The plugin supports both **TypeScript** and **Python** development environments, making it accessible to a wide range of developers.

### Key Components

| Component | Purpose |
|-----------|---------|
| `/new-sdk-app` | Interactive command for creating new SDK projects |
| `agent-sdk-verifier-ts` | Verifies TypeScript Agent SDK applications |
| `agent-sdk-verifier-py` | Verifies Python Agent SDK applications |

### Plugin Metadata

- **Author**: Ashwin Bhat (ashwin@anthropic.com)
- **Version**: 1.0.0
- **Repository**: [anthropics/claude-code](https://github.com/anthropics/claude-code/tree/main/plugins/agent-sdk-dev)

---

## The /new-sdk-app Command

The `/new-sdk-app` command is an interactive wizard that guides you through creating a new Claude Agent SDK application. It handles everything from project initialization to dependency installation and verification.

### Basic Usage

```bash
# Start with a project name
/new-sdk-app my-awesome-agent

# Or start interactively (the command will ask for the name)
/new-sdk-app
```

### Interactive Questions

The command asks questions **one at a time**, waiting for your response before proceeding. This ensures clarity and allows you to make informed decisions at each step.

#### Question 1: Programming Language

```
Would you like to use TypeScript or Python?
```

Choose based on your expertise and project requirements:
- **TypeScript**: Strong typing, Node.js ecosystem, excellent IDE support
- **Python**: Rapid development, extensive AI/ML libraries, simpler syntax

#### Question 2: Project Name

```
What would you like to name your project?
```

If you did not provide a name when invoking the command, you will be prompted here. Choose a descriptive, kebab-case name (e.g., `code-review-agent`, `customer-support-bot`).

#### Question 3: Agent Type

```
What kind of agent are you building?
```

Options include:
- **Coding Agent**: For SRE tasks, security reviews, code reviews, refactoring
- **Business Agent**: For customer support, content creation, data analysis
- **Custom Agent**: For specialized use cases not covered above

This selection influences the starter code and example patterns provided.

#### Question 4: Starting Point

```
What starting point would you like?
```

- **Minimal "Hello World" example**: Bare-bones setup to understand the basics
- **Basic agent with common features**: Includes error handling, configuration, and typical patterns
- **Specific example based on use case**: Tailored starter code based on your agent type

#### Question 5: Tooling Preferences

```
Which package manager would you like to use?
```

For TypeScript:
- npm (default)
- yarn
- pnpm

For Python:
- pip (default)
- poetry

### What Gets Created

After answering the questions, the command:

1. **Creates the project directory** with appropriate structure
2. **Initializes the project** (package.json for TypeScript, requirements.txt or pyproject.toml for Python)
3. **Checks for the latest SDK version** before installation
4. **Installs the Claude Agent SDK** with the latest stable version
5. **Creates starter files** with working example code
6. **Sets up environment configuration** (.env.example, .gitignore)
7. **Runs verification** using the appropriate verifier agent

---

## Verifier Agents

The plugin includes two specialized verifier agents that analyze your project for correct setup, best practices adherence, and deployment readiness.

### agent-sdk-verifier-py (Python Verifier)

**Purpose**: Verifies Python Agent SDK applications for correct configuration and SDK best practices.

**When to Use**:
- After creating a new Python SDK project
- After modifying an existing Python SDK application
- Before deploying to production
- When troubleshooting SDK-related issues

**How to Trigger**:
```
Verify my Python Agent SDK application
```
```
Check if my SDK app follows best practices
```
```
Run the Python SDK verifier
```

### agent-sdk-verifier-ts (TypeScript Verifier)

**Purpose**: Verifies TypeScript Agent SDK applications for correct configuration, type safety, and SDK best practices.

**When to Use**:
- After creating a new TypeScript SDK project
- After modifying an existing TypeScript SDK application
- Before deploying to production
- When encountering type errors or runtime issues

**How to Trigger**:
```
Verify my TypeScript Agent SDK application
```
```
Check if my SDK app follows best practices
```
```
Run the TypeScript SDK verifier
```

### Verification Report Format

Both verifiers produce a structured report:

```
Overall Status: PASS | PASS WITH WARNINGS | FAIL

Summary: Brief overview of findings

Critical Issues:
- Issues preventing the application from functioning
- Security vulnerabilities
- SDK usage errors causing runtime failures
- Syntax or import problems

Warnings:
- Suboptimal SDK usage patterns
- Missing SDK features that could improve the app
- Deviations from documentation recommendations
- Missing documentation or setup instructions

Passed Checks:
- Correctly configured items
- Properly implemented features
- Security measures in place

Recommendations:
- Specific suggestions for improvement
- Links to relevant SDK documentation
- Next steps for enhancement
```

---

## Project Structure Generated

### TypeScript Project Structure

```
my-agent/
├── src/
│   └── index.ts           # Main application entry point
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore patterns
├── package.json           # Project configuration and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

**package.json highlights**:
```json
{
  "name": "my-agent",
  "type": "module",
  "scripts": {
    "start": "node --loader ts-node/esm src/index.ts",
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^latest"
  }
}
```

**tsconfig.json highlights**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

### Python Project Structure

```
my-agent/
├── main.py                # Main application entry point
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variable template
├── .gitignore             # Git ignore patterns
└── README.md              # Project documentation
```

**requirements.txt**:
```
claude-agent-sdk>=0.1.0
python-dotenv>=1.0.0
```

### Optional: .claude Directory

For more advanced setups, you can optionally create a `.claude` directory:

```
my-agent/
├── .claude/
│   ├── agents/            # Custom subagent definitions
│   ├── commands/          # Custom slash commands
│   └── settings.json      # Claude Code settings
└── ...
```

---

## Typical Workflow

Here is the complete workflow for creating and developing an Agent SDK application:

### Step 1: Create Your Project

```bash
/new-sdk-app code-reviewer-agent
```

Answer the interactive questions:
- **Language**: TypeScript
- **Agent type**: Coding agent (code review)
- **Starting point**: Basic agent with common features
- **Package manager**: npm

### Step 2: Automatic Verification

The command automatically runs the verifier agent. Review the verification report to ensure everything is set up correctly.

### Step 3: Configure Your Environment

```bash
cd code-reviewer-agent
cp .env.example .env
```

Edit `.env` and add your API key:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from: https://console.anthropic.com/

### Step 4: Run Your Agent

**TypeScript**:
```bash
npm start
# or
node --loader ts-node/esm src/index.ts
```

**Python**:
```bash
python main.py
```

### Step 5: Develop Your Agent

Customize your agent by:
- Modifying the system prompt
- Adding custom tools via MCP
- Configuring permissions
- Creating subagents for complex workflows

### Step 6: Verify After Changes

After making significant changes, run the verifier:
```
Verify my SDK application
```

### Step 7: Prepare for Deployment

Before deploying:
1. Run a final verification
2. Ensure all environment variables are documented
3. Test error handling scenarios
4. Review security configurations

---

## Best Practices for SDK Development

### 1. Always Use the Latest SDK Version

The `/new-sdk-app` command automatically checks for the latest version. When updating existing projects:

**TypeScript**:
```bash
npm update @anthropic-ai/claude-agent-sdk
```

**Python**:
```bash
pip install --upgrade claude-agent-sdk
```

### 2. Secure Your API Keys

- **Never** hardcode API keys in your source code
- Always use environment variables
- Keep `.env` in `.gitignore`
- Provide `.env.example` with placeholder values

```bash
# .env.example
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Implement Proper Error Handling

Always wrap SDK calls in try-catch blocks:

**TypeScript**:
```typescript
try {
  const response = await agent.query("Your prompt here");
  // Handle response
} catch (error) {
  if (error instanceof SDKError) {
    console.error("SDK Error:", error.message);
  } else {
    console.error("Unexpected error:", error);
  }
}
```

**Python**:
```python
try:
    response = await agent.query("Your prompt here")
    # Handle response
except SDKError as e:
    print(f"SDK Error: {e}")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### 4. Write Clear System Prompts

System prompts should be:
- Clear and specific about the agent's purpose
- Well-structured with sections if complex
- Include constraints and guidelines
- Define the expected output format

### 5. Scope Permissions Appropriately

Only request the permissions your agent actually needs:
- File read/write access
- Network access
- Shell execution capabilities

### 6. Run Type Checking Regularly (TypeScript)

```bash
npx tsc --noEmit
```

Run this command frequently during development to catch type errors early.

### 7. Document Your Agent

Include a README with:
- What the agent does
- How to set it up
- Required environment variables
- Usage examples
- Known limitations

### 8. Use Verification Before Deployment

Always run the verifier agent before deploying:
```
Verify my SDK application before deployment
```

---

## Verification Checks Explained

### SDK Installation and Configuration

| Check | TypeScript | Python |
|-------|------------|--------|
| SDK Installed | `@anthropic-ai/claude-agent-sdk` in package.json | `claude-agent-sdk` in requirements.txt |
| Version Current | Checks against npm registry | Checks against PyPI |
| Module System | `"type": "module"` in package.json | N/A |
| Runtime Version | Node.js version in engines field | Python 3.8+ |

### Code Quality

| Check | TypeScript | Python |
|-------|------------|--------|
| Syntax Errors | Compilation check | Import verification |
| Type Safety | `npx tsc --noEmit` | N/A |
| Correct Imports | SDK module imports | SDK module imports |
| Error Handling | Try-catch around API calls | Try-except around API calls |

### SDK Usage Patterns

Both verifiers check:
- Agent initialization follows SDK documentation
- Configuration options are valid
- Response handling is correct (streaming vs. single mode)
- MCP server integration (if used) is properly configured
- Subagents (if used) are correctly set up
- Session handling (if applicable) is correct

### Security

Both verifiers check:
- `.env.example` exists with `ANTHROPIC_API_KEY` placeholder
- `.env` is listed in `.gitignore`
- API keys are not hardcoded in source files
- Proper error handling around API calls to prevent key exposure

### Documentation

Both verifiers check:
- README or documentation file exists
- Setup instructions are present
- Custom configurations are documented
- Installation steps are clear

### What Verifiers Ignore

The verifiers focus exclusively on SDK functionality. They do **not** check:
- General code style or formatting (PEP 8, Prettier)
- Naming conventions (snake_case vs. camelCase)
- Import ordering preferences
- General language best practices unrelated to SDK usage
- `type` vs. `interface` choices in TypeScript

---

## Troubleshooting Common Issues

### Issue: SDK Not Found

**Symptoms**:
- Import errors mentioning the SDK package
- "Module not found" errors

**Solutions**:

TypeScript:
```bash
npm install @anthropic-ai/claude-agent-sdk
```

Python:
```bash
pip install claude-agent-sdk
```

### Issue: Type Errors (TypeScript)

**Symptoms**:
- TypeScript compilation fails
- IDE shows type-related errors

**Solutions**:
1. Run `npx tsc --noEmit` to see all errors
2. Ensure you are using correct SDK types
3. Update the SDK to the latest version
4. Check tsconfig.json for proper module resolution

### Issue: Environment Variable Not Loading

**Symptoms**:
- "API key not found" errors
- Authentication failures

**Solutions**:
1. Ensure `.env` file exists in project root
2. Check that `.env` contains `ANTHROPIC_API_KEY=your_key`
3. Install and configure dotenv:

TypeScript:
```typescript
import 'dotenv/config';
```

Python:
```python
from dotenv import load_dotenv
load_dotenv()
```

### Issue: ES Module Errors (TypeScript)

**Symptoms**:
- "Cannot use import statement outside a module"
- "require is not defined in ES module scope"

**Solutions**:
1. Add `"type": "module"` to package.json
2. Use ES module syntax consistently
3. Check tsconfig.json module settings:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

### Issue: Python Version Incompatibility

**Symptoms**:
- Syntax errors on valid code
- Import errors for SDK modules

**Solutions**:
1. Ensure Python 3.8+ is installed
2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install claude-agent-sdk
```

### Issue: Verification Fails

**Symptoms**:
- Verifier reports FAIL status
- Critical issues in verification report

**Solutions**:
1. Read the verification report carefully
2. Address critical issues first (they prevent functionality)
3. Fix warnings after critical issues
4. Re-run verification after each fix
5. Reference the SDK documentation for correct patterns

### Issue: Rate Limiting

**Symptoms**:
- API calls failing with rate limit errors
- Intermittent failures during testing

**Solutions**:
1. Implement exponential backoff
2. Add delays between requests during testing
3. Check your API usage limits at console.anthropic.com
4. Consider upgrading your API tier if needed

---

## Resources

### Official Documentation

- **Claude Agent SDK Overview**: https://docs.anthropic.com/en/docs/agents
- **TypeScript SDK Reference**: https://docs.anthropic.com/en/api/agent-sdk/typescript
- **Python SDK Reference**: https://docs.anthropic.com/en/api/agent-sdk/python

### Package Repositories

- **TypeScript SDK (npm)**: https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk
- **Python SDK (PyPI)**: https://pypi.org/project/claude-agent-sdk/

### API Keys and Console

- **Anthropic Console**: https://console.anthropic.com/
- Get your API key from the console to use with your SDK applications

### Plugin Source Code

- **Agent SDK Dev Plugin**: https://github.com/anthropics/claude-code/tree/main/plugins/agent-sdk-dev

### Claude Code Resources

- **Claude Code Repository**: https://github.com/anthropics/claude-code
- **Claude Code Documentation**: https://code.claude.com/docs
- **Claude Developers Discord**: https://anthropic.com/discord

### Related Plugins

The Claude Code repository contains other helpful plugins:
- `code-review`: Automated code review
- `feature-dev`: Feature development workflow
- `security-guidance`: Security recommendations
- `plugin-dev`: Creating custom plugins

---

## Summary

The Agent SDK Dev plugin provides a complete toolkit for building Claude Agent SDK applications:

1. **Use `/new-sdk-app`** to quickly scaffold new projects with best practices built-in
2. **Choose your language** (TypeScript or Python) based on your needs
3. **Follow the interactive prompts** to configure your project
4. **Run verifiers regularly** to ensure your code follows SDK best practices
5. **Secure your API keys** using environment variables
6. **Document your agent** for maintainability
7. **Verify before deployment** to catch issues early

By following this guide and using the plugin's verification tools, you can build robust, secure, and well-structured Agent SDK applications.

---

*This guide was created based on the official Agent SDK Dev plugin from the Anthropic Claude Code repository.*
