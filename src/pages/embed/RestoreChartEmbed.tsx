import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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

interface StatusDistribution {
  success: number;
  error: number;
  pending: number;
}

/**
 * RestoreChartEmbed Component
 * 
 * A secure, embeddable dashboard page that displays aggregated statistics
 * and visual analytics for document restoration logs.
 * 
 * Features:
 * - Token-based access protection
 * - Bar chart showing restoration count by day (last 7 days)
 * - Pie chart showing distribution by execution status
 * - Summary statistics (total restorations, unique documents, avg per day, last execution)
 * - Responsive layout (2 columns on desktop, stacked on mobile)
 * - Professional white background design
 * 
 * Security:
 * - Requires valid token via URL parameter (?token=YOUR_TOKEN)
 * - Redirects to /unauthorized for invalid tokens
 * - Token configured via VITE_EMBED_ACCESS_TOKEN environment variable
 * 
 * Usage:
 * /embed/restore-chart?token=YOUR_SECRET_TOKEN
 */
export default function RestoreChartEmbed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "";

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution>({
    success: 0,
    error: 0,
    pending: 0,
  });

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
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch chart data (last 7 days)
        const { data: chartResponse, error: chartError } = await supabase
          .rpc("get_restore_count_by_day_with_email", {
            email_input: email,
          });

        if (chartError) {
          console.error("Error fetching restore chart data:", chartError);
          throw chartError;
        }

        // Fetch summary statistics
        const { data: summaryResponse, error: summaryError } = await supabase
          .rpc("get_restore_summary", {
            email_input: email,
          });

        if (summaryError) {
          console.error("Error fetching restore summary:", summaryError);
          throw summaryError;
        }

        // Fetch report logs for status distribution
        const { data: reportLogs, error: reportError } = await supabase
          .from("restore_report_logs")
          .select("status")
          .order("executed_at", { ascending: false })
          .limit(100);

        if (reportError) {
          console.error("Error fetching report logs:", reportError);
        }

        // Calculate status distribution
        const distribution = {
          success: 0,
          error: 0,
          pending: 0,
        };

        if (reportLogs) {
          reportLogs.forEach((log) => {
            if (log.status === "success") distribution.success++;
            else if (log.status === "error") distribution.error++;
            else if (log.status === "pending") distribution.pending++;
          });
        }

        setStatusDistribution(distribution);

        // Process chart data - limit to last 7 days
        const processedData = (chartResponse || [])
          .slice(0, 7)
          .map((item: any) => ({
            day: new Date(item.day).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            }),
            count: item.count,
          }));

        setChartData(processedData.reverse());

        // Get last execution from the most recent restore report
        const { data: lastReport } = await supabase
          .from("restore_report_logs")
          .select("executed_at")
          .order("executed_at", { ascending: false })
          .limit(1)
          .single();

        // Set summary with last execution
        if (summaryResponse && summaryResponse.length > 0) {
          setSummary({
            total: summaryResponse[0].total || 0,
            unique_docs: summaryResponse[0].unique_docs || 0,
            avg_per_day: Number(summaryResponse[0].avg_per_day) || 0,
            last_execution: lastReport?.executed_at
              ? new Date(lastReport.executed_at).toLocaleString("pt-BR")
              : "N/A",
          });
        }

        // Signal that chart is ready for screenshot
        (window as any).chartReady = true;
      } catch (error) {
        console.error("Error in RestoreChartEmbed:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [email]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          minHeight: "800px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#666", fontSize: "14px" }}>Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Bar chart configuration
  const barData = {
    labels: chartData.map((d) => d.day),
    datasets: [
      {
        label: "Restaurações",
        data: chartData.map((d) => d.count),
        backgroundColor: "#3b82f6",
        borderRadius: 4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `Restaurações: ${context.parsed.y}`;
          },
        },
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

  // Pie chart configuration for status distribution
  const pieData = {
    labels: ["Sucesso", "Erro", "Pendente"],
    datasets: [
      {
        data: [
          statusDistribution.success,
          statusDistribution.error,
          statusDistribution.pending,
        ],
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.parsed || 0;
            const total =
              statusDistribution.success +
              statusDistribution.error +
              statusDistribution.pending;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        minHeight: "800px",
        padding: "32px 24px",
        backgroundColor: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            color: "#111827",
          }}
        >
          📊 Dashboard de Restaurações
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          Estatísticas e análises visuais de logs de restauração de documentos
        </p>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px", marginRight: "12px" }}>📦</span>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                Total de Restaurações
              </span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
              {summary.total}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px", marginRight: "12px" }}>📁</span>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                Documentos Únicos
              </span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
              {summary.unique_docs}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px", marginRight: "12px" }}>📊</span>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                Média por Dia
              </span>
            </div>
            <div style={{ fontSize: "32px", fontWeight: "700", color: "#111827" }}>
              {summary.avg_per_day.toFixed(1)}
            </div>
          </div>

          <div
            style={{
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "24px", marginRight: "12px" }}>🕒</span>
              <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                Última Execução
              </span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
              {summary.last_execution}
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid - Responsive 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        {/* Bar Chart */}
        <div
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              color: "#111827",
            }}
          >
            📈 Restaurações por Dia (Últimos 7 Dias)
          </h2>
          <div style={{ height: "320px" }}>
            {chartData.length > 0 ? (
              <Bar data={barData} options={barOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div
          style={{
            padding: "24px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "20px",
              color: "#111827",
            }}
          >
            🎯 Distribuição por Status
          </h2>
          <div style={{ height: "320px" }}>
            {statusDistribution.success +
              statusDistribution.error +
              statusDistribution.pending >
            0 ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              >
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "32px",
          paddingTop: "16px",
          borderTop: "1px solid #e5e7eb",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        Atualizado em tempo real • Dashboard de Restaurações de Documentos
      </div>

      {/* Add spinning animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
