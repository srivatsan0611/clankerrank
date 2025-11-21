import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';

import {
  getProblemPackage,
  listProblems,
  deleteProblem,
} from '../../db/repositories/index.js';
import { generateCompleteProblem } from '../../generator/index.js';
import { ApiError } from '../middleware/error.js';
import {
  GenerateRequestSchema,
  GenerateResponseSchema,
  ProblemPackageSchema,
  ProblemListItemSchema,
  ProblemIdParamSchema,
  ErrorResponseSchema,
} from '../schemas/index.js';


const app = new OpenAPIHono();

// POST /api/problems/generate - Generate a new problem
const generateRoute = createRoute({
  method: 'post',
  path: '/generate',
  tags: ['Problems'],
  summary: 'Generate a new coding problem',
  description: 'Generate a new coding problem with AI, including test cases and solution',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GenerateRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: GenerateResponseSchema,
        },
      },
      description: 'Problem generated successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Invalid request parameters',
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

app.openapi(generateRoute, async (c) => {
  const body = c.req.valid('json');

  const {
    model = 'google/gemini-2.0-flash',
    difficulty = 'medium',
    language = 'typescript',
    topic,
    numTestCases = 10,
    numSamples = 3,
  } = body;

  const result = await generateCompleteProblem(model, difficulty, language, {
    topic,
    numTestCases,
    numSampleTestCases: numSamples,
  });

  return c.json(
    {
      problemId: result.problemId,
      problem: result.problem,
      sampleTestCases: result.sampleTestCases,
      stats: {
        totalTestCases: result.sampleTestCases.length + result.hiddenTestCases.length,
        sampleTestCases: result.sampleTestCases.length,
        hiddenTestCases: result.hiddenTestCases.length,
      },
    },
    201,
  );
});

// GET /api/problems - List all problems
const listRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Problems'],
  summary: 'List all problems',
  description: 'Get a list of all generated problems',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.array(ProblemListItemSchema),
        },
      },
      description: 'List of problems',
    },
  },
});

app.openapi(listRoute, async (c) => {
  const problems = await listProblems();

  return c.json(
    problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard',
      createdAt: p.createdAt.toISOString(),
    })),
  );
});

// GET /api/problems/:id - Get problem package by ID
const getRoute = createRoute({
  method: 'get',
  path: '/{id}',
  tags: ['Problems'],
  summary: 'Get problem by ID',
  description: 'Get a complete problem package including test cases',
  request: {
    params: ProblemIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ProblemPackageSchema,
        },
      },
      description: 'Problem package',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Problem not found',
    },
  },
});

app.openapi(getRoute, async (c) => {
  const { id } = c.req.valid('param');

  const problemPackage = await getProblemPackage(id);

  if (!problemPackage) {
    throw new ApiError(404, `Problem not found: ${id}`);
  }

  return c.json(problemPackage, 200);
});

// DELETE /api/problems/:id - Delete a problem
const deleteRoute = createRoute({
  method: 'delete',
  path: '/{id}',
  tags: ['Problems'],
  summary: 'Delete a problem',
  description: 'Delete a problem and all associated data',
  request: {
    params: ProblemIdParamSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'Problem deleted successfully',
    },
    404: {
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
      description: 'Problem not found',
    },
  },
});

app.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param');

  // Check if problem exists first
  const problemPackage = await getProblemPackage(id);
  if (!problemPackage) {
    throw new ApiError(404, `Problem not found: ${id}`);
  }

  await deleteProblem(id);

  return c.json({ message: `Problem ${id} deleted successfully` }, 200);
});

export default app;
