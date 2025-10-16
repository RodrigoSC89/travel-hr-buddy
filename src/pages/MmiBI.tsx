"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DashboardJobs from "@/components/bi/DashboardJobs";
import JobsTrendChart from "@/components/bi/JobsTrendChart";
import { ForecastHistoryList } from "@/components/bi/ForecastHistoryList";

const data = [
  { sistema: "Gerador", ia_efetiva: 6, total: 10 },
  { sistema: "Hidráulico", ia_efetiva: 8, total: 12 },
  { sistema: "Propulsão", ia_efetiva: 4, total: 9 },
  { sistema: "Climatização", ia_efetiva: 5, total: 5 },
];

export default function MmiBI() {
  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <h1 className="text-2xl font-bold">🔍 BI - Efetividade da IA na Manutenção</h1>

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

      {/* ForecastHistoryList Component - Shows forecast history with filters */}
      <Card>
        <CardContent className="pt-6">
          <ForecastHistoryList />
        </CardContent>
      </Card>
    </div>
  );
}
