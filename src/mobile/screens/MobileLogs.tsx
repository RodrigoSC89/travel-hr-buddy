/**
import { useEffect, useState, useCallback } from "react";;
 * PATCH 187.0 - Mobile Logs Screen
 * 
 * Real-time system logs and activity tracking for mobile app
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  FileText,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
} from "lucide-react";
import { structuredLogger } from "@/lib/logger/structured-logger";
import type { LogEntry, LogLevel } from "@/lib/logger/structured-logger";

export const MobileLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Get recent logs from structured logger
    const recentLogs = structuredLogger.getRecentLogs();
    setLogs(recentLogs);

    // Auto-refresh logs every 5 seconds
    const interval = setInterval(() => {
      const updatedLogs = structuredLogger.getRecentLogs();
      setLogs(updatedLogs);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filter === "all" || log.level === filter;
    const matchesSearch = searchTerm === "" || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  };

  const getLogIcon = (level: LogLevel) => {
    switch (level) {
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case "warn":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "info":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "debug":
      return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogBadge = (level: LogLevel) => {
    const variants = {
      error: "destructive",
      warn: "default",
      info: "secondary",
      debug: "outline",
    } as const;

    return (
      <Badge variant={variants[level]} className="text-xs">
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLevelStats = () => {
    return {
      error: logs.filter(l => l.level === "error").length,
      warn: logs.filter(l => l.level === "warn").length,
      info: logs.filter(l => l.level === "info").length,
      debug: logs.filter(l => l.level === "debug").length,
    };
  };

  const stats = getLevelStats();

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Logs do Sistema
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe atividades e eventos em tempo real
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-red-500">{stats.error}</p>
            <p className="text-xs text-muted-foreground">Erros</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-yellow-500">{stats.warn}</p>
            <p className="text-xs text-muted-foreground">Avisos</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-blue-500">{stats.info}</p>
            <p className="text-xs text-muted-foreground">Info</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xl font-bold text-gray-500">{stats.debug}</p>
            <p className="text-xs text-muted-foreground">Debug</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar logs..."
          value={searchTerm}
          onChange={handleChange}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={handleSetFilter}
        >
          Todos
        </Button>
        <Button
          variant={filter === "error" ? "default" : "outline"}
          size="sm"
          onClick={handleSetFilter}
          className="whitespace-nowrap"
        >
          Erros ({stats.error})
        </Button>
        <Button
          variant={filter === "warn" ? "default" : "outline"}
          size="sm"
          onClick={handleSetFilter}
          className="whitespace-nowrap"
        >
          Avisos ({stats.warn})
        </Button>
        <Button
          variant={filter === "info" ? "default" : "outline"}
          size="sm"
          onClick={handleSetFilter}
          className="whitespace-nowrap"
        >
          Info ({stats.info})
        </Button>
      </div>

      {/* Logs List */}
      <ScrollArea className="h-[calc(100vh-400px)]">
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum log encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log, index) => (
              <Card key={`${log.timestamp}-${index}`}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-start gap-2">
                    {getLogIcon(log.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {getLogBadge(log.level)}
                      </div>
                      <p className="text-sm font-medium break-words">{log.message}</p>
                      
                      {log.context && Object.keys(log.context).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                            Ver detalhes
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                            {JSON.stringify(log.context, null, 2)}
                          </pre>
                        </details>
                      )}

                      {log.error && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
                            Ver erro
                          </summary>
                          <pre className="mt-1 p-2 bg-red-50 dark:bg-red-950 rounded text-xs overflow-auto text-red-600 dark:text-red-400">
                            {log.error.message}
                            {log.error.stack && `\n\n${log.error.stack}`}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
