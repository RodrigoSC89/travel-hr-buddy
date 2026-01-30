/**
 * Hook para Inventário Real - dados do Supabase
 * Substitui mockInventory e mockMovements em InventorySection
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lot: string;
  expiryDate: string | null;
  lastMovement: string;
  unitCost: number;
  status: "ok" | "low" | "critical" | "excess";
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "adjustment" | "transfer";
  quantity: number;
  reason: string;
  user: string;
  date: string;
  reference: string;
}

function calculateStatus(quantity: number, minStock: number, maxStock: number): InventoryItem["status"] {
  if (quantity <= minStock * 0.5) return "critical";
  if (quantity <= minStock) return "low";
  if (quantity >= maxStock) return "excess";
  return "ok";
}

export function useInventoryItems(searchQuery = "", filterCategory = "all", filterStatus = "all") {
  return useQuery({
    queryKey: ["inventory-items", searchQuery, filterCategory, filterStatus],
    queryFn: async (): Promise<InventoryItem[]> => {
      let query = supabase
        .from("inventory_items")
        .select("*")
        .order("name", { ascending: true });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,item_code.ilike.%${searchQuery}%`);
      }

      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory);
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;

      if (!data || data.length === 0) {
        return generateDemoInventory();
      }

      return data.map((item) => {
        const minStock = item.min_quantity || 10;
        const maxStock = item.max_quantity || 100;
        const quantity = item.quantity || 0;

        return {
          id: item.id,
          sku: item.item_code || item.id.slice(0, 10).toUpperCase(),
          name: item.name || "Item",
          category: item.category || "Geral",
          quantity,
          minStock,
          maxStock,
          unit: item.unit || "un",
          location: item.location || "A1-01",
          lot: `L${new Date().getFullYear()}-${item.id.slice(0, 3)}`,
          expiryDate: null,
          lastMovement: item.updated_at?.split("T")[0] || new Date().toISOString().split("T")[0],
          unitCost: item.unit_cost || 0,
          status: calculateStatus(quantity, minStock, maxStock),
        };
      }).filter(item => filterStatus === "all" || item.status === filterStatus);
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock-movements"],
    queryFn: async (): Promise<StockMovement[]> => {
      // Use logs table for inventory movements
      const { data: logs, error } = await supabase
        .from("logs")
        .select("*")
        .eq("module", "inventory")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error || !logs || logs.length === 0) {
        return generateDemoMovements();
      }

      return logs.map((log) => {
        const metadata = log.metadata as Record<string, unknown> || {};
        return {
          id: log.id,
          itemId: (metadata.item_id as string) || "",
          itemName: (metadata.item_name as string) || log.message || "Item",
          type: inferMovementType(log.level),
          quantity: (metadata.quantity as number) || 0,
          reason: log.message || "Movimentação",
          user: (metadata.user as string) || "Sistema",
          date: log.created_at,
          reference: (metadata.reference as string) || log.id.slice(0, 8),
        };
      });
    },
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}

function inferMovementType(level: string | null): StockMovement["type"] {
  if (level === "info") return "in";
  if (level === "warning") return "out";
  return "adjustment";
}

export function useInventoryMutations() {
  const queryClient = useQueryClient();

  const addItem = useMutation({
    mutationFn: async (item: Omit<InventoryItem, "id" | "status" | "lastMovement">) => {
      const { data, error } = await supabase.from("inventory_items").insert({
        item_code: item.sku,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        min_quantity: item.minStock,
        max_quantity: item.maxStock,
        unit: item.unit,
        location: item.location,
        unit_cost: item.unitCost,
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      toast.success("Item adicionado ao estoque!");
    },
    onError: () => toast.error("Erro ao adicionar item"),
  });

  const recordMovement = useMutation({
    mutationFn: async (movement: {
      itemId: string;
      type: StockMovement["type"];
      quantity: number;
      reason: string;
      reference: string;
    }) => {
      // Update inventory quantity
      const { data: item } = await supabase
        .from("inventory_items")
        .select("quantity")
        .eq("id", movement.itemId)
        .single();

      const currentQty = item?.quantity || 0;
      const newQty = movement.type === "in" 
        ? currentQty + movement.quantity
        : movement.type === "out"
        ? currentQty - movement.quantity
        : currentQty + movement.quantity;

      await supabase
        .from("inventory_items")
        .update({ quantity: newQty })
        .eq("id", movement.itemId);

      // Log the movement
      await supabase.from("logs").insert({
        module: "inventory",
        level: movement.type === "in" ? "info" : movement.type === "out" ? "warning" : "debug",
        message: `${movement.type === "in" ? "Entrada" : movement.type === "out" ? "Saída" : "Ajuste"}: ${movement.reason}`,
        metadata: {
          item_id: movement.itemId,
          quantity: movement.quantity,
          type: movement.type,
          reference: movement.reference,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Movimentação registrada!");
    },
    onError: () => toast.error("Erro ao registrar movimentação"),
  });

  return { addItem, recordMovement };
}

export function useInventoryStats() {
  const { data: items } = useInventoryItems();

  const totalValue = (items || []).reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const criticalItems = (items || []).filter((i) => i.status === "critical").length;
  const lowItems = (items || []).filter((i) => i.status === "low").length;
  const totalSkus = (items || []).length;
  const categories = [...new Set((items || []).map((i) => i.category))];

  return { totalValue, criticalItems, lowItems, totalSkus, categories };
}

function generateDemoInventory(): InventoryItem[] {
  return [
    { id: "demo-1", sku: "FIL-OLE-001", name: "Filtro de óleo hidráulico", category: "Manutenção", quantity: 5, minStock: 10, maxStock: 50, unit: "un", location: "A1-01", lot: "L2024-001", expiryDate: "2025-06-15", lastMovement: new Date().toISOString().split("T")[0], unitCost: 450, status: "critical" },
    { id: "demo-2", sku: "VAL-SEG-002", name: "Válvula de segurança DP", category: "DP System", quantity: 3, minStock: 5, maxStock: 15, unit: "un", location: "B2-03", lot: "L2024-002", expiryDate: null, lastMovement: new Date().toISOString().split("T")[0], unitCost: 6400, status: "low" },
    { id: "demo-3", sku: "OLE-LUB-004", name: "Óleo lubrificante 15W40", category: "Consumíveis", quantity: 280, minStock: 100, maxStock: 300, unit: "L", location: "D1-01", lot: "L2024-010", expiryDate: "2025-03-01", lastMovement: new Date().toISOString().split("T")[0], unitCost: 44.5, status: "ok" },
  ];
}

function generateDemoMovements(): StockMovement[] {
  return [
    { id: "demo-m1", itemId: "demo-3", itemName: "Óleo lubrificante 15W40", type: "in", quantity: 100, reason: "Recebimento PO-2024-004", user: "Carlos Silva", date: new Date().toISOString(), reference: "REC-2024-042" },
    { id: "demo-m2", itemId: "demo-1", itemName: "Filtro de óleo hidráulico", type: "out", quantity: 3, reason: "Consumo manutenção", user: "João Santos", date: new Date().toISOString(), reference: "OS-2024-089" },
  ];
}
