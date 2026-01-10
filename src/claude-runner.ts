import { spawn } from 'child_process';
import { ClaudeCodeOptions } from './types.js';

export class ClaudeRunner {
  private workDir: string;
  private autoCompact: boolean;

  constructor(options: ClaudeCodeOptions) {
    this.workDir = options.workDir;
    this.autoCompact = options.autoCompact;
  }

  async runPrompt(prompt: string): Promise<{ output: string; error?: string }> {
    return this.executeClaudeCommand(prompt);
  }

  async runSimplifier(): Promise<{ output: string; error?: string }> {
    const simplifierPrompt = 'Please simplify the code using the code-simplifier plugin. Review all files and apply simplifications where appropriate.';
    return this.executeClaudeCommand(simplifierPrompt);
  }

  private executeClaudeCommand(message: string): Promise<{ output: string; error?: string }> {
    return new Promise((resolve) => {
      const args = ['-m', message];

      // Disable auto-compact if specified
      if (!this.autoCompact) {
        args.push('--no-auto-compact');
      }

      const claude = spawn('claude', args, {
        cwd: this.workDir,
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      claude.stdout?.on('data', (data) => {
        const chunk = data.toString();
        stdout += chunk;
        // Stream output in real-time
        process.stdout.write(chunk);
      });

      claude.stderr?.on('data', (data) => {
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
}
