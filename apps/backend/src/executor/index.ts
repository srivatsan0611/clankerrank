import { BaseExecutor } from './BaseExecutor.js';
import { BunExecutor } from './BunExecutor.js';
import { PythonExecutor } from './PythonExecutor.js';
import { TestRunner } from './TestRunner.js';

import type { Language } from '../types/index.js';

export { BaseExecutor, BunExecutor, PythonExecutor, TestRunner };

/**
 * Factory function to create the appropriate executor for a language
 */
export function createExecutor(language: Language): BaseExecutor {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return new BunExecutor(language);
    case 'python':
      return new PythonExecutor();
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}

/**
 * Create a test runner for a specific language
 */
export function createTestRunner(language: Language): TestRunner {
  const executor = createExecutor(language);
  return new TestRunner(executor);
}
