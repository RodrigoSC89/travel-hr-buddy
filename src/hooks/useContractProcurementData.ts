/**
 * useContractProcurementData - Real data for Contract & Procurement Intelligence
 * Sources: suppliers, rfq_requests, vessels
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContractData {
  id: string;
  contractNumber: string;
  vessel: string;
  charterer: string;
  type: string;
  form: string;
  startDate: string;
  endDate: string;
  dailyRate: number;
  currency: string;
  status: string;
  laytimeAllowed: number;
  laytimeUsed: number;
  demurrageRate: number;
  despatchRate: number;
}

export interface SupplierData {
  id: string;
  name: string;
  category: string;
  country: string;
  rating: number;
  totalSpend: number;
  onTimeDelivery: number;
  qualityScore: number;
  status: string;
}

export interface RFQData {
  id: string;
  title: string;
  category: string;
  vessel: string;
  deadline: string;
  budget: number;
  responses: number;
  status: string;
}

export interface SpendCategory {
  category: string;
  spend: number;
  percentage: number;
  trend: string;
  change: number;
}

export function useContractProcurementData() {
  const suppliersQuery = useQuery({
    queryKey: ["procurement-suppliers"],
    queryFn: async (): Promise<SupplierData[]> => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("company_name");

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((s: any) => ({
        id: s.id,
        name: s.company_name || s.trading_name || "Sem nome",
        category: s.category || "Geral",
        country: s.country || "N/A",
        rating: s.rating || 0,
        totalSpend: s.total_value || 0,
        onTimeDelivery: s.lead_time_days ? Math.min(100, Math.round(100 - (s.lead_time_days / 2))) : 85,
        qualityScore: s.rating ? Math.round(s.rating * 20) : 0,
        status: s.is_active ? "active" : "inactive",
      }));
    },
  });

  const rfqQuery = useQuery({
    queryKey: ["procurement-rfqs"],
    queryFn: async (): Promise<RFQData[]> => {
      const { data, error } = await supabase
        .from("rfq_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      return data.map((r: any) => ({
        id: r.id,
        title: r.title || "RFQ",
        category: r.category || "Geral",
        vessel: r.vessel_name || "Fleet-wide",
        deadline: r.deadline || r.created_at,
        budget: r.budget || 0,
        responses: r.responses_count || 0,
        status: r.status || "open",
      }));
    },
  });

  // Calculate spend by category from suppliers
  const spendCategories: SpendCategory[] = (() => {
    const suppliers = suppliersQuery.data || [];
    const categoryMap = new Map<string, number>();
    let totalSpend = 0;

    for (const s of suppliers) {
      const current = categoryMap.get(s.category) || 0;
      categoryMap.set(s.category, current + s.totalSpend);
      totalSpend += s.totalSpend;
    }

    return Array.from(categoryMap.entries()).map(([category, spend]) => ({
      category,
      spend,
      percentage: totalSpend > 0 ? Math.round((spend / totalSpend) * 100) : 0,
      trend: "stable",
      change: 0,
    }));
  })();

  return {
    suppliers: suppliersQuery.data || [],
    rfqs: rfqQuery.data || [],
    spendCategories,
    isLoading: suppliersQuery.isLoading || rfqQuery.isLoading,
    error: suppliersQuery.error || rfqQuery.error,
  };
}
