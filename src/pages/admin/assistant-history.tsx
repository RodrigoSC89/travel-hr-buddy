"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Search, Download, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AssistantLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  question: string;
  answer: string | null;
  action: string | null;
  target: string | null;
  created_at: string;
}

export default function AssistantHistoryPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    // Filter logs based on search term
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = logs.filter(
        (log) =>
          log.question.toLowerCase().includes(term) ||
          log.answer?.toLowerCase().includes(term) ||
          log.user_email?.toLowerCase().includes(term)
      );
      setFilteredLogs(filtered);
    }
  }, [searchTerm, logs]);

  async function fetchLogs() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("assistant-logs");

      if (error) {
        throw error;
      }

      if (data?.logs) {
        setLogs(data.logs);
        setFilteredLogs(data.logs);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch logs";
      setError(errorMessage);
      toast.error("Erro ao carregar histórico", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    try {
      // Prepare CSV content
      const headers = ["Data/Hora", "Usuário", "Pergunta", "Resposta", "Ação", "Destino"];
      const rows = filteredLogs.map((log) => [
        new Date(log.created_at).toLocaleString("pt-BR"),
        log.user_email || "N/A",
        escapeCSV(log.question),
        escapeCSV(stripHTML(log.answer || "")),
        log.action || "N/A",
        log.target || "N/A",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create and trigger download
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `assistente-historico-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CSV exportado com sucesso!");
    } catch (err) {
      console.error("Error downloading CSV:", err);
      toast.error("Erro ao exportar CSV");
    }
  }

  function escapeCSV(str: string): string {
    if (!str) return "";
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  function stripHTML(html: string): string {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-purple-500" />
            Histórico do Assistente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de todas as interações com o assistente IA
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/assistant")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Search and Export Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pergunta, resposta ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={downloadCSV}
          disabled={filteredLogs.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Logs Display */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredLogs.length} {filteredLogs.length === 1 ? "registro" : "registros"}
            {searchTerm && ` (filtrado de ${logs.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-lg font-semibold text-destructive">Erro ao carregar histórico</p>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
                <Button variant="outline" onClick={fetchLogs} className="mt-4">
                  Tentar novamente
                </Button>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>
                  {searchTerm
                    ? "Nenhum registro encontrado com esse filtro"
                    : "Nenhuma interação registrada ainda"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="border-l-4 border-l-purple-400">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">
                            {log.user_email || "Anônimo"}
                          </span>
                          {" • "}
                          {new Date(log.created_at).toLocaleString("pt-BR")}
                        </div>
                        {log.action && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            {log.action}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-blue-600 mb-1">
                            PERGUNTA:
                          </p>
                          <p className="text-sm">{log.question}</p>
                        </div>
                        {log.answer && (
                          <div>
                            <p className="text-xs font-semibold text-green-600 mb-1">
                              RESPOSTA:
                            </p>
                            <div
                              className="text-sm text-muted-foreground"
                              dangerouslySetInnerHTML={{ __html: log.answer }}
                            />
                          </div>
                        )}
                        {log.target && (
                          <div className="text-xs text-muted-foreground">
                            <span className="font-semibold">Destino:</span> {log.target}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
