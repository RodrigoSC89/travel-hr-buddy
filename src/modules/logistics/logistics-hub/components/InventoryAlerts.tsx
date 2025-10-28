// @ts-nocheck
// PATCH 281: Logistics Hub - Inventory Restock Alerts
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
  id: string;
  item_name: string;
  quantity: number;
  min_stock_level: number;
  unit: string;
  location: string;
}

export const InventoryAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLowStockItems();
    
    // Subscribe to inventory changes
    const channel = supabase
      .channel("inventory_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logistics_inventory"
        },
        () => {
          loadLowStockItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadLowStockItems = async () => {
    try {
      const { data, error } = await supabase
        .from("logistics_inventory")
        .select("*")
        .lte("quantity", supabase.raw("min_stock_level"))
        .order("quantity", { ascending: true });

      if (error) throw error;
      setLowStockItems(data || []);
      
      // Show toast if there are new alerts
      if (data && data.length > 0) {
        toast({
          title: "⚠️ Low Stock Alert",
          description: `${data.length} items need restocking`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error loading low stock items:", error);
    } finally {
      setLoading(false);
    }
  };

  const createRestockOrder = async (item: InventoryItem) => {
    try {
      const { error } = await supabase
        .from("logistics_supply_orders")
        .insert({
          order_number: `RST-${Date.now()}`,
          item_id: item.id,
          quantity: item.min_stock_level * 2 - item.quantity,
          status: "pending",
          priority: "high",
          notes: `Auto-generated restock order for ${item.item_name}`,
        });

      if (error) throw error;

      toast({
        title: "✅ Restock Order Created",
        description: `Order created for ${item.item_name}`,
      });

      loadLowStockItems();
    } catch (error: any) {
      toast({
        title: "Error creating order",
        description: error.message,
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
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts ({lowStockItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
            >
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">{item.item_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Location: {item.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant="destructive">
                    {item.quantity} {item.unit}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Min: {item.min_stock_level} {item.unit}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => createRestockOrder(item)}
                >
                  Create Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
