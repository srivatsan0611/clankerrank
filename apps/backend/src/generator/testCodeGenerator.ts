import { generateText } from 'ai';

import { TestCaseInputCodeSchema } from '../types/index.js';
import { TEST_CODE_GENERATION_PROMPT } from '../utils/index.js';

import type { Problem, TestCaseDescription, TestCaseInputCode, Language } from '../types/index.js';

/**
 * Generate executable code that produces test case input
 */
export async function generateTestInputCode(
  model: string,
  problem: Problem,
  testDescription: TestCaseDescription,
  language: Language,
): Promise<TestCaseInputCode> {
  const prompt = TEST_CODE_GENERATION_PROMPT(problem, testDescription, language);

  const result = await generateText({
    model,
    prompt,
  });

  // Extract code from markdown code blocks if present
  let code = result.text.trim();

  // Remove markdown code fences if present
  const codeBlockRegex = /```(?:javascript|typescript|python|js|ts|py)?\s*\n([\s\S]*?)\n```/;
  const match = code.match(codeBlockRegex);
  if (match) {
    code = match[1].trim();
  }

  // Validate with Zod schema
  const testInputCode = TestCaseInputCodeSchema.parse({
    testCaseId: testDescription.id,
    language,
    code,
  });

  return testInputCode;
}
