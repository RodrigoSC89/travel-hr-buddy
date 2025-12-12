import { useEffect, useState } from "react";;
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, WifiOff, Satellite, Radio, Signal, SignalHigh, SignalLow, SignalZero,
  RefreshCw, Download, Upload, Clock, AlertTriangle, CheckCircle2,
  Globe, Ship, Database, Cloud, Zap, Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VesselConnection {
  id: string;
  vessel: string;
  status: "online" | "offline" | "degraded";
  connectionType: "satellite" | "4g" | "wifi" | "offline";
  signalStrength: number;
  latency: number;
  bandwidth: { up: number; down: number };
  lastSync: string;
  pendingSync: number;
  offlineData: number;
}

const sampleConnections: VesselConnection[] = [
  {
    id: "1",
    vessel: "MV Atlântico Sul",
    status: "online",
    connectionType: "satellite",
    signalStrength: 85,
    latency: 650,
    bandwidth: { up: 512, down: 2048 },
    lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    pendingSync: 0,
    offlineData: 0
  },
  {
    id: "2",
    vessel: "PSV Oceano Azul",
    status: "degraded",
    connectionType: "satellite",
    signalStrength: 45,
    latency: 1200,
    bandwidth: { up: 256, down: 1024 },
    lastSync: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    pendingSync: 12,
    offlineData: 2.5
  },
  {
    id: "3",
    vessel: "AHTS Maré Alta",
    status: "online",
    connectionType: "4g",
    signalStrength: 92,
    latency: 85,
    bandwidth: { up: 5120, down: 20480 },
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    pendingSync: 0,
    offlineData: 0
  },
  {
    id: "4",
    vessel: "Supply Boat Norte",
    status: "offline",
    connectionType: "offline",
    signalStrength: 0,
    latency: 0,
    bandwidth: { up: 0, down: 0 },
    lastSync: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    pendingSync: 156,
    offlineData: 45.8
  }
];

export default function MaritimeConnectivity() {
  const { toast } = useToast();
  const [connections, setConnections] = useState<VesselConnection[]>(sampleConnections);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({ title: "Atualizando...", description: "Verificando status de conexões" });
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulate some status changes
    setConnections(prev => prev.map(c => ({
      ...c,
      lastSync: c.status !== "offline" ? new Date().toISOString() : c.lastSync,
      signalStrength: c.status !== "offline" ? Math.min(100, c.signalStrength + Math.floor(Math.random() * 10) - 5) : 0
    })));
    
    setIsRefreshing(false);
    toast({ title: "Atualizado", description: "Status de conexões atualizado" });
  };

  const handleForceSync = (vesselId: string) => {
    toast({ title: "Sincronizando...", description: "Forçando sincronização de dados" });
    
    setTimeout(() => {
      setConnections(prev => prev.map(c => 
        c.id === vesselId 
          ? { ...c, pendingSync: 0, offlineData: 0, lastSync: new Date().toISOString() }
          : c
      ));
      toast({ title: "Sincronizado!", description: "Dados sincronizados com sucesso" });
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: "bg-green-500/10 text-green-600",
      degraded: "bg-amber-500/10 text-amber-600",
      offline: "bg-red-500/10 text-red-600"
    };
    return colors[status] || colors.offline;
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
    case "satellite": return <Satellite className="h-5 w-5" />;
    case "4g": return <Signal className="h-5 w-5" />;
    case "wifi": return <Wifi className="h-5 w-5" />;
    default: return <WifiOff className="h-5 w-5" />;
    }
  };

  const getSignalIcon = (strength: number) => {
    if (strength >= 70) return <SignalHigh className="h-4 w-4 text-green-500" />;
    if (strength >= 40) return <SignalLow className="h-4 w-4 text-amber-500" />;
    if (strength > 0) return <SignalZero className="h-4 w-4 text-red-500" />;
    return <WifiOff className="h-4 w-4 text-muted-foreground" />;
  };

  const formatBytes = (kbps: number) => {
    if (kbps >= 1024) return `${(kbps / 1024).toFixed(1)} Mbps`;
    return `${kbps} Kbps`;
  };

  const onlineCount = connections.filter(c => c.status === "online").length;
  const degradedCount = connections.filter(c => c.status === "degraded").length;
  const offlineCount = connections.filter(c => c.status === "offline").length;
  const totalPending = connections.reduce((acc, c) => acc + c.pendingSync, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <Satellite className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Painel de Conectividade</h1>
            <p className="text-muted-foreground">
              Status de conexão satélite/terra, sincronização e modo offline
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Degradado</p>
                <p className="text-2xl font-bold text-amber-600">{degradedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{offlineCount}</p>
              </div>
              <WifiOff className="h-8 w-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{totalPending}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <p className="text-2xl font-bold">99.2%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {connections.map(conn => (
          <Card key={conn.id} className={`overflow-hidden ${conn.status === "offline" ? "opacity-80" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(conn.status)}`}>
                    {getConnectionIcon(conn.connectionType)}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      {conn.vessel}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      {conn.connectionType === "satellite" && "Satélite"}
                      {conn.connectionType === "4g" && "4G/LTE"}
                      {conn.connectionType === "wifi" && "Wi-Fi"}
                      {conn.connectionType === "offline" && "Sem conexão"}
                      {getSignalIcon(conn.signalStrength)}
                      {conn.signalStrength > 0 && `${conn.signalStrength}%`}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(conn.status)}>
                  {conn.status === "online" && "Online"}
                  {conn.status === "degraded" && "Degradado"}
                  {conn.status === "offline" && "Offline"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Signal Strength */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Força do Sinal</span>
                  <span>{conn.signalStrength}%</span>
                </div>
                <Progress 
                  value={conn.signalStrength} 
                  className={`h-2 ${conn.signalStrength >= 70 ? "[&>div]:bg-green-500" : conn.signalStrength >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"}`}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-2 bg-muted/30 rounded">
                  <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Latência</p>
                  <p className="font-medium">{conn.latency > 0 ? `${conn.latency}ms` : "-"}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <Upload className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Upload</p>
                  <p className="font-medium">{conn.bandwidth.up > 0 ? formatBytes(conn.bandwidth.up) : "-"}</p>
                </div>
                <div className="p-2 bg-muted/30 rounded">
                  <Download className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <p className="text-xs text-muted-foreground">Download</p>
                  <p className="font-medium">{conn.bandwidth.down > 0 ? formatBytes(conn.bandwidth.down) : "-"}</p>
                </div>
              </div>

              <Separator />

              {/* Sync Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Última Sincronização:</span>
                  <span className="font-medium">
                    {new Date(conn.lastSync).toLocaleString("pt-BR", { 
                      hour: "2-digit", 
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit"
                    })}
                  </span>
                </div>
                {conn.pendingSync > 0 && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
                    {conn.pendingSync} pendentes
                  </Badge>
                )}
              </div>

              {/* Offline Data Warning */}
              {conn.offlineData > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    {conn.offlineData} MB de dados offline aguardando sincronização
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleForceSync(conn.id)}
                  disabled={conn.status === "offline"}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Forçar Sincronização
                </Button>
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Diagnóstico
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connectivity Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Mapa de Cobertura
          </CardTitle>
          <CardDescription>Visualização da cobertura de satélite e áreas de conectividade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-950 to-blue-900 rounded-lg flex items-center justify-center">
            <div className="text-center text-blue-300">
              <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Mapa de cobertura em tempo real</p>
              <p className="text-xs opacity-60">Integração com serviço de satélite</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
