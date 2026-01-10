export interface LoopConfig {
  prompt: string;
  maxIterations: number;
  stopCondition?: string;
  workDir?: string;
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
}
