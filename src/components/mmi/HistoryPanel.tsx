import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileDown, Ship, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import type { MMIHistory } from "@/types/mmi";
import { fetchMMIHistory, type MMIHistoryFilters } from "@/services/mmi/historyService";

export default function HistoryPanel() {
  const [histories, setHistories] = useState<MMIHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedHistories, setSelectedHistories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHistories();
  }, [filterStatus]);

  const loadHistories = async () => {
    try {
      setLoading(true);
      const filters: MMIHistoryFilters = {};
      
      if (filterStatus !== "all") {
        filters.status = filterStatus as "executado" | "pendente" | "atrasado";
      }

      const data = await fetchMMIHistory(filters);
      setHistories(data);
    } catch (error) {
      console.error("Error fetching histories:", error);
      toast.error("Erro ao carregar histórico");
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

  const exportToPDF = async (history: MMIHistory) => {
    try {
      const content = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">Relatório de Manutenção</h1>
          
          <div style="margin-bottom: 15px;">
            <strong>Sistema:</strong> ${history.system_name}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Embarcação:</strong> ${history.vessel?.name || "N/A"}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Descrição:</strong><br/>
            ${history.task_description}
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong>Status:</strong> ${history.status.toUpperCase()}
          </div>
          
          ${history.executed_at ? `
            <div style="margin-bottom: 15px;">
              <strong>Executado em:</strong> ${format(new Date(history.executed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
            </div>
          ` : ""}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
            <p>Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            <p>Sistema MMI - Manutenção Inteligente</p>
          </div>
        </div>
      `;

      const element = document.createElement("div");
      element.innerHTML = content;

      const opt = {
        margin: 10,
        filename: `manutencao-${history.system_name.replace(/\s+/g, "-")}-${format(new Date(), "yyyyMMdd")}.pdf`,
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

  const exportBatchPDF = async () => {
    if (selectedHistories.size === 0) {
      toast.error("Selecione pelo menos um registro");
      return;
    }

    try {
      const selectedRecords = histories.filter((h) => selectedHistories.has(h.id));
      
      const content = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; margin-bottom: 20px;">Relatório Consolidado de Manutenção</h1>
          <p style="margin-bottom: 30px;">Total de registros: ${selectedRecords.length}</p>
          
          ${selectedRecords.map((history, index) => `
            <div style="margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">${index + 1}. ${history.system_name}</h3>
              
              <div style="margin-bottom: 10px;">
                <strong>Embarcação:</strong> ${history.vessel?.name || "N/A"}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong>Descrição:</strong><br/>
                ${history.task_description}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong>Status:</strong> ${history.status.toUpperCase()}
              </div>
              
              ${history.executed_at ? `
                <div style="margin-bottom: 10px;">
                  <strong>Executado em:</strong> ${format(new Date(history.executed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </div>
              ` : ""}
            </div>
          `).join("")}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
            <p>Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            <p>Sistema MMI - Manutenção Inteligente</p>
          </div>
        </div>
      `;

      const element = document.createElement("div");
      element.innerHTML = content;

      const opt = {
        margin: 10,
        filename: `manutencao-lote-${format(new Date(), "yyyyMMdd")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      toast.success("PDF em lote gerado com sucesso!");
      setSelectedHistories(new Set());
    } catch (error) {
      console.error("Error exporting batch PDF:", error);
      toast.error("Erro ao gerar PDF em lote");
    }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedHistories);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedHistories(newSelection);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Manutenção</h1>
          <p className="text-muted-foreground mt-1">
            Registros de manutenções realizadas e agendadas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            {selectedHistories.size > 0 && (
              <Button onClick={exportBatchPDF} variant="outline" size="sm">
                <FileDown className="w-4 h-4 mr-2" />
                Exportar Selecionados ({selectedHistories.size})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {histories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum registro encontrado
            </CardContent>
          </Card>
        ) : (
          histories.map((history) => (
            <Card key={history.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedHistories.has(history.id)}
                      onChange={() => toggleSelection(history.id)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{history.system_name}</h3>
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

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {history.executed_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Executado em:{" "}
                              {format(new Date(history.executed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => exportToPDF(history)}
                    variant="outline"
                    size="sm"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
