import { generateObject } from 'ai';

import { ProblemSchema, ProblemGenerationSchema } from '../types/index.js';
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
    schema: ProblemGenerationSchema,
    prompt,
  });

  // Validate and parse with Zod schema
  const problem = ProblemSchema.parse({
    ...result.object,
    id: crypto.randomUUID(),
  });

  return problem;
}
