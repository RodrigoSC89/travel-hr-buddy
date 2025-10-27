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
  CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FuelRecord {
  id: string;
  vessel_id: string;
  fuel_type: string;
  quantity_consumed: number;
  consumption_rate: number;
  efficiency_rating: number;
  record_date: string;
  distance_covered_nm: number;
  vessel_speed_knots: number;
}

interface RouteComparison {
  id: string;
  route_id: string;
  planned_fuel_consumption: number;
  actual_fuel_consumption: number;
  fuel_efficiency: number;
  route_optimization_score: number;
  ai_recommendation: string;
}

export const FuelOptimizer = () => {
  const { toast } = useToast();
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [routeComparisons, setRouteComparisons] = useState<RouteComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFuelData();
  }, []);

  const loadFuelData = async () => {
    try {
      setLoading(true);
      
      const [fuelData, routeData] = await Promise.all([
        supabase
          .from('fuel_records')
          .select('*')
          .order('record_date', { ascending: false })
          .limit(50),
        supabase
          .from('route_consumption')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)
      ]);

      if (fuelData.error) throw fuelData.error;
      if (routeData.error) throw routeData.error;

      setFuelRecords(fuelData.data || []);
      setRouteComparisons(routeData.data || []);
    } catch (error: any) {
      toast({
        title: "Error loading fuel data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAverageFuelConsumption = () => {
    if (fuelRecords.length === 0) return 0;
    const total = fuelRecords.reduce((sum, record) => sum + record.quantity_consumed, 0);
    return total / fuelRecords.length;
  };

  const getAverageEfficiency = () => {
    if (fuelRecords.length === 0) return 0;
    const total = fuelRecords.reduce((sum, record) => sum + (record.efficiency_rating || 0), 0);
    return total / fuelRecords.length;
  };

  const getOptimizationSavings = () => {
    if (routeComparisons.length === 0) return 0;
    return routeComparisons.reduce((sum, route) => {
      if (route.actual_fuel_consumption && route.planned_fuel_consumption) {
        const saving = route.planned_fuel_consumption - route.actual_fuel_consumption;
        return sum + (saving > 0 ? saving : 0);
      }
      return sum;
    }, 0);
  };

  const getFuelTrend = () => {
    if (fuelRecords.length < 2) return 'stable';
    const recent = fuelRecords.slice(0, 5);
    const older = fuelRecords.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.quantity_consumed, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + r.quantity_consumed, 0) / older.length 
      : recentAvg;

    if (recentAvg > olderAvg * 1.1) return 'increasing';
    if (recentAvg < olderAvg * 0.9) return 'decreasing';
    return 'stable';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Fuel className="h-8 w-8" />
          Fuel Optimizer
        </h1>
        <p className="text-muted-foreground">
          AI-powered route optimization and fuel consumption analysis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageFuelConsumption().toFixed(1)} MT
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
            <CardTitle className="text-sm font-medium">Avg Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageEfficiency().toFixed(1)}%
            </div>
            <Progress value={getAverageEfficiency()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {getOptimizationSavings().toFixed(1)} MT
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From route optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Optimized Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {routeComparisons.filter(r => r.fuel_efficiency > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total routes analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="h-5 w-5" />
            AI-Powered Optimization Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Route Optimization Active</h4>
                <p className="text-sm text-muted-foreground">
                  AI algorithms analyzing routes for fuel-efficient paths.
                  Current savings: {getOptimizationSavings().toFixed(1)} MT.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <div className="flex items-start gap-3">
              <Calculator className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">Consumption Trend</h4>
                <p className="text-sm text-muted-foreground">
                  Trend: <strong className="capitalize">{getFuelTrend()}</strong>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
