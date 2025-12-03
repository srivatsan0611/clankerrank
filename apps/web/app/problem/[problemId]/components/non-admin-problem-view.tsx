"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState, useRef, useMemo } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import Loader from "@/components/client/loader";
import { Badge } from "@/components/ui/badge";
import {
  Loader2Icon,
  PlusIcon,
  XIcon,
  CheckCircle2Icon,
  XCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ClientFacingUserObject } from "@/lib/auth-types";
import type { CodeGenLanguage, GenerationStep } from "@/hooks/use-problem";

// Step order matching backend STEP_ORDER
const STEP_ORDER: GenerationStep[] = [
  "generateProblemText",
  "parseFunctionSignature",
  "generateTestCases",
  "generateTestCaseInputCode",
  "generateSolution",
];

interface NonAdminProblemViewProps {
  problemId: string;
  user: ClientFacingUserObject;
  userSolution: string | null;
  language: CodeGenLanguage;
  // Problem text
  problemText:
    | {
        problemTextReworded?: string;
      }
    | null
    | undefined;
  // Test cases
  testCases:
    | Array<{
        description: string;
        isSampleCase: boolean;
        isEdgeCase: boolean;
      }>
    | null
    | undefined;
  // Test case inputs (already filtered to sample cases by backend)
  testCaseInputs: unknown[] | null | undefined;
  // Test case outputs (need to match with sample cases)
  testCaseOutputs: unknown[] | null | undefined;
  // Run user solution hooks
  isRunUserSolutionLoading: boolean;
  userSolutionError: unknown;
  userSolutionTestResults:
    | Array<{
        testCase: {
          description: string;
          isEdgeCase: boolean;
        };
        status: string;
        expected?: unknown;
        actual?: unknown;
        error?: string;
        stdout?: string;
      }>
    | null
    | undefined;
  callRunUserSolution: () => Promise<unknown>;
  // Run custom tests hooks
  isRunCustomTestsLoading: boolean;
  customTestsError: unknown;
  customTestResults:
    | Array<{
        input?: unknown;
        expected?: unknown;
        actual?: unknown;
        error?: string;
        stdout?: string;
      }>
    | null
    | undefined;
  callRunCustomTests: (inputs: unknown[][]) => Promise<unknown>;
  // Generation status hooks
  completedSteps: GenerationStep[];
  currentStep: GenerationStep | null | undefined;
  isGenerating: boolean;
  isFailed: boolean;
  generationError: unknown;
  // Problem model
  problemModel: string | null | undefined;
}

export default function NonAdminProblemView({
  problemId,
  user,
  userSolution,
  language,
  problemText,
  testCases,
  testCaseInputs,
  testCaseOutputs,
  isRunUserSolutionLoading,
  userSolutionError,
  userSolutionTestResults,
  callRunUserSolution,
  isRunCustomTestsLoading,
  customTestsError,
  customTestResults,
  callRunCustomTests,
  completedSteps,
  currentStep,
  isGenerating,
  isFailed,
  generationError,
  problemModel,
}: NonAdminProblemViewProps) {
  const [customTestCases, setCustomTestCases] = useState<
    Array<{ id: string; inputText: string }>
  >([{ id: `test-case-${Date.now()}`, inputText: "" }]);
  const hasInitializedCustomTestCases = useRef(false);

  // Reset initialization flag when problemId changes
  useEffect(() => {
    hasInitializedCustomTestCases.current = false;
    setCustomTestCases([{ id: `test-case-${Date.now()}`, inputText: "" }]);
  }, [problemId]);

  // Pre-populate custom test cases with sample test case inputs
  useEffect(() => {
    if (
      !hasInitializedCustomTestCases.current &&
      testCases &&
      testCaseInputs &&
      testCases.length > 0 &&
      testCaseInputs.length > 0
    ) {
      // Filter to sample test cases
      const sampleTestCases = testCases
        .map((testCase, index) => ({
          testCase,
          index,
        }))
        .filter(({ testCase }) => testCase.isSampleCase === true);

      // Match sample test cases with their inputs (testCaseInputs is already filtered by backend)
      if (sampleTestCases.length > 0 && testCaseInputs.length > 0) {
        setCustomTestCases(
          testCaseInputs
            .slice(0, sampleTestCases.length)
            .map((input, index) => ({
              id: `test-case-${Date.now()}-${index}`,
              inputText: JSON.stringify(input),
            }))
        );
        hasInitializedCustomTestCases.current = true;
      }
    }
  }, [testCases, testCaseInputs]);

  // Filter to sample test cases only
  const sampleTestCases = testCases
    ? testCases.filter((tc) => tc.isSampleCase === true)
    : [];

  // Match sample test cases with their inputs and outputs
  // Backend already filters testCaseInputs to only sample cases
  // We need to match outputs by index (assuming outputs are in same order as all test cases)
  const sampleTestCasesWithData = sampleTestCases.map(
    (testCase, sampleIndex) => {
      const allTestCaseIndex = testCases!.findIndex((tc) => tc === testCase);
      return {
        testCase,
        input: testCaseInputs?.[sampleIndex] ?? null,
        output: testCaseOutputs?.[allTestCaseIndex] ?? null,
      };
    }
  );

  // Helper function to get step display name
  const getStepDisplayName = (step: GenerationStep): string => {
    const names: Record<GenerationStep, string> = {
      generateProblemText: "Problem Text",
      parseFunctionSignature: "Function Signature Schema",
      generateTestCases: "Test Cases",
      generateTestCaseInputCode: "Test Case Inputs",
      generateSolution: "Solution & Test Case Outputs",
    };
    return names[step];
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completed = completedSteps.length;
    const total = STEP_ORDER.length;
    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [completedSteps]);

  // Get overall status
  const overallStatus = useMemo(() => {
    if (isFailed)
      return { type: "error" as const, message: "Generation failed" };
    if (isGenerating && currentStep) {
      return {
        type: "generating" as const,
        message: `Generating ${getStepDisplayName(currentStep)}...`,
      };
    }
    if (completedSteps.length === STEP_ORDER.length) {
      return { type: "complete" as const, message: "Generation complete" };
    }
    if (completedSteps.length > 0) {
      return {
        type: "partial" as const,
        message: `${completedSteps.length} of ${STEP_ORDER.length} steps complete`,
      };
    }
    return { type: "idle" as const, message: "Ready to generate" };
  }, [isFailed, isGenerating, currentStep, completedSteps]);

  // Top-level status indicator component
  const TopLevelStatusIndicator = () => {
    return (
      <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {overallStatus.type === "generating" && (
              <Loader2Icon className="h-4 w-4 animate-spin text-primary" />
            )}
            {overallStatus.type === "complete" && (
              <CheckCircle2Icon className="h-4 w-4 text-green-600" />
            )}
            {overallStatus.type === "error" && (
              <XCircleIcon className="h-4 w-4 text-destructive" />
            )}
            {overallStatus.type === "idle" && (
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">{overallStatus.message}</span>
          </div>
          {overallStatus.type !== "idle" && (
            <Badge variant="outline" className="text-xs">
              {overallProgress.completed}/{overallProgress.total}
            </Badge>
          )}
        </div>
        {overallStatus.type === "generating" && (
          <div className="w-full bg-background rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${overallProgress.percent}%` }}
            />
          </div>
        )}
        {currentStep && overallStatus.type === "generating" && (
          <div className="text-xs text-muted-foreground">
            Current step: {getStepDisplayName(currentStep)}
          </div>
        )}
        {overallStatus.type === "error" && generationError != null && (
          <div className="text-xs text-destructive">
            {generationError instanceof Error
              ? generationError.message
              : typeof generationError === "string"
                ? generationError
                : JSON.stringify(generationError)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-4 flex flex-col gap-6">
      <TopLevelStatusIndicator />
      {/* Problem Text Reworded */}
      {problemText?.problemTextReworded && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Problem Description</h2>
          <MessageResponse>{problemText.problemTextReworded}</MessageResponse>
        </div>
      )}

      {/* Sample Test Cases with Example Inputs/Outputs */}
      {sampleTestCasesWithData.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Sample Test Cases</h2>
          <div className="space-y-3">
            {sampleTestCasesWithData.map((item, i) => (
              <div
                key={`sample-testcase-${i}`}
                className="border rounded-lg p-3 bg-muted/30 space-y-2 overflow-hidden"
              >
                <div className="text-sm font-medium mb-1">
                  Test Case {i + 1}
                  {item.testCase.isEdgeCase && (
                    <Badge variant="outline" className="ml-2">
                      Edge Case
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {item.testCase.description}
                </div>
                {item.input && item.output && (
                  <div className="space-y-1 pt-2 border-t">
                    <div className="break-words overflow-wrap-anywhere">
                      <span className="text-xs font-medium text-muted-foreground">
                        Input:{" "}
                      </span>
                      <span className="text-sm font-mono break-all">
                        {JSON.stringify(item.input)}
                      </span>
                    </div>
                    <div className="break-words overflow-wrap-anywhere">
                      <span className="text-xs font-medium text-muted-foreground">
                        Output:{" "}
                      </span>
                      <span className="text-sm font-mono break-all">
                        {JSON.stringify(item.output)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run User Solution */}
      <div className="space-y-3 border-t pt-4">
        <h2 className="text-lg font-semibold">Test Your Solution</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await callRunUserSolution();
            } catch (error) {
              console.error("Failed to run user solution:", error);
            }
          }}
          disabled={isRunUserSolutionLoading}
        >
          {isRunUserSolutionLoading ? "Running..." : "Run Solution"}
        </Button>
        {isRunUserSolutionLoading && (
          <div className="flex items-center gap-2">
            <Loader />
            <span className="text-sm text-muted-foreground">
              Running tests...
            </span>
          </div>
        )}
        {userSolutionError !== undefined && userSolutionError !== null && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {userSolutionError instanceof Error
                ? userSolutionError.message
                : typeof userSolutionError === "string"
                  ? userSolutionError
                  : JSON.stringify(userSolutionError)}
            </AlertDescription>
          </Alert>
        )}
        {userSolutionTestResults && Array.isArray(userSolutionTestResults) && (
          <div className="space-y-2">
            {userSolutionTestResults.map((testResult, i) => (
              <div
                key={`user-solution-test-result-${i}`}
                className="border rounded-lg p-3 bg-muted/30"
              >
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  {testResult.testCase.description}
                  {testResult.testCase.isEdgeCase && (
                    <Badge variant="outline" className="ml-2">
                      Edge Case
                    </Badge>
                  )}
                </div>
                {testResult.error ? (
                  <Alert variant="destructive" className="py-2">
                    <AlertTitle className="text-xs">Error</AlertTitle>
                    <AlertDescription className="text-xs whitespace-pre-wrap">
                      {testResult.error}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div
                    className={`p-2 rounded text-xs font-mono ${
                      testResult.status === "pass"
                        ? "bg-green-500/20 border border-green-500/50"
                        : testResult.status === "fail"
                          ? "bg-yellow-500/20 border border-yellow-500/50"
                          : "bg-red-500/20 border border-red-500/50"
                    }`}
                  >
                    <div className="space-y-1">
                      <div>
                        <span className="text-muted-foreground">Status: </span>
                        <span className="font-semibold">
                          {testResult.status.toUpperCase()}
                        </span>
                      </div>
                      {testResult.expected !== null &&
                        testResult.expected !== undefined && (
                          <div>
                            <span className="text-muted-foreground">
                              Expected:{" "}
                            </span>
                            <span className="font-semibold">
                              {JSON.stringify(testResult.expected)}
                            </span>
                          </div>
                        )}
                      {testResult.actual !== null &&
                        testResult.actual !== undefined && (
                          <div>
                            <span className="text-muted-foreground">
                              Actual:{" "}
                            </span>
                            <span className="font-semibold">
                              {JSON.stringify(testResult.actual)}
                            </span>
                          </div>
                        )}
                      {testResult.stdout && (
                        <div className="mt-2 pt-2 border-t">
                          <span className="text-muted-foreground">
                            Stdout:{" "}
                          </span>
                          <pre className="text-xs mt-1 whitespace-pre-wrap">
                            {testResult.stdout}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run Custom Inputs */}
      <div className="space-y-3 border-t pt-4">
        <h2 className="text-lg font-semibold">Test with Custom Inputs</h2>
        <p className="text-xs text-muted-foreground">
          Enter custom test inputs.{" "}
          <span className="font-bold">
            Each test case should be a JSON array of function arguments.
          </span>
          <br />
          <br />
          For example, if the function signature is{" "}
          <code>function add(a: number, b: number): number</code>, the input
          should be <code>[1, 2]</code>.
        </p>

        <div className="space-y-3">
          {customTestCases.map((testCase, index) => {
            let validationError: string | null = null;

            if (testCase.inputText.trim()) {
              try {
                const parsed = JSON.parse(testCase.inputText);
                if (!Array.isArray(parsed)) {
                  validationError =
                    "Input must be a JSON array of function arguments.";
                }
              } catch {
                validationError =
                  "Invalid JSON. Please enter a valid JSON array.";
              }
            }

            const result =
              customTestResults && customTestResults[index]
                ? customTestResults[index]
                : null;

            return (
              <div
                key={testCase.id}
                className="space-y-2 border rounded-lg p-3 bg-muted/30 overflow-x-hidden"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Test Case {index + 1}
                      </span>
                      {customTestCases.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setCustomTestCases((prev) =>
                              prev.filter((tc) => tc.id !== testCase.id)
                            );
                          }}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="[1, 2, 3]"
                      value={testCase.inputText}
                      onChange={(e) => {
                        setCustomTestCases((prev) =>
                          prev.map((tc) =>
                            tc.id === testCase.id
                              ? { ...tc, inputText: e.target.value }
                              : tc
                          )
                        );
                      }}
                      className="font-mono text-sm min-h-[60px] w-full max-w-full overflow-x-hidden break-words"
                    />
                    {validationError && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">
                          {validationError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>

                {result && (
                  <div className="mt-2 space-y-1 border-t pt-2">
                    <div className="text-xs font-medium mb-1">Result:</div>
                    <div className="space-y-1 text-xs font-mono">
                      {result.error ? (
                        <Alert variant="destructive" className="py-2">
                          <AlertTitle className="text-xs">Error</AlertTitle>
                          <AlertDescription className="text-xs whitespace-pre-wrap">
                            {result.error}
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div
                          className={`p-2 rounded ${
                            JSON.stringify(result.actual) ===
                            JSON.stringify(result.expected)
                              ? "bg-green-500/20 border border-green-500/50"
                              : "bg-yellow-500/20 border border-yellow-500/50"
                          }`}
                        >
                          <div className="space-y-1">
                            {result.input !== null &&
                              result.input !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Input:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    {JSON.stringify(result.input)}
                                  </span>
                                </div>
                              )}
                            {result.expected !== null &&
                              result.expected !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Expected:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    {JSON.stringify(result.expected)}
                                  </span>
                                </div>
                              )}
                            {result.actual !== null &&
                              result.actual !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Actual:{" "}
                                  </span>
                                  <span className="font-semibold">
                                    {JSON.stringify(result.actual)}
                                  </span>
                                </div>
                              )}
                            {result.stdout && (
                              <div className="mt-2 pt-2 border-t">
                                <span className="text-muted-foreground">
                                  Stdout:{" "}
                                </span>
                                <pre className="text-xs mt-1 whitespace-pre-wrap">
                                  {result.stdout}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (customTestCases.length < 10) {
                setCustomTestCases((prev) => [
                  ...prev,
                  {
                    id: `test-case-${Date.now()}-${Math.random()}`,
                    inputText: "",
                  },
                ]);
              }
            }}
            disabled={customTestCases.length >= 10}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Test Case
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                const validInputs: unknown[][] = [];
                let hasError = false;

                for (let i = 0; i < customTestCases.length; i++) {
                  const testCase = customTestCases[i];
                  if (!testCase || !testCase.inputText.trim()) {
                    hasError = true;
                    break;
                  }

                  try {
                    const parsed = JSON.parse(testCase.inputText);
                    if (!Array.isArray(parsed)) {
                      hasError = true;
                      break;
                    }
                    validInputs.push(parsed);
                  } catch {
                    hasError = true;
                    break;
                  }
                }

                if (hasError || validInputs.length === 0) {
                  return;
                }

                if (validInputs.length > 10) {
                  return;
                }

                await callRunCustomTests(validInputs);
              } catch (error) {
                console.error("Failed to run custom tests:", error);
              }
            }}
            disabled={
              isRunCustomTestsLoading ||
              customTestCases.every((tc) => !tc.inputText.trim())
            }
          >
            {isRunCustomTestsLoading ? "Running..." : "Run All Tests"}
          </Button>
        </div>

        {isRunCustomTestsLoading && (
          <div className="flex items-center gap-2">
            <Loader />
            <span className="text-sm text-muted-foreground">
              Running custom tests...
            </span>
          </div>
        )}
        {customTestsError !== undefined &&
          customTestsError !== null &&
          !isRunCustomTestsLoading && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {customTestsError instanceof Error
                  ? customTestsError.message
                  : String(customTestsError)}
              </AlertDescription>
            </Alert>
          )}
      </div>
    </div>
  );
}
