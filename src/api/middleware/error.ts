import { HTTPException } from 'hono/http-exception';

import type { Context } from 'hono';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error handler middleware for Hono
 */
export function errorHandler(err: Error, c: Context) {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return c.json(
      {
        error: err.message,
        details: err.details,
      },
      err.statusCode as 400 | 404 | 500,
    );
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
      },
      err.status,
    );
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        error: 'Validation error',
        details: (err as unknown as { errors: unknown[] }).errors,
      },
      400,
    );
  }

  // Generic error
  return c.json(
    {
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500,
  );
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context) {
  return c.json(
    {
      error: `Not found: ${c.req.path}`,
    },
    404,
  );
}
