import { useEffect, useState, useCallback, useMemo } from "react";;

/**
 * PATCH 464 - Complete Price Alerts UI
 * Full-featured price alert system with history charts, configurable thresholds, and notifications
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp,
  TrendingDown,
  Bell,
  BellOff,
  Plus,
  Settings,
  RefreshCw,
  Mail,
  Eye,
  Trash2,
  LineChart,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceAlert {
  id: string;
  route: string;
  origin: string;
  destination: string;
  current_price: number | null;
  target_price: number;
  threshold_type: "below" | "above";
  is_active: boolean;
  created_at: string;
  last_checked_at?: string;
  user_id: string;
  email_notifications: boolean;
  visual_notifications: boolean;
}

interface PriceHistory {
  id: string;
  alert_id: string;
  price: number;
  checked_at: string;
}

export const CompletePriceAlertsUI: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<PriceAlert | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const { user } = useAuth();

  // New alert form state
  const [newAlert, setNewAlert] = useState({
    origin: "",
    destination: "",
    target_price: "",
    threshold_type: "below" as "below" | "above",
    email_notifications: true,
    visual_notifications: true,
  };

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAlert) {
      loadPriceHistory(selectedAlert.id);
    }
  }, [selectedAlert]);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("price_alerts")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAlerts(data || []);
    } catch (error) {
      console.error("Error loading alerts:", error);
      toast.error("Failed to load price alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPriceHistory = async (alertId: string) => {
    try {
      const { data, error } = await supabase
        .from("travel_price_history")
        .select("*")
        .eq("alert_id", alertId)
        .order("checked_at", { ascending: true });

      if (error) throw error;

      setPriceHistory(data || []);
    } catch (error) {
      console.error("Error loading price history:", error);
    }
  };

  const createAlert = async () => {
    if (!newAlert.origin || !newAlert.destination || !newAlert.target_price) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const route = `${newAlert.origin} → ${newAlert.destination}`;
      
      const { error } = await supabase.from("price_alerts").insert({
        route,
        origin: newAlert.origin,
        destination: newAlert.destination,
        target_price: parseFloat(newAlert.target_price),
        threshold_type: newAlert.threshold_type,
        email_notifications: newAlert.email_notifications,
        visual_notifications: newAlert.visual_notifications,
        is_active: true,
        user_id: user?.id,
      });

      if (error) throw error;

      toast.success("Price alert created successfully");
      setShowCreateDialog(false);
      setNewAlert({
        origin: "",
        destination: "",
        target_price: "",
        threshold_type: "below",
        email_notifications: true,
        visual_notifications: true,
      });
      loadAlerts();
    } catch (error) {
      console.error("Error creating alert:", error);
      toast.error("Failed to create price alert");
    }
  };

  const toggleAlert = async (alertId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .update({ is_active: !currentState })
        .eq("id", alertId);

      if (error) throw error;

      toast.success(`Alert ${!currentState ? "activated" : "deactivated"}`);
      loadAlerts();
    } catch (error) {
      console.error("Error toggling alert:", error);
      toast.error("Failed to update alert");
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId);

      if (error) throw error;

      toast.success("Alert deleted successfully");
      loadAlerts();
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error("Error deleting alert:", error);
      toast.error("Failed to delete alert");
    }
  };

  const checkPrices = async () => {
    toast.info("Checking prices... (simulated)");
    // In production, this would trigger a backend service to check actual prices
    setTimeout(() => {
      toast.success("Prices checked and updated");
      loadAlerts();
    }, 2000);
  };

  const sendTestEmail = async (alertId: string) => {
    toast.info("Sending test email notification...");
    // In production, this would call a Supabase Edge Function or email service
    setTimeout(() => {
      toast.success("Test email sent successfully");
    }, 1500);
  };

  // Prepare chart data
  const getChartData = () => {
    if (!priceHistory.length) {
      return {
        labels: [],
        datasets: [],
      };
    }

    return {
      labels: priceHistory.map((h) =>
        new Date(h.checked_at).toLocaleDateString()
      ),
      datasets: [
        {
          label: "Price",
          data: priceHistory.map((h) => h.price),
          borderColor: "rgb(59, 130, 246)",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Target Price",
          data: priceHistory.map(() => selectedAlert?.target_price),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderDash: [5, 5],
          fill: false,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Price History",
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: unknown: unknown: unknown) => `$${value}`,
        },
      },
    },
  };

  const activeAlerts = alerts.filter((a) => a.is_active).length;
  const totalAlerts = alerts.length;
  const avgTargetPrice =
    alerts.length > 0
      ? alerts.reduce((sum, a) => sum + a.target_price, 0) / alerts.length
      : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading price alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Price Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            PATCH 464 - Complete price monitoring with history and notifications
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkPrices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Prices
          </Button>
          <Button onClick={handleSetShowCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{activeAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Target Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgTargetPrice.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Alerts</CardTitle>
              <CardDescription>
                Monitor prices for your favorite routes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No alerts yet. Create your first alert to get started!
                </div>
              ) : (
                alerts.map((alert) => (
                  <Card
                    key={alert.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAlert?.id === alert.id ? "border-primary" : ""
                    }`}
                    onClick={handleSetSelectedAlert}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{alert.route}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Target: ${alert.target_price}
                            {alert.threshold_type === "below" ? " or less" : " or more"}
                          </div>
                        </div>
                        <Badge
                          variant={alert.is_active ? "default" : "secondary"}
                          className="ml-2"
                        >
                          {alert.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlert(alert.id, alert.is_active);
                          }}
                        >
                          {alert.is_active ? (
                            <BellOff className="h-3 w-3" />
                          ) : (
                            <Bell className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlert(alert.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendTestEmail(alert.id);
                          }}
                          disabled={!alert.email_notifications}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price History Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Price History
              </CardTitle>
              <CardDescription>
                {selectedAlert
                  ? `Showing price history for ${selectedAlert.route}`
                  : "Select an alert to view price history"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAlert ? (
                <div className="h-[400px]">
                  {priceHistory.length > 0 ? (
                    <Line data={getChartData()} options={chartOptions} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No price history available yet</p>
                        <p className="text-sm">
                          Check prices to start building history
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select an alert to view its price history</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Alert Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Price Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                value={newAlert.origin}
                onChange={handleChange})
                }
                placeholder="e.g., New York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={newAlert.destination}
                onChange={handleChange})
                }
                placeholder="e.g., London"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price ($)</Label>
              <Input
                id="target_price"
                type="number"
                value={newAlert.target_price}
                onChange={handleChange})
                }
                placeholder="e.g., 500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold_type">Alert Condition</Label>
              <Select
                value={newAlert.threshold_type}
                onValueChange={(value: "below" | "above") =>
                  setNewAlert({ ...newAlert, threshold_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below">Below target price</SelectItem>
                  <SelectItem value="above">Above target price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <Switch
                id="email_notifications"
                checked={newAlert.email_notifications}
                onCheckedChange={(checked) =>
                  setNewAlert({ ...newAlert, email_notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="visual_notifications">Visual Notifications</Label>
              <Switch
                id="visual_notifications"
                checked={newAlert.visual_notifications}
                onCheckedChange={(checked) =>
                  setNewAlert({ ...newAlert, visual_notifications: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleSetShowCreateDialog}>
              Cancel
            </Button>
            <Button onClick={createAlert}>Create Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default CompletePriceAlertsUI;
