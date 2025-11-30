import { apiGet, apiPost } from "@/lib/api-client";

interface TestOutputsGenerateResponse {
  testCases: unknown[];
  jobId: string | null;
}

export async function generateTestCaseOutputs(
  problemId: string,
  encryptedUserId?: string,
  enqueueNextStep: boolean = true,
) {
  const data = await apiPost<TestOutputsGenerateResponse>(
    `/${problemId}/test-cases/outputs/generate`,
    { enqueueNextStep },
    encryptedUserId,
  );
  return data.testCases;
}

export async function getTestCaseOutputs(
  problemId: string,
  encryptedUserId?: string,
) {
  return apiGet<unknown[]>(`/${problemId}/test-cases/outputs`, encryptedUserId);
}
