"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EmailLog {
  id: string;
  sent_at: string;
  status: string;
  message: string;
  recipient_email?: string;
  error_details?: string;
  report_type?: string;
}

export default function EmailReportLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [statusFilter, dateStart, dateEnd]);

  async function fetchLogs() {
    let query = supabase
      .from("report_email_logs")
      .select("*")
      .order("sent_at", { ascending: false });

    if (statusFilter) query = query.eq("status", statusFilter);
    if (dateStart) query = query.gte("sent_at", dateStart);
    if (dateEnd) query = query.lte("sent_at", dateEnd);

    const { data } = await query;
    setLogs(data || []);
  }

  return (
    <ScrollArea className="p-6 h-[90vh]">
      <h1 className="text-2xl font-bold mb-4">📬 Logs de Envio de Relatórios Diários</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="Filtrar por status (success, error...)"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-52"
        />
        <Input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
        <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        <Button onClick={fetchLogs}>🔍 Atualizar</Button>
      </div>

      {logs.map((log) => (
        <Card key={log.id} className="mb-4">
          <CardContent className="py-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {format(new Date(log.sent_at), "dd/MM/yyyy HH:mm")}
              </span>
              <Badge
                variant={
                  log.status === "success"
                    ? "success"
                    : log.status === "error"
                      ? "destructive"
                      : "outline"
                }
              >
                {log.status.toUpperCase()}
              </Badge>
            </div>
            <div className="text-base">📨 {log.message}</div>
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  );
}
