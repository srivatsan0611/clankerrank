import type { ExecutionResult, Language } from '../types/index.js';

/**
 * Abstract base class for code execution
 */
export abstract class BaseExecutor {
  protected language: Language;

  constructor(language: Language) {
    this.language = language;
  }

  /**
   * Execute code and return the result
   * @param code - The code to execute
   * @param timeout - Maximum execution time in milliseconds (default: 5000)
   */
  abstract execute(code: string, timeout?: number): Promise<ExecutionResult>;

  /**
   * Get the file extension for this language
   */
  abstract getFileExtension(): string;

  /**
   * Validate that the required runtime is available
   */
  abstract validateRuntime(): Promise<boolean>;
}
