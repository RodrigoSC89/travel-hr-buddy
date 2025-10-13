"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface RestoreReportLog {
  id: string;
  executed_at: string;
  status: string;
  message: string | null;
  error_details: string | null;
  triggered_by: string;
}

export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    let query = supabase.from("restore_report_logs").select("*");

    if (status) query = query.eq("status", status);
    if (startDate)
      query = query.gte("executed_at", new Date(startDate).toISOString());
    if (endDate)
      query = query.lte("executed_at", new Date(endDate).toISOString());

    const { data } = await query.order("executed_at", { ascending: false }).limit(100);
    setLogs(data || []);
  }

  function exportCSV() {
    const csv = logs
      .map(
        (l) =>
          `${format(new Date(l.executed_at), "yyyy-MM-dd HH:mm:ss")},${l.status},${l.message || ""},${l.error_details || ""}`
      )
      .join("\n");
    const header = "Data,Status,Mensagem,Erro";
    const blob = new Blob([`${header}\n${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "logs-relatorio.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Logs de Relatórios Automáticos", 14, 16);
    autoTable(doc, {
      head: [["Data", "Status", "Mensagem", "Erro"]],
      body: logs.map((l) => [
        format(new Date(l.executed_at), "dd/MM/yyyy HH:mm"),
        l.status,
        l.message || "-",
        l.error_details || "-",
      ]),
    });
    doc.save("logs-relatorio.pdf");
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">🧠 Auditoria de Relatórios Enviados</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Status (success/error)"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button onClick={fetchLogs}>🔍 Buscar</Button>
        <Button onClick={exportCSV}>📤 CSV</Button>
        <Button onClick={exportPDF}>📄 PDF</Button>
      </div>

      {logs.map((log) => (
        <Card key={log.id} className="p-4 border border-gray-300">
          <CardContent className="space-y-2 p-0">
            <div>
              <strong>Status:</strong> {log.status}
            </div>
            <div>
              <strong>Mensagem:</strong> {log.message || "-"}
            </div>
            <div>
              <strong>Data:</strong> {new Date(log.executed_at).toLocaleString()}
            </div>
            {log.error_details && (
              <div className="text-red-600">
                <strong>Erro:</strong> {log.error_details}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
