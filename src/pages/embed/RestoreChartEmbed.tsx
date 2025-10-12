import { useEffect, useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { supabase } from "@/integrations/supabase/client";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RestoreData {
  day: string;
  count: number;
}

/**
 * Public embed route for restore metrics chart
 * This route is designed to be captured by Puppeteer for PDF generation
 * No authentication required - renders chart with minimal UI
 */
export default function RestoreChartEmbed() {
  const [data, setData] = useState<RestoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);
      
      // Call the RPC function to get restore count by day
      const { data: restoreData, error: rpcError } = await supabase
        .rpc("get_restore_count_by_day_with_email", {
          email_input: "", // Empty string to get all data
        });

      if (rpcError) {
        throw rpcError;
      }

      if (!restoreData || restoreData.length === 0) {
        setError("No data available");
        setLoading(false);
        return;
      }

      setData(restoreData);
      setLoading(false);
      
      // Signal that chart is ready for screenshot (used by Puppeteer)
      setTimeout(() => {
        (window as any).chartReady = true;
      }, 1000);
    } catch (err) {
      console.error("Error loading chart data:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart data");
      setLoading(false);
    }
  };

  // Format data for Chart.js
  const chartData = {
    labels: data.map((d) => {
      const date = new Date(d.day);
      return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
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

  const chartOptions = {
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
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}>
        <div>Carregando gráfico...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        color: "#dc2626",
      }}>
        <div>Erro ao carregar dados: {error}</div>
      </div>
    );
  }

  return (
    <div style={{
      padding: "20px",
      fontFamily: "Arial, sans-serif",
      background: "white",
      minHeight: "100vh",
    }}>
      <div style={{
        width: "800px",
        height: "500px",
        margin: "0 auto",
      }}>
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
