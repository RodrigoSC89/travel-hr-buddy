"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

export default function RestoreChartEmbedPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    supabase.rpc("get_restore_count_by_day_with_email", { email_input: "" })
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
    <div style={{ width: "600px", height: "300px", margin: "2rem auto" }}>
      <Bar data={chartData} />
    </div>
  );
}
