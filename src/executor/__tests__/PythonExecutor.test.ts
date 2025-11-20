import { describe, it, expect, beforeEach } from "bun:test";
import { PythonExecutor } from "../PythonExecutor.js";

describe("PythonExecutor", () => {
  let executor: PythonExecutor;

  beforeEach(() => {
    executor = new PythonExecutor();
  });

  describe("constructor", () => {
    it("should create executor for python", () => {
      const pyExecutor = new PythonExecutor();
      expect(pyExecutor).toBeInstanceOf(PythonExecutor);
    });
  });

  describe("getFileExtension", () => {
    it("should return .py for python", () => {
      expect(executor.getFileExtension()).toBe(".py");
    });
  });

  describe("validateRuntime", () => {
    it("should return true when python3 is available", async () => {
      const result = await executor.validateRuntime();
      expect(result).toBe(true);
    });
  });

  describe("execute", () => {
    it("should execute valid Python code", async () => {
      const code = 'import json\nprint(json.dumps(42))';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe(42);
      expect(result.executionTime).toBeDefined();
    });

    it("should execute code that returns arrays", async () => {
      const code = 'import json\nprint(json.dumps([1, 2, 3]))';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toEqual([1, 2, 3]);
    });

    it("should execute code that returns objects", async () => {
      const code = 'import json\nprint(json.dumps({"a": 1, "b": 2}))';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ a: 1, b: 2 });
    });

    it("should execute code that returns booleans", async () => {
      const code = 'import json\nprint(json.dumps(True))';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe(true);
    });

    it("should execute code that returns strings", async () => {
      const code = 'import json\nprint(json.dumps("hello"))';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe("hello");
    });

    it("should return error for invalid code", async () => {
      const code = 'this is not valid python!!!';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should return error for runtime errors", async () => {
      const code = 'raise Exception("test error")';
      const result = await executor.execute(code);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle code that outputs non-JSON", async () => {
      const code = 'print("plain text")';
      const result = await executor.execute(code);

      expect(result.success).toBe(true);
      expect(result.output).toBe("plain text");
    });

    it("should track execution time", async () => {
      const code = 'import json\nprint(json.dumps(1))';
      const result = await executor.execute(code);

      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe("number");
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });
  });
});
