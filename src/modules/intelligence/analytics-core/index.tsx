import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { BarChart as BarChartIcon, TrendingUp, PieChart, Activity, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAnalyticsTracking } from "./hooks/useAnalyticsTracking";
import { useToast } from "@/hooks/use-toast";

const AnalyticsCoreModule = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [eventStats, setEventStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { trackPageView } = useAnalyticsTracking();
  const { toast } = useToast();

  useEffect(() => {
    trackPageView("Analytics Core");
    loadAnalyticsData();
    subscribeToRealtimeEvents();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from("analytics_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Calculate event statistics
      const stats = calculateEventStats(eventsData || []);
      setEventStats(stats);
    } catch (error: any) {
      console.error("Error loading analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEventStats = (eventsData: any[]) => {
    const eventCounts: Record<string, number> = {};
    eventsData.forEach(event => {
      eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;
    });

    return Object.entries(eventCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);
  };

  const subscribeToRealtimeEvents = () => {
    const channel = supabase
      .channel('analytics_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events'
        },
        (payload) => {
          setEvents(prev => [payload.new, ...prev]);
          loadAnalyticsData(); // Refresh stats
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Event Name", "Timestamp", "User ID", "Page URL"],
      ...events.map(e => [
        e.event_name,
        new Date(e.timestamp).toLocaleString(),
        e.user_id || "N/A",
        e.page_url || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics_export_${Date.now()}.csv`;
    a.click();

    toast({
      title: "Success",
      description: "Analytics data exported to CSV"
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Activity className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChartIcon className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Analytics Core</h1>
            <p className="text-muted-foreground">Real-time analytics and event tracking</p>
          </div>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Event Types</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats.length}</div>
            <p className="text-xs text-muted-foreground">Unique types</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Real-time Updates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground">Supabase Realtime</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => {
                const eventDate = new Date(e.timestamp);
                const today = new Date();
                return eventDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Event Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {events.slice(0, 20).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{event.event_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono">{event.session_id?.slice(0, 12)}...</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCoreModule;
