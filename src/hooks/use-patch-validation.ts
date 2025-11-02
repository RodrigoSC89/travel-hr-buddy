import { useQuery } from "@tanstack/react-query";
import { validationRegistry, ValidationResult } from "@/validations/registry";

/**
 * PATCH 635: Patch Validation Hook
 * Hook to run and monitor validation results for specific patches
 */
export function usePatchValidation(patchId: number) {
  return useQuery({
    queryKey: ["patch-validation", patchId],
    queryFn: () => validationRegistry.runValidator(patchId),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: !!patchId,
  });
}

/**
 * Hook to run all patch validations
 */
export function useAllPatchValidations() {
  return useQuery({
    queryKey: ["all-patch-validations"],
    queryFn: async () => {
      const results = await validationRegistry.runAll();
      return Object.fromEntries(results);
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

/**
 * Hook to run validations by category
 */
export function useCategoryValidations(category: string) {
  return useQuery({
    queryKey: ["category-validations", category],
    queryFn: async () => {
      const results = await validationRegistry.runCategory(category);
      return Object.fromEntries(results);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!category,
  });
}

/**
 * Hook to list all available validators
 */
export function useValidatorsList() {
  return useQuery({
    queryKey: ["validators-list"],
    queryFn: () => validationRegistry.list(),
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
}
