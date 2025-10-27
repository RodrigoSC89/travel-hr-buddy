import React, { useState, useEffect, useCallback } from "react";
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
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { FuelOptimizationService } from "@/services/fuel-optimization.service";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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

  // Calculate AI-powered optimization suggestions
  const calculateOptimization = useCallback(() => {
    if (fuelRecords.length === 0) return null;

    const historicalData = fuelRecords.map(record => ({
      vessel_id: record.vessel_id,
      fuel_consumed: record.quantity_consumed,
      distance_covered: record.distance_covered_nm,
      avg_speed: record.vessel_speed_knots,
    }));

    // Sample route for optimization (in real scenario, would come from active routes)
    const sampleRoute = {
      id: 'route-1',
      origin: 'Port A',
      destination: 'Port B',
      distance_nm: 450,
      estimated_duration_hours: 36,
      weather_factor: 1.1,
      current_factor: 1.05
    };

    const currentSpeed = fuelRecords.length > 0 ? fuelRecords[0].vessel_speed_knots : 14;
    return FuelOptimizationService.optimizeRoute(sampleRoute, currentSpeed, historicalData);
  }, [fuelRecords]);

  // Export optimization report to PDF
  const exportOptimizationReport = async () => {
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      const optimization = calculateOptimization();

      doc.setFontSize(20);
      doc.text('Fuel Optimization Report', 14, 20);

      doc.setFontSize(12);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      doc.setFontSize(14);
      doc.text('Summary', 14, 45);

      doc.setFontSize(10);
      let yPos = 55;

      doc.text(`Average Fuel Consumption: ${getAverageFuelConsumption().toFixed(1)} MT`, 14, yPos);
      yPos += 7;
      doc.text(`Average Efficiency: ${getAverageEfficiency().toFixed(1)}%`, 14, yPos);
      yPos += 7;
      doc.text(`Total Savings Achieved: ${getOptimizationSavings().toFixed(1)} MT`, 14, yPos);
      yPos += 7;
      doc.text(`Consumption Trend: ${getFuelTrend()}`, 14, yPos);

      if (optimization) {
        yPos += 15;
        doc.setFontSize(14);
        doc.text('AI Optimization Analysis', 14, yPos);

        yPos += 10;
        doc.setFontSize(10);
        doc.text(`Original Consumption: ${optimization.original_consumption} L`, 14, yPos);
        yPos += 7;
        doc.text(`Optimized Consumption: ${optimization.optimized_consumption} L`, 14, yPos);
        yPos += 7;
        doc.text(`Potential Savings: ${optimization.savings_liters} L (${optimization.savings_percentage}%)`, 14, yPos);
        yPos += 7;
        doc.text(`Confidence Score: ${optimization.confidence_score}%`, 14, yPos);

        yPos += 15;
        doc.setFontSize(14);
        doc.text('Recommendations', 14, yPos);

        yPos += 10;
        doc.setFontSize(9);
        optimization.recommendations.forEach((rec, idx) => {
          const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 180);
          lines.forEach((line: string) => {
            doc.text(line, 14, yPos);
            yPos += 5;
          });
          yPos += 2;
        });
      }

      doc.save(`fuel-optimization-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast({
        title: "Success",
        description: "Optimization report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Error",
        description: "Failed to export PDF report",
        variant: "destructive",
      });
    }
  };

  const optimization = calculateOptimization();

  // Prepare chart data for planned vs optimized comparison
  const chartData = {
    labels: routeComparisons.slice(0, 10).map((_, idx) => `Route ${idx + 1}`),
    datasets: [
      {
        label: 'Planned Consumption (L)',
        data: routeComparisons.slice(0, 10).map(r => r.planned_fuel_consumption || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
      {
        label: 'Actual/Optimized Consumption (L)',
        data: routeComparisons.slice(0, 10).map(r => r.actual_fuel_consumption || 0),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Route Consumption: Planned vs Optimized',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
            <Fuel className="h-6 w-6 md:h-8 md:w-8" />
            Fuel Optimizer
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            AI-powered route optimization and fuel consumption analysis
          </p>
        </div>
        <Button onClick={exportOptimizationReport} size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Export PDF Report
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Fuel Consumption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {getOptimizationSavings().toFixed(1)} MT
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              From route optimization
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Optimized Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">
              {routeComparisons.filter(r => r.fuel_efficiency > 0).length}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total routes analyzed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Optimization Insights */}
      {optimization && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg text-blue-900 dark:text-blue-100">
                <Sparkles className="h-5 w-5" />
                AI-Powered Optimization Analysis
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {optimization.confidence_score}% Confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium mb-1 text-sm md:text-base">Potential Savings</h4>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      {optimization.savings_liters.toFixed(1)} L
                    </p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                      {optimization.savings_percentage.toFixed(1)}% reduction possible
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calculator className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium mb-1 text-sm md:text-base">Consumption Comparison</h4>
                    <div className="space-y-1">
                      <p className="text-xs md:text-sm">
                        <span className="text-muted-foreground">Original:</span>{' '}
                        <span className="font-semibold">{optimization.original_consumption} L</span>
                      </p>
                      <p className="text-xs md:text-sm">
                        <span className="text-muted-foreground">Optimized:</span>{' '}
                        <span className="font-semibold text-green-600">{optimization.optimized_consumption} L</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2 text-sm md:text-base">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                AI Recommendations
              </h4>
              <ul className="space-y-2">
                {optimization.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs md:text-sm flex items-start gap-2">
                    <span className="text-blue-600 font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
              <div className="flex items-start gap-3">
                <Calculator className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-sm md:text-base">Historical Trend</h4>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Consumption trend: <strong className="capitalize text-foreground">{getFuelTrend()}</strong>
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">
                    Current average efficiency: <strong className="text-foreground">{getAverageEfficiency().toFixed(1)}%</strong>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Comparison Chart */}
      {routeComparisons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Route Performance Comparison</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Planned vs Actual/Optimized fuel consumption across routes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <Bar data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 pt-4 border-t text-xs md:text-sm text-muted-foreground">
              <p>
                Green bars show actual or optimized consumption. Lower values indicate better efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
