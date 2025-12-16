import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrainingModuleService } from "../services/training-module";
import type {
  TrainingModule,
  TrainingCompletion,
  GenerateTrainingModuleRequest,
  ExportAuditBundleRequest
} from "../types/training";
import { toast } from "sonner";

/**
 * Hook for managing training modules
 */
export function useTrainingModules(vesselId?: string) {
  const queryClient = useQueryClient();

  // Fetch active training modules
  const {
    data: modules,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["training-modules", vesselId],
    queryFn: () => TrainingModuleService.getActiveModules(vesselId),
  });

  // Generate training module mutation
  const generateModuleMutation = useMutation({
    mutationFn: (request: GenerateTrainingModuleRequest) =>
      TrainingModuleService.generateTrainingModule(request),
    onSuccess: () => {
      toast.success("Módulo de treinamento gerado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["training-modules"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao gerar módulo: ${error.message}`);
    },
  });

  const generateModule = useCallback(
    (request: GenerateTrainingModuleRequest) => {
      return generateModuleMutation.mutateAsync(request);
    },
    [generateModuleMutation]
  );

  return {
    modules: modules || [],
    isLoading,
    error,
    refetch,
    generateModule,
    isGenerating: generateModuleMutation.isPending,
  };
}

/**
 * Hook for managing a specific training module
 */
export function useTrainingModule(moduleId: string) {
  const {
    data: module,
    isLoading,
    error
  } = useQuery({
    queryKey: ["training-module", moduleId],
    queryFn: () => TrainingModuleService.getModuleById(moduleId),
    enabled: !!moduleId,
  });

  // Get module statistics
  const {
    data: statistics,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ["training-module-stats", moduleId],
    queryFn: () => TrainingModuleService.getModuleStatistics(moduleId),
    enabled: !!moduleId,
  });

  return {
    module,
    statistics,
    isLoading,
    isLoadingStats,
    error,
  };
}

/**
 * Hook for managing training completions
 */
export function useTrainingCompletions(userId?: string, vesselId?: string) {
  const queryClient = useQueryClient();

  // Fetch user completions
  const {
    data: completions,
    isLoading,
    error
  } = useQuery({
    queryKey: ["training-completions", userId, vesselId],
    queryFn: () => TrainingModuleService.getUserCompletions(userId, vesselId),
  });

  // Record completion mutation
  const recordCompletionMutation = useMutation({
    mutationFn: ({
      moduleId,
      quizAnswers,
      vesselId,
      notes
    }: {
      moduleId: string
      quizAnswers: number[]
      vesselId?: string
      notes?: string
    }) => TrainingModuleService.recordCompletion(moduleId, quizAnswers, vesselId, notes),
    onSuccess: (data) => {
      if (data.passed) {
        toast.success(`Parabéns! Você passou no treinamento com ${data.quiz_score}%`);
      } else {
        toast.warning(`Você obteve ${data.quiz_score}%. É necessário 70% para passar.`);
      }
      queryClient.invalidateQueries({ queryKey: ["training-completions"] });
      queryClient.invalidateQueries({ queryKey: ["training-module-stats"] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar conclusão: ${error.message}`);
    },
  });

  const recordCompletion = useCallback(
    (
      moduleId: string,
      quizAnswers: number[],
      vesselId?: string,
      notes?: string
    ) => {
      return recordCompletionMutation.mutateAsync({
        moduleId,
        quizAnswers,
        vesselId,
        notes
      });
    },
    [recordCompletionMutation]
  );

  return {
    completions: completions || [],
    isLoading,
    error,
    recordCompletion,
    isRecording: recordCompletionMutation.isPending,
  };
}

/**
 * Hook for exporting audit bundles
 */
export function useAuditExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportBundle = useCallback(
    async (request: ExportAuditBundleRequest) => {
      setIsExporting(true);
      try {
        const result = await TrainingModuleService.exportAuditBundle(request);
        toast.success("Bundle de auditoria exportado com sucesso!");
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao exportar bundle: ${errorMessage}`);
        throw error;
      } finally {
        setIsExporting(false);
      }
    },
    []
  );

  return {
    exportBundle,
    isExporting,
  };
}
