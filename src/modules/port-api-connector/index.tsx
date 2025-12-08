/**
 * PATCH: Conector API Universal para Portos
 * Integração com sistemas portuários globais
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Plug, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Anchor,
  Ship,
  FileText,
  Zap,
  Settings,
  Activity,
  Database,
  Link2,
  AlertTriangle,
  Brain,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface PortConnection {
  id: string;
  portName: string;
  country: string;
  apiType: "REST" | "SOAP" | "EDI" | "MQTT";
  status: "connected" | "disconnected" | "error" | "syncing";
  lastSync: Date;
  dataTypes: string[];
  messagesProcessed: number;
}

interface APILog {
  id: string;
  timestamp: Date;
  port: string;
  action: string;
  status: "success" | "error" | "pending";
  responseTime: number;
  details: string;
}

const mockConnections: PortConnection[] = [
  {
    id: "1",
    portName: "Porto de Santos",
    country: "Brasil",
    apiType: "REST",
    status: "connected",
    lastSync: new Date(Date.now() - 300000),
    dataTypes: ["Berth", "Cargo", "Customs"],
    messagesProcessed: 1234
  },
  {
    id: "2",
    portName: "Port of Rotterdam",
    country: "Holanda",
    apiType: "EDI",
    status: "connected",
    lastSync: new Date(Date.now() - 600000),
    dataTypes: ["Vessel Traffic", "Berth Allocation"],
    messagesProcessed: 856
  },
  {
    id: "3",
    portName: "Port of Singapore",
    country: "Singapura",
    apiType: "REST",
    status: "syncing",
    lastSync: new Date(Date.now() - 120000),
    dataTypes: ["Port Clearance", "Pilotage"],
    messagesProcessed: 2341
  },
  {
    id: "4",
    portName: "Port of Hamburg",
    country: "Alemanha",
    apiType: "SOAP",
    status: "error",
    lastSync: new Date(Date.now() - 3600000),
    dataTypes: ["Customs", "Documentation"],
    messagesProcessed: 445
  },
  {
    id: "5",
    portName: "Port of Shanghai",
    country: "China",
    apiType: "MQTT",
    status: "connected",
    lastSync: new Date(Date.now() - 180000),
    dataTypes: ["Real-time Tracking", "Berth Status"],
    messagesProcessed: 5678
  },
];

const mockLogs: APILog[] = [
  { id: "1", timestamp: new Date(Date.now() - 60000), port: "Porto de Santos", action: "BERTH_REQUEST", status: "success", responseTime: 234, details: "Solicitação de berço aprovada" },
  { id: "2", timestamp: new Date(Date.now() - 120000), port: "Port of Rotterdam", action: "CARGO_MANIFEST", status: "success", responseTime: 456, details: "Manifesto de carga sincronizado" },
  { id: "3", timestamp: new Date(Date.now() - 180000), port: "Port of Hamburg", action: "CUSTOMS_CLEARANCE", status: "error", responseTime: 5000, details: "Timeout na conexão" },
  { id: "4", timestamp: new Date(Date.now() - 240000), port: "Port of Singapore", action: "PILOT_REQUEST", status: "success", responseTime: 189, details: "Praticagem confirmada" },
  { id: "5", timestamp: new Date(Date.now() - 300000), port: "Port of Shanghai", action: "VESSEL_ETA", status: "pending", responseTime: 0, details: "Aguardando confirmação" },
];

export default function PortAPIConnector() {
  const { integratePort, isLoading: aiLoading } = useNautilusEnhancementAI();
  const [connections, setConnections] = useState<PortConnection[]>(mockConnections);
  const [logs, setLogs] = useState<APILog[]>(mockLogs);
  const [isSyncing, setIsSyncing] = useState(false);
  const [aiStatus, setAiStatus] = useState<Record<string, any>>({});

  const syncAll = () => {
    setIsSyncing(true);
    toast.info("Sincronizando todas as conexões...");
    
    setTimeout(() => {
      setConnections(prev => prev.map(conn => ({
        ...conn,
        lastSync: new Date(),
        status: conn.status === "error" ? "error" : "connected"
      })));
      setIsSyncing(false);
      toast.success("Sincronização concluída!");
    }, 2000);
  };

  const toggleConnection = (id: string) => {
    setConnections(prev => prev.map(conn => {
      if (conn.id === id) {
        const newStatus = conn.status === "connected" ? "disconnected" : "connected";
        toast.success(`${conn.portName} ${newStatus === "connected" ? "conectado" : "desconectado"}`);
        return { ...conn, status: newStatus };
      }
      return conn;
    }));
  };

  const testConnection = async (id: string) => {
    const conn = connections.find(c => c.id === id);
    if (!conn) return;
    
    toast.info(`Testando conexão com ${conn.portName}...`);
    
    // Use AI to analyze port integration status
    const result = await integratePort(conn.portName, id);
    
    if (result?.response) {
      setAiStatus(prev => ({ ...prev, [id]: result.response }));
      toast.success(`Conexão com ${conn.portName} analisada pela IA!`);
    } else {
      toast.error(`Falha na análise de ${conn.portName}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500/20 text-green-400";
      case "disconnected": return "bg-gray-500/20 text-gray-400";
      case "error": return "bg-red-500/20 text-red-400";
      case "syncing": return "bg-blue-500/20 text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle2 className="h-4 w-4 text-green-400" />;
      case "disconnected": return <XCircle className="h-4 w-4 text-gray-400" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "syncing": return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plug className="h-8 w-8 text-primary" />
            Conector API Universal - Portos
          </h1>
          <p className="text-muted-foreground mt-1">
            Integração com sistemas portuários globais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={syncAll} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar Todos
          </Button>
          <Button>
            <Link2 className="h-4 w-4 mr-2" />
            Nova Conexão
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Globe className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.filter(c => c.status === "connected").length}</p>
                <p className="text-xs text-muted-foreground">Portos Conectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.reduce((acc, c) => acc + c.messagesProcessed, 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Mensagens Processadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connections.filter(c => c.status === "error").length}</p>
                <p className="text-xs text-muted-foreground">Com Erro</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.2%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Conexões</TabsTrigger>
          <TabsTrigger value="logs">Logs de API</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((conn) => (
              <Card key={conn.id} className={`hover:border-primary/50 transition-colors ${conn.status === "error" ? "border-red-500/50" : ""}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Anchor className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{conn.portName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{conn.country}</p>
                      </div>
                    </div>
                    {getStatusIcon(conn.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(conn.status)}>
                      {conn.status === "connected" ? "Conectado" :
                       conn.status === "disconnected" ? "Desconectado" :
                       conn.status === "error" ? "Erro" : "Sincronizando"}
                    </Badge>
                    <Badge variant="outline">{conn.apiType}</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {conn.dataTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Última sincronização:</span>
                      <span>{conn.lastSync.toLocaleTimeString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mensagens processadas:</span>
                      <span>{conn.messagesProcessed.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => testConnection(conn.id)}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Testar
                    </Button>
                    <Button 
                      variant={conn.status === "connected" ? "destructive" : "default"}
                      size="sm" 
                      className="flex-1"
                      onClick={() => toggleConnection(conn.id)}
                    >
                      {conn.status === "connected" ? "Desconectar" : "Conectar"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Comunicação</CardTitle>
              <CardDescription>Histórico de requisições e respostas</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === "success" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : log.status === "error" ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{log.action}</p>
                          <p className="text-xs text-muted-foreground">{log.port}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{log.details}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{log.responseTime}ms</span>
                          <span>{log.timestamp.toLocaleTimeString("pt-BR")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de API</CardTitle>
              <CardDescription>Configure parâmetros globais de conexão</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timeout (segundos)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Retry Attempts</Label>
                  <Input type="number" defaultValue="3" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-sync</p>
                    <p className="text-sm text-muted-foreground">Sincronização automática a cada 5 minutos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Retry on Failure</p>
                    <p className="text-sm text-muted-foreground">Tentar reconectar automaticamente</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Log Verbose</p>
                    <p className="text-sm text-muted-foreground">Registrar todas as requisições</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button onClick={() => toast.success("Configurações salvas!")}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
