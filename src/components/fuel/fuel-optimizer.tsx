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
  Download,
  FileText
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Lazy load jsPDF
const loadJsPDF = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable")
  ]);
  return { jsPDF, autoTable: autoTableModule.default };
};
import { FuelOptimizationService } from "@/services/fuel-optimization-service";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
  const [optimizationResults, setOptimizationResults] = useState<any[]>([]);

  useEffect(() => {
    loadFuelData();
    runOptimizationAnalysis();
  }, []);

  const loadFuelData = async () => {
    try {
      setLoading(true);
      
      const [fuelData, routeData] = await Promise.all([
        supabase
          .from("fuel_records")
          .select("*")
          .order("record_date", { ascending: false })
          .limit(50),
        supabase
          .from("route_consumption")
          .select("*")
          .order("created_at", { ascending: false })
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
    if (fuelRecords.length < 2) return "stable";
    const recent = fuelRecords.slice(0, 5);
    const older = fuelRecords.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, r) => sum + r.quantity_consumed, 0) / recent.length;
    const olderAvg = older.length > 0 
      ? older.reduce((sum, r) => sum + r.quantity_consumed, 0) / older.length 
      : recentAvg;

    if (recentAvg > olderAvg * 1.1) return "increasing";
    if (recentAvg < olderAvg * 0.9) return "decreasing";
    return "stable";
  };

  const runOptimizationAnalysis = async () => {
    try {
      // Fetch sample routes for optimization
      const { data: routes, error } = await supabase
        .from("vessel_routes")
        .select("*")
        .limit(5);
      
      if (error) throw error;
      
      if (routes && routes.length > 0) {
        const results = routes.map((route: any) => {
          const routeData = {
            distance_nm: route.distance_nm || 100,
            weather_factor: route.weather_factor || 1.0,
            current_factor: route.current_factor || 1.0,
            departure_port: route.departure_port,
            arrival_port: route.arrival_port
          };
          
          const currentSpeed = route.planned_speed || 13;
          const historicalData = {
            avg_consumption_rate: 2.5,
            avg_speed: 12,
            efficiency_rating: 85
          };
          
          const optimization = FuelOptimizationService.optimizeRoute(
            routeData,
            currentSpeed,
            historicalData
          );
          
          return {
            route_name: `${route.departure_port || "Port A"} → ${route.arrival_port || "Port B"}`,
            ...optimization
          };
        });
        
        setOptimizationResults(results);
      }
    } catch (error: any) {
      console.error("Error running optimization:", error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Fuel Optimization Report", 14, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
    
    // Summary Section
    doc.setFontSize(14);
    doc.text("Summary", 14, 40);
    doc.setFontSize(10);
    doc.text(`Average Fuel Consumption: ${getAverageFuelConsumption().toFixed(1)} MT`, 14, 48);
    doc.text(`Average Efficiency: ${getAverageEfficiency().toFixed(1)}%`, 14, 54);
    doc.text(`Total Savings: ${getOptimizationSavings().toFixed(1)} MT`, 14, 60);
    doc.text(`Fuel Trend: ${getFuelTrend()}`, 14, 66);
    
    // Optimization Results
    if (optimizationResults.length > 0) {
      doc.setFontSize(14);
      doc.text("Optimization Recommendations", 14, 80);
      
      const tableData = optimizationResults.map((result, index) => [
        result.route_name,
        `${result.original_consumption.toFixed(0)}L`,
        `${result.optimized_consumption.toFixed(0)}L`,
        `${result.savings_percentage.toFixed(1)}%`,
        `${result.optimal_speed.toFixed(1)} kts`,
        `${result.confidence_score}%`
      ]);
      
      (doc as any).autoTable({
        startY: 85,
        head: [["Route", "Original", "Optimized", "Savings", "Optimal Speed", "Confidence"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      // Recommendations
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.text("Key Recommendations", 14, finalY + 15);
      
      doc.setFontSize(10);
      let yPos = finalY + 23;
      optimizationResults.slice(0, 3).forEach((result, index) => {
        if (result.recommendations && result.recommendations.length > 0) {
          doc.text(`${index + 1}. ${result.recommendations[0]}`, 14, yPos);
          yPos += 6;
        }
      });
    }
    
    doc.save(`fuel-optimization-report-${new Date().toISOString().split("T")[0]}.pdf`);
    
    toast({
      title: "Report exported",
      description: "PDF report has been downloaded successfully",
    });
  };

  const getOptimizationChartData = () => {
    if (optimizationResults.length === 0) {
      return {
        labels: ["Route 1", "Route 2", "Route 3"],
        datasets: [
          {
            label: "Planned Consumption (L)",
            data: [1200, 1500, 1300],
            backgroundColor: "rgba(239, 68, 68, 0.6)",
          },
          {
            label: "Optimized Consumption (L)",
            data: [1050, 1300, 1150],
            backgroundColor: "rgba(34, 197, 94, 0.6)",
          }
        ]
      };
    }
    
    return {
      labels: optimizationResults.map((r, i) => r.route_name || `Route ${i + 1}`),
      datasets: [
        {
          label: "Original Consumption (L)",
          data: optimizationResults.map(r => r.original_consumption),
          backgroundColor: "rgba(239, 68, 68, 0.6)",
        },
        {
          label: "Optimized Consumption (L)",
          data: optimizationResults.map(r => r.optimized_consumption),
          backgroundColor: "rgba(34, 197, 94, 0.6)",
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Fuel className="h-8 w-8" />
            Fuel Optimizer
          </h1>
          <p className="text-muted-foreground">
            AI-powered route optimization and fuel consumption analysis
          </p>
        </div>
        <Button onClick={exportToPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
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
              {getFuelTrend() === "decreasing" ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : getFuelTrend() === "increasing" ? (
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

      {/* Route Optimization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Route Comparison - Planned vs Optimized
          </CardTitle>
          <CardDescription>
            Fuel consumption comparison showing optimization potential
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={getOptimizationChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Fuel Consumption (Liters)"
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Optimization Results */}
      {optimizationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              AI Optimization Analysis
            </CardTitle>
            <CardDescription>
              Detailed recommendations for each analyzed route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizationResults.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{result.route_name}</h4>
                        <Badge variant={result.savings_percentage > 10 ? "default" : "secondary"}>
                          {result.savings_percentage.toFixed(1)}% Savings
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Original</p>
                          <p className="font-semibold">{result.original_consumption.toFixed(0)}L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimized</p>
                          <p className="font-semibold text-green-600">{result.optimized_consumption.toFixed(0)}L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Optimal Speed</p>
                          <p className="font-semibold">{result.optimal_speed.toFixed(1)} kts</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="font-semibold">{result.confidence_score}%</p>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground mb-2">
                          <FileText className="h-4 w-4 inline mr-1" />
                          Reasoning:
                        </p>
                        <p className="text-sm">{result.reasoning}</p>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="space-y-1">
                          {result.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
