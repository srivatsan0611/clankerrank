export type GenerationStep =
  | "generateProblemText"
  | "generateTestCases"
  | "generateTestCaseInputCode"
  | "generateSolution";

// Step order for sequential execution
export const STEP_ORDER: GenerationStep[] = [
  "generateProblemText",
  "generateTestCases",
  "generateTestCaseInputCode",
  "generateSolution",
];
