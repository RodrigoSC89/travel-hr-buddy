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
      return "bg-green-500";
    case "degradation":
    case "degraded":
      return "bg-yellow-500";
    case "critical":
      return "bg-red-500";
    case "offline":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
    case "normal":
    case "operational":
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    case "degradation":
    case "degraded":
      return <AlertCircle className="h-6 w-6 text-yellow-500" />;
    case "critical":
      return <XCircle className="h-6 w-6 text-red-500" />;
    case "offline":
      return <XCircle className="h-6 w-6 text-gray-500" />;
    default:
      return <Activity className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
    case "normal":
    case "operational":
      return <Badge className="bg-green-500">🟢 Normal</Badge>;
    case "degradation":
    case "degraded":
      return <Badge className="bg-yellow-500">🟡 Degradação</Badge>;
    case "critical":
      return <Badge className="bg-red-500">🔴 Crítico</Badge>;
    case "offline":
      return <Badge className="bg-gray-500">⚫ Offline</Badge>;
    default:
      return <Badge className="bg-gray-400">❔ Desconhecido</Badge>;
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
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
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
