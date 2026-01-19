import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, BarChart3, Clock, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LazyBarChart } from "@/components/charts/LazyChart";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

/**
 * PATCH 643.1: Usage Metrics Dashboard with Real Supabase Data
 * Intelligent metrics for data-driven decisions
 */
export default function UsageMetrics() {
  // Real module access tracking from analytics_events
  const { data: moduleAccess, isLoading: loadingModules } = useQuery({
    queryKey: ["module-access-metrics-real"],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('page_url, created_at')
        .gte('created_at', thirtyDaysAgo)
        .not('page_url', 'is', null);

      if (error) {
        console.error("Error fetching module access:", error);
        // Fallback to access_logs if analytics_events has no data
        const { data: logsData } = await supabase
          .from('access_logs')
          .select('module_accessed, timestamp')
          .gte('timestamp', thirtyDaysAgo);

        if (logsData && logsData.length > 0) {
          const moduleCounts = logsData.reduce((acc: Record<string, number>, log) => {
            const module = log.module_accessed || 'Unknown';
            acc[module] = (acc[module] || 0) + 1;
            return acc;
          }, {});

          return Object.entries(moduleCounts)
            .map(([module, count]) => ({ module, count: count as number, avgTime: 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        }
      }

      if (data && data.length > 0) {
        // Parse page URLs to module names
        const moduleCounts = data.reduce((acc: Record<string, number>, event) => {
          const url = event.page_url || '';
          const module = url.split('/')[1] || 'Dashboard';
          const moduleName = module.charAt(0).toUpperCase() + module.slice(1).replace(/-/g, ' ');
          acc[moduleName] = (acc[moduleName] || 0) + 1;
          return acc;
        }, {});

        return Object.entries(moduleCounts)
          .map(([module, count]) => ({ module, count: count as number, avgTime: 0 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }

      // Return real-looking default data if no data exists yet
      return [
        { module: "Dashboard", count: 0, avgTime: 0 },
        { module: "Checklists", count: 0, avgTime: 0 },
        { module: "Documents", count: 0, avgTime: 0 },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Real peak hours from analytics or access logs
  const { data: peakHours, isLoading: loadingHours } = useQuery({
    queryKey: ["peak-hours-metrics-real"],
    queryFn: async () => {
      const today = new Date();
      const startOfToday = startOfDay(today).toISOString();
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', startOfToday);

      if (error || !data || data.length === 0) {
        // Try access_logs
        const { data: logsData } = await supabase
          .from('access_logs')
          .select('timestamp')
          .gte('timestamp', subDays(new Date(), 7).toISOString());

        if (logsData && logsData.length > 0) {
          const hourCounts: Record<string, number> = {};
          for (let i = 0; i < 24; i++) {
            hourCounts[`${i.toString().padStart(2, '0')}:00`] = 0;
          }

          logsData.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            const key = `${hour.toString().padStart(2, '0')}:00`;
            hourCounts[key] = (hourCounts[key] || 0) + 1;
          });

          return Object.entries(hourCounts)
            .map(([hour, requests]) => ({ hour, requests }))
            .slice(8, 18); // Business hours
        }
      }

      if (data && data.length > 0) {
        const hourCounts: Record<string, number> = {};
        for (let i = 0; i < 24; i++) {
          hourCounts[`${i.toString().padStart(2, '0')}:00`] = 0;
        }

        data.forEach(event => {
          const hour = new Date(event.created_at || '').getHours();
          const key = `${hour.toString().padStart(2, '0')}:00`;
          hourCounts[key] = (hourCounts[key] || 0) + 1;
        });

        return Object.entries(hourCounts)
          .map(([hour, requests]) => ({ hour, requests }))
          .slice(8, 18);
      }

      // Default business hours
      return Array.from({ length: 10 }, (_, i) => ({
        hour: `${(8 + i).toString().padStart(2, '0')}:00`,
        requests: 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Real session metrics from active_sessions table
  const { data: sessionMetrics, isLoading: loadingSessions } = useQuery({
    queryKey: ["session-metrics-real"],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      const { data: sessions, error } = await supabase
        .from('active_sessions')
        .select('created_at, last_activity, is_active')
        .gte('created_at', sevenDaysAgo);

      if (error || !sessions || sessions.length === 0) {
        return {
          avgDuration: 0,
          totalSessions: 0,
          avgPagesPerSession: 0,
          bounceRate: 0,
        };
      }

      // Calculate average session duration
      const durations = sessions.map(s => {
        const start = new Date(s.created_at).getTime();
        const end = new Date(s.last_activity).getTime();
        return (end - start) / 1000 / 60; // minutes
      }).filter(d => d > 0 && d < 480); // Filter valid durations (< 8 hours)

      const avgDuration = durations.length > 0 
        ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
        : 0;

      // Get analytics for pages per session
      const { count: eventCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo);

      const avgPagesPerSession = sessions.length > 0 && eventCount
        ? Math.round(((eventCount || 0) / sessions.length) * 10) / 10
        : 0;

      // Calculate bounce rate (sessions with only 1 page view)
      const bounceRate = sessions.length > 0
        ? Math.round((sessions.filter(s => {
            const duration = (new Date(s.last_activity).getTime() - new Date(s.created_at).getTime()) / 1000;
            return duration < 30; // Less than 30 seconds
          }).length / sessions.length) * 100 * 10) / 10
        : 0;

      return {
        avgDuration,
        totalSessions: sessions.length,
        avgPagesPerSession,
        bounceRate,
      };
    },
    staleTime: 5 * 60 * 1000,
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
    a.download = `usage-metrics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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

  const totalAccess = moduleAccess?.reduce((sum, m) => sum + m.count, 0) || 0;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Usage Metrics
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time usage metrics from Supabase analytics
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={!moduleAccess || moduleAccess.length === 0}>
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
              <span className="text-2xl font-bold">
                {sessionMetrics?.avgDuration || 0} min
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {sessionMetrics?.totalSessions || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Page Views (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalAccess}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={sessionMetrics?.bounceRate && sessionMetrics.bounceRate > 50 ? "destructive" : "outline"} className="text-lg">
              {sessionMetrics?.bounceRate || 0}%
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
          {totalAccess > 0 ? (
            <LazyBarChart data={moduleChartData} height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data available yet. Analytics will appear as users navigate the app.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Peak Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
          <CardDescription>Request distribution throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          {peakHours && peakHours.some(h => h.requests > 0) ? (
            <LazyBarChart data={peakHoursChartData} height={300} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No hourly data available yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Module Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Module Statistics</CardTitle>
          <CardDescription>Detailed usage metrics for each module</CardDescription>
        </CardHeader>
        <CardContent>
          {moduleAccess && moduleAccess.length > 0 && totalAccess > 0 ? (
            <div className="space-y-3">
              {moduleAccess.map((module) => (
                <div key={module.module} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{module.module}</h3>
                    <p className="text-sm text-muted-foreground">
                      {totalAccess > 0 ? Math.round((module.count / totalAccess) * 100) : 0}% of total traffic
                    </p>
                  </div>
                  <Badge variant="outline">{module.count} accesses</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No module access data available yet. Data will populate as users interact with the application.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
