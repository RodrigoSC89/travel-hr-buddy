/**
 * ComplianceOneClickAuditPrep - One-Click Audit Package Generator
 * Assembles a complete audit preparation package including evidence,
 * certificates, checklists, risk assessments, and crew readiness in one click
 */
import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Package, Loader2, CheckCircle, AlertTriangle, Shield, Brain,
  FileCheck, Download, Zap, Clock, Ship, Users, Wrench,
  BookOpen, Target, BarChart3, XCircle, ArrowRight
} from "lucide-react";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { logger } from "@/lib/logger";

interface AuditPackageSection {
  title: string;
  icon: string;
  status: "ready" | "partial" | "missing" | "checking";
  items: Array<{
    name: string;
    status: "ok" | "warning" | "missing";
    detail: string;
  }>;
  readiness: number;
}

interface AuditPackage {
  audit_type: string;
  vessel: string;
  overall_readiness: number;
  sections: AuditPackageSection[];
  executive_briefing: string;
  risk_areas: string[];
  crew_briefing_points: string[];
  estimated_duration: string;
  last_similar_inspection: string;
}

interface ComplianceOneClickAuditPrepProps {
  moduleId: string;
  moduleName: string;
}

const AUDIT_TYPES = [
  { value: "psc", label: "Port State Control (PSC)", icon: "🏛️" },
  { value: "ism_external", label: "Auditoria Externa ISM", icon: "🛡️" },
  { value: "ism_internal", label: "Auditoria Interna ISM", icon: "📋" },
  { value: "isps", label: "Verificação ISPS", icon: "🔒" },
  { value: "sire", label: "Inspeção SIRE/OCIMF", icon: "⚓" },
  { value: "cdi", label: "Inspeção CDI", icon: "🧪" },
  { value: "flag_state", label: "Inspeção Flag State", icon: "🏴" },
  { value: "class_survey", label: "Vistoria de Classe", icon: "🔧" },
  { value: "peotram", label: "Auditoria PEOTRAM/ANP", icon: "🛢️" },
];

export function ComplianceOneClickAuditPrep({
  moduleId,
  moduleName,
}: ComplianceOneClickAuditPrepProps) {
  const [selectedAuditType, setSelectedAuditType] = useState("");
  const [vesselName, setVesselName] = useState("");
  const [auditDate, setAuditDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [auditPackage, setAuditPackage] = useState<AuditPackage | null>(null);

  const generateAuditPackage = useCallback(async () => {
    if (!selectedAuditType) {
      toast.error("Selecione o tipo de auditoria");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const auditTypeName = AUDIT_TYPES.find(t => t.value === selectedAuditType)?.label || selectedAuditType;

      // Step 1: Collect all relevant data
      setPhase("Coletando certificados e documentos...");
      setProgress(10);

      const [
        { data: compliance },
        { data: certs },
        { data: audits },
        { data: ncs },
        { data: crew },
        { data: maintenance },
        { data: drills },
      ] = await Promise.all([
        fromUntyped("compliance_items").select("*").limit(100),
        fromUntyped("crew_certifications").select("*").limit(50),
        fromUntyped("internal_audits").select("*").order("created_at", { ascending: false }).limit(20),
        fromUntyped("non_conformities").select("*").order("created_at", { ascending: false }).limit(30),
        fromUntyped("crew_members").select("*").limit(50),
        fromUntyped("maintenance_records").select("*").order("created_at", { ascending: false }).limit(30),
        fromUntyped("corrective_actions").select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      setPhase("Analisando prontidão...");
      setProgress(40);

      const sgiData = {
        compliance_count: (compliance || []).length,
        compliant_count: (compliance || []).filter((c: any) => c.status === "compliant").length,
        cert_count: (certs || []).length,
        expired_certs: (certs || []).filter((c: any) => c.expiry_date && new Date(c.expiry_date) < new Date()).length,
        open_ncs: (ncs || []).filter((n: any) => n.status === "open").length,
        total_crew: (crew || []).length,
        overdue_maintenance: (maintenance || []).filter((m: any) => m.status === "overdue").length,
        pending_corrections: (drills || []).filter((d: any) => d.status !== "completed").length,
        last_audits: (audits || []).slice(0, 3).map((a: any) => ({ type: a.audit_type, date: a.scheduled_date, status: a.status })),
      };

      setPhase("Montando pacote de auditoria com IA...");
      setProgress(60);

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          messages: [
            {
              role: "system",
              content: `Você é um consultor marítimo sênior preparando um pacote completo para ${auditTypeName}.
Analise os dados do SGI e monte um relatório de prontidão detalhado.

Responda em JSON:
{
  "overall_readiness": 0-100,
  "sections": [
    {
      "title": "seção (ex: Certificados Estatutários)",
      "icon": "emoji",
      "status": "ready|partial|missing",
      "items": [
        {"name": "item", "status": "ok|warning|missing", "detail": "detalhe"}
      ],
      "readiness": 0-100
    }
  ],
  "executive_briefing": "briefing executivo em markdown",
  "risk_areas": ["área de risco 1", "..."],
  "crew_briefing_points": ["ponto para briefing da tripulação 1", "..."],
  "estimated_duration": "duração estimada da auditoria",
  "last_similar_inspection": "data/info da última inspeção similar"
}

Seções esperadas: Certificados Estatutários, SMS/Safety, Tripulação e STCW, Manutenção, Não Conformidades, Segurança (ISPS), Equipamentos de Emergência, Documentação SMS, Procedimentos Operacionais, Gestão Ambiental.`,
            },
            {
              role: "user",
              content: `Monte pacote de preparação para: ${auditTypeName}
Embarcação: ${vesselName || "N/A"}
Data planejada: ${auditDate || "A definir"}

DADOS SGI:
${JSON.stringify(sgiData, null, 2)}

Analise e monte o pacote completo.`,
            },
          ],
        },
      });

      if (error) throw error;

      setPhase("Finalizando pacote...");
      setProgress(90);

      const responseText = data?.choices?.[0]?.message?.content || "";
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAuditPackage({
          audit_type: auditTypeName,
          vessel: vesselName || "N/A",
          overall_readiness: parsed.overall_readiness || 0,
          sections: parsed.sections || [],
          executive_briefing: parsed.executive_briefing || "",
          risk_areas: parsed.risk_areas || [],
          crew_briefing_points: parsed.crew_briefing_points || [],
          estimated_duration: parsed.estimated_duration || "N/A",
          last_similar_inspection: parsed.last_similar_inspection || "N/A",
        });
      }

      setProgress(100);
      toast.success("Pacote de auditoria montado!");
    } catch (err) {
      logger.error("[OneClickAuditPrep]", err);
      toast.error("Erro ao montar pacote");
    } finally {
      setIsGenerating(false);
      setPhase("");
    }
  }, [selectedAuditType, vesselName, auditDate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": case "ok": return <CheckCircle className="h-4 w-4 text-success" />;
      case "partial": case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "missing": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getReadinessColor = (r: number) => {
    if (r >= 90) return "text-success";
    if (r >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-warning/20 to-success/10">
          <Package className="h-6 w-6 text-warning" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            One-Click Audit Prep
            <Badge className="bg-warning/20 text-warning text-xs">Pacote Automático</Badge>
          </h3>
          <p className="text-sm text-muted-foreground">
            Monta todo o pacote de preparação para auditoria em 1 clique
          </p>
        </div>
      </div>

      {/* Progress */}
      {isGenerating && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-5 w-5 animate-spin text-warning" />
              <span className="text-sm font-medium">{phase}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Setup */}
      {!auditPackage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configurar Pacote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Auditoria *</Label>
                <Select value={selectedAuditType} onValueChange={setSelectedAuditType}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {AUDIT_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Embarcação</Label>
                <Input value={vesselName} onChange={e => setVesselName(e.target.value)} placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label>Data Planejada</Label>
                <Input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} />
              </div>
            </div>
            <Button
              onClick={generateAuditPackage}
              disabled={isGenerating || !selectedAuditType}
              className="w-full gap-2 bg-gradient-to-r from-warning to-warning/80 text-warning-foreground"
              size="lg"
            >
              {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
              {isGenerating ? "Montando..." : "Montar Pacote Completo"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {auditPackage && (
        <>
          {/* Overall Readiness */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="py-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prontidão Geral</p>
                  <p className={`text-5xl font-bold ${getReadinessColor(auditPackage.overall_readiness)}`}>
                    {auditPackage.overall_readiness}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {auditPackage.audit_type} • {auditPackage.vessel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Duração Estimada</p>
                  <p className="text-lg font-semibold">{auditPackage.estimated_duration}</p>
                  <Button onClick={() => setAuditPackage(null)} size="sm" variant="outline" className="mt-2 gap-1">
                    <Package className="h-3 w-3" /> Novo Pacote
                  </Button>
                </div>
              </div>
              <Progress value={auditPackage.overall_readiness} className="mt-4 h-3" />
            </CardContent>
          </Card>

          {/* Executive Briefing */}
          {auditPackage.executive_briefing && (
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" /> Briefing Executivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{auditPackage.executive_briefing}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Sections */}
          <div className="space-y-3">
            {auditPackage.sections.map((section, si) => (
              <Card key={si}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {getStatusIcon(section.status)}
                      {section.title}
                    </CardTitle>
                    <Badge className={`${getReadinessColor(section.readiness)} bg-transparent border text-xs`}>
                      {section.readiness}%
                    </Badge>
                  </div>
                  <Progress value={section.readiness} className="h-1.5 mt-1" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-1.5">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2 text-sm">
                        {getStatusIcon(item.status)}
                        <span className="flex-1">{item.name}</span>
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Risk Areas & Crew Briefing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {auditPackage.risk_areas.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" /> Áreas de Risco
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {auditPackage.risk_areas.map((r, i) => (
                    <div key={`risk-${i}-${r.slice(0, 20)}`} className="flex items-start gap-2 text-sm mb-1.5">
                      <XCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {auditPackage.crew_briefing_points.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" /> Briefing da Tripulação
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {auditPackage.crew_briefing_points.map((p, i) => (
                    <div key={`brief-${i}-${p.slice(0, 20)}`} className="flex items-start gap-2 text-sm mb-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ComplianceOneClickAuditPrep;
