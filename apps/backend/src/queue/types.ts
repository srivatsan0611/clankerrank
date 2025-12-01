export type GenerationStep =
  | "generateProblemText"
  | "generateTestCases"
  | "generateTestCaseInputCode"
  | "generateTestCaseInputs"
  | "generateSolution"
  | "generateTestCaseOutputs";

// Step order for sequential execution
export const STEP_ORDER: GenerationStep[] = [
  "generateProblemText",
  "generateTestCases",
  "generateTestCaseInputCode",
  "generateTestCaseInputs",
  "generateSolution",
  "generateTestCaseOutputs",
];
