import { apiGet, apiPost } from "@/lib/api-client";

interface TestInputsGenerateResponse {
  testCases: unknown[];
  jobId: string | null;
}

export async function generateTestCaseInputs(
  problemId: string,
  encryptedUserId?: string,
  enqueueNextStep: boolean = true,
) {
  const data = await apiPost<TestInputsGenerateResponse>(
    `/${problemId}/test-cases/inputs/generate`,
    { enqueueNextStep },
    encryptedUserId,
  );
  return data.testCases;
}

export async function getTestCaseInputs(
  problemId: string,
  encryptedUserId?: string,
) {
  return apiGet<unknown[]>(`/${problemId}/test-cases/inputs`, encryptedUserId);
}
