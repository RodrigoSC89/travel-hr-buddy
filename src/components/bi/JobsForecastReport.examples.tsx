// Example Usage of JobsForecastReport Component
// This file demonstrates how to integrate the JobsForecastReport component into your application

import { useState, useEffect } from "react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import DashboardJobs from "@/components/bi/DashboardJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

// Example 1: Basic usage with hardcoded trend data
export function BasicExample() {
  const trendData = [
    { date: "2025-08", jobs: 45 },
    { date: "2025-09", jobs: 52 },
    { date: "2025-10", jobs: 48 },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs Forecast Dashboard</h1>
      <JobsForecastReport trend={trendData} />
    </div>
  );
}

// Example 2: Integration with Supabase real data
export function ApiExample() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const { data, error } = await supabase
          .from('action_items')
          .select('created_at')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Aggregate by month
        const monthlyMap = new Map<string, number>();
        (data || []).forEach(item => {
          const month = item.created_at?.substring(0, 7) || '';
          if (month) {
            monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
          }
        });

        const trend = Array.from(monthlyMap.entries())
          .map(([date, jobs]) => ({ date, jobs }))
          .slice(-6);

        setTrendData(trend.length > 0 ? trend : [
          { date: "2025-08", jobs: 0 },
          { date: "2025-09", jobs: 0 },
          { date: "2025-10", jobs: 0 },
        ]);
      } catch (error) {
        logger.error("Error fetching trend data:", error);
        setTrendData([]);
      } finally {
        setLoading(false);
      }
    }

    void fetchTrendData();
  }, []);

  if (loading) {
    return <div>Loading trend data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <JobsForecastReport trend={trendData} />
    </div>
  );
}

// Example 3: Full BI Dashboard with multiple components
export function FullBIDashboard() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);

  useEffect(() => {
    async function loadTrend() {
      const { data } = await supabase
        .from('action_items')
        .select('created_at')
        .order('created_at', { ascending: true });

      const monthlyMap = new Map<string, number>();
      (data || []).forEach(item => {
        const month = item.created_at?.substring(0, 7) || '';
        if (month) monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });

      setTrendData(Array.from(monthlyMap.entries()).map(([date, jobs]) => ({ date, jobs })).slice(-6));
    }
    void loadTrend();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Business Intelligence - Jobs Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardJobs />
            <JobsForecastReport trend={trendData} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Example 4: With manual refresh capability
export function RefreshableExample() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadTrend() {
      const { data } = await supabase
        .from('action_items')
        .select('created_at')
        .order('created_at', { ascending: true });

      const monthlyMap = new Map<string, number>();
      (data || []).forEach(item => {
        const month = item.created_at?.substring(0, 7) || '';
        if (month) monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });

      setTrendData(Array.from(monthlyMap.entries()).map(([date, jobs]) => ({ date, jobs })).slice(-6));
    }
    void loadTrend();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Jobs Forecast</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          🔄 Refresh Trend Data
        </button>
      </div>
      <JobsForecastReport key={refreshKey} trend={trendData} />
    </div>
  );
}

// Example 5: Integration in existing page
export function IntegrateInExistingPage() {
  const [showForecast, setShowForecast] = useState(false);
  const [trendData] = useState([
    { date: "2025-08", jobs: 45 },
    { date: "2025-09", jobs: 52 },
    { date: "2025-10", jobs: 48 },
  ]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Jobs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your existing jobs statistics and charts...</p>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showForecast}
          onChange={(e) => setShowForecast(e.target.checked)}
          id="show-forecast"
        />
        <label htmlFor="show-forecast">Show AI Forecast</label>
      </div>

      {showForecast && <JobsForecastReport trend={trendData} />}
    </div>
  );
}

// Example 6: With Supabase real-time data
export function RealtimeExample() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);

  useEffect(() => {
    async function fetchFromSupabase() {
      const { data } = await supabase
        .from('action_items')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(500);
      
      const monthlyMap = new Map<string, number>();
      (data || []).forEach(item => {
        const month = item.created_at?.substring(0, 7) || '';
        if (month) monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });

      setTrendData(Array.from(monthlyMap.entries()).map(([date, jobs]) => ({ date, jobs })).slice(-6));
    }

    void fetchFromSupabase();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Real-time Jobs Forecast</h2>
      <JobsForecastReport trend={trendData} />
    </div>
  );
}

// Export all examples for easy access
export default {
  BasicExample,
  ApiExample,
  FullBIDashboard,
  RefreshableExample,
  IntegrateInExistingPage,
  RealtimeExample,
};
