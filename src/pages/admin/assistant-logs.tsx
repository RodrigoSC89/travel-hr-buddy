"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { 
  Bot, 
  User,
  Download, 
  Loader2,
  Search,
  MessageSquare
} from "lucide-react";

interface AssistantLog {
  id: string;
  user_id: string | null;
  question: string;
  answer: string;
  origin: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

export default function AssistantLogsPage() {
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [dateError, setDateError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("assistant_logs")
          .select(`
            *,
            profiles:user_id (
              email
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching assistant logs:", error);
          toast({
            title: "Erro ao carregar logs",
            description: "Não foi possível carregar os registros do assistente.",
            variant: "destructive",
          });
          throw error;
        }
        setLogs(data || []);
      } catch (error) {
        console.error("Error fetching assistant logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filterKeyword, startDate, endDate]);

  // Validate date range
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        setDateError("A data inicial não pode ser posterior à data final");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [startDate, endDate]);

  // Apply filters
  const filteredLogs = logs.filter((log) => {
    // Keyword filter (search in question and answer)
    if (filterKeyword) {
      const keyword = filterKeyword.toLowerCase();
      const matchesQuestion = log.question.toLowerCase().includes(keyword);
      const matchesAnswer = log.answer.toLowerCase().includes(keyword);
      if (!matchesQuestion && !matchesAnswer) {
        return false;
      }
    }
    
    // Date range filter
    if (startDate || endDate) {
      const logDate = new Date(log.created_at);
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) return false;
      }
    }
    
    return true;
  });

  // Pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);

  // Export to CSV
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs que correspondam aos filtros aplicados.",
        variant: "destructive",
      });
      return;
    }

    setExportingCsv(true);
    try {
      const headers = ["ID", "Usuário", "Data/Hora", "Pergunta", "Resposta", "Origem"];
      const rows = filteredLogs.map(log => [
        log.id,
        log.profiles?.email || "Sistema",
        format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss"),
        log.question,
        log.answer,
        log.origin
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, "\"\"")}`).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `assistant_logs_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportação concluída",
        description: `${filteredLogs.length} registros exportados com sucesso.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados.",
        variant: "destructive",
      });
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="h-8 w-8" />
          Logs do Assistente IA
        </h1>
        <p className="text-muted-foreground mt-2">
          Histórico completo de interações com o assistente inteligente
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Palavra-chave</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar em perguntas e respostas"
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {dateError && (
            <p className="text-sm text-red-600 mt-2">{dateError}</p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={exportToCSV}
              disabled={exportingCsv || filteredLogs.length === 0}
            >
              {exportingCsv ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Interações</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="text-sm font-medium">
                  {filteredLogs.length > 0 
                    ? `${format(new Date(filteredLogs[filteredLogs.length - 1].created_at), "dd/MM/yyyy")} - ${format(new Date(filteredLogs[0].created_at), "dd/MM/yyyy")}`
                    : "Sem dados"}
                </p>
              </div>
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Interações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado com os filtros aplicados.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {paginatedLogs.map((log) => (
                    <Card key={log.id} className="border">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header with metadata */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{log.origin}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}
                              </span>
                            </div>
                            {log.profiles?.email && (
                              <span className="text-xs text-muted-foreground">
                                {log.profiles.email}
                              </span>
                            )}
                          </div>

                          {/* Question */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">Pergunta:</p>
                              <p className="text-sm bg-blue-50 p-3 rounded-lg">{log.question}</p>
                            </div>
                          </div>

                          {/* Answer */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium mb-1">Resposta:</p>
                              <p className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{log.answer}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({filteredLogs.length} registros)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
