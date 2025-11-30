"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  generateProblemText,
  getProblemText,
} from "@/actions/generate-problem-text";
import { generateTestCases, getTestCases } from "@/actions/generate-test-cases";
import {
  generateTestCaseInputCode,
  getTestCaseInputCode,
} from "@/actions/generate-test-case-input-code";
import {
  generateTestCaseInputs,
  getTestCaseInputs,
} from "@/actions/generate-test-case-inputs";
import { generateSolution, getSolution } from "@/actions/generate-solution";
import {
  generateTestCaseOutputs,
  getTestCaseOutputs,
} from "@/actions/generate-test-case-outputs";
import { runUserSolution } from "@/actions/run-user-solution";
import {
  getGenerationStatus,
  type GenerationStep,
} from "@/actions/generation-status";
import { listModels } from "@/actions/list-models";

export function useProblemText(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["problemText", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getProblemText(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await generateProblemText(id, encryptedUserId);
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync(problemId);
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useTestCases(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["testCases", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getTestCases(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await generateTestCases(id, encryptedUserId);
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync(problemId);
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useTestCaseInputCode(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["testCaseInputCode", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getTestCaseInputCode(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await generateTestCaseInputCode(id, encryptedUserId);
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync(problemId);
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useTestCaseInputs(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["testCaseInputs", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getTestCaseInputs(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await generateTestCaseInputs(id, encryptedUserId);
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync(problemId);
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useSolution(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["solution", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getSolution(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async ({
      id,
      model,
      updateProblem,
      enqueueNextStep,
    }: {
      id: string;
      model: string;
      updateProblem?: boolean;
      enqueueNextStep?: boolean;
    }) => {
      const result = await generateSolution(
        id,
        model,
        encryptedUserId,
        updateProblem,
        enqueueNextStep,
      );
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async (
    model: string,
    updateProblem?: boolean,
    enqueueNextStep?: boolean,
  ) => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync({
      id: problemId,
      model,
      updateProblem,
      enqueueNextStep,
    });
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useGenerateSolutionWithModel(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const generateMutation = useMutation({
    mutationFn: async ({
      id,
      model,
      updateProblem,
      enqueueNextStep,
    }: {
      id: string;
      model: string;
      updateProblem?: boolean;
      enqueueNextStep?: boolean;
    }) => {
      return await generateSolution(
        id,
        model,
        encryptedUserId,
        updateProblem,
        enqueueNextStep,
      );
    },
  });

  const generateData = async (
    model: string,
    updateProblem?: boolean,
    enqueueNextStep?: boolean,
  ) => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync({
      id: problemId,
      model,
      updateProblem,
      enqueueNextStep,
    });
  };

  return {
    isLoading: generateMutation.isPending,
    error: generateMutation.error,
    data: generateMutation.data,
    generateData,
  };
}

export function useTestCaseOutputs(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["testCaseOutputs", problemId];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getTestCaseOutputs(problemId, encryptedUserId);
    },
    enabled: false,
  });

  const generateMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await generateTestCaseOutputs(id, encryptedUserId);
      queryClient.setQueryData(queryKey, result);
      return result;
    },
  });

  const getData = () => {
    if (!problemId) return Promise.reject(new Error("Problem ID is not set"));
    return query.refetch();
  };

  const generateData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    return generateMutation.mutateAsync(problemId);
  };

  return {
    isLoading: query.isFetching || generateMutation.isPending,
    error: query.error || generateMutation.error,
    data: query.data,
    getData,
    generateData,
  };
}

export function useRunUserSolution(
  problemId: string | null,
  userSolution: string | null,
  encryptedUserId?: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["runUserSolution", problemId, userSolution];

  const query = useQuery({
    queryKey,
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      if (!userSolution) throw new Error("User solution is not set");
      return runUserSolution(problemId, userSolution, encryptedUserId);
    },
    enabled: false,
  });

  const runMutation = useMutation({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      return runUserSolution(id, code, encryptedUserId);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const runData = async () => {
    if (!problemId) throw new Error("Problem ID is not set");
    if (!userSolution) throw new Error("User solution is not set");
    return runMutation.mutateAsync({ id: problemId, code: userSolution });
  };

  return {
    isLoading: query.isFetching || runMutation.isPending,
    error: query.error || runMutation.error,
    data: query.data || runMutation.data,
    runData,
  };
}

export function useGenerationStatus(
  problemId: string | null,
  encryptedUserId?: string,
) {
  const query = useQuery({
    queryKey: ["generationStatus", problemId],
    queryFn: () => {
      if (!problemId) throw new Error("Problem ID is not set");
      return getGenerationStatus(problemId, encryptedUserId);
    },
    enabled: !!problemId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending" || status === "in_progress") {
        return 2000;
      }
      return false;
    },
  });

  return {
    data: query.data,
    completedSteps: (query.data?.completedSteps ?? []) as GenerationStep[],
    isGenerating:
      query.data?.status === "pending" || query.data?.status === "in_progress",
    isComplete: query.data?.status === "completed",
    isFailed: query.data?.status === "failed",
    error: query.data?.error,
  };
}

export function useModels(encryptedUserId?: string) {
  const query = useQuery({
    queryKey: ["models", encryptedUserId],
    queryFn: () => listModels(encryptedUserId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    isLoading: query.isLoading,
    error: query.error,
    data: query.data,
    models: query.data ?? [],
  };
}

export type { GenerationStep };
