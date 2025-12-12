import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, BarChart3, Clock, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * PATCH 643: Usage Metrics Dashboard
 * Intelligent metrics for data-driven decisions
 */
export default function UsageMetrics() {
  const { data: moduleAccess, isLoading: loadingModules } = useQuery({
    queryKey: ["module-access-metrics"],
    queryFn: async () => {
      // TODO: Implement actual module access tracking
      return [
        { module: "Dashboard", count: 1247, avgTime: 245 },
        { module: "Checklists", count: 892, avgTime: 312 },
        { module: "Documents", count: 678, avgTime: 189 },
        { module: "Fleet", count: 534, avgTime: 421 },
        { module: "Incidents", count: 423, avgTime: 276 },
        { module: "Reports", count: 367, avgTime: 198 },
      ];
    },
  });

  const { data: peakHours, isLoading: loadingHours } = useQuery({
    queryKey: ["peak-hours-metrics"],
    queryFn: async () => {
      // TODO: Implement actual peak hours analysis
      return [
        { hour: "08:00", requests: 145 },
        { hour: "09:00", requests: 234 },
        { hour: "10:00", requests: 312 },
        { hour: "11:00", requests: 289 },
        { hour: "12:00", requests: 178 },
        { hour: "13:00", requests: 156 },
        { hour: "14:00", requests: 267 },
        { hour: "15:00", requests: 298 },
        { hour: "16:00", requests: 245 },
        { hour: "17:00", requests: 189 },
      ];
    },
  });

  const { data: sessionMetrics, isLoading: loadingSessions } = useQuery({
    queryKey: ["session-metrics"],
    queryFn: async () => {
      // TODO: Implement actual session metrics
      return {
        avgDuration: 28.5, // minutes
        totalSessions: 1547,
        avgPagesPerSession: 8.3,
        bounceRate: 12.4,
      });
    },
  });

  const exportToCSV = () => {
    if (!moduleAccess) return;

    const csv = [
      ["Module", "Access Count", "Average Time (s)"],
      ...moduleAccess.map(m => [m.module, m.count, m.avgTime])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage-metrics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingModules || loadingHours || loadingSessions) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const moduleChartData = {
    labels: moduleAccess?.map(m => m.module) || [],
    datasets: [
      {
        label: "Access Count",
        data: moduleAccess?.map(m => m.count) || [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const peakHoursChartData = {
    labels: peakHours?.map(h => h.hour) || [],
    datasets: [
      {
        label: "Requests",
        data: peakHours?.map(h => h.requests) || [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Usage Metrics
          </h1>
          <p className="text-muted-foreground mt-2">
            PATCH 643: Intelligent usage metrics for data-driven decisions
          </p>
        </div>
        <Button onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{sessionMetrics?.avgDuration} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{sessionMetrics?.totalSessions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pages/Session</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{sessionMetrics?.avgPagesPerSession}</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg">
              {sessionMetrics?.bounceRate}%
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Module Access Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Most Accessed Modules</CardTitle>
          <CardDescription>Module access frequency in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Bar data={moduleChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </CardContent>
      </Card>

      {/* Peak Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
          <CardDescription>Request distribution throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <Bar data={peakHoursChartData} options={{ responsive: true, maintainAspectRatio: true }} />
        </CardContent>
      </Card>

      {/* Detailed Module Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Module Statistics</CardTitle>
          <CardDescription>Detailed usage metrics for each module</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moduleAccess?.map((module) => (
              <div key={module.module} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{module.module}</h3>
                  <p className="text-sm text-muted-foreground">
                    Avg. time: {module.avgTime}s
                  </p>
                </div>
                <Badge variant="outline">{module.count} accesses</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
