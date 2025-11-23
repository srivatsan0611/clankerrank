import { atom } from "jotai";
import {
  generateProblemText,
  getProblemText,
} from "./app/problem/[problemId]/actions/generate-problem-text";
import {
  generateTestCases,
  getTestCases,
} from "./app/problem/[problemId]/actions/generate-test-cases";
import {
  generateTestCaseInputs,
  getTestCaseInputs,
} from "./app/problem/[problemId]/actions/generate-test-case-inputs";

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

export const isTestCaseInputsLoadingAtom = atom(false);
export const testCaseInputsAtom = atom<{ inputCode: string }[] | null>(null);

/**
 * Generate test case inputs
 */
export const callGenerateTestCaseInputsAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(testCaseInputsAtom, null);
  set(isTestCaseInputsLoadingAtom, true);
  const testCaseInputs = await generateTestCaseInputs(problemId);
  set(testCaseInputsAtom, testCaseInputs);
  set(isTestCaseInputsLoadingAtom, false);
});

/**
 * Read the existing test case inputs for a given problem ID
 */
export const getTestCaseInputsAtom = atom(null, async (get, set) => {
  const problemId = get(problemIdAtom);
  if (!problemId) {
    throw new Error("Problem ID is not set");
  }
  set(isTestCaseInputsLoadingAtom, true);
  const testCaseInputs = await getTestCaseInputs(problemId);
  set(testCaseInputsAtom, testCaseInputs);
  set(isTestCaseInputsLoadingAtom, false);
});
