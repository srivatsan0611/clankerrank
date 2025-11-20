import { generateObject } from 'ai';
import { z } from 'zod';

import { ProblemSchema } from '../types/index.js';
import { PROBLEM_GENERATION_PROMPT } from '../utils/index.js';

import type { Problem, Difficulty } from '../types/index.js';

/**
 * Generate a coding problem using AI
 */
export async function generateProblem(
  model: string,
  difficulty: Difficulty,
  topic?: string,
): Promise<Problem> {
  const prompt = PROBLEM_GENERATION_PROMPT(difficulty, topic);

  const result = await generateObject({
    model,
    schema: z.object({
      title: z.string().describe('A concise, descriptive title for the problem'),
      description: z
        .string()
        .describe('A clear description of the problem with all necessary details'),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      constraints: z
        .array(z.string())
        .describe('List of constraints like input ranges, time/space limits'),
      examples: z
        .array(
          z.object({
            input: z.string().describe('Example input as a string'),
            output: z.string().describe('Expected output as a string'),
            explanation: z.string().optional().describe('Optional explanation of the example'),
          }),
        )
        .describe('2-3 example test cases'),
      functionSignature: z
        .object({
          javascript: z.string().describe('Function signature in JavaScript'),
          typescript: z.string().describe('Function signature in TypeScript'),
          python: z.string().describe('Function signature in Python'),
        })
        .describe('Function signatures for different languages'),
    }),
    prompt,
  });

  // Validate and parse with Zod schema
  const problem = ProblemSchema.parse({
    ...result.object,
    id: crypto.randomUUID(),
  });

  return problem;
}
