import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  fetchMMIHistory,
  getMMIHistoryStats,
  type MMIHistory,
} from "@/services/mmi/historyService";
import { FileText, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import html2pdf from "html2pdf.js";

export default function MMIHistoryPage() {
  const [history, setHistory] = useState<MMIHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<MMIHistory[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    executado: 0,
    pendente: 0,
    atrasado: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [statusFilter, history]);

  async function loadData() {
    try {
      setLoading(true);
      const [historyData, statsData] = await Promise.all([
        fetchMMIHistory(),
        getMMIHistoryStats(),
      ]);
      setHistory(historyData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading MMI history:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    if (statusFilter === "todos") {
      setFilteredHistory(history);
    } else {
      setFilteredHistory(history.filter((item) => item.status === statusFilter));
    }
  }

  function getStatusBadge(status: string | null) {
    if (!status) return null;

    const statusConfig = {
      executado: {
        label: "Executado",
        variant: "default" as const,
        className: "bg-green-500 hover:bg-green-600",
        icon: CheckCircle,
      },
      pendente: {
        label: "Pendente",
        variant: "secondary" as const,
        className: "bg-yellow-500 hover:bg-yellow-600",
        icon: Clock,
      },
      atrasado: {
        label: "Atrasado",
        variant: "destructive" as const,
        className: "bg-red-500 hover:bg-red-600",
        icon: AlertCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  }

  async function exportToPDF() {
    const content = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1 style="color: #1e40af; margin-bottom: 20px;">📊 Histórico MMI</h1>
        <div style="margin-bottom: 20px;">
          <h2 style="color: #374151;">Estatísticas</h2>
          <p><strong>Total:</strong> ${stats.total}</p>
          <p><strong>Executado:</strong> ${stats.executado}</p>
          <p><strong>Pendente:</strong> ${stats.pendente}</p>
          <p><strong>Atrasado:</strong> ${stats.atrasado}</p>
        </div>
        <h2 style="color: #374151; margin-top: 30px;">Registros</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6; border-bottom: 2px solid #d1d5db;">
              <th style="padding: 10px; text-align: left;">Embarcação</th>
              <th style="padding: 10px; text-align: left;">Sistema</th>
              <th style="padding: 10px; text-align: left;">Tarefa</th>
              <th style="padding: 10px; text-align: left;">Data Execução</th>
              <th style="padding: 10px; text-align: left;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredHistory
              .map(
                (item) => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px;">${item.vessel_name || "N/A"}</td>
                <td style="padding: 10px;">${item.system_name || "N/A"}</td>
                <td style="padding: 10px;">${item.task_description || "N/A"}</td>
                <td style="padding: 10px;">${
                  item.executed_at
                    ? new Date(item.executed_at).toLocaleString("pt-BR")
                    : "N/A"
                }</td>
                <td style="padding: 10px;">${item.status || "N/A"}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    const element = document.createElement("div");
    element.innerHTML = content;

    const options = {
      margin: 10,
      filename: `mmi-history-${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().from(element).set(options).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Histórico MMI</h1>
          <p className="text-muted-foreground">
            Visualize e exporte o histórico de manutenção
          </p>
        </div>
        <Button onClick={exportToPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Executado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.executado}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendente}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Atrasado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.atrasado}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <label className="text-sm font-medium">Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="executado">Executado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FileText className="w-5 h-5 inline mr-2" />
            Registros ({filteredHistory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Embarcação</th>
                  <th className="text-left p-3 font-medium">Sistema</th>
                  <th className="text-left p-3 font-medium">Tarefa</th>
                  <th className="text-left p-3 font-medium">Data Execução</th>
                  <th className="text-left p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-muted-foreground">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="p-3">{item.vessel_name || "N/A"}</td>
                      <td className="p-3">{item.system_name || "N/A"}</td>
                      <td className="p-3">{item.task_description || "N/A"}</td>
                      <td className="p-3">
                        {item.executed_at
                          ? new Date(item.executed_at).toLocaleString("pt-BR")
                          : "N/A"}
                      </td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
