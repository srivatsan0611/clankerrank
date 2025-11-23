"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import Loader from "@/components/client/loader";
import { useAtomValue, useSetAtom } from "jotai";
import {
  callGenerateProblemTextAtom,
  callGenerateTestCaseInputsAtom,
  callGenerateTestCasesAtom,
  getProblemTextAtom,
  getTestCaseInputsAtom,
  getTestCasesAtom,
  isProblemTextLoadingAtom,
  isTestCaseInputsLoadingAtom,
  isTestCasesLoadingAtom,
  problemIdAtom,
  problemTextAtom,
  testCaseInputsAtom,
  testCasesAtom,
} from "@/atoms";

export default function ProblemRender({ problemId }: { problemId: string }) {
  const setProblemId = useSetAtom(problemIdAtom);
  const isProblemTextLoading = useAtomValue(isProblemTextLoadingAtom);
  const problemText = useAtomValue(problemTextAtom);
  const callGenerateProblemText = useSetAtom(callGenerateProblemTextAtom);
  const getProblemText = useSetAtom(getProblemTextAtom);
  const isTestCasesLoading = useAtomValue(isTestCasesLoadingAtom);
  const testCases = useAtomValue(testCasesAtom);
  const callGenerateTestCases = useSetAtom(callGenerateTestCasesAtom);
  const getTestCases = useSetAtom(getTestCasesAtom);
  const isTestCaseInputsLoading = useAtomValue(isTestCaseInputsLoadingAtom);
  const testCaseInputs = useAtomValue(testCaseInputsAtom);
  const callGenerateTestCaseInputs = useSetAtom(callGenerateTestCaseInputsAtom);
  const getTestCaseInputs = useSetAtom(getTestCaseInputsAtom);

  useEffect(() => {
    setProblemId(problemId);
  }, [problemId, setProblemId]);

  useEffect(() => {
    getProblemText();
  }, [getProblemText, problemId]);

  useEffect(() => {
    getTestCases();
  }, [getTestCases, problemId, problemText]);

  useEffect(() => {
    getTestCaseInputs();
  }, [getTestCaseInputs, problemId, testCases]);

  return (
    <div>
      <div>Problem: {problemId}</div>
      <div>
        {!problemText && (
          <Button variant={"outline"} onClick={() => callGenerateProblemText()}>
            Generate Problem Text
          </Button>
        )}
        {isProblemTextLoading ? (
          <Loader />
        ) : (
          problemText && (
            <>
              <MessageResponse>{problemText.problemText}</MessageResponse>
              <MessageResponse>
                {problemText.functionSignature.typescript}
              </MessageResponse>
            </>
          )
        )}
      </div>
      <div>
        <Button variant={"outline"} onClick={() => callGenerateTestCases()}>
          Generate Test Case Descriptions
        </Button>
        {isTestCasesLoading ? (
          <Loader />
        ) : (
          testCases && (
            <div>
              {testCases.map((testCase, i) => (
                <div key={`testcase-description-${i}`}>
                  {testCase.description}
                  {testCase.isEdgeCase ? " [Edge Case]" : ""}
                </div>
              ))}
            </div>
          )
        )}
      </div>
      <div>
        <Button
          variant={"outline"}
          onClick={() => callGenerateTestCaseInputs()}
        >
          Generate Test Case Inputs
        </Button>
        {isTestCaseInputsLoading ? (
          <Loader />
        ) : (
          testCaseInputs && (
            <div>
              {testCaseInputs.map((testCaseInput, i) => (
                <div key={`testcase-input-${i}`}>{testCaseInput.inputCode}</div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
