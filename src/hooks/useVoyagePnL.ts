/**
 * useVoyagePnL - Real Voyage P&L data from voyage_accounting + vessels
 * Replaces Math.random() mock data with actual Supabase records
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VoyageFinancial {
  id: string;
  vesselName: string;
  voyageNumber: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  tceDaily: number | null;
  status: "completed" | "ongoing" | "planned";
  departurePort: string;
  arrivalPort: string;
  departureDate: string;
  arrivalDate: string | null;
  cargoType: string | null;
  cargoQuantity: number | null;
}

export interface VoyagePnLStats {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  avgMargin: number;
  avgTCE: number;
  voyageCount: number;
}

export function useVoyagePnL() {
  return useQuery({
    queryKey: ["voyage-pnl-real"],
    queryFn: async (): Promise<{
      voyages: VoyageFinancial[];
      stats: VoyagePnLStats;
    }> => {
      // Fetch voyage_accounting with vessel join
      const { data: accounting, error: accError } = await supabase
        .from("voyage_accounting")
        .select("*, vessels(name)")
        .order("departure_date", { ascending: false });

      if (accError) throw accError;

      // Also fetch voyage_plans for additional voyages not in accounting
      const { data: plans, error: plansError } = await supabase
        .from("voyage_plans")
        .select("*, vessels(name)")
        .order("departure_date", { ascending: false });

      if (plansError) throw plansError;

      const voyages: VoyageFinancial[] = [];
      const seenVoyageNumbers = new Set<string>();

      // Priority: voyage_accounting (has financial data)
      for (const row of accounting || []) {
        const vesselName =
          (row as any).vessels?.name || "Embarcação Desconhecida";
        const revenue = Number(row.actual_revenue) || Number(row.budget_revenue) || 0;
        const costs = Number(row.actual_costs) || Number(row.budget_costs) || 0;
        const profit = Number(row.net_result) || revenue - costs;
        const margin = Number(row.margin_percent) || (revenue > 0 ? (profit / revenue) * 100 : 0);

        const statusMap: Record<string, VoyageFinancial["status"]> = {
          completed: "completed",
          closed: "completed",
          in_progress: "ongoing",
          active: "ongoing",
          planned: "planned",
          draft: "planned",
        };

        const rowStatus = row.status?.toLowerCase() || "planned";

        voyages.push({
          id: row.id,
          vesselName,
          voyageNumber: row.voyage_number || `VOY-${row.id.slice(0, 6)}`,
          revenue,
          costs,
          profit,
          margin,
          tceDaily: row.tce_daily ? Number(row.tce_daily) : null,
          status: statusMap[rowStatus] || "planned",
          departurePort: row.departure_port || "—",
          arrivalPort: row.arrival_port || "—",
          departureDate: row.departure_date || row.created_at || new Date().toISOString(),
          arrivalDate: row.arrival_date || null,
          cargoType: row.cargo_type || null,
          cargoQuantity: row.cargo_quantity ? Number(row.cargo_quantity) : null,
        });
        if (row.voyage_number) seenVoyageNumbers.add(row.voyage_number);
      }

      // Add voyage_plans not already in accounting
      for (const plan of plans || []) {
        if (plan.voyage_number && seenVoyageNumbers.has(plan.voyage_number)) continue;

        const vesselName = (plan as any).vessels?.name || "Embarcação Desconhecida";
        const fuelCost = Number(plan.estimated_fuel_consumption || 0) * 600; // ~$600/ton estimate

        voyages.push({
          id: plan.id,
          vesselName,
          voyageNumber: plan.voyage_number || `PLN-${plan.id.slice(0, 6)}`,
          revenue: 0,
          costs: fuelCost,
          profit: -fuelCost,
          margin: 0,
          tceDaily: null,
          status: plan.status === "completed" ? "completed" : plan.status === "in_progress" ? "ongoing" : "planned",
          departurePort: plan.origin_port || "—",
          arrivalPort: plan.destination_port || "—",
          departureDate: plan.departure_date || plan.created_at || new Date().toISOString(),
          arrivalDate: plan.arrival_date || null,
          cargoType: plan.cargo_type || null,
          cargoQuantity: plan.cargo_quantity ? Number(plan.cargo_quantity) : null,
        });
      }

      // Calculate stats
      const totalRevenue = voyages.reduce((s, v) => s + v.revenue, 0);
      const totalCosts = voyages.reduce((s, v) => s + v.costs, 0);
      const totalProfit = totalRevenue - totalCosts;
      const avgMargin = voyages.length > 0 ? voyages.reduce((s, v) => s + v.margin, 0) / voyages.length : 0;
      const tcePools = voyages.filter((v) => v.tceDaily !== null);
      const avgTCE = tcePools.length > 0 ? tcePools.reduce((s, v) => s + (v.tceDaily || 0), 0) / tcePools.length : 0;

      return {
        voyages,
        stats: {
          totalRevenue,
          totalCosts,
          totalProfit,
          avgMargin,
          avgTCE,
          voyageCount: voyages.length,
        },
      };
    },
  });
}
