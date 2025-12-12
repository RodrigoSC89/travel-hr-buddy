/**
import { useEffect, useState } from "react";;
 * System Status Widget
 * Shows real-time status of all system modules
 */

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Ship,
  Users,
  Wrench,
  FileText,
  Radio,
  Shield,
  Brain
} from "lucide-react";
import { moduleIntegration } from "@/services/module-integration";

interface ModuleStatus {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "online" | "degraded" | "offline";
  lastCheck: Date;
}

const MODULES = [
  { id: "fleet", name: "Gestão de Frota", icon: Ship },
  { id: "crew", name: "Tripulação", icon: Users },
  { id: "maintenance", name: "Manutenção", icon: Wrench },
  { id: "documents", name: "Documentos", icon: FileText },
  { id: "communication", name: "Comunicação", icon: Radio },
  { id: "compliance", name: "Compliance", icon: Shield },
  { id: "training", name: "Treinamento", icon: Brain }
];

export const SystemStatusWidget = memo(function({ compact = false }: { compact?: boolean }) {
  const [statuses, setStatuses] = useState<ModuleStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAllModules = async () => {
    setLoading(true);
    const results: ModuleStatus[] = [];

    for (const mod of MODULES) {
      const status = await moduleIntegration.checkModuleStatus(mod.id);
      results.push({
        id: mod.id,
        name: mod.name,
        icon: mod.icon,
        status: status.online ? "online" : "offline",
        lastCheck: new Date()
      });
    }

    setStatuses(results);
    setLoading(false);
  };

  useEffect(() => {
    checkAllModules();
    const interval = setInterval(checkAllModules, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
    case "online":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "offline":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
    case "online":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Online</Badge>;
    case "degraded":
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Degradado</Badge>;
    case "offline":
      return <Badge variant="destructive">Offline</Badge>;
    default:
      return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const onlineCount = statuses.filter(s => s.status === "online").length;
  const totalCount = statuses.length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <span className="text-sm">
          {onlineCount}/{totalCount} módulos online
        </span>
        {onlineCount === totalCount ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkAllModules}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{onlineCount}/{totalCount}</span>
            {onlineCount === totalCount ? (
              <Badge className="bg-green-500/10 text-green-600">Todos Online</Badge>
            ) : (
              <Badge className="bg-yellow-500/10 text-yellow-600">Parcial</Badge>
            )}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(onlineCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-2">
            {statuses.map((mod) => {
              const Icon = mod.icon;
              return (
                <div 
                  key={mod.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{mod.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(mod.status)}
                    {getStatusBadge(mod.status)}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default SystemStatusWidget;
