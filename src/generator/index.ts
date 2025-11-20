import { generateProblem } from './problemGenerator.js';
import { generateSolution } from './solutionGenerator.js';
import { generateTestCaseDescriptions } from './testCaseGenerator.js';
import { generateTestInputCode } from './testCodeGenerator.js';
import {
  createProblem,
  createSolution,
  createTestCaseDescriptions,
  createTestCase,
  updateProblemCompletion,
} from '../db/repositories/index.js';
import { createExecutor } from '../executor/index.js';
import { TestCaseSchema } from '../types/index.js';
import { TEST_EXECUTION_CODE_TEMPLATE } from '../utils/index.js';

import type { TestCase, ProblemPackage, Difficulty, Language, TestCaseDescription } from '../types/index.js';
import type { TestCaseInput } from '../utils/index.js';

export { generateProblem, generateSolution, generateTestCaseDescriptions, generateTestInputCode };

/**
 * Generate a complete problem package with test cases
 * This is the main orchestration function that runs the entire pipeline
 */
export async function generateCompleteProblem(
  model: string,
  difficulty: Difficulty = 'medium',
  language: Language = 'typescript',
  options: {
    topic?: string;
    numTestCases?: number;
    numSampleTestCases?: number;
  } = {},
): Promise<ProblemPackage & { problemId: string }> {
  const { topic, numTestCases = 10, numSampleTestCases = 3 } = options;

  console.log('\n🎯 Generating problem...');
  const problem = await generateProblem(model, difficulty, topic);
  console.log(`✓ Generated problem: "${problem.title}"`);

  // Save problem to database
  const problemId = await createProblem(problem);
  console.log(`✓ Saved problem to database (ID: ${problemId})`);

  console.log('\n📝 Generating test case descriptions...');
  const testDescriptions = await generateTestCaseDescriptions(
    model,
    problem,
    numTestCases,
  );
  console.log(`✓ Generated ${testDescriptions.length} test case descriptions`);

  // Save test case descriptions to database and get their DB IDs
  const testDescriptionDbIds = await createTestCaseDescriptions(problemId, testDescriptions);
  console.log(`✓ Saved test case descriptions to database`);

  // Map generated IDs to DB IDs for later reference
  const descIdToDbId = new Map<string, string>();
  testDescriptions.forEach((desc, i) => {
    if (desc.id) {
      descIdToDbId.set(desc.id, testDescriptionDbIds[i]);
    }
  });

  console.log('\n🧪 Generating test case inputs...');
  const executor = createExecutor(language);

  // Generate test inputs first (before solution)
  const testCaseInputs: { desc: TestCaseDescription; input: unknown }[] = [];

  for (let i = 0; i < testDescriptions.length; i++) {
    const desc = testDescriptions[i];
    console.log(`  [${i + 1}/${testDescriptions.length}] ${desc.description}`);

    try {
      // Generate code to create test input
      const inputCode = await generateTestInputCode(model, problem, desc, language);

      // Execute code to get the input value
      const inputResult = await executor.execute(inputCode.code);

      if (!inputResult.success || inputResult.output === undefined) {
        console.warn(`    ⚠️  Failed to generate input: ${inputResult.error}`);
        continue;
      }

      testCaseInputs.push({ desc, input: inputResult.output });
      console.log(`    ✓ Input generated`);
    } catch (error) {
      console.warn(
        `    ⚠️  Error generating test input: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(`\n✓ Generated ${testCaseInputs.length} test case inputs`);

  // Prepare test cases for solution generation
  const testCasesForSolution: TestCaseInput[] = testCaseInputs.map(({ desc, input }) => ({
    description: desc.description,
    input,
    isEdgeCase: desc.isEdgeCase,
  }));

  console.log('\n💡 Generating solution with test cases in mind...');
  const solution = await generateSolution(model, problem, language, testCasesForSolution);
  console.log(
    `✓ Generated solution (${solution.timeComplexity} time, ${solution.spaceComplexity} space)`,
  );

  // Save solution to database
  await createSolution(problemId, solution);
  console.log(`✓ Saved solution to database`);

  console.log('\n🧪 Executing solution to get expected outputs...');
  const allTestCases: TestCase[] = [];

  for (let i = 0; i < testCaseInputs.length; i++) {
    const { desc, input: testInput } = testCaseInputs[i];
    console.log(`  [${i + 1}/${testCaseInputs.length}] ${desc.description}`);

    try {
      // Execute solution with the test input to get expected output
      const solutionCode = TEST_EXECUTION_CODE_TEMPLATE(solution.code, testInput, language);
      const outputResult = await executor.execute(solutionCode);

      if (!outputResult.success || outputResult.output === undefined) {
        console.warn(`    ⚠️  Failed to get expected output: ${outputResult.error}`);
        continue;
      }

      const expectedOutput = outputResult.output;

      // Create test case
      const testCase = TestCaseSchema.parse({
        description: desc.description,
        input: testInput,
        expectedOutput,
        isEdgeCase: desc.isEdgeCase,
        isSample: i < numSampleTestCases, // First N test cases are samples
      });

      // Save test case to database with the description ID reference
      const testCaseDescriptionId = desc.id ? descIdToDbId.get(desc.id) : undefined;
      const testCaseId = await createTestCase(problemId, testCase, testCaseDescriptionId);
      testCase.id = testCaseId;

      allTestCases.push(testCase);
      console.log(`    ✓ Test case saved`);
    } catch (error) {
      console.warn(
        `    ⚠️  Error executing test case: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  console.log(`\n✓ Successfully generated ${allTestCases.length} test cases`);

  // Split into sample and hidden test cases
  const sampleTestCases = allTestCases.filter((tc) => tc.isSample);
  const hiddenTestCases = allTestCases.filter((tc) => !tc.isSample);

  console.log(`  - ${sampleTestCases.length} sample test cases (visible to user)`);
  console.log(`  - ${hiddenTestCases.length} hidden test cases (for validation)`);

  const problemPackage: ProblemPackage = {
    problem,
    sampleTestCases,
    hiddenTestCases,
  };

  // Mark problem as completed in the database
  await updateProblemCompletion(problemId, true);
  console.log(`✓ Problem marked as completed`);

  return { ...problemPackage, problemId };
}
