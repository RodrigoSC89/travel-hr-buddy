/**
 * Custom hook for LSA & FFA Inspections
 */

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { lsaFfaInspectionService } from "@/services/lsa-ffa-inspection.service";
import { calculateInspectionScore } from "@/lib/scoreCalculator";
import type {
  LSAFFAInspection,
  InspectionStats,
  InspectionType,
  ChecklistItem,
  InspectionIssue,
} from "@/types/lsa-ffa";

interface UseLsaFfaOptions {
  vesselId?: string;
  autoLoad?: boolean;
}

export function useLsaFfa(options: UseLsaFfaOptions = {}) {
  const { vesselId, autoLoad = true } = options;
  const { toast } = useToast();

  const [inspections, setInspections] = useState<LSAFFAInspection[]>([]);
  const [stats, setStats] = useState<InspectionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load inspections
  const loadInspections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await lsaFfaInspectionService.getInspections(vesselId);
      setInspections(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load inspections");
      setError(error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [vesselId, toast]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await lsaFfaInspectionService.getInspectionStats(vesselId);
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, [vesselId]);

  // Create inspection
  const createInspection = useCallback(
    async (
      inspection: Omit<LSAFFAInspection, "id" | "created_at" | "updated_at">
    ) => {
      try {
        setLoading(true);
        const newInspection = await lsaFfaInspectionService.createInspection(inspection);
        setInspections((prev) => [newInspection, ...prev]);
        toast({
          title: "Success",
          description: "Inspection created successfully",
        });
        await loadStats();
        return newInspection;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create inspection");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast, loadStats]
  );

  // Update inspection
  const updateInspection = useCallback(
    async (id: string, updates: Partial<LSAFFAInspection>) => {
      try {
        setLoading(true);
        const updated = await lsaFfaInspectionService.updateInspection(id, updates);
        setInspections((prev) =>
          prev.map((i) => (i.id === id ? updated : i))
        );
        toast({
          title: "Success",
          description: "Inspection updated successfully",
        });
        await loadStats();
        return updated;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update inspection");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast, loadStats]
  );

  // Delete inspection
  const deleteInspection = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        await lsaFfaInspectionService.deleteInspection(id);
        setInspections((prev) => prev.filter((i) => i.id !== id));
        toast({
          title: "Success",
          description: "Inspection deleted successfully",
        });
        await loadStats();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete inspection");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [toast, loadStats]
  );

  // Calculate score for checklist
  const calculateScore = useCallback(
    (checklist: Record<string, ChecklistItem>, issues: InspectionIssue[]) => {
      return calculateInspectionScore(checklist, issues);
    },
    []
  );

  // Get inspections by type
  const getInspectionsByType = useCallback(
    (type: InspectionType) => {
      return inspections.filter((i) => i.type === type);
    },
    [inspections]
  );

  // Get critical inspections
  const getCriticalInspections = useCallback(() => {
    return inspections.filter(
      (i) =>
        i.score < 70 ||
        i.issues_found.some((issue) => issue.severity === "critical")
    );
  }, [inspections]);

  // Resolve issue
  const resolveIssue = useCallback(
    async (inspectionId: string, issueId: string) => {
      try {
        const updated = await lsaFfaInspectionService.resolveIssue(
          inspectionId,
          issueId
        );
        setInspections((prev) =>
          prev.map((i) => (i.id === inspectionId ? updated : i))
        );
        toast({
          title: "Success",
          description: "Issue marked as resolved",
        });
        await loadStats();
        return updated;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to resolve issue");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast, loadStats]
  );

  // Apply signature
  const applySignature = useCallback(
    async (inspectionId: string, signatureData: string) => {
      try {
        const result = await lsaFfaInspectionService.validateSignature(
          inspectionId,
          signatureData
        );
        if (result) {
          await loadInspections();
          toast({
            title: "Success",
            description: "Signature applied successfully",
          });
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to apply signature");
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast, loadInspections]
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      loadInspections();
      loadStats();
    }
  }, [autoLoad, loadInspections, loadStats]);

  return {
    // State
    inspections,
    stats,
    loading,
    error,

    // Actions
    loadInspections,
    loadStats,
    createInspection,
    updateInspection,
    deleteInspection,
    calculateScore,
    resolveIssue,
    applySignature,

    // Helpers
    getInspectionsByType,
    getCriticalInspections,
  };
}
