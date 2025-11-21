import { z } from 'zod';

/**
 * Supported programming languages
 */
export const LanguageSchema = z.enum(['javascript', 'typescript', 'python']);
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Difficulty levels for problems
 */
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);
export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * A coding problem
 */
export const ProblemSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  difficulty: DifficultySchema,
  constraints: z.array(z.string()),
  functionSignature: z.record(LanguageSchema, z.string()), // language -> function signature
});
export type Problem = z.infer<typeof ProblemSchema>;

/**
 * Schema for AI generation of problems (subset of ProblemSchema for generateObject)
 */
export const ProblemGenerationSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the problem'),
  description: z
    .string()
    .describe('A clear description of the problem with all necessary details'),
  difficulty: DifficultySchema,
  constraints: z
    .array(z.string())
    .describe('List of constraints like input ranges, time/space limits'),
  functionSignature: z
    .object({
      javascript: z.string().describe('Function signature in JavaScript'),
      typescript: z.string().describe('Function signature in TypeScript'),
      python: z.string().describe('Function signature in Python'),
    })
    .describe('Function signatures for different languages'),
});
export type ProblemGeneration = z.infer<typeof ProblemGenerationSchema>;

/**
 * Schema for AI generation of solutions
 */
export const SolutionGenerationSchema = z.object({
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
});
export type SolutionGeneration = z.infer<typeof SolutionGenerationSchema>;

/**
 * Schema for AI generation of test case descriptions
 */
export const TestCaseDescriptionsGenerationSchema = z.object({
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
    .max(15),
});
export type TestCaseDescriptionsGeneration = z.infer<typeof TestCaseDescriptionsGenerationSchema>;

/**
 * A solution to a problem
 */
export const SolutionSchema = z.object({
  problemId: z.string().optional(),
  language: LanguageSchema,
  code: z.string(),
  explanation: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
});
export type Solution = z.infer<typeof SolutionSchema>;

/**
 * A test case described in natural language
 */
export const TestCaseDescriptionSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  expectedBehavior: z.string(),
  isEdgeCase: z.boolean().default(false),
});
export type TestCaseDescription = z.infer<typeof TestCaseDescriptionSchema>;

/**
 * Code to generate test case input
 */
export const TestCaseInputCodeSchema = z.object({
  testCaseId: z.string().optional(),
  language: LanguageSchema,
  code: z.string(), // Code that when executed, produces the test input
});
export type TestCaseInputCode = z.infer<typeof TestCaseInputCodeSchema>;

/**
 * A complete test case with input and expected output
 */
export const TestCaseSchema = z.object({
  id: z.string().optional(),
  description: z.string(),
  input: z.unknown(), // The actual input value
  expectedOutput: z.unknown(), // The expected output value
  isEdgeCase: z.boolean().default(false),
  isSample: z.boolean().default(false), // Whether to show this to the user
});
export type TestCase = z.infer<typeof TestCaseSchema>;

/**
 * Result of executing code
 */
export const ExecutionResultSchema = z.object({
  success: z.boolean(),
  output: z.unknown().optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(), // in milliseconds
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

/**
 * Result of testing a user's solution
 */
export const TestResultSchema = z.object({
  testCaseId: z.string().optional(),
  passed: z.boolean(),
  input: z.unknown(),
  expectedOutput: z.unknown(),
  actualOutput: z.unknown().optional(),
  error: z.string().optional(),
  executionTime: z.number().optional(),
});
export type TestResult = z.infer<typeof TestResultSchema>;

/**
 * Complete problem package ready for user
 */
export const ProblemPackageSchema = z.object({
  problem: ProblemSchema,
  sampleTestCases: z.array(TestCaseSchema),
  hiddenTestCases: z.array(TestCaseSchema),
});
export type ProblemPackage = z.infer<typeof ProblemPackageSchema>;
