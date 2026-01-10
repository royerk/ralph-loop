# 🎭 Ralph Wiggum Loop

A beautiful CLI tool that runs Claude Code in an iterative loop with automatic code simplification after each iteration.

## Features

- 🔄 **Iterative Claude Code Execution**: Run Claude Code multiple times with the same prompt
- 🎨 **Pretty CLI**: Colorful output with progress indicators and beautiful formatting
- 🛑 **Smart Stop Conditions**: Automatically stop when a specific condition is met
- 🧹 **Automatic Code Simplification**: Uses the code-simplifier plugin after each iteration
- ⚙️ **No Auto-Compact**: Runs Claude Code without auto-compacting for more control

## Installation

```bash
npm install
npm run build
```

Or for development:

```bash
npm install
```

## Usage

### Basic Usage

```bash
npm run dev -- -p "Add error handling to all functions"
```

Or after building:

```bash
./dist/index.js -p "Add error handling to all functions"
```

### With Maximum Iterations

```bash
npm run dev -- -p "Refactor the codebase" -m 10
```

### With Stop Condition

The loop will stop early if the output contains the stop condition string:

```bash
npm run dev -- -p "Fix all bugs" -s "all tests passing"
```

### With Custom Working Directory

```bash
npm run dev -- -p "Update documentation" -d /path/to/project
```

### All Options

```bash
npm run dev -- \
  -p "Your prompt here" \
  -m 5 \
  -s "stop condition" \
  -d /path/to/workdir
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--prompt` | `-p` | The prompt to run in each iteration (required) | - |
| `--max-iterations` | `-m` | Maximum number of iterations | `5` |
| `--stop` | `-s` | Stop condition (string to search for in output) | - |
| `--work-dir` | `-d` | Working directory for Claude Code | Current directory |

## How It Works

1. **Initialization**: The loop starts with your specified prompt and configuration
2. **Main Iteration**:
   - Runs Claude Code with your prompt
   - Claude Code executes without auto-compact for more control
3. **Code Simplification**:
   - After each iteration, automatically runs the code-simplifier plugin
   - Ensures code stays clean and maintainable across iterations
4. **Stop Check**:
   - Checks if the stop condition is met
   - Continues to next iteration if not stopped and under max iterations
5. **Summary**: Displays a beautiful summary of all iterations

## Architecture

```
ralph-loop/
├── src/
│   ├── index.ts          # CLI entry point with Commander
│   ├── loop.ts           # Main loop logic with pretty output
│   ├── claude-runner.ts  # Claude Code execution wrapper
│   └── types.ts          # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev -- -p "Your prompt"

# Build
npm run build

# Run built version
npm start
```

## Example Output

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🎭 Ralph Wiggum Loop 🎭                             ║
║                                                        ║
║   Prompt: Add error handling to all functions         ║
║   Max Iterations: 5                                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

════════════════════════════════════════════════════════
📍 Iteration 1/5
════════════════════════════════════════════════════════

✔ Running Claude Code with prompt...
✔ Running code simplifier...

────────────────────────────────────────────────────────

════════════════════════════════════════════════════════
📍 Iteration 2/5
════════════════════════════════════════════════════════

...
```

## Requirements

- Node.js 18+
- Claude Code CLI installed and configured
- code-simplifier plugin (if not installed, the loop will warn but continue)

## License

MIT

## Contributing

Feel free to open issues or submit pull requests!
