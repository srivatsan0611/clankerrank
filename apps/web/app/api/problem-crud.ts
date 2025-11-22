import { readdir, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function createProblem(): Promise<string> {
  const problemId = crypto.randomUUID();
  const problemsDir = join(process.cwd(), "problems");
  const problemFile = join(problemsDir, `${problemId}.json`);

  try {
    // Ensure problems directory exists
    await mkdir(problemsDir, { recursive: true });
    // Create the JSON file with empty object
    await writeFile(problemFile, JSON.stringify({}, null, 2));
    return problemId;
  } catch (error) {
    console.error("Failed to create problem file:", error);
    throw error;
  }
}

export async function listProblems(): Promise<string[]> {
  const problemsDir = join(process.cwd(), "problems");
  const files = await readdir(problemsDir);
  // Filter for JSON files and extract problem IDs (remove .json extension)
  const problems = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));
  return problems;
}
