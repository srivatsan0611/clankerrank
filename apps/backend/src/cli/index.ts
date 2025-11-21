import { Command } from 'commander';

import { generateCommand, type GenerateOptions } from './generate.js';
import { solveCommand, type SolveOptions } from './solve.js';
import app, { startServer } from '../api/index.js';

import type { Difficulty, Language } from '../types/index.js';

export { generateCommand, solveCommand };
export type { GenerateOptions, SolveOptions };

/**
 * Parse command line arguments and route to appropriate command using commander
 */
export async function runCLI(args: string[]): Promise<void> {
  const program = new Command();

  program
    .name('AI LeetCode Generator')
    .description('Generate coding problems and test solutions against them')
    .version('1.0.0');

  program
    .command('generate')
    .description('Generate a new coding problem')
    .option('--model <string>', 'AI model to use', 'google/gemini-2.0-flash')
    .option('--difficulty <level>', 'Problem difficulty: easy, medium, hard', 'medium')
    .option('--language <lang>', 'Target language: javascript, typescript, python', 'typescript')
    .option('--topic <string>', "Problem topic (e.g., 'arrays', 'dynamic programming')")
    .option('--tests <number>', 'Number of test cases to generate', '10')
    .option('--samples <number>', 'Number of sample test cases', '3')
    .action(async (options) => {
      const generateOptions: GenerateOptions = {
        model: options.model,
        difficulty: options.difficulty as Difficulty,
        language: options.language as Language,
        topic: options.topic,
        numTestCases: parseInt(options.tests),
        numSamples: parseInt(options.samples),
      };

      await generateCommand(generateOptions);
    });

  program
    .command('solve')
    .description("Test a user's solution against problem test cases")
    .requiredOption('--problem <id>', 'Problem ID (UUID from database)')
    .requiredOption('--solution <file>', 'Path to solution file')
    .option('--language <lang>', 'Solution language: javascript, typescript, python', 'typescript')
    .option('--show-hidden', 'Show results of hidden test cases', false)
    .action(async (options) => {
      const solveOptions: SolveOptions = {
        problemId: options.problem,
        solutionFile: options.solution,
        language: options.language as Language,
        showHidden: options.showHidden,
      };

      await solveCommand(solveOptions);
    });

  program
    .command('serve')
    .description('Start the API server')
    .option('--port <number>', 'Port to listen on', '3001')
    .action(async (options) => {
      const port = parseInt(options.port);
      const server = startServer(port);

      // Start the Bun server
      Bun.serve({
        port: server.port,
        fetch: app.fetch,
      });
    });

  await program.parseAsync(args, { from: 'user' });
}
