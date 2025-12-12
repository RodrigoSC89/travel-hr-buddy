/**
import { useEffect, useState, useCallback, useMemo } from "react";;
 * PAINEL DE CONECTIVIDADE MARÍTIMA
 * Status online/offline, sincronização e heartbeat
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wifi, WifiOff, RefreshCw, Cloud, CloudOff, 
  Signal, SignalHigh, SignalLow, SignalMedium,
  Satellite, Ship, CheckCircle, XCircle, Clock,
  Database, Upload, Download, AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";

interface VesselConnectivity {
  id: string;
  name: string;
  status: "online" | "offline" | "unstable";
  signalStrength: number;
  lastSync: Date;
  pendingSync: number;
  bandwidth: { up: number; down: number };
  provider: string;
  latency: number;
}

interface SyncEvent {
  id: string;
  type: "upload" | "download" | "sync";
  module: string;
  status: "success" | "pending" | "failed";
  timestamp: Date;
  size: number;
}

const mockVessels: VesselConnectivity[] = [
  {
    id: "1",
    name: "MV Atlântico Sul",
    status: "online",
    signalStrength: 85,
    lastSync: new Date(Date.now() - 120000),
    pendingSync: 3,
    bandwidth: { up: 2.5, down: 8.4 },
    provider: "Inmarsat Fleet Xpress",
    latency: 650
  },
  {
    id: "2",
    name: "PSV Oceano Azul",
    status: "unstable",
    signalStrength: 45,
    lastSync: new Date(Date.now() - 900000),
    pendingSync: 12,
    bandwidth: { up: 0.8, down: 2.1 },
    provider: "VSAT Ku-Band",
    latency: 1200
  },
  {
    id: "3",
    name: "AHTS Maré Alta",
    status: "offline",
    signalStrength: 0,
    lastSync: new Date(Date.now() - 3600000),
    pendingSync: 28,
    bandwidth: { up: 0, down: 0 },
    provider: "Inmarsat C",
    latency: 0
  },
  {
    id: "4",
    name: "OSV Brasil Norte",
    status: "online",
    signalStrength: 92,
    lastSync: new Date(Date.now() - 60000),
    pendingSync: 0,
    bandwidth: { up: 4.2, down: 12.8 },
    provider: "Starlink Maritime",
    latency: 45
  }
];

const mockSyncEvents: SyncEvent[] = [
  { id: "1", type: "sync", module: "Manutenção", status: "success", timestamp: new Date(Date.now() - 60000), size: 1.2 },
  { id: "2", type: "upload", module: "Relatórios", status: "success", timestamp: new Date(Date.now() - 120000), size: 4.5 },
  { id: "3", type: "download", module: "Certificados", status: "pending", timestamp: new Date(Date.now() - 180000), size: 2.8 },
  { id: "4", type: "sync", module: "Tripulação", status: "failed", timestamp: new Date(Date.now() - 240000), size: 0.8 },
  { id: "5", type: "download", module: "Atualizações", status: "success", timestamp: new Date(Date.now() - 300000), size: 15.2 },
];

export default function ConnectivityPanel() {
  const { toast } = useToast();
  const { checkConnectivity, isLoading } = useNautilusEnhancementAI();
  const [vessels, setVessels] = useState<VesselConnectivity[]>(mockVessels);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>(mockSyncEvents);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    toast({ title: "Atualizando...", description: "Verificando status de conectividade" });
    
    // Simular atualização
    await new Promise(r => setTimeout(r, 2000));
    
    setVessels(prev => prev.map(v => ({
      ...v,
      lastSync: new Date(),
      signalStrength: v.status === "online" ? Math.min(100, v.signalStrength + Math.floor(Math.random() * 10)) : v.signalStrength
    })));
    
    setIsRefreshing(false);
    toast({ title: "Atualizado", description: "Status de conectividade atualizado" });
  };

  const handleForceSync = async (vesselId: string) => {
    const vessel = vessels.find(v => v.id === vesselId);
    if (!vessel) return;
    
    toast({ title: "Sincronizando...", description: `Forçando sync com ${vessel.name}` });
    
    await new Promise(r => setTimeout(r, 1500));
    
    setVessels(prev => prev.map(v => 
      v.id === vesselId ? { ...v, pendingSync: 0, lastSync: new Date() } : v
    ));
    
    const newEvent: SyncEvent = {
      id: Date.now().toString(),
      type: "sync",
      module: "Manual",
      status: "success",
      timestamp: new Date(),
      size: Math.random() * 5
    };
    setSyncEvents(prev => [newEvent, ...prev]);
    
    toast({ title: "Sincronizado", description: `${vessel.name} sincronizado com sucesso` });
  };

  const handleAICheck = async (vesselId: string) => {
    const result = await checkConnectivity(vesselId);
    if (result?.response) {
      toast({ 
        title: "Análise IA", 
        description: typeof result.response === "string" ? result.response : "Análise de conectividade concluída"
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
    case "online": return "bg-green-500";
    case "unstable": return "bg-amber-500";
    case "offline": return "bg-red-500";
    default: return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online": return <Wifi className="h-4 w-4 text-green-500" />;
    case "unstable": return <SignalMedium className="h-4 w-4 text-amber-500" />;
    case "offline": return <WifiOff className="h-4 w-4 text-red-500" />;
    default: return <Signal className="h-4 w-4" />;
    }
  };

  const getSignalIcon = (strength: number) => {
    if (strength >= 70) return <SignalHigh className="h-5 w-5 text-green-500" />;
    if (strength >= 40) return <SignalMedium className="h-5 w-5 text-amber-500" />;
    if (strength > 0) return <SignalLow className="h-5 w-5 text-red-500" />;
    return <WifiOff className="h-5 w-5 text-muted-foreground" />;
  };

  const onlineCount = vessels.filter(v => v.status === "online").length;
  const offlineCount = vessels.filter(v => v.status === "offline").length;
  const totalPending = vessels.reduce((acc, v) => acc + v.pendingSync, 0);

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
              Monitoramento de sincronização e status de rede
            </p>
          </div>
        </div>
        <Button onClick={handleRefreshAll} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Atualizar Tudo
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
              <Cloud className="h-8 w-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card className={offlineCount > 0 ? "border-red-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className={`text-2xl font-bold ${offlineCount > 0 ? "text-red-600" : ""}`}>{offlineCount}</p>
              </div>
              <CloudOff className={`h-8 w-8 ${offlineCount > 0 ? "text-red-500" : "text-muted-foreground"} opacity-80`} />
            </div>
          </CardContent>
        </Card>
        <Card className={totalPending > 10 ? "border-amber-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className={`text-2xl font-bold ${totalPending > 10 ? "text-amber-600" : ""}`}>{totalPending}</p>
              </div>
              <Database className="h-8 w-8 text-amber-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Sync</p>
                <p className="text-2xl font-bold">2m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vessel Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ship className="h-5 w-5" />
              Status por Embarcação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {vessels.map(vessel => (
              <div 
                key={vessel.id} 
                className={`p-4 rounded-lg border ${
                  vessel.status === "offline" ? "border-red-500/50 bg-red-500/5" :
                    vessel.status === "unstable" ? "border-amber-500/50 bg-amber-500/5" :
                      "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(vessel.status)} animate-pulse`} />
                    <div>
                      <p className="font-medium">{vessel.name}</p>
                      <p className="text-xs text-muted-foreground">{vessel.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSignalIcon(vessel.signalStrength)}
                    <span className="text-sm font-medium">{vessel.signalStrength}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs mb-3">
                  <div className="p-2 bg-muted/30 rounded">
                    <Upload className="h-3 w-3 mx-auto mb-1" />
                    <span>{vessel.bandwidth.up} Mbps</span>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <Download className="h-3 w-3 mx-auto mb-1" />
                    <span>{vessel.bandwidth.down} Mbps</span>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <Clock className="h-3 w-3 mx-auto mb-1" />
                    <span>{vessel.latency}ms</span>
                  </div>
                  <div className={`p-2 rounded ${vessel.pendingSync > 0 ? "bg-amber-500/20" : "bg-muted/30"}`}>
                    <Database className="h-3 w-3 mx-auto mb-1" />
                    <span>{vessel.pendingSync} pend.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Última sync: {vessel.lastSync.toLocaleTimeString("pt-BR")}</span>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handlehandleAICheck}
                      disabled={isLoading}
                    >
                      Analisar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handlehandleForceSync}
                      disabled={vessel.status === "offline"}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sync Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Histórico de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {syncEvents.map(event => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      event.status === "success" ? "bg-green-500/10" :
                        event.status === "pending" ? "bg-amber-500/10" : "bg-red-500/10"
                    }`}>
                      {event.type === "upload" ? <Upload className="h-4 w-4" /> :
                        event.type === "download" ? <Download className="h-4 w-4" /> :
                          <RefreshCw className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{event.module}</span>
                        <Badge variant="outline" className={`text-xs ${
                          event.status === "success" ? "text-green-600" :
                            event.status === "pending" ? "text-amber-600" : "text-red-600"
                        }`}>
                          {event.status === "success" ? <CheckCircle className="h-3 w-3 mr-1" /> :
                            event.status === "pending" ? <Clock className="h-3 w-3 mr-1" /> :
                              <XCircle className="h-3 w-3 mr-1" />}
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {event.timestamp.toLocaleTimeString("pt-BR")} • {event.size.toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
