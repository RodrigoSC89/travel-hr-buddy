/**
 * Edge Computing Dashboard
 * Processamento distribuído na borda da rede
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Network,
  Server,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  Gauge,
  RefreshCw,
  Settings,
  MapPin,
  Signal,
  Wifi
} from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface EdgeNode {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "maintenance";
  latency: number;
  cpu: number;
  memory: number;
  tasks: number;
  uptime: string;
}

const EdgeComputingPage: React.FC = () => {
  const { toast } = useToast();
  const [realtimeData, setRealtimeData] = useState<Array<{time: string; latency: number; throughput: number}>>([]);

  useEffect(() => {
    const generateData = () => ({
      time: new Date().toLocaleTimeString(),
      latency: Math.floor(2 + Math.random() * 6),
      throughput: Math.floor(800 + Math.random() * 400)
    });

    const initial = Array.from({ length: 20 }, () => generateData());
    setRealtimeData(initial);

    const interval = setInterval(() => {
      setRealtimeData(prev => [...prev.slice(-19), generateData()]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const nodes: EdgeNode[] = [
    { id: "1", name: "Edge-BR-Santos", location: "Porto de Santos", status: "online", latency: 3, cpu: 78, memory: 65, tasks: 147, uptime: "99.9%" },
    { id: "2", name: "Edge-BR-Rio", location: "Porto do Rio", status: "online", latency: 4, cpu: 82, memory: 71, tasks: 134, uptime: "99.7%" },
    { id: "3", name: "Edge-BR-Paranagua", location: "Porto de Paranaguá", status: "online", latency: 5, cpu: 45, memory: 42, tasks: 89, uptime: "99.8%" },
    { id: "4", name: "Edge-BR-Salvador", location: "Porto de Salvador", status: "maintenance", latency: 0, cpu: 0, memory: 0, tasks: 0, uptime: "97.2%" },
    { id: "5", name: "Edge-BR-Manaus", location: "Porto de Manaus", status: "online", latency: 8, cpu: 34, memory: 38, tasks: 56, uptime: "99.5%" },
    { id: "6", name: "Edge-BR-Suape", location: "Porto de Suape", status: "online", latency: 4, cpu: 67, memory: 58, tasks: 112, uptime: "99.6%" },
    { id: "7", name: "Edge-Vessel-01", location: "Navio Atlântico Sul", status: "online", latency: 12, cpu: 89, memory: 76, tasks: 203, uptime: "98.9%" },
    { id: "8", name: "Edge-Vessel-02", location: "Navio Pacífico Norte", status: "offline", latency: 0, cpu: 0, memory: 0, tasks: 0, uptime: "94.1%" },
  ];

  const getStatusBadge = (status: EdgeNode["status"]) => {
    switch (status) {
    case "online":
      return <Badge className="bg-green-500/20 text-green-400"><Signal className="h-3 w-3 mr-1" />Online</Badge>;
    case "offline":
      return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1" />Offline</Badge>;
    case "maintenance":
      return <Badge className="bg-yellow-500/20 text-yellow-400"><Settings className="h-3 w-3 mr-1" />Manutenção</Badge>;
    }
  };

  const handleRestartNode = (nodeId: string) => {
    toast({
      title: "Reiniciando Nó",
      description: "O nó está sendo reiniciado. Isso pode levar alguns minutos.",
    });
  };

  const onlineNodes = nodes.filter(n => n.status === "online").length;
  const avgLatency = nodes.filter(n => n.status === "online").reduce((a, b) => a + b.latency, 0) / onlineNodes;

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Network}
        title="Edge Computing"
        description="Processamento distribuído na borda da rede com baixa latência"
        gradient="purple"
        badges={[
          { icon: Server, label: `${onlineNodes} Nós Ativos` },
          { icon: Zap, label: `${avgLatency.toFixed(1)}ms Latência` },
          { icon: Activity, label: "Tempo Real" }
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nós Ativos</p>
                <p className="text-2xl font-bold">{onlineNodes}/{nodes.length}</p>
              </div>
              <Server className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Latência Média</p>
                <p className="text-2xl font-bold">{avgLatency.toFixed(1)}ms</p>
              </div>
              <Gauge className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks em Execução</p>
                <p className="text-2xl font-bold">{nodes.reduce((a, b) => a + b.tasks, 0)}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime Global</p>
                <p className="text-2xl font-bold">98.6%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="nodes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nodes">Nós</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="topology">Topologia</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {nodes.map((node) => (
              <Card key={node.id} className={`hover:shadow-lg transition-shadow ${node.status !== "online" ? "opacity-60" : ""}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" />
                      {node.name}
                    </CardTitle>
                    {getStatusBadge(node.status)}
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {node.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {node.status === "online" && (
                    <>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Latência</p>
                          <p className="text-lg font-bold text-green-500">{node.latency}ms</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">CPU</p>
                          <p className="text-lg font-bold text-blue-500">{node.cpu}%</p>
                        </div>
                        <div className="p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">Memória</p>
                          <p className="text-lg font-bold text-purple-500">{node.memory}%</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>CPU Usage</span>
                          <span>{node.cpu}%</span>
                        </div>
                        <Progress value={node.cpu} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{node.tasks} tasks ativas</span>
                        <span>Uptime: {node.uptime}</span>
                      </div>
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRestartNode(node.id)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reiniciar
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Latência em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Line type="monotone" dataKey="latency" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Latência (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                    <Area type="monotone" dataKey="throughput" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Throughput (ops/s)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="topology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topologia da Rede Edge</CardTitle>
              <CardDescription>Visão geral da distribuição geográfica dos nós</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {nodes.map((node) => (
                  <div key={node.id} className={`p-4 rounded-lg border ${node.status === "online" ? "bg-green-500/5 border-green-500/20" : node.status === "maintenance" ? "bg-yellow-500/5 border-yellow-500/20" : "bg-red-500/5 border-red-500/20"}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wifi className={`h-4 w-4 ${node.status === "online" ? "text-green-500" : node.status === "maintenance" ? "text-yellow-500" : "text-red-500"}`} />
                      <span className="font-medium text-sm">{node.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{node.location}</p>
                    {node.status === "online" && (
                      <p className="text-xs mt-1">{node.latency}ms • {node.tasks} tasks</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default EdgeComputingPage;
