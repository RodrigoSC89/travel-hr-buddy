import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { ExportBIReport } from "@/components/bi/ExportPDF";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";
import { supabase } from "@/integrations/supabase/client";

const data = [
  { sistema: "Gerador", ia_efetiva: 6, total: 10 },
  { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
  { sistema: "Propulsão", ia_efetiva: 4, total: 9 },
  { sistema: "Climatização", ia_efetiva: 5, total: 5 },
];

interface TrendData {
  month: string;
  total_jobs: number;
  monthLabel?: string;
}

export default function MmiBI() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [forecastText, setForecastText] = useState("");
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    async function fetchTrendData() {
      setLoadingTrend(true);
      try {
        const { data: result, error } = await supabase.rpc("jobs_trend_by_month");
        
        if (error) {
          console.error("Error fetching trend data:", error);
          // Fallback to mock data
          setTrendData([
            { month: "2025-05", total_jobs: 12, monthLabel: "mai de 2025" },
            { month: "2025-06", total_jobs: 15, monthLabel: "jun de 2025" },
            { month: "2025-07", total_jobs: 18, monthLabel: "jul de 2025" },
            { month: "2025-08", total_jobs: 14, monthLabel: "ago de 2025" },
            { month: "2025-09", total_jobs: 20, monthLabel: "set de 2025" },
            { month: "2025-10", total_jobs: 16, monthLabel: "out de 2025" },
          ]);
        } else {
          setTrendData(result || []);
        }
      } catch (error) {
        console.error("Error invoking trend function:", error);
        // Fallback to mock data
        setTrendData([
          { month: "2025-05", total_jobs: 12, monthLabel: "mai de 2025" },
          { month: "2025-06", total_jobs: 15, monthLabel: "jun de 2025" },
          { month: "2025-07", total_jobs: 18, monthLabel: "jul de 2025" },
          { month: "2025-08", total_jobs: 14, monthLabel: "ago de 2025" },
          { month: "2025-09", total_jobs: 20, monthLabel: "set de 2025" },
          { month: "2025-10", total_jobs: 16, monthLabel: "out de 2025" },
        ]);
      } finally {
        setLoadingTrend(false);
      }
    }

    fetchTrendData();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔍 BI - Efetividade da IA na Manutenção</h1>
        <ExportBIReport trend={trendData} forecast={forecastText} />
      </div>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">📊 Efetividade das Sugestões da IA</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="sistema" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#d1d5db" name="Total de Jobs" />
              <Bar dataKey="ia_efetiva" fill="#4ade80" name="IA foi eficaz" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* New DashboardJobs Component - Shows job distribution by component */}
      <DashboardJobs />

      {/* JobsTrendChart Component - Shows last 6 months job completion trend */}
      <JobsTrendChart />

      {/* JobsForecastReport Component - Shows AI-powered forecast */}
      <JobsForecastReport trend={trendData} onForecastUpdate={setForecastText} />

      {/* ForecastHistoryList Component - Shows historical forecasts with filtering */}
      <ForecastHistoryList />
    </div>
  );
}
