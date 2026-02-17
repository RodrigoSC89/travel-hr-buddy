import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, Activity, Clock, Wrench, RefreshCw, Settings, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SCElement {
  id: string;
  dbId: string;
  name: string;
  category: "propulsion" | "power" | "positioning" | "control" | "safety";
  performanceStandard: string;
  verificationMethod: string;
  frequency: string;
  lastVerified: string;
  nextDue: string;
  status: "verified" | "due_soon" | "overdue" | "degraded";
  integrity: number;
  notes?: string;
}

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  propulsion: { label: "Propulsão", color: "text-info", icon: Activity },
  power: { label: "Energia", color: "text-warning", icon: Activity },
  positioning: { label: "Posicionamento", color: "text-primary", icon: Activity },
  control: { label: "Controle", color: "text-accent-foreground", icon: Settings },
  safety: { label: "Segurança", color: "text-destructive", icon: Shield },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  verified: { label: "Verificado", color: "bg-success/10 text-success border-success/30" },
  due_soon: { label: "Próximo", color: "bg-warning/10 text-warning border-warning/30" },
  overdue: { label: "Vencido", color: "bg-destructive/10 text-destructive border-destructive/30" },
  degraded: { label: "Degradado", color: "bg-warning/10 text-warning border-warning/30" },
};

const dynamicFrom = supabase.from as Function;

export const PeoDPSCEManager: React.FC = () => {
  const [filter, setFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: sces = [], isLoading } = useQuery({
    queryKey: ["peodp-sces"],
    queryFn: async () => {
      const { data, error } = await dynamicFrom("peodp_equipment")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const now = new Date();
      return (data || []).map((eq: any): SCElement => {
        const nextDue = eq.next_test_date || eq.next_due;
        const nextDueDate = nextDue ? new Date(nextDue) : null;
        const daysUntilDue = nextDueDate ? Math.round((nextDueDate.getTime() - now.getTime()) / 86400000) : 999;

        let status: SCElement["status"] = "verified";
        if (daysUntilDue < 0) status = "overdue";
        else if (daysUntilDue <= 7) status = "due_soon";
        if (eq.status === "degraded" || eq.condition === "degraded") status = "degraded";

        const validCategories = ["propulsion", "power", "positioning", "control", "safety"];
        const category = validCategories.includes(eq.category) ? eq.category : "control";

        return {
          id: eq.equipment_id || eq.tag || eq.id?.slice(0, 8),
          dbId: eq.id,
          name: eq.name || eq.equipment_name || "SCE",
          category: category as SCElement["category"],
          performanceStandard: eq.performance_standard || eq.acceptance_criteria || "N/A",
          verificationMethod: eq.verification_method || eq.test_method || "Inspeção visual",
          frequency: eq.test_frequency || eq.frequency || "Mensal",
          lastVerified: eq.last_test_date?.slice(0, 10) || eq.last_verified?.slice(0, 10) || "N/A",
          nextDue: nextDue?.slice(0, 10) || "N/A",
          status,
          integrity: eq.integrity_score || eq.reliability_score || (status === "verified" ? 95 : status === "due_soon" ? 85 : 70),
          notes: eq.notes || eq.remarks,
        };
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (dbId: string) => {
      const now = new Date().toISOString();
      const { error } = await dynamicFrom("peodp_equipment")
        .update({ last_test_date: now, status: "operational" })
        .eq("id", dbId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["peodp-sces"] });
      toast.success("Elemento verificado com sucesso");
    },
  });

  const filtered = filter === "all" ? sces : sces.filter((s: SCElement) => s.category === filter);
  const verifiedCount = sces.filter((s: SCElement) => s.status === "verified").length;
  const avgIntegrity = sces.length > 0 ? Math.round(sces.reduce((a: number, s: SCElement) => a + s.integrity, 0) / sces.length) : 0;
  const overdueCount = sces.filter((s: SCElement) => s.status === "overdue").length;
  const overallReadiness = sces.length > 0 ? Math.round((verifiedCount / sces.length) * 100) : 0;

  if (isLoading) {
    return <div className="flex items-center justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground">Readiness SCE</p>
            <p className="text-3xl font-bold text-primary">{overallReadiness}%</p>
            <p className="text-xs text-muted-foreground">{verifiedCount}/{sces.length} verificados</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Shield className="h-4 w-4 text-success" /><p className="text-xs text-muted-foreground">Integridade Média</p></div>
          <p className="text-2xl font-bold">{avgIntegrity}%</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-destructive" /><p className="text-xs text-muted-foreground">Vencidos</p></div>
          <p className="text-2xl font-bold text-destructive">{overdueCount}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-5">
          <div className="flex items-center gap-2 mb-1"><Activity className="h-4 w-4 text-primary" /><p className="text-xs text-muted-foreground">Total SCEs</p></div>
          <p className="text-2xl font-bold">{sces.length}</p>
        </CardContent></Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>Todos</Button>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <Button key={key} size="sm" variant={filter === key ? "default" : "outline"} onClick={() => setFilter(key)} className="gap-1">
            <cfg.icon className="h-3 w-3" />{cfg.label}
          </Button>
        ))}
      </div>

      {/* SCE List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Safety Critical Elements — Registro de Verificação</CardTitle>
          <CardDescription>Elementos críticos de segurança conforme IMCA M 166 / FMECA — {sces.length} do Supabase</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>Nenhum SCE registrado no PEO-DP.</p>
            </div>
          ) : filtered.map((sce: SCElement) => {
            const catCfg = categoryConfig[sce.category] || categoryConfig.control;
            const stCfg = statusConfig[sce.status] || statusConfig.verified;

            return (
              <div key={sce.dbId} className="p-4 rounded-xl border bg-card/50 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{sce.id}</span>
                      <Badge variant="outline" className={stCfg.color}>{stCfg.label}</Badge>
                      <Badge variant="outline"><catCfg.icon className="h-3 w-3 mr-1" />{catCfg.label}</Badge>
                    </div>
                    <p className="font-medium">{sce.name}</p>
                    <p className="text-xs text-muted-foreground">{sce.performanceStandard}</p>
                    {sce.notes && (
                      <p className="text-xs text-warning">⚠ {sce.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="flex items-center gap-1"><Clock className="h-3 w-3" />Freq: {sce.frequency}</p>
                      <p>Último: {sce.lastVerified}</p>
                      <p>Próximo: {sce.nextDue}</p>
                    </div>
                    {sce.status !== "verified" && (
                      <Button size="sm" variant="outline" onClick={() => verifyMutation.mutate(sce.dbId)} className="gap-1 text-xs mt-1">
                        <CheckCircle className="h-3 w-3" />Verificar
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{sce.verificationMethod}</span>
                    <span className={sce.integrity < 90 ? "text-warning" : "text-success"}>{sce.integrity}%</span>
                  </div>
                  <Progress value={sce.integrity} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
