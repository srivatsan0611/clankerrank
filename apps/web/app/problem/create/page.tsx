import { redirect } from "next/navigation";
import { withAuth } from "@workos-inc/authkit-nextjs";
import { encryptUserId } from "@/lib/auth-utils";
import CreateProblemForm from "./components/create-problem-form";

export default async function CreateProblemPage() {
  const { user } = await withAuth({
    ensureSignedIn: true,
  });

  if (!user) {
    return redirect("/login");
  }

  const encryptedUserId = encryptUserId(user.id);

  return <CreateProblemForm encryptedUserId={encryptedUserId} />;
}
