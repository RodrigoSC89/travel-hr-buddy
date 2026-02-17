/**
 * PEO-DP SIMOPS Dashboard - Connected to Supabase
 * Real-time simultaneous operations coordination (IMCA M 220)
 */
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertTriangle, Anchor, CheckCircle, Clock, Layers, Shield, Target, Users, Activity, Zap, Loader2 } from "lucide-react";

interface SimOp {
  id: string;
  name: string;
  type: string;
  status: string;
  riskLevel: string;
  startTime: string;
  endTime: string;
  supervisor: string;
  dpRequirements: string;
  restrictions: string[];
  conflictsWith: string[];
  weatherLimit: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  crane_ops: { label: "Guincho/Crane", icon: Layers, color: "text-warning" },
  diving: { label: "Mergulho", icon: Anchor, color: "text-info" },
  rov: { label: "ROV", icon: Target, color: "text-accent-foreground" },
  pipe_lay: { label: "Pipe Lay", icon: Activity, color: "text-primary" },
  supply: { label: "Supply", icon: Anchor, color: "text-primary" },
  helicopter: { label: "Helicóptero", icon: Zap, color: "text-warning" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejada", color: "bg-muted text-muted-foreground" },
  in_progress: { label: "Em Curso", color: "bg-success/10 text-success border-success/30" },
  suspended: { label: "Suspensa", color: "bg-destructive/10 text-destructive border-destructive/30" },
  completed: { label: "Concluída", color: "bg-primary/10 text-primary border-primary/30" },
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success border-success/30",
  medium: "bg-warning/10 text-warning border-warning/30",
  high: "bg-warning/10 text-warning border-warning/30",
  critical: "bg-destructive/10 text-destructive border-destructive/30",
};

export const PeoDPSIMOPSDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: simops = [], isLoading } = useQuery({
    queryKey: ["peodp-simops"],
    queryFn: async () => {
      const { data, error } = await (supabase.from as Function)("peodp_simops")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        id: String(r.id),
        name: String(r.operation_name || ""),
        type: String(r.operation_type || "crane_ops"),
        status: String(r.status || "planned"),
        riskLevel: String(r.risk_level || "medium"),
        startTime: String(r.start_time || "00:00"),
        endTime: String(r.end_time || "23:59"),
        supervisor: String(r.supervisor || ""),
        dpRequirements: String(r.dp_requirements || ""),
        restrictions: Array.isArray(r.restrictions) ? (r.restrictions as string[]) : [],
        conflictsWith: Array.isArray(r.conflicts_with) ? (r.conflicts_with as string[]) : [],
        weatherLimit: String(r.weather_limit || ""),
      })) as SimOp[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await (supabase.from as Function)("peodp_simops")
        .update({ status } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-simops"] });
      toast.success("Status atualizado");
    },
  });

  const activeCount = simops.filter(s => s.status === "in_progress").length;
  const plannedCount = simops.filter(s => s.status === "planned").length;
  const criticalCount = simops.filter(s => s.riskLevel === "critical" && s.status !== "completed").length;

  // Detect conflicts
  const conflicts: Array<{ op1: string; op2: string; reason: string }> = [];
  simops.forEach(op => {
    if (op.status === "completed") return;
    op.conflictsWith.forEach(conflictId => {
      const conflictOp = simops.find(s => s.id === conflictId && s.status !== "completed");
      if (conflictOp && !conflicts.find(c => (c.op1 === conflictId && c.op2 === op.id))) {
        conflicts.push({ op1: op.id, op2: conflictId, reason: `${op.name} ↔ ${conflictOp.name}` });
      }
    });
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-5"><p className="text-xs text-muted-foreground">SIMOPS Ativas</p><p className="text-3xl font-bold text-primary">{activeCount}</p><p className="text-xs text-muted-foreground">{plannedCount} planejadas</p></CardContent>
        </Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Críticas</p></div><p className="text-2xl font-bold text-destructive">{criticalCount}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-warning" /><p className="text-xs text-muted-foreground">Conflitos</p></div><p className="text-2xl font-bold text-warning">{conflicts.length}</p></CardContent></Card>
        <Card><CardContent className="pt-5"><div className="flex items-center gap-2 mb-1"><Layers className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Total Ops</p></div><p className="text-2xl font-bold">{simops.length}</p></CardContent></Card>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2 text-warning"><AlertTriangle className="h-5 w-5" />Conflitos Detectados</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={`conflict-${c.op1}-${c.op2}-${i}`} className="flex items-center gap-3 p-3 rounded-lg border border-warning/20 bg-warning/5">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                <div className="flex-1"><p className="text-sm font-medium">{c.op1} ↔ {c.op2}</p><p className="text-xs text-muted-foreground">{c.reason}</p></div>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Ação Requerida</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Timeline Visual */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Clock className="h-5 w-5 text-primary" />Timeline de Operações (24h)</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              {[0, 4, 8, 12, 16, 20, 24].map(h => <span key={h}>{String(h).padStart(2, "0")}:00</span>)}
            </div>
            {simops.filter(s => s.status !== "completed").map(op => {
              const startH = parseInt(op.startTime.split(":")[0]) || 0;
              const endH = parseInt(op.endTime.split(":")[0]) || 24;
              const leftPct = (startH / 24) * 100;
              const widthPct = ((endH - startH) / 24) * 100;
              return (
                <div key={op.id} className="relative h-8 rounded-lg bg-muted/30 border">
                  <div className={`absolute h-full rounded-lg flex items-center px-2 text-xs font-medium ${riskColors[op.riskLevel] || ''} border`}
                    style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 8)}%` }}>
                    <span className="truncate">{op.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      {simops.length === 0 ? (
        <Card><CardContent className="pt-8 pb-8 text-center text-muted-foreground">Nenhuma SIMOP registrada.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" />Operações Simultâneas</CardTitle><CardDescription>IMCA M 220</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {simops.map(op => {
              const tcfg = typeConfig[op.type] || typeConfig.crane_ops;
              const stCfg = statusConfig[op.status] || statusConfig.planned;
              return (
                <div key={op.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={stCfg.color}>{stCfg.label}</Badge>
                        <Badge variant="outline" className={riskColors[op.riskLevel] || ''}>Risco: {op.riskLevel}</Badge>
                        <Badge variant="outline"><tcfg.icon className="h-3 w-3 mr-1" />{tcfg.label}</Badge>
                      </div>
                      <p className="font-medium">{op.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{op.startTime}–{op.endTime}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{op.supervisor}</span>
                      </div>
                      {op.dpRequirements && <p className="text-xs"><span className="font-medium">DP:</span> {op.dpRequirements}</p>}
                      {op.weatherLimit && <p className="text-xs"><span className="font-medium">Weather:</span> {op.weatherLimit}</p>}
                    </div>
                    <div className="flex gap-1">
                      {op.status === "in_progress" && (
                        <Button size="sm" variant="destructive" onClick={() => updateStatusMutation.mutate({ id: op.id, status: "suspended" })} className="text-xs">Suspender</Button>
                      )}
                      {op.status === "suspended" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: op.id, status: "in_progress" })} className="text-xs gap-1">
                          <CheckCircle className="h-3 w-3" />Retomar
                        </Button>
                      )}
                    </div>
                  </div>
                  {op.restrictions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {op.restrictions.map((r) => (
                        <Badge key={r} variant="outline" className="text-[10px] bg-warning/5 text-warning border-warning/20">⚠ {r}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
