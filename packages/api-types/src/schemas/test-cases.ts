import { z } from "@hono/zod-openapi";

// Test case entity schema (full DB schema)
export const TestCaseSchema = z
  .object({
    id: z.string().uuid(),
    problemId: z.string().uuid(),
    description: z.string(),
    isEdgeCase: z.boolean(),
    inputCode: z.string().nullable(),
    input: z.unknown().nullable(),
    expected: z.unknown().nullable(),
    createdAt: z.coerce.string(),
    updatedAt: z.coerce.string(),
  })
  .openapi("TestCase");

// Simplified test case for responses (without timestamps)
export const TestCaseDescriptionSchema = z
  .object({
    description: z.string(),
    isEdgeCase: z.boolean(),
  })
  .openapi("TestCaseDescription");

// Response schemas
export const TestCaseListSchema = z
  .array(TestCaseSchema)
  .openapi("TestCaseList");

export const TestCaseDescriptionListSchema = z
  .array(TestCaseDescriptionSchema)
  .openapi("TestCaseDescriptionList");

// generateTestCases returns array of { description, isEdgeCase }
export const TestCasesGenerateResponseSchema = z
  .object({
    testCases: TestCaseDescriptionListSchema,
    jobId: z.string().uuid().nullable(),
  })
  .openapi("TestCasesGenerateResponse");

// generateTestCaseInputCode returns string[] (array of input codes)
export const InputCodeListSchema = z.array(z.string()).openapi("InputCodeList");

export const InputCodeGenerateResponseSchema = z
  .object({
    inputCodes: InputCodeListSchema,
    jobId: z.string().uuid().nullable(),
  })
  .openapi("InputCodeGenerateResponse");

// getTestCaseInputCode returns string[] | null
export const InputCodeGetResponseSchema = z
  .array(z.string())
  .nullable()
  .openapi("InputCodeGetResponse");

// generateTestCaseInputs returns unknown[] (array of inputs)
export const TestInputsGenerateResponseSchema = z
  .object({
    testCases: z.array(z.unknown()),
    jobId: z.string().uuid().nullable(),
  })
  .openapi("TestInputsGenerateResponse");

// getTestCaseInputs returns unknown[]
export const TestInputsGetResponseSchema = z
  .array(z.unknown())
  .openapi("TestInputsGetResponse");

// generateTestCaseOutputs returns unknown[] (array of expected outputs)
export const TestOutputsGenerateResponseSchema = z
  .object({
    testCases: z.array(z.unknown()),
    jobId: z.string().uuid().nullable(),
  })
  .openapi("TestOutputsGenerateResponse");

// getTestCaseOutputs returns unknown[]
export const TestOutputsGetResponseSchema = z
  .array(z.unknown())
  .openapi("TestOutputsGetResponse");

// Test result from running user code (matches TestResult type from problem-actions)
export const TestResultSchema = z
  .object({
    testCase: TestCaseSchema,
    status: z.enum(["pass", "fail", "error"]),
    actual: z.unknown().nullable(),
    error: z.string().optional(),
    stdout: z.string().optional(),
  })
  .openapi("TestResult");

// runUserSolution returns TestResult[]
export const TestResultsSchema = z
  .array(TestResultSchema)
  .openapi("TestResults");

// Inferred types
export type TestCase = z.infer<typeof TestCaseSchema>;
export type TestCaseDescription = z.infer<typeof TestCaseDescriptionSchema>;
export type TestResult = z.infer<typeof TestResultSchema>;
export type TestResults = z.infer<typeof TestResultsSchema>;
