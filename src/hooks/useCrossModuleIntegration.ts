/**
 * Cross-Module Integration Hook
 * Connects Procurement ↔ Finance ↔ Maintenance workflows
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePOFromMaintenanceInput {
  maintenanceTaskId: string;
  title: string;
  description: string;
  estimatedCost: number;
  priority: string;
  vesselId?: string;
}

interface CreateExpenseFromPOInput {
  poTitle: string;
  amount: number;
  category: string;
  vesselId?: string;
  description?: string;
}

interface CreateMaintenanceFromInspectionInput {
  title: string;
  description: string;
  priority: string;
  vesselId?: string;
  componentName?: string;
}

/**
 * Hook for cross-module integration workflows
 * - Maintenance → Procurement (auto-create purchase requisition)
 * - PO Approval → Finance (auto-create expense entry)
 * - Inspection NC → Maintenance (auto-create work order)
 */
export function useCrossModuleIntegration() {
  const queryClient = useQueryClient();

  // Maintenance → Procurement: Create PO from maintenance task
  const createPOFromMaintenance = useMutation({
    mutationFn: async (input: CreatePOFromMaintenanceInput) => {
      const { data, error } = await supabase
        .from("action_items")
        .insert({
          title: `[AUTO-PO] ${input.title}`,
          description: `Requisição automática de compra gerada pela manutenção.\nTask: ${input.maintenanceTaskId}\nCusto estimado: $${input.estimatedCost.toLocaleString()}\n\n${input.description}`,
          priority: input.priority,
          status: "pending",
          source_module: "purchase_order",
          vessel_id: input.vesselId || null,
          source_reference_id: input.maintenanceTaskId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Requisição de compra criada automaticamente", {
        description: "Manutenção → Procurement integrado",
      });
      queryClient.invalidateQueries({ queryKey: ["approval-workflow"] });
      queryClient.invalidateQueries({ queryKey: ["action-items"] });
    },
    onError: () => toast.error("Falha ao criar requisição de compra"),
  });

  // PO Approval → Finance: Create expense entry
  const createExpenseFromPO = useMutation({
    mutationFn: async (input: CreateExpenseFromPOInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id || "00000000-0000-0000-0000-000000000000";
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          description: `[AUTO] ${input.poTitle}`,
          amount: input.amount,
          category: input.category || "procurement",
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Lançamento financeiro criado automaticamente", {
        description: "Procurement → Finance integrado",
      });
      queryClient.invalidateQueries({ queryKey: ["ceo-expenses"] });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
    onError: () => toast.error("Falha ao criar lançamento financeiro"),
  });

  // Inspection NC → Maintenance: Create work order
  const createMaintenanceFromInspection = useMutation({
    mutationFn: async (input: CreateMaintenanceFromInspectionInput) => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .insert({
          title: `[NC-AUTO] ${input.title}`,
          description: input.description,
          priority: input.priority,
          status: "pending",
          vessel_id: input.vesselId || null,
          component_name: input.componentName || "General",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Ordem de serviço criada automaticamente", {
        description: "Inspeção → Manutenção integrado",
      });
      queryClient.invalidateQueries({ queryKey: ["ceo-maintenance"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance"] });
    },
    onError: () => toast.error("Falha ao criar ordem de serviço"),
  });

  return {
    createPOFromMaintenance,
    createExpenseFromPO,
    createMaintenanceFromInspection,
    isIntegrating:
      createPOFromMaintenance.isPending ||
      createExpenseFromPO.isPending ||
      createMaintenanceFromInspection.isPending,
  };
}
