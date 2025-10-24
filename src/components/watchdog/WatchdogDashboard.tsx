import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWatchdogLogs } from "@/hooks/use-watchdog-logs";
import { AlertCircle, CheckCircle, Wrench, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const severityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export const WatchdogDashboard = () => {
  const { logs, isLoading, resolveLog, stats } = useWatchdogLogs();
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const handleResolve = () => {
    if (selectedLog) {
      resolveLog({ id: selectedLog, notes: resolutionNotes });
      setSelectedLog(null);
      setResolutionNotes("");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando logs...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Críticos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.critical}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-corrigidos</CardTitle>
            <Wrench className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.autoFixed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
          <CardDescription>Últimos 100 erros detectados pelo Watchdog</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${severityColors[log.severity]}`} />
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{log.error_type}</span>
                    {log.module_name && (
                      <Badge variant="outline">{log.module_name}</Badge>
                    )}
                    {log.auto_fix_success && (
                      <Badge variant="default" className="bg-green-500">
                        <Wrench className="w-3 h-3 mr-1" />
                        Auto-corrigido
                      </Badge>
                    )}
                    {log.resolved_at && (
                      <Badge variant="default" className="bg-blue-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolvido
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{log.message}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                    {log.context?.count && (
                      <span>• {log.context.count} ocorrências</span>
                    )}
                  </div>
                </div>

                {!log.resolved_at && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log.id)}
                      >
                        Resolver
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Marcar como Resolvido</DialogTitle>
                        <DialogDescription>
                          Adicione notas sobre como o erro foi resolvido
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Descreva a solução aplicada..."
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                        />
                        <Button onClick={handleResolve} className="w-full">
                          Confirmar Resolução
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}

            {logs?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum erro detectado ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
