import { readFile } from "fs/promises";
import { readdir, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export type TestCase = {
  description: string;
  isEdgeCase: boolean;
  inputCode: string;
  input: unknown[];
  expected: unknown;
};

export type Problem = {
  problemId: string;
  problemText: string;
  functionSignature: string;
  testCases: TestCase[];
  solution: string;
};

const problemsDir = join(process.cwd(), "problems");
const problemFile = (problemId: string) =>
  join(problemsDir, `${problemId}.json`);

export async function createProblem(): Promise<string> {
  const problemId = crypto.randomUUID();
  try {
    // Ensure problems directory exists
    await mkdir(problemsDir, { recursive: true });
    // Create the JSON file with empty object
    await writeFile(problemFile(problemId), JSON.stringify({}, null, 2));
    return problemId;
  } catch (error) {
    console.error("Failed to create problem file:", error);
    throw error;
  }
}

export async function listProblems(): Promise<string[]> {
  const files = await readdir(problemsDir);
  // Filter for JSON files and extract problem IDs (remove .json extension)
  const problems = files
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.replace(".json", ""));
  return problems;
}

export async function getProblem(problemId: string): Promise<Problem> {
  const problem = await readFile(problemFile(problemId), "utf8");
  return JSON.parse(problem) satisfies Problem;
}

export async function updateProblem(
  problemId: string,
  problem: Partial<Problem>
): Promise<void> {
  const problemData = JSON.parse(
    await readFile(problemFile(problemId), "utf8")
  );
  await writeFile(
    problemFile(problemId),
    JSON.stringify({ ...problemData, ...problem }, null, 2)
  );
}
