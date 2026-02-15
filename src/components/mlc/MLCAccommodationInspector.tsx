/**
 * MLC Accommodation Inspector — Reg. 3.1 / Standard A3.1
 * Connected to Supabase for persistent inspection results
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Home, CheckCircle, AlertTriangle, Clock, Download,
  Shield, Wind, Volume2, Bed, UtensilsCrossed, ShowerHead, Lamp, Users, Droplets
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type InspStatus = "pass" | "fail" | "warning" | "na";

interface InspectionItem {
  id: string;
  area: string;
  requirement: string;
  regulation: string;
  standard: string;
  status: InspStatus;
  measurement: string | null;
  minRequired: string | null;
  inspector: string;
  lastChecked: string;
  notes: string;
}

const STATUS_CFG: Record<InspStatus, { label: string; color: string }> = {
  pass: { label: "Conforme", color: "text-success" },
  fail: { label: "Não Conforme", color: "text-destructive" },
  warning: { label: "Atenção", color: "text-warning" },
  na: { label: "N/A", color: "text-muted-foreground" },
};

const DEFAULT_ITEMS: InspectionItem[] = [
  { id: "AC-01", area: "Cabines — Espaço", requirement: "Área mínima de cabine individual para oficiais", regulation: "MLC Standard A3.1.9(a)", standard: "≥ 7.5 m² (navios ≥ 3000 GT)", status: "pass", measurement: "8.2 m²", minRequired: "7.5 m²", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AC-02", area: "Cabines — Espaço", requirement: "Área mínima de cabine para ratings", regulation: "MLC Standard A3.1.9(f)", standard: "≥ 3.6 m² por pessoa", status: "pass", measurement: "4.1 m² p/p", minRequired: "3.6 m²", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AC-03", area: "Cabines — Espaço", requirement: "Pé-direito mínimo em cabines", regulation: "MLC Standard A3.1.6(a)", standard: "≥ 203 cm", status: "pass", measurement: "210 cm", minRequired: "203 cm", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AC-05", area: "Cabines — Mobiliário", requirement: "Armário individual com chave", regulation: "MLC Standard A3.1.9(l)", standard: "Armário ≥ 475L com chave", status: "warning", measurement: "3 chaves faltando", minRequired: "Individual", inspector: "QSMS", lastChecked: "2026-02-01", notes: "Solicitar chaves reserva" },
  { id: "AV-01", area: "Ventilação & Clima", requirement: "Sistema de ar condicionado operacional", regulation: "MLC Standard A3.1.7(a)", standard: "18-27°C controlável", status: "pass", measurement: "22°C", minRequired: "18-27°C", inspector: "Ch. Máquinas", lastChecked: "2026-02-01", notes: "" },
  { id: "AN-01", area: "Ruído & Vibração", requirement: "Nível de ruído em cabines", regulation: "MLC A3.1.6(h), IMO MSC.337(91)", standard: "≤ 60 dB(A)", status: "warning", measurement: "62 dB(A) proa", minRequired: "≤ 60 dB(A)", inspector: "QSMS", lastChecked: "2026-01-20", notes: "Avaliar isolamento acústico" },
  { id: "AS-01", area: "Instalações Sanitárias", requirement: "Ratio sanitário/tripulante", regulation: "MLC Standard A3.1.11(a)", standard: "1:6", status: "pass", measurement: "1:4", minRequired: "1:6", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AS-03", area: "Instalações Sanitárias", requirement: "Condições de limpeza e higiene", regulation: "MLC Standard A3.1.11", standard: "Zero infiltrações", status: "fail", measurement: "2 infiltrações", minRequired: "Zero", inspector: "QSMS", lastChecked: "2026-02-01", notes: "Infiltração cabines 8 e 14 — manutenção urgente" },
  { id: "AM-01", area: "Refeitório & Cozinha", requirement: "Espaço adequado", regulation: "MLC Standard A3.1.10", standard: "Assentos para turno", status: "pass", measurement: "24/18", minRequired: "≥ turno", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AL-02", area: "Iluminação", requirement: "Luz de leitura individual", regulation: "MLC Standard A3.1.6(d)", standard: "100% funcional", status: "warning", measurement: "2 queimadas", minRequired: "100%", inspector: "QSMS", lastChecked: "2026-02-01", notes: "Substituir luminárias cabines 6 e 19" },
  { id: "AR-01", area: "Recreação", requirement: "Área de recreação", regulation: "MLC Standard A3.1.12", standard: "TV, livros, jogos", status: "pass", measurement: "Presente", minRequired: "Sim", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
  { id: "AY-01", area: "Lavanderia", requirement: "Instalações de lavanderia", regulation: "MLC Standard A3.1.13", standard: "Lavar+secar", status: "pass", measurement: "2+1", minRequired: "1+1", inspector: "QSMS", lastChecked: "2026-02-01", notes: "" },
];

const AREA_ICONS: Record<string, React.ReactNode> = {
  "Cabines — Espaço": <Bed className="h-4 w-4 text-primary" />,
  "Cabines — Mobiliário": <Home className="h-4 w-4 text-primary" />,
  "Ventilação & Clima": <Wind className="h-4 w-4 text-primary" />,
  "Ruído & Vibração": <Volume2 className="h-4 w-4 text-primary" />,
  "Instalações Sanitárias": <ShowerHead className="h-4 w-4 text-primary" />,
  "Refeitório & Cozinha": <UtensilsCrossed className="h-4 w-4 text-primary" />,
  "Iluminação": <Lamp className="h-4 w-4 text-primary" />,
  "Recreação": <Users className="h-4 w-4 text-primary" />,
  "Lavanderia": <Droplets className="h-4 w-4 text-primary" />,
};

export function MLCAccommodationInspector() {
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [filterArea, setFilterArea] = useState("all");

  const areas = useMemo(() => [...new Set(items.map(i => i.area))], [items]);
  const filtered = filterArea === "all" ? items : items.filter(i => i.area === filterArea);

  const stats = useMemo(() => {
    const pass = items.filter(i => i.status === "pass").length;
    const fail = items.filter(i => i.status === "fail").length;
    const warning = items.filter(i => i.status === "warning").length;
    const total = items.filter(i => i.status !== "na").length;
    const score = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { pass, fail, warning, total, score };
  }, [items]);

  const resolve = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "pass" as const, lastChecked: new Date().toISOString().split("T")[0] } : i));
    toast.success("Item marcado como conforme");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5 text-primary" />
            Accommodation Inspector — MLC Reg. 3.1
          </h3>
          <p className="text-sm text-muted-foreground">Top 3 área de deficiência MLC • {items.length} itens inspecionados</p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(items, "MLC Accommodation Inspector")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className={stats.score >= 90 ? "border-success/20" : "border-warning/20"}>
          <CardContent className="pt-4 text-center">
            <p className={`text-3xl font-bold ${stats.score >= 90 ? "text-success" : stats.score >= 70 ? "text-warning" : "text-destructive"}`}>{stats.score}%</p>
            <p className="text-[10px] text-muted-foreground">Conformidade Reg. 3.1</p>
          </CardContent>
        </Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.pass}</p>
          <p className="text-[10px] text-muted-foreground">Conformes</p>
        </CardContent></Card>
        <Card className={stats.fail > 0 ? "border-destructive/30 bg-destructive/5" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.fail > 0 ? "text-destructive" : ""}`}>{stats.fail}</p>
            <p className="text-[10px] text-muted-foreground">Não Conformes</p>
          </CardContent>
        </Card>
        <Card className={stats.warning > 0 ? "border-warning/20" : ""}>
          <CardContent className="pt-4 text-center">
            <p className={`text-2xl font-bold ${stats.warning > 0 ? "text-warning" : ""}`}>{stats.warning}</p>
            <p className="text-[10px] text-muted-foreground">Atenção</p>
          </CardContent>
        </Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total Itens</p>
        </CardContent></Card>
      </div>

      {(stats.fail > 0 || stats.warning > 0) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-1">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> Itens requerendo ação:
            </p>
            {items.filter(i => i.status === "fail" || i.status === "warning").map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Badge variant={item.status === "fail" ? "destructive" : "secondary"} className="text-[10px]">{item.area}</Badge>
                <span className="font-medium">{item.requirement}</span>
                {item.measurement && <span className="text-xs text-muted-foreground">({item.measurement})</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-1 flex-wrap">
        <Button size="sm" variant={filterArea === "all" ? "default" : "outline"} className="text-xs h-8" onClick={() => setFilterArea("all")}>Todos</Button>
        {areas.map(area => (
          <Button key={area} size="sm" variant={filterArea === area ? "default" : "outline"} className="text-xs h-8" onClick={() => setFilterArea(area)}>
            {area.split(" — ")[0]}
          </Button>
        ))}
      </div>

      {areas.filter(a => filterArea === "all" || a === filterArea).map(area => {
        const areaItems = filtered.filter(i => i.area === area);
        if (areaItems.length === 0) return null;
        const areaPass = areaItems.filter(i => i.status === "pass").length;
        const areaPct = Math.round((areaPass / areaItems.length) * 100);
        return (
          <Card key={area}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {AREA_ICONS[area] || <Home className="h-4 w-4 text-primary" />}
                  {area}
                </span>
                <Badge variant={areaPct === 100 ? "default" : "secondary"} className="text-xs">{areaPass}/{areaItems.length} ({areaPct}%)</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {areaItems.map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-2 rounded text-sm ${item.status === "fail" ? "bg-destructive/5" : item.status === "warning" ? "bg-warning/5" : ""}`}>
                  {item.status === "pass" ? <CheckCircle className="h-3.5 w-3.5 text-success shrink-0" /> :
                   item.status === "warning" ? <Clock className="h-3.5 w-3.5 text-warning shrink-0" /> :
                   <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{item.requirement}</span>
                    {item.measurement && item.minRequired && (
                      <span className="text-xs text-muted-foreground ml-2">
                        Medido: <strong>{item.measurement}</strong> / Req: {item.minRequired}
                      </span>
                    )}
                    {item.notes && <span className="text-xs text-warning block">⚠ {item.notes}</span>}
                  </div>
                  <Badge variant="outline" className="text-[9px] shrink-0 max-w-[140px] truncate">{item.regulation}</Badge>
                  {item.status !== "pass" && (
                    <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => resolve(item.id)}>Resolver</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
