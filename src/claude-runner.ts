import { spawn } from 'child_process';
import { ClaudeCodeOptions, ClaudeModel } from './types.js';

export class ClaudeRunner {
  private workDir: string;
  private autoCompact: boolean;
  private model?: ClaudeModel;
  private verbose: boolean;
  private plugins: string[];

  constructor(options: ClaudeCodeOptions) {
    this.workDir = options.workDir;
    this.autoCompact = options.autoCompact;
    this.model = options.model;
    this.verbose = options.verbose ?? false;
    this.plugins = options.plugins ?? [];
  }

  async runPrompt(prompt: string): Promise<{ output: string; error?: string }> {
    return this.executeClaudeCommand(prompt);
  }

  async runSimplifier(): Promise<{ output: string; error?: string }> {
    const simplifierPrompt = 'Please simplify the code using the code-simplifier plugin. Review all files and apply simplifications where appropriate.';
    return this.executeClaudeCommand(simplifierPrompt);
  }

  async runParallelDelegation(tasks: string[]): Promise<{ outputs: string[]; errors: string[] }> {
    if (this.verbose) {
      console.log(`[VERBOSE] Running ${tasks.length} parallel delegated tasks with opus`);
    }

    // Run all tasks in parallel using opus subagents
    const promises = tasks.map((task, index) => {
      if (this.verbose) {
        console.log(`[VERBOSE] Task ${index + 1}: ${task.substring(0, 60)}...`);
      }
      return this.executeDelegatedCommand(task);
    });

    const results = await Promise.all(promises);

    const outputs = results.map(r => r.output);
    const errors = results.filter(r => r.error).map(r => r.error!);

    return { outputs, errors };
  }

  private executeDelegatedCommand(message: string): Promise<{ output: string; error?: string }> {
    // Force opus for delegated tasks for best quality
    return new Promise((resolve) => {
      const args = ['-m', message];

      if (!this.autoCompact) {
        args.push('--no-auto-compact');
      }

      // Always use opus for delegation
      args.push('--model', 'opus');

      // Add plugins if specified
      if (this.plugins.length > 0) {
        this.plugins.forEach(plugin => {
          args.push('--plugin', plugin);
        });
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
        // Don't stream for parallel tasks to avoid mixed output
      });

      claude.stderr?.on('data', (data) => {
        const chunk = data.toString();
        stderr += chunk;
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

  private executeClaudeCommand(message: string): Promise<{ output: string; error?: string }> {
    return new Promise((resolve) => {
      const args = ['-m', message];

      // Disable auto-compact if specified
      if (!this.autoCompact) {
        args.push('--no-auto-compact');
      }

      // Add model selection if specified
      if (this.model) {
        args.push('--model', this.model);
      }

      // Add plugins if specified
      if (this.plugins.length > 0) {
        this.plugins.forEach(plugin => {
          args.push('--plugin', plugin);
        });
      }

      // Verbose logging
      if (this.verbose) {
        console.log(`[VERBOSE] Executing: claude ${args.join(' ')}`);
        console.log(`[VERBOSE] Working directory: ${this.workDir}`);
        if (this.plugins.length > 0) {
          console.log(`[VERBOSE] Plugins: ${this.plugins.join(', ')}`);
        }
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
