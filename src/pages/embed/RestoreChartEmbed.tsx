import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RestoreLogData {
  date: string;
  count: number;
}

declare global {
  interface Window {
    chartReady?: boolean;
  }
}

export default function RestoreChartEmbed() {
  const [data, setData] = useState<RestoreLogData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch restore report logs from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: logs, error } = await supabase
          .from("restore_report_logs")
          .select("executed_at, status")
          .gte("executed_at", thirtyDaysAgo.toISOString())
          .order("executed_at", { ascending: true });

        if (error) {
          console.error("Error fetching restore logs:", error);
          setData([]);
          return;
        }

        // Group by date and count
        const grouped = (logs || []).reduce((acc, log) => {
          const date = new Date(log.executed_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          });
          if (!acc[date]) {
            acc[date] = 0;
          }
          acc[date]++;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(grouped).map(([date, count]) => ({
          date,
          count,
        }));

        setData(chartData);
        
        // Signal that chart is ready for screenshot
        window.chartReady = true;
        console.log("Chart data loaded, chartReady = true");
      } catch (error) {
        console.error("Error in fetchData:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        width: "600px", 
        height: "300px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "white"
      }}>
        <p>Carregando...</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: "Logs de Restore",
        data: data.map((d) => d.count),
        backgroundColor: "#3b82f6", // Blue color
        borderColor: "#3b82f6",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Restore Logs - Últimos 30 Dias",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ 
      width: "600px", 
      height: "300px", 
      backgroundColor: "white",
      padding: "20px"
    }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
