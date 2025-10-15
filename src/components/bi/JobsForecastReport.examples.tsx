// Example Usage of JobsForecastReport Component
// This file demonstrates how to integrate the JobsForecastReport component into your application

import { useState, useEffect } from "react";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import DashboardJobs from "@/components/bi/DashboardJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

// Example 2: Integration with API data
export function ApiExample() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/jobs/trend");
        const data = await response.json();
        setTrendData(data);
      } catch (error) {
        console.error("Error fetching trend data:", error);
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
    // Simulate fetching trend data
    const mockTrend = [
      { date: "2025-07", jobs: 38 },
      { date: "2025-08", jobs: 45 },
      { date: "2025-09", jobs: 52 },
      { date: "2025-10", jobs: 48 },
    ];
    setTrendData(mockTrend);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📊 Business Intelligence - Jobs Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current jobs by component */}
            <DashboardJobs />
            
            {/* AI forecast for next 2 months */}
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
      // Simulate API call
      const data = [
        { date: "2025-08", jobs: Math.floor(Math.random() * 50) + 30 },
        { date: "2025-09", jobs: Math.floor(Math.random() * 50) + 30 },
        { date: "2025-10", jobs: Math.floor(Math.random() * 50) + 30 },
      ];
      setTrendData(data);
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
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
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
      {/* Your existing page content */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your existing jobs statistics and charts...</p>
        </CardContent>
      </Card>

      {/* Toggle forecast section */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={showForecast}
          onChange={(e) => setShowForecast(e.target.checked)}
          id="show-forecast"
        />
        <label htmlFor="show-forecast">Show AI Forecast</label>
      </div>

      {/* Conditionally render forecast */}
      {showForecast && <JobsForecastReport trend={trendData} />}
    </div>
  );
}

// Example 6: With Supabase real-time data
export function RealtimeExample() {
  const [trendData, setTrendData] = useState<Array<{ date: string; jobs: number }>>([]);

  useEffect(() => {
    async function fetchFromSupabase() {
      // Example: Fetch from your Supabase database
      // const { data } = await supabase
      //   .from('job_trends')
      //   .select('*')
      //   .order('date', { ascending: false })
      //   .limit(6);
      
      // For demonstration, using mock data
      const mockData = [
        { date: "2025-05", jobs: 38 },
        { date: "2025-06", jobs: 42 },
        { date: "2025-07", jobs: 45 },
        { date: "2025-08", jobs: 51 },
        { date: "2025-09", jobs: 48 },
        { date: "2025-10", jobs: 55 },
      ];
      
      setTrendData(mockData);
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
