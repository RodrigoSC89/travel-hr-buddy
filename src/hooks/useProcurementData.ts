/**
 * useProcurementData - Real Supabase data for Procurement & Inventory
 * Replaces all mock data with real queries
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InventoryItem {
  id: string;
  item_code: string;
  name: string;
  description: string | null;
  category: string;
  unit: string;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  unit_cost: number;
  currency: string;
  location: string | null;
  supplier_name: string | null;
  is_critical: boolean;
  status: string;
  vessel_id: string | null;
}

export interface ProcurementOrder {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  priority: string;
  supplier_name: string | null;
  delivery_port: string | null;
  delivery_date: string | null;
  total_amount: number;
  currency: string;
  items: any;
  created_at: string;
}

export interface Supplier {
  id: string;
  company_name: string;
  category: string[] | null;
  contact_name: string | null;
  contact_email: string | null;
  rating: number | null;
  total_orders: number;
  total_value: number;
  lead_time_days: number | null;
  country: string | null;
}

export interface ProcurementStats {
  totalItems: number;
  lowStockItems: number;
  criticalItems: number;
  activeOrders: number;
  totalOrderValue: number;
  totalSuppliers: number;
  avgLeadTime: number;
  budgetUsed: number;
  budgetTotal: number;
}

export function useProcurementData() {
  const queryClient = useQueryClient();

  const inventoryQuery = useQuery({
    queryKey: ["procurement-inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("name")
        .limit(200);
      if (error) throw error;
      return (data || []) as InventoryItem[];
    },
    staleTime: 1000 * 60 * 3,
  });

  const ordersQuery = useQuery({
    queryKey: ["procurement-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("procurement_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as ProcurementOrder[];
    },
    staleTime: 1000 * 60 * 3,
  });

  const suppliersQuery = useQuery({
    queryKey: ["procurement-suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("company_name")
        .limit(100);
      if (error) throw error;
      return (data || []) as Supplier[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const items = inventoryQuery.data || [];
  const orders = ordersQuery.data || [];
  const suppliers = suppliersQuery.data || [];

  const stats: ProcurementStats = {
    totalItems: items.length,
    lowStockItems: items.filter((i) => i.quantity <= i.min_quantity).length,
    criticalItems: items.filter((i) => i.is_critical && i.quantity <= i.min_quantity).length,
    activeOrders: orders.filter((o) => !["delivered", "cancelled", "closed"].includes(o.status)).length,
    totalOrderValue: orders.reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    totalSuppliers: suppliers.length,
    avgLeadTime: suppliers.length > 0
      ? Math.round(suppliers.reduce((s, sup) => s + (sup.lead_time_days || 0), 0) / suppliers.length)
      : 0,
    budgetUsed: orders
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + (Number(o.total_amount) || 0), 0),
    budgetTotal: 500000,
  };

  const lowStockAlerts = items
    .filter((i) => i.quantity <= i.min_quantity)
    .map((i) => ({
      item: i.name,
      current: Number(i.quantity),
      min: Number(i.min_quantity),
      status: i.quantity <= i.min_quantity * 0.5 ? "critical" : "warning",
      category: i.category,
    }))
    .slice(0, 10);

  const spendingByCategory = items.reduce((acc: Record<string, number>, item) => {
    const cat = item.category || "Outros";
    acc[cat] = (acc[cat] || 0) + Number(item.quantity) * Number(item.unit_cost);
    return acc;
  }, {});

  const categoryData = Object.entries(spendingByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], idx) => ({
      name,
      value: Math.round(value),
      color: [`hsl(var(--primary))`, `hsl(var(--chart-2))`, `hsl(var(--chart-3))`, `hsl(var(--chart-4))`, `hsl(var(--chart-5))`][idx] || `hsl(var(--muted))`,
    }));

  const createOrder = useMutation({
    mutationFn: async (order: Partial<ProcurementOrder>) => {
      const { data, error } = await supabase
        .from("procurement_orders")
        .insert({
          order_number: `PO-${Date.now().toString().slice(-6)}`,
          order_type: order.order_type || "standard",
          status: "pending",
          priority: order.priority || "medium",
          supplier_name: order.supplier_name,
          delivery_port: order.delivery_port,
          total_amount: order.total_amount || 0,
          currency: order.currency || "USD",
          items: order.items || [],
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["procurement-orders"] });
    },
    onError: () => toast.error("Erro ao criar pedido"),
  });

  const updateInventory = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { error } = await supabase
        .from("inventory_items")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item atualizado!");
      queryClient.invalidateQueries({ queryKey: ["procurement-inventory"] });
    },
    onError: () => toast.error("Erro ao atualizar item"),
  });

  return {
    items,
    orders,
    suppliers,
    stats,
    lowStockAlerts,
    categoryData,
    isLoading: inventoryQuery.isLoading || ordersQuery.isLoading,
    createOrder,
    updateInventory,
    refetch: () => {
      inventoryQuery.refetch();
      ordersQuery.refetch();
      suppliersQuery.refetch();
    },
  };
}
