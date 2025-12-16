/**
 * PATCH 541 - Virtualized Logs Center
 * High-performance logs rendering with @tanstack/react-virtual
 */

import React, { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, Brain, Filter, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { runAIContext } from "@/ai/kernel";
import { exportLogsAsPDF } from "@/lib/logger/exportToPDF";
import { toast } from "sonner";
import type { LogEntry, LogLevel, LogFilter } from "./types";

export default function VirtualizedLogsCenter() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [filters, setFilters] = useState<LogFilter>({});

  const parentRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling configuration
  const rowVirtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Estimated row height
    overscan: 10, // Render 10 extra items above/below viewport
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000); // Increased limit for virtualization demo

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
      filtered = filtered.filter(
        (log) =>
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
  };

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

  const getLevelBadgeVariant = (
    level: LogLevel
  ): "default" | "destructive" | "secondary" => {
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
            Logs Center (Virtualized)
          </CardTitle>
          <CardDescription>
            Renderização de alta performance com virtualização - Suporta milhares de logs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar logs..."
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <Select
              value={filters.level || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  level: value === "all" ? undefined : (value as LogLevel),
                })
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
              onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => setFilters({})}
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
            <Button
              variant="secondary"
              onClick={handleAIDiagnostic}
              disabled={aiLoading || filteredLogs.length === 0}
            >
              <Brain className="mr-2 h-4 w-4" />
              {aiLoading ? "Analisando..." : "Diagnóstico IA"}
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
              Error:{" "}
              <strong>{filteredLogs.filter((l) => l.level === "error").length}</strong>
            </div>
          </div>

          {/* Virtualized Logs List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum log encontrado
            </div>
          ) : (
            <div
              ref={parentRef}
              className="border rounded-lg overflow-auto"
              style={{ height: "600px" }}
            >
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const log = filteredLogs[virtualRow.index];
                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 px-4 py-3">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          {getLevelIcon(log.level)}
                          <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground min-w-[150px]">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </div>
                        <div className="text-sm font-mono text-muted-foreground min-w-[150px] truncate">
                          {log.origin}
                        </div>
                        <div className="text-sm flex-1 truncate">{log.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
