import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface JobTrendData {
  month: string;
  total_jobs: number;
}

export default function BIDashboard() {
  const [trendData, setTrendData] = useState<JobTrendData[]>([]);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const { data, error } = await supabase.rpc("jobs_trend_by_month");
        if (!error && data) {
          setTrendData(data);
        }
      } catch (error) {
        console.error("Error fetching trend data for forecast:", error);
      }
    }
    fetchTrendData();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">📊 Business Intelligence Dashboard</h1>
      
      {/* Jobs by Component */}
      <DashboardJobs />
      
      {/* Jobs Trend Chart */}
      <JobsTrendChart />
      
      {/* AI-Powered Forecasts */}
      <JobsForecastReport trend={trendData.map(item => ({ date: item.month, jobs: item.total_jobs }))} />
    </div>
  );
}
