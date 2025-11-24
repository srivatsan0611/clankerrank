"use server";

import { Sandbox } from "@/lib/sandbox";
import { getTestCaseInputCode } from "./generate-test-case-input-code";
import { DEFAULT_LANGUAGE } from "@/lib/consts";
import { getProblem, updateTestCase, type TestCase } from "@repo/db";

export async function generateTestCaseInputs(problemId: string) {
  const testCasesInputCode = await getTestCaseInputCode(problemId);
  const sandbox = await Sandbox.create(DEFAULT_LANGUAGE);

  // Run executions sequentially to avoid conflicts with single-process sandbox
  const results: unknown[] = [];
  for (const testCaseInputCode of testCasesInputCode) {
    // TODO: handle errors
    const result = await sandbox.run(
      testCaseInputCode.inputCode +
        "; const output = generateTestInput();" +
        // Write the output to a file
        "require('fs').writeFileSync('output.json', JSON.stringify(output));"
    );
    console.log("Result of running sandbox code:", result);
    results.push(JSON.parse(await sandbox.readFile("output.json")));
  }

  await sandbox.kill();

  // Get existing test cases
  const { testCases } = await getProblem(problemId);

  // Update each test case with its input
  for (let index = 0; index < testCases.length; index++) {
    const testCase = testCases[index];
    const result = results[index];
    if (result === undefined) {
      throw new Error(`Failed to generate result for test case ${index + 1}`);
    }
    if (!Array.isArray(result)) {
      throw new Error(
        `Result for test case ${index + 1} is not an array, got: ${typeof result}`
      );
    }
    await updateTestCase(testCase.id, { input: result });
  }

  return results;
}

export async function getTestCaseInputs(problemId: string) {
  const { testCases } = await getProblem(problemId);
  return testCases.map((testCase: TestCase) => testCase.input);
}
