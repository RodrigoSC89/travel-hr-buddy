import { useEffect, useState } from "react";
import { 
  DashboardJobs, 
  JobsTrendChart, 
  JobsForecastReport, 
  PainelBI,
  ComplianceByVesselChart,
  ComplianceByVesselTable 
} from "@/components/bi";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface JobTrendData {
  month: string;
  total_jobs: number;
  monthLabel: string;
}

export default function AdminBI() {
  const [trendData, setTrendData] = useState<JobTrendData[]>([]);

  useEffect(() => {
    async function fetchTrendData() {
      try {
        const { data, error } = await supabase.rpc("jobs_trend_by_month");
        
        if (error) {
          logger.error("Error fetching jobs trend", { error });
          setTrendData([]);
        } else {
          // RPC returns { count, month } - map to JobTrendData
          setTrendData((data || []).map(item => ({
            month: item.month,
            total_jobs: item.count,
            monthLabel: item.month,
          })));
        }
      } catch (error) {
        logger.error("Error invoking function", { error });
        setTrendData([]);
      }
    }
    
    fetchTrendData();
  }, []);

  // Transform data for JobsForecastReport component
  const forecastTrendData = trendData.map((item) => ({
    date: item.month,
    jobs: item.total_jobs,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">📊 Business Intelligence Dashboard</h1>
        <p className="text-muted-foreground">
          Análise de dados de manutenção com visualizações e previsões de IA
        </p>
      </div>

      <div className="grid gap-6">
        {/* IMCA Compliance Panel */}
        <PainelBI />

        {/* DP Incidents Compliance by Vessel */}
        <ComplianceByVesselChart />
        <ComplianceByVesselTable />

        {/* Jobs by Component Analysis */}
        <DashboardJobs />

        {/* Job Trend Chart - Last 6 months */}
        <JobsTrendChart />

        {/* AI-Powered Forecasts */}
        <JobsForecastReport trend={forecastTrendData} />
      </div>
    </div>
  );
}
