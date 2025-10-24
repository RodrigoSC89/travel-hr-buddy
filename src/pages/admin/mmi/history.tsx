import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileDown, Ship, AlertCircle, CheckCircle, Clock, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import type { MMIHistory } from "@/types/mmi";
import { fetchMMIHistory, getMMIHistoryStats, type MMIHistoryFilters, type MMIHistoryStats } from "@/services/mmi/historyService";

export default function MMIHistoryAdminPage() {
  const [histories, setHistories] = useState<MMIHistory[]>([]);
  const [stats, setStats] = useState<MMIHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsData = await getMMIHistoryStats();
      setStats(statsData);

      // Load histories with filters
      const filters: MMIHistoryFilters = {};
      if (filterStatus !== "all") {
        filters.status = filterStatus as "executado" | "pendente" | "atrasado";
      }

      const historiesData = await fetchMMIHistory(filters);
      setHistories(historiesData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
    case "executado":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "pendente":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "atrasado":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "executado":
      return <CheckCircle className="w-4 h-4" />;
    case "pendente":
      return <Clock className="w-4 h-4" />;
    case "atrasado":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return null;
    }
  };

  const exportToPDF = async () => {
    try {
      const content = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">Relatório de Histórico MMI</h1>
          
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
            <h2 style="margin-bottom: 15px;">Estatísticas</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div><strong>Total:</strong> ${stats?.total || 0}</div>
              <div><strong>Executados:</strong> ${stats?.executado || 0}</div>
              <div><strong>Pendentes:</strong> ${stats?.pendente || 0}</div>
              <div><strong>Atrasados:</strong> ${stats?.atrasado || 0}</div>
            </div>
          </div>
          
          <h2 style="margin-bottom: 15px;">Registros (${histories.length})</h2>
          
          ${histories.map((history, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">${index + 1}. ${history.system_name}</h3>
              
              <div style="margin-bottom: 8px;">
                <strong>Embarcação:</strong> ${history.vessel?.name || "N/A"}
              </div>
              
              <div style="margin-bottom: 8px;">
                <strong>Descrição:</strong><br/>
                ${history.task_description}
              </div>
              
              <div style="margin-bottom: 8px;">
                <strong>Status:</strong> ${history.status.toUpperCase()}
              </div>
              
              ${history.executed_at ? `
                <div style="margin-bottom: 8px;">
                  <strong>Executado em:</strong> ${format(new Date(history.executed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
              ` : ""}
            </div>
          `).join("")}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
            <p>Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            <p>Sistema MMI - Painel Administrativo</p>
          </div>
        </div>
      `;

      const element = document.createElement("div");
      element.innerHTML = content;

      const opt = {
        margin: 10,
        filename: `mmi-historico-admin-${format(new Date(), "yyyyMMdd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico MMI - Admin</h1>
          <p className="text-muted-foreground mt-1">
            Painel administrativo de histórico de manutenções
          </p>
        </div>
        <Button onClick={exportToPDF} variant="default">
          <FileDown className="w-4 h-4 mr-2" />
          Exportar Relatório PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">registros totais</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Executados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.executado}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.executado / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pendente}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.pendente / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.atrasado}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.atrasado / stats.total) * 100) : 0}% do total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre os registros por status</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="executado">Executado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* History Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Manutenção</CardTitle>
          <CardDescription>
            {histories.length} {histories.length === 1 ? "registro encontrado" : "registros encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {histories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum registro encontrado
            </div>
          ) : (
            <div className="space-y-4">
              {histories.map((history) => (
                <div
                  key={history.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{history.system_name}</h3>
                      <Badge variant="outline" className={getStatusColor(history.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(history.status)}
                          {history.status}
                        </span>
                      </Badge>
                    </div>

                    {history.vessel && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Ship className="w-4 h-4" />
                        <span>{history.vessel.name}</span>
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {history.task_description}
                    </p>

                    {history.executed_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Executado em:{" "}
                          {format(new Date(history.executed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
