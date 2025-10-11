"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📜 Auditoria de Restaurações</h1>

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Filtrar por e-mail do restaurador"
          value={filterEmail}
          onChange={(e) => setFilterEmail(e.target.value)}
        />
      </div>

      {filteredLogs.length === 0 && (
        <p className="text-muted-foreground">Nenhuma restauração encontrada.</p>
      )}

      <div className="grid gap-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="space-y-1 p-4">
              <p>
                <strong>Documento:</strong> {log.document_id}
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
