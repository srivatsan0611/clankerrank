import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { errorHandler, notFoundHandler } from './middleware/error.js';
import problemsRoutes from './routes/problems.js';
import solveRoutes from './routes/solve.js';

// Create the main app
const app = new OpenAPIHono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Mount routes
app.route('/api/problems', problemsRoutes);
app.route('/api/problems', solveRoutes);

// OpenAPI documentation
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'ClankerRank API',
    version: '1.0.0',
    description: 'API for generating and solving coding problems with AI',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    {
      name: 'Problems',
      description: 'Problem management operations',
    },
    {
      name: 'Solve',
      description: 'Solution testing operations',
    },
  ],
});

// Swagger UI
app.get(
  '/docs',
  swaggerUI({
    url: '/openapi.json',
  }),
);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root redirect to docs
app.get('/', (c) => {
  return c.redirect('/docs');
});

// Error handling
app.onError(errorHandler);
app.notFound(notFoundHandler);

export default app;

// Export a function to start the server
export function startServer(port: number) {
  console.log(`\n🚀 ClankerRank API server starting...`);
  console.log(`   📚 Swagger UI: http://localhost:${port}/docs`);
  console.log(`   📄 OpenAPI spec: http://localhost:${port}/openapi.json`);
  console.log(`   ❤️  Health check: http://localhost:${port}/health\n`);

  return {
    port,
    fetch: app.fetch,
  };
}
