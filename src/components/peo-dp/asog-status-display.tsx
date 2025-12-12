/**
 * ASOG Status Display Component
 * Activity Specific Operating Guidelines - Status com 4 níveis de cores
 * 
 * Verde (GREEN) - Operações Normais: Todos os sistemas operando dentro dos parâmetros
 * Azul (BLUE) - Advisory: Condições requerem atenção, monitoramento aumentado
 * Amarelo (YELLOW) - Degradado: Operação com restrições, contingência ativa
 * Vermelho (RED) - Emergência: Operação suspensa, procedimentos de emergência
 */

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Info,
  Wind,
  Waves,
  Gauge,
  Anchor,
  Ship,
  Activity,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ASOGStatus = "green" | "blue" | "yellow" | "red";

export interface ASOGEnvironmentalLimits {
  windSpeed: { current: number; limit: number; unit: string };
  waveHeight: { current: number; limit: number; unit: string };
  current: { current: number; limit: number; unit: string };
  visibility: { current: number; limit: number; unit: string };
}

export interface ASOGSystemStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "failed";
  redundancy: number;
}

export interface ASOGStatusData {
  status: ASOGStatus;
  statusLabel: string;
  statusDescription: string;
  environmentalLimits: ASOGEnvironmentalLimits;
  systems: ASOGSystemStatus[];
  lastUpdate: Date;
  operationType?: string;
  dpClass?: string;
  vesselName?: string;
}

interface ASOGStatusDisplayProps {
  data?: ASOGStatusData;
  onStatusChange?: (status: ASOGStatus) => void;
  onAcknowledgeAlert?: () => void;
  compact?: boolean;
}

const DEFAULT_DATA: ASOGStatusData = {
  status: "green",
  statusLabel: "GREEN",
  statusDescription: "Operações Normais - Todos os sistemas operando dentro dos parâmetros",
  environmentalLimits: {
    windSpeed: { current: 12, limit: 25, unit: "kt" },
    waveHeight: { current: 1.8, limit: 3.5, unit: "m" },
    current: { current: 0.8, limit: 2.0, unit: "kt" },
    visibility: { current: 8, limit: 2, unit: "nm" }
  },
  systems: [
    { id: "dp-1", name: "DP System 1", status: "operational", redundancy: 100 },
    { id: "dp-2", name: "DP System 2", status: "operational", redundancy: 100 },
    { id: "thrusters", name: "Thrusters", status: "operational", redundancy: 95 },
    { id: "generators", name: "Power Generation", status: "operational", redundancy: 100 },
    { id: "references", name: "Position References", status: "operational", redundancy: 85 },
    { id: "ups", name: "UPS Systems", status: "operational", redundancy: 100 }
  ],
  lastUpdate: new Date(),
  operationType: "Cargo Operations",
  dpClass: "DP2",
  vesselName: "PSV Atlantic Explorer"
};

const STATUS_CONFIG: Record<ASOGStatus, {
  label: string;
  description: string;
  icon: React.ElementType;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeColor: string;
}> = {
  green: {
    label: "GREEN",
    description: "Operações Normais",
    icon: CheckCircle,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    badgeColor: "bg-green-500"
  },
  blue: {
    label: "BLUE",
    description: "Advisory",
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    badgeColor: "bg-blue-500"
  },
  yellow: {
    label: "YELLOW",
    description: "Degradado",
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    textColor: "text-yellow-700 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    badgeColor: "bg-yellow-500"
  },
  red: {
    label: "RED",
    description: "Emergência",
    icon: XCircle,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    badgeColor: "bg-red-500"
  }
};

export const ASOGStatusDisplay = memo(function({ 
  data: propData, 
  onStatusChange, 
  onAcknowledgeAlert, 
  compact = false 
}: ASOGStatusDisplayProps) {
  const data = propData || DEFAULT_DATA;
  const config = STATUS_CONFIG[data.status];
  const StatusIcon = config.icon;

  const getParameterStatus = (current: number, limit: number): ASOGStatus => {
    const ratio = current / limit;
    if (ratio >= 1) return "red";
    if (ratio >= 0.9) return "yellow";
    if (ratio >= 0.75) return "blue";
    return "green";
  });

  const getParameterColor = (status: ASOGStatus) => {
    return STATUS_CONFIG[status].textColor;
  });

  if (compact) {
    return (
      <Card className={cn("border-2", config.borderColor, config.bgColor)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <StatusIcon className={cn("h-6 w-6", config.textColor)} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">ASOG Status: {config.description}</span>
                  <Badge className={cn(config.badgeColor, "text-white font-bold px-3")}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.vesselName && `${data.vesselName} • `}
                  Todos os sistemas DP operando dentro dos parâmetros
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant={data.status === "green" ? "default" : "outline"}
                className={data.status === "green" ? "bg-green-500 hover:bg-green-600 text-white" : ""}
                onClick={() => onStatusChange?.("green"}
              >
                <CheckCircle className="h-4 w-4 mr-1" /> Normal
              </Button>
              <Button 
                size="sm" 
                variant={data.status === "blue" ? "default" : "outline"}
                className={data.status === "blue" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}
                onClick={() => onStatusChange?.("blue"}
              >
                <Info className="h-4 w-4 mr-1" /> Advisory
              </Button>
              <Button 
                size="sm" 
                variant={data.status === "yellow" ? "default" : "outline"}
                className={data.status === "yellow" ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                onClick={() => onStatusChange?.("yellow"}
              >
                <AlertTriangle className="h-4 w-4 mr-1" /> Degradado
              </Button>
              <Button 
                size="sm" 
                variant={data.status === "red" ? "default" : "outline"}
                className={data.status === "red" ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                onClick={() => onStatusChange?.("red"}
              >
                <XCircle className="h-4 w-4 mr-1" /> Emergência
              </Button>
              <Button size="sm" variant="outline" onClick={onAcknowledgeAlert}>
                <Bell className="h-4 w-4 mr-1" /> Alerta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-2", config.borderColor)}>
      <CardHeader className={cn(config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-full", config.bgColor)}>
              <StatusIcon className={cn("h-8 w-8", config.textColor)} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-3">
                <span>ASOG Status: {config.description}</span>
                <Badge className={cn(config.badgeColor, "text-white font-bold px-4 py-1 text-lg")}>
                  {config.label}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {data.vesselName && <span className="font-medium">{data.vesselName}</span>}
                {data.dpClass && <span className="ml-2">• Classe {data.dpClass}</span>}
                {data.operationType && <span className="ml-2">• {data.operationType}</span>}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Última Atualização</p>
            <p className="text-sm font-medium">
              {data.lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Environmental Limits */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" /> Limites Ambientais
            </h4>
            
            <TooltipProvider>
              <div className="space-y-3">
                {/* Wind */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Wind className="h-4 w-4" /> Vento
                    </span>
                    <span className={getParameterColor(getParameterStatus(data.environmentalLimits.windSpeed.current, data.environmentalLimits.windSpeed.limit))}>
                      {data.environmentalLimits.windSpeed.current} / {data.environmentalLimits.windSpeed.limit} {data.environmentalLimits.windSpeed.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(data.environmentalLimits.windSpeed.current / data.environmentalLimits.windSpeed.limit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Wave Height */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Waves className="h-4 w-4" /> Altura de Onda (Hs)
                    </span>
                    <span className={getParameterColor(getParameterStatus(data.environmentalLimits.waveHeight.current, data.environmentalLimits.waveHeight.limit))}>
                      {data.environmentalLimits.waveHeight.current} / {data.environmentalLimits.waveHeight.limit} {data.environmentalLimits.waveHeight.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(data.environmentalLimits.waveHeight.current / data.environmentalLimits.waveHeight.limit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Current */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" /> Corrente
                    </span>
                    <span className={getParameterColor(getParameterStatus(data.environmentalLimits.current.current, data.environmentalLimits.current.limit))}>
                      {data.environmentalLimits.current.current} / {data.environmentalLimits.current.limit} {data.environmentalLimits.current.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(data.environmentalLimits.current.current / data.environmentalLimits.current.limit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Visibility */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Ship className="h-4 w-4" /> Visibilidade
                    </span>
                    <span className={getParameterColor(getParameterStatus(data.environmentalLimits.visibility.limit - data.environmentalLimits.visibility.current, data.environmentalLimits.visibility.limit))}>
                      {data.environmentalLimits.visibility.current} {data.environmentalLimits.visibility.unit}
                    </span>
                  </div>
                  <Progress 
                    value={(data.environmentalLimits.visibility.current / 10) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Systems Status */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Anchor className="h-4 w-4" /> Status dos Sistemas
            </h4>
            <div className="space-y-2">
              {data.systems.map((system) => (
                <div key={system.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {system.status === "operational" && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {system.status === "degraded" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {system.status === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                    <span className="text-sm">{system.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Redundância</span>
                    <Badge variant={system.redundancy >= 2 ? "default" : "destructive"}>
                      {system.redundancy}x
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status Change Actions */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={data.status === "green" ? "default" : "outline"}
              className={data.status === "green" ? "bg-green-500 hover:bg-green-600" : ""}
              onClick={() => onStatusChange?.("green"}
            >
              <CheckCircle className="h-4 w-4 mr-1" /> Normal
            </Button>
            <Button 
              size="sm" 
              variant={data.status === "blue" ? "default" : "outline"}
              className={data.status === "blue" ? "bg-blue-500 hover:bg-blue-600" : ""}
              onClick={() => onStatusChange?.("blue"}
            >
              <Info className="h-4 w-4 mr-1" /> Advisory
            </Button>
            <Button 
              size="sm" 
              variant={data.status === "yellow" ? "default" : "outline"}
              className={data.status === "yellow" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              onClick={() => onStatusChange?.("yellow"}
            >
              <AlertTriangle className="h-4 w-4 mr-1" /> Degradado
            </Button>
            <Button 
              size="sm" 
              variant={data.status === "red" ? "default" : "outline"}
              className={data.status === "red" ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => onStatusChange?.("red"}
            >
              <XCircle className="h-4 w-4 mr-1" /> Emergência
            </Button>
          </div>
          <Button variant="outline" onClick={onAcknowledgeAlert}>
            <Bell className="h-4 w-4 mr-2" /> Acusar Recebimento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to calculate ASOG status based on environmental conditions
export function useASOGStatus(environmentalLimits: ASOGEnvironmentalLimits): ASOGStatus {
  const checkLimit = (current: number, limit: number): number => current / limit;
  
  const ratios = [
    checkLimit(environmentalLimits.windSpeed.current, environmentalLimits.windSpeed.limit),
    checkLimit(environmentalLimits.waveHeight.current, environmentalLimits.waveHeight.limit),
    checkLimit(environmentalLimits.current.current, environmentalLimits.current.limit)
  ];
  
  const maxRatio = Math.max(...ratios);
  
  if (maxRatio >= 1) return "red";
  if (maxRatio >= 0.9) return "yellow";
  if (maxRatio >= 0.75) return "blue";
  return "green";
}

export default ASOGStatusDisplay;
