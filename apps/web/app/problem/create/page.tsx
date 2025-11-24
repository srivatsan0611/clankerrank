import { createProblem } from "@repo/db";
import { redirect } from "next/navigation";
import { generateProblemText } from "../[problemId]/actions/generate-problem-text";

export default async function CreateProblemPage() {
  const problemId = await createProblem();
  await generateProblemText(problemId);
  redirect(`/problem/${problemId}`);
}
