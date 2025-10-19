/**
 * MMI History Page - Admin View
 * 
 * Displays MMI maintenance history with filtering and PDF export functionality
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { exportToPDF, formatPDFContent } from "@/lib/pdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileDown, Ship, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type MMIRecord = {
  id: string;
  vessel_name: string;
  system_name: string;
  task_description: string;
  executed_at: string | null;
  status: "executado" | "pendente" | "atrasado";
};

export default function MMIHistoryPage() {
  const [records, setRecords] = useState<MMIRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"todos" | "executado" | "pendente" | "atrasado">("todos");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/mmi/history");
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filter === "todos") return true;
    return record.status === filter;
  });

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

  const handleExportPDF = async (record: MMIRecord) => {
    const content = `
      <div style="margin-bottom: 15px;">
        <strong>Sistema:</strong> ${record.system_name}
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Embarcação:</strong> ${record.vessel_name}
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Descrição:</strong><br/>
        ${record.task_description}
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Status:</strong> ${record.status.toUpperCase()}
      </div>
      
      ${
        record.executed_at
          ? `
        <div style="margin-bottom: 15px;">
          <strong>Executado em:</strong> ${format(
            new Date(record.executed_at),
            "dd/MM/yyyy HH:mm",
            { locale: ptBR }
          )}
        </div>
      `
          : ""
      }
    `;

    const formattedContent = formatPDFContent(
      "Relatório de Manutenção",
      content,
      `
        <p>Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p>Sistema MMI - Manutenção Inteligente</p>
      `
    );

    const filename = `mmi-${record.id}.pdf`;
    await exportToPDF(formattedContent, filename);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Histórico de Manutenções (MMI)</h1>
          <p className="text-muted-foreground mt-1">
            Registros de manutenções realizadas e agendadas
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="mr-2 font-semibold">Filtro por status:</label>
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value as typeof filter)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
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

      <div className="space-y-4">
        {filteredRecords.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p>Nenhum registro encontrado para o filtro selecionado.</p>
            </CardContent>
          </Card>
        )}

        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{record.system_name}</h3>
                    <Badge variant="outline" className={getStatusColor(record.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(record.status)}
                        {record.status}
                      </span>
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ship className="w-4 h-4" />
                    <span>
                      <strong>🚢 Embarcação:</strong> {record.vessel_name}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    <strong>📝 Descrição:</strong> {record.task_description}
                  </p>

                  {record.executed_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        <strong>📅 Data Execução:</strong>{" "}
                        {format(new Date(record.executed_at), "dd/MM/yyyy HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportPDF(record)}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  📄 Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
