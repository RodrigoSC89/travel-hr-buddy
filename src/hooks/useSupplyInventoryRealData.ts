/**
 * Hook para inventário de suprimentos real
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupplyItem {
  id: string;
  name: string;
  category: "fuel" | "water" | "food" | "parts" | "medical" | "safety";
  currentStock: number;
  maxCapacity: number;
  unit: string;
  consumptionRate: number;
  daysUntilEmpty: number;
  reorderPoint: number;
  lastRestock: Date;
  predictedNeed: Date;
  status: "ok" | "low" | "critical" | "ordered";
}

export interface AIRecommendation {
  id: string;
  type: "reorder" | "optimization" | "alert" | "savings";
  title: string;
  description: string;
  impact: string;
  confidence: number;
  action?: string;
}

function mapCategory(category: string | null): SupplyItem["category"] {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("fuel") || cat.includes("combustível")) return "fuel";
  if (cat.includes("water") || cat.includes("água")) return "water";
  if (cat.includes("food") || cat.includes("alimento")) return "food";
  if (cat.includes("part") || cat.includes("peça")) return "parts";
  if (cat.includes("medical") || cat.includes("médico")) return "medical";
  return "safety";
}

function calculateStatus(current: number, max: number, reorderPoint: number): SupplyItem["status"] {
  const percentage = (current / max) * 100;
  if (percentage <= 10) return "critical";
  if (current <= reorderPoint) return "low";
  return "ok";
}

export function useSupplyInventoryRealData() {
  const queryClient = useQueryClient();

  // Fetch inventory items
  const { data: supplies = [], isLoading } = useQuery({
    queryKey: ["supply-inventory"],
    queryFn: async (): Promise<SupplyItem[]> => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name");

      if (error) throw error;

      return (data || []).map(item => {
        const currentStock = item.quantity || 0;
        const maxCapacity = 1000; // default
        const consumptionRate = 10; // default consumption rate
        const reorderPoint = maxCapacity * 0.2;
        const daysUntilEmpty = consumptionRate > 0 ? Math.floor(currentStock / consumptionRate) : 999;

        return {
          id: item.id,
          name: item.name || "Item",
          category: mapCategory(item.category),
          currentStock,
          maxCapacity,
          unit: item.unit || "unidades",
          consumptionRate,
          daysUntilEmpty,
          reorderPoint,
          lastRestock: new Date(item.updated_at || item.created_at || Date.now()),
          predictedNeed: new Date(Date.now() + daysUntilEmpty * 24 * 60 * 60 * 1000),
          status: calculateStatus(currentStock, maxCapacity, reorderPoint),
        };
      });
    },
    staleTime: 60000,
  });

  // Fetch AI recommendations from ai_insights
  const { data: recommendations = [] } = useQuery({
    queryKey: ["supply-ai-recommendations"],
    queryFn: async (): Promise<AIRecommendation[]> => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("related_module", "logistics")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(insight => ({
        id: insight.id,
        type: (insight.category as AIRecommendation["type"]) || "optimization",
        title: insight.title,
        description: insight.description,
        impact: insight.impact_value || "Melhoria operacional",
        confidence: Math.round((insight.confidence || 0.8) * 100),
        action: insight.actionable ? "Executar" : undefined,
      }));
    },
    staleTime: 120000,
  });

  // Generate order mutation
  const generateOrder = useMutation({
    mutationFn: async (itemId: string) => {
      const item = supplies.find(s => s.id === itemId);
      if (!item) throw new Error("Item não encontrado");

      // Create a shipment/order record
      const { error } = await supabase.from("shipments").insert({
        origin: "Fornecedor",
        destination: "Embarcação",
        cargo_type: item.category,
        status: "scheduled",
        tracking_number: `ORD-${Date.now()}`,
        notes: `Pedido de reabastecimento: ${item.name}`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supply-inventory"] });
    },
  });

  // Stats
  const stats = {
    ok: supplies.filter(s => s.status === "ok").length,
    low: supplies.filter(s => s.status === "low").length,
    critical: supplies.filter(s => s.status === "critical").length,
    ordered: supplies.filter(s => s.status === "ordered").length,
  };

  return {
    supplies,
    recommendations,
    stats,
    isLoading,
    generateOrder: generateOrder.mutate,
  };
}
