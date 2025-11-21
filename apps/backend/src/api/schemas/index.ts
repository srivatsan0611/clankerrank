import { z } from '@hono/zod-openapi';

/**
 * Supported programming languages
 */
export const LanguageSchema = z
  .enum(['javascript', 'typescript', 'python'])
  .openapi({
    example: 'typescript',
    description: 'Programming language for the problem/solution',
  });
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Difficulty levels for problems
 */
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']).openapi({
  example: 'medium',
  description: 'Difficulty level of the problem',
});
export type Difficulty = z.infer<typeof DifficultySchema>;

/**
 * A coding problem
 */
export const ProblemSchema = z
  .object({
    id: z.string().uuid().optional().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    title: z.string().openapi({ example: 'Two Sum' }),
    description: z.string().openapi({ example: 'Find two numbers that add up to target' }),
    difficulty: DifficultySchema,
    constraints: z.array(z.string()).openapi({ example: ['1 <= nums.length <= 10^4'] }),
    functionSignature: z.record(LanguageSchema, z.string()).openapi({
      example: {
        typescript: 'function twoSum(nums: number[], target: number): number[]',
        javascript: 'function twoSum(nums, target)',
        python: 'def two_sum(nums: List[int], target: int) -> List[int]:',
      },
    }),
  })
  .openapi('Problem');
export type Problem = z.infer<typeof ProblemSchema>;

/**
 * A complete test case with input and expected output
 */
export const TestCaseSchema = z
  .object({
    id: z.string().uuid().optional(),
    description: z.string().openapi({ example: 'Basic test with small array' }),
    input: z.unknown().openapi({ example: { nums: [2, 7, 11, 15], target: 9 } }),
    expectedOutput: z.unknown().openapi({ example: [0, 1] }),
    isEdgeCase: z.boolean().default(false),
    isSample: z.boolean().default(false),
  })
  .openapi('TestCase');
export type TestCase = z.infer<typeof TestCaseSchema>;

/**
 * Result of testing a user's solution
 */
export const TestResultSchema = z
  .object({
    testCaseId: z.string().uuid().optional(),
    passed: z.boolean().openapi({ example: true }),
    input: z.unknown(),
    expectedOutput: z.unknown(),
    actualOutput: z.unknown().optional(),
    error: z.string().optional().openapi({ example: 'TypeError: Cannot read property...' }),
    executionTime: z.number().optional().openapi({ example: 42, description: 'Execution time in milliseconds' }),
  })
  .openapi('TestResult');
export type TestResult = z.infer<typeof TestResultSchema>;

/**
 * Complete problem package ready for user
 */
export const ProblemPackageSchema = z
  .object({
    problem: ProblemSchema,
    sampleTestCases: z.array(TestCaseSchema),
    hiddenTestCases: z.array(TestCaseSchema),
  })
  .openapi('ProblemPackage');
export type ProblemPackage = z.infer<typeof ProblemPackageSchema>;

// Request schemas

/**
 * Request to generate a new problem
 */
export const GenerateRequestSchema = z
  .object({
    model: z.string().default('google/gemini-2.0-flash').openapi({
      example: 'anthropic/claude-haiku-4.5',
      description: 'AI model to use for generation',
    }),
    difficulty: DifficultySchema.default('medium'),
    language: LanguageSchema.default('typescript'),
    topic: z.string().optional().openapi({
      example: 'dynamic programming',
      description: 'Optional topic for the problem',
    }),
    numTestCases: z.number().int().min(1).max(50).default(10).openapi({
      example: 10,
      description: 'Number of test cases to generate',
    }),
    numSamples: z.number().int().min(1).max(10).default(3).openapi({
      example: 3,
      description: 'Number of sample test cases to show',
    }),
  })
  .openapi('GenerateRequest');
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

/**
 * Request to solve a problem
 */
export const SolveRequestSchema = z
  .object({
    code: z.string().openapi({
      example: 'function twoSum(nums, target) { ... }',
      description: 'Solution code to test',
    }),
    language: LanguageSchema.default('typescript'),
    showHidden: z.boolean().default(false).openapi({
      description: 'Whether to show hidden test case results',
    }),
  })
  .openapi('SolveRequest');
export type SolveRequest = z.infer<typeof SolveRequestSchema>;

// Response schemas

/**
 * Response after generating a problem
 */
export const GenerateResponseSchema = z
  .object({
    problemId: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    problem: ProblemSchema,
    sampleTestCases: z.array(TestCaseSchema),
    stats: z.object({
      totalTestCases: z.number().openapi({ example: 10 }),
      sampleTestCases: z.number().openapi({ example: 3 }),
      hiddenTestCases: z.number().openapi({ example: 7 }),
    }),
  })
  .openapi('GenerateResponse');
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>;

/**
 * Response after solving a problem
 */
export const SolveResponseSchema = z
  .object({
    success: z.boolean().openapi({ example: true }),
    sampleResults: z.array(TestResultSchema),
    hiddenResults: z.array(TestResultSchema).optional(),
    summary: z.object({
      samplePassed: z.number().openapi({ example: 3 }),
      sampleTotal: z.number().openapi({ example: 3 }),
      hiddenPassed: z.number().optional().openapi({ example: 7 }),
      hiddenTotal: z.number().optional().openapi({ example: 7 }),
    }),
  })
  .openapi('SolveResponse');
export type SolveResponse = z.infer<typeof SolveResponseSchema>;

/**
 * Problem list item (without test cases)
 */
export const ProblemListItemSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    difficulty: DifficultySchema,
    createdAt: z.string().datetime().optional(),
  })
  .openapi('ProblemListItem');
export type ProblemListItem = z.infer<typeof ProblemListItemSchema>;

/**
 * Error response
 */
export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ example: 'Problem not found' }),
    details: z.unknown().optional(),
  })
  .openapi('ErrorResponse');
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Parameter schemas

export const ProblemIdParamSchema = z.object({
  id: z.string().uuid().openapi({
    param: {
      name: 'id',
      in: 'path',
    },
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Problem UUID',
  }),
});
