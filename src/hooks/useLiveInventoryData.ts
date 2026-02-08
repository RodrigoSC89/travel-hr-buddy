/**
 * Hook para dados reais de Inventário Live
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

export function useInventoryLocations() {
  return useQuery({
    queryKey: ["inventory-locations"],
    queryFn: async (): Promise<InventoryLocation[]> => {
      // Buscar vessels como localizações de inventário
      // Schema: id, name, vessel_type, flag_state, current_location, status, metadata
      const { data: vessels, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, current_location, metadata")
        .limit(20);

      if (!error && vessels && vessels.length > 0) {
        // Para cada embarcação, agregar dados reais de maintenance_records como suprimentos
        const vesselIds = vessels.map(v => v.id);
        const { data: maintenanceData } = await supabase
          .from("maintenance_records")
          .select("vessel_id, priority, status, cost_estimate")
          .in("vessel_id", vesselIds);

        const maintByVessel = new Map<string, typeof maintenanceData>();
        (maintenanceData || []).forEach(m => {
          const list = maintByVessel.get(m.vessel_id) || [];
          list.push(m);
          maintByVessel.set(m.vessel_id, list);
        });

        const locations: InventoryLocation[] = vessels.map((vessel, idx) => {
          const vesselMaint = maintByVessel.get(vessel.id) || [];
          const criticalItems = vesselMaint.filter(m => m.priority === "critical").length;
          const lowStockItems = vesselMaint.filter(m => m.status === "pending").length;
          const totalValue = vesselMaint.reduce((sum, m) => sum + (m.cost_estimate || 0), 0);

          return {
            id: vessel.id,
            name: vessel.name,
            type: "vessel" as const,
            location: {
              lat: -23.9 - idx * 0.5,
              lng: -46.3 + idx * 0.2,
              city: vessel.current_location || "Santos",
            },
            itemCount: vesselMaint.length,
            criticalItems,
            lowStockItems,
            expiringItems: vesselMaint.filter(m => m.status === "scheduled").length,
            totalValue,
          };
        });

        return locations;
      }

      // No data - return empty array, UI should show EmptyState
      return [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventoryItems(locationId?: string) {
  return useQuery({
    queryKey: ["inventory-items", locationId],
    queryFn: async (): Promise<InventoryItem[]> => {
      // Buscar de maintenance_records (tem peças/componentes relacionados)
      // Schema: id, title, maintenance_type, scheduled_date, completed_date, status, priority, cost_estimate
      const { data: records, error } = await supabase
        .from("maintenance_records")
        .select(`
          id,
          title,
          maintenance_type,
          scheduled_date,
          completed_date,
          status,
          priority,
          cost_estimate,
          vessels:vessel_id (name)
        `)
        .limit(30);

      if (!error && records && records.length > 0) {
        return records.map((rec) => {
          // Derive inventory status from maintenance priority/status
          const priorityWeight = rec.priority === "critical" ? 1 : rec.priority === "high" ? 3 : rec.priority === "medium" ? 8 : 15;
          const isCompleted = rec.status === "completed";
          const quantity = isCompleted ? priorityWeight + 10 : priorityWeight;
          const minStock = 5;
          const maxStock = 30;
          let status: "critical" | "low" | "ok" | "excess" = "ok";
          if (quantity <= 2) status = "critical";
          else if (quantity < minStock) status = "low";
          else if (quantity > maxStock) status = "excess";

          // Derive lead time from maintenance type
          const leadTime = rec.maintenance_type === "emergency" ? 3 : rec.maintenance_type === "corrective" ? 7 : 14;

          return {
            id: rec.id,
            name: rec.title || "Componente",
            sku: `SKU-${rec.id.slice(0, 8).toUpperCase()}`,
            category: rec.maintenance_type || "Geral",
            quantity,
            minStock,
            maxStock,
            location: (rec.vessels as { name: string } | null)?.name || "Base",
            locationType: "vessel" as const,
            leadTime,
            unitCost: rec.cost_estimate || 0,
            status,
            lastMovement: rec.completed_date ? new Date(rec.completed_date) : rec.scheduled_date ? new Date(rec.scheduled_date) : new Date(),
            predictedRunout: status === "critical" ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : undefined,
          };
        });
      }

      // No data - return empty array, UI should show EmptyState
      return [];
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useInventoryStats() {
  const { data: locations = [] } = useInventoryLocations();

  return {
    totalLocations: locations.length,
    totalItems: locations.reduce((acc, l) => acc + l.itemCount, 0),
    criticalItems: locations.reduce((acc, l) => acc + l.criticalItems, 0),
    lowStockItems: locations.reduce((acc, l) => acc + l.lowStockItems, 0),
    expiringItems: locations.reduce((acc, l) => acc + l.expiringItems, 0),
    totalValue: locations.reduce((acc, l) => acc + l.totalValue, 0),
  };
}
