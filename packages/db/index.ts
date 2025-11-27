import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./src/schema";

// In Cloudflare Workers, we cannot share database connections across requests.
// Each request must create its own connection to avoid I/O object conflicts.
// postgres-js automatically detects Workers environment and uses HTTP mode.

const connectionString = process.env.DATABASE_URL!;

// Create a function that returns a fresh db instance
// This ensures each request gets its own isolated connection
export function createDb() {
  const client = postgres(connectionString, {
    max: 1, // Single connection - no pooling in Workers
  });
  return drizzle(client, { schema });
}

// For Cloudflare Workers, create a Proxy that creates a fresh connection
// for each top-level property access. This ensures each request gets its own connection.
// Note: This creates a new connection for each property access, which is necessary
// because Workers cannot share I/O objects across requests.
const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    // Create a fresh db instance for each property access
    // This is necessary because Workers cannot share I/O objects across requests
    const freshDb = createDb();
    const value = freshDb[prop as keyof typeof freshDb];

    // If it's a function, bind it to the fresh db instance
    if (typeof value === "function") {
      return value.bind(freshDb);
    }

    // For objects (like .query), return them directly from the fresh connection
    // All nested property accesses will use the same underlying connection
    return value;
  },
}) as ReturnType<typeof createDb>;

export default db;
export * from "./src/schema";
export * from "./src/queries";
