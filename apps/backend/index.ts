#!/usr/bin/env bun

/**
 * AI LeetCode Generator
 *
 * This tool uses Vercel AI SDK to generate coding problems, solutions, and test cases.
 *
 * Usage:
 *   bun run index.ts generate [options]  - Generate a new problem
 *   bun run index.ts solve [options]     - Test a solution
 *
 * Run `bun run index.ts` to see full help.
 */

import { runCLI } from './src/cli/index.js';

// Get command line arguments (skip 'bun' and 'index.ts')
const args = process.argv.slice(2);

// Run the CLI
runCLI(args).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
