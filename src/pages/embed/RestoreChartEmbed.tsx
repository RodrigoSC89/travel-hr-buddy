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

/**
 * Minimalist embed page for restore chart
 * Designed for automated screenshot capture (Puppeteer, etc.)
 * Renders outside SmartLayout with no authentication
 */
export default function RestoreChartEmbed() {
  const [data, setData] = useState<RestoreData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: result, error } = await supabase.rpc(
          "get_restore_count_by_day_with_email",
          { email_input: "" }
        );

        if (error) {
          console.error("Error fetching restore data:", error);
          return;
        }

        if (result && result.length > 0) {
          setData(result);
          // Signal that chart is ready for screenshot
          (window as any).chartReady = true;
        }
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ 
        width: "800px", 
        height: "500px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "white",
        fontFamily: "Arial, sans-serif"
      }}>
        Carregando...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ 
        width: "800px", 
        height: "500px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        background: "white",
        fontFamily: "Arial, sans-serif"
      }}>
        Nenhum dado disponível
      </div>
    );
  }

  // Format data for chart
  const labels = data.map((d) => {
    const date = new Date(d.day);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  });

  const chartData = {
    labels: labels,
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

  return (
    <div
      style={{
        margin: 0,
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        background: "white",
      }}
    >
      <div
        style={{
          width: "800px",
          height: "500px",
          margin: "0 auto",
        }}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
