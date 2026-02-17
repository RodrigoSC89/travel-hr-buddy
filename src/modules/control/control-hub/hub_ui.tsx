/**
 * Hub UI Components
 * React components for Control Hub dashboard
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  XCircle 
} from "lucide-react";
import { ModuleState, ModuleStatus, ConnectionQuality, SystemHealth } from "./types";

interface SystemStatusProps {
  health: SystemHealth;
}

export function SystemStatus({ health }: SystemStatusProps) {
  const getHealthInfo = () => {
    switch (health) {
    case "healthy":
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-success" />,
        text: "Sistema Operacional",
        bgColor: "bg-success/10",
        borderColor: "border-success/30",
      };
    case "degraded":
      return {
        icon: <AlertTriangle className="h-5 w-5 text-warning" />,
        text: "Sistema com Degradação",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
      };
    case "critical":
      return {
        icon: <XCircle className="h-5 w-5 text-destructive" />,
        text: "Sistema Crítico",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
      };
    }
  };

  const info = getHealthInfo();

  return (
    <Alert className={`${info.bgColor} ${info.borderColor} border-2`}>
      <div className="flex items-center gap-2">
        {info.icon}
        <AlertDescription className="font-semibold">
          {info.text}
        </AlertDescription>
      </div>
    </Alert>
  );
}

interface ConnectionStatusProps {
  quality: ConnectionQuality;
  lastCheck: Date | null;
}

export function ConnectionStatus({ quality, lastCheck }: ConnectionStatusProps) {
  const getQualityInfo = () => {
    switch (quality) {
    case "excellent":
      return {
        icon: <Wifi className="h-4 w-4 text-success" />,
        text: "Excelente",
        color: "text-success",
        bgColor: "bg-success/10",
      };
    case "good":
      return {
        icon: <Wifi className="h-4 w-4 text-primary" />,
        text: "Boa",
        color: "text-primary",
        bgColor: "bg-primary/10",
      };
    case "poor":
      return {
        icon: <Wifi className="h-4 w-4 text-warning" />,
        text: "Ruim",
        color: "text-warning",
        bgColor: "bg-warning/10",
      };
    case "offline":
      return {
        icon: <WifiOff className="h-4 w-4 text-muted-foreground" />,
        text: "Offline",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
      };
    }
  };

  const info = getQualityInfo();

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className={`${info.bgColor} ${info.color}`}>
        {info.icon}
        <span className="ml-2">{info.text}</span>
      </Badge>
      {lastCheck && (
        <span className="text-xs text-muted-foreground">
          Último check: {new Date(lastCheck).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

interface ModuleCardProps {
  moduleKey: string;
  module: ModuleState;
}

export function ModuleCard({ moduleKey, module }: ModuleCardProps) {
  const getStatusBadge = (status: ModuleStatus) => {
    switch (status) {
    case "operational":
      return <Badge className="bg-success">Operacional</Badge>;
    case "degraded":
      return <Badge className="bg-warning">Degradado</Badge>;
    case "offline":
      return <Badge className="bg-muted">Offline</Badge>;
    case "error":
      return <Badge className="bg-destructive">Erro</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{module.name}</CardTitle>
          {getStatusBadge(module.status)}
        </div>
        <CardDescription className="text-xs">
          Última verificação: {new Date(module.lastCheck).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Uptime:</span>
          <span className="font-medium">{formatUptime(module.uptime)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Performance:</span>
          <span className="font-medium">{module.performance}ms</span>
        </div>
        {module.errors > 0 && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{module.errors} erro(s)</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CacheStatsProps {
  size: number;
  capacity: number;
  pending: number;
  total: number;
}

export function CacheStats({ size, capacity, pending, total }: CacheStatsProps) {
  const usagePercent = (size / capacity) * 100;
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <CardTitle className="text-base">Cache Offline</CardTitle>
        </div>
        <CardDescription>
          Armazenamento local para operação offline
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Uso do cache:</span>
            <span className="font-medium">{usagePercent.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatBytes(size)}</span>
            <span>{formatBytes(capacity)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total registros</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SyncStatusProps {
  lastSync: Date | null;
  isSyncing: boolean;
  onSync: () => void;
}

export function SyncStatus({ lastSync, isSyncing, onSync }: SyncStatusProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 ${isSyncing ? "animate-spin" : ""}`} />
            <CardTitle className="text-base">Sincronização</CardTitle>
          </div>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <span className="text-muted-foreground">Última sincronização:</span>
          <p className="font-medium mt-1">
            {lastSync 
              ? new Date(lastSync).toLocaleString("pt-BR") 
              : "Nunca sincronizado"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
