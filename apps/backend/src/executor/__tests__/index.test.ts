import { describe, it, expect } from 'bun:test';

import {
  createExecutor,
  createTestRunner,
  BunExecutor,
  PythonExecutor,
  TestRunner,
} from '../index.js';

describe('createExecutor', () => {
  it('should return BunExecutor for javascript', () => {
    const executor = createExecutor('javascript');
    expect(executor).toBeInstanceOf(BunExecutor);
  });

  it('should return BunExecutor for typescript', () => {
    const executor = createExecutor('typescript');
    expect(executor).toBeInstanceOf(BunExecutor);
  });

  it('should return PythonExecutor for python', () => {
    const executor = createExecutor('python');
    expect(executor).toBeInstanceOf(PythonExecutor);
  });

  it('should throw error for unsupported language', () => {
    // @ts-expect-error - This is a test
    expect(() => createExecutor('ruby')).toThrow('Unsupported language');
  });
});

describe('createTestRunner', () => {
  it('should return TestRunner for javascript', () => {
    const runner = createTestRunner('javascript');
    expect(runner).toBeInstanceOf(TestRunner);
  });

  it('should return TestRunner for typescript', () => {
    const runner = createTestRunner('typescript');
    expect(runner).toBeInstanceOf(TestRunner);
  });

  it('should return TestRunner for python', () => {
    const runner = createTestRunner('python');
    expect(runner).toBeInstanceOf(TestRunner);
  });

  it('should create runner with correct executor for typescript', () => {
    const runner = createTestRunner('typescript');
    // Access private executor property
    // @ts-expect-error - This is a test
    const executor = runner.executor;
    expect(executor).toBeInstanceOf(BunExecutor);
  });

  it('should create runner with correct executor for python', () => {
    const runner = createTestRunner('python');
    // Access private executor property
    // @ts-expect-error - This is a test
    const executor = runner.executor;
    expect(executor).toBeInstanceOf(PythonExecutor);
  });
});
