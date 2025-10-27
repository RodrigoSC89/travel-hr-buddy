// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Fuel,
  TrendingDown,
  TrendingUp,
  Route,
  Sparkles,
  BarChart3,
  Calculator,
  AlertCircle,
  CheckCircle2,
  Bell,
  RefreshCw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FuelLog {
  id: string;
  vessel_id: string;
  fuel_type: string;
  quantity_liters: number;
  consumption_rate: number;
  timestamp: string;
  route_segment_id: string;
}

interface RouteSegment {
  id: string;
  route_name: string;
  distance_nm: number;
  estimated_fuel_consumption: number;
  actual_fuel_consumption: number;
  cargo_weight_tons: number;
  average_speed_knots: number;
  completion_status: string;
}

interface FuelPrediction {
  id: string;
  route_segment_id: string;
  predicted_consumption: number;
  actual_consumption: number;
  accuracy_percentage: number;
  ai_model_version: string;
  prediction_factors: any;
}

interface FuelAlert {
  id: string;
  vessel_id: string;
  alert_type: string;
  severity: string;
  message: string;
  threshold_value: number;
  actual_value: number;
  acknowledged: boolean;
  created_at: string;
}

export const FuelOptimizer = () => {
  const { toast } = useToast();
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [predictions, setPredictions] = useState<FuelPrediction[]>([]);
  const [alerts, setAlerts] = useState<FuelAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);

  useEffect(() => {
    loadFuelData();
    const interval = setInterval(loadFuelData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadFuelData = async () => {
    try {
      setLoading(true);
      
      const [logsData, segmentsData, predictionsData, alertsData] = await Promise.all([
        supabase
          .from('fuel_logs')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100),
        supabase
          .from('route_segments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('fuel_predictions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase
          .from('fuel_alerts')
          .select('*')
          .eq('acknowledged', false)
          .order('created_at', { ascending: false })
      ]);

      setFuelLogs(logsData.data || []);
      setRouteSegments(segmentsData.data || []);
      setPredictions(predictionsData.data || []);
      setAlerts(alertsData.data || []);
      
      generateTrendData(logsData.data || []);
    } catch (error: any) {
      console.error("Error loading fuel data:", error);
      toast({
        title: "Error loading fuel data",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (logs: FuelLog[]) => {
    const weeklyData: { [key: string]: { consumption: number; count: number } } = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { consumption: 0, count: 0 };
      }
      weeklyData[weekKey].consumption += log.quantity_liters;
      weeklyData[weekKey].count += 1;
    });
    
    const trend = Object.entries(weeklyData).map(([week, data]) => ({
      week,
      avgConsumption: data.consumption / data.count,
      totalConsumption: data.consumption
    })).slice(0, 12).reverse();
    
    setTrendData(trend);
  };

  const getAverageFuelConsumption = () => {
    if (fuelLogs.length === 0) return 0;
    const total = fuelLogs.reduce((sum, log) => sum + log.quantity_liters, 0);
    return total / fuelLogs.length;
  };

  const getAverageAccuracy = () => {
    if (predictions.length === 0) return 0;
    const total = predictions.reduce((sum, pred) => sum + (pred.accuracy_percentage || 0), 0);
    return total / predictions.length;
  };

  const getOptimizationSavings = () => {
    if (routeSegments.length === 0) return 0;
    const total = routeSegments.reduce((sum, route) => {
      const saving = (route.estimated_fuel_consumption || 0) - (route.actual_fuel_consumption || 0);
      return sum + (saving > 0 ? saving : 0);
    }, 0);
    return total;
  };

  const getFuelTrend = () => {
    if (fuelLogs.length < 2) return 'stable';
    const recent = fuelLogs.slice(0, 5);
    const older = fuelLogs.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.quantity_liters, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + r.quantity_liters, 0) / older.length 
      : recentAvg;

    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('fuel_alerts')
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(alerts.filter(a => a.id !== alertId));
      toast({
        title: "Alert acknowledged",
        description: "Alert has been marked as acknowledged",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateAIRecommendations = () => {
    const recommendations = [];
    
    const avgConsumption = getAverageFuelConsumption();
    const recentConsumption = fuelLogs.slice(0, 5).reduce((sum, l) => sum + l.quantity_liters, 0) / 5;
    
    if (recentConsumption > avgConsumption * 1.15) {
      recommendations.push({
        title: "High Consumption Detected",
        description: "Recent consumption is 15% above average. Consider reducing speed or optimizing route.",
        severity: "warning"
      });
    }
    
    const inefficientRoutes = routeSegments.filter(r => 
      r.actual_fuel_consumption > r.estimated_fuel_consumption * 1.2
    );
    
    if (inefficientRoutes.length > 0) {
      recommendations.push({
        title: "Route Optimization Opportunity",
        description: `${inefficientRoutes.length} routes show 20%+ higher consumption than estimated. Review route planning.`,
        severity: "info"
      });
    }
    
    const accuracy = getAverageAccuracy();
    if (accuracy > 90) {
      recommendations.push({
        title: "High Prediction Accuracy",
        description: `AI predictions are ${accuracy.toFixed(1)}% accurate. Continue current optimization strategies.`,
        severity: "success"
      });
    }
    
    return recommendations;
  };

  const getComparisonData = () => {
    return routeSegments.slice(0, 10).map(route => ({
      name: route.route_name.substring(0, 15),
      estimated: route.estimated_fuel_consumption || 0,
      actual: route.actual_fuel_consumption || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const recommendations = generateAIRecommendations();
  const comparisonData = getComparisonData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Fuel className="h-8 w-8" />
            Fuel Optimizer v1
          </h1>
          <p className="text-muted-foreground">
            AI-powered route optimization and fuel consumption analysis
          </p>
        </div>
        <Button onClick={loadFuelData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Bell className="h-5 w-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className={`h-5 w-5 ${
                        alert.severity === 'critical' ? 'text-red-600' :
                        alert.severity === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div>
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">
                          Threshold: {alert.threshold_value} | Actual: {alert.actual_value}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageFuelConsumption().toFixed(1)} L
            </div>
            <div className="flex items-center gap-2 mt-2">
              {getFuelTrend() === 'decreasing' ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : getFuelTrend() === 'increasing' ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <div className="h-4 w-4" />
              )}
              <p className="text-xs text-muted-foreground capitalize">
                {getFuelTrend()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">AI Prediction Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageAccuracy().toFixed(1)}%
            </div>
            <Progress value={getAverageAccuracy()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getOptimizationSavings().toFixed(1)} L
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From route optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analyzed Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routeSegments.length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total routes tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription>
            Intelligent suggestions based on historical data and predictive analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <div key={index} className="p-4 bg-white rounded-lg">
                <div className="flex items-start gap-3">
                  {rec.severity === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />}
                  {rec.severity === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                  {rec.severity === 'info' && <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />}
                  <div>
                    <h4 className="font-medium mb-1">{rec.title}</h4>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 bg-white rounded-lg text-center text-muted-foreground">
              <p>No recommendations at this time. System is performing optimally.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Consumption Trends</TabsTrigger>
          <TabsTrigger value="comparison">Estimated vs Actual</TabsTrigger>
          <TabsTrigger value="routes">Route Details</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Fuel Consumption Trend
              </CardTitle>
              <CardDescription>
                Average and total fuel consumption over the last 12 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgConsumption" stroke="#8884d8" name="Avg Consumption (L)" />
                  <Line type="monotone" dataKey="totalConsumption" stroke="#82ca9d" name="Total Consumption (L)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estimated vs Actual Fuel Consumption
              </CardTitle>
              <CardDescription>
                Comparison of predicted and actual consumption by route
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="estimated" fill="#8884d8" name="Estimated (L)" />
                  <Bar dataKey="actual" fill="#82ca9d" name="Actual (L)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Route Segments with Fuel Estimates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {routeSegments.map((route) => (
                    <div key={route.id} className="p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{route.route_name}</h4>
                        <Badge variant={route.completion_status === 'completed' ? 'default' : 'secondary'}>
                          {route.completion_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{route.distance_nm} NM</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Estimated</p>
                          <p className="font-medium">{route.estimated_fuel_consumption || 'N/A'} L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Actual</p>
                          <p className="font-medium">{route.actual_fuel_consumption || 'N/A'} L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Speed</p>
                          <p className="font-medium">{route.average_speed_knots || 'N/A'} kn</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
