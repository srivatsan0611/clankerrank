import { backendPost } from "@/lib/backend-client";

export async function createProblem(
  model: string,
  encryptedUserId?: string
) {
  return backendPost<{
    problemId: string;
    jobId: string | null;
  }>("/problems", { model }, encryptedUserId);
}

