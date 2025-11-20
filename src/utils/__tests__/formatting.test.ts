import { describe, it, expect, beforeAll } from "bun:test";
import { readFile } from "fs/promises";
import { join } from "path";
import {
  formatProblem,
  formatSampleTestCases,
  formatTestResults,
  formatValue,
} from "../formatting.js";
import type { Problem, TestCase, TestResult } from "../../types/index.js";

const MOCK_DATA_DIR = join(process.cwd(), "problem", "85c17b55-3105-495c-bd85-6b564bba26fb");

let mockProblem: Problem;
let mockTestCases: TestCase[];

beforeAll(async () => {
  mockProblem = JSON.parse(await readFile(join(MOCK_DATA_DIR, "problem.json"), "utf-8"));
  mockTestCases = JSON.parse(await readFile(join(MOCK_DATA_DIR, "testCases.json"), "utf-8"));
});

describe("formatProblem", () => {
  it("should include problem title", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain(mockProblem.title);
  });

  it("should include difficulty", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain(mockProblem.difficulty.toUpperCase());
  });

  it("should include description", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain(mockProblem.description.substring(0, 50));
  });

  it("should include constraints", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain("CONSTRAINTS:");
    mockProblem.constraints.forEach(constraint => {
      expect(result).toContain(constraint);
    });
  });

  it("should include examples", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain("EXAMPLES:");
    expect(result).toContain("Example 1:");
  });

  it("should include function signatures", () => {
    const result = formatProblem(mockProblem);
    expect(result).toContain("FUNCTION SIGNATURES:");
    expect(result).toContain("javascript:");
    expect(result).toContain("typescript:");
    expect(result).toContain("python:");
  });
});

describe("formatSampleTestCases", () => {
  it("should include header", () => {
    const sampleCases = mockTestCases.filter(tc => tc.isSample);
    const result = formatSampleTestCases(sampleCases);
    expect(result).toContain("SAMPLE TEST CASES:");
  });

  it("should include test case descriptions", () => {
    const sampleCases = mockTestCases.filter(tc => tc.isSample);
    const result = formatSampleTestCases(sampleCases);
    sampleCases.forEach(tc => {
      expect(result).toContain(tc.description);
    });
  });

  it("should include input and expected output", () => {
    const sampleCases = mockTestCases.filter(tc => tc.isSample);
    const result = formatSampleTestCases(sampleCases);
    expect(result).toContain("Input:");
    expect(result).toContain("Expected Output:");
  });

  it("should mark edge cases", () => {
    const edgeCases = mockTestCases.filter(tc => tc.isEdgeCase);
    if (edgeCases.length > 0) {
      const result = formatSampleTestCases(edgeCases);
      expect(result).toContain("[Edge Case]");
    }
  });
});

describe("formatTestResults", () => {
  it("should include results header with count", () => {
    const results: TestResult[] = [
      { passed: true, input: [1], expectedOutput: 1, actualOutput: 1 },
      { passed: false, input: [2], expectedOutput: 2, actualOutput: 3 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("TEST RESULTS: 1/2 passed");
  });

  it("should show PASS for passed tests", () => {
    const results: TestResult[] = [
      { passed: true, input: [1], expectedOutput: 1, actualOutput: 1 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("PASS");
  });

  it("should show FAIL for failed tests", () => {
    const results: TestResult[] = [
      { passed: false, input: [1], expectedOutput: 1, actualOutput: 2 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("FAIL");
  });

  it("should show error message for failed tests", () => {
    const results: TestResult[] = [
      { passed: false, input: [1], expectedOutput: 1, error: "Runtime error" },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("Error: Runtime error");
  });

  it("should show actual output for failed tests without error", () => {
    const results: TestResult[] = [
      { passed: false, input: [1], expectedOutput: 1, actualOutput: 2 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("Actual: 2");
  });

  it("should show execution time when available", () => {
    const results: TestResult[] = [
      { passed: true, input: [1], expectedOutput: 1, actualOutput: 1, executionTime: 123.45 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("Time: 123.45ms");
  });

  it("should format all test results", () => {
    const results: TestResult[] = [
      { passed: true, input: [1], expectedOutput: 1, actualOutput: 1 },
      { passed: true, input: [2], expectedOutput: 2, actualOutput: 2 },
      { passed: false, input: [3], expectedOutput: 3, actualOutput: 4 },
    ];
    const result = formatTestResults(results);
    expect(result).toContain("Test 1:");
    expect(result).toContain("Test 2:");
    expect(result).toContain("Test 3:");
  });
});

describe("formatValue", () => {
  it("should format null", () => {
    expect(formatValue(null)).toBe("null");
  });

  it("should format undefined", () => {
    expect(formatValue(undefined)).toBe("undefined");
  });

  it("should format strings with quotes", () => {
    expect(formatValue("hello")).toBe('"hello"');
  });

  it("should format numbers", () => {
    expect(formatValue(42)).toBe("42");
    expect(formatValue(3.14)).toBe("3.14");
  });

  it("should format booleans", () => {
    expect(formatValue(true)).toBe("true");
    expect(formatValue(false)).toBe("false");
  });

  it("should format arrays as JSON", () => {
    expect(formatValue([1, 2, 3])).toBe("[1,2,3]");
  });

  it("should format objects as JSON", () => {
    const result = formatValue({ a: 1 });
    expect(result).toContain('"a"');
    expect(result).toContain("1");
  });

  it("should format nested structures", () => {
    const result = formatValue({ a: [1, 2], b: { c: 3 } });
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
  });

  it("should format empty array", () => {
    expect(formatValue([])).toBe("[]");
  });

  it("should format empty object", () => {
    expect(formatValue({})).toBe("{}");
  });
});
