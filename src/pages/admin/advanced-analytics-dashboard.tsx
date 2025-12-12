import { useEffect, useState, useCallback } from "react";;;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Activity,
  Filter,
  Plus,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface KPIWidget {
  id: string;
  title: string;
  value: number;
  change: string;
  trend: "up" | "down";
  unit?: string;
}

interface DashboardWidget {
  id: string;
  widget_type: string;
  title: string;
  chart_type?: string;
  config: Record<string, unknown>;
  position: unknown: unknown: unknown;
}

interface DashboardFilter {
  period: string;
  unit: string;
  status: string;
}

export default function AdvancedAnalyticsDashboard() {
  const { toast } = useToast();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [kpis, setKpis] = useState<KPIWidget[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<DashboardFilter>({
    period: "30d",
    unit: "all",
    status: "all"
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel("widget_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dashboard_widgets"
        },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch widgets
      const { data: widgetsData, error: widgetsError } = await (supabase as unknown)
        .from("dashboard_widgets")
        .select("*")
        .eq("is_active", true)
        .order("position->y", { ascending: true });

      if (widgetsError) throw widgetsError;

      // Fetch KPI values
      const { data: kpisData, error: kpisError } = await (supabase as unknown)
        .from("kpi_definitions")
        .select(`
          id,
          name,
          unit,
          kpi_values (
            value,
            calculated_at
          )
        `)
        .eq("is_active", true)
        .order("kpi_values(calculated_at)", { ascending: false })
        .limit(1);

      if (kpisError) throw kpisError;

      setWidgets((widgetsData || []) as unknown);
      
      // Transform KPI data
      const transformedKpis: KPIWidget[] = (kpisData || []).map((kpi: unknown) => ({
        id: kpi.id,
        title: kpi.name,
        value: kpi.kpi_values?.[0]?.value || 0,
        change: "+5.2%", // Calculate actual change in production
        trend: "up",
        unit: kpi.unit
      }));
      
      setKpis(transformedKpis);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addWidget = async (widgetType: string, chartType?: string) => {
    try {
      const { error } = await (supabase as unknown)
        .from("dashboard_widgets")
        .insert({
          widget_type: widgetType,
          title: `New ${widgetType} Widget`,
          data_source: "default",
          chart_type: chartType,
          position: { x: 0, y: 0, w: 4, h: 3 }
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Widget added successfully",
      });
      
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add widget",
        variant: "destructive",
      });
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Performance",
        data: [65, 59, 80, 81, 56, 95],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Revenue",
        data: [12, 19, 15, 25],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const pieChartData = {
    labels: ["Category A", "Category B", "Category C"],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
        ],
      },
    ],
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Advanced Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time KPIs and customizable visualizations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDashboardData}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={filters.period} onValueChange={(value) => setFilters({ ...filters, period: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filters.unit} onValueChange={(value) => setFilters({ ...filters, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="unit1">Unit 1</SelectItem>
                  <SelectItem value="unit2">Unit 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              {kpi.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {kpi.value}
                {kpi.unit && <span className="text-sm ml-1">{kpi.unit}</span>}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={kpi.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {kpi.change}
                </span>{" "}
                from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Widgets */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends">
            <LineChart className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <PieChart className="mr-2 h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>Monthly performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line options={chartOptions} data={lineChartData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Revenue</CardTitle>
                <CardDescription>Revenue by quarter</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar options={chartOptions} data={barChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Trends</CardTitle>
              <CardDescription>Track performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <Line options={chartOptions} data={lineChartData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Pie options={chartOptions} data={pieChartData} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Doughnut options={chartOptions} data={pieChartData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
