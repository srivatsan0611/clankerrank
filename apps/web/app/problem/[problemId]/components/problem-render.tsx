"use client";

import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import Loader from "@/components/client/loader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  useProblemText,
  useTestCases,
  useTestCaseInputCode,
  useTestCaseInputs,
  useSolution,
  useGenerateSolutionWithModel,
  useTestCaseOutputs,
  useRunUserSolution,
  useGenerationStatus,
  useModels,
} from "@/hooks/use-problem";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ClientFacingUserObject } from "@/lib/auth-types";
import { signOutAction } from "@/app/(auth)/signout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getStartingCode(language: string, functionSignature: string) {
  if (language === "typescript") {
    return `function runSolution${functionSignature} {\n\treturn;\n}`;
  }
  throw new Error(`Unsupported language: ${language}`);
}

export default function ProblemRender({
  problemId,
  user,
}: {
  problemId: string;
  user: ClientFacingUserObject;
}) {
  const [userSolution, setUserSolution] = useState<string | null>(null);
  const [language, _setLanguage] = useState<string>("typescript");
  const [selectedModel, setSelectedModel] = useState<string>("");

  const {
    isLoading: isProblemTextLoading,
    error: problemTextError,
    data: problemText,
    getData: getProblemText,
    generateData: callGenerateProblemText,
  } = useProblemText(problemId, user.apiKey);

  useEffect(() => {
    if (!problemText) getProblemText();
  }, [getProblemText, problemText]);

  useEffect(() => {
    if (problemText?.problemText && problemText?.functionSignature) {
      setUserSolution(getStartingCode(language, problemText.functionSignature));
    }
  }, [problemText, language]);

  const {
    isLoading: isTestCasesLoading,
    error: testCasesError,
    data: testCases,
    getData: getTestCases,
    generateData: callGenerateTestCases,
  } = useTestCases(problemId, user.apiKey);

  const {
    isLoading: isTestCaseInputsLoading,
    error: testCaseInputCodeError,
    data: testCaseInputCode,
    getData: getCodeToGenerateTestCaseInputs,
    generateData: callGenerateTestCaseInputCode,
  } = useTestCaseInputCode(problemId, user.apiKey);

  const {
    isLoading: isGenerateTestCaseInputsLoading,
    error: testCaseInputsError,
    data: testCaseInputs,
    getData: getTestCaseInputs,
    generateData: callGenerateTestCaseInputs,
  } = useTestCaseInputs(problemId, user.apiKey);

  const {
    isLoading: isGenerateSolutionLoading,
    error: solutionError,
    data: solution,
    getData: getSolution,
    generateData: callGenerateSolution,
  } = useSolution(problemId, user.apiKey);

  const {
    isLoading: isGenerateSolutionWithModelLoading,
    error: generateSolutionWithModelError,
    generateData: callGenerateSolutionWithModel,
  } = useGenerateSolutionWithModel(problemId, user.apiKey);

  const {
    isLoading: isModelsLoading,
    error: modelsError,
    models,
  } = useModels(user.apiKey);

  const {
    isLoading: isGenerateTestCaseOutputsLoading,
    error: testCaseOutputsError,
    data: testCaseOutputs,
    getData: getTestCaseOutputs,
    generateData: callGenerateTestCaseOutputs,
  } = useTestCaseOutputs(problemId, user.apiKey);

  const {
    isLoading: isRunUserSolutionLoading,
    error: userSolutionError,
    data: userSolutionTestResults,
    runData: callRunUserSolution,
  } = useRunUserSolution(problemId, userSolution, user.apiKey);

  const {
    completedSteps,
    isGenerating,
    isComplete,
    isFailed,
    error: generationError,
  } = useGenerationStatus(problemId, user.apiKey);

  // Set default model when models are loaded
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  // Auto-fetch data as each step completes or while generation is in progress
  useEffect(() => {
    const hasProblemText =
      problemText?.problemText && problemText?.functionSignature;
    const isGeneratingProblemText =
      isGenerating && !completedSteps.includes("generateProblemText");

    if (completedSteps.includes("generateProblemText") && !hasProblemText) {
      getProblemText();
    } else if (isGeneratingProblemText && !hasProblemText) {
      // Poll while generation is in progress
      const interval = setInterval(() => {
        getProblemText();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [completedSteps, problemText, isGenerating, getProblemText]);

  useEffect(() => {
    if (completedSteps.includes("generateTestCases") && !testCases) {
      getTestCases();
    }
  }, [completedSteps, testCases, getTestCases]);

  useEffect(() => {
    if (
      completedSteps.includes("generateTestCaseInputCode") &&
      !testCaseInputCode
    ) {
      getCodeToGenerateTestCaseInputs();
    }
  }, [completedSteps, testCaseInputCode, getCodeToGenerateTestCaseInputs]);

  useEffect(() => {
    if (completedSteps.includes("generateTestCaseInputs") && !testCaseInputs) {
      getTestCaseInputs();
    }
  }, [completedSteps, testCaseInputs, getTestCaseInputs]);

  useEffect(() => {
    if (completedSteps.includes("generateSolution") && !solution) {
      getSolution();
    }
  }, [completedSteps, solution, getSolution]);

  useEffect(() => {
    if (
      completedSteps.includes("generateTestCaseOutputs") &&
      !testCaseOutputs
    ) {
      getTestCaseOutputs();
    }
  }, [completedSteps, testCaseOutputs, getTestCaseOutputs]);

  // Helper to determine if buttons should be shown for a step
  const showButtons = !isGenerating || isComplete || isFailed;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <div className="w-full p-4 flex items-center justify-between gap-4 border-b flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h1
              className="text-xl font-bold hover:cursor-pointer"
              style={{ fontFamily: "var(--font-comic-relief)" }}
            >
              ClankerRank
            </h1>
          </Link>
          <Link href="/">
            <Button variant={"outline"} className="hover:cursor-pointer">
              Problems
            </Button>
          </Link>{" "}
          <form
            action={async () => {
              await signOutAction();
            }}
          >
            <Button
              variant={"outline"}
              className="hover:cursor-pointer"
              type="submit"
            >
              Sign out
            </Button>
          </form>
        </div>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={user.profilePictureUrl} />
            <AvatarFallback>{user.firstName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 w-full min-h-0"
      >
        <ResizablePanel defaultSize={20} className="min-h-0">
          <div className="h-full overflow-auto p-4 flex flex-col gap-4">
            <div>Problem: {problemId}</div>
            {isFailed && generationError && (
              <Alert variant="destructive">
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>{generationError}</AlertDescription>
              </Alert>
            )}
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateProblemText()}
                  >
                    {problemText ? "Re-generate" : "Generate"} Problem Text
                  </Button>
                  <Button variant={"outline"} onClick={() => getProblemText()}>
                    Re-fetch Problem Text
                  </Button>
                </>
              )}
              {(() => {
                const hasProblemText =
                  problemText?.problemText && problemText?.functionSignature;
                const isGeneratingProblemText =
                  isGenerating &&
                  !completedSteps.includes("generateProblemText");
                const shouldShowLoader =
                  isProblemTextLoading ||
                  (isGeneratingProblemText && !hasProblemText) ||
                  (!hasProblemText && !problemTextError);

                return shouldShowLoader ? (
                  <Loader />
                ) : (
                  <>
                    {problemTextError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {problemTextError instanceof Error
                            ? problemTextError.message
                            : String(problemTextError)}
                        </AlertDescription>
                      </Alert>
                    )}
                    {hasProblemText && (
                      <MessageResponse>
                        {problemText.problemText}
                      </MessageResponse>
                    )}
                  </>
                );
              })()}
            </div>
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateTestCases()}
                  >
                    {testCases ? "Re-generate" : "Generate"} Test Case
                    Descriptions
                  </Button>
                  <Button variant={"outline"} onClick={() => getTestCases()}>
                    Re-fetch Test Case Descriptions
                  </Button>
                </>
              )}
              {isTestCasesLoading ||
              (isGenerating &&
                !completedSteps.includes("generateTestCases") &&
                !testCases) ? (
                <Loader />
              ) : (
                <>
                  {testCasesError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {testCasesError instanceof Error
                          ? testCasesError.message
                          : String(testCasesError)}
                      </AlertDescription>
                    </Alert>
                  )}
                  {testCases && (
                    <div>
                      {testCases.map((testCase, i) => (
                        <div key={`testcase-description-${i}`}>
                          {testCase.description}
                          {testCase.isEdgeCase ? " [Edge Case]" : ""}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateTestCaseInputCode()}
                  >
                    {testCaseInputCode ? "Re-generate" : "Generate"} Test Case
                    Input Code
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => getCodeToGenerateTestCaseInputs()}
                  >
                    Re-fetch Test Case Input Code
                  </Button>
                </>
              )}
              {isTestCaseInputsLoading ||
              (isGenerating &&
                !completedSteps.includes("generateTestCaseInputCode") &&
                !testCaseInputCode) ? (
                <Loader />
              ) : (
                <>
                  {testCaseInputCodeError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {testCaseInputCodeError instanceof Error
                          ? testCaseInputCodeError.message
                          : String(testCaseInputCodeError)}
                      </AlertDescription>
                    </Alert>
                  )}
                  {testCaseInputCode && (
                    <div>
                      {testCaseInputCode.map((testCaseInput, i) => (
                        <div key={`testcase-input-${i}`}>{testCaseInput}</div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateTestCaseInputs()}
                  >
                    {testCaseInputs ? "Re-run" : "Run"} Generate Input
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => getTestCaseInputs()}
                  >
                    Re-fetch Test Case Inputs
                  </Button>
                </>
              )}
              {isGenerateTestCaseInputsLoading ||
              (isGenerating &&
                !completedSteps.includes("generateTestCaseInputs") &&
                !testCaseInputs) ? (
                <Loader />
              ) : (
                <>
                  {testCaseInputsError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {testCaseInputsError instanceof Error
                          ? testCaseInputsError.message
                          : String(testCaseInputsError)}
                      </AlertDescription>
                    </Alert>
                  )}
                  {testCaseInputs && (
                    <div>
                      {testCaseInputs.map((result, i) => (
                        <div key={`run-generate-input-result-${i}`}>
                          {JSON.stringify(result)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateSolution()}
                  >
                    {solution ? "Re-generate" : "Generate"} Solution
                  </Button>
                  <Button variant={"outline"} onClick={() => getSolution()}>
                    Re-fetch Solution
                  </Button>
                </>
              )}
              {isGenerateSolutionLoading ||
              (isGenerating &&
                !completedSteps.includes("generateSolution") &&
                !solution) ? (
                <Loader />
              ) : (
                <>
                  {solutionError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {solutionError instanceof Error
                          ? solutionError.message
                          : String(solutionError)}
                      </AlertDescription>
                    </Alert>
                  )}
                  {solution && <MessageResponse>{solution}</MessageResponse>}
                </>
              )}
            </div>
            <div>
              {showButtons && (
                <>
                  <Button
                    variant={"outline"}
                    onClick={() => callGenerateTestCaseOutputs()}
                  >
                    {testCaseOutputs ? "Re-generate" : "Generate"} Test Case
                    Outputs
                  </Button>
                  <Button
                    variant={"outline"}
                    onClick={() => getTestCaseOutputs()}
                  >
                    Re-fetch Test Case Outputs
                  </Button>
                </>
              )}
              {isGenerateTestCaseOutputsLoading ||
              (isGenerating &&
                !completedSteps.includes("generateTestCaseOutputs") &&
                !testCaseOutputs) ? (
                <Loader />
              ) : (
                <>
                  {testCaseOutputsError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {testCaseOutputsError instanceof Error
                          ? testCaseOutputsError.message
                          : String(testCaseOutputsError)}
                      </AlertDescription>
                    </Alert>
                  )}
                  {testCaseOutputs && (
                    <div>
                      {testCaseOutputs.map((output, i) => (
                        <div key={`testcase-output-${i}`}>
                          {JSON.stringify(output)}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div>
              <Button
                variant={"outline"}
                onClick={async () => {
                  try {
                    await callRunUserSolution();
                  } catch (error) {
                    // Error is handled by the hook's error state
                    console.error("Failed to run user solution:", error);
                  }
                }}
                disabled={isRunUserSolutionLoading}
              >
                {isRunUserSolutionLoading ? "Running..." : "Run User Solution"}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">
                    Generate Solution with Model
                  </label>
                  {isModelsLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Loading models...
                    </div>
                  ) : modelsError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {modelsError instanceof Error
                          ? modelsError.message
                          : String(modelsError)}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Select
                      value={selectedModel}
                      onValueChange={setSelectedModel}
                      disabled={isGenerateSolutionWithModelLoading}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.name}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Button
                  variant={"outline"}
                  onClick={async () => {
                    if (!selectedModel) {
                      alert("Please select a model");
                      return;
                    }
                    try {
                      const generatedSolution = await callGenerateSolutionWithModel(
                        selectedModel,
                        false,
                        false
                      );
                      if (generatedSolution) {
                        setUserSolution(generatedSolution);
                      }
                    } catch (error) {
                      console.error("Failed to generate solution:", error);
                    }
                  }}
                  disabled={isGenerateSolutionWithModelLoading || !selectedModel}
                >
                  {isGenerateSolutionWithModelLoading
                    ? "Generating..."
                    : "Generate Solution"}
                </Button>
              </div>
            </div>
            {isRunUserSolutionLoading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader />
                <span className="text-sm text-muted-foreground">
                  Running tests...
                </span>
              </div>
            ) : (
              <>
                {userSolutionError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {userSolutionError instanceof Error
                        ? userSolutionError.message
                        : String(userSolutionError)}
                    </AlertDescription>
                  </Alert>
                )}
                {userSolutionTestResults && (
                  <div>
                    {userSolutionTestResults.map((testResult, i) => (
                      <div key={`user-solution-test-result-${i}`}>
                        {JSON.stringify({
                          testCase: testResult.testCase.description,
                          status: testResult.status,
                          actual: testResult.actual,
                          error: testResult.error,
                          expected: testResult.testCase.expected,
                          stdout: testResult.stdout,
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="min-h-0 flex flex-col">
          <div className="flex-1 min-h-0">
            {userSolution ? (
              <Editor
                height="100%"
                width="100%"
                //   theme="vs-dark"
                defaultLanguage={language}
                value={userSolution ?? ""}
                onChange={(value) => setUserSolution(value ?? null)}
                options={{
                  fontSize: 14,
                  minimap: {
                    enabled: false,
                  },
                }}
                loading={<Skeleton className="h-full w-full" />}
              />
            ) : (
              <Skeleton className="h-full w-full" />
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
