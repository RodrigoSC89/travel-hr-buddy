import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChecklistService } from "../services/checklistService";
import { AIChecklistService } from "../services/aiSuggestions";
import type { Checklist, ChecklistTemplate } from "../types";
import { validateChecklist } from "../utils/checklistValidation";

/**
 * Hook for managing checklists in the intelligent checklists module
 */
export function useChecklists(userId: string) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch checklists
  const fetchChecklists = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ChecklistService.fetchChecklists(userId);
      setChecklists(data);
    } catch (err) {
      const message = "Failed to fetch checklists";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new checklist
  const createChecklist = async (title: string, type = "outro") => {
    try {
      await ChecklistService.createChecklist(title, userId, type);
      toast.success("Checklist created successfully");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to create checklist");
      throw err;
    }
  };

  // Create checklist with AI
  const createChecklistWithAI = async (prompt: string) => {
    try {
      // Generate items with AI
      const items = await AIChecklistService.generateChecklistItems(prompt);
      
      // Create the checklist
      await ChecklistService.createChecklist(prompt, userId);
      
      // TODO: Add items to the checklist
      
      toast.success(`Checklist created with ${items.length} AI-generated items`);
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to create checklist with AI");
      throw err;
    }
  };

  // Update a checklist
  const updateChecklist = async (checklist: Checklist) => {
    try {
      await ChecklistService.updateChecklist(checklist);
      toast.success("Checklist updated successfully");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to update checklist");
      throw err;
    }
  };

  // Delete a checklist
  const deleteChecklist = async (checklistId: string) => {
    try {
      await ChecklistService.deleteChecklist(checklistId);
      toast.success("Checklist deleted successfully");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to delete checklist");
      throw err;
    }
  };

  // Toggle item completion
  const toggleItem = async (checklistId: string, itemId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) return;

      const item = checklist.items.find(i => i.id === itemId);
      if (!item) return;

      await ChecklistService.toggleItem(itemId, item.status === "completed");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to toggle item");
      throw err;
    }
  };

  // Analyze checklist with AI
  const analyzeChecklist = async (checklistId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) return null;

      const analysis = await AIChecklistService.analyzeChecklist(
        checklistId,
        checklist.items
      );

      toast.success("Analysis complete");
      return analysis;
    } catch (err) {
      toast.error("Failed to analyze checklist");
      throw err;
    }
  };

  // Summarize checklist with AI
  const summarizeChecklist = async (checklistId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) return null;

      const summary = await AIChecklistService.summarizeChecklist(
        checklist.title,
        checklist.items.map(item => ({
          title: item.title,
          completed: item.status === "completed"
        })),
        []
      );

      toast.success("Summary generated");
      return summary;
    } catch (err) {
      toast.error("Failed to generate summary");
      throw err;
    }
  };

  // Submit checklist for review
  const submitForReview = async (checklistId: string) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      if (!checklist) return;

      // Validate before submitting
      const validation = validateChecklist(checklist);
      if (!validation.canSubmit) {
        toast.error(`Cannot submit: ${validation.errors.join(", ")}`);
        return;
      }

      await ChecklistService.submitForReview(checklistId);
      toast.success("Checklist submitted for review");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to submit checklist");
      throw err;
    }
  };

  // Create from template
  const createFromTemplate = async (
    template: ChecklistTemplate,
    vesselId: string
  ) => {
    try {
      await ChecklistService.createFromTemplate(template, vesselId, userId);
      toast.success("Checklist created from template");
      await fetchChecklists();
    } catch (err) {
      toast.error("Failed to create from template");
      throw err;
    }
  };

  // Calculate statistics
  const getStatistics = useCallback(() => {
    const total = checklists.length;
    const completed = checklists.filter(c => c.status === "completed").length;
    const inProgress = checklists.filter(c => c.status === "in_progress").length;
    const avgComplianceScore = checklists.length > 0
      ? checklists.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / total
      : 0;

    return {
      total,
      completed,
      inProgress,
      avgComplianceScore: Math.round(avgComplianceScore)
    };
  }, [checklists]);

  // Load checklists on mount
  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  return {
    checklists,
    loading,
    error,
    statistics: getStatistics(),
    createChecklist,
    createChecklistWithAI,
    updateChecklist,
    deleteChecklist,
    toggleItem,
    analyzeChecklist,
    summarizeChecklist,
    submitForReview,
    createFromTemplate,
    refetch: fetchChecklists
  };
}
