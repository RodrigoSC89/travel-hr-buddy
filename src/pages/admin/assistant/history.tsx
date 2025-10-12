"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ArrowLeft } from "lucide-react";

interface AssistantLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  question: string;
  answer: string;
  action?: string;
  target?: string;
  created_at: string;
}

export default function AssistantHistoryPage() {
  const [logs, setLogs] = useState<AssistantLog[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLogs() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Try to fetch from Supabase Edge Function
        const { data, error } = await supabase.functions.invoke("assistant-logs");

        if (error) {
          console.error("Error fetching logs from function:", error);
          // Fallback: try direct query if user is admin
          const { data: logsData, error: queryError } = await supabase
            .from("assistant_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

          if (queryError) {
            console.error("Error fetching logs:", queryError);
          } else {
            setLogs(logsData || []);
          }
        } else {
          setLogs(data || []);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [user]);

  const filtered = logs.filter(
    (log) =>
      log.question?.toLowerCase().includes(filter.toLowerCase()) ||
      log.answer?.toLowerCase().includes(filter.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/assistant")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">📜 Histórico do Assistente IA</h1>
      </div>

      <div className="mb-4 flex gap-2">
        <Input
          placeholder="🔍 Filtrar por palavra-chave..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => downloadCSV(filtered)}>📤 Exportar CSV</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="ml-3 text-muted-foreground">Carregando histórico...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {filter ? "Nenhum registro encontrado com o filtro aplicado." : "Nenhum histórico disponível ainda."}
          </p>
        </Card>
      ) : (
        <ScrollArea className="max-h-[70vh] border rounded-md p-2 bg-white">
          <div className="space-y-4">
            {filtered.map((log) => (
              <Card key={log.id} className="p-4">
                <p className="text-xs text-muted-foreground">
                  👤 {log.user_email || "Usuário"} —{" "}
                  {new Date(log.created_at).toLocaleString("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
                <p className="font-medium mt-2">❓ {log.question}</p>
                <div
                  className="text-sm mt-1 text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: `💬 ${log.answer}` }}
                />
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function downloadCSV(data: AssistantLog[]) {
  const csv = [
    ["Data", "Usuário", "Pergunta", "Resposta"],
    ...data.map((log) => [
      new Date(log.created_at).toLocaleString("pt-BR"),
      log.user_email || "Não informado",
      log.question || "",
      // Remove HTML tags from answer for CSV
      (log.answer || "").replace(/<[^>]*>/g, ""),
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `assistant_logs_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
