# 🎭 Ralph Wiggum Loop

A beautiful CLI tool that runs Claude Code in an iterative loop with automatic code simplification after each iteration.

## Features

- 🔄 **Iterative Claude Code Execution**: Run Claude Code multiple times with the same prompt
- 📄 **File-based Prompts**: Load prompts from markdown files for complex or reusable instructions
- 🤖 **Model Selection**: Choose between Sonnet, Opus, or Haiku for each loop
- 🎨 **Pretty CLI**: Colorful output with progress indicators and beautiful formatting
- 🛑 **Smart Stop Conditions**: Automatically stop when a specific condition is met
- 🧹 **Automatic Code Simplification**: Uses the code-simplifier plugin after each iteration (optional)
- ⚙️ **No Auto-Compact**: Runs Claude Code without auto-compacting for more control
- 🔍 **Verbose Mode**: Detailed logging for debugging and understanding execution
- 💪 **Error Resilience**: Option to continue iterations even if one fails
- 🤝 **Claude-Compatible**: Can be invoked directly by Claude for meta-workflows

## Installation

### Global Installation (Recommended)

Install globally to use `ralph-loop` from any directory:

```bash
# 1. Clone or navigate to the project
cd /home/user/ralph-loop

# 2. Install dependencies
npm install

# 3. Build and link globally (one command!)
npm run install-global
```

Or step by step:

```bash
npm install
npm run build
npm link
```

Now you can use `ralph-loop` from anywhere:

```bash
cd ~/my-project
ralph-loop -p "Add error handling to all functions"
```

### Local Installation

For local development without global installation:

```bash
npm install
npm run build
```

Then use it with:

```bash
./dist/index.js -p "Your prompt"
# or during development:
npm run dev -- -p "Your prompt"
```

### Uninstall

To uninstall the global command:

```bash
cd /home/user/ralph-loop
npm run uninstall-global
```

## Usage

### Basic Usage

If installed globally:

```bash
ralph-loop -p "Add error handling to all functions"
```

Or for local development:

```bash
npm run dev -- -p "Add error handling to all functions"
```

### Using a Prompt File

For longer or reusable prompts, you can store them in a markdown file:

```bash
# Create a prompt file
echo "Add comprehensive error handling to all functions.
Include try-catch blocks and proper error messages." > my-prompt.md

# Use it with the loop
ralph-loop -f my-prompt.md -m 3
```

This is especially useful for:
- Complex, multi-line prompts
- Reusable prompts you run frequently
- Prompts with detailed instructions

### With Model Selection

Use a specific Claude model (sonnet, opus, or haiku):

```bash
ralph-loop -p "Refactor the codebase" --model haiku -m 10
```

### With Maximum Iterations

```bash
ralph-loop -p "Refactor the codebase" -m 10
```

### With Stop Condition

The loop will stop early if the output contains the stop condition string:

```bash
ralph-loop -p "Fix all bugs" -s "all tests passing"
```

### Skip Code Simplification

Skip the automatic code simplification step:

```bash
ralph-loop -p "Quick refactor" --skip-simplifier
```

### Continue on Errors

Keep iterating even if an iteration fails:

```bash
ralph-loop -p "Experimental changes" --continue-on-error -m 5
```

### Verbose Mode

See detailed logging of what's happening:

```bash
ralph-loop -p "Debug this issue" -v
```

### With Custom Working Directory

```bash
ralph-loop -p "Update documentation" -d /path/to/project
```

### All Options

```bash
ralph-loop \
  -p "Your prompt here" \
  -m 5 \
  --model sonnet \
  -s "stop condition" \
  -d /path/to/workdir \
  --skip-simplifier \
  --continue-on-error \
  -v
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--prompt` | `-p` | The prompt to run in each iteration (required unless --file is used) | - |
| `--file` | `-f` | Read prompt from a markdown file (required unless --prompt is used) | - |
| `--max-iterations` | `-m` | Maximum number of iterations | `5` |
| `--model` | - | Claude model to use: `sonnet`, `opus`, or `haiku` | Default model |
| `--stop` | `-s` | Stop condition (string to search for in output) | - |
| `--work-dir` | `-d` | Working directory for Claude Code | Current directory |
| `--skip-simplifier` | - | Skip code simplification after each iteration | `false` |
| `--continue-on-error` | - | Continue iterations even if one fails | `false` |
| `--verbose` | `-v` | Enable verbose logging | `false` |

**Notes:**
- You must provide either `--prompt` or `--file`, but not both.
- Model options: `sonnet` (balanced), `opus` (most capable), `haiku` (fastest)

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
├── examples/
│   ├── refactor-prompt.md   # Example comprehensive prompt
│   └── simple-prompt.md     # Example simple prompt
├── package.json
├── tsconfig.json
└── README.md
```

## Example Prompts

Check out the `examples/` directory for sample prompt files:

- **simple-prompt.md**: A straightforward prompt for adding error handling
- **refactor-prompt.md**: A comprehensive prompt with multiple refactoring tasks

Use them like this:

```bash
ralph-loop -f examples/refactor-prompt.md -m 5
```

## Using with Claude Code Directly

Since `ralph-loop` is a CLI tool, **Claude can invoke it directly** using bash commands! This enables powerful meta-workflows where Claude can run iterative loops on itself.

### Example: Claude Running Ralph Loop

```bash
# Claude can run this command directly
ralph-loop -p "Add comprehensive tests" -m 3 --model haiku -v
```

### Use Cases for Claude

1. **Automated Refactoring Workflows**
   ```bash
   ralph-loop -f cleanup-prompt.md -m 5 --continue-on-error
   ```

2. **Iterative Code Improvements**
   ```bash
   ralph-loop -p "Improve code quality incrementally" -m 10 --model sonnet
   ```

3. **Batch Processing Tasks**
   ```bash
   ralph-loop -p "Update all documentation" -s "all docs updated" -m 20
   ```

### Tips for Claude Usage

- Use `--verbose` to see what's happening in each iteration
- Use `--continue-on-error` for experimental workflows
- Use `--skip-simplifier` if you're handling simplification separately
- Use `-f` with prompt files for complex, multi-step instructions
- Combine with `--model haiku` for faster iterations

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
