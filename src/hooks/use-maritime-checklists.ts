import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Checklist, ChecklistTemplate, ChecklistItem } from "@/components/maritime-checklists/checklist-types";

export const useMaritimeChecklists = (userId: string) => {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch checklists from Supabase
  const fetchChecklists = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("operational_checklists")
        .select(`
          *,
          checklist_items(*),
          vessels(*)
        `)
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match our Checklist interface
      const transformedChecklists: Checklist[] = data?.map(item => ({
        id: item.id,
        title: item.title,
        type: "dp" as unknown, // Default type, will be updated when we add proper type field
        version: "1.0",
        description: item.title || "",
        vessel: {
          id: item.vessels?.id || "",
          name: item.vessels?.name || "Unknown Vessel",
          type: item.vessels?.vessel_type || "Unknown",
          imo: item.vessels?.imo_number || "",
          flag: item.vessels?.flag_state || "",
          classification: "DNV", // Default classification
          operator: "Maritime Operator" // Default operator
        },
        inspector: {
          id: userId,
          name: "Current User",
          license: "LIC001",
          company: "Maritime Company",
          email: "user@maritime.com",
          phone: "+55 11 99999-9999",
          certifications: ["Maritime Inspector"]
        },
        status: item.status as unknown,
        items: item.checklist_items?.map((checklistItem: unknown) => ({
          id: checklistItem.id,
          title: checklistItem.title,
          description: checklistItem.description,
          type: "boolean",
          required: checklistItem.required,
          category: "General",
          order: checklistItem.order_index,
          status: checklistItem.completed ? "completed" : "pending",
          value: checklistItem.completed,
          notes: checklistItem.notes,
          timestamp: checklistItem.completed_at
        })) || [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        completedAt: null, // Will be set when completed
        priority: "medium" as unknown, // Default priority
        estimatedDuration: 180, // Default duration
        complianceScore: item.compliance_score,
        workflow: [],
        tags: [],
        template: false,
        syncStatus: "synced" as any
      })) || [];

      setChecklists(transformedChecklists);
    } catch (err) {
      setError("Erro ao carregar checklists");
      toast.error("Erro ao carregar checklists");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch templates (for now, use mock data)
  const fetchTemplates = async () => {
    // TODO: Implement template fetching from Supabase
    const mockTemplates: ChecklistTemplate[] = [
      {
        id: "template-1",
        name: "DP Inspection Template",
        type: "dp",
        version: "2.0",
        description: "Template padrão para inspeção de Dynamic Positioning",
        items: [],
        estimatedDuration: 240,
        frequency: "monthly",
        applicableVesselTypes: ["PSV", "AHTS", "OSV"],
        requiredCertifications: ["DPO"],
        dependencies: [],
        active: true,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "template-2",
        name: "Machine Routine Template",
        type: "machine_routine",
        version: "1.5",
        description: "Template para rotina de inspeção de máquinas",
        items: [],
        estimatedDuration: 180,
        frequency: "weekly",
        applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
        requiredCertifications: ["Chief Engineer"],
        dependencies: [],
        active: true,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "template-3",
        name: "Nautical Routine Template",
        type: "nautical_routine",
        version: "1.0",
        description: "Template para rotina náutica",
        items: [],
        estimatedDuration: 120,
        frequency: "daily",
        applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
        requiredCertifications: ["Captain", "Officer"],
        dependencies: [],
        active: true,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "template-4",
        name: "Safety Inspection Template",
        type: "safety",
        version: "2.1",
        description: "Template para inspeção de segurança",
        items: [],
        estimatedDuration: 200,
        frequency: "weekly",
        applicableVesselTypes: ["PSV", "AHTS", "OSV", "Drill Ship"],
        requiredCertifications: ["Safety Officer"],
        dependencies: [],
        active: true,
        createdBy: "admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setTemplates(mockTemplates);
  };

  // Save checklist to Supabase
  const saveChecklist = async (checklist: Checklist) => {
    try {
      // Update checklist
      const { error: checklistError } = await supabase
        .from("operational_checklists")
        .update({
          title: checklist.title,
          description: checklist.description,
          status: checklist.status,
          priority: checklist.priority,
          compliance_score: checklist.complianceScore,
          completed_at: checklist.completedAt,
          updated_at: new Date().toISOString()
        })
        .eq("id", checklist.id);

      if (checklistError) throw checklistError;

      // Update checklist items
      for (const item of checklist.items) {
        const { error: itemError } = await supabase
          .from("checklist_items")
          .update({
            completed: item.status === "completed",
            completed_at: item.timestamp,
            notes: item.notes,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (itemError) throw itemError;
      }

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist salvo com sucesso!");
    } catch (err) {
      toast.error("Erro ao salvar checklist");
      throw err;
    }
  };

  // Submit checklist for review
  const submitChecklist = async (checklist: Checklist) => {
    try {
      const { error } = await supabase
        .from("operational_checklists")
        .update({
          status: "pending_review",
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", checklist.id);

      if (error) throw error;

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist enviado para revisão!");
    } catch (err) {
      toast.error("Erro ao enviar checklist");
      throw err;
    }
  };

  // Create new checklist from template
  const createChecklistFromTemplate = async (template: ChecklistTemplate, vesselId?: string) => {
    try {
      if (!vesselId) {
        toast.error("Vessel ID é obrigatório");
        return;
      }

      const { data: checklist, error: checklistError } = await supabase
        .from("operational_checklists")
        .insert({
          title: `${template.name} - ${new Date().toLocaleDateString()}`,
          description: template.description,
          type: template.type,
          version: template.version,
          status: "draft",
          priority: "medium",
          estimated_duration: template.estimatedDuration,
          vessel_id: vesselId,
          organization_id: null, // Will be set by RLS
          created_by: userId
        })
        .select()
        .single();

      if (checklistError) throw checklistError;

      // TODO: Create checklist items from template
      // For now, we'll let the specific checklist components handle their own items

      // Refresh the checklists
      await fetchChecklists();
      
      toast.success("Checklist criado com sucesso!");
      return checklist;
    } catch (err) {
      toast.error("Erro ao criar checklist");
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChecklists();
      fetchTemplates();
    }
  }, [userId, fetchChecklists]);

  return {
    checklists,
    templates,
    loading,
    error,
    saveChecklist,
    submitChecklist,
    createChecklistFromTemplate,
    refetch: fetchChecklists
  };
};