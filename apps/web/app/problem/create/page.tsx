import { createProblem } from "@/app/api/problem-crud";
import { redirect } from "next/navigation";

export default async function CreateProblemPage() {
  const problemId = await createProblem();
  redirect(`/problem/${problemId}`);
}
