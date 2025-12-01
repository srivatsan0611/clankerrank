import { apiGet } from "@/lib/api-client";

export async function getProblemModel(
  problemId: string,
  encryptedUserId?: string,
) {
  const data = await apiGet<{ model: string | null }>(
    `/${problemId}/model`,
    encryptedUserId,
  );
  return data.model;
}
