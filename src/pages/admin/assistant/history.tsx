// ✅ Assistant History Page
// Path: /admin/assistant/history
// Features: View recent AI queries and exports

"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  Mail,
  RefreshCw,
  BarChart3
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface AssistantLog {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  origin: string;
  created_at: string;
  user_email?: string;
}

export default function AssistantHistoryPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AssistantLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [emailSending, setEmailSending] = useState(false);
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
      console.error("Error fetching logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar o histórico de consultas.",
        variant: "destructive",
      });
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
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchKeyword("");
    setEmailFilter("");
    setStartDate("");
    setEndDate("");
  }

  function exportToCSV() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const csvHeader = "Data/Hora,Email,Pergunta,Resposta,Origem\n";
      const csvRows = filteredLogs
        .map((log) => {
          const date = format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss");
          const email = log.user_email || "N/A";
          const question = `"${log.question.replace(/"/g, '""')}"`;
          const answer = `"${log.answer.replace(/<[^>]*>/g, "").replace(/"/g, '""')}"`;
          const origin = log.origin || "N/A";
          return `${date},${email},${question},${answer},${origin}`;
        })
        .join("\n");

      const csvContent = csvHeader + csvRows;
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `assistant-history-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "CSV exportado",
        description: "Arquivo baixado com sucesso!",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo.",
        variant: "destructive",
      });
    }
  }

  function exportToPDF() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text("🤖 Histórico de Interações com IA", 14, 16);
      
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
      doc.save(`assistant-history-${format(new Date(), "yyyy-MM-dd-HHmmss")}.pdf`);
      
      toast({
        title: "PDF exportado",
        description: "Arquivo baixado com sucesso!",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o arquivo.",
        variant: "destructive",
      });
    }
  }

  async function sendReportByEmail() {
    if (filteredLogs.length === 0) {
      toast({
        title: "Sem dados",
        description: "Não há dados para enviar.",
        variant: "destructive",
      });
      return;
    }

    setEmailSending(true);

    try {
      // Get Supabase session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para enviar relatórios.",
          variant: "destructive",
        });
        return;
      }

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
              user_email: log.user_email || "N/A",
            }))
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "✅ Enviado com sucesso",
          description: result.message || "Relatório enviado por e-mail!",
        });
      } else {
        toast({
          title: "Erro ao enviar",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o relatório por email.",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  }

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>
        <Button onClick={fetchLogs} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bot className="w-8 h-8 text-indigo-600" />
          🤖 Histórico de IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Consultas recentes e exportações do assistente de IA
        </p>
      </div>

      {/* Statistics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredLogs.filter(log => 
                format(new Date(log.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
              ).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Filtros Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[searchKeyword, emailFilter, startDate, endDate].filter(Boolean).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros e Exportação
              </CardTitle>
              <CardDescription>
                Busque por palavra-chave, email ou período
              </CardDescription>
            </div>
            <Button onClick={clearFilters} variant="ghost" size="sm">
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="🔍 Buscar por palavra-chave"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
            <Input
              placeholder="📧 Filtrar por email"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
            <Input
              type="date"
              placeholder="Data início"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data fim"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={exportToCSV}
              disabled={filteredLogs.length === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button
              onClick={exportToPDF}
              disabled={filteredLogs.length === 0}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button
              onClick={sendReportByEmail}
              disabled={filteredLogs.length === 0 || emailSending}
              variant="outline"
            >
              {emailSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar por Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📜 Histórico de Consultas</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredLogs.length)} de {filteredLogs.length} interações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma consulta encontrada</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {currentLogs.map((log) => (
                  <Card key={log.id} className="border-l-4 border-l-indigo-500">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                            </Badge>
                            {log.user_email && (
                              <Badge variant="secondary">
                                <User className="w-3 h-3 mr-1" />
                                {log.user_email}
                              </Badge>
                            )}
                          </div>
                          {log.origin && (
                            <Badge variant="outline">{log.origin}</Badge>
                          )}
                        </div>

                        {/* Question */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Pergunta:
                          </p>
                          <p className="text-sm">{log.question}</p>
                        </div>

                        {/* Answer */}
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            Resposta:
                          </p>
                          <div
                            className="text-sm bg-muted/50 p-3 rounded"
                            dangerouslySetInnerHTML={{
                              __html: log.answer.substring(0, 300) + (log.answer.length > 300 ? "..." : ""),
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">⚡ Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => navigate("/admin/assistant/logs")}
              variant="outline"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Ver Logs Completos
            </Button>
            <Button 
              onClick={() => navigate("/admin/assistant")}
              variant="outline"
            >
              <Bot className="w-4 h-4 mr-2" />
              Painel do Assistente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
