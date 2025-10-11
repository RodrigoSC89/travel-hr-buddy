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

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface RestoreCountData {
  day: string;
  count: number;
}

export default function RestoreDashboardPage() {
  const [data, setData] = useState<RestoreCountData[]>([]);

  useEffect(() => {
    supabase
      .rpc("get_restore_count_by_day")
      .then(({ data }) => setData(data || []));
  }, []);

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
      <Card>
        <CardContent>
          <Bar data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
