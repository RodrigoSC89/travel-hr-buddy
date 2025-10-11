"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RestoreLog {
  id: string;
  document_id: string;
  version_id: string;
  restored_by: string;
  restored_at: string;
  email: string | null;
}

export default function RestoreLogsPage() {
  const [logs, setLogs] = useState<RestoreLog[]>([]);
  const [filterEmail, setFilterEmail] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase.rpc("get_restore_logs_with_profiles");
      setLogs(data || []);
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) =>
    filterEmail ? log.email?.toLowerCase().includes(filterEmail.toLowerCase()) : true
  );

  function exportCSV() {
    const csvContent =
      "Documento,Versão Restaurada,Restaurado por,Data\n" +
      filteredLogs
        .map((log) =>
          [
            log.document_id,
            log.version_id,
            log.email,
            format(new Date(log.restored_at), "dd/MM/yyyy HH:mm"),
          ].join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "restore-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📜 Auditoria de Restaurações</h1>

      <div className="flex gap-4 items-center mb-4">
        <Input
          placeholder="Filtrar por e-mail do restaurador"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
        <Button variant="outline" onClick={exportCSV}>
          📤 Exportar CSV
        </Button>
      </div>

      {filteredLogs.length === 0 && (
        <p className="text-muted-foreground">Nenhuma restauração encontrada.</p>
      )}

      <div className="grid gap-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="space-y-1 p-4">
              <p>
                <strong>Documento:</strong>{" "}
                <Link
                  to={`/admin/documents/view/${log.document_id}`}
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  {log.document_id}
                </Link>
              </p>
              <p>
                <strong>Versão Restaurada:</strong> {log.version_id}
              </p>
              <p>
                <strong>Restaurado por:</strong> {log.email || "-"}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Data:</strong> {format(new Date(log.restored_at), "dd/MM/yyyy HH:mm")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
