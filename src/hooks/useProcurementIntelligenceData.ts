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
      type SupplierRow = Record<string, unknown>;
      const suppliers: Supplier[] = ((suppliersRes.data || []) as SupplierRow[]).map((s) => {
        const categories = Array.isArray(s.category) ? s.category : [];
        const statusVal = String(s.status || "pending");
        const supplierStatus: Supplier["status"] = (statusVal === "approved" || statusVal === "active") ? "approved" 
               : statusVal === "blocked" ? "blocked" : "pending";
        return {
          id: String(s.id),
          name: String(s.company_name || s.trading_name || "Fornecedor"),
          category: String(categories[0] || "General"),
          country: String(s.country || "BR"),
          rating: Number(s.rating) || 4.0,
          totalSpend: Number(s.total_value) || 0,
          onTimeDelivery: Math.min(100, 80 + Math.round(Number(s.rating || 4) * 4)),
          qualityScore: Math.min(100, 75 + Math.round(Number(s.rating || 4) * 5)),
          responseTime: s.lead_time_days ? Math.max(2, Math.round(Number(s.lead_time_days) * 0.5)) : 8,
          status: supplierStatus,
          lastOrder: String(s.updated_at || new Date().toISOString()).split("T")[0],
          contractEnd: String(s.contract_end || "2027-12-31"),
        };
      });

      // Map RFQs
      type RFQRow = Record<string, unknown> & { vessels?: { name?: string } | null };
      const rfqs: RFQ[] = ((rfqsRes.data || []) as RFQRow[]).map((r) => {
        const invitedCount = Array.isArray(r.invited_suppliers) ? r.invited_suppliers.length : 0;
        const budget = Number(r.budget_estimate) || 0;
        const awarded = Number(r.awarded_amount) || 0;
        const rfqStatus = String(r.status || "draft") as RFQ["status"];
        return {
          id: String(r.id),
          rfqNumber: String(r.rfq_number || `RFQ-${String(r.id).substring(0, 6)}`),
          title: String(r.title || "RFQ"),
          category: String(r.category || "General"),
          vessel: r.vessels?.name || "Fleet-wide",
          budget,
          status: rfqStatus,
          deadline: String(r.deadline || "").split("T")[0],
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
