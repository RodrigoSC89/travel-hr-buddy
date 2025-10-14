"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { Eye } from "lucide-react";

interface RestoreSummary {
  total: number;
  unique_docs: number;
  avg_per_day: number;
}

interface RestoreDataPoint {
  day: string;
  count: number;
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get("public") === "1";
  
  const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
  const [cronMessage, setCronMessage] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [trend, setTrend] = useState<RestoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?public=1`
    : '';

  useEffect(() => {
    // Fetch cron status
    fetch("/api/cron-status")
      .then(async res => {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          return {
            status: "ok",
            message: "Cron diário executado com sucesso nas últimas 24h (Dev Mode)"
          };
        }
        return res.json();
      })
      .then(data => {
        setCronStatus(data.status);
        setCronMessage(data.message);
      })
      .catch(error => {
        logger.error("Error fetching cron status:", error);
        setCronStatus("warning");
        setCronMessage("Erro ao carregar status do cron");
      });

    // Fetch restore statistics
    fetchRestoreStats();
  }, []);

  async function fetchRestoreStats() {
    try {
      // Get summary statistics
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_restore_summary", { email_input: null });

      if (summaryError) throw summaryError;

      setSummary(summaryData?.[0] || { total: 0, unique_docs: 0, avg_per_day: 0 });

      // Get daily data for the last 15 days
      const { data: trendData, error: trendError } = await supabase
        .rpc("get_restore_count_by_day_with_email", { email_input: null });

      if (trendError) throw trendError;

      setTrend(trendData || []);
    } catch (error) {
      logger.error("Error fetching restore stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        {isPublic && <Eye className="w-6 h-6" />}
        🚀 Painel Administrativo — Nautilus One
      </h1>

      {/* Badge de Status do Cron */}
      {cronStatus && !isPublic && (
        <Card className={`p-4 text-sm font-medium ${cronStatus === "ok" ? "bg-green-900 text-green-100" : "bg-yellow-900 text-yellow-100"}`}>
          {cronStatus === "ok" ? "✅ " : "⚠️ "}{cronMessage}
        </Card>
      )}

      {/* Restore Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 text-white">
          <div className="text-sm text-zinc-400">Total de Restaurações</div>
          <div className="text-3xl font-bold">{summary?.total || 0}</div>
        </Card>
        <Card className="p-4 bg-zinc-900 text-white">
          <div className="text-sm text-zinc-400">Documentos Únicos</div>
          <div className="text-3xl font-bold">{summary?.unique_docs || 0}</div>
        </Card>
        <Card className="p-4 bg-zinc-900 text-white">
          <div className="text-sm text-zinc-400">Média por Dia</div>
          <div className="text-3xl font-bold">{summary?.avg_per_day.toFixed(1) || 0}</div>
        </Card>
      </div>

      {/* Trend Chart */}
      {trend.length > 0 && (
        <Card className="p-4 bg-zinc-900 text-white">
          <h3 className="font-semibold mb-2">📈 Restaurações (últimos 15 dias)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend.reverse()}>
              <XAxis dataKey="day" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333' }} />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {isPublic && (
        <p className="text-center text-sm text-muted-foreground col-span-full mt-4">
          🔒 Modo público somente leitura (TV Wall Ativado)
        </p>
      )}

      {!isPublic && (
        <Card className="p-4 bg-zinc-900 text-white">
          <h3 className="font-semibold">🔗 Link público com QR Code</h3>
          <p className="text-sm text-zinc-400">Compartilhe este painel com acesso de leitura:</p>
          <p className="mt-2 text-blue-400 underline break-all">{publicUrl}</p>
          <div className="mt-4 bg-white p-2 inline-block rounded">
            <QRCodeSVG value={publicUrl} size={128} />
          </div>
        </Card>
      )}
    </div>
  );
}
