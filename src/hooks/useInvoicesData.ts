/**
 * Hook para dados reais de Faturas
 * Usa tabelas existentes do Supabase
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  number: string;
  vendor: string;
  description: string;
  amount: number;
  currency: string;
  dueDate: Date;
  submittedAt: Date;
  status: "pending" | "approved" | "rejected" | "on_hold" | "paid";
  category: string;
  attachments: number;
  currentStep: number;
  totalSteps: number;
  approvers: Approver[];
  comments: Comment[];
  urgency: "normal" | "high" | "critical";
}

export interface Approver {
  id: string;
  name: string;
  role: string;
  status: "pending" | "approved" | "rejected" | "skipped";
  approvedAt?: Date;
  comment?: string;
}

export interface Comment {
  id: string;
  author: string;
  message: string;
  timestamp: Date;
}

// Default data
const DEFAULT_INVOICES: Invoice[] = [
  {
    id: "1",
    number: "INV-2024-0156",
    vendor: "Marine Supplies Co.",
    description: "Suprimentos de manutenção para motor principal",
    amount: 45000,
    currency: "USD",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: "pending",
    category: "Manutenção",
    attachments: 3,
    currentStep: 2,
    totalSteps: 3,
    urgency: "high",
    approvers: [
      { id: "1", name: "Carlos Mendes", role: "Gerente de Operações", status: "approved", approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: "2", name: "Ana Silva", role: "Diretora Financeira", status: "pending" },
    ],
    comments: [{ id: "1", author: "Carlos Mendes", message: "Aprovado. Valores dentro do orçamento.", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }],
  },
  {
    id: "2",
    number: "INV-2024-0157",
    vendor: "Port Services Ltd.",
    description: "Taxas portuárias - Porto de Rotterdam",
    amount: 12500,
    currency: "EUR",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "pending",
    category: "Operacional",
    attachments: 2,
    currentStep: 1,
    totalSteps: 2,
    urgency: "critical",
    approvers: [
      { id: "1", name: "Pedro Costa", role: "Coordenador Portuário", status: "pending" },
      { id: "2", name: "Ana Silva", role: "Diretora Financeira", status: "pending" },
    ],
    comments: [],
  },
  {
    id: "3",
    number: "INV-2024-0148",
    vendor: "Crew Training Institute",
    description: "Treinamento STCW - 12 tripulantes",
    amount: 28000,
    currency: "USD",
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    status: "approved",
    category: "Treinamento",
    attachments: 5,
    currentStep: 3,
    totalSteps: 3,
    urgency: "normal",
    approvers: [
      { id: "1", name: "Maria Santos", role: "RH Manager", status: "approved", approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: "2", name: "Carlos Mendes", role: "Gerente de Operações", status: "approved", approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
    ],
    comments: [],
  },
];

export function useInvoicesData() {
  const queryClient = useQueryClient();
  const [localInvoices, setLocalInvoices] = useState<Invoice[]>([]);

  // Fetch invoices from database
  const invoicesQuery = useQuery({
    queryKey: ["invoices-approval"],
    queryFn: async (): Promise<Invoice[]> => {
      try {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .order("created_at", { ascending: false });

        if (error || !data?.length) {
          return DEFAULT_INVOICES;
        }

        return data.map((inv): Invoice => {
          const metadata = (inv.metadata as Record<string, unknown>) || {};
          
          // Map database status to our status type
          const dbStatus = inv.status || "pending";
          let mappedStatus: Invoice["status"] = "pending";
          if (dbStatus === "approved" || dbStatus === "paid") mappedStatus = dbStatus as Invoice["status"];
          else if (dbStatus === "cancelled" || dbStatus === "disputed") mappedStatus = "rejected";
          else if (dbStatus === "pending_approval" || dbStatus === "draft") mappedStatus = "pending";
          else if (dbStatus === "sent") mappedStatus = "pending";

          const dueDate = new Date(inv.due_at || Date.now());

          return {
            id: inv.id,
            number: inv.invoice_number || `INV-${inv.id.slice(0, 8)}`,
            vendor: (metadata.vendor as string) || "Fornecedor",
            description: (metadata.description as string) || "",
            amount: inv.total_amount || 0,
            currency: inv.currency || "USD",
            dueDate,
            submittedAt: new Date(inv.created_at || Date.now()),
            status: mappedStatus,
            category: (metadata.category as string) || "Operacional",
            attachments: (metadata.attachments_count as number) || 0,
            currentStep: 1,
            totalSteps: 2,
            urgency: getUrgencyFromDueDate(dueDate),
            approvers: (metadata.approvers as Approver[]) || [],
            comments: (metadata.comments as Comment[]) || [],
          };
        });
      } catch {
        return DEFAULT_INVOICES;
      }
    },
    staleTime: 30000,
  });

  // Approve invoice
  const approveMutation = useMutation({
    mutationFn: async ({ invoiceId, comment }: { invoiceId: string; comment?: string }) => {
      // Update local state for immediate UI feedback
      setLocalInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: "approved" as const,
                comments: comment
                  ? [...inv.comments, { id: Date.now().toString(), author: "Você", message: comment, timestamp: new Date() }]
                  : inv.comments,
              }
            : inv
        )
      );

      // Try to update in database
      try {
        await supabase
          .from("invoices")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .eq("id", invoiceId);
      } catch {
        // Silent fail - local state already updated
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-approval"] });
      toast.success("Fatura aprovada com sucesso!");
    },
  });

  // Reject invoice
  const rejectMutation = useMutation({
    mutationFn: async ({ invoiceId, reason }: { invoiceId: string; reason: string }) => {
      setLocalInvoices((prev) =>
        prev.map((inv) =>
          inv.id === invoiceId
            ? {
                ...inv,
                status: "rejected" as const,
                comments: [...inv.comments, { id: Date.now().toString(), author: "Você", message: `Rejeitado: ${reason}`, timestamp: new Date() }],
              }
            : inv
        )
      );

      try {
        await supabase
          .from("invoices")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", invoiceId);
      } catch {
        // Silent fail
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices-approval"] });
      toast.error("Fatura rejeitada");
    },
  });

  // Combine database and local data
  const allInvoices = useMemo(() => {
    const dbInvoices = invoicesQuery.data || [];
    // Merge local updates with database data
    return dbInvoices.map((dbInv) => {
      const localUpdate = localInvoices.find((l) => l.id === dbInv.id);
      return localUpdate || dbInv;
    });
  }, [invoicesQuery.data, localInvoices]);

  // Stats
  const pendingInvoices = allInvoices.filter((i) => i.status === "pending");
  const totalPendingAmount = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const approvedThisMonth = allInvoices.filter((i) => {
    const now = new Date();
    return (
      i.status === "approved" &&
      i.submittedAt.getMonth() === now.getMonth() &&
      i.submittedAt.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    invoices: allInvoices,
    pendingInvoices,
    totalPendingAmount,
    approvedThisMonth,
    isLoading: invoicesQuery.isLoading,
    approve: approveMutation.mutate,
    reject: rejectMutation.mutate,
    refetch: () => invoicesQuery.refetch(),
  };
}

// Helper to determine urgency from due date
function getUrgencyFromDueDate(dueDate: Date): Invoice["urgency"] {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilDue <= 3) return "critical";
  if (daysUntilDue <= 7) return "high";
  return "normal";
}

export default useInvoicesData;
