/**
 * Restore Audit Dashboard
 * Path: /admin/documents/restore-dashboard
 * Features: Interactive charts, CSV/PDF export, email reports, public view mode
 * Migrated to Recharts
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Download, Mail, BarChart3, FileText, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { logger } from "@/lib/logger";
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

interface DepartmentSummary {
  department: string;
  count: number;
}

export default function RestoreDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPublicView = searchParams.get("public") === "1";
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterEmail, setFilterEmail] = useState("");
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [dailyData, setDailyData] = useState<RestoreDataPoint[]>([]);
  const [departmentSummary, setDepartmentSummary] = useState<DepartmentSummary[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [emailSending, setEmailSending] = useState(false);

  const publicUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/admin/documents/restore-dashboard?public=1`
    : "";

  const fetchStats = useCallback(async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const { data: logsData, error: logsError } = await supabase
        .from("access_logs")
        .select("*")
        .eq("action", "restore")
        .order("timestamp", { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      const logs = logsData || [];
      
      const uniqueDocs = new Set(logs.map(l => {
        const details = l.details as Record<string, unknown> | null;
        return details?.document_id as string || l.id;
      })).size;
      
      const daysWithData = new Set(logs.map(l => 
        format(new Date(l.timestamp), "yyyy-MM-dd")
      )).size;

      setSummary({
        total: logs.length,
        unique_docs: uniqueDocs,
        avg_per_day: daysWithData > 0 ? logs.length / daysWithData : 0,
      });

      const dailyMap = new Map<string, number>();
      logs.forEach(log => {
        const day = format(new Date(log.timestamp), "yyyy-MM-dd");
        dailyMap.set(day, (dailyMap.get(day) || 0) + 1);
      });

      const dailyDataPoints = Array.from(dailyMap.entries())
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => a.day.localeCompare(b.day))
        .slice(-15);

      setDailyData(dailyDataPoints);

      const deptMap = new Map<string, number>();
      logs.forEach(log => {
        const dept = log.module_accessed || "Unknown";
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
      });

      setDepartmentSummary(
        Array.from(deptMap.entries())
          .map(([department, count]) => ({ department, count }))
          .sort((a, b) => b.count - a.count)
      );

      setLastUpdate(new Date());
    } catch (error) {
      logger.error("Error fetching stats:", error);
      if (!isAutoRefresh) {
        toast({
          title: "Erro ao carregar estatísticas",
          description: "Não foi possível carregar as estatísticas de restauração.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      fetchStats(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchStats, filterEmail]);

  function exportToCSV() {
    if (dailyData.length === 0) {
      toast({ title: "Sem dados", description: "Não há dados para exportar.", variant: "destructive" });
      return;
    }

    try {
      const csvHeader = "Data,Restaurações\n";
      const csvRows = dailyData
        .map((d) => `${format(new Date(d.day), "dd/MM/yyyy")},${d.count}`)
        .join("\n");
      
      const csvContent = csvHeader + csvRows;
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
      
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "restore-analytics.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({ title: "CSV exportado", description: "O arquivo CSV foi baixado com sucesso." });
    } catch (error) {
      logger.error("Error exporting CSV:", error);
      toast({ title: "Erro ao exportar CSV", description: "Não foi possível exportar o arquivo CSV.", variant: "destructive" });
    }
  }

  async function exportToPDF() {
    if (dailyData.length === 0) {
      toast({ title: "Sem dados", description: "Não há dados para exportar.", variant: "destructive" });
      return;
    }

    try {
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default;
      
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("Restore Analytics Dashboard", 14, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 28);
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Estatísticas Resumidas", 14, 40);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      let yPosition = 48;
      
      if (summary) {
        doc.text(`Total de Restaurações: ${summary.total}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Documentos Únicos Restaurados: ${summary.unique_docs}`, 14, yPosition);
        yPosition += 7;
        doc.text(`Média de Restaurações por Dia: ${summary.avg_per_day.toFixed(2)}`, 14, yPosition);
        yPosition += 12;
      }
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Restaurações Diárias", 14, yPosition);
      yPosition += 8;
      
      const tableData = dailyData.map((d) => [
        format(new Date(d.day), "dd/MM/yyyy"),
        d.count.toString(),
      ]);
      
      autoTable(doc, {
        startY: yPosition,
        head: [["Data", "Número de Restaurações"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: "bold" },
      });
      
      const filename = `restore-analytics-${format(new Date(), "yyyy-MM-dd")}.pdf`;
      doc.save(filename);
      toast({ title: "PDF exportado", description: `Arquivo ${filename} foi baixado com sucesso.` });
    } catch (error) {
      logger.error("Error exporting PDF:", error);
      toast({ title: "Erro ao exportar PDF", description: "Não foi possível exportar o arquivo PDF.", variant: "destructive" });
    }
  }

  async function sendEmailReport() {
    if (dailyData.length === 0) {
      toast({ title: "Sem dados", description: "Não há dados para enviar.", variant: "destructive" });
      return;
    }

    setEmailSending(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({ title: "Não autenticado", description: "Você precisa estar autenticado para enviar relatórios por email.", variant: "destructive" });
        return;
      }

      const { error } = await supabase.functions.invoke("send-restore-dashboard", {
        body: { summary, dailyData },
      });

      if (error) throw error;
      toast({ title: "Email enviado", description: "O relatório foi enviado por email com sucesso." });
    } catch (error) {
      logger.error("Error sending email:", error);
      toast({ title: "Erro ao enviar email", description: "Não foi possível enviar o relatório por email.", variant: "destructive" });
    } finally {
      setEmailSending(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      fetchStats();
    }
  };

  const rechartsData = dailyData.map((d) => ({
    date: format(new Date(d.day), "dd/MM"),
    restauracoes: d.count,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {!isPublicView && (
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel Admin
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Última atualização: {format(lastUpdate, "HH:mm:ss")}
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="w-8 h-8" />
          Restore Audit Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Painel completo de auditoria e monitoramento de restaurações de documentos
        </p>
      </div>

      {!isPublicView && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Filtros e Exportação
            </CardTitle>
            <CardDescription>Filtre por email ou exporte os dados para análise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input placeholder="Filtrar por e-mail (pressione Enter)" value={filterEmail} onChange={(e) => setFilterEmail(e.target.value)} onKeyPress={handleKeyPress} className="flex-1" />
              <Button onClick={() => fetchStats()} disabled={loading} variant="default">🔍 Buscar</Button>
              <Button onClick={exportToCSV} disabled={loading || dailyData.length === 0} variant="outline"><Download className="w-4 h-4 mr-2" />CSV</Button>
              <Button onClick={exportToPDF} disabled={loading || dailyData.length === 0} variant="outline"><FileText className="w-4 h-4 mr-2" />PDF</Button>
              <Button onClick={sendEmailReport} disabled={loading || dailyData.length === 0 || emailSending} variant="outline"><Mail className="w-4 h-4 mr-2" />{emailSending ? "Enviando..." : "Email"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Restaurações</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{summary.total}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Todas as restaurações registradas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Documentos Únicos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{summary.unique_docs}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Documentos diferentes restaurados</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Média por Dia</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{summary.avg_per_day.toFixed(1)}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Restaurações por dia</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Restaurações por Dia</CardTitle>
          <CardDescription>Últimos 15 dias de atividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {rechartsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rechartsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="restauracoes" name="Restaurações por dia" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {departmentSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Módulo</CardTitle>
            <CardDescription>Distribuição de restaurações por módulo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {departmentSummary.slice(0, 10).map((dept) => (
                <div key={dept.department} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{dept.department}</span>
                  <span className="text-muted-foreground">{dept.count} restaurações</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isPublicView && (
        <Card>
          <CardHeader>
            <CardTitle>Compartilhar Dashboard</CardTitle>
            <CardDescription>Escaneie o QR code para acessar a versão pública do dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <QRCodeSVG value={publicUrl} size={128} />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">URL Pública:</p>
              <code className="text-xs bg-muted p-2 rounded block break-all">{publicUrl}</code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
