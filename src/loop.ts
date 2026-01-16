import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { ClaudeRunner } from './claude-runner.js';
import { LoopConfig, IterationResult } from './types.js';

export class RalphWiggumLoop {
  private readonly config: LoopConfig;
  private readonly claudeRunner: ClaudeRunner;
  private readonly results: IterationResult[] = [];

  constructor(config: LoopConfig) {
    this.config = config;
    this.claudeRunner = new ClaudeRunner({
      workDir: config.workDir ?? process.cwd(),
      model: config.model,
      verbose: config.verbose,
      dangerouslySkipPermissions: config.dangerouslySkipPermissions,
    });
  }

  async run(): Promise<void> {
    this.printHeader();

    for (let i = 1; i <= this.config.maxIterations; i++) {
      const iterationResult = await this.runIteration(i);
      this.results.push(iterationResult);

      if (iterationResult.shouldStop) {
        this.printStopMessage(i);
        break;
      }

      if (i < this.config.maxIterations) {
        this.printIterationSeparator();
      }
    }

    this.printSummary();
  }

  private async runIteration(iteration: number): Promise<IterationResult> {
    this.printIterationHeader(iteration);
    this.logVerbose(`Starting iteration ${iteration}`);

    const mainResult = await this.runMainPrompt();

    if (mainResult.error) {
      this.logVerbose(`Error: ${mainResult.error}`);

      return {
        iteration,
        success: false,
        output: mainResult.output,
        error: mainResult.error,
        shouldStop: !this.config.continueOnError,
      };
    }

    await this.runSimplifierIfEnabled();

    const shouldStop = this.checkStopCondition(mainResult.output);

    if (shouldStop) {
      this.logVerbose('Stop condition detected in output');
    }

    return {
      iteration,
      success: true,
      output: mainResult.output,
      shouldStop,
    };
  }

  private async runMainPrompt(): Promise<{ output: string; error?: string }> {
    const spinner = ora(chalk.cyan('Running Claude Code with prompt...')).start();
    const result = await this.claudeRunner.runPrompt(this.config.prompt);

    if (result.error) {
      spinner.fail(chalk.red('Claude Code execution failed'));
    } else {
      spinner.succeed(chalk.green('Claude Code execution completed'));
    }

    return result;
  }

  private async runSimplifierIfEnabled(): Promise<void> {
    if (this.config.skipSimplifier) {
      this.logVerbose('Skipping code simplification');
      return;
    }

    const spinner = ora(chalk.cyan('Running code simplifier...')).start();
    const result = await this.claudeRunner.runSimplifier();

    if (result.error) {
      spinner.warn(chalk.yellow('Code simplifier encountered issues (continuing anyway)'));
      this.logVerbose(`Simplifier error: ${result.error}`);
    } else {
      spinner.succeed(chalk.green('Code simplification completed'));
    }
  }

  private checkStopCondition(output: string): boolean {
    if (!this.config.stopCondition) {
      return false;
    }

    return output.toLowerCase().includes(this.config.stopCondition.toLowerCase());
  }

  private logVerbose(message: string): void {
    if (this.config.verbose) {
      console.log(chalk.dim(`[VERBOSE] ${message}`));
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }

  private printHeader(): void {
    const maxPromptLength = 100;
    const prompt = this.config.prompt;
    const truncatedPrompt = this.truncateText(prompt, maxPromptLength);

    const lines = [
      chalk.bold.magenta('Ralph Wiggum Loop\n'),
      chalk.cyan('Prompt: ') + chalk.white(truncatedPrompt),
      chalk.cyan('Max Iterations: ') + chalk.white(String(this.config.maxIterations)),
    ];

    if (this.config.model) {
      lines.push(chalk.cyan('Model: ') + chalk.white(this.config.model));
    }

    if (this.config.stopCondition) {
      lines.push(chalk.cyan('Stop Condition: ') + chalk.white(this.config.stopCondition));
    }

    if (this.config.skipSimplifier) {
      lines.push(chalk.cyan('Simplifier: ') + chalk.white('Disabled'));
    }

    if (this.config.continueOnError) {
      lines.push(chalk.cyan('Continue on Error: ') + chalk.white('Yes'));
    }

    console.log(
      boxen(lines.join('\n'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'magenta',
      })
    );
  }

  private printIterationHeader(iteration: number): void {
    const separator = chalk.bold.blue('='.repeat(60));
    console.log('\n' + separator);
    console.log(chalk.bold.yellow(`Iteration ${iteration}/${this.config.maxIterations}`));
    console.log(separator + '\n');
  }

  private printIterationSeparator(): void {
    console.log('\n' + chalk.gray('-'.repeat(60)) + '\n');
  }

  private printStopMessage(iteration: number): void {
    const message = chalk.bold.green('Stop condition met!') + '\n' +
      chalk.white(`Stopped at iteration ${iteration}`);

    console.log(
      boxen(message, {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'green',
      })
    );
  }

  private printSummary(): void {
    const successCount = this.results.filter((r) => r.success).length;
    const totalIterations = this.results.length;
    const failedCount = totalIterations - successCount;

    const summaryText = [
      chalk.bold.cyan('Summary\n'),
      chalk.white(`Total Iterations: ${totalIterations}`),
      chalk.green(`Successful: ${successCount}`),
      chalk.red(`Failed: ${failedCount}`),
    ].join('\n');

    console.log(
      boxen(summaryText, {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan',
      })
    );
  }
}
