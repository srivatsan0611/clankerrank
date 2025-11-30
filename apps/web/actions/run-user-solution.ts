import { apiPost } from "@/lib/api-client";
import type { TestResult } from "@repo/api-types";

// Re-export types for consumers
export type { TestCase, TestResult } from "@repo/api-types";

export async function runUserSolution(
  problemId: string,
  userCode: string,
  encryptedUserId?: string,
): Promise<TestResult[]> {
  return apiPost<TestResult[]>(
    `/${problemId}/solution/run`,
    { code: userCode },
    encryptedUserId,
  );
}
