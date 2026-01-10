import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { ClaudeRunner } from './claude-runner.js';
import { LoopConfig, IterationResult } from './types.js';

export class RalphWiggumLoop {
  private config: LoopConfig;
  private claudeRunner: ClaudeRunner;
  private results: IterationResult[] = [];

  constructor(config: LoopConfig) {
    this.config = config;
    this.claudeRunner = new ClaudeRunner({
      autoCompact: false,
      workDir: config.workDir || process.cwd(),
      model: config.model,
      verbose: config.verbose,
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

    if (this.config.verbose) {
      console.log(chalk.dim(`[VERBOSE] Starting iteration ${iteration}`));
    }

    // Step 1: Run the main prompt
    const mainSpinner = ora(chalk.cyan('Running Claude Code with prompt...')).start();
    const mainResult = await this.claudeRunner.runPrompt(this.config.prompt);

    if (mainResult.error) {
      mainSpinner.fail(chalk.red('Claude Code execution failed'));

      if (this.config.verbose) {
        console.log(chalk.dim(`[VERBOSE] Error: ${mainResult.error}`));
      }

      // If continueOnError is true, don't stop the loop
      const shouldStop = !this.config.continueOnError;

      return {
        iteration,
        success: false,
        output: mainResult.output,
        error: mainResult.error,
        shouldStop,
      };
    }

    mainSpinner.succeed(chalk.green('Claude Code execution completed'));

    // Step 2: Run code simplification (if not skipped)
    if (!this.config.skipSimplifier) {
      const simplifySpinner = ora(chalk.cyan('Running code simplifier...')).start();
      const simplifyResult = await this.claudeRunner.runSimplifier();

      if (simplifyResult.error) {
        simplifySpinner.warn(chalk.yellow('Code simplifier encountered issues (continuing anyway)'));

        if (this.config.verbose) {
          console.log(chalk.dim(`[VERBOSE] Simplifier error: ${simplifyResult.error}`));
        }
      } else {
        simplifySpinner.succeed(chalk.green('Code simplification completed'));
      }
    } else if (this.config.verbose) {
      console.log(chalk.dim('[VERBOSE] Skipping code simplification'));
    }

    // Check stop condition
    const shouldStop = this.checkStopCondition(mainResult.output);

    if (this.config.verbose && shouldStop) {
      console.log(chalk.dim('[VERBOSE] Stop condition detected in output'));
    }

    return {
      iteration,
      success: true,
      output: mainResult.output,
      shouldStop,
    };
  }

  private checkStopCondition(output: string): boolean {
    if (!this.config.stopCondition) {
      return false;
    }

    // Check if stop condition string appears in output
    return output.toLowerCase().includes(this.config.stopCondition.toLowerCase());
  }

  private printHeader(): void {
    let headerText = chalk.bold.magenta('🎭 Ralph Wiggum Loop 🎭\n\n') +
      chalk.cyan('Prompt: ') + chalk.white(this.config.prompt.substring(0, 100) + (this.config.prompt.length > 100 ? '...' : '')) + '\n' +
      chalk.cyan('Max Iterations: ') + chalk.white(this.config.maxIterations.toString());

    if (this.config.model) {
      headerText += '\n' + chalk.cyan('Model: ') + chalk.white(this.config.model);
    }

    if (this.config.stopCondition) {
      headerText += '\n' + chalk.cyan('Stop Condition: ') + chalk.white(this.config.stopCondition);
    }

    if (this.config.skipSimplifier) {
      headerText += '\n' + chalk.cyan('Simplifier: ') + chalk.white('Disabled');
    }

    if (this.config.continueOnError) {
      headerText += '\n' + chalk.cyan('Continue on Error: ') + chalk.white('Yes');
    }

    console.log(
      boxen(headerText, {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'magenta',
      })
    );
  }

  private printIterationHeader(iteration: number): void {
    console.log('\n' + chalk.bold.blue('═'.repeat(60)));
    console.log(chalk.bold.yellow(`📍 Iteration ${iteration}/${this.config.maxIterations}`));
    console.log(chalk.bold.blue('═'.repeat(60)) + '\n');
  }

  private printIterationSeparator(): void {
    console.log('\n' + chalk.gray('─'.repeat(60)) + '\n');
  }

  private printStopMessage(iteration: number): void {
    console.log(
      boxen(
        chalk.bold.green('✅ Stop condition met!') + '\n' +
        chalk.white(`Stopped at iteration ${iteration}`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: 'green',
        }
      )
    );
  }

  private printSummary(): void {
    const successCount = this.results.filter(r => r.success).length;
    const totalIterations = this.results.length;

    console.log(
      boxen(
        chalk.bold.cyan('📊 Summary 📊\n\n') +
        chalk.white(`Total Iterations: ${totalIterations}\n`) +
        chalk.green(`Successful: ${successCount}\n`) +
        chalk.red(`Failed: ${totalIterations - successCount}`),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'cyan',
        }
      )
    );
  }
}
