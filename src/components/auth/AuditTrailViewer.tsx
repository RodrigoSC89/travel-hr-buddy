/**
import { useEffect, useState, useMemo } from "react";;
 * Audit Trail Viewer Component
 * PATCH 123.0 - Audit Trail por Role
 * 
 * Displays user actions with role context for system watchdog
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Activity, 
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Clock,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RoleGuard } from "./RoleGuard";

interface AccessLog {
  id: string;
  user_id?: string | null;
  action: string;
  module_accessed: string;
  result: string;
  severity: string;
  timestamp: string;
  ip_address?: unknown;
  user_agent?: string | null;
  details?: Record<string, unknown> | null;
  created_at: string;
}

const RESULT_CONFIG: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  success: { label: "Sucesso", icon: CheckCircle, color: "text-green-500" },
  failure: { label: "Falha", icon: XCircle, color: "text-red-500" },
  denied: { label: "Negado", icon: XCircle, color: "text-orange-500" },
  error: { label: "Erro", icon: AlertCircle, color: "text-yellow-500" },
};

export const AuditTrailViewer: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      // Apply filters
      if (filterStatus !== "all") {
        query = query.eq("result", filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os logs de auditoria.",
          variant: "destructive",
        });
        return;
      }

      // Type assertion for Json types
      const typedData = (data || []).map(log => ({
        ...log,
        details: log.details as Record<string, unknown> | null,
      }));
      setLogs(typedData);
    } catch (error) {
      console.error("Error loading audit logs:", error);
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  });

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(searchLower) ||
      log.module_accessed.toLowerCase().includes(searchLower)
    );
  };

  const getResultConfig = (result: string) => {
    return RESULT_CONFIG[result] || RESULT_CONFIG.success;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <RoleGuard requiredRoles={["admin", "auditor"]}>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <CardTitle>Trilha de Auditoria</CardTitle>
            </div>
            <CardDescription>
              Visualize todas as ações dos usuários com contexto de função e detalhes completos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ações..."
                  value={searchTerm}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os resultados</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failure">Falha</SelectItem>
                  <SelectItem value="denied">Negado</SelectItem>
                  <SelectItem value="error">Erro</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={loadLogs} className="gap-2">
                <Filter className="w-4 h-4" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Nenhum log encontrado com os filtros aplicados.
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => {
              const resultConfig = getResultConfig(log.result);
              const ResultIcon = resultConfig.icon;

              return (
                <Card key={log.id} className="border-l-4" style={{
                  borderLeftColor: log.result === "success" ? "#22c55e" : 
                    log.result === "failure" || log.result === "denied" ? "#ef4444" : "#eab308"
                }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <ResultIcon className={`w-5 h-5 mt-0.5 ${resultConfig.color}`} />
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{log.action}</h4>
                            <Badge variant="outline">{log.module_accessed}</Badge>
                            <Badge variant={
                              log.result === "success" ? "default" : 
                                log.result === "failure" || log.result === "denied" ? "destructive" : "secondary"
                            }>
                              {resultConfig.label}
                            </Badge>
                            <Badge variant="secondary">{log.severity}</Badge>
                          </div>

                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(log.timestamp), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                              {log.ip_address !== null && log.ip_address !== undefined && (
                                <span>IP: {String(log.ip_address)}</span>
                              )}
                            </div>

                            {log.details && Object.keys(log.details).length > 0 && (
                              <details className="text-xs">
                                <summary className="cursor-pointer hover:text-foreground">
                                  Ver detalhes completos
                                </summary>
                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {logs.filter(l => l.result === "success").length}
                </p>
                <p className="text-sm text-muted-foreground">Sucessos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {logs.filter(l => l.result === "failure").length}
                </p>
                <p className="text-sm text-muted-foreground">Falhas</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">
                  {logs.filter(l => l.result === "denied").length}
                </p>
                <p className="text-sm text-muted-foreground">Negados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {logs.filter(l => l.result === "error").length}
                </p>
                <p className="text-sm text-muted-foreground">Erros</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
});
