import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartDataPoint {
  day: string;
  count: number;
}

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
  last_execution?: string;
}

export default function RestoreChartEmbed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [summary, setSummary] = useState<RestoreSummary | null>(null);

  // Token verification
  useEffect(() => {
    const allowedToken = import.meta.env.VITE_EMBED_ACCESS_TOKEN;
    const allowed = token === allowedToken;
    
    if (!allowed) {
      navigate("/unauthorized");
    }
  }, [token, navigate]);

  // Fetch chart data and summary
  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch chart data
        const { data: chartResponse, error: chartError } = await supabase
          .rpc("get_restore_count_by_day_with_email", {
            email_input: email,
          });

        if (chartError) {
          console.error("Error fetching restore chart data:", chartError);
          throw new Error("Erro ao carregar dados do gráfico");
        }

        // Fetch summary statistics
        const { data: summaryResponse, error: summaryError } = await supabase
          .rpc("get_restore_summary", {
            email_input: email,
          });

        if (summaryError) {
          console.error("Error fetching restore summary:", summaryError);
          throw new Error("Erro ao carregar estatísticas");
        }

        // Check if component is still mounted
        if (!isMounted || abortController.signal.aborted) {
          return;
        }

        // Process chart data
        const processedData = (chartResponse || []).map((item: any) => ({
          day: new Date(item.day).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
          }),
          count: item.count,
        }));

        setChartData(processedData.reverse());

        // Get last execution from the most recent restore
        const { data: lastRestore, error: lastRestoreError } = await supabase
          .from("document_restore_logs")
          .select("restored_at")
          .order("restored_at", { ascending: false })
          .limit(1)
          .single();

        if (lastRestoreError && lastRestoreError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" which is acceptable
          console.error("Error fetching last restore:", lastRestoreError);
        }

        // Set summary with last execution
        if (summaryResponse && summaryResponse.length > 0 && isMounted) {
          setSummary({
            total: summaryResponse[0].total || 0,
            unique_docs: summaryResponse[0].unique_docs || 0,
            avg_per_day: Number(summaryResponse[0].avg_per_day) || 0,
            last_execution: lastRestore?.restored_at
              ? new Date(lastRestore.restored_at).toLocaleString("pt-BR")
              : "N/A",
          });
        }

        // Signal that chart is ready for screenshot
        if (isMounted) {
          (window as any).chartReady = true;
        }
      } catch (error) {
        console.error("Error in RestoreChartEmbed:", error);
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Erro ao carregar dados. Por favor, tente novamente."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [email]);

  if (loading) {
    return (
      <div
        style={{
          width: "600px",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              width: "32px",
              height: "32px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "12px",
            }}
          />
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            Carregando dados...
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "600px",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "16px",
            }}
          >
            ⚠️
          </div>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#dc2626",
              marginBottom: "8px",
            }}
          >
            Erro ao Carregar Dados
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              margin: 0,
            }}
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  const data = {
    labels: chartData.map((d) => d.day),
    datasets: [
      {
        label: "Restaurações",
        data: chartData.map((d) => d.count),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
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
    <div
      style={{
        width: "600px",
        minHeight: "450px",
        padding: "20px",
        backgroundColor: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#111",
        }}
      >
        Restaurações de Documentos
      </h2>

      {/* Statistics Grid */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "20px",
            fontSize: "13px",
            color: "#374151",
          }}
        >
          <div>
            <span style={{ marginRight: "6px" }}>📦</span>
            <strong>Total:</strong> {summary.total}
          </div>
          <div>
            <span style={{ marginRight: "6px" }}>📁</span>
            <strong>Documentos únicos:</strong> {summary.unique_docs}
          </div>
          <div>
            <span style={{ marginRight: "6px" }}>📊</span>
            <strong>Média/dia:</strong> {summary.avg_per_day.toFixed(2)}
          </div>
          <div>
            <span style={{ marginRight: "6px" }}>🕒</span>
            <strong>Última execução:</strong> {summary.last_execution}
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: "280px" }}>
        {chartData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            Nenhum dado disponível
          </div>
        )}
      </div>
    </div>
  );
}
