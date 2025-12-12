/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PATCH 94.0 - Logs Center
 * Centralized technical logs with filtering, AI audit, and PDF export
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Download, Brain, ChevronDown, Filter, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAIContext } from "@/ai/kernel";
import { exportLogsAsPDF } from "@/lib/logger/exportToPDF";
import { toast } from "sonner";
import type { LogEntry, LogLevel, LogFilter } from "./types";

export default function LogsCenter() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filters, setFilters] = useState<LogFilter>({});

  // Fetch logs from Supabase
  useEffect(() => {
    fetchLogs();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as unknown)
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Erro ao carregar logs");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filters.level) {
      filtered = filtered.filter((log) => log.level === filters.level);
    }

    if (filters.origin) {
      filtered = filtered.filter((log) => 
        log.origin.toLowerCase().includes(filters.origin!.toLowerCase())
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((log) =>
        log.message.toLowerCase().includes(searchLower) ||
        log.origin.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
  };

  const handleExportPDF = async () => {
    try {
      await exportLogsAsPDF(filteredLogs);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Erro ao exportar PDF");
    }
  };

  const handleAIDiagnostic = async () => {
    try {
      setAiLoading(true);

      // Analyze logs with AI
      const errorLogs = filteredLogs.filter((log) => log.level === "error");
      const warnLogs = filteredLogs.filter((log) => log.level === "warn");

      const aiResponse = await runAIContext({
        module: "log-audit",
        context: {
          totalLogs: filteredLogs.length,
          errorCount: errorLogs.length,
          warnCount: warnLogs.length,
          recentErrors: errorLogs.slice(0, 5).map((log) => ({
            origin: log.origin,
            message: log.message,
          })),
        },
      });

      // Show AI insights
      toast.success(
        <div>
          <p className="font-semibold">Diagnóstico de IA</p>
          <p className="text-sm mt-1">{aiResponse.message}</p>
          <p className="text-xs mt-2 text-muted-foreground">
            Confiança: {aiResponse.confidence.toFixed(1)}%
          </p>
        </div>,
        { duration: 8000 }
      );
    } catch (error) {
      console.error("Error running AI diagnostic:", error);
      toast.error("Erro ao executar diagnóstico de IA");
    } finally {
      setAiLoading(false);
    }
  });

  const getLevelIcon = (level: LogLevel) => {
    switch (level) {
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "warn":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadgeVariant = (level: LogLevel): "default" | "destructive" | "secondary" => {
    switch (level) {
    case "error":
      return "destructive";
    case "warn":
      return "secondary";
    case "info":
    default:
      return "default";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            Logs Center
          </CardTitle>
          <CardDescription>
            Painel de visualização de logs técnicos com filtros, IA de auditoria e exportação em PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar logs..."
                value={filters.search || ""}
                onChange={handleChange}
              />
            </div>

            <Select
              value={filters.level || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, level: value === "all" ? undefined : (value as LogLevel) })
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Origem..."
              className="w-[200px]"
              value={filters.origin || ""}
              onChange={handleChange}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={handleSetFilters}
              title="Limpar filtros"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} disabled={filteredLogs.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="secondary" onClick={handleAIDiagnostic} disabled={aiLoading || filteredLogs.length === 0}>
              <Brain className="mr-2 h-4 w-4" />
              {aiLoading ? "Analisando..." : "Executar Diagnóstico com IA"}
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 text-sm">
            <div>
              Total: <strong>{filteredLogs.length}</strong>
            </div>
            <div>
              Info: <strong>{filteredLogs.filter((l) => l.level === "info").length}</strong>
            </div>
            <div>
              Warn: <strong>{filteredLogs.filter((l) => l.level === "warn").length}</strong>
            </div>
            <div>
              Error: <strong>{filteredLogs.filter((l) => l.level === "error").length}</strong>
            </div>
          </div>

          {/* Logs Table */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum log encontrado</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Nível</TableHead>
                    <TableHead className="w-[180px]">Data/Hora</TableHead>
                    <TableHead className="w-[200px]">Origem</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <Collapsible key={log.id} asChild>
                      <>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {getLevelIcon(log.level)}
                              <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                                {log.level}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-sm font-mono">{log.origin}</TableCell>
                          <TableCell className="text-sm">{log.message}</TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSetExpandedLog}
                              >
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    expandedLog === log.id ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={5} className="bg-muted/50">
                              <div className="p-4 space-y-2">
                                <div>
                                  <strong className="text-sm">Detalhes:</strong>
                                  <pre className="mt-2 p-3 bg-background rounded text-xs overflow-auto">
                                    {JSON.stringify(log.details || {}, null, 2)}
                                  </pre>
                                </div>
                                {log.user_id && (
                                  <div className="text-sm">
                                    <strong>User ID:</strong> {log.user_id}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  Criado em: {new Date(log.created_at).toLocaleString("pt-BR")}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
