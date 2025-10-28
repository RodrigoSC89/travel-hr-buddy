// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, AlertTriangle, Package, CheckCircle, Ship } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlertItem {
  id: string;
  item_name: string;
  current_quantity: number;
  reorder_level: number;
  unit: string;
  location: string;
  vessel_name?: string;
  status: 'critical' | 'low' | 'normal';
  last_restock_date?: string;
}

export const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    
    // Set up real-time subscription for inventory changes
    const subscription = supabase
      .channel('inventory_alerts')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'logistics_inventory' 
        }, 
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("logistics_inventory")
        .select("*");

      if (error) throw error;

      // Calculate alert status for each item
      const alertItems = (data || []).map(item => {
        const percentage = (item.quantity / item.reorder_level) * 100;
        let status: 'critical' | 'low' | 'normal';
        
        if (percentage <= 25) {
          status = 'critical';
        } else if (percentage <= 50) {
          status = 'low';
        } else {
          status = 'normal';
        }

        return {
          id: item.id,
          item_name: item.item_name,
          current_quantity: item.quantity,
          reorder_level: item.reorder_level,
          unit: item.unit,
          location: item.location,
          vessel_name: item.vessel_name,
          status,
          last_restock_date: item.last_updated
        };
      }).filter(item => item.status !== 'normal'); // Only show items that need attention

      setAlerts(alertItems.sort((a, b) => {
        // Sort critical first, then low
        if (a.status === 'critical' && b.status !== 'critical') return -1;
        if (a.status !== 'critical' && b.status === 'critical') return 1;
        return 0;
      }));
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load inventory alerts");
    } finally {
      setLoading(false);
    }
  };

  const createReorderRequest = async (item: AlertItem) => {
    try {
      const { error } = await supabase
        .from("logistics_requests")
        .insert({
          material_name: item.item_name,
          quantity: item.reorder_level * 2, // Order double the reorder level
          unit: item.unit,
          priority: item.status === 'critical' ? 'urgent' : 'high',
          status: 'pending',
          requested_by: 'System (Auto-restock)',
          notes: `Automatic restock request - Current quantity: ${item.current_quantity} ${item.unit}, Below reorder level: ${item.reorder_level} ${item.unit}`,
          vessel_name: item.vessel_name
        });

      if (error) throw error;

      toast.success(`Reorder request created for ${item.item_name}`);
      
      // Mark as acknowledged in alerts
      const updatedAlerts = alerts.filter(a => a.id !== item.id);
      setAlerts(updatedAlerts);
    } catch (error) {
      console.error("Error creating reorder request:", error);
      toast.error("Failed to create reorder request");
    }
  };

  const dismissAlert = async (itemId: string) => {
    setAlerts(alerts.filter(a => a.id !== itemId));
    toast.success("Alert dismissed");
  };

  const getAlertIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'low':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      default:
        return <Package className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'low':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getAlertBadgeColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading alerts...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>Automatic restock notifications for low inventory items</CardDescription>
          </div>
          {alerts.length > 0 && (
            <Badge variant="destructive">
              {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              All inventory levels are adequate. No restock alerts at this time.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.status)}>
                <div className="flex items-start gap-3">
                  {getAlertIcon(alert.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{alert.item_name}</h4>
                      <Badge className={`${getAlertBadgeColor(alert.status)} text-white text-xs`}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </div>
                    <AlertDescription className="space-y-1">
                      <div className="flex items-center gap-4 text-sm">
                        <span>
                          <strong>Current:</strong> {alert.current_quantity} {alert.unit}
                        </span>
                        <span>
                          <strong>Reorder Level:</strong> {alert.reorder_level} {alert.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {alert.location}
                        </span>
                        {alert.vessel_name && (
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {alert.vessel_name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {alert.status === 'critical' 
                          ? '⚠️ Critical: Immediate action required'
                          : '⚡ Low stock: Consider reordering soon'}
                      </div>
                    </AlertDescription>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => createReorderRequest(alert)}
                        className={alert.status === 'critical' ? 'bg-red-600 hover:bg-red-700' : ''}
                      >
                        Create Reorder Request
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissAlert(alert.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
