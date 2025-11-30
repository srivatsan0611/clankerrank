import { backendPost } from "@/lib/backend-client";

export async function createModel(
  name: string,
  encryptedUserId?: string
) {
  return backendPost<{ id: string; name: string }>(
    "/problems/models",
    { name },
    encryptedUserId
  );
}

