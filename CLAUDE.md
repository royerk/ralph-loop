# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ralph Wiggum Loop is a CLI tool that runs Claude Code in an iterative loop with automatic code simplification after each iteration. It enables iterative AI-driven code improvements with configurable stop conditions and model selection.

## Commands

```bash
npm run build          # Compile TypeScript
npm run dev -- <args>  # Run in development mode (e.g., npm run dev -- -p "prompt")
npm start              # Run compiled version
npm run install-global # Build and link globally
npm run uninstall-global
```

## CLI Usage

```bash
ralph-loop -p "Your prompt" [-m 5] [--model opus] [-s "stop"] [-d /path] [-v]
ralph-loop -f prompt.md -m 3
```

Key options:
- `-p, --prompt` - Inline prompt (required unless -f used)
- `-f, --file` - Load prompt from markdown file
- `-m, --max-iterations` - Max iterations (default: 5)
- `--model` - Claude model: sonnet, opus, haiku (default: opus)
- `-s, --stop` - Stop condition string to match in output
- `--skip-simplifier` - Disable code simplification between iterations
- `--continue-on-error` - Continue despite iteration failures
- `--dangerously-skip-permissions` - Skip permission prompts
- `-v, --verbose` - Verbose logging

## Architecture

```
src/
├── index.ts          # CLI entry point (Commander.js argument parsing)
├── loop.ts           # RalphWiggumLoop class - orchestrates iterations, pretty output
├── claude-runner.ts  # ClaudeRunner class - spawns claude CLI subprocess
└── types.ts          # TypeScript types (ClaudeModel, LoopConfig, IterationResult)
```

**Execution flow:**
1. Parse CLI args, validate prompt source (inline or file)
2. For each iteration: run Claude Code → run code-simplifier (if enabled) → check stop condition
3. Display colorful summary with success/failure counts

## Requirements

- Node.js 18+
- Claude Code CLI installed and configured
- code-simplifier plugin (optional, for auto-simplification)
