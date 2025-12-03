import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import { getModelByName, type Database } from "@repo/db";

export const validateModelBody = createMiddleware<{
  Bindings: Env;
  Variables: {
    userId: string;
    isAdmin: boolean;
    db: Database;
  };
}>(async (c, next) => {
  // Only validate if there's a request body
  if (c.req.method === "GET" || c.req.method === "DELETE") {
    await next();
    return;
  }

  try {
    // Try to get the parsed JSON body
    // For OpenAPI routes, the body might be validated already
    // We'll try to access it via valid() first, then fall back to json()
    let body: unknown;

    try {
      // Try to get validated body (for OpenAPI routes)
      body = c.req.valid("json");
    } catch {
      // If that fails, try to parse the raw body
      body = await c.req.json();
    }

    // Check if body has a model field
    if (
      body &&
      typeof body === "object" &&
      "model" in body &&
      typeof body.model === "string" &&
      body.model.length > 0
    ) {
      const db = c.get("db");
      const model = await getModelByName(body.model, db);

      if (!model) {
        throw new HTTPException(400, {
          message: `Invalid model: "${body.model}". Model not found in available models.`,
        });
      }
    }
  } catch (error) {
    // If it's already an HTTPException, re-throw it
    if (error instanceof HTTPException) {
      throw error;
    }
    // For other errors (like JSON parsing), let the route handler deal with it
    // This middleware only validates model existence, not body structure
  }

  await next();
});
