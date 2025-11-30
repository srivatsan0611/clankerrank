import { Sandbox } from "./sandbox";
import { getSolution } from "./generate-solution";
import { getProblem, updateTestCase, type TestCase } from "@repo/db";

export async function generateTestCaseOutputs(
  problemId: string,
  sandbox: Sandbox,
) {
  const solution = await getSolution(problemId);
  const { testCases } = await getProblem(problemId);
  if (!testCases) {
    throw new Error(
      "No test cases found. Please generate test case descriptions and inputs first.",
    );
  }

  const results: unknown[] = [];
  for (const testCase of testCases) {
    await sandbox.run(
      solution +
        "; const output = runSolution(..." +
        JSON.stringify(testCase.input) +
        ");" +
        "require('fs').writeFileSync('output.json', JSON.stringify(output));",
    );
    results.push(JSON.parse(await sandbox.readFile("output.json")));
  }

  await sandbox.kill();

  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    const result = results[index];
    if (result === undefined) {
      throw new Error(`Failed to generate result for test case ${index + 1}`);
    }
    if (!testCase) {
      throw new Error(`Test case at index ${index} is undefined`);
    }
    await updateTestCase(testCase.id, { expected: result });
  }

  return results;
}

export async function getTestCaseOutputs(problemId: string) {
  const { testCases } = await getProblem(problemId);
  return testCases.map((testCase: TestCase) => testCase.expected);
}
