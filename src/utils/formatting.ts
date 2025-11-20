import type { Problem, TestCase, TestResult } from '../types/index.js';

/**
 * Format a problem for CLI display
 */
export function formatProblem(problem: Problem): string {
  const lines: string[] = [];

  lines.push('='.repeat(80));
  lines.push(`PROBLEM: ${problem.title}`);
  lines.push(`DIFFICULTY: ${problem.difficulty.toUpperCase()}`);
  lines.push('='.repeat(80));
  lines.push('');
  lines.push(problem.description);
  lines.push('');

  if (problem.constraints.length > 0) {
    lines.push('CONSTRAINTS:');
    problem.constraints.forEach((constraint) => {
      lines.push(`  • ${constraint}`);
    });
    lines.push('');
  }

  if (problem.examples.length > 0) {
    lines.push('EXAMPLES:');
    problem.examples.forEach((example, i) => {
      lines.push(`\nExample ${i + 1}:`);
      lines.push(`  Input: ${example.input}`);
      lines.push(`  Output: ${example.output}`);
      if (example.explanation) {
        lines.push(`  Explanation: ${example.explanation}`);
      }
    });
    lines.push('');
  }

  lines.push('FUNCTION SIGNATURES:');
  Object.entries(problem.functionSignature).forEach(([lang, sig]) => {
    lines.push(`  ${lang}:`);
    lines.push(`    ${sig}`);
  });
  lines.push('');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

/**
 * Format sample test cases for display
 */
export function formatSampleTestCases(testCases: TestCase[]): string {
  const lines: string[] = [];

  lines.push('\nSAMPLE TEST CASES:');
  lines.push('-'.repeat(80));

  testCases.forEach((tc, i) => {
    lines.push(`\nTest Case ${i + 1}: ${tc.description}`);
    lines.push(`  Input: ${formatValue(tc.input)}`);
    lines.push(`  Expected Output: ${formatValue(tc.expectedOutput)}`);
    if (tc.isEdgeCase) {
      lines.push(`  [Edge Case]`);
    }
  });

  lines.push('\n' + '-'.repeat(80));

  return lines.join('\n');
}

/**
 * Format test results for display
 */
export function formatTestResults(results: TestResult[]): string {
  const lines: string[] = [];

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  lines.push('\n' + '='.repeat(80));
  lines.push(`TEST RESULTS: ${passed}/${total} passed`);
  lines.push('='.repeat(80));

  results.forEach((result, i) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    lines.push(`\nTest ${i + 1}: ${status}`);
    lines.push(`  Input: ${formatValue(result.input)}`);
    lines.push(`  Expected: ${formatValue(result.expectedOutput)}`);

    if (!result.passed) {
      if (result.error) {
        lines.push(`  Error: ${result.error}`);
      } else {
        lines.push(`  Actual: ${formatValue(result.actualOutput)}`);
      }
    }

    if (result.executionTime !== undefined) {
      lines.push(`  Time: ${result.executionTime.toFixed(2)}ms`);
    }
  });

  lines.push('\n' + '='.repeat(80));

  return lines.join('\n');
}

/**
 * Format a value for display (handle objects, arrays, etc.)
 */
export function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

/**
 * Create a progress indicator
 */
export function showProgress(message: string): void {
  console.log(`\n⏳ ${message}...`);
}

/**
 * Show success message
 */
export function showSuccess(message: string): void {
  console.log(`\n✓ ${message}`);
}

/**
 * Show error message
 */
export function showError(message: string): void {
  console.error(`\n✗ ${message}`);
}
