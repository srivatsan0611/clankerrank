import { backendPost } from "@/lib/backend-client";

export async function createProblem(encryptedUserId?: string) {
  return backendPost<{
    problemId: string;
    jobId: string | null;
  }>("/problems", undefined, encryptedUserId);
}

