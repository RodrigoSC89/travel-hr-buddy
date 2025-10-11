import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

interface RestoreData {
  day: string;
  count: number;
}

export default function RestoreChartEmbed() {
  const [data, setData] = useState<RestoreData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: restoreData, error } = await supabase.rpc(
          "get_restore_count_by_day_with_email",
          { email_input: "" }
        );

        if (error) throw error;

        setData(restoreData || []);
        
        // Signal that chart is ready for screenshot
        (window as any).chartReady = true;
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.day);
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
    }),
    datasets: [
      {
        label: "Restaurações por dia",
        data: data.map((d) => d.count),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      title: {
        display: true,
        text: "Métricas de Restauração de Documentos",
        font: {
          size: 18,
          weight: "bold" as const,
        },
      },
      legend: {
        display: true,
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div
        style={{
          width: "600px",
          height: "300px",
          margin: "2rem auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Carregando...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "600px",
        height: "300px",
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
        background: "white",
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
}
