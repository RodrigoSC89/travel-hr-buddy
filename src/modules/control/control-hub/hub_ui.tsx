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

export const SystemStatus = memo(function({ health }: SystemStatusProps) {
  const getHealthInfo = () => {
    switch (health) {
    case "healthy":
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        text: "Sistema Operacional",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      };
    case "degraded":
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        text: "Sistema com Degradação",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
      };
    case "critical":
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        text: "Sistema Crítico",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
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

export const ConnectionStatus = memo(function({ quality, lastCheck }: ConnectionStatusProps) {
  const getQualityInfo = () => {
    switch (quality) {
    case "excellent":
      return {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        text: "Excelente",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    case "good":
      return {
        icon: <Wifi className="h-4 w-4 text-blue-500" />,
        text: "Boa",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      };
    case "poor":
      return {
        icon: <Wifi className="h-4 w-4 text-yellow-500" />,
        text: "Ruim",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    case "offline":
      return {
        icon: <WifiOff className="h-4 w-4 text-gray-500" />,
        text: "Offline",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
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

export const ModuleCard = memo(function({ moduleKey, module }: ModuleCardProps) {
  const getStatusBadge = (status: ModuleStatus) => {
    switch (status) {
    case "operational":
      return <Badge className="bg-green-500">Operacional</Badge>;
    case "degraded":
      return <Badge className="bg-yellow-500">Degradado</Badge>;
    case "offline":
      return <Badge className="bg-gray-500">Offline</Badge>;
    case "error":
      return <Badge className="bg-red-500">Erro</Badge>;
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  });

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
          <div className="flex items-center gap-2 text-sm text-red-600">
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

export const CacheStats = memo(function({ size, capacity, pending, total }: CacheStatsProps) {
  const usagePercent = (size / capacity) * 100;
  
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  });

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
            <p className="text-2xl font-bold text-orange-600">{pending}</p>
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

export const SyncStatus = memo(function({ lastSync, isSyncing, onSync }: SyncStatusProps) {
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
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
