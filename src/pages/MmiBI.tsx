"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import JobsForecastReport from "@/components/bi/JobsForecastReport";
import { ExportBIReport } from "@/components/bi/ExportPDF";

const data = [
  { sistema: "Gerador", ia_efetiva: 6, total: 10 },
  { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
  { sistema: "Propulsão", ia_efetiva: 4, total: 9 },
  { sistema: "Climatização", ia_efetiva: 5, total: 5 },
];

export default function MmiBI() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [forecastText, setForecastText] = useState("");

  useEffect(() => {
    // Simulate fetching trend data
    // In production, this would fetch from /api/bi/jobs-trend
    const mockTrendData = [
      { date: "Jan", count: 12 },
      { date: "Fev", count: 15 },
      { date: "Mar", count: 18 },
      { date: "Abr", count: 14 },
      { date: "Mai", count: 20 },
      { date: "Jun", count: 17 },
    ];
    setTrendData(mockTrendData);
    
    // Simulate forecast text
    setForecastText("Baseado nos dados históricos, prevê-se um aumento de 15% nas manutenções no próximo trimestre, com foco em sistemas hidráulicos e de propulsão.");
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🔍 BI - Efetividade da IA na Manutenção</h1>
        <ExportBIReport elementId="bi-dashboard-content" />
      </div>

      <div id="bi-dashboard-content">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardContent className="p-6">
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
          
          {/* Jobs Trend Chart */}
          <JobsTrendChart data={trendData} />
          
          {/* Forecast Report */}
          <JobsForecastReport forecastText={forecastText} />
        </div>
      </div>
    </div>
  );
}
