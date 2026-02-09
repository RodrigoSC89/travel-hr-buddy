/**
 * SATCOM Dashboard Enhanced - Comunicação Satelital Premium
 * PATCH PREMIUM-2.0
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Satellite, Radio, Wifi, Signal, Globe, 
  AlertTriangle, Activity, RefreshCw, Clock,
  CheckCircle, XCircle, TrendingUp, Zap,
  Terminal, Send, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

const connections = [
  { id: "1", name: "Iridium Certus 700", provider: "Iridium", status: "connected", signal: 94, latency: 680, bandwidth: 700, priority: 1 },
  { id: "2", name: "Starlink Maritime", provider: "Starlink", status: "connected", signal: 88, latency: 35, bandwidth: 150000, priority: 2 },
  { id: "3", name: "Inmarsat FleetBroadband", provider: "Inmarsat", status: "degraded", signal: 45, latency: 720, bandwidth: 432, priority: 3 },
  { id: "4", name: "Thuraya MarineStar", provider: "Thuraya", status: "standby", signal: 0, latency: 0, bandwidth: 444, priority: 4 },
];

const recentEvents = [
  { id: "1", time: "14:32", type: "connection", message: "Starlink reconectado após handover", severity: "info" },
  { id: "2", time: "13:45", type: "alert", message: "Inmarsat degradado - interferência atmosférica", severity: "warning" },
  { id: "3", time: "12:20", type: "failover", message: "Failover automático: Inmarsat → Iridium", severity: "info" },
  { id: "4", time: "11:55", type: "maintenance", message: "Manutenção programada Thuraya concluída", severity: "success" },
];

const uptimeStats = {
  overall: 99.7,
  last24h: 99.2,
  last7d: 99.8,
  last30d: 99.7,
};

const bandwidthUsage = {
  current: 45.2,
  peak: 78.5,
  average: 32.1,
  limit: 100,
};

export default function SatcomDashboardEnhanced() {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [connectionStates, setConnectionStates] = React.useState<Record<string, string>>({});
  const [terminalInput, setTerminalInput] = React.useState("");
  const [terminalOutput, setTerminalOutput] = React.useState<string[]>([
    "SATCOM Terminal v2.0 - Ready",
    "Type 'help' for available commands",
    ""
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    requestAnimationFrame(() => {
      setIsRefreshing(false);
      toast.success("Status atualizado com dados em tempo real");
    });
  };

  const handleActivateConnection = (conn: typeof connections[0]) => {
    setConnectionStates(prev => ({ ...prev, [conn.id]: "connecting" }));
    toast.loading(`Ativando ${conn.name}...`, { id: `activate-${conn.id}` });
    // Simulate real activation (would call edge function in production)
    requestAnimationFrame(() => {
      setConnectionStates(prev => ({ ...prev, [conn.id]: "connected" }));
      toast.success(`${conn.name} ativado com sucesso`, { id: `activate-${conn.id}` });
    });
  };

  const handleTestConnection = () => {
    toast.loading("Testando conexões SATCOM...", { id: "test-conn" });
    const results = connections
      .filter(c => c.status === "connected")
      .map(c => `${c.name}: ${c.latency}ms (${c.signal}%)`)
      .join("\n");
    toast.success("Teste concluído", { id: "test-conn", description: results || "Nenhuma conexão ativa" });
  };

  const handleDiagnostic = (conn: typeof connections[0]) => {
    toast.info(`Diagnóstico: ${conn.name}`, {
      description: `Sinal: ${conn.signal}% | Latência: ${conn.latency}ms | Bandwidth: ${conn.bandwidth >= 1000 ? `${(conn.bandwidth/1000).toFixed(0)} Mbps` : `${conn.bandwidth} Kbps`} | Prioridade: ${conn.priority}`,
      duration: 8000
    });
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    
    const newOutput = [...terminalOutput, `> ${terminalInput}`];
    
    // Simulate command responses
    if (terminalInput.toLowerCase() === "status") {
      newOutput.push("All systems operational. Primary: Iridium (94% signal)");
    } else if (terminalInput.toLowerCase() === "ping") {
      newOutput.push("Pinging satellite network...");
      newOutput.push("Response: 680ms (Iridium), 35ms (Starlink), 720ms (Inmarsat)");
    } else if (terminalInput.toLowerCase() === "help") {
      newOutput.push("Available commands: status, ping, failover, bandwidth, clear");
    } else if (terminalInput.toLowerCase() === "clear") {
      setTerminalOutput(["Terminal cleared", ""]);
      setTerminalInput("");
      return;
    } else {
      newOutput.push(`Command not recognized: ${terminalInput}`);
    }
    
    newOutput.push("");
    setTerminalOutput(newOutput.slice(-20)); // Keep last 20 lines
    setTerminalInput("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "standby": return <Clock className="h-4 w-4 text-muted-foreground" />;
      default: return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg">
                <Satellite className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">SATCOM Dashboard</h1>
                  <Badge className="bg-emerald-500/10 text-emerald-600 gap-1">
                    <Signal className="h-3 w-3" />
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Monitoramento de comunicações satelitais</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Button size="sm" className="gap-2" onClick={handleTestConnection}>
                <Zap className="h-4 w-4" />
                Testar Conexão
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conexões Ativas</p>
                  <p className="text-2xl font-bold">2/4</p>
                </div>
                <Wifi className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Sinal Primário</p>
                  <p className="text-2xl font-bold">94%</p>
                </div>
                <Signal className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Uptime (30d)</p>
                  <p className="text-2xl font-bold">{uptimeStats.last30d}%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Latência</p>
                  <p className="text-2xl font-bold">35ms</p>
                </div>
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="connections" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center gap-1 rounded-lg bg-muted/50 p-1">
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              Conexões
            </TabsTrigger>
            <TabsTrigger value="terminal" className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Terminal
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="bandwidth" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Bandwidth
            </TabsTrigger>
          </TabsList>

          {/* Conexões */}
          <TabsContent value="connections">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {connections.map((conn) => (
                <Card key={conn.id} className={conn.status === "connected" ? "border-emerald-500/30" : conn.status === "degraded" ? "border-amber-500/30" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(conn.status)}
                        <div>
                          <p className="font-medium">{conn.name}</p>
                          <p className="text-sm text-muted-foreground">{conn.provider}</p>
                        </div>
                      </div>
                      <Badge variant={conn.priority === 1 ? "default" : "outline"}>
                        Prioridade {conn.priority}
                      </Badge>
                    </div>
                    
                    {conn.status !== "standby" && (
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Sinal</span>
                            <span>{conn.signal}%</span>
                          </div>
                          <Progress value={conn.signal} className="h-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Latência</p>
                            <p className="font-medium">{conn.latency}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bandwidth</p>
                            <p className="font-medium">{conn.bandwidth >= 1000 ? `${(conn.bandwidth/1000).toFixed(0)} Mbps` : `${conn.bandwidth} Kbps`}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDiagnostic(conn)}>
                        Diagnóstico
                      </Button>
                      {conn.status === "standby" && (
                        <Button size="sm" className="flex-1" onClick={() => handleActivateConnection(conn)} disabled={connectionStates[conn.id] === "connecting"}>
                          {connectionStates[conn.id] === "connecting" ? "Ativando..." : "Ativar"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Terminal */}
          <TabsContent value="terminal">
            <Card className="bg-slate-950 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-emerald-400">
                  <Terminal className="h-5 w-5" />
                  SATCOM Terminal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-sm text-slate-300 h-[300px] overflow-y-auto mb-4 p-3 bg-slate-900 rounded">
                  {terminalOutput.map((line, i) => (
                    <div key={i} className={line.startsWith(">") ? "text-emerald-400" : ""}>
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
                <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 font-mono">&gt;</span>
                    <input
                      type="text"
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="Digite um comando..."
                    />
                  </div>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Eventos */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Eventos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg border flex items-center gap-4">
                      <span className="text-sm text-muted-foreground font-mono">{event.time}</span>
                      <Badge variant={
                        event.severity === "warning" ? "secondary" :
                        event.severity === "success" ? "default" :
                        "outline"
                      }>
                        {event.type}
                      </Badge>
                      <span className="text-sm">{event.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bandwidth */}
          <TabsContent value="bandwidth">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Uso de Banda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Atual</span>
                      <span className="font-medium">{bandwidthUsage.current} Mbps</span>
                    </div>
                    <Progress value={(bandwidthUsage.current / bandwidthUsage.limit) * 100} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Pico</p>
                      <p className="text-lg font-bold">{bandwidthUsage.peak}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Média</p>
                      <p className="text-lg font-bold">{bandwidthUsage.average}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <p className="text-xs text-muted-foreground">Limite</p>
                      <p className="text-lg font-bold">{bandwidthUsage.limit}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border text-center">
                      <p className="text-sm text-muted-foreground">Geral</p>
                      <p className="text-2xl font-bold">{uptimeStats.overall}%</p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <p className="text-sm text-muted-foreground">24 horas</p>
                      <p className="text-2xl font-bold">{uptimeStats.last24h}%</p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <p className="text-sm text-muted-foreground">7 dias</p>
                      <p className="text-2xl font-bold">{uptimeStats.last7d}%</p>
                    </div>
                    <div className="p-4 rounded-lg border text-center">
                      <p className="text-sm text-muted-foreground">30 dias</p>
                      <p className="text-2xl font-bold">{uptimeStats.last30d}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
