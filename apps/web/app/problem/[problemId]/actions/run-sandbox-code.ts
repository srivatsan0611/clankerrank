"use server";

import { Sandbox } from "@/lib/sandbox";
import { getTestCaseInputCode } from "./generate-test-case-input-code";
import { DEFAULT_LANGUAGE } from "@/lib/consts";
import { writeFile } from "fs/promises";
import { join } from "path";
import { readFile } from "fs/promises";

export async function generateTestCaseInputs(problemId: string) {
  const testCasesInputCode = await getTestCaseInputCode(problemId);
  const sandbox = await Sandbox.create(DEFAULT_LANGUAGE);

  // Run executions sequentially to avoid conflicts with single-process sandbox
  const results: unknown[] = [];
  for (const testCaseInputCode of testCasesInputCode) {
    // TODO: handle errors
    await sandbox.run(
      testCaseInputCode.code +
        "; const output = generateTestInput();" +
        // Write the output to a file
        "require('fs').writeFileSync('output.json', JSON.stringify(output));"
    );
    results.push(JSON.parse(await sandbox.readFile("output.json")));
  }

  await sandbox.kill();

  // Merge results into existing test cases
  const problemsDir = join(process.cwd(), "problems");
  const problemFile = join(problemsDir, `${problemId}.json`);
  const problemData = JSON.parse(await readFile(problemFile, "utf8"));
  const { testCases } = problemData;

  const updatedTestCases = testCases.map(
    (testCase: Record<string, unknown>, index: number) => {
      const result = results[index];
      if (result === undefined) {
        throw new Error(`Failed to generate result for test case ${index + 1}`);
      }
      return {
        ...testCase,
        result,
      };
    }
  );

  // Save updated test cases back to the JSON file
  await writeFile(
    problemFile,
    JSON.stringify({ ...problemData, testCases: updatedTestCases }, null, 2)
  );

  return updatedTestCases;
}
