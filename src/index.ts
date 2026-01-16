#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { RalphWiggumLoop } from './loop.js';
import { ClaudeModel, LoopConfig } from './types.js';

const VALID_MODELS = ['sonnet', 'opus', 'haiku'] as const;

interface CliOptions {
  prompt?: string;
  file?: string;
  maxIterations: string;
  model: string;
  stop?: string;
  workDir: string;
  skipSimplifier: boolean;
  continueOnError: boolean;
  verbose: boolean;
  dangerouslySkipPermissions: boolean;
}

function exitWithError(message: string): never {
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
}

function isValidModel(model: string): model is ClaudeModel {
  return (VALID_MODELS as readonly string[]).includes(model);
}

async function loadPromptFromFile(filePath: string): Promise<string> {
  const absolutePath = resolve(filePath);
  const content = await readFile(absolutePath, 'utf-8');
  console.log(chalk.dim(`Loaded prompt from: ${absolutePath}\n`));
  return content;
}

async function resolvePrompt(options: CliOptions): Promise<string> {
  if (options.prompt && options.file) {
    exitWithError('Cannot use both --prompt and --file at the same time');
  }

  if (options.prompt) {
    return options.prompt;
  }

  if (options.file) {
    return loadPromptFromFile(options.file);
  }

  exitWithError('Either --prompt or --file must be provided');
}

function buildConfig(options: CliOptions, prompt: string): LoopConfig {
  const maxIterations = parseInt(options.maxIterations, 10);

  if (Number.isNaN(maxIterations) || maxIterations < 1) {
    exitWithError('max-iterations must be a positive number');
  }

  if (!isValidModel(options.model)) {
    exitWithError('model must be one of: sonnet, opus, haiku');
  }

  return {
    prompt,
    maxIterations,
    stopCondition: options.stop,
    workDir: options.workDir,
    model: options.model,
    skipSimplifier: options.skipSimplifier,
    verbose: options.verbose,
    continueOnError: options.continueOnError,
    dangerouslySkipPermissions: options.dangerouslySkipPermissions,
  };
}

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
  .option('--no-dangerously-skip-permissions', 'Require permission prompts (safer but interactive)')
  .action(async (options: CliOptions) => {
    try {
      const prompt = await resolvePrompt(options);
      const config = buildConfig(options, prompt);
      const loop = new RalphWiggumLoop(config);
      await loop.run();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      exitWithError(message);
    }
  });

program.parse();
