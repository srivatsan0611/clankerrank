"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import Loader from "@/components/client/loader";
import { useAtomValue, useSetAtom } from "jotai";
import {
  callGenerateProblemTextAtom,
  callGenerateTestCasesAtom,
  getProblemTextAtom,
  getTestCasesAtom,
  isProblemTextLoadingAtom,
  isTestCasesLoadingAtom,
  problemIdAtom,
  problemTextAtom,
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

  useEffect(() => {
    setProblemId(problemId);
  }, [problemId, setProblemId]);

  useEffect(() => {
    getProblemText();
  }, [getProblemText, problemId]);

  useEffect(() => {
    getTestCases();
  }, [getTestCases, problemId, problemText]);

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
              {testCases.map((testCase) => (
                <div key={testCase.description}>
                  {testCase.description}
                  {testCase.isEdgeCase ? " [Edge Case]" : ""}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
