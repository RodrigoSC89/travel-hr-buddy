/**
 * PEO-DP Operational Window Monitor
 * PRODUCTION: Wired to Supabase peodp_operational_window + peodp_equipment_status
 */
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Wind, Waves, Compass, Anchor, AlertTriangle, CheckCircle,
  ThermometerSun, Eye, Clock, Gauge, Shield, RefreshCw, Activity, Plus
} from "lucide-react";
import { toast } from "sonner";

interface EnvironmentalRecord {
  id: string;
  parameter: string;
  unit: string;
  current_value: number;
  yellow_limit: number;
  red_limit: number;
  asog_status: string;
  dp_class: string;
  recorded_at: string;
}

interface DPEquipment {
  id: string;
  name: string;
  equipment_type: string;
  status: "online" | "standby" | "offline" | "fault";
  redundancy: string;
  last_check: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  'Vento': Wind, 'Ondas (Hs)': Waves, 'Corrente': Activity, 'Visibilidade': Eye,
};

const statusConfig: Record<string, { label: string; color: string }> = {
  online: { label: "Online", color: "bg-success" },
  standby: { label: "Standby", color: "bg-info" },
  offline: { label: "Offline", color: "bg-muted" },
  fault: { label: "Falha", color: "bg-destructive" },
};

const DEFAULT_ENV: Omit<EnvironmentalRecord, 'id' | 'recorded_at'>[] = [
  { parameter: "Vento", unit: "kts", current_value: 22, yellow_limit: 30, red_limit: 40, asog_status: "GREEN", dp_class: "DP2" },
  { parameter: "Ondas (Hs)", unit: "m", current_value: 1.8, yellow_limit: 2.5, red_limit: 3.5, asog_status: "GREEN", dp_class: "DP2" },
  { parameter: "Corrente", unit: "kts", current_value: 1.2, yellow_limit: 1.5, red_limit: 2.0, asog_status: "GREEN", dp_class: "DP2" },
  { parameter: "Visibilidade", unit: "NM", current_value: 5.0, yellow_limit: 2.0, red_limit: 0.5, asog_status: "GREEN", dp_class: "DP2" },
];

const DEFAULT_EQUIPMENT: Omit<DPEquipment, 'id'>[] = [
  { name: "DPS-1 (Kongsberg K-Pos)", equipment_type: "DP Controller", status: "online", redundancy: "Primary", last_check: "2026-02-10" },
  { name: "DPS-2 (Kongsberg K-Pos)", equipment_type: "DP Controller", status: "online", redundancy: "Backup", last_check: "2026-02-10" },
  { name: "Thruster #1 Bow", equipment_type: "Thruster", status: "online", redundancy: "N+1", last_check: "2026-02-10" },
  { name: "Thruster #2 Bow", equipment_type: "Thruster", status: "online", redundancy: "N+1", last_check: "2026-02-10" },
  { name: "Thruster #3 Stern", equipment_type: "Thruster", status: "online", redundancy: "N+1", last_check: "2026-02-10" },
  { name: "Generator #1", equipment_type: "Power", status: "online", redundancy: "N+1", last_check: "2026-02-10" },
  { name: "Generator #2", equipment_type: "Power", status: "online", redundancy: "N+1", last_check: "2026-02-10" },
  { name: "DGPS Fugro", equipment_type: "Position Ref", status: "online", redundancy: "Primary", last_check: "2026-02-10" },
  { name: "DGPS Veripos", equipment_type: "Position Ref", status: "online", redundancy: "Secondary", last_check: "2026-02-10" },
  { name: "Gyro #1", equipment_type: "Heading Ref", status: "online", redundancy: "Primary", last_check: "2026-02-10" },
  { name: "Gyro #2", equipment_type: "Heading Ref", status: "online", redundancy: "Secondary", last_check: "2026-02-10" },
];

export const PeoDPOperationalWindow: React.FC = () => {
  const [dpClass] = useState<"DP2" | "DP3">("DP2");
  const queryClient = useQueryClient();

  const { data: envRecords = [] } = useQuery({
    queryKey: ['peodp-operational-window'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('peodp_operational_window')
        .select('*').order('recorded_at', { ascending: false }).limit(4);
      if (error) throw error;
      return (data || []) as EnvironmentalRecord[];
    },
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['peodp-equipment-status'],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)('peodp_equipment_status')
        .select('*').order('equipment_type').order('name');
      if (error) throw error;
      return (data || []) as DPEquipment[];
    },
  });

  const seedEnv = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)('peodp_operational_window').insert(DEFAULT_ENV);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['peodp-operational-window'] }),
  });

  const seedEquipment = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from as Function)('peodp_equipment_status').insert(DEFAULT_EQUIPMENT);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['peodp-equipment-status'] }),
  });

  const updateEquipmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)('peodp_equipment_status')
        .update({ status, updated_at: new Date().toISOString() } as never).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peodp-equipment-status'] });
      toast.success('Status do equipamento atualizado');
    },
  });

  // Calculate ASOG
  const hasFault = equipment.some(e => e.status === "fault");
  const envYellow = envRecords.some(e => {
    if (e.parameter === "Visibilidade") return Number(e.current_value) <= Number(e.yellow_limit);
    return Number(e.current_value) >= Number(e.yellow_limit);
  });
  const envRed = envRecords.some(e => {
    if (e.parameter === "Visibilidade") return Number(e.current_value) <= Number(e.red_limit);
    return Number(e.current_value) >= Number(e.red_limit);
  });
  const asogStatus = envRed ? "RED" : (hasFault || envYellow) ? "YELLOW" : "GREEN";

  const onlineCount = equipment.filter(e => e.status === "online").length;
  const faultCount = equipment.filter(e => e.status === "fault").length;

  const equipmentByType = equipment.reduce((acc, eq) => {
    const type = eq.equipment_type || 'Other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(eq);
    return acc;
  }, {} as Record<string, DPEquipment[]>);

  const getEnvStatus = (rec: EnvironmentalRecord) => {
    if (rec.parameter === "Visibilidade") {
      if (Number(rec.current_value) <= Number(rec.red_limit)) return "red";
      if (Number(rec.current_value) <= Number(rec.yellow_limit)) return "yellow";
      return "green";
    }
    if (Number(rec.current_value) >= Number(rec.red_limit)) return "red";
    if (Number(rec.current_value) >= Number(rec.yellow_limit)) return "yellow";
    return "green";
  };

  const getEnvProgress = (rec: EnvironmentalRecord) => {
    if (rec.parameter === "Visibilidade") return Math.max(0, Math.min(100, (Number(rec.current_value) / (Number(rec.yellow_limit) * 2)) * 100));
    return Math.max(0, Math.min(100, (Number(rec.current_value) / Number(rec.red_limit)) * 100));
  };

  return (
    <div className="space-y-6">
      {/* ASOG Header */}
      <Card className={`border-2 ${
        asogStatus === "GREEN" ? "border-success/50 bg-success/5" :
        asogStatus === "YELLOW" ? "border-warning/50 bg-warning/5" :
        "border-destructive/50 bg-destructive/5"
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${
                asogStatus === "GREEN" ? "bg-success/20" :
                asogStatus === "YELLOW" ? "bg-warning/20" : "bg-destructive/20"
              }`}>
                <Shield className={`h-8 w-8 ${
                  asogStatus === "GREEN" ? "text-success" :
                  asogStatus === "YELLOW" ? "text-warning" : "text-destructive"
                }`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  ASOG Status:
                  <span className={asogStatus === "GREEN" ? "text-success" : asogStatus === "YELLOW" ? "text-warning" : "text-destructive"}>
                    {asogStatus}
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {asogStatus === "GREEN" ? "Operação normal — todos os sistemas dentro dos limites" :
                   asogStatus === "YELLOW" ? "Atenção — degradação detectada" :
                   "ALERTA — limites excedidos"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1"><Anchor className="h-3 w-3" /> Classe {dpClass}</Badge>
              {envRecords.length === 0 && <Button size="sm" variant="outline" onClick={() => seedEnv.mutate()}>Inicializar Env</Button>}
              {equipment.length === 0 && <Button size="sm" variant="outline" onClick={() => seedEquipment.mutate()}>Inicializar Equip.</Button>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ThermometerSun className="h-5 w-5 text-info" />
            Condições Ambientais — Janela Operacional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {envRecords.map(rec => {
              const envStatus = getEnvStatus(rec);
              const Icon = ICON_MAP[rec.parameter] || Activity;
              return (
                <Card key={rec.id} className={envStatus === "red" ? "border-destructive/40 bg-destructive/5" : envStatus === "yellow" ? "border-warning/40 bg-warning/5" : ""}>
                  <CardContent className="pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${envStatus === "red" ? "text-destructive" : envStatus === "yellow" ? "text-warning" : "text-success"}`} />
                        <span className="font-medium">{rec.parameter}</span>
                      </div>
                      <span className={`text-2xl font-bold ${envStatus === "red" ? "text-destructive" : envStatus === "yellow" ? "text-warning" : "text-success"}`}>
                        {rec.current_value} <span className="text-sm font-normal text-muted-foreground">{rec.unit}</span>
                      </span>
                    </div>
                    <Progress value={getEnvProgress(rec)} className="h-2 mb-2" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Atual: {rec.current_value}{rec.unit}</span>
                      <span className="text-warning">Yellow: {rec.yellow_limit}{rec.unit}</span>
                      <span className="text-destructive">Red: {rec.red_limit}{rec.unit}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="h-5 w-5 text-primary" />
            Status de Equipamentos DP
          </CardTitle>
          <CardDescription>{onlineCount} online • {faultCount} falhas • {equipment.length} total</CardDescription>
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
                    const cfg = statusConfig[eq.status] || statusConfig.offline;
                    return (
                      <div
                        key={eq.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${eq.status === "fault" ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"}`}
                        onClick={() => {
                          const next = eq.status === "online" ? "fault" : "online";
                          updateEquipmentStatus.mutate({ id: eq.id, status: next });
                        }}
                      >
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
            <Shield className="h-5 w-5 text-success" />
            Resumo de Redundância — Classe {dpClass}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(equipmentByType).map(([type, eqs]) => {
              const online = eqs.filter(e => e.status === "online").length;
              const total = eqs.length;
              const hasFaultInType = eqs.some(e => e.status === "fault");
              return (
                <div key={type} className={`p-4 rounded-lg border text-center ${hasFaultInType ? "border-destructive/40 bg-destructive/5" : "bg-muted/30"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{type}</p>
                  <p className={`text-2xl font-bold ${hasFaultInType ? "text-destructive" : "text-green-500"}`}>{online}/{total}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {hasFaultInType ? "⚠️ Redundância degradada" : "✅ Redundância OK"}
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
