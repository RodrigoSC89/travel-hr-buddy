import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface DPStatusCardProps {
  status: string;
}

/**
 * Display DP system status with visual indicators
 */
export function DPStatusCard({ status }: DPStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
    case "normal":
    case "operational":
      return "bg-success";
    case "degradation":
    case "degraded":
      return "bg-warning";
    case "critical":
      return "bg-destructive";
    case "offline":
      return "bg-muted-foreground";
    default:
      return "bg-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
    case "normal":
    case "operational":
      return <CheckCircle className="h-6 w-6 text-success" />;
    case "degradation":
    case "degraded":
      return <AlertCircle className="h-6 w-6 text-warning" />;
    case "critical":
      return <XCircle className="h-6 w-6 text-destructive" />;
    case "offline":
      return <XCircle className="h-6 w-6 text-muted-foreground" />;
    default:
      return <Activity className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
    case "normal":
    case "operational":
      return <Badge className="bg-success">🟢 Normal</Badge>;
    case "degradation":
    case "degraded":
      return <Badge className="bg-warning">🟡 Degradação</Badge>;
    case "critical":
      return <Badge className="bg-destructive">🔴 Crítico</Badge>;
    case "offline":
      return <Badge className="bg-muted-foreground">⚫ Offline</Badge>;
    default:
      return <Badge className="bg-muted-foreground">❔ Desconhecido</Badge>;
    }
  };

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon(status)}
          Status do Sistema DP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status Geral:</span>
            {getStatusBadge(status)}
          </div>
          
          <div className="relative pt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${getStatusColor(status)} transition-all duration-500`}
                style={{ 
                  width: status.toLowerCase() === "normal" ? "100%" : 
                    status.toLowerCase() === "degradation" ? "60%" : 
                      status.toLowerCase() === "critical" ? "30%" : "0%" 
                }}
              />
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            Última atualização: {new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
