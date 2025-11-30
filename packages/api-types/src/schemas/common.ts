import { z } from "@hono/zod-openapi";

// Standard API error response
export const ApiErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: "VALIDATION_ERROR" }),
      message: z.string().openapi({ example: "Validation failed" }),
    }),
    timestamp: z.string().datetime().optional(),
  })
  .openapi("ApiError");

// Generic success wrapper - use as a function to wrap data schemas
export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime().optional(),
  });

// Path parameter schemas
export const ProblemIdParamSchema = z.object({
  problemId: z
    .string()
    .uuid()
    .openapi({
      param: { name: "problemId", in: "path" },
      example: "550e8400-e29b-41d4-a716-446655440000",
    }),
});

// Inferred types
export type ApiError = z.infer<typeof ApiErrorSchema>;
