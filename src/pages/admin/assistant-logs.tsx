"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  Bot, 
  User,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AssistantLog {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  origin: string;
  created_at: string;
}

export default function AssistantLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchKeyword, startDate, endDate]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("assistant-logs", {
        method: "GET",
      });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...logs];

    // Keyword filter
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.question.toLowerCase().includes(keyword) ||
          log.answer.toLowerCase().includes(keyword)
      );
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(
        (log) => new Date(log.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (log) => new Date(log.created_at) <= endDateTime
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }

  function clearFilters() {
    setSearchKeyword("");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    if (filteredLogs.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    // CSV headers
    const headers = ["Data/Hora", "Pergunta", "Resposta", "Origem"];
    
    // CSV rows
    const rows = filteredLogs.map((log) => {
      const date = format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss");
      // Escape quotes and wrap in quotes for CSV
      const question = `"${log.question.replace(/"/g, "\"\"")}"`;
      const answer = `"${log.answer.replace(/"/g, "\"\"").replace(/<[^>]*>/g, "")}"`;
      const origin = `"${log.origin}"`;
      return [date, question, answer, origin].join(",");
    });

    // Combine headers and rows
    const csv = [headers.join(","), ...rows].join("\n");
    
    // Add UTF-8 BOM for Excel compatibility
    const bom = "\uFEFF";
    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `assistant-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const hasFilters = searchKeyword || startDate || endDate;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/assistant")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Histórico do Assistente IA</h1>
              <p className="text-sm text-muted-foreground">
                Total de {filteredLogs.length} interações
                {logs.length > 0 && ` • ${format(new Date(logs[logs.length - 1].created_at), "dd/MM/yyyy")} - ${format(new Date(logs[0].created_at), "dd/MM/yyyy")}`}
              </p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={filteredLogs.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="w-4 h-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Buscar
                </label>
                <Input
                  placeholder="Buscar em perguntas ou respostas..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Inicial
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Data Final
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Carregando histórico...</p>
                </div>
              </div>
            ) : currentLogs.length === 0 ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    {hasFilters
                      ? "Nenhum resultado encontrado com os filtros aplicados"
                      : "Nenhuma interação registrada ainda"}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="p-4 space-y-4">
                  {currentLogs.map((log) => (
                    <Card key={log.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss")}
                          </div>
                          <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                            {log.origin}
                          </div>
                        </div>
                        
                        {/* User Question */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Pergunta</p>
                            <p className="text-sm text-gray-700">{log.question}</p>
                          </div>
                        </div>

                        {/* Assistant Answer */}
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-purple-100 text-purple-600">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-1">Resposta</p>
                            <div 
                              className="text-sm text-gray-700"
                              dangerouslySetInnerHTML={{ 
                                __html: log.answer.replace(/<a /g, "<a target=\"_blank\" rel=\"noopener noreferrer\" ") 
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <div className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
