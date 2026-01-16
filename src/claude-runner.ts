import { spawn } from 'child_process';
import { ClaudeCodeOptions, ClaudeModel } from './types.js';

interface CommandResult {
  output: string;
  error?: string;
}

const SIMPLIFIER_PROMPT =
  'Please simplify the code using the code-simplifier plugin. Review all files and apply simplifications where appropriate.';

export class ClaudeRunner {
  private readonly workDir: string;
  private readonly model?: ClaudeModel;
  private readonly verbose: boolean;
  private readonly dangerouslySkipPermissions: boolean;

  constructor(options: ClaudeCodeOptions) {
    this.workDir = options.workDir;
    this.model = options.model;
    this.verbose = options.verbose ?? false;
    this.dangerouslySkipPermissions = options.dangerouslySkipPermissions ?? false;
  }

  async runPrompt(prompt: string): Promise<CommandResult> {
    return this.executeCommand(prompt);
  }

  async runSimplifier(): Promise<CommandResult> {
    return this.executeCommand(SIMPLIFIER_PROMPT);
  }

  private executeCommand(message: string): Promise<CommandResult> {
    return new Promise((resolve) => {
      const args = this.buildCommandArgs(message);

      if (this.verbose) {
        console.log(`[VERBOSE] Executing: claude ${args.join(' ')}`);
        console.log(`[VERBOSE] Working directory: ${this.workDir}`);
      }

      const claude = spawn('claude', args, {
        cwd: this.workDir,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      claude.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdout += chunk;
        process.stdout.write(chunk);
      });

      claude.stderr.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stderr += chunk;
        process.stderr.write(chunk);
      });

      claude.on('close', (code) => {
        if (code === 0) {
          resolve({ output: stdout });
        } else {
          resolve({ output: stdout, error: stderr || `Process exited with code ${code}` });
        }
      });

      claude.on('error', (err) => {
        resolve({ output: stdout, error: err.message });
      });
    });
  }

  private buildCommandArgs(message: string): string[] {
    const args = ['-p', message];

    if (this.dangerouslySkipPermissions) {
      args.push('--dangerously-skip-permissions');
    }

    if (this.model) {
      args.push('--model', this.model);
    }

    return args;
  }
}
