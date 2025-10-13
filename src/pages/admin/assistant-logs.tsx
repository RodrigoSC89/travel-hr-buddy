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
  X,
  FileText,
  Mail
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { logger } from "@/lib/logger";

interface AssistantLog {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  origin: string;
  created_at: string;
  user_email?: string;
}

export default function AssistantLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchKeyword, emailFilter, startDate, endDate]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("assistant-logs");

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      logger.error("Error fetching logs:", error);
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

    // Email filter
    if (emailFilter.trim()) {
      const email = emailFilter.toLowerCase();
      filtered = filtered.filter(
        (log) => log.user_email?.toLowerCase().includes(email)
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
    setEmailFilter("");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    if (filteredLogs.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    // CSV headers
    const headers = ["Data/Hora", "Usuário", "Pergunta", "Resposta", "Origem"];
    
    // CSV rows
    const rows = filteredLogs.map((log) => {
      const date = format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss");
      const userEmail = `"${log.user_email || "Anônimo"}"`;
      // Escape quotes and wrap in quotes for CSV
      const question = `"${log.question.replace(/"/g, "\"\"")}"`;
      const answer = `"${log.answer.replace(/"/g, "\"\"").replace(/<[^>]*>/g, "")}"`;
      const origin = `"${log.origin}"`;
      return [date, userEmail, question, answer, origin].join(",");
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

  function exportToPDF() {
    if (filteredLogs.length === 0) {
      alert("Não há dados para exportar");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text("📜 Histórico de Interações com IA", 14, 16);
    
    // Add metadata
    doc.setFontSize(10);
    doc.text(`Total de interações: ${filteredLogs.length}`, 14, 24);
    doc.text(`Data de geração: ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}`, 14, 30);
    
    // Prepare table data
    const tableData = filteredLogs.map((log) => [
      format(new Date(log.created_at), "dd/MM/yyyy HH:mm"),
      log.question,
      log.answer.replace(/<[^>]*>/g, ""), // Remove HTML tags
    ]);
    
    // Add table
    autoTable(doc, {
      startY: 36,
      head: [["Data/Hora", "Pergunta", "Resposta"]],
      body: tableData,
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 70 },
        2: { cellWidth: 75 },
      },
      headStyles: {
        fillColor: [79, 70, 229], // Indigo color
        textColor: 255,
        fontStyle: "bold",
      },
    });
    
    // Save the PDF
    doc.save(`assistant-logs-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
  }

  async function sendReportByEmail() {
    if (filteredLogs.length === 0) {
      alert("Não há dados para enviar");
      return;
    }

    try {
      // Get Supabase session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("❌ Você precisa estar autenticado para enviar relatórios");
        return;
      }

      // Show loading state
      const confirmed = confirm(`Deseja enviar relatório com ${filteredLogs.length} interações por e-mail?`);
      if (!confirmed) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-assistant-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            logs: filteredLogs.map(log => ({
              id: log.id,
              question: log.question,
              answer: log.answer,
              created_at: log.created_at,
              user_email: "Usuário", // You may want to add user email to the log data
            }))
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("✅ " + (result.message || "Relatório enviado por e-mail com sucesso!"));
      } else {
        alert("❌ Falha ao enviar relatório: " + (result.error || "Erro desconhecido"));
      }
    } catch (error) {
      logger.error("Error sending report:", error);
      alert("❌ Erro ao enviar relatório por e-mail");
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  const hasFilters = searchKeyword || emailFilter || startDate || endDate;

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
          <div className="flex gap-2">
            <Button onClick={exportToCSV} disabled={filteredLogs.length === 0} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button onClick={exportToPDF} disabled={filteredLogs.length === 0} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={sendReportByEmail} disabled={filteredLogs.length === 0}>
              <Mail className="w-4 h-4 mr-2" />
              Enviar E-mail
            </Button>
            <Button 
              onClick={() => navigate("/admin/reports/assistant")} 
              variant="secondary"
            >
              📬 Logs de Envio
            </Button>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  E-mail do Usuário
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                    NEW!
                  </span>
                </label>
                <Input
                  placeholder="Filtrar por e-mail..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
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
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span className="font-medium">{log.user_email || "Anônimo"}</span>
                            <span>—</span>
                            <span>{format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm:ss")}</span>
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
