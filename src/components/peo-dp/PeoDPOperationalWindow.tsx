/**
 * PEO-DP Operational Window Monitor
 * Real-time dashboard for DP operational limits, weather windows, and equipment status
 * Aligned with IMCA M 190 and Petrobras 2026 requirements
 */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Wind, Waves, Compass, Anchor, AlertTriangle, CheckCircle,
  ThermometerSun, Eye, Clock, Gauge, Shield, RefreshCw, Activity
} from "lucide-react";

interface EnvironmentalLimit {
  id: string;
  parameter: string;
  unit: string;
  currentValue: number;
  yellowLimit: number;
  redLimit: number;
  icon: React.ElementType;
}

interface DPEquipment {
  id: string;
  name: string;
  type: string;
  status: "online" | "standby" | "offline" | "fault";
  redundancy: string;
  lastCheck: string;
}

const ENV_LIMITS: EnvironmentalLimit[] = [
  { id: "wind", parameter: "Vento", unit: "kts", currentValue: 22, yellowLimit: 30, redLimit: 40, icon: Wind },
  { id: "wave", parameter: "Ondas (Hs)", unit: "m", currentValue: 1.8, yellowLimit: 2.5, redLimit: 3.5, icon: Waves },
  { id: "current", parameter: "Corrente", unit: "kts", currentValue: 1.2, yellowLimit: 1.5, redLimit: 2.0, icon: Activity },
  { id: "visibility", parameter: "Visibilidade", unit: "NM", currentValue: 5.0, yellowLimit: 2.0, redLimit: 0.5, icon: Eye },
];

const DP_EQUIPMENT: DPEquipment[] = [
  { id: "dps1", name: "DPS-1 (Kongsberg K-Pos)", type: "DP Controller", status: "online", redundancy: "Primary", lastCheck: "2025-02-10" },
  { id: "dps2", name: "DPS-2 (Kongsberg K-Pos)", type: "DP Controller", status: "online", redundancy: "Backup", lastCheck: "2025-02-10" },
  { id: "dps3", name: "DPS-3 (Independent)", type: "DP Controller", status: "standby", redundancy: "Emergency", lastCheck: "2025-02-09" },
  { id: "thr1", name: "Thruster #1 Bow", type: "Thruster", status: "online", redundancy: "N+1", lastCheck: "2025-02-10" },
  { id: "thr2", name: "Thruster #2 Bow", type: "Thruster", status: "online", redundancy: "N+1", lastCheck: "2025-02-10" },
  { id: "thr3", name: "Thruster #3 Stern", type: "Thruster", status: "online", redundancy: "N+1", lastCheck: "2025-02-10" },
  { id: "thr4", name: "Thruster #4 Stern", type: "Thruster", status: "fault", redundancy: "N+1", lastCheck: "2025-02-08" },
  { id: "gen1", name: "Generator #1", type: "Power", status: "online", redundancy: "N+1", lastCheck: "2025-02-10" },
  { id: "gen2", name: "Generator #2", type: "Power", status: "online", redundancy: "N+1", lastCheck: "2025-02-10" },
  { id: "gen3", name: "Generator #3", type: "Power", status: "standby", redundancy: "N+1", lastCheck: "2025-02-09" },
  { id: "dgps1", name: "DGPS Fugro", type: "Position Ref", status: "online", redundancy: "Primary", lastCheck: "2025-02-10" },
  { id: "dgps2", name: "DGPS Veripos", type: "Position Ref", status: "online", redundancy: "Secondary", lastCheck: "2025-02-10" },
  { id: "hpr", name: "HPR Kongsberg", type: "Position Ref", status: "online", redundancy: "Tertiary", lastCheck: "2025-02-10" },
  { id: "gyro1", name: "Gyro #1", type: "Heading Ref", status: "online", redundancy: "Primary", lastCheck: "2025-02-10" },
  { id: "gyro2", name: "Gyro #2", type: "Heading Ref", status: "online", redundancy: "Secondary", lastCheck: "2025-02-10" },
  { id: "ups1", name: "UPS System", type: "Power", status: "online", redundancy: "Critical", lastCheck: "2025-02-10" },
];

const statusConfig = {
  online: { label: "Online", color: "bg-green-500", textColor: "text-green-500" },
  standby: { label: "Standby", color: "bg-blue-500", textColor: "text-blue-500" },
  offline: { label: "Offline", color: "bg-muted", textColor: "text-muted-foreground" },
  fault: { label: "Falha", color: "bg-destructive", textColor: "text-destructive" },
};

export const PeoDPOperationalWindow: React.FC = () => {
  const [dpClass, setDpClass] = useState<"DP2" | "DP3">("DP2");
  const [asogStatus, setAsogStatus] = useState<"GREEN" | "YELLOW" | "RED">("GREEN");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Calculate ASOG status from environmental and equipment data
  useEffect(() => {
    const hasFault = DP_EQUIPMENT.some(e => e.status === "fault");
    const envYellow = ENV_LIMITS.some(e => {
      if (e.id === "visibility") return e.currentValue <= e.yellowLimit;
      return e.currentValue >= e.yellowLimit;
    });
    const envRed = ENV_LIMITS.some(e => {
      if (e.id === "visibility") return e.currentValue <= e.redLimit;
      return e.currentValue >= e.redLimit;
    });

    if (envRed) setAsogStatus("RED");
    else if (hasFault || envYellow) setAsogStatus("YELLOW");
    else setAsogStatus("GREEN");
  }, []);

  const onlineCount = DP_EQUIPMENT.filter(e => e.status === "online").length;
  const faultCount = DP_EQUIPMENT.filter(e => e.status === "fault").length;

  const equipmentByType = DP_EQUIPMENT.reduce((acc, eq) => {
    if (!acc[eq.type]) acc[eq.type] = [];
    acc[eq.type].push(eq);
    return acc;
  }, {} as Record<string, DPEquipment[]>);

  const getEnvStatus = (limit: EnvironmentalLimit) => {
    if (limit.id === "visibility") {
      if (limit.currentValue <= limit.redLimit) return "red";
      if (limit.currentValue <= limit.yellowLimit) return "yellow";
      return "green";
    }
    if (limit.currentValue >= limit.redLimit) return "red";
    if (limit.currentValue >= limit.yellowLimit) return "yellow";
    return "green";
  };

  const getEnvProgress = (limit: EnvironmentalLimit) => {
    if (limit.id === "visibility") {
      return Math.max(0, Math.min(100, (limit.currentValue / (limit.yellowLimit * 2)) * 100));
    }
    return Math.max(0, Math.min(100, (limit.currentValue / limit.redLimit) * 100));
  };

  return (
    <div className="space-y-6">
      {/* ASOG Status Header */}
      <Card className={`border-2 ${
        asogStatus === "GREEN" ? "border-green-500/50 bg-green-500/5" :
        asogStatus === "YELLOW" ? "border-yellow-500/50 bg-yellow-500/5" :
        "border-red-500/50 bg-red-500/5"
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${
                asogStatus === "GREEN" ? "bg-green-500/20" :
                asogStatus === "YELLOW" ? "bg-yellow-500/20" :
                "bg-red-500/20"
              }`}>
                <Shield className={`h-8 w-8 ${
                  asogStatus === "GREEN" ? "text-green-500" :
                  asogStatus === "YELLOW" ? "text-yellow-500" :
                  "text-red-500"
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  ASOG Status:
                  <span className={
                    asogStatus === "GREEN" ? "text-green-500" :
                    asogStatus === "YELLOW" ? "text-yellow-500" :
                    "text-red-500"
                  }>
                    {asogStatus}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {asogStatus === "GREEN" ? "Operação normal — todos os sistemas dentro dos limites" :
                   asogStatus === "YELLOW" ? "Atenção — degradação detectada, monitorar e preparar contingência" :
                   "ALERTA — limites excedidos, iniciar procedimento de redução de atividades"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Anchor className="h-3 w-3" /> Classe {dpClass}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" /> {lastUpdate.toLocaleTimeString("pt-BR")}
              </Badge>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => setLastUpdate(new Date())}>
                <RefreshCw className="h-3 w-3" /> Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-blue-500" />
            Condições Ambientais — Janela Operacional
          </CardTitle>
          <CardDescription>Monitoramento vs. limites ASOG definidos na análise de capability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ENV_LIMITS.map(limit => {
              const envStatus = getEnvStatus(limit);
              const Icon = limit.icon;
              return (
                <Card key={limit.id} className={`${envStatus === "red" ? "border-destructive/40 bg-destructive/5" : envStatus === "yellow" ? "border-yellow-500/40 bg-yellow-500/5" : ""}`}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${envStatus === "red" ? "text-destructive" : envStatus === "yellow" ? "text-yellow-500" : "text-green-500"}`} />
                        <span className="font-medium">{limit.parameter}</span>
                      </div>
                      <span className={`text-2xl font-bold ${envStatus === "red" ? "text-destructive" : envStatus === "yellow" ? "text-yellow-500" : "text-green-500"}`}>
                        {limit.currentValue} <span className="text-sm font-normal text-muted-foreground">{limit.unit}</span>
                      </span>
                    </div>
                    <Progress value={getEnvProgress(limit)} className="h-2 mb-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Atual: {limit.currentValue}{limit.unit}</span>
                      <span className="text-yellow-500">Yellow: {limit.yellowLimit}{limit.unit}</span>
                      <span className="text-destructive">Red: {limit.redLimit}{limit.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Status de Equipamentos DP
          </CardTitle>
          <CardDescription>
            {onlineCount} online • {faultCount} falhas • {DP_EQUIPMENT.length} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(equipmentByType).map(([type, eqs]) => (
              <div key={type}>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  {type}
                  <Badge variant="outline" className="text-[10px]">{eqs.length} unid.</Badge>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {eqs.map(eq => {
                    const cfg = statusConfig[eq.status];
                    return (
                      <div key={eq.id} className={`flex items-center gap-3 p-3 rounded-lg border ${eq.status === "fault" ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"}`}>
                        <div className={`w-3 h-3 rounded-full ${cfg.color} ${eq.status === "fault" ? "animate-pulse" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{eq.name}</p>
                          <p className="text-[10px] text-muted-foreground">{eq.redundancy}</p>
                        </div>
                        <Badge variant={eq.status === "fault" ? "destructive" : eq.status === "online" ? "default" : "secondary"} className="text-[10px] px-1.5">
                          {cfg.label}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Redundancy Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Resumo de Redundância — Classe {dpClass}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(equipmentByType).map(([type, eqs]) => {
              const online = eqs.filter(e => e.status === "online").length;
              const total = eqs.length;
              const hasFault = eqs.some(e => e.status === "fault");
              return (
                <div key={type} className={`p-4 rounded-lg border text-center ${hasFault ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{type}</p>
                  <p className={`text-2xl font-bold ${hasFault ? "text-destructive" : "text-green-500"}`}>
                    {online}/{total}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {hasFault ? "⚠️ Redundância degradada" : "✅ Redundância OK"}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
