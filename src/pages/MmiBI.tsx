"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { ExportBIReport } from "@/components/bi/ExportPDF";
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
}

export default function MmiBI() {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [forecastText, setForecastText] = useState("");
  const [loadingTrend, setLoadingTrend] = useState(false);

  useEffect(() => {
    async function fetchTrend() {
      setLoadingTrend(true);
      try {
        const { data: result, error } = await supabase.functions.invoke("bi-jobs-trend");
        
        if (error) {
          console.error("Error fetching trend data:", error);
          // Use mock data if API fails
          setTrendData([
            { month: "Mai", total_jobs: 23 },
            { month: "Jun", total_jobs: 28 },
            { month: "Jul", total_jobs: 31 },
            { month: "Ago", total_jobs: 27 },
            { month: "Set", total_jobs: 34 },
            { month: "Out", total_jobs: 29 },
          ]);
        } else {
          setTrendData(result || []);
        }
      } catch (error) {
        console.error("Error invoking trend function:", error);
        // Use mock data if API fails
        setTrendData([
          { month: "Mai", total_jobs: 23 },
          { month: "Jun", total_jobs: 28 },
          { month: "Jul", total_jobs: 31 },
          { month: "Ago", total_jobs: 27 },
          { month: "Set", total_jobs: 34 },
          { month: "Out", total_jobs: 29 },
        ]);
      } finally {
        setLoadingTrend(false);
      }
    }
    fetchTrend();
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

      {/* DashboardJobs Component - Shows job distribution by component */}
      <DashboardJobs />

      {/* JobsTrendChart Component - Shows job trends over time */}
      <JobsTrendChart data={trendData} loading={loadingTrend} />

      {/* JobsForecastReport Component - Shows AI-generated maintenance forecasts */}
      <JobsForecastReport 
        trend={trendData} 
        onForecastUpdate={(forecast: string) => setForecastText(forecast)}
      />
    </div>
  );
}
