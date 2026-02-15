/**
 * PEOTRAM Evidence Completion Tracker
 * Visual dashboard showing evidence gaps per element with progress tracking
 * Helps close audit preparation gaps fast
 */
import React, { useState, useMemo } from "react";
import { quickExport } from "@/lib/export-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  FileText, CheckCircle, AlertTriangle, Upload, Download, Camera,
  Shield, Search, Filter, Eye, Paperclip, Clock, Target
} from "lucide-react";
import { toast } from "sonner";

interface EvidenceItem {
  id: string;
  elementId: number;
  elementName: string;
  elementSigla: string;
  itemRef: string;
  requirement: string;
  evidenceType: "document" | "photo" | "record" | "certificate" | "report";
  description: string;
  status: "complete" | "partial" | "missing" | "expired";
  files: string[];
  expiryDate: string | null;
  lastUpdated: string | null;
  responsible: string;
  isCritical: boolean;
  notes: string;
}

const EVIDENCE_TYPES = {
  document: { label: "Documento", icon: FileText, color: "text-primary" },
  photo: { label: "Foto", icon: Camera, color: "text-info" },
  record: { label: "Registro", icon: Paperclip, color: "text-warning" },
  certificate: { label: "Certificado", icon: Shield, color: "text-success" },
  report: { label: "Relatório", icon: FileText, color: "text-muted-foreground" },
};

const STATUS_CONFIG = {
  complete: { label: "Completa", color: "bg-success/10 border-success/30 text-success", icon: CheckCircle },
  partial: { label: "Parcial", color: "bg-warning/10 border-warning/30 text-warning", icon: Clock },
  missing: { label: "Ausente", color: "bg-destructive/10 border-destructive/30 text-destructive", icon: AlertTriangle },
  expired: { label: "Vencida", color: "bg-destructive/10 border-destructive/30 text-destructive", icon: AlertTriangle },
};

const EVIDENCE_DATA: EvidenceItem[] = [
  // Element 1 - LGR
  { id: "E1-01", elementId: 1, elementName: "Liderança, Governança e Responsabilidade", elementSigla: "LGR", itemRef: "1.1", requirement: "Política de SMS aprovada pela alta direção", evidenceType: "document", description: "Documento da Política de SMS com assinatura", status: "complete", files: ["Politica_SMS_Rev05.pdf"], expiryDate: null, lastUpdated: "2026-01-15", responsible: "DPA", isCritical: true, notes: "" },
  { id: "E1-02", elementId: 1, elementName: "Liderança, Governança e Responsabilidade", elementSigla: "LGR", itemRef: "1.2", requirement: "Atas de reunião de análise crítica pela direção", evidenceType: "record", description: "Atas dos últimos 12 meses", status: "partial", files: ["Ata_Q1_2026.pdf"], expiryDate: null, lastUpdated: "2026-01-20", responsible: "QSMS", isCritical: false, notes: "Faltam atas Q2, Q3, Q4 de 2025" },
  // Element 4 - OP (CRÍTICO)
  { id: "E4-01", elementId: 4, elementName: "Operações", elementSigla: "OP", itemRef: "4.1", requirement: "Procedimentos operacionais revisados", evidenceType: "document", description: "SOPs de todas as operações críticas", status: "partial", files: ["SOP-001.pdf", "SOP-002.pdf"], expiryDate: null, lastUpdated: "2025-11-10", responsible: "Imediato", isCritical: true, notes: "SOP-003 a SOP-007 não revisados" },
  { id: "E4-02", elementId: 4, elementName: "Operações", elementSigla: "OP", itemRef: "4.2", requirement: "Registros de Permissões de Trabalho (PT)", evidenceType: "record", description: "PTs emitidas nos últimos 6 meses", status: "complete", files: ["PTs_Jul-Dez_2025.zip"], expiryDate: null, lastUpdated: "2026-01-05", responsible: "QSMS", isCritical: true, notes: "" },
  { id: "E4-03", elementId: 4, elementName: "Operações", elementSigla: "OP", itemRef: "4.3", requirement: "Fotos de condições operacionais", evidenceType: "photo", description: "Registro fotográfico de boas práticas operacionais", status: "missing", files: [], expiryDate: null, lastUpdated: null, responsible: "QSMS", isCritical: false, notes: "Programar campanha fotográfica" },
  // Element 6 - MN (CRÍTICO)
  { id: "E6-01", elementId: 6, elementName: "Manutenção", elementSigla: "MN", itemRef: "6.1", requirement: "PMS completo e atualizado", evidenceType: "document", description: "Plano de manutenção de todos equipamentos críticos", status: "complete", files: ["PMS_Export_Jan2026.pdf"], expiryDate: null, lastUpdated: "2026-01-28", responsible: "Ch. Máquinas", isCritical: true, notes: "" },
  { id: "E6-02", elementId: 6, elementName: "Manutenção", elementSigla: "MN", itemRef: "6.2", requirement: "Certificados de equipamentos críticos", evidenceType: "certificate", description: "Certificados classe de guindastes, guinchos, etc", status: "expired", files: ["Cert_Guindaste_2024.pdf"], expiryDate: "2025-06-30", lastUpdated: "2024-06-30", responsible: "Ch. Máquinas", isCritical: true, notes: "Certificado vencido — agendar inspeção urgente" },
  { id: "E6-03", elementId: 6, elementName: "Manutenção", elementSigla: "MN", itemRef: "6.3", requirement: "Relatório de manutenções preventivas concluídas", evidenceType: "report", description: "Relatório MP dos últimos 12 meses", status: "complete", files: ["MP_Report_2025.pdf"], expiryDate: null, lastUpdated: "2026-02-01", responsible: "Ch. Máquinas", isCritical: false, notes: "" },
  // Element 9 - RH
  { id: "E9-01", elementId: 9, elementName: "Recursos Humanos", elementSigla: "RH", itemRef: "9.1", requirement: "Certificados STCW de toda tripulação", evidenceType: "certificate", description: "Certificados válidos de qualificação marítima", status: "partial", files: ["STCW_Crew_List.xlsx"], expiryDate: "2026-08-15", lastUpdated: "2026-01-10", responsible: "RH", isCritical: true, notes: "3 certificados vencem em 60 dias" },
  { id: "E9-02", elementId: 9, elementName: "Recursos Humanos", elementSigla: "RH", itemRef: "9.2", requirement: "Registros de treinamento CIPA/NR", evidenceType: "record", description: "Listas de presença e certificados NR-34, NR-35", status: "complete", files: ["Treinamentos_2025.zip"], expiryDate: null, lastUpdated: "2025-12-20", responsible: "RH", isCritical: false, notes: "" },
  // Element 11 - PE (CRÍTICO)
  { id: "E11-01", elementId: 11, elementName: "Preparação para Emergência", elementSigla: "PE", itemRef: "11.1", requirement: "Relatórios de exercícios simulados", evidenceType: "report", description: "Relatórios de exercícios de abandono e incêndio", status: "missing", files: [], expiryDate: null, lastUpdated: null, responsible: "Comandante", isCritical: true, notes: "Exercício de abandono não realizado no prazo" },
  { id: "E11-02", elementId: 11, elementName: "Preparação para Emergência", elementSigla: "PE", itemRef: "11.2", requirement: "Fotos de inspeção de equipamentos LSA/FFA", evidenceType: "photo", description: "Registro fotográfico de balsas, extintores, etc", status: "complete", files: ["LSA_FFA_Fotos.zip"], expiryDate: null, lastUpdated: "2026-01-25", responsible: "Imediato", isCritical: true, notes: "" },
  // Element 12 - AI (CRÍTICO)
  { id: "E12-01", elementId: 12, elementName: "Análise de Incidentes", elementSigla: "AI", itemRef: "12.1", requirement: "Relatórios de investigação completos", evidenceType: "report", description: "Investigações com análise de causa raiz (Bow-Tie/5 Porquês)", status: "partial", files: ["Inv_001.pdf", "Inv_002.pdf"], expiryDate: null, lastUpdated: "2025-12-15", responsible: "QSMS", isCritical: true, notes: "Inv_003 sem análise de causa raiz completa" },
];

export function PeotramEvidenceTracker() {
  const [items, setItems] = useState(EVIDENCE_DATA);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterElement, setFilterElement] = useState("all");

  const filtered = useMemo(() => items.filter(item =>
    (filterStatus === "all" || item.status === filterStatus) &&
    (filterElement === "all" || String(item.elementId) === filterElement) &&
    (searchTerm === "" || item.requirement.toLowerCase().includes(searchTerm.toLowerCase()) || item.elementSigla.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [items, filterStatus, searchTerm, filterElement]);

  const stats = useMemo(() => {
    const complete = items.filter(i => i.status === "complete").length;
    const partial = items.filter(i => i.status === "partial").length;
    const missing = items.filter(i => i.status === "missing").length;
    const expired = items.filter(i => i.status === "expired").length;
    const total = items.length;
    const criticalGaps = items.filter(i => i.isCritical && i.status !== "complete").length;
    const pct = total > 0 ? Math.round((complete / total) * 100) : 0;

    // Group by element
    const byElement = new Map<number, { sigla: string; name: string; total: number; complete: number; isCritical: boolean }>();
    items.forEach(i => {
      const existing = byElement.get(i.elementId) || { sigla: i.elementSigla, name: i.elementName, total: 0, complete: 0, isCritical: false };
      existing.total++;
      if (i.status === "complete") existing.complete++;
      if (i.isCritical) existing.isCritical = true;
      byElement.set(i.elementId, existing);
    });

    return { complete, partial, missing, expired, total, criticalGaps, pct, byElement };
  }, [items]);

  const markComplete = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "complete" as const, lastUpdated: new Date().toISOString().split("T")[0] } : i));
    toast.success("Evidência marcada como completa");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-warning" />
            Rastreador de Evidências PEOTRAM
          </h3>
          <p className="text-sm text-muted-foreground">
            {stats.complete}/{stats.total} evidências completas • {stats.criticalGaps} gaps críticos
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => quickExport(ELEMENTS, "PEOTRAM Evidence Tracker")}>
          <Download className="h-3 w-3" /> Exportar
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </CardContent></Card>
        <Card className="border-success/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{stats.complete}</p>
          <p className="text-[10px] text-muted-foreground">Completas</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{stats.partial}</p>
          <p className="text-[10px] text-muted-foreground">Parciais</p>
        </CardContent></Card>
        <Card className={stats.missing > 0 ? "border-destructive/30 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.missing > 0 ? "text-destructive" : ""}`}>{stats.missing}</p>
          <p className="text-[10px] text-muted-foreground">Ausentes</p>
        </CardContent></Card>
        <Card className={stats.expired > 0 ? "border-destructive/30 bg-destructive/5" : ""}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.expired > 0 ? "text-destructive" : ""}`}>{stats.expired}</p>
          <p className="text-[10px] text-muted-foreground">Vencidas</p>
        </CardContent></Card>
        <Card className={stats.criticalGaps > 0 ? "border-destructive/20" : "border-success/20"}><CardContent className="pt-4 text-center">
          <p className={`text-2xl font-bold ${stats.criticalGaps > 0 ? "text-destructive" : "text-success"}`}>{stats.pct}%</p>
          <p className="text-[10px] text-muted-foreground">Completude</p>
        </CardContent></Card>
      </div>

      {/* Element Progress Bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-warning" /> Progresso por Elemento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from(stats.byElement.entries()).sort((a, b) => a[0] - b[0]).map(([elId, el]) => {
            const pct = el.total > 0 ? Math.round((el.complete / el.total) * 100) : 0;
            return (
              <div key={elId} className="flex items-center gap-3">
                <Badge variant={el.isCritical ? "destructive" : "outline"} className="text-[10px] w-12 justify-center">{el.sigla}</Badge>
                <Progress value={pct} className="flex-1 h-2" />
                <span className={`text-xs font-bold w-10 text-right ${pct === 100 ? "text-success" : pct >= 50 ? "text-warning" : "text-destructive"}`}>{pct}%</span>
                <span className="text-[10px] text-muted-foreground w-12">{el.complete}/{el.total}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Critical Gaps Alert */}
      {stats.criticalGaps > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-3 space-y-1">
            <p className="text-sm font-semibold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" /> {stats.criticalGaps} gaps críticos para resolução imediata:
            </p>
            {items.filter(i => i.isCritical && i.status !== "complete").map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Badge variant="destructive" className="text-[10px]">{item.elementSigla}</Badge>
                <span className="font-medium">{item.requirement}</span>
                <Badge variant="outline" className="text-[10px]">{STATUS_CONFIG[item.status].label}</Badge>
                <span className="text-xs text-muted-foreground">• {item.responsible}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input placeholder="Buscar evidências..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 h-9" />
        </div>
        <div className="flex gap-1">
          {["all", "complete", "partial", "missing", "expired"].map(s => (
            <Button key={s} size="sm" variant={filterStatus === s ? "default" : "outline"} className="text-xs h-9" onClick={() => setFilterStatus(s)}>
              {s === "all" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Evidence List */}
      <div className="space-y-2">
        {filtered.map(item => {
          const StatusIcon = STATUS_CONFIG[item.status].icon;
          const TypeConfig = EVIDENCE_TYPES[item.evidenceType];
          const TypeIcon = TypeConfig.icon;
          return (
            <Card key={item.id} className={`${STATUS_CONFIG[item.status].color} border`}>
              <CardContent className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <StatusIcon className={`h-3.5 w-3.5 ${STATUS_CONFIG[item.status].color.split(' ').pop()}`} />
                      <Badge variant={item.isCritical ? "destructive" : "outline"} className="text-[10px]">{item.elementSigla} {item.itemRef}</Badge>
                      <span className="text-sm font-medium">{item.requirement}</span>
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <TypeIcon className={`h-2.5 w-2.5 ${TypeConfig.color}`} />{TypeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Responsável: {item.responsible}</span>
                      {item.lastUpdated && <span>Atualizado: {item.lastUpdated}</span>}
                      {item.expiryDate && <span className={new Date(item.expiryDate) < new Date() ? "text-destructive font-medium" : ""}>Validade: {item.expiryDate}</span>}
                      {item.files.length > 0 && <span className="flex items-center gap-1"><Paperclip className="h-3 w-3" />{item.files.length} arquivo(s)</span>}
                    </div>
                    {item.notes && <p className="text-xs text-warning mt-1">⚠ {item.notes}</p>}
                  </div>
                  {item.status !== "complete" && (
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => toast.info("Upload de evidência")}>
                        <Upload className="h-3 w-3" /> Upload
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => markComplete(item.id)}>
                        <CheckCircle className="h-3 w-3" /> Validar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
