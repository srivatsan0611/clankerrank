import { generateObject } from 'ai';
import { z } from 'zod';

import { SolutionSchema } from '../types/index.js';
import { SOLUTION_GENERATION_PROMPT, type TestCaseInput } from '../utils/index.js';

import type { Problem, Solution, Language } from '../types/index.js';

/**
 * Generate a solution for a given problem
 */
export async function generateSolution(
  model: string,
  problem: Problem,
  language: Language = 'typescript',
  testCases?: TestCaseInput[],
): Promise<Solution> {
  const prompt = SOLUTION_GENERATION_PROMPT(problem, language, testCases);

  const result = await generateObject({
    model,
    schema: z.object({
      code: z.string().describe('Complete, working solution code'),
      explanation: z.string().describe('Explanation of the approach and algorithm'),
      timeComplexity: z
        .string()
        .max(30)
        .describe(
          'Time complexity analysis (e.g., O(n), O(n log n)). Keep it concise and to the point, just the big O notation. NO MORE THAN 30 CHARACTERS.',
        ),
      spaceComplexity: z
        .string()
        .max(30)
        .describe(
          'Space complexity analysis (e.g., O(1), O(n)). Keep it concise and to the point, just the big O notation. NO MORE THAN 30 CHARACTERS.',
        ),
    }),
    prompt,
  });

  // Validate and parse with Zod schema
  const solution = SolutionSchema.parse({
    ...result.object,
    problemId: problem.id,
    language,
  });

  return solution;
}
