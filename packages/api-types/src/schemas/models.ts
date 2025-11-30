import { z } from "@hono/zod-openapi";

// Model entity schema
export const ModelSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
  })
  .openapi("Model");

// Request schemas
export const CreateModelRequestSchema = z
  .object({
    name: z.string().min(1).openapi({ example: "claude-3-5-sonnet-20241022" }),
  })
  .openapi("CreateModelRequest");

// Response schemas
export const ListModelsResponseSchema = z
  .array(ModelSchema)
  .openapi("ModelList");

// Inferred types
export type Model = z.infer<typeof ModelSchema>;
export type CreateModelRequest = z.infer<typeof CreateModelRequestSchema>;
