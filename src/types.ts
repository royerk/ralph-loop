export type ClaudeModel = 'sonnet' | 'opus' | 'haiku';

export interface LoopConfig {
  prompt: string;
  maxIterations: number;
  stopCondition?: string;
  workDir?: string;
  model?: ClaudeModel;
  skipSimplifier?: boolean;
  verbose?: boolean;
  continueOnError?: boolean;
}

export interface IterationResult {
  iteration: number;
  success: boolean;
  output: string;
  error?: string;
  shouldStop: boolean;
}

export interface ClaudeCodeOptions {
  autoCompact: boolean;
  workDir: string;
  model?: ClaudeModel;
  verbose?: boolean;
}
