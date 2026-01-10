#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { RalphWiggumLoop } from './loop.js';
import { LoopConfig } from './types.js';

const program = new Command();

program
  .name('ralph-loop')
  .description('Ralph Wiggum loop with Claude Code integration')
  .version('1.0.0')
  .requiredOption('-p, --prompt <prompt>', 'The prompt to run in each iteration')
  .option('-m, --max-iterations <number>', 'Maximum number of iterations', '5')
  .option('-s, --stop <condition>', 'Stop condition (string to search for in output)')
  .option('-d, --work-dir <path>', 'Working directory for Claude Code', process.cwd())
  .action(async (options) => {
    try {
      const config: LoopConfig = {
        prompt: options.prompt,
        maxIterations: parseInt(options.maxIterations, 10),
        stopCondition: options.stop,
        workDir: options.workDir,
      };

      // Validate max iterations
      if (isNaN(config.maxIterations) || config.maxIterations < 1) {
        console.error(chalk.red('Error: max-iterations must be a positive number'));
        process.exit(1);
      }

      const loop = new RalphWiggumLoop(config);
      await loop.run();

    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();
