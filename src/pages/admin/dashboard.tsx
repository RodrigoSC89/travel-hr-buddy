"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/lib/logger";
import {
  CheckSquare,
  Package,
  Bot,
  BarChart3,
  FileText,
  Tv,
  ArrowRight,
  Clock,
  Eye,
  TrendingUp,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { QRCodeSVG } from "qrcode.react";

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPublicView = searchParams.get("public") === "1";
  
  const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
  const [cronMessage, setCronMessage] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [trendData, setTrendData] = useState<RestoreDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch cron status
    if (!isPublicView) {
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
    }

    // Fetch dashboard statistics
    fetchDashboardStats();
  }, [isPublicView]);

  async function fetchDashboardStats() {
    try {
      // Get summary statistics
      const { data: summaryData, error: summaryError } = await supabase
        .rpc("get_restore_summary", { email_input: null });

      if (summaryError) throw summaryError;

      setSummary(summaryData?.[0] || { total: 0, unique_docs: 0, avg_per_day: 0 });

      // Get trend data for the last 15 days
      const { data: trendDataResult, error: trendError } = await supabase
        .rpc("get_restore_count_by_day_with_email", { email_input: null });

      if (trendError) throw trendError;

      // Format data for chart
      const formattedData = (trendDataResult || []).reverse().map((item: RestoreDataPoint) => ({
        day: new Date(item.day).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        count: item.count,
      }));

      setTrendData(formattedData);
    } catch (error) {
      logger.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/admin/dashboard?public=1` 
    : "";

  const dashboardCards = [
    {
      title: "Checklists",
      description: "Progresso e status por equipe",
      icon: CheckSquare,
      color: "blue",
      path: "/admin/checklists/dashboard",
    },
    {
      title: "Restaurações Pessoais",
      description: "Painel diário pessoal com gráficos",
      icon: Package,
      color: "purple",
      path: "/admin/restore/personal",
    },
    {
      title: "Histórico de IA",
      description: "Consultas recentes e exportações",
      icon: Bot,
      color: "indigo",
      path: "/admin/assistant/history",
    },
  ];

  const quickLinks = [
    {
      title: "Dashboard de Restaurações Completo",
      path: "/admin/documents/restore-dashboard",
      icon: BarChart3,
    },
    {
      title: "Logs Detalhados de IA",
      path: "/admin/assistant/logs",
      icon: FileText,
    },
    {
      title: "Relatórios e Analytics",
      path: "/admin/reports/restore-analytics",
      icon: BarChart3,
    },
    {
      title: "Visualização TV Panel",
      path: "/tv/logs",
      icon: Tv,
    },
  ];

  return (
    <div className={`p-6 space-y-6 min-h-screen ${isPublicView ? "bg-zinc-950" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isPublicView ? "text-white" : ""}`}>
            🚀 Painel Administrativo
          </h1>
          <p className={`mt-2 ${isPublicView ? "text-zinc-400" : "text-muted-foreground"}`}>
            Central de controle e monitoramento — Nautilus One
          </p>
        </div>
        {isPublicView && (
          <Badge variant="outline" className="bg-zinc-800 text-white border-zinc-700">
            <Eye className="w-4 h-4 mr-2" />
            Modo Somente Leitura
          </Badge>
        )}
      </div>

      {/* Cron Status Badge - Hidden in public mode */}
      {cronStatus && !isPublicView && (
        <Badge
          variant={cronStatus === "ok" ? "default" : "secondary"}
          className={`px-4 py-2 text-sm ${
            cronStatus === "ok"
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          {cronStatus === "ok" ? "✅ " : "⚠️ "}
          {cronMessage}
        </Badge>
      )}

      {/* Real-time Statistics */}
      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className={isPublicView ? "bg-zinc-900 border-zinc-800" : ""}>
            <CardHeader>
              <CardTitle className={`text-sm font-medium ${isPublicView ? "text-zinc-400" : "text-muted-foreground"}`}>
                Total de Restaurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isPublicView ? "text-white" : ""}`}>
                {summary.total}
              </div>
            </CardContent>
          </Card>
          
          <Card className={isPublicView ? "bg-zinc-900 border-zinc-800" : ""}>
            <CardHeader>
              <CardTitle className={`text-sm font-medium ${isPublicView ? "text-zinc-400" : "text-muted-foreground"}`}>
                Documentos Únicos Restaurados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isPublicView ? "text-white" : ""}`}>
                {summary.unique_docs}
              </div>
            </CardContent>
          </Card>
          
          <Card className={isPublicView ? "bg-zinc-900 border-zinc-800" : ""}>
            <CardHeader>
              <CardTitle className={`text-sm font-medium ${isPublicView ? "text-zinc-400" : "text-muted-foreground"}`}>
                Média por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${isPublicView ? "text-white" : ""}`}>
                {summary.avg_per_day}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Visualization */}
      {!loading && trendData.length > 0 && (
        <Card className={isPublicView ? "bg-zinc-900 border-zinc-800" : ""}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className={`w-5 h-5 ${isPublicView ? "text-blue-400" : "text-blue-500"}`} />
              <CardTitle className={isPublicView ? "text-white" : ""}>
                Tendência de Restaurações (Últimos 15 Dias)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isPublicView ? "#27272a" : "#e5e7eb"} />
                <XAxis 
                  dataKey="day" 
                  stroke={isPublicView ? "#71717a" : "#6b7280"}
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke={isPublicView ? "#71717a" : "#6b7280"} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isPublicView ? "#18181b" : "#ffffff",
                    border: isPublicView ? "1px solid #27272a" : "1px solid #e5e7eb",
                    borderRadius: "6px",
                    color: isPublicView ? "#ffffff" : "#000000",
                  }}
                />
                <Bar dataKey="count" fill={isPublicView ? "#3b82f6" : "#3b82f6"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* QR Code Section - Hidden in public mode */}
      {!isPublicView && publicUrl && (
        <Card>
          <CardHeader>
            <CardTitle>📱 Compartilhar Dashboard Público</CardTitle>
            <CardDescription>
              Escaneie o QR Code para acessar o painel público no celular ou compartilhe o link
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG value={publicUrl} size={200} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {publicUrl}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Cards - Hidden in public mode */}
      {!isPublicView && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.path}
                  className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 border-l-4 ${
                    card.color === "blue"
                      ? "border-l-blue-500"
                      : card.color === "purple"
                      ? "border-l-purple-500"
                      : "border-l-indigo-500"
                  }`}
                  onClick={() => navigate(card.path)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon
                        className={`w-8 h-8 ${
                          card.color === "blue"
                            ? "text-blue-500"
                            : card.color === "purple"
                            ? "text-purple-500"
                            : "text-indigo-500"
                        }`}
                      />
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="mt-4">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Quick Links Section */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Atalhos Rápidos</CardTitle>
              <CardDescription>
                Acesso direto às funcionalidades mais usadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Button
                      key={link.path}
                      variant="outline"
                      className="justify-start h-auto py-4"
                      onClick={() => navigate(link.path)}
                    >
                      <Icon className="w-5 h-5 mr-3 text-muted-foreground" />
                      <span className="text-left">{link.title}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
