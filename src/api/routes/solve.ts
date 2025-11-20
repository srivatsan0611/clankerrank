import { OpenAPIHono, createRoute } from '@hono/zod-openapi';

import { getProblemPackage } from '../../db/repositories/index.js';
import { createTestRunner } from '../../executor/index.js';
import { ApiError } from '../middleware/error.js';
import {
  SolveRequestSchema,
  SolveResponseSchema,
  ProblemIdParamSchema,
  ErrorResponseSchema,
} from '../schemas/index.js';

const app = new OpenAPIHono();

// POST /api/problems/:id/solve - Test solution against problem
const solveRoute = createRoute({
  method: 'post',
  path: '/{id}/solve',
  tags: ['Solve'],
  summary: 'Test a solution',
  description: 'Test a user solution against a problem\'s test cases',
  request: {
    params: ProblemIdParamSchema,
    body: {
      content: {
        'application/json': {
          schema: SolveRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SolveResponseSchema,
        },
      },
      description: 'Test results',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Invalid request',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Problem not found',
    },
    500: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Internal server error',
    },
  },
});

app.openapi(solveRoute, async (c) => {
  const { id } = c.req.valid('param');
  const body = c.req.valid('json');

  const { code, language = 'typescript', showHidden = false } = body;

  // Load problem package
  const problemPackage = await getProblemPackage(id);
  if (!problemPackage) {
    throw new ApiError(404, `Problem not found: ${id}`);
  }

  // Create test runner
  const testRunner = createTestRunner(language);

  // Validate runtime
  const executor = testRunner['executor'];
  const hasRuntime = await executor.validateRuntime();
  if (!hasRuntime) {
    throw new ApiError(
      400,
      `Runtime for ${language} not available. Please ensure it's installed on the server.`,
    );
  }

  // Run sample tests
  const sampleResults = await testRunner.runTestCases(code, problemPackage.sampleTestCases);

  const samplePassed = sampleResults.filter((r) => r.passed).length;
  const sampleTotal = sampleResults.length;

  // Determine if we should run hidden tests
  const runHidden = showHidden || samplePassed === sampleTotal;

  let hiddenResults: typeof sampleResults | undefined;
  let hiddenPassed: number | undefined;
  let hiddenTotal: number | undefined;

  if (runHidden && problemPackage.hiddenTestCases.length > 0) {
    hiddenResults = await testRunner.runTestCases(code, problemPackage.hiddenTestCases);
    hiddenPassed = hiddenResults.filter((r) => r.passed).length;
    hiddenTotal = hiddenResults.length;
  }

  // Calculate overall success
  const allPassed = samplePassed === sampleTotal &&
    (!hiddenResults || hiddenPassed === hiddenTotal);

  return c.json(
    {
      success: allPassed,
      sampleResults: sampleResults.map((r) => ({
        testCaseId: r.testCaseId,
        passed: r.passed,
        input: r.input,
        expectedOutput: r.expectedOutput,
        actualOutput: r.actualOutput,
        error: r.error,
        executionTime: r.executionTime,
      })),
      hiddenResults: showHidden && hiddenResults
        ? hiddenResults.map((r) => ({
            testCaseId: r.testCaseId,
            passed: r.passed,
            input: r.input,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput,
            error: r.error,
            executionTime: r.executionTime,
          }))
        : undefined,
      summary: {
        samplePassed,
        sampleTotal,
        hiddenPassed,
        hiddenTotal,
      },
    },
    200,
  );
});

export default app;
