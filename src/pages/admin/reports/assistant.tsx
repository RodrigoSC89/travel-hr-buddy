"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "@/hooks/use-toast";

interface AssistantReportLog {
  id: string;
  user_email: string;
  status: string;
  message: string | null;
  sent_at: string;
  user_id: string | null;
  report_type: string | null;
}

export default function AssistantReportLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AssistantReportLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("start", startDate);
      if (endDate) params.append("end", endDate);
      if (email) params.append("email", email);

      // Get session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Não autenticado",
          description: "Você precisa estar autenticado para acessar esta página.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant-report-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }

      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de envio de relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    doc.text("📬 Logs de Envio de Relatórios do Assistente IA", 14, 16);
    autoTable(doc, {
      startY: 24,
      head: [["Data", "Usuário", "Status", "Mensagem"]],
      body: logs.map((log) => [
        new Date(log.sent_at).toLocaleString(),
        log.user_email,
        log.status,
        log.message || "-"
      ]),
      styles: { fontSize: 8 },
    });
    doc.save("logs-assistente.pdf");

    toast({
      title: "PDF exportado",
      description: "O PDF foi baixado com sucesso.",
    });
  }

  function exportCSV() {
    if (logs.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há logs para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csv = [
      ["Data", "Usuário", "Status", "Mensagem"],
      ...logs.map((log) => [
        new Date(log.sent_at).toLocaleString(),
        log.user_email,
        log.status,
        log.message || "-"
      ])
    ].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs-assistente.csv";
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado",
      description: "O CSV foi baixado com sucesso.",
    });
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
        <h1 className="text-xl font-bold mb-4">📬 Logs de Envio de Relatórios — Assistente IA</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <Input 
          type="date" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Data inicial"
        />
        <Input 
          type="date" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="Data final"
        />
        <Input 
          placeholder="E-mail do usuário" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <Button onClick={fetchLogs}>🔍 Buscar</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={exportCSV} disabled={logs.length === 0} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          📤 Exportar CSV
        </Button>
        <Button onClick={exportPDF} disabled={logs.length === 0} variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          📄 Exportar PDF
        </Button>
      </div>

      <ScrollArea className="max-h-[70vh] border rounded-md p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p>Carregando...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <Card key={i} className="p-4">
                <p className="text-xs text-muted-foreground">
                  📅 {new Date(log.sent_at).toLocaleString()}
                </p>
                <p><strong>👤 Usuário:</strong> {log.user_email}</p>
                <p>
                  <strong>📦 Status:</strong>{" "}
                  <span 
                    className={`px-2 py-0.5 rounded text-xs ${
                      log.status === "success" 
                        ? "bg-green-100 text-green-800" 
                        : log.status === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </p>
                <p><strong>💬 Mensagem:</strong> {log.message || "-"}</p>
                {log.report_type && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Tipo: {log.report_type}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
