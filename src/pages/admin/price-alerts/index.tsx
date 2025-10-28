/**
 * PATCH 403 - Price Alerts Dashboard
 * Complete price alerts system with UI, dashboard, and intelligent rules
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Plus,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Settings,
  History,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface PriceAlert {
  id: string;
  product_name: string;
  target_price: number;
  current_price: number | null;
  product_url: string;
  route: string | null;
  travel_date: string | null;
  is_active: boolean;
  notification_email: boolean;
  notification_push: boolean;
  notification_frequency: string;
  created_at: string;
  last_checked_at: string | null;
}

interface AlertHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
}

const PriceAlertsPage = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<PriceAlert | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    product_name: "",
    target_price: "",
    product_url: "",
    route: "",
    travel_date: "",
    notification_email: true,
    notification_push: true,
    notification_frequency: "immediate",
  });

  useEffect(() => {
    loadAlerts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel("price_alerts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "price_alerts",
        },
        () => {
          loadAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAlerts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error("Error loading alerts:", error);
      toast({
        title: "Error loading alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from("price_alert_history")
        .select("*")
        .eq("alert_id", alertId)
        .order("checked_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      console.error("Error loading history:", error);
    }
  };

  const createAlert = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("price_alerts").insert({
        user_id: user.id,
        product_name: formData.product_name,
        target_price: parseFloat(formData.target_price),
        product_url: formData.product_url,
        route: formData.route || null,
        travel_date: formData.travel_date || null,
        notification_email: formData.notification_email,
        notification_push: formData.notification_push,
        notification_frequency: formData.notification_frequency,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: "✅ Alert Created",
        description: "Price alert has been created successfully",
      });

      setShowNewAlert(false);
      setFormData({
        product_name: "",
        target_price: "",
        product_url: "",
        route: "",
        travel_date: "",
        notification_email: true,
        notification_push: true,
        notification_frequency: "immediate",
      });
      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error creating alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !isActive })
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: !isActive ? "Alert Activated" : "Alert Deactivated",
        description: `Alert has been ${!isActive ? "activated" : "deactivated"}`,
      });

      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;

      toast({
        title: "Alert Deleted",
        description: "Price alert has been deleted",
      });

      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error deleting alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkPrice = async (alert: PriceAlert) => {
    // Simulate price check (in production, this would call an API)
    const mockPrice = alert.target_price * (0.9 + Math.random() * 0.2);
    
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ 
          current_price: mockPrice,
          last_checked_at: new Date().toISOString()
        })
        .eq("id", alert.id);

      if (error) throw error;

      // Record in history
      await supabase.from("price_alert_history").insert({
        alert_id: alert.id,
        price: mockPrice,
      });

      // Check if price met target
      if (mockPrice <= alert.target_price) {
        toast({
          title: "🎉 Target Price Reached!",
          description: `${alert.product_name} is now at $${mockPrice.toFixed(2)}`,
        });

        // Create notification
        await supabase.from("price_alert_notifications").insert({
          alert_id: alert.id,
          user_id: alert.user_id,
          message: `Price alert: ${alert.product_name} reached target price!`,
          is_read: false,
        });
      }

      loadAlerts();
    } catch (error: any) {
      toast({
        title: "Error checking price",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const activeAlerts = alerts.filter(a => a.is_active);
  const inactiveAlerts = alerts.filter(a => !a.is_active);
  const targetMetAlerts = alerts.filter(a => a.current_price && a.current_price <= a.target_price);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground">
            Monitor prices and get notified when targets are reached
          </p>
        </div>
        <Dialog open={showNewAlert} onOpenChange={setShowNewAlert}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set up a new price alert to monitor product or travel prices
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="product_name">Product/Service Name</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  placeholder="e.g., Flight to São Paulo"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_price">Target Price ($)</Label>
                  <Input
                    id="target_price"
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) =>
                      setFormData({ ...formData, target_price: e.target.value })
                    }
                    placeholder="e.g., 299.99"
                  />
                </div>
                <div>
                  <Label htmlFor="travel_date">Travel Date (Optional)</Label>
                  <Input
                    id="travel_date"
                    type="date"
                    value={formData.travel_date}
                    onChange={(e) =>
                      setFormData({ ...formData, travel_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="route">Route (Optional)</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) =>
                    setFormData({ ...formData, route: e.target.value })
                  }
                  placeholder="e.g., São Paulo - Rio de Janeiro"
                />
              </div>
              <div>
                <Label htmlFor="product_url">Product URL</Label>
                <Input
                  id="product_url"
                  value={formData.product_url}
                  onChange={(e) =>
                    setFormData({ ...formData, product_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="notification_frequency">Notification Frequency</Label>
                <Select
                  value={formData.notification_frequency}
                  onValueChange={(value) =>
                    setFormData({ ...formData, notification_frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notification_email"
                    checked={formData.notification_email}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notification_email: checked })
                    }
                  />
                  <Label htmlFor="notification_email">Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notification_push"
                    checked={formData.notification_push}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, notification_push: checked })
                    }
                  />
                  <Label htmlFor="notification_push">Push Notifications</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAlert(false)}>
                Cancel
              </Button>
              <Button onClick={createAlert}>
                <Save className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring {activeAlerts.length} price{activeAlerts.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Targets Met</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{targetMetAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {targetMetAlerts.length} alert{targetMetAlerts.length !== 1 ? 's' : ''} reached target
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {inactiveAlerts.length} inactive
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeAlerts.length})</TabsTrigger>
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No active alerts. Create one to start monitoring prices.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{alert.product_name}</CardTitle>
                        <CardDescription>
                          {alert.route && <span>{alert.route} • </span>}
                          {alert.travel_date && (
                            <span>Travel: {new Date(alert.travel_date).toLocaleDateString()}</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => checkPrice(alert)}
                        >
                          Check Price
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAlert(alert.id, alert.is_active)}
                        >
                          {alert.is_active ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium">Target Price</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${alert.target_price.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Current Price</p>
                        <p className="text-2xl font-bold">
                          {alert.current_price ? (
                            <span className={alert.current_price <= alert.target_price ? "text-green-600" : ""}>
                              ${alert.current_price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Checked</p>
                        <p className="text-sm text-muted-foreground">
                          {alert.last_checked_at
                            ? new Date(alert.last_checked_at).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {alert.notification_email && (
                        <Badge variant="outline">Email</Badge>
                      )}
                      {alert.notification_push && (
                        <Badge variant="outline">Push</Badge>
                      )}
                      <Badge variant="outline">{alert.notification_frequency}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                No alerts created yet. Create your first alert to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={!alert.is_active ? "opacity-60" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle>{alert.product_name}</CardTitle>
                          {!alert.is_active && (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </div>
                        <CardDescription>
                          Created {new Date(alert.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAlert(alert.id, alert.is_active)}
                        >
                          {alert.is_active ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteAlert(alert.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm font-medium">Target: ${alert.target_price.toFixed(2)}</p>
                      </div>
                      {alert.current_price && (
                        <div>
                          <p className="text-sm font-medium">
                            Current: ${alert.current_price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
              <CardDescription>
                Select an alert to view its price history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Price history tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceAlertsPage;
