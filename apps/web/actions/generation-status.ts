import { apiGet } from "@/lib/api-client";
import type { GenerationStatus } from "@repo/api-types";

// Re-export types for consumers
export type { GenerationStep, GenerationStatus } from "@repo/api-types";

export async function getGenerationStatus(
  problemId: string,
  encryptedUserId?: string,
): Promise<GenerationStatus> {
  return apiGet<GenerationStatus>(
    `/${problemId}/generation-status`,
    encryptedUserId,
  );
}
