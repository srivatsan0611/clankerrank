import type { TestCase, TestResult, Language } from '../types/index.js';
import { BaseExecutor } from './BaseExecutor.js';
import { TEST_EXECUTION_CODE_TEMPLATE } from '../utils/index.js';

/**
 * Runs test cases against user solutions
 */
export class TestRunner {
  private executor: BaseExecutor;

  constructor(executor: BaseExecutor) {
    this.executor = executor;
  }

  /**
   * Run a single test case
   */
  async runTestCase(userCode: string, testCase: TestCase, timeout?: number): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Create executable code that runs the user's solution with the test input
      const executableCode = TEST_EXECUTION_CODE_TEMPLATE(
        userCode,
        testCase.input,
        this.executor['language'],
      );

      // Execute the code
      const result = await this.executor.execute(executableCode, timeout);

      const executionTime = Date.now() - startTime;

      if (!result.success) {
        return {
          testCaseId: testCase.id,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          error: result.error,
          executionTime,
        };
      }

      // Compare output
      const passed = this.compareOutputs(result.output, testCase.expectedOutput);

      return {
        testCaseId: testCase.id,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        executionTime,
      };
    } catch (error) {
      return {
        testCaseId: testCase.id,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Run multiple test cases
   */
  async runTestCases(
    userCode: string,
    testCases: TestCase[],
    timeout?: number,
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const result = await this.runTestCase(userCode, testCase, timeout);
      results.push(result);

      // Stop on first failure (optional behavior)
      // if (!result.passed) break;
    }

    return results;
  }

  /**
   * Compare actual and expected outputs
   * Handles deep equality for objects and arrays
   */
  private compareOutputs(actual: unknown, expected: unknown): boolean {
    // Handle null/undefined
    if (actual === expected) return true;
    if (actual === null || expected === null) return false;
    if (actual === undefined || expected === undefined) return false;

    // Handle primitives
    if (typeof actual !== typeof expected) return false;
    if (typeof actual !== 'object') return actual === expected;

    // Handle arrays
    if (Array.isArray(actual) && Array.isArray(expected)) {
      if (actual.length !== expected.length) return false;
      return actual.every((val, idx) => this.compareOutputs(val, expected[idx]));
    }

    if (Array.isArray(actual) !== Array.isArray(expected)) return false;

    // Handle objects
    const actualObj = actual as Record<string, unknown>;
    const expectedObj = expected as Record<string, unknown>;

    const actualKeys = Object.keys(actualObj).sort();
    const expectedKeys = Object.keys(expectedObj).sort();

    if (actualKeys.length !== expectedKeys.length) return false;
    if (!actualKeys.every((key, idx) => key === expectedKeys[idx])) return false;

    return actualKeys.every((key) => this.compareOutputs(actualObj[key], expectedObj[key]));
  }
}
