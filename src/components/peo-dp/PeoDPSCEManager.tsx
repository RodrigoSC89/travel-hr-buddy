import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, AlertTriangle, Activity, Clock, Wrench, RefreshCw, Settings } from "lucide-react";

interface SCElement {
  id: string;
  name: string;
  category: "propulsion" | "power" | "positioning" | "control" | "safety";
  performanceStandard: string;
  verificationMethod: string;
  frequency: string;
  lastVerified: string;
  nextDue: string;
  status: "verified" | "due_soon" | "overdue" | "degraded";
  integrity: number; // 0-100
  notes?: string;
}

const INITIAL_SCES: SCElement[] = [
  { id: "SCE-001", name: "Main Thruster #1 (Bow)", category: "propulsion", performanceStandard: "100% thrust disponível em < 30s", verificationMethod: "Teste funcional + medição de empuxo", frequency: "Mensal", lastVerified: "2026-02-01", nextDue: "2026-03-01", status: "verified", integrity: 98 },
  { id: "SCE-002", name: "Main Thruster #2 (Stern)", category: "propulsion", performanceStandard: "100% thrust disponível em < 30s", verificationMethod: "Teste funcional + medição de empuxo", frequency: "Mensal", lastVerified: "2026-01-15", nextDue: "2026-02-15", status: "due_soon", integrity: 95 },
  { id: "SCE-003", name: "Generator #1 (Emergency)", category: "power", performanceStandard: "Start em < 45s, carga em < 60s", verificationMethod: "Blackout test + cronometragem", frequency: "Trimestral", lastVerified: "2025-12-01", nextDue: "2026-03-01", status: "verified", integrity: 100 },
  { id: "SCE-004", name: "UPS — DP Control System", category: "power", performanceStandard: "Autonomia ≥ 30min a plena carga", verificationMethod: "Teste de descarga controlada", frequency: "Semestral", lastVerified: "2025-09-01", nextDue: "2026-03-01", status: "verified", integrity: 92 },
  { id: "SCE-005", name: "DGPS #1 (Fugro)", category: "positioning", performanceStandard: "Precisão < 1.0m, uptime > 99.5%", verificationMethod: "Comparação com DGPS #2 + logs", frequency: "Semanal", lastVerified: "2026-02-10", nextDue: "2026-02-17", status: "verified", integrity: 99 },
  { id: "SCE-006", name: "HPR Acoustic System", category: "positioning", performanceStandard: "Precisão < 2.0m, tracking contínuo", verificationMethod: "Calibração + comparação DGPS", frequency: "Mensal", lastVerified: "2026-01-20", nextDue: "2026-02-20", status: "due_soon", integrity: 88, notes: "Interferência acústica intermitente detectada" },
  { id: "SCE-007", name: "DP Control Computer (A)", category: "control", performanceStandard: "Changeover < 5s, sem perda de posição", verificationMethod: "Changeover test A↔B", frequency: "Mensal", lastVerified: "2026-02-05", nextDue: "2026-03-05", status: "verified", integrity: 100 },
  { id: "SCE-008", name: "Gyrocompass #1", category: "control", performanceStandard: "Drift < 0.5°/hr, settling < 4hr", verificationMethod: "Comparação com Gyro #2 e #3", frequency: "Semanal", lastVerified: "2026-02-12", nextDue: "2026-02-19", status: "verified", integrity: 97 },
  { id: "SCE-009", name: "Fire & Gas Detection (DP Area)", category: "safety", performanceStandard: "Detecção em < 30s, alarme em < 5s", verificationMethod: "Teste com gás calibrado", frequency: "Trimestral", lastVerified: "2025-11-15", nextDue: "2026-02-15", status: "overdue", integrity: 85, notes: "2 detectores com resposta lenta" },
  { id: "SCE-010", name: "ESD — Emergency Shutdown", category: "safety", performanceStandard: "Shutdown completo em < 15s", verificationMethod: "Teste parcial + simulação", frequency: "Semestral", lastVerified: "2025-10-01", nextDue: "2026-04-01", status: "verified", integrity: 100 },
];

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  propulsion: { label: "Propulsão", color: "text-blue-400", icon: Activity },
  power: { label: "Energia", color: "text-warning", icon: Activity },
  positioning: { label: "Posicionamento", color: "text-primary", icon: Activity },
  control: { label: "Controle", color: "text-purple-400", icon: Settings },
  safety: { label: "Segurança", color: "text-destructive", icon: Shield },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  verified: { label: "Verificado", color: "bg-success/10 text-success border-success/30" },
  due_soon: { label: "Próximo", color: "bg-warning/10 text-warning border-warning/30" },
  overdue: { label: "Vencido", color: "bg-destructive/10 text-destructive border-destructive/30" },
  degraded: { label: "Degradado", color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
};

export const PeoDPSCEManager: React.FC = () => {
  const [sces, setSces] = useState<SCElement[]>(INITIAL_SCES);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? sces : sces.filter(s => s.category === filter);
  const verifiedCount = sces.filter(s => s.status === "verified").length;
  const avgIntegrity = Math.round(sces.reduce((a, s) => a + s.integrity, 0) / sces.length);
  const overdueCount = sces.filter(s => s.status === "overdue").length;
  const overallReadiness = Math.round((verifiedCount / sces.length) * 100);

  const verifyElement = (id: string) => {
    setSces(prev => prev.map(s =>
      s.id === id ? { ...s, status: "verified" as const, lastVerified: new Date().toISOString().split("T")[0], integrity: Math.min(s.integrity + 5, 100) } : s
    ));
  };

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
          <CardDescription>Elementos críticos de segurança conforme IMCA M 166 / FMECA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map(sce => {
            const catCfg = categoryConfig[sce.category];
            const stCfg = statusConfig[sce.status];

            return (
              <div key={sce.id} className="p-4 rounded-xl border bg-card/50 space-y-3">
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
                      <Button size="sm" variant="outline" onClick={() => verifyElement(sce.id)} className="gap-1 text-xs mt-1">
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
