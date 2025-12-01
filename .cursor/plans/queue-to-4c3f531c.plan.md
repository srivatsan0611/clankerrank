<!-- 4c3f531c-ab75-495e-985f-6c3db788f154 024467a0-8152-4449-9356-0579137f5fce -->
# Migrate Problem Generation from Queues to Cloudflare Workflows

## Current Architecture

- Uses Cloudflare Queues with `PROBLEM_GENERATION_QUEUE`
- Sequential pipeline: 6 steps with auto-enqueue after each step
- Queue consumer in [`apps/backend/src/queue/consumer.ts`](apps/backend/src/queue/consumer.ts)
- Manual step chaining via `env.PROBLEM_GENERATION_QUEUE.send()` after each step

## Why Workflows

- **Durable execution**: State persists automatically between steps
- **Per-step retries**: Each step can be retried independently (vs. re-processing entire message)
- **Simpler orchestration**: No manual enqueue logic; steps are defined declaratively
- **Better observability**: Built-in pause/resume/terminate/restart capabilities
- **Cleaner code**: Remove queue consumer, step chaining logic, and `getNextStep()` pattern

## Implementation Steps

### 1. Create the Workflow class

Create `apps/backend/src/workflows/problem-generation.ts`:

```typescript
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from "cloudflare:workers";
import { generateProblemText, generateTestCases, ... } from "@/problem-actions";
import { updateJobStatus, markStepComplete, getProblem } from "@repo/db";

type WorkflowParams = {
  jobId: string;
  problemId: string;
  model: string;
  returnDummy?: boolean;
  startingStep?: GenerationStep; // Optional: skip steps before this one
};

export class ProblemGenerationWorkflow extends WorkflowEntrypoint<Env, WorkflowParams> {
  async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
    const { jobId, problemId, model, returnDummy, startingStep } = event.payload;
    
    // Helper to check if step should be skipped
    const shouldRunStep = (stepName: GenerationStep) => {
      if (!startingStep) return true;
      return STEP_ORDER.indexOf(stepName) >= STEP_ORDER.indexOf(startingStep);
    };
    
    if (shouldRunStep("generateProblemText")) {
      await step.do("generateProblemText", async () => {
        await updateJobStatus(jobId, "in_progress", "generateProblemText");
        await generateProblemText(problemId, model, userId, this.env, false, returnDummy);
        await markStepComplete(jobId, "generateProblemText");
      });
    }

    if (shouldRunStep("generateTestCases")) {
      await step.do("generateTestCases", async () => { ... });
    }
    // ... remaining steps with same pattern
    
    await updateJobStatus(jobId, "completed");
  }
}
```

### 2. Update wrangler.jsonc

Add workflow binding and remove queue configuration:

```jsonc
{
  "workflows": [
    {
      "name": "problem-generation-workflow",
      "binding": "PROBLEM_GENERATION_WORKFLOW",
      "class_name": "ProblemGenerationWorkflow"
    }
  ]
  // Remove "queues" section
}
```

### 3. Export the Workflow from index.ts

Update [`apps/backend/src/index.ts`](apps/backend/src/index.ts):

- Export the `ProblemGenerationWorkflow` class
- Remove the `queue` handler export

### 4. Update routes to trigger workflow

Modify [`apps/backend/src/routes/problems.ts`](apps/backend/src/routes/problems.ts):

- Replace `env.PROBLEM_GENERATION_QUEUE.send(...)` with `env.PROBLEM_GENERATION_WORKFLOW.create({ params: {...} })`
- Update `enqueueFirstStepIfAuto()` and `enqueueNextStepIfEnabled()` functions (or remove the latter since workflows handle step chaining)

### 5. Update worker-configuration.d.ts

Add the workflow binding type to the `Env` interface.

### 6. Clean up queue code

- Delete or repurpose [`apps/backend/src/queue/consumer.ts`](apps/backend/src/queue/consumer.ts)
- Simplify [`apps/backend/src/queue/types.ts`](apps/backend/src/queue/types.ts) (keep step definitions, remove `getNextStep`)

## Files to Modify

- `apps/backend/src/workflows/problem-generation.ts` (new)
- `apps/backend/src/index.ts`
- `apps/backend/src/routes/problems.ts`
- `apps/backend/wrangler.jsonc`
- `apps/backend/worker-configuration.d.ts`
- `apps/backend/src/queue/consumer.ts` (delete or archive)