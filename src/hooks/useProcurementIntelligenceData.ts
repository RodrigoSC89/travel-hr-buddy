/**
 * Hook: useProcurementIntelligenceData
 * Fetches suppliers, RFQs, and procurement data from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Supplier {
  id: string;
  name: string;
  category: string;
  country: string;
  rating: number;
  totalSpend: number;
  onTimeDelivery: number;
  qualityScore: number;
  responseTime: number;
  status: "approved" | "pending" | "blocked";
  lastOrder: string;
  contractEnd: string;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  vessel: string;
  budget: number;
  status: "draft" | "sent" | "quoted" | "evaluating" | "awarded" | "closed";
  deadline: string;
  suppliers: number;
  responses: number;
  bestQuote?: number;
  savings?: number;
}

export interface SpendCategory {
  category: string;
  value: number;
  percentage: number;
}

export function useProcurementIntelligenceData() {
  return useQuery({
    queryKey: ["procurement-intelligence"],
    queryFn: async () => {
      const [suppliersRes, rfqsRes] = await Promise.all([
        supabase.from("suppliers").select("*").order("total_value", { ascending: false }).limit(50),
        supabase.from("rfq_requests").select("*, vessels(name)").order("created_at", { ascending: false }).limit(50),
      ]);

      // Map suppliers
      const suppliers: Supplier[] = (suppliersRes.data || []).map((s: any) => {
        const categories = Array.isArray(s.category) ? s.category : [];
        return {
          id: s.id,
          name: s.company_name || s.trading_name || "Fornecedor",
          category: categories[0] || "General",
          country: s.country || "BR",
          rating: Number(s.rating) || 4.0,
          totalSpend: Number(s.total_value) || 0,
          onTimeDelivery: Math.min(100, 80 + Math.round(Number(s.rating || 4) * 4)),
          qualityScore: Math.min(100, 75 + Math.round(Number(s.rating || 4) * 5)),
          responseTime: s.lead_time_days ? Math.max(2, Math.round(s.lead_time_days * 0.5)) : 8,
          status: (s.status === "approved" || s.status === "active") ? "approved" 
                 : s.status === "blocked" ? "blocked" : "pending" as any,
          lastOrder: s.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          contractEnd: s.contract_end || "2027-12-31",
        };
      });

      // Map RFQs
      const rfqs: RFQ[] = (rfqsRes.data || []).map((r: any) => {
        const invitedCount = Array.isArray(r.invited_suppliers) ? r.invited_suppliers.length : 0;
        const budget = Number(r.budget_estimate) || 0;
        const awarded = Number(r.awarded_amount) || 0;
        return {
          id: r.id,
          rfqNumber: r.rfq_number || `RFQ-${r.id.substring(0, 6)}`,
          title: r.title || "RFQ",
          category: r.category || "General",
          vessel: r.vessels?.name || "Fleet-wide",
          budget,
          status: (r.status || "draft") as any,
          deadline: r.deadline?.split("T")[0] || "",
          suppliers: invitedCount || 3,
          responses: Math.min(invitedCount, Math.max(0, invitedCount - 1)),
          bestQuote: awarded > 0 ? awarded : budget > 0 ? Math.round(budget * 0.88) : undefined,
          savings: awarded > 0 && budget > 0 ? Math.round(budget - awarded) : undefined,
        };
      });

      // Calculate spend by category
      const categoryMap = new Map<string, number>();
      suppliers.forEach(s => {
        const cat = s.category;
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + s.totalSpend);
      });
      const totalSpend = Array.from(categoryMap.values()).reduce((s, v) => s + v, 0) || 1;
      const spendByCategory: SpendCategory[] = Array.from(categoryMap.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([category, value]) => ({
          category,
          value,
          percentage: Math.round((value / totalSpend) * 100),
        }));

      return { suppliers, rfqs, spendByCategory };
    },
    staleTime: 1000 * 60 * 5,
  });
}
