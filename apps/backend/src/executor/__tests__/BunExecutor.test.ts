import { describe, it, expect, beforeEach } from 'bun:test';

import { BunExecutor } from '../BunExecutor.js';

describe('BunExecutor', () => {
  let executor: BunExecutor;

  beforeEach(() => {
    executor = new BunExecutor('typescript');
  });

  describe('constructor', () => {
    it('should create executor for typescript', () => {
      const tsExecutor = new BunExecutor('typescript');
      expect(tsExecutor).toBeInstanceOf(BunExecutor);
    });

    it('should create executor for javascript', () => {
      const jsExecutor = new BunExecutor('javascript');
      expect(jsExecutor).toBeInstanceOf(BunExecutor);
    });

    it('should throw error for unsupported language', () => {
      expect(() => new BunExecutor('python')).toThrow(
        'BunExecutor only supports JavaScript and TypeScript',
      );
    });
  });

  describe('getFileExtension', () => {
    it('should return .ts for typescript', () => {
      const tsExecutor = new BunExecutor('typescript');
      expect(tsExecutor.getFileExtension()).toBe('.ts');
    });

    it('should return .js for javascript', () => {
      const jsExecutor = new BunExecutor('javascript');
      expect(jsExecutor.getFileExtension()).toBe('.js');
    });
  });

  describe('validateRuntime', () => {
    it('should return true when bun is available', async () => {
      const result = await executor.validateRuntime();
      expect(result).toBe(true);
    });
  });

  describe('execute', () => {
    it('should execute valid TypeScript code', async () => {
      const code = 'console.log(JSON.stringify(42));';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe(42);
      expect(result.executionTime).toBeDefined();
    });

    it('should execute code that returns arrays', async () => {
      const code = 'console.log(JSON.stringify([1, 2, 3]));';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toEqual([1, 2, 3]);
    });

    it('should execute code that returns objects', async () => {
      const code = 'console.log(JSON.stringify({ a: 1, b: 2 }));';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ a: 1, b: 2 });
    });

    it('should execute code that returns booleans', async () => {
      const code = 'console.log(JSON.stringify(true));';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe(true);
    });

    it('should execute code that returns strings', async () => {
      const code = 'console.log(JSON.stringify("hello"));';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe('hello');
    });

    it('should return error for invalid code', async () => {
      const code = 'this is not valid code!!!';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return error for runtime errors', async () => {
      const code = 'throw new Error("test error");';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle code that outputs non-JSON', async () => {
      const code = 'console.log("plain text");';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe('plain text');
    });

    it('should respect timeout', async () => {
      const code = 'while(true) {}'; // Infinite loop
      const result = await executor.execute(code, 100);

      expect(result.success).toBe(false);
      expect(result.executionTime).toBeDefined();
    });

    it('should track execution time', async () => {
      const code = 'console.log(JSON.stringify(1));';
      const result = await executor.execute(code);

      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
});
