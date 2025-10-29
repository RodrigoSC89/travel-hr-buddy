/**
 * PATCH 471 - Coordination Logs Component
 * Displays coordination events and logs from the database
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { coordinationService, type CoordinationLog } from "../services/coordinationService";
import { Button } from "@/components/ui/button";

export const CoordinationLogs: React.FC = () => {
  const [logs, setLogs] = useState<CoordinationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const logList = await coordinationService.getCoordinationLogs(50);
      setLogs(logList);
    } catch (error) {
      console.error("Failed to load logs:", error);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadLogs();
    setIsLoading(false);
  };

  const getEventIcon = (eventType: CoordinationLog["eventType"]) => {
    switch (eventType) {
      case "conflict":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "resolution":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "handoff":
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case "coordination":
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (eventType: CoordinationLog["eventType"]): string => {
    switch (eventType) {
      case "conflict":
        return "border-orange-500/30 bg-orange-500/10";
      case "resolution":
        return "border-green-500/30 bg-green-500/10";
      case "handoff":
        return "border-blue-500/30 bg-blue-500/10";
      case "coordination":
        return "border-purple-500/30 bg-purple-500/10";
      default:
        return "border-gray-500/30 bg-gray-500/10";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Logs de Coordenação
            <Badge variant="outline">{logs.length} eventos</Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum log de coordenação disponível</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 border rounded-lg ${getEventColor(log.eventType)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getEventIcon(log.eventType)}
                      <Badge variant="outline" className="text-xs">
                        {log.eventType.toUpperCase()}
                      </Badge>
                      {log.success !== undefined && (
                        <Badge
                          variant={log.success ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {log.success ? "Sucesso" : "Falha"}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 text-sm">
                    <Badge variant="secondary" className="text-xs">
                      {log.sourceModule.replace("-", " ").toUpperCase()}
                    </Badge>
                    {log.targetModule && (
                      <>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <Badge variant="secondary" className="text-xs">
                          {log.targetModule.replace("-", " ").toUpperCase()}
                        </Badge>
                      </>
                    )}
                  </div>

                  {log.decisionData && Object.keys(log.decisionData).length > 0 && (
                    <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                      <div className="font-medium mb-1">Dados da Decisão:</div>
                      <code className="text-muted-foreground">
                        {JSON.stringify(log.decisionData, null, 2).slice(0, 100)}
                        {JSON.stringify(log.decisionData).length > 100 && "..."}
                      </code>
                    </div>
                  )}

                  {log.confidenceScore !== undefined && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Confiança:</span>
                      <div className="flex-1 bg-background/50 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${log.confidenceScore}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{log.confidenceScore}%</span>
                    </div>
                  )}

                  {log.conflictDetected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-orange-500">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Conflito detectado</span>
                      {log.resolutionStrategy && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Resolução: {log.resolutionStrategy}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CoordinationLogs;
