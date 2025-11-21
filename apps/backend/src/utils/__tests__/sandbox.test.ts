import { describe, it, expect } from "bun:test";
import { existsSync } from "fs";

import { createTempFile, cleanupTempFile, parseExecutionOutput, sanitizeCode } from "../sandbox.js";

describe("createTempFile", () => {
  it("should create a temp file with .ts extension", async () => {
    const content = "console.log('test');";
    const filepath = await createTempFile(content, ".ts");

    expect(filepath).toContain(".ts");
    expect(existsSync(filepath)).toBe(true);

    // Cleanup
    await cleanupTempFile(filepath);
  });

  it("should create a temp file with .js extension", async () => {
    const content = "console.log('test');";
    const filepath = await createTempFile(content, ".js");

    expect(filepath).toContain(".js");
    expect(existsSync(filepath)).toBe(true);

    // Cleanup
    await cleanupTempFile(filepath);
  });

  it("should create a temp file with .py extension", async () => {
    const content = "print('test')";
    const filepath = await createTempFile(content, ".py");

    expect(filepath).toContain(".py");
    expect(existsSync(filepath)).toBe(true);

    // Cleanup
    await cleanupTempFile(filepath);
  });

  it("should create unique temp files", async () => {
    const content = "test";
    const filepath1 = await createTempFile(content, ".ts");
    const filepath2 = await createTempFile(content, ".ts");

    expect(filepath1).not.toBe(filepath2);

    // Cleanup
    await cleanupTempFile(filepath1);
    await cleanupTempFile(filepath2);
  });
});

describe("cleanupTempFile", () => {
  it("should remove an existing file", async () => {
    const filepath = await createTempFile("test", ".ts");
    expect(existsSync(filepath)).toBe(true);

    await cleanupTempFile(filepath);
    expect(existsSync(filepath)).toBe(false);
  });

  it("should not throw for non-existent file", async () => {
    const nonExistent = "/tmp/non_existent_file_12345.ts";

    // Should not throw
    await expect(cleanupTempFile(nonExistent)).resolves.toBeUndefined();
  });
});

describe("parseExecutionOutput", () => {
  it("should parse valid JSON number", () => {
    const result = parseExecutionOutput("42\n");
    expect(result).toBe(42);
  });

  it("should parse valid JSON string", () => {
    const result = parseExecutionOutput('"hello"');
    expect(result).toBe("hello");
  });

  it("should parse valid JSON boolean", () => {
    expect(parseExecutionOutput("true")).toBe(true);
    expect(parseExecutionOutput("false")).toBe(false);
  });

  it("should parse valid JSON array", () => {
    const result = parseExecutionOutput("[1, 2, 3]");
    expect(result).toEqual([1, 2, 3]);
  });

  it("should parse valid JSON object", () => {
    const result = parseExecutionOutput('{"a": 1, "b": 2}');
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should parse null", () => {
    const result = parseExecutionOutput("null");
    expect(result).toBe(null);
  });

  it("should return trimmed string for invalid JSON", () => {
    const result = parseExecutionOutput("plain text output\n");
    expect(result).toBe("plain text output");
  });

  it("should handle whitespace around JSON", () => {
    const result = parseExecutionOutput("  42  \n");
    expect(result).toBe(42);
  });

  it("should handle nested JSON", () => {
    const result = parseExecutionOutput('{"a": [1, 2], "b": {"c": 3}}');
    expect(result).toEqual({ a: [1, 2], b: { c: 3 } });
  });
});

describe("sanitizeCode", () => {
  describe("JavaScript/TypeScript", () => {
    it("should pass safe code", () => {
      const code = 'function add(a, b) { return a + b; }';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(true);
    });

    it("should reject fs require", () => {
      const code = 'const fs = require("fs");';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("fs");
    });

    it("should reject child_process require", () => {
      const code = 'const cp = require("child_process");';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("child_process");
    });

    it("should reject fs import", () => {
      const code = 'import fs from "fs";';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
    });

    it("should reject child_process import", () => {
      const code = 'import { spawn } from "child_process";';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
    });

    it("should reject eval", () => {
      const code = 'eval("malicious code")';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("eval");
    });

    it("should reject Function constructor", () => {
      const code = 'new Function("return 1")';
      const result = sanitizeCode(code, "javascript");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("Function");
    });
  });

  describe("Python", () => {
    it("should pass safe code", () => {
      const code = 'def add(a, b):\n    return a + b';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(true);
    });

    it("should reject os import", () => {
      const code = 'import os\nos.system("rm -rf /")';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
      expect(result.reason).toContain("os");
    });

    it("should reject subprocess import", () => {
      const code = 'import subprocess';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });

    it("should reject sys import", () => {
      const code = 'import sys';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });

    it("should reject from os import", () => {
      const code = 'from os import path';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });

    it("should reject eval", () => {
      const code = 'eval("malicious")';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });

    it("should reject exec", () => {
      const code = 'exec("malicious")';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });

    it("should reject __import__", () => {
      const code = '__import__("os")';
      const result = sanitizeCode(code, "python");
      expect(result.safe).toBe(false);
    });
  });
});
