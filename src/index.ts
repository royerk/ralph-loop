#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { RalphWiggumLoop } from './loop.js';
import { LoopConfig } from './types.js';

const program = new Command();

program
  .name('ralph-loop')
  .description('Ralph Wiggum loop with Claude Code integration')
  .version('1.0.0')
  .option('-p, --prompt <prompt>', 'The prompt to run in each iteration')
  .option('-f, --file <path>', 'Read prompt from a markdown file')
  .option('-m, --max-iterations <number>', 'Maximum number of iterations', '5')
  .option('--model <model>', 'Claude model to use (sonnet, opus, haiku)', 'opus')
  .option('-s, --stop <condition>', 'Stop condition (string to search for in output)')
  .option('-d, --work-dir <path>', 'Working directory for Claude Code', process.cwd())
  .option('--skip-simplifier', 'Skip code simplification after each iteration', false)
  .option('--continue-on-error', 'Continue iterations even if one fails', false)
  .option('-v, --verbose', 'Enable verbose logging', false)
  .action(async (options) => {
    try {
      // Validate that either prompt or file is provided
      if (!options.prompt && !options.file) {
        console.error(chalk.red('Error: Either --prompt or --file must be provided'));
        program.help();
      }

      if (options.prompt && options.file) {
        console.error(chalk.red('Error: Cannot use both --prompt and --file at the same time'));
        process.exit(1);
      }

      // Read prompt from file if specified
      let prompt = options.prompt;
      if (options.file) {
        const filePath = resolve(options.file);
        try {
          prompt = await readFile(filePath, 'utf-8');
          console.log(chalk.dim(`📄 Loaded prompt from: ${filePath}\n`));
        } catch (error) {
          console.error(chalk.red(`Error reading file ${filePath}:`), error instanceof Error ? error.message : String(error));
          process.exit(1);
        }
      }

      // Validate model if provided
      if (options.model && !['sonnet', 'opus', 'haiku'].includes(options.model)) {
        console.error(chalk.red('Error: model must be one of: sonnet, opus, haiku'));
        process.exit(1);
      }

      const config: LoopConfig = {
        prompt,
        maxIterations: parseInt(options.maxIterations, 10),
        stopCondition: options.stop,
        workDir: options.workDir,
        model: options.model,
        skipSimplifier: options.skipSimplifier,
        verbose: options.verbose,
        continueOnError: options.continueOnError,
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
