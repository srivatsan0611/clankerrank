import { eq } from "drizzle-orm";
import db from "../index";
import {
  problems,
  testCases,
  type Problem,
  type TestCase,
  type NewProblem,
  type NewTestCase,
} from "./schema";

// Re-export types for convenience
export type { Problem, TestCase, NewProblem, NewTestCase };

// Problem with test cases type for getProblem
export type ProblemWithTestCases = Problem & {
  testCases: TestCase[];
};

// Problem functions

export async function createProblem(
  data?: Partial<NewProblem>
): Promise<string> {
  const [result] = await db
    .insert(problems)
    .values({
      problemText: data?.problemText ?? "",
      functionSignature: data?.functionSignature ?? "",
      solution: data?.solution ?? "",
    })
    .returning({ id: problems.id });

  return result.id;
}

export async function getProblem(
  problemId: string
): Promise<ProblemWithTestCases> {
  const problem = await db.query.problems.findFirst({
    where: eq(problems.id, problemId),
  });

  if (!problem) {
    throw new Error(`Problem not found: ${problemId}`);
  }

  const problemTestCases = await db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
  });

  return {
    ...problem,
    testCases: problemTestCases,
  };
}

export async function updateProblem(
  problemId: string,
  data: Partial<Omit<NewProblem, "id">>
): Promise<void> {
  await db
    .update(problems)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(problems.id, problemId));
}

export async function listProblems(): Promise<string[]> {
  const result = await db
    .select({ id: problems.id })
    .from(problems)
    .orderBy(problems.createdAt);

  return result.map((row) => row.id);
}

// TestCase functions

export async function createTestCase(
  problemId: string,
  data: Omit<NewTestCase, "id" | "problemId" | "createdAt">
): Promise<string> {
  const [result] = await db
    .insert(testCases)
    .values({
      problemId,
      description: data.description,
      isEdgeCase: data.isEdgeCase ?? false,
      inputCode: data.inputCode,
      input: data.input,
      expected: data.expected,
    })
    .returning({ id: testCases.id });

  return result.id;
}

export async function updateTestCase(
  testCaseId: string,
  data: Partial<Omit<NewTestCase, "id" | "problemId" | "createdAt">>
): Promise<void> {
  await db
    .update(testCases)
    .set(data)
    .where(eq(testCases.id, testCaseId));
}

export async function deleteTestCases(problemId: string): Promise<void> {
  await db.delete(testCases).where(eq(testCases.problemId, problemId));
}

export async function getTestCasesByProblemId(
  problemId: string
): Promise<TestCase[]> {
  return db.query.testCases.findMany({
    where: eq(testCases.problemId, problemId),
  });
}

export async function createTestCases(
  problemId: string,
  data: Omit<NewTestCase, "id" | "problemId" | "createdAt">[]
): Promise<TestCase[]> {
  if (data.length === 0) return [];

  return db
    .insert(testCases)
    .values(
      data.map((tc) => ({
        problemId,
        description: tc.description,
        isEdgeCase: tc.isEdgeCase ?? false,
        inputCode: tc.inputCode,
        input: tc.input,
        expected: tc.expected,
      }))
    )
    .returning();
}

export async function replaceTestCases(
  problemId: string,
  data: Omit<NewTestCase, "id" | "problemId" | "createdAt">[]
): Promise<TestCase[]> {
  // Delete existing test cases and insert new ones
  await deleteTestCases(problemId);
  return createTestCases(problemId, data);
}
