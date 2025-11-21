import { describe, it, expect, beforeAll } from 'bun:test';
import { readFile } from 'fs/promises';
import { join } from 'path';

import { BunExecutor } from '../BunExecutor.js';
import { TestRunner } from '../TestRunner.js';

import type { TestCase } from '../../types/index.js';

const MOCK_DATA_DIR = join(process.cwd(), 'problem', 'TEST__GOOD_INPUTS');

let testCases: TestCase[];
let correctSolution: string;
let wrongSolution: string;
let errorSolution: string;

beforeAll(async () => {
  testCases = JSON.parse(await readFile(join(MOCK_DATA_DIR, 'testCases.json'), 'utf-8'));
  correctSolution = await readFile(join(MOCK_DATA_DIR, 'mockSolution_correct.ts'), 'utf-8');
  wrongSolution = await readFile(join(MOCK_DATA_DIR, 'mockSolution_wrong.ts'), 'utf-8');
  errorSolution = await readFile(join(MOCK_DATA_DIR, 'mockSolution_error.ts'), 'utf-8');
});

describe('TestRunner', () => {
  let testRunner: TestRunner;

  beforeAll(() => {
    const executor = new BunExecutor('typescript');
    testRunner = new TestRunner(executor);
  });

  describe('runTestCase', () => {
    it('should return passed=true for correct output', async () => {
      const result = await testRunner.runTestCase(correctSolution, testCases[0]);

      expect(result.passed).toBe(true);
      expect(result.testCaseId).toBe(testCases[0].id);
      expect(result.input).toEqual(testCases[0].input);
      expect(result.expectedOutput).toBe(testCases[0].expectedOutput);
      expect(result.actualOutput).toBe(testCases[0].expectedOutput);
    });

    it('should return passed=false for incorrect output', async () => {
      // Use test case that expects false (foo, bar)
      const falseTestCase = testCases.find((tc) => tc.expectedOutput === false);
      if (!falseTestCase) throw new Error('No false test case found');

      const result = await testRunner.runTestCase(wrongSolution, falseTestCase);

      expect(result.passed).toBe(false);
      expect(result.actualOutput).toBe(true); // Wrong solution always returns true
      expect(result.expectedOutput).toBe(false);
    });

    it('should handle execution errors', async () => {
      const result = await testRunner.runTestCase(errorSolution, testCases[0]);

      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('error');
    });

    it('should track execution time', async () => {
      const result = await testRunner.runTestCase(correctSolution, testCases[0]);

      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should include test case ID in result', async () => {
      const result = await testRunner.runTestCase(correctSolution, testCases[0]);

      expect(result.testCaseId).toBe(testCases[0].id);
    });
  });

  describe('runTestCases', () => {
    it('should run multiple test cases', async () => {
      const results = await testRunner.runTestCases(correctSolution, testCases.slice(0, 3));

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result).toHaveProperty('passed');
        expect(result).toHaveProperty('input');
        expect(result).toHaveProperty('expectedOutput');
      });
    });

    it('should return results for all test cases even on failure', async () => {
      const results = await testRunner.runTestCases(wrongSolution, testCases.slice(0, 3));

      expect(results).toHaveLength(3);
    });

    it('should preserve order of test cases', async () => {
      const subset = testCases.slice(0, 3);
      const results = await testRunner.runTestCases(correctSolution, subset);

      results.forEach((result, i) => {
        expect(result.testCaseId).toBe(subset[i].id);
      });
    });
  });

  describe('compareOutputs', () => {
    // Access private method through prototype
    const compareOutputs = (actual: unknown, expected: unknown): boolean => {
      // @ts-expect-error - This is a test
      return testRunner.compareOutputs(actual, expected);
    };

    it('should compare equal primitives', () => {
      expect(compareOutputs(42, 42)).toBe(true);
      expect(compareOutputs('hello', 'hello')).toBe(true);
      expect(compareOutputs(true, true)).toBe(true);
      expect(compareOutputs(false, false)).toBe(true);
    });

    it('should compare unequal primitives', () => {
      expect(compareOutputs(42, 43)).toBe(false);
      expect(compareOutputs('hello', 'world')).toBe(false);
      expect(compareOutputs(true, false)).toBe(false);
    });

    it('should compare null values', () => {
      expect(compareOutputs(null, null)).toBe(true);
      expect(compareOutputs(null, undefined)).toBe(false);
      expect(compareOutputs(null, 0)).toBe(false);
    });

    it('should compare undefined values', () => {
      expect(compareOutputs(undefined, undefined)).toBe(true);
      expect(compareOutputs(undefined, null)).toBe(false);
    });

    it('should deep compare arrays', () => {
      expect(compareOutputs([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(compareOutputs([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(compareOutputs([1, 2], [1, 2, 3])).toBe(false);
    });

    it('should deep compare nested arrays', () => {
      expect(
        compareOutputs(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        compareOutputs(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
    });

    it('should deep compare objects', () => {
      expect(compareOutputs({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(compareOutputs({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(compareOutputs({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    });

    it('should deep compare nested objects', () => {
      expect(compareOutputs({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
      expect(compareOutputs({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('should compare mixed types', () => {
      expect(compareOutputs(42, '42')).toBe(false);
      expect(compareOutputs([1], { 0: 1 })).toBe(false);
      expect(compareOutputs(true, 1)).toBe(false);
    });

    it('should compare empty structures', () => {
      expect(compareOutputs([], [])).toBe(true);
      expect(compareOutputs({}, {})).toBe(true);
      expect(compareOutputs([], {})).toBe(false);
    });

    it('should handle arrays with objects', () => {
      expect(compareOutputs([{ a: 1 }], [{ a: 1 }])).toBe(true);
      expect(compareOutputs([{ a: 1 }], [{ a: 2 }])).toBe(false);
    });
  });
});
