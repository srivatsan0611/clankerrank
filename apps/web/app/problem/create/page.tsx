import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { encryptUserId } from "@/lib/auth-utils";
import { createProblem } from "@/actions/create-problem";
import { generateProblemText } from "@/actions/generate-problem-text";

export default async function CreateProblemPage() {
  const { user } = await withAuth({
    ensureSignedIn: true,
  });

  if (!user) {
    return redirect("/login");
  }

  const encryptedUserId = encryptUserId(user.id);
  const { problemId } = await createProblem(encryptedUserId);
  await generateProblemText(problemId, encryptedUserId);
  redirect(`/problem/${problemId}`);
}
