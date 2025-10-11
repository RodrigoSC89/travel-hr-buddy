"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Input } from "@/components/ui/input";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface RestoreCountByDay {
  day: string;
  count: number;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

export default function RestoreDashboardPage() {
  const [data, setData] = useState<RestoreCountByDay[]>([]);
  const [emailFilter, setEmailFilter] = useState("");
  const [summary, setSummary] = useState<RestoreSummary>({
    total: 0,
    unique_docs: 0,
    avg_per_day: 0,
  });

  useEffect(() => {
    async function fetchData() {
      // Fetch restore count by day
      const { data: countData } = await supabase.rpc(
        "get_restore_count_by_day_with_email",
        { email_input: emailFilter }
      );
      setData(countData || []);

      // Fetch summary statistics
      const { data: summaryData } = await supabase.rpc("get_restore_summary", {
        email_input: emailFilter,
      });
      if (summaryData && summaryData.length > 0) {
        setSummary(summaryData[0]);
      }
    }

    fetchData();
  }, [emailFilter]);

  const chartData = {
    labels: data.map((d) => format(new Date(d.day), "dd/MM")),
    datasets: [
      {
        label: "Restaurações por dia",
        data: data.map((d) => d.count),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📊 Painel de Métricas de Restauração</h1>

      <div className="max-w-sm">
        <Input
          placeholder="Filtrar por e-mail do restaurador"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="pt-6">
          <Bar data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-6">
          <h2 className="text-lg font-semibold">📈 Resumo</h2>
          <p>
            <strong>Total de Restaurações:</strong> {summary.total || 0}
          </p>
          <p>
            <strong>Documentos únicos:</strong> {summary.unique_docs || 0}
          </p>
          <p>
            <strong>Média diária:</strong>{" "}
            {summary.avg_per_day ? summary.avg_per_day.toFixed(2) : 0}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
