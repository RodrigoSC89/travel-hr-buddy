/**
 * AIAuditTrail - Connected to real Supabase ai_audit_logs
 * Enterprise-grade AI decision logging and compliance
 */

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardList, Brain, Search, Download, CheckCircle2,
  Clock, MessageSquare, FileText, Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAIControlTowerData } from "@/hooks/useAIControlTowerData";
import { toast } from "sonner";

export function AIAuditTrail() {
  const { auditLogs, decisions, metrics, isLoading } = useAIControlTowerData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return auditLogs;
    const term = searchTerm.toLowerCase();
    return auditLogs.filter((log: any) =>
      (log.user_input || "").toLowerCase().includes(term) ||
      (log.ai_response || "").toLowerCase().includes(term) ||
      (log.model_version || "").toLowerCase().includes(term)
    );
  }, [auditLogs, searchTerm]);

  const totalTokens = useMemo(() =>
    auditLogs.reduce((sum: number, l: any) => sum + (l.tokens_input || 0) + (l.tokens_output || 0), 0),
    [auditLogs]
  );

  const handleExport = () => {
    const csv = [
      ["ID", "Input", "Resposta", "Modelo", "Confiança", "Tempo(ms)", "Data"].join(","),
      ...auditLogs.map((log: any) => [
        log.id,
        `"${(log.user_input || "").replace(/"/g, '""')}"`,
        `"${(log.ai_response || "").slice(0, 100).replace(/"/g, '""')}"`,
        log.model_version || "",
        log.confidence_score || "",
        log.response_time_ms || "",
        log.created_at
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast.success("Log de auditoria exportado");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Auditoria de IA (Blockchain)
          </h2>
          <p className="text-muted-foreground">Trilha completa de interações e decisões de IA</p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={auditLogs.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{auditLogs.length}</p>
            <p className="text-xs text-muted-foreground">Total Interações</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{decisions.length}</p>
            <p className="text-xs text-muted-foreground">Decisões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{metrics.approvedDecisions}</p>
            <p className="text-xs text-muted-foreground">Aprovadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{metrics.rejectedDecisions}</p>
            <p className="text-xs text-muted-foreground">Rejeitadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{totalTokens.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Tokens Usados</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por input, resposta ou modelo..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Audit List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Log de Auditoria ({filteredLogs.length})</CardTitle>
          <CardDescription>Todas as interações registradas com a IA</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Nenhuma interação registrada</h3>
                  <p>Interações com a IA aparecerão aqui automaticamente</p>
                </div>
              ) : (
                filteredLogs.map((log: any) => (
                  <motion.div
                    key={log.id}
                    className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.005 }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Brain className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{log.user_input || "—"}</p>
                          {log.ai_response && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{log.ai_response.slice(0, 200)}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                            </span>
                            {log.model_version && <Badge variant="outline" className="text-xs">{log.model_version}</Badge>}
                            {log.response_time_ms && <span>{log.response_time_ms}ms</span>}
                            {log.confidence_score && <span>{Math.round(log.confidence_score * 100)}% conf.</span>}
                            {(log.tokens_input || log.tokens_output) && (
                              <span>{(log.tokens_input || 0) + (log.tokens_output || 0)} tokens</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIAuditTrail;
