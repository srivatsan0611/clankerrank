"use server";
import { generateObject } from "ai";
import { z } from "zod/v3";
import { join } from "path";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

interface TestCase {
  description: string;
  isEdgeCase: boolean;
  inputCode?: string;
}

const DEFAULT_LANGUAGE = "typescript";

export async function generateTestCaseInputs(problemId: string) {
  const problemsDir = join(process.cwd(), "problems");
  const problemFile = join(problemsDir, `${problemId}.json`);

  // Read existing problem data
  const problemData = JSON.parse(await readFile(problemFile, "utf8"));
  const { problemText, functionSignature, testCases } = problemData;

  if (!testCases || testCases.length === 0) {
    throw new Error(
      "No test cases found. Please generate test case descriptions first."
    );
  }

  // Generate input code for each test case
  const { object } = await generateObject({
    model: "google/gemini-2.5-flash",
    prompt: `Generate executable ${DEFAULT_LANGUAGE} code that produces the input for test cases.

Problem: ${typeof problemText === "string" ? problemText : problemText.problemText || ""}

Function Signature (${DEFAULT_LANGUAGE}):
${functionSignature[DEFAULT_LANGUAGE]}

Test Cases:
${testCases.map((tc: TestCase, i: number) => `${i + 1}. ${tc.description}${tc.isEdgeCase ? " (edge case)" : ""}`).join("\n")}

For each test case, generate a ${DEFAULT_LANGUAGE} function generateSolution() 
that creates the input value(s) described in the test case description

The function should only generate the INPUT, not execute the solution function.
The output of the function should be an ARRAY, where each element is an argument to the solution function.

For example, if the function signature is: 

function generateSolution(nums: number[], k: number) {}

and the description is "an array of numbers with length 3 and an odd number", 

the function should return: [[1, 2, 3, 4, 5], 3]

Generate code for each test case in order.
AVOID COMING UP WITH CONSTANTS!! For example, if asked for an array of numbers, generate code to generate random numbers instead of coming up with a specific array.

Return a function like the following, where ...inputValues is the array of input values for the test case:
function generateSolution() {
	return [...inputValues];
}
`,
    schema: z.object({
      testCaseInputs: z
        .array(
          z.object({
            inputCode: z
              .string()
              .describe(
                `Executable ${DEFAULT_LANGUAGE} code that produces the test case input.`
              ),
          })
        )
        .describe(
          "An array of input code for each test case, in the same order as the test cases"
        )
        .length(testCases.length),
    }),
  });

  // Merge inputCode into existing test cases
  const updatedTestCases = testCases.map(
    (testCase: TestCase, index: number) => {
      const inputCode = object.testCaseInputs[index]?.inputCode;
      if (!inputCode) {
        throw new Error(
          `Failed to generate input code for test case ${index + 1}`
        );
      }
      return {
        ...testCase,
        inputCode,
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

export async function getTestCaseInputs(problemId: string) {
  const problemsDir = join(process.cwd(), "problems");
  const problemFile = join(problemsDir, `${problemId}.json`);
  const testCases = JSON.parse(await readFile(problemFile, "utf8")).testCases;
  return testCases;
}
