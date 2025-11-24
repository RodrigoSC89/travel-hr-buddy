// PATCH 391: Inventory Alerts with Automatic Reorder at 25% (critical) and 50% (low) thresholds
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, TrendingDown, AlertCircle, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type LogisticsInventoryRow = Database["public"]["Tables"]["logistics_inventory"]["Row"];
type SupplyOrderInsert = Database["public"]["Tables"]["logistics_supply_orders"]["Insert"];

type InventoryItem = LogisticsInventoryRow & {
  reorder_level?: number | null;
};

type AlertLevel = "critical" | "low" | "normal";
type XLSXModule = typeof import("xlsx");

// Lazy load XLSX apenas quando necessário (exportação)
let XLSX: XLSXModule | null = null;
const loadXLSX = async (): Promise<XLSXModule> => {
  if (!XLSX) {
    XLSX = await import("xlsx");
  }
  return XLSX;
};

const MIN_AUTOMATION_QUANTITY = 10;

const getThresholdBaseline = (item: InventoryItem): number => {
  const reorderLevel = typeof item.reorder_level === "number" && item.reorder_level > 0
    ? item.reorder_level
    : null;
  if (reorderLevel) {
    return reorderLevel;
  }
  return typeof item.min_stock_level === "number" ? Math.max(item.min_stock_level, 0) : 0;
};

const calculateStockPercentage = (item: InventoryItem): number | null => {
  const baseline = getThresholdBaseline(item);
  if (baseline <= 0) {
    return null;
  }
  return Math.round((item.quantity / baseline) * 100);
};

const formatStockPercentage = (item: InventoryItem): string => {
  const percentage = calculateStockPercentage(item);
  return percentage === null ? "N/A" : `${percentage}%`;
};

const InventoryAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { toast } = useToast();

  // PATCH 391: Calculate alert level based on thresholds
  const getAlertLevel = useCallback((item: InventoryItem): AlertLevel => {
    const baseline = getThresholdBaseline(item);
    if (baseline <= 0) {
      return "normal";
    }

    const ratio = item.quantity / baseline;
    if (ratio <= 0.25) {
      return "critical"; // ≤25% - Critical
    }
    if (ratio <= 0.5) {
      return "low"; // ≤50% - Low
    }

    return "normal";
  }, []);

  const loadLowStockItems = useCallback(async (withSpinner = false): Promise<void> => {
    if (withSpinner) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from("logistics_inventory")
        .select("*")
        .or("quantity.lte.reorder_level,quantity.lte.min_stock_level")
        .order("quantity", { ascending: true });

      if (error) {
        console.warn("Inventory table unavailable, falling back to mock data", error);
        const now = new Date().toISOString();
        const mockItems: InventoryItem[] = [
          {
            id: "1",
            item_code: "SH-001",
            item_name: "Safety Helmets",
            quantity: 15,
            reorder_level: 100,
            min_stock_level: 20,
            unit: "units",
            location: "Warehouse A",
            category: "Safety",
            created_at: now,
            updated_at: now,
            organization_id: null,
            supplier: null,
            unit_price: null,
            last_restocked_at: null,
          },
          {
            id: "2",
            item_code: "LJ-002",
            item_name: "Life Jackets",
            quantity: 45,
            reorder_level: 200,
            min_stock_level: 50,
            unit: "units",
            location: "Warehouse B",
            category: "Safety",
            created_at: now,
            updated_at: now,
            organization_id: null,
            supplier: null,
            unit_price: null,
            last_restocked_at: null,
          }
        ];
        setLowStockItems(mockItems);
        setLastSyncedAt(new Date());
        return;
      }

      const typedItems: InventoryItem[] = (data ?? []).map((item) => ({
        ...item,
      }));
      setLowStockItems(typedItems);
      setLastSyncedAt(new Date());

      // Show toast if there are critical alerts
      const criticalItems = typedItems.filter((item) => getAlertLevel(item) === "critical");
      if (criticalItems.length > 0) {
        toast({
          title: "🚨 Critical Stock Alert",
          description: `${criticalItems.length} items at critical level (≤25%)`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading low stock items:", error);
      const message = error instanceof Error ? error.message : "Unable to reach inventory service";
      toast({
        title: "Inventory load failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      if (withSpinner) {
        setLoading(false);
      }
    }
  }, [getAlertLevel, toast]);

  // PATCH 391: Automatic reorder requests
  const handleAutoReorder = useCallback(async (item: InventoryItem, level: AlertLevel) => {
    if (level === "normal") return;
    const baseline = getThresholdBaseline(item);
    if (baseline <= 0) return;
    
    try {
      const reorderQuantity = Math.max(MIN_AUTOMATION_QUANTITY, baseline * 2 - item.quantity);
      if (reorderQuantity <= 0) {
        return;
      }

      const stockPercentageLabel = formatStockPercentage(item);
      const payload: SupplyOrderInsert = {
        order_number: `AUTO-${Date.now()}-${item.id.slice(0, 4)}`,
        item_id: item.id,
        quantity: reorderQuantity,
        status: "pending",
        priority: level === "critical" ? "high" : "medium",
        notes: `Auto-generated reorder for ${item.item_name} (${level} level - ${stockPercentageLabel})`
      };

      const { error } = await supabase
        .from("logistics_supply_orders")
        .insert(payload);

      if (error) throw error;

      toast({
        title: "🔄 Auto-Reorder Triggered",
        description: `${reorderQuantity} ${item.unit} of ${item.item_name}`,
      });
    } catch (error) {
      console.error("Error creating auto-reorder:", error);
      const message = error instanceof Error ? error.message : "Unable to create auto-reorder";
      toast({
        title: "Auto-reorder failed",
        description: message,
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadLowStockItems(true);
    
    // PATCH 391: Real-time inventory monitoring via Supabase subscriptions
    const channel = supabase
      .channel("inventory_alerts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logistics_inventory"
        },
  (payload: RealtimePostgresChangesPayload<LogisticsInventoryRow>) => {
          loadLowStockItems();
          
          // PATCH 391: Automatic reorder logic
          if (payload.new) {
            const item = payload.new as InventoryItem;
            const alertLevel = getAlertLevel(item);
            
            if (alertLevel === "critical" || alertLevel === "low") {
              // Trigger automatic reorder
              handleAutoReorder(item, alertLevel);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getAlertLevel, handleAutoReorder, loadLowStockItems]);

  const getAlertBadge = (level: AlertLevel) => {
    const config = {
      critical: { color: "bg-red-500", label: "Critical", icon: AlertCircle },
      low: { color: "bg-orange-500", label: "Low", icon: AlertTriangle },
      normal: { color: "bg-green-500", label: "Normal", icon: Package }
    };
    
    const { color, label, icon: Icon } = config[level];
    
    return (
      <Badge className={`${color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  // PATCH 391: Export to Excel/CSV functionality
  const exportToExcel = async () => {
    try {
      const exportData = lowStockItems.map(item => ({
        "Item Name": item.item_name,
        "Current Qty": item.quantity,
        "Reorder Level": getThresholdBaseline(item),
        "Min Stock": item.min_stock_level,
        "Unit": item.unit,
        "Location": item.location,
        "Alert Level": getAlertLevel(item),
        "Stock %": formatStockPercentage(item),
        "Category": item.category || "N/A"
      }));

      // Carregar XLSX apenas quando exportar
      const xlsxLib = await loadXLSX();
      const worksheet = xlsxLib.utils.json_to_sheet(exportData);
      const workbook = xlsxLib.utils.book_new();
      xlsxLib.utils.book_append_sheet(workbook, worksheet, "Inventory Alerts");
      
      xlsxLib.writeFile(workbook, `inventory-alerts-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
      
      toast({
        title: "Export successful",
        description: "Inventory alerts exported to Excel"
      });
    } catch (error) {
      console.error("Error exporting:", error);
      const message = error instanceof Error ? error.message : "Unable to export data";
      toast({
        title: "Export failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ["Item Name", "Current Qty", "Reorder Level", "Min Stock", "Unit", "Location", "Alert Level", "Stock %"];
      const rows = lowStockItems.map(item => [
        item.item_name,
        item.quantity,
        getThresholdBaseline(item),
        item.min_stock_level,
        item.unit,
        item.location,
        getAlertLevel(item),
        formatStockPercentage(item)
      ]);
      
      // PATCH 540: Otimização - pré-processar linhas CSV
      const csvRows = rows.map(row => row.map(cell => `"${cell}"`).join(","));
      const csvContent = [headers.join(","), ...csvRows].join("\n");
      
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `inventory-alerts-${format(new Date(), "yyyy-MM-dd")}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Inventory alerts exported to CSV"
      });
    } catch (error) {
      console.error("Error exporting:", error);
      const message = error instanceof Error ? error.message : "Unable to export data";
      toast({
        title: "Export failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  const createRestockOrder = async (item: InventoryItem) => {
    const baseline = Math.max(getThresholdBaseline(item), item.min_stock_level);
    const desiredQuantity = Math.max(baseline * 2 - item.quantity, 0);

    if (desiredQuantity <= 0) {
      toast({
        title: "Stock already sufficient",
        description: `${item.item_name} is above the reorder target`,
      });
      return;
    }

    try {
      const payload: SupplyOrderInsert = {
        order_number: `RST-${Date.now()}`,
        item_id: item.id,
        quantity: desiredQuantity,
        status: "pending",
        priority: "high",
        notes: `Auto-generated restock order for ${item.item_name}`,
      };

      const { error } = await supabase
        .from("logistics_supply_orders")
        .insert(payload);

      if (error) throw error;

      toast({
        title: "✅ Restock Order Created",
        description: `Order created for ${item.item_name}`,
      });

      await loadLowStockItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create restock order";
      toast({
        title: "Error creating order",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading alerts...</div>;
  }

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-500" />
            Inventory Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ✅ All inventory levels are above minimum thresholds
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts ({lowStockItems.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              Export CSV
            </Button>
            <Button onClick={exportToExcel} variant="outline" size="sm">
              Export Excel
            </Button>
          </div>
        </div>
        {lastSyncedAt && (
          <p className="text-xs text-muted-foreground mt-2">
            Last synced: {format(lastSyncedAt, "HH:mm:ss")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => {
            const alertLevel = getAlertLevel(item);
            const thresholdBaseline = getThresholdBaseline(item);
            const stockPercentage = calculateStockPercentage(item);
            
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                  alertLevel === "critical" ? "border-red-300" : "border-orange-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <TrendingDown className={`h-5 w-5 ${alertLevel === "critical" ? "text-red-600" : "text-orange-600"}`} />
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Location: {item.location || "N/A"} | Category: {item.category || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getAlertBadge(alertLevel)}
                  <div className="text-right">
                    <Badge variant={alertLevel === "critical" ? "destructive" : "secondary"}>
                      {item.quantity} / {thresholdBaseline || 0} {item.unit}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stockPercentage === null
                        ? "Reorder threshold not set"
                        : `${stockPercentage}% of reorder level`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={alertLevel === "critical" ? "destructive" : "default"}
                    onClick={() => createRestockOrder(item)}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Reorder
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryAlerts;
