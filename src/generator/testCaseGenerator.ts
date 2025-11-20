import { generateObject } from 'ai';

import { TestCaseDescriptionSchema, TestCaseDescriptionsGenerationSchema } from '../types/index.js';
import { TEST_CASE_GENERATION_PROMPT } from '../utils/index.js';

import type { Problem, TestCaseDescription } from '../types/index.js';

/**
 * Generate test case descriptions (natural language) for a problem
 */
export async function generateTestCaseDescriptions(
  model: string,
  problem: Problem,
  count: number,
): Promise<TestCaseDescription[]> {
  const prompt = TEST_CASE_GENERATION_PROMPT(problem, count);

  const result = await generateObject({
    model,
    schema: TestCaseDescriptionsGenerationSchema,
    prompt,
  });

  // Validate and add IDs
  const testCases = result.object.testCases.map((tc) =>
    TestCaseDescriptionSchema.parse({
      ...tc,
      id: crypto.randomUUID(),
    }),
  );

  return testCases;
}
