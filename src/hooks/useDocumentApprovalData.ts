/**
 * Hook para dados de Workflow de Aprovação de Documentos - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DocumentApproval {
  id: string;
  title: string;
  type: string;
  status: "pending" | "approved" | "rejected" | "revision";
  submittedBy: string;
  submittedDate: Date;
  currentApprover: string;
  version: string;
  priority: "low" | "medium" | "high" | "urgent";
  comments?: string;
}

export function useDocumentApprovals(status?: string) {
  return useQuery({
    queryKey: ["document-approvals", status],
    queryFn: async (): Promise<DocumentApproval[]> => {
      let query = supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((doc) => ({
        id: doc.id,
        title: doc.title || "Documento",
        type: doc.document_type || "General",
        status: (doc.status as DocumentApproval["status"]) || "pending",
        submittedBy: doc.uploaded_by || "Usuário",
        submittedDate: new Date(doc.created_at || Date.now()),
        currentApprover: "Gerente",
        version: "1.0",
        priority: "medium" as const,
        comments: undefined,
      }));
    },
    staleTime: 30000,
  });
}

export function useApprovalStats() {
  const { data: docs } = useDocumentApprovals();

  return {
    pending: docs?.filter((d) => d.status === "pending").length || 0,
    approved: docs?.filter((d) => d.status === "approved").length || 0,
    rejected: docs?.filter((d) => d.status === "rejected").length || 0,
    revision: docs?.filter((d) => d.status === "revision").length || 0,
  };
}

export function useApproveDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, approved, comments }: { id: string; approved: boolean; comments?: string }) => {
      const { error } = await supabase
        .from("documents")
        .update({
          status: approved ? "approved" : "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["document-approvals"] });
      toast.success(variables.approved ? "Documento aprovado" : "Documento rejeitado");
    },
    onError: (error) => {
      toast.error("Erro ao processar documento: " + error.message);
    },
  });
}
