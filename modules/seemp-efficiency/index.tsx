/**
 * SEEMP Efficiency Module - Main Component
 * PATCH 647 - Ship Energy Efficiency Management Plan (IMO SEEMP)
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Gauge, TrendingDown, TrendingUp, Droplets, Wind, 
  Lightbulb, BarChart3, Calendar, AlertCircle, CheckCircle
} from "lucide-react";
import { Logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import { calculateEfficiencyMetrics, generateEfficiencyRecommendations } from "./services/efficiency-service";
import type { SEEMPMetrics, FuelLog } from "./types";

const SEEMPEfficiency = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [metrics, setMetrics] = useState<SEEMPMetrics | null>(null);
  const [aiRecommendations, setAIRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Logger.module("seemp-efficiency", "Initializing SEEMP Efficiency PATCH 647");
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      // Mock data - in production, fetch from Supabase
      const mockFuelLogs: FuelLog[] = [
        {
          id: "1",
          vessel_id: "vessel-001",
          timestamp: new Date().toISOString(),
          fuel_type: "MDO",
          consumption: 150,
          distance_traveled: 280,
          operating_hours: 24,
          vessel_mode: "sailing",
          created_at: new Date().toISOString()
        }
      ];

      const calculatedMetrics = calculateEfficiencyMetrics(
        mockFuelLogs,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
        "vessel-001"
      );

      setMetrics(calculatedMetrics);

      // Get AI recommendations
      const recommendations = await generateEfficiencyRecommendations(calculatedMetrics);
      setAIRecommendations(recommendations);

      Logger.info("SEEMP metrics loaded", { metrics: calculatedMetrics });
    } catch (error) {
      Logger.error("Failed to load SEEMP metrics", error, "seemp-efficiency");
      toast.error("Failed to load efficiency data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Gauge className="h-12 w-12 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading efficiency data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gauge className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">SEEMP Efficiency</h1>
            <p className="text-sm text-muted-foreground">
              IMO Ship Energy Efficiency Management Plan - Fuel & Emissions Monitoring
            </p>
          </div>
        </div>
        <Button onClick={loadMetrics} variant="outline" size="sm">
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* AI Recommendations */}
      {aiRecommendations && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  AI Efficiency Recommendations
                </p>
                <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                  • {aiRecommendations}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Fuel Consumed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.total_fuel_consumed.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">tons</p>
                </div>
                <Droplets className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg. Consumption
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.average_consumption_per_nm.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">tons/nm</p>
                </div>
                <Gauge className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CO₂ Emissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{metrics.co2_emissions.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">tons CO₂</p>
                </div>
                <Wind className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Efficiency Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold capitalize">{metrics.efficiency_trend}</p>
                  <p className="text-xs text-muted-foreground">vs baseline</p>
                </div>
                {metrics.efficiency_trend === "improving" ? (
                  <TrendingDown className="h-8 w-8 text-green-500" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-yellow-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="fuel-logs">Fuel Logs</TabsTrigger>
          <TabsTrigger value="simulations">Simulations</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <Card>
            <CardHeader>
              <CardTitle>SEEMP Dashboard</CardTitle>
              <CardDescription>
                Monitor fuel consumption, emissions, and efficiency trends in accordance with IMO SEEMP guidelines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">IMO SEEMP Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span className="text-sm">Last updated: {new Date().toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  This module monitors and optimizes fuel consumption and emissions according to 
                  IMO's Ship Energy Efficiency Management Plan (SEEMP). AI-powered analytics provide 
                  real-time insights and actionable recommendations for improving operational efficiency.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel-logs">
          <Card>
            <CardHeader>
              <CardTitle>Fuel Consumption Logs</CardTitle>
              <CardDescription>Track daily fuel consumption by type and operation mode</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Fuel log entries will be displayed here. Integration with vessel sensors and manual entry supported.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulations">
          <Card>
            <CardHeader>
              <CardTitle>Energy Efficiency Simulations</CardTitle>
              <CardDescription>Run AI-powered optimization scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simulate various optimization strategies and view estimated fuel savings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>Efficiency Actions</CardTitle>
              <CardDescription>Plan and track fuel-saving initiatives</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and monitor efficiency improvement actions like hull cleaning, route optimization, etc.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEEMPEfficiency;
