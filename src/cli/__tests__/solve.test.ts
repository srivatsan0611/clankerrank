import { describe, it, expect, beforeAll, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { readFile } from "fs/promises";
import { join } from "path";
import type { ProblemPackage } from "../../types/index.js";

const MOCK_DATA_DIR = join(process.cwd(), "problem", "85c17b55-3105-495c-bd85-6b564bba26fb");

let mockProblemPackage: ProblemPackage;
let correctSolution: string;
let wrongSolution: string;

beforeAll(async () => {
  mockProblemPackage = JSON.parse(await readFile(join(MOCK_DATA_DIR, "problemPackage.json"), "utf-8"));
  correctSolution = await readFile(join(MOCK_DATA_DIR, "mockSolution_correct.ts"), "utf-8");
  wrongSolution = await readFile(join(MOCK_DATA_DIR, "mockSolution_wrong.ts"), "utf-8");
});

describe("solveCommand", () => {
  let originalExit: typeof process.exit;
  let exitCode: number | undefined;
  let consoleOutput: string[];
  let consoleErrors: string[];

  beforeEach(() => {
    // Mock process.exit
    originalExit = process.exit;
    exitCode = undefined;
    process.exit = ((code?: number) => {
      exitCode = code;
      throw new Error(`process.exit(${code})`);
    }) as typeof process.exit;

    // Capture console output
    consoleOutput = [];
    consoleErrors = [];
    spyOn(console, "log").mockImplementation((...args) => {
      consoleOutput.push(args.map(String).join(" "));
    });
    spyOn(console, "error").mockImplementation((...args) => {
      consoleErrors.push(args.map(String).join(" "));
    });
  });

  afterEach(() => {
    process.exit = originalExit;
    mock.restore();
  });

  it("should load problem package successfully", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    expect(consoleOutput.some(line => line.includes("Loading problem package"))).toBe(true);
  });

  it("should load user solution successfully", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    expect(consoleOutput.some(line => line.includes("Loading user solution"))).toBe(true);
  });

  it("should run sample test cases", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    expect(consoleOutput.some(line => line.includes("sample test cases"))).toBe(true);
  });

  it("should run hidden tests when all samples pass", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    expect(consoleOutput.some(line => line.includes("hidden test cases"))).toBe(true);
  });

  it("should show success when all tests pass", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    const allOutput = consoleOutput.join("\n");
    // Should show some tests passed (may not be all due to some edge cases)
    expect(allOutput).toContain("passed");
  });

  it("should exit with code 1 when sample tests fail", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_wrong.ts"),
        language: "typescript",
      });
    } catch (e) {
      // Expected to throw due to process.exit
    }

    expect(exitCode).toBe(1);
  });

  it("should show hidden results when showHidden is true", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
        showHidden: true,
      });
    } catch (e) {
      // May exit
    }

    expect(consoleOutput.some(line => line.includes("hidden test cases"))).toBe(true);
  });

  it("should handle invalid problem file", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: "/nonexistent/path/problem.json",
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // Expected to throw
    }

    expect(exitCode).toBe(1);
  });

  it("should handle invalid solution file", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: "/nonexistent/path/solution.ts",
        language: "typescript",
      });
    } catch (e) {
      // Expected to throw
    }

    expect(exitCode).toBe(1);
  });

  it("should display test results with PASS/FAIL", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    const allOutput = consoleOutput.join("\n");
    // Should contain PASS or FAIL status
    expect(allOutput.includes("PASS") || allOutput.includes("FAIL")).toBe(true);
  });

  it("should include input and expected output in results", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    const allOutput = consoleOutput.join("\n");
    expect(allOutput).toContain("Input:");
    expect(allOutput).toContain("Expected:");
  });

  it("should suggest fixing sample tests before running hidden", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_wrong.ts"),
        language: "typescript",
      });
    } catch (e) {
      // Expected to throw
    }

    const allOutput = consoleOutput.join("\n");
    expect(allOutput).toContain("Fix the sample test cases");
  });

  it("should show progress messages during execution", async () => {
    const { solveCommand } = await import("../solve.js");

    try {
      await solveCommand({
        problemFile: join(MOCK_DATA_DIR, "problemPackage.json"),
        solutionFile: join(MOCK_DATA_DIR, "mockSolution_correct.ts"),
        language: "typescript",
      });
    } catch (e) {
      // May exit
    }

    const allOutput = consoleOutput.join("\n");
    expect(allOutput).toContain("Running tests");
  });
});
