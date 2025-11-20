import { generateObject } from 'ai';
import { z } from 'zod';

import { TestCaseDescriptionSchema } from '../types/index.js';
import { TEST_CASE_GENERATION_PROMPT } from '../utils/index.js';

import type { Problem, TestCaseDescription } from '../types/index.js';

/**
 * Generate test case descriptions (natural language) for a problem
 */
export async function generateTestCaseDescriptions(
  model: string,
  problem: Problem,
  count: number = 10,
): Promise<TestCaseDescription[]> {
  const prompt = TEST_CASE_GENERATION_PROMPT(problem);

  const result = await generateObject({
    model,
    schema: z.object({
      testCases: z
        .array(
          z.object({
            description: z
              .string()
              .describe("What this test case is testing (e.g., 'empty array', 'single element')"),
            expectedBehavior: z
              .string()
              .describe(
                "What should happen (e.g., 'should return 0', 'should return the element')",
              ),
            isEdgeCase: z.boolean().describe('Whether this is an edge case or normal case'),
          }),
        )
        .min(8)
        .max(15)
        .describe(`Generate ${count} comprehensive test cases`),
    }),
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
