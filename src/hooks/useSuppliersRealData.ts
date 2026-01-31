/**
 * Hook para dados reais de Fornecedores
 * Substitui mockSuppliers por queries Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  category: string[];
  status: "active" | "preferred" | "suspended" | "pending";
  rating: number;
  deliveryRate: number;
  avgLeadTime: number;
  totalOrders: number;
  totalValue: number;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    city: string;
    state: string;
    country: string;
  };
  paymentTerms: string;
  createdAt: string;
  lastOrderDate: string;
  qualityScore: number;
  priceCompetitiveness: number;
}

async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    logger.error("Error fetching suppliers:", error);
    return getDefaultSuppliers();
  }

  if (!data || data.length === 0) {
    return getDefaultSuppliers();
  }

  return data.map((s: any) => ({
    id: s.id,
    name: s.name || s.company_name || "Fornecedor",
    cnpj: s.cnpj || s.tax_id || "",
    category: s.categories || s.category || ["Geral"],
    status: mapSupplierStatus(s.status),
    rating: s.rating || s.score || 4.0,
    deliveryRate: s.delivery_rate || s.on_time_delivery || 90,
    avgLeadTime: s.avg_lead_time || s.lead_time_days || 7,
    totalOrders: s.total_orders || 0,
    totalValue: s.total_value || s.total_spent || 0,
    contact: {
      name: s.contact_name || s.contact_person || "",
      email: s.contact_email || s.email || "",
      phone: s.contact_phone || s.phone || ""
    },
    address: {
      city: s.city || "",
      state: s.state || "",
      country: s.country || "Brasil"
    },
    paymentTerms: s.payment_terms || "30 dias",
    createdAt: s.created_at || new Date().toISOString(),
    lastOrderDate: s.last_order_date || s.updated_at || "",
    qualityScore: s.quality_score || 85,
    priceCompetitiveness: s.price_competitiveness || s.price_score || 80
  }));
}

function mapSupplierStatus(status: string | null): Supplier["status"] {
  switch (status?.toLowerCase()) {
    case "preferred":
    case "premium":
      return "preferred";
    case "suspended":
    case "blocked":
    case "inactive":
      return "suspended";
    case "pending":
    case "pending_approval":
      return "pending";
    default:
      return "active";
  }
}

function getDefaultSuppliers(): Supplier[] {
  // Retorna array vazio - UI mostrará estado vazio
  return [];
}

async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  const { data, error } = await supabase
    .from("suppliers")
    .insert({
      company_name: supplier.name || "Novo Fornecedor",
      tax_id: supplier.cnpj,
      category: supplier.category,
      status: supplier.status || "pending",
      rating: supplier.rating || 0,
      contact_person: supplier.contact?.name,
      email: supplier.contact?.email,
      phone: supplier.contact?.phone,
      city: supplier.address?.city,
      state: supplier.address?.state,
      country: supplier.address?.country || "Brasil",
      payment_terms: supplier.paymentTerms
    })
    .select()
    .single();

  if (error) throw error;
  
  // Transform DB response to Supplier interface
  const s = data as any;
  return {
    id: s.id,
    name: s.company_name || "Fornecedor",
    cnpj: s.tax_id || "",
    category: s.category || ["Geral"],
    status: mapSupplierStatus(s.status),
    rating: s.rating || 0,
    deliveryRate: s.on_time_delivery || 90,
    avgLeadTime: s.lead_time_days || 7,
    totalOrders: 0,
    totalValue: 0,
    contact: {
      name: s.contact_person || "",
      email: s.email || "",
      phone: s.phone || ""
    },
    address: {
      city: s.city || "",
      state: s.state || "",
      country: s.country || "Brasil"
    },
    paymentTerms: s.payment_terms || "30 dias",
    createdAt: s.created_at,
    lastOrderDate: "",
    qualityScore: 85,
    priceCompetitiveness: 80
  };
}

async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const updatePayload: Record<string, any> = {};
  if (updates.name) updatePayload.company_name = updates.name;
  if (updates.status) updatePayload.status = updates.status;
  if (updates.rating) updatePayload.rating = updates.rating;
  if (updates.contact?.name) updatePayload.contact_person = updates.contact.name;
  if (updates.contact?.email) updatePayload.email = updates.contact.email;
  if (updates.contact?.phone) updatePayload.phone = updates.contact.phone;

  const { data, error } = await supabase
    .from("suppliers")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  
  const s = data as any;
  return {
    id: s.id,
    name: s.company_name || "Fornecedor",
    cnpj: s.tax_id || "",
    category: s.category || ["Geral"],
    status: mapSupplierStatus(s.status),
    rating: s.rating || 0,
    deliveryRate: s.on_time_delivery || 90,
    avgLeadTime: s.lead_time_days || 7,
    totalOrders: 0,
    totalValue: 0,
    contact: {
      name: s.contact_person || "",
      email: s.email || "",
      phone: s.phone || ""
    },
    address: {
      city: s.city || "",
      state: s.state || "",
      country: s.country || "Brasil"
    },
    paymentTerms: s.payment_terms || "30 dias",
    createdAt: s.created_at,
    lastOrderDate: "",
    qualityScore: 85,
    priceCompetitiveness: 80
  };
}

// ============================================
// HOOKS EXPORTADOS
// ============================================

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    }
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) => 
      updateSupplier(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    }
  });
}

export function useSuppliersStats() {
  const { data: suppliers } = useSuppliers();

  const total = suppliers?.length || 0;
  const preferred = suppliers?.filter(s => s.status === "preferred").length || 0;
  const active = suppliers?.filter(s => s.status === "active").length || 0;
  const avgRating = suppliers?.length
    ? (suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)
    : "0.0";

  return { total, preferred, active, avgRating };
}
