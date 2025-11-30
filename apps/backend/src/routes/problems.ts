/// <reference path="../../worker-configuration.d.ts" />
import { Hono, type Context } from "hono";
import {
  generateProblemText,
  getProblemText,
  generateTestCases,
  getTestCases,
  generateTestCaseInputCode,
  getTestCaseInputCode,
  generateTestCaseInputs,
  getTestCaseInputs,
  generateSolution,
  getSolution,
  generateTestCaseOutputs,
  getTestCaseOutputs,
  runUserSolution,
} from "@/problem-actions";
import { getSandbox } from "@cloudflare/sandbox";
import { Sandbox } from "@/problem-actions";
import {
  createProblem,
  createGenerationJob,
  getLatestJobForProblem,
  createModel,
  getModelByName,
  listModels,
  updateProblem,
  getProblem,
} from "@repo/db";
import { DEFAULT_MODEL } from "@/problem-actions/src/constants";
import { getNextStep, STEP_ORDER, type GenerationStep } from "../queue/types";

const problems = new Hono<{ Bindings: Env }>();

const getSandboxInstance = (env: Env, sandboxId: string): Sandbox => {
  const cloudflareSandbox = getSandbox(env.Sandbox, sandboxId);
  return new Sandbox(cloudflareSandbox);
};

// Helper to get or create model
async function getOrCreateModel(modelName: string): Promise<string> {
  let model = await getModelByName(modelName);
  if (!model) {
    const modelId = await createModel(modelName);
    return modelId;
  }
  return model.id;
}

// Helper to enqueue first step if autoGenerate is enabled (for problem creation)
async function enqueueFirstStepIfAuto(
  c: Context<{ Bindings: Env }>,
  problemId: string,
  model?: string
): Promise<string | null> {
  const autoGenerate = c.req.query("autoGenerate") !== "false"; // default true

  if (!autoGenerate) return null;

  // Create job
  const modelId = model ? await getOrCreateModel(model) : undefined;
  const jobId = await createGenerationJob(problemId, modelId);

  // Enqueue the first step: generateProblemText
  const firstStep = STEP_ORDER[0];
  if (firstStep) {
    await c.env.PROBLEM_GENERATION_QUEUE.send({
      jobId,
      problemId,
      step: firstStep,
      model,
    });
  }

  return jobId;
}

// Helper to enqueue next step if autoGenerate is enabled
async function enqueueNextStepIfAuto(
  c: Context<{ Bindings: Env }>,
  problemId: string,
  currentStep: GenerationStep,
  model?: string
): Promise<string | null> {
  const autoGenerate = c.req.query("autoGenerate") !== "false"; // default true

  if (!autoGenerate) return null;

  // Get or create job
  let job = await getLatestJobForProblem(problemId);
  if (!job || job.status === "completed" || job.status === "failed") {
    const modelId = model ? await getOrCreateModel(model) : undefined;
    const jobId = await createGenerationJob(problemId, modelId);
    job = {
      id: jobId,
      problemId,
      modelId: modelId ?? null,
      status: "pending",
      completedSteps: [],
      currentStep: null,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  const nextStep = getNextStep(currentStep);
  if (nextStep) {
    await c.env.PROBLEM_GENERATION_QUEUE.send({
      jobId: job.id,
      problemId,
      step: nextStep,
      model,
    });
  }

  return job.id;
}

// Models routes
problems.get("/models", async (c) => {
  const models = await listModels();
  return c.json({ success: true, data: models });
});

problems.post("/models", async (c) => {
  const body = await c.req.json<{ name: string }>();
  if (!body.name) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "name is required" },
      },
      400
    );
  }

  try {
    const modelId = await createModel(body.name);
    const model = await getModelByName(body.name);
    return c.json({ success: true, data: model });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: {
          code: "DUPLICATE_ERROR",
          message: "Model with this name already exists",
        },
      },
      409
    );
  }
});

// Create problem
problems.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json<{ model?: string }>();
  const model = body?.model || DEFAULT_MODEL;

  const problemId = await createProblem({ generatedByUserId: userId });

  // Get or create model and update problem
  const modelId = await getOrCreateModel(model);
  await updateProblem(problemId, { generatedByModelId: modelId });

  const jobId = await enqueueFirstStepIfAuto(c, problemId, model);

  return c.json({ success: true, data: { problemId, jobId } });
});

// Problem text
problems.post("/:problemId/text/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req.json<{ model?: string }>();
  const model = body?.model || DEFAULT_MODEL;

  // Update problem with model if not set
  const problem = await getProblem(problemId);
  if (!problem.generatedByModelId) {
    const modelId = await getOrCreateModel(model);
    await updateProblem(problemId, { generatedByModelId: modelId });
  }

  const result = await generateProblemText(problemId, model);

  const jobId = await enqueueNextStepIfAuto(
    c,
    problemId,
    "generateProblemText",
    model
  );

  return c.json({ success: true, data: { ...result, jobId } });
});

problems.get("/:problemId/text", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getProblemText(problemId);
  return c.json({ success: true, data: result });
});

// Test cases
problems.post("/:problemId/test-cases/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req.json<{ model?: string }>();
  const model = body?.model || DEFAULT_MODEL;

  // Update problem with model if not set
  const problem = await getProblem(problemId);
  if (!problem.generatedByModelId) {
    const modelId = await getOrCreateModel(model);
    await updateProblem(problemId, { generatedByModelId: modelId });
  }

  const result = await generateTestCases(problemId, model);

  const jobId = await enqueueNextStepIfAuto(c, problemId, "generateTestCases", model);

  return c.json({ success: true, data: { ...result, jobId } });
});

problems.get("/:problemId/test-cases", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getTestCases(problemId);
  return c.json({ success: true, data: result });
});

// Test case input code
problems.post("/:problemId/test-cases/input-code/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req.json<{ model?: string }>();
  const model = body?.model || DEFAULT_MODEL;

  // Update problem with model if not set
  const problem = await getProblem(problemId);
  if (!problem.generatedByModelId) {
    const modelId = await getOrCreateModel(model);
    await updateProblem(problemId, { generatedByModelId: modelId });
  }

  const result = await generateTestCaseInputCode(problemId, model);

  const jobId = await enqueueNextStepIfAuto(
    c,
    problemId,
    "generateTestCaseInputCode",
    model
  );

  return c.json({ success: true, data: { ...result, jobId } });
});

problems.get("/:problemId/test-cases/input-code", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getTestCaseInputCode(problemId);
  return c.json({ success: true, data: result });
});

// Test case inputs
problems.post("/:problemId/test-cases/inputs/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const sandboxId = `test-inputs-${problemId}`;
  const sandbox = getSandboxInstance(c.env, sandboxId);
  const result = await generateTestCaseInputs(problemId, sandbox);

  const jobId = await enqueueNextStepIfAuto(
    c,
    problemId,
    "generateTestCaseInputs"
  );

  return c.json({ success: true, data: { result, jobId } });
});

problems.get("/:problemId/test-cases/inputs", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getTestCaseInputs(problemId);
  return c.json({ success: true, data: result });
});

// Solution
problems.post("/:problemId/solution/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req.json<{ model?: string }>();
  const model = body?.model || DEFAULT_MODEL;

  // Update problem with model if not set
  const problem = await getProblem(problemId);
  if (!problem.generatedByModelId) {
    const modelId = await getOrCreateModel(model);
    await updateProblem(problemId, { generatedByModelId: modelId });
  }

  const result = await generateSolution(problemId, model);

  const jobId = await enqueueNextStepIfAuto(c, problemId, "generateSolution", model);

  return c.json({ success: true, data: { solution: result, jobId } });
});

problems.get("/:problemId/solution", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getSolution(problemId);
  return c.json({ success: true, data: result });
});

// Test case outputs
problems.post("/:problemId/test-cases/outputs/generate", async (c) => {
  const problemId = c.req.param("problemId");
  const sandboxId = `test-outputs-${problemId}`;
  const sandbox = getSandboxInstance(c.env, sandboxId);
  const result = await generateTestCaseOutputs(problemId, sandbox);

  // This is the last step, no need to enqueue anything
  const jobId = await enqueueNextStepIfAuto(
    c,
    problemId,
    "generateTestCaseOutputs"
  );

  return c.json({ success: true, data: { result, jobId } });
});

problems.get("/:problemId/test-cases/outputs", async (c) => {
  const problemId = c.req.param("problemId");
  const result = await getTestCaseOutputs(problemId);
  return c.json({ success: true, data: result });
});

// Run user solution
problems.post("/:problemId/solution/run", async (c) => {
  const problemId = c.req.param("problemId");
  const body = await c.req.json<{ code: string }>();

  if (!body.code) {
    return c.json(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "code is required" },
      },
      400
    );
  }

  const sandboxId = `solution-run-${problemId}`;
  const sandbox = getSandboxInstance(c.env, sandboxId);
  const result = await runUserSolution(problemId, body.code, sandbox);
  return c.json({ success: true, data: result });
});

// Generation status
problems.get("/:problemId/generation-status", async (c) => {
  const problemId = c.req.param("problemId");
  const job = await getLatestJobForProblem(problemId);

  if (!job) {
    return c.json({
      success: true,
      data: { status: "none", message: "No generation job found" },
    });
  }

  const totalSteps = STEP_ORDER.length;
  const completedCount = job.completedSteps?.length || 0;

  return c.json({
    success: true,
    data: {
      jobId: job.id,
      status: job.status,
      currentStep: job.currentStep,
      completedSteps: job.completedSteps,
      progress: {
        completed: completedCount,
        total: totalSteps,
        percent: Math.round((completedCount / totalSteps) * 100),
      },
      error: job.error,
    },
  });
});

export { problems };
