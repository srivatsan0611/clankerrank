import { gateway } from "ai";
import { withTracing } from "@posthog/ai";
import { phClient } from "./analytics";

export const client = (model: string) => gateway(model);

export const getTracedClient = (
  model: string,
  userId: string,
  problemId: string,
  modelName: string,
) => {
  const baseClient = client(model);
  return withTracing(baseClient, phClient, {
    posthogDistinctId: userId,
    posthogTraceId: problemId,
    posthogProperties: { generatedByModel: modelName },
  });
};
