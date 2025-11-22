import { atom } from "jotai";
import {
  generateProblemText,
  getProblemText,
} from "./app/problem/[problemId]/actions/generate-problem-text";
import {
  generateTestCases,
  getTestCases,
} from "./app/problem/[problemId]/actions/generate-test-cases";

export const problemIdAtom = atom<string | null>(null);
export const isProblemTextLoadingAtom = atom(false);
export const problemTextAtom = atom<{
  problemText: string;
  functionSignature: { typescript: string };
} | null>(null);

/**
 * Generate problem text
 */
export const callGenerateProblemTextAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(problemTextAtom, null);
  set(isProblemTextLoadingAtom, true);
  const newProblemText = await generateProblemText(problemId);
  set(problemTextAtom, newProblemText);
  set(isProblemTextLoadingAtom, false);
});

/**
 * Read the existing problem text for a given problem ID
 */
export const getProblemTextAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(isProblemTextLoadingAtom, true);
  const { problemText, functionSignature } = await getProblemText(problemId);
  set(problemTextAtom, { problemText, functionSignature });
  set(isProblemTextLoadingAtom, false);
});

export const isTestCasesLoadingAtom = atom(false);
export const testCasesAtom = atom<
  { description: string; isEdgeCase: boolean }[] | null
>(null);

/**
 * Generate test cases
 */
export const callGenerateTestCasesAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(testCasesAtom, null);
  set(isTestCasesLoadingAtom, true);
  const testCases = await generateTestCases(problemId);
  set(testCasesAtom, testCases);
  set(isTestCasesLoadingAtom, false);
});

/**
 * Read the existing test cases for a given problem ID
 */
export const getTestCasesAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(isTestCasesLoadingAtom, true);
  const testCases = await getTestCases(problemId);
  set(testCasesAtom, testCases);
  set(isTestCasesLoadingAtom, false);
});
