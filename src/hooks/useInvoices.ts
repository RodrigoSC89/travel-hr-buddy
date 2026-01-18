import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  unit?: string;
  amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  category?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  organization_id: string;
  voyage_id?: string;
  vessel_id?: string;
  charterer_id?: string;
  status: "draft" | "pending_approval" | "approved" | "sent" | "paid" | "overdue" | "cancelled" | "disputed";
  currency: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  issued_at?: string;
  due_at?: string;
  paid_at?: string;
  payment_terms: string;
  notes?: string;
  items?: InvoiceItem[];
  vessel?: { id: string; name: string; imo_number?: string };
  charterer?: { id: string; name: string };
  created_at: string;
  updated_at: string;
}

interface CreateInvoicePayload {
  voyage_id?: string;
  vessel_id?: string;
  charterer_id?: string;
  currency?: string;
  payment_terms?: string;
  notes?: string;
  items: Omit<InvoiceItem, "id" | "amount" | "tax_amount">[];
  due_days?: number;
}

export function useInvoices() {
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const callInvoiceAPI = useCallback(async (operation: string, payload?: Record<string, unknown>, invoice_id?: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    const response = await supabase.functions.invoke("invoice-api", {
      body: { operation, payload, invoice_id },
    });

    if (response.error) throw new Error(response.error.message);
    if (!response.data.success) throw new Error(response.data.error);

    return response.data;
  }, []);

  const createInvoice = useCallback(async (payload: CreateInvoicePayload) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("create_invoice", payload as unknown as Record<string, unknown>);
      toast.success("Fatura criada", {
        description: `Número: ${result.invoice_number}`,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar fatura";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const approveInvoice = useCallback(async (invoiceId: string) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("approve_invoice", undefined, invoiceId);
      toast.success("Fatura aprovada");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao aprovar";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const sendInvoice = useCallback(async (invoiceId: string) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("send_invoice", undefined, invoiceId);
      toast.success("Fatura enviada", {
        description: `Número: ${result.invoice_number}`,
      });
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const markAsPaid = useCallback(async (invoiceId: string, paymentReference?: string) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("mark_paid", { payment_reference: paymentReference }, invoiceId);
      toast.success("Fatura marcada como paga");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao marcar como paga";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const listInvoices = useCallback(async (filters?: { status?: string; charterer_id?: string; vessel_id?: string; limit?: number }) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("list_invoices", filters);
      setInvoices(result.invoices || []);
      return result.invoices;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao listar";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const getInvoice = useCallback(async (invoiceId: string) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("get_invoice", undefined, invoiceId);
      setCurrentInvoice(result.invoice);
      return result.invoice;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar fatura";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  const generateFromVoyage = useCallback(async (voyageId: string) => {
    setIsLoading(true);
    try {
      const result = await callInvoiceAPI("generate_from_voyage", { voyage_id: voyageId });
      return result.generated_items;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao gerar itens";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callInvoiceAPI]);

  return {
    isLoading,
    invoices,
    currentInvoice,
    createInvoice,
    approveInvoice,
    sendInvoice,
    markAsPaid,
    listInvoices,
    getInvoice,
    generateFromVoyage,
  };
}
