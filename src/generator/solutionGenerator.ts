import { generateObject } from 'ai';
import { z } from 'zod';
import type { Problem, Solution, Language } from '../types/index.js';
import { SolutionSchema } from '../types/index.js';
import { SOLUTION_GENERATION_PROMPT } from '../utils/index.js';

/**
 * Generate a solution for a given problem
 */
export async function generateSolution(
  model: string,
  problem: Problem,
  language: Language = 'javascript',
): Promise<Solution> {
  const prompt = SOLUTION_GENERATION_PROMPT(problem, language);

  const result = await generateObject({
    model,
    schema: z.object({
      code: z.string().describe('Complete, working solution code'),
      explanation: z.string().describe('Explanation of the approach and algorithm'),
      timeComplexity: z.string().describe('Time complexity analysis (e.g., O(n), O(n log n))'),
      spaceComplexity: z.string().describe('Space complexity analysis (e.g., O(1), O(n))'),
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
