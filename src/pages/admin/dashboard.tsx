"use client";

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

interface TrendDataPoint {
  day: string;
  count: number;
}

interface MonthlySummaryDataPoint {
  department: string;
  count: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { userRole, isLoading: roleLoading } = usePermissions();
  const [cronStatus, setCronStatus] = useState<"ok" | "warning" | null>(null);
  const [cronMessage, setCronMessage] = useState("");
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummaryDataPoint[]>([]);
  const [loadingMonthlySummary, setLoadingMonthlySummary] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const { toast } = useToast();

  // Check if in public view mode
  const isPublic = searchParams.get("public") === "1";
  
  // Get public URL for QR code
  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/admin/dashboard?public=1`
    : "";

  useEffect(() => {
    fetch("/api/cron-status")
      .then(async res => {
        const contentType = res.headers.get("content-type");
        // If we get HTML instead of JSON, we're in dev mode without backend
        if (contentType && contentType.includes("text/html")) {
          // Use mock data for development
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
  }, []);

  // Fetch restore activity trend data
  useEffect(() => {
    const fetchTrendData = async () => {
      setLoadingTrend(true);
      try {
        const response = await supabase
          .rpc("get_restore_count_by_day_with_email", { 
            email_input: user?.email || "" 
          });

        const { data, error } = response || {};

        if (error) {
          logger.error("Error fetching trend data:", error);
        } else if (data) {
          // Transform data for chart
          const chartData: TrendDataPoint[] = data.map((item: { day: string; count: number }) => ({
            day: new Date(item.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            count: item.count
          }));
          setTrendData(chartData);
        }
      } catch (error) {
        logger.error("Error fetching trend data:", error);
      } finally {
        setLoadingTrend(false);
      }
    };

    if (user) {
      fetchTrendData();
    }
  }, [user]);

  // Fetch monthly summary by department
  useEffect(() => {
    const fetchMonthlySummary = async () => {
      setLoadingMonthlySummary(true);
      try {
        const response = await supabase
          .rpc("get_monthly_restore_summary_by_department");

        const { data, error } = response || {};

        if (error) {
          logger.error("Error fetching monthly summary:", error);
        } else if (data) {
          setMonthlySummary(data || []);
        }
      } catch (error) {
        logger.error("Error fetching monthly summary:", error);
      } finally {
        setLoadingMonthlySummary(false);
      }
    };

    fetchMonthlySummary();
  }, []);

  // Navigation cards with role-based visibility
  const dashboardCards = [
    {
      title: "Checklists",
      description: "Progresso e status por equipe",
      icon: CheckSquare,
      color: "blue",
      path: "/admin/checklists/dashboard",
      roles: ["admin", "hr_manager"],
    },
    {
      title: "Restaurações Pessoais",
      description: "Painel diário pessoal com gráficos",
      icon: Package,
      color: "purple",
      path: "/admin/restore/personal",
      roles: ["admin", "hr_manager", "hr_analyst", "department_manager", "supervisor", "coordinator", "manager", "employee"],
    },
    {
      title: "Histórico de IA",
      description: "Consultas recentes e exportações",
      icon: Bot,
      color: "indigo",
      path: "/admin/assistant/history",
      roles: ["admin", "hr_manager"],
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

  // Filter cards based on user role in authenticated mode
  const visibleCards = isPublic 
    ? dashboardCards 
    : dashboardCards.filter(card => 
        !roleLoading && userRole && card.roles.includes(userRole)
      );

  // Export dashboard as PDF
  const exportPDF = async () => {
    setExportingPDF(true);
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont("helvetica", "bold");
      pdf.text("📊 Painel Resumo Mensal", margin, yPosition);
      yPosition += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      pdf.text(currentDate, margin, yPosition);
      yPosition += 15;

      // Monthly Summary Section
      if (monthlySummary.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("📆 Comparativo por Departamento", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        monthlySummary.forEach((item) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          const barWidth = (item.count / Math.max(...monthlySummary.map(d => d.count))) * 80;
          pdf.text(`${item.department}: ${item.count}`, margin, yPosition);
          pdf.setFillColor(34, 197, 94); // Green color
          pdf.rect(margin + 60, yPosition - 3, barWidth, 4, "F");
          yPosition += 7;
        });
        
        yPosition += 10;
      }

      // Trend Data Section
      if (trendData.length > 0) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.text("📈 Atividade de Restauração (Últimos 15 dias)", margin, yPosition);
        yPosition += 8;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        
        trendData.forEach((item) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(`${item.day}: ${item.count} restaurações`, margin, yPosition);
          yPosition += 6;
        });
      }

      // Save PDF
      pdf.save(`dashboard-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O relatório foi baixado para o seu dispositivo",
      });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o relatório",
        variant: "destructive",
      });
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isPublic && <Eye className="inline w-8 h-8 mr-2" />}
          🚀 Painel Administrativo
        </h1>
        <p className="text-muted-foreground mt-2">
          Central de controle e monitoramento — Nautilus One
        </p>
      </div>

      {/* Public Mode Indicator */}
      {isPublic && (
        <Badge variant="secondary" className="px-4 py-2 text-sm bg-blue-100 text-blue-800">
          <Eye className="w-4 h-4 mr-2" />
          🔒 Modo público somente leitura
        </Badge>
      )}

      {/* Cron Status Badge */}
      {cronStatus && (
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

      {/* Monthly Department Summary Chart */}
      {monthlySummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📆 Comparativo Mensal por Departamento</CardTitle>
            <CardDescription>
              Restaurações agrupadas por departamento no mês atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMonthlySummary ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySummary} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="department" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="rgba(34, 197, 94, 0.8)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Export Button - Only shown in authenticated mode */}
      {!isPublic && (
        <Card>
          <CardHeader>
            <CardTitle>📤 Exportação PDF</CardTitle>
            <CardDescription>
              Baixe um relatório em PDF com o resumo do dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportPDF}
              disabled={exportingPDF}
              className="w-full sm:w-auto"
            >
              {exportingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando PDF...
                </>
              ) : (
                "Baixar relatório em PDF"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          const cardPath = isPublic ? `${card.path}?public=1` : card.path;
          
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
              onClick={() => navigate(cardPath)}
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

      {/* Restore Activity Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Atividade de Restauração (Últimos 15 dias)</CardTitle>
            <CardDescription>
              Quantidade de restaurações realizadas por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrend ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Carregando dados...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* QR Code Section - Only shown in authenticated mode */}
      {!isPublic && publicUrl && (
        <Card>
          <CardHeader>
            <CardTitle>📱 Compartilhar Dashboard Público</CardTitle>
            <CardDescription>
              Escaneie o QR Code para acessar o dashboard em modo somente leitura
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <QRCodeSVG value={publicUrl} size={128} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">URL Pública:</p>
              <Link 
                to={`/admin/dashboard?public=1`}
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {publicUrl}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

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
              const linkPath = isPublic ? `${link.path}?public=1` : link.path;
              
              return (
                <Button
                  key={link.path}
                  variant="outline"
                  className="justify-start h-auto py-4"
                  onClick={() => navigate(linkPath)}
                >
                  <Icon className="w-5 h-5 mr-3 text-muted-foreground" />
                  <span className="text-left">{link.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
