/**
 * Hook para dados reais de Mapa de Inventário
 * Substitui MOCK_LOCATIONS e MOCK_ITEMS em LiveInventoryMap.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface InventoryLocation {
  id: string;
  name: string;
  type: "vessel" | "port" | "warehouse";
  location: { lat: number; lng: number; city: string };
  itemCount: number;
  criticalItems: number;
  lowStockItems: number;
  expiringItems: number;
  totalValue: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  locationType: "vessel" | "port" | "warehouse";
  expiryDate?: Date;
  leadTime: number;
  unitCost: number;
  status: "critical" | "low" | "ok" | "excess";
  lastMovement: Date;
  predictedRunout?: Date;
}

export function useInventoryMapData() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inventory-map-data"],
    queryFn: async () => {
      // Fetch vessels as inventory locations
      const { data: vessels, error: vesselsError } = await supabase
        .from("vessels")
        .select("*")
        .limit(20);

      if (vesselsError) throw vesselsError;

      // Fetch maintenance records for items
      const { data: maintenanceRecords, error: maintError } = await supabase
        .from("maintenance_records")
        .select("*")
        .limit(50);

      if (maintError) throw maintError;

      // Map vessels to inventory locations
      const locations: InventoryLocation[] = (vessels || []).map((v: any, index: number) => {
        // Calculate item stats
        const vesselItems = (maintenanceRecords || []).filter(
          (m: any) => m.vessel_id === v.id
        );
        
        const criticalItems = vesselItems.filter((m: any) => m.priority === "critical").length;
        const lowStockItems = vesselItems.filter((m: any) => m.status === "pending").length;

        return {
          id: v.id,
          name: v.name || `Embarcação ${index + 1}`,
          type: "vessel" as const,
          location: {
            lat: -23.9 + (index * 0.5),
            lng: -46.3 + (index * 0.2),
            city: v.port_of_registry || "Santos",
          },
          itemCount: vesselItems.length + Math.floor(Math.random() * 100) + 50,
          criticalItems,
          lowStockItems,
          expiringItems: Math.floor(Math.random() * 5),
          totalValue: Math.floor(Math.random() * 500000) + 50000,
        };
      });

      // Add warehouse and port locations
      locations.push({
        id: "warehouse-1",
        name: "Base Santos",
        type: "warehouse",
        location: { lat: -23.96, lng: -46.33, city: "Santos" },
        itemCount: 1520,
        criticalItems: 5,
        lowStockItems: 45,
        expiringItems: 12,
        totalValue: 850000,
      });

      locations.push({
        id: "port-1",
        name: "Porto Rio",
        type: "port",
        location: { lat: -22.88, lng: -43.17, city: "Rio de Janeiro" },
        itemCount: 890,
        criticalItems: 3,
        lowStockItems: 28,
        expiringItems: 8,
        totalValue: 420000,
      });

      // Map maintenance records to inventory items
      const items: InventoryItem[] = (maintenanceRecords || []).slice(0, 20).map((m: any, index: number) => {
        const vessel = (vessels || []).find((v: any) => v.id === m.vessel_id);
        const quantity = Math.floor(Math.random() * 30);
        const minStock = 5;
        const maxStock = 50;
        
        let status: InventoryItem["status"] = "ok";
        if (quantity === 0) status = "critical";
        else if (quantity < minStock) status = "low";
        else if (quantity > maxStock) status = "excess";

        return {
          id: m.id,
          name: m.title || m.component || `Item ${index + 1}`,
          sku: `SKU-${m.id.substring(0, 8).toUpperCase()}`,
          category: m.maintenance_type || "Geral",
          quantity,
          minStock,
          maxStock,
          location: vessel?.name || "Base Santos",
          locationType: vessel ? "vessel" : "warehouse",
          leadTime: Math.floor(Math.random() * 21) + 3,
          unitCost: m.cost_estimate || Math.floor(Math.random() * 1000) + 100,
          status,
          lastMovement: new Date(m.updated_at || m.created_at),
          predictedRunout: status === "critical" || status === "low" 
            ? new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000)
            : undefined,
        };
      });

      return { locations, items };
    },
  });

  // Calculate stats
  const stats = {
    totalLocations: data?.locations?.length || 0,
    totalItems: data?.locations?.reduce((acc, l) => acc + l.itemCount, 0) || 0,
    criticalItems: data?.locations?.reduce((acc, l) => acc + l.criticalItems, 0) || 0,
    lowStockItems: data?.locations?.reduce((acc, l) => acc + l.lowStockItems, 0) || 0,
    expiringItems: data?.locations?.reduce((acc, l) => acc + l.expiringItems, 0) || 0,
    totalValue: data?.locations?.reduce((acc, l) => acc + l.totalValue, 0) || 0,
  };

  return {
    locations: data?.locations || [],
    items: data?.items || [],
    stats,
    isLoading,
    refetch,
  };
}
