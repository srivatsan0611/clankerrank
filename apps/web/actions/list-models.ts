import { backendGet } from "@/lib/backend-client";

export async function listModels(encryptedUserId?: string) {
  return backendGet<Array<{ id: string; name: string }>>(
    "/problems/models",
    encryptedUserId
  );
}

