/**
 * Scaling Dashboard - Auto-Scaler & Load Balancer
 * Nauti One v4.0 - Simplified Version
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Server, Activity, Plus, Minus, Cpu, HardDrive } from "lucide-react";
import { toast } from "sonner";

interface ServerInfo {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'draining';
  cpu: number;
  memory: number;
  connections: number;
  latency: number;
}

const ScalingDashboard = () => {
  const [activeTab, setActiveTab] = useState("autoscaler");
  const [scalingEnabled, setScalingEnabled] = useState(true);
  const [currentInstances, setCurrentInstances] = useState(3);
  const [metrics, setMetrics] = useState({ cpu: 45, memory: 62, requests: 1250 });

  const minInstances = 2;
  const maxInstances = 10;

  const servers: ServerInfo[] = [
    { id: '1', name: 'web-server-1', status: 'healthy', cpu: 45, memory: 62, connections: 150, latency: 23 },
    { id: '2', name: 'web-server-2', status: 'healthy', cpu: 52, memory: 58, connections: 180, latency: 25 },
    { id: '3', name: 'web-server-3', status: 'healthy', cpu: 38, memory: 70, connections: 120, latency: 21 },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 2000) + 500
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleScaleUp = () => {
    if (currentInstances < maxInstances) {
      setCurrentInstances(prev => prev + 1);
      toast.success("Instância adicionada com sucesso");
    } else {
      toast.warning("Limite máximo de instâncias atingido");
    }
  };

  const handleScaleDown = () => {
    if (currentInstances > minInstances) {
      setCurrentInstances(prev => prev - 1);
      toast.success("Instância removida com sucesso");
    } else {
      toast.warning("Limite mínimo de instâncias atingido");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Server className="h-8 w-8 text-primary" />
            Scaling Dashboard
          </h1>
          <p className="text-muted-foreground">Auto-Scaler & Load Balancer</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Auto-Scaling</span>
          <Switch checked={scalingEnabled} onCheckedChange={setScalingEnabled} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${metrics.cpu > 80 ? 'text-red-500' : metrics.cpu > 60 ? 'text-yellow-500' : 'text-green-500'}`}>
              {metrics.cpu.toFixed(1)}%
            </div>
            <Progress value={metrics.cpu} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${metrics.memory > 80 ? 'text-red-500' : metrics.memory > 60 ? 'text-yellow-500' : 'text-green-500'}`}>
              {metrics.memory.toFixed(1)}%
            </div>
            <Progress value={metrics.memory} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Requests/min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.requests.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Server className="h-4 w-4" />
              Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentInstances}</div>
            <p className="text-xs text-muted-foreground">Min: {minInstances} | Max: {maxInstances}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="autoscaler">⚡ Auto-Scaler</TabsTrigger>
          <TabsTrigger value="servers">🖥️ Servidores</TabsTrigger>
        </TabsList>

        <TabsContent value="autoscaler" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controle Manual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-6">
                <Button size="lg" variant="outline" onClick={handleScaleDown} disabled={currentInstances <= minInstances}>
                  <Minus className="h-6 w-6" />
                </Button>
                <div className="text-center">
                  <div className="text-5xl font-bold">{currentInstances}</div>
                  <p className="text-sm text-muted-foreground">instâncias</p>
                </div>
                <Button size="lg" onClick={handleScaleUp} disabled={currentInstances >= maxInstances}>
                  <Plus className="h-6 w-6" />
                </Button>
              </div>
              <Progress value={(currentInstances / maxInstances) * 100} className="mt-4" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {servers.map((server) => (
              <Card key={server.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Server className="h-4 w-4" />
                      {server.name}
                    </span>
                    <Badge variant="default">{server.status}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{server.cpu}%</span>
                      </div>
                      <Progress value={server.cpu} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{server.memory}%</span>
                      </div>
                      <Progress value={server.memory} className="h-2" />
                    </div>
                    <div className="pt-2 border-t text-xs text-muted-foreground">
                      <p>Connections: {server.connections}</p>
                      <p>Latency: {server.latency}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScalingDashboard;
