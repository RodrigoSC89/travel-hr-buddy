/**
 * System Diagnostics Panel - PATCH 850
 * Visual component for system diagnostics
 */

import { useSystemDiagnostics } from "@/lib/production";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, Activity } from "lucide-react";

export function SystemDiagnosticsPanel() {
  const { report, isRunning, runDiagnostics } = useSystemDiagnostics();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Diagnóstico do Sistema
        </CardTitle>
        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          size="sm"
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isRunning ? "Executando..." : "Executar"}
        </Button>
      </CardHeader>
      <CardContent>
        {!report ? (
          <p className="text-muted-foreground text-sm">
            Clique em "Executar" para iniciar o diagnóstico do sistema.
          </p>
        ) : (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center gap-2">
              {report.overallPassed ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Todos os testes passaram
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  Alguns testes falharam
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {report.totalDuration.toFixed(0)}ms
              </span>
            </div>

            {/* Test Results */}
            <div className="space-y-2">
              {report.results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {result.passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{result.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {result.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {result.duration.toFixed(0)}ms
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* System Info */}
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-2">Informações do Sistema</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>Plataforma: {report.systemInfo.platform}</div>
                <div>Idioma: {report.systemInfo.language}</div>
                <div>Conexão: {report.systemInfo.onLine ? "Online" : "Offline"}</div>
                {report.systemInfo.connection && (
                  <div>Rede: {report.systemInfo.connection.effectiveType}</div>
                )}
                {report.systemInfo.memory && (
                  <div>
                    Memória: {((report.systemInfo.memory.used / report.systemInfo.memory.total) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
