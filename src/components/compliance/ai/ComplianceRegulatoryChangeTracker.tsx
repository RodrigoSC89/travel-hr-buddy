/**
 * Compliance Regulatory Change Tracker
 * Monitors and alerts on regulatory changes from IMO, ILO, Flag States, OCIMF, etc.
 * Uses AI to assess impact on the company's SMS and recommend actions.
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { toast } from "sonner";
import {
  Globe, AlertTriangle, CheckCircle, Clock, TrendingUp, Sparkles,
  FileText, Shield, Calendar, ArrowRight, Loader2, RefreshCw
} from "lucide-react";

export interface ComplianceRegulatoryChangeTrackerProps {
  moduleId: string;
  moduleName: string;
}

interface RegulatoryChange {
  id: string;
  source: string;
  title: string;
  description: string;
  effectiveDate: string;
  impactLevel: "critical" | "high" | "medium" | "low";
  affectedAreas: string[];
  status: "new" | "assessed" | "implementing" | "completed";
  aiRecommendation?: string;
}

const MOCK_RECENT_CHANGES: RegulatoryChange[] = [
  {
    id: "RC-001",
    source: "IMO MEPC 83",
    title: "Revised MARPOL Annex VI - CII Rating Adjustments",
    description: "Updated Carbon Intensity Indicator calculation methods and correction factors for 2026-2030.",
    effectiveDate: "2026-01-01",
    impactLevel: "high",
    affectedAreas: ["Environmental", "Operations", "Reporting"],
    status: "assessed",
  },
  {
    id: "RC-002",
    source: "IMO MSC 109",
    title: "SOLAS Chapter V - ECDIS Software Standards Update",
    description: "New requirements for ECDIS software validation and chart update protocols.",
    effectiveDate: "2026-07-01",
    impactLevel: "medium",
    affectedAreas: ["Navigation", "Training", "Documentation"],
    status: "new",
  },
  {
    id: "RC-003",
    source: "ILO MLC Amendment",
    title: "MLC 2006 Amendments - Mental Health Provisions",
    description: "Enhanced requirements for crew mental health support, shore leave policies, and onboard connectivity.",
    effectiveDate: "2026-06-01",
    impactLevel: "high",
    affectedAreas: ["Crew Welfare", "Medical", "HR Policy"],
    status: "new",
  },
  {
    id: "RC-004",
    source: "OCIMF",
    title: "SIRE 2.0 VIQ 8 - Updated Inspection Protocol",
    description: "New vessel inspection questionnaire version with enhanced focus on cybersecurity and environmental compliance.",
    effectiveDate: "2026-03-01",
    impactLevel: "critical",
    affectedAreas: ["Vetting", "Cybersecurity", "Operations", "Documentation"],
    status: "implementing",
  },
  {
    id: "RC-005",
    source: "Flag State (Liberia)",
    title: "Marine Notice 2026-001 - Ballast Water Management",
    description: "Updated compliance schedule for D-2 standard implementation on existing vessels.",
    effectiveDate: "2026-09-01",
    impactLevel: "medium",
    affectedAreas: ["Environmental", "Maintenance", "Documentation"],
    status: "new",
  },
];

export function ComplianceRegulatoryChangeTracker({
  moduleId,
  moduleName,
}: ComplianceRegulatoryChangeTrackerProps) {
  const { analyze, isLoading } = useNautilusAI();
  const [changes, setChanges] = useState<RegulatoryChange[]>(MOCK_RECENT_CHANGES);
  const [selectedChange, setSelectedChange] = useState<RegulatoryChange | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getImpactColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-destructive/20 text-destructive";
      case "high": return "bg-warning/20 text-warning";
      case "medium": return "bg-primary/20 text-primary";
      case "low": return "bg-success/20 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "assessed": return <FileText className="h-4 w-4 text-primary" />;
      case "implementing": return <Clock className="h-4 w-4 text-warning" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-success" />;
      default: return null;
    }
  };

  const handleAnalyzeImpact = useCallback(async (change: RegulatoryChange) => {
    setSelectedChange(change);
    setIsAnalyzing(true);
    setImpactAnalysis("");

    const result = await analyze("qhse", 
      `Analise o impacto desta mudança regulatória no SMS da empresa e no módulo ${moduleName}:

MUDANÇA: ${change.title}
FONTE: ${change.source}  
DESCRIÇÃO: ${change.description}
DATA EFETIVA: ${change.effectiveDate}
ÁREAS AFETADAS: ${change.affectedAreas.join(", ")}

Forneça:
1. ANÁLISE DE IMPACTO detalhada no SMS e operações
2. GAPS identificados entre prática atual e novo requisito
3. PLANO DE AÇÃO com cronograma e responsáveis
4. DOCUMENTOS que precisam ser revisados/atualizados
5. TREINAMENTOS necessários para a tripulação
6. RISCOS de não-conformidade e possíveis penalidades
7. ESTIMATIVA DE CUSTO para implementação`,
      { moduleId, change }
    );

    if (result?.response) {
      setImpactAnalysis(result.response);
      setChanges(prev => prev.map(c => 
        c.id === change.id ? { ...c, status: "assessed" as const, aiRecommendation: result.response } : c
      ));
    }
    setIsAnalyzing(false);
  }, [analyze, moduleId, moduleName]);

  const stats = {
    total: changes.length,
    critical: changes.filter(c => c.impactLevel === "critical").length,
    new: changes.filter(c => c.status === "new").length,
    implementing: changes.filter(c => c.status === "implementing").length,
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Mudanças Rastreadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
                <p className="text-xs text-muted-foreground">Impacto Crítico</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">{stats.new}</p>
                <p className="text-xs text-muted-foreground">Novas (Não Avaliadas)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.implementing}</p>
                <p className="text-xs text-muted-foreground">Em Implementação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Changes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Mudanças Regulatórias Recentes
            </CardTitle>
            <CardDescription>
              Monitoramento em tempo real de IMO, ILO, Flag States, OCIMF e classificadoras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {changes.map((change) => (
                  <div
                    key={change.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      selectedChange?.id === change.id ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedChange(change)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(change.status)}
                          <Badge variant="outline" className="text-xs">{change.source}</Badge>
                          <Badge className={`text-xs ${getImpactColor(change.impactLevel)}`}>
                            {change.impactLevel}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{change.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{change.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Efetiva: {change.effectiveDate}</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleAnalyzeImpact(change); }}
                        disabled={isAnalyzing}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {change.affectedAreas.map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">{area}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Impact Analysis Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Análise de Impacto IA
            </CardTitle>
            <CardDescription>
              Análise automática de impacto no SMS e recomendações de ação
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analisando impacto regulatório com IA...</p>
                <p className="text-xs text-muted-foreground">Cruzando com dados do SGI da empresa</p>
              </div>
            ) : impactAnalysis ? (
              <ScrollArea className="h-[500px]">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-primary/5 rounded-lg p-3 mb-4">
                    <p className="font-medium text-sm">{selectedChange?.title}</p>
                    <p className="text-xs text-muted-foreground">{selectedChange?.source} • Efetiva: {selectedChange?.effectiveDate}</p>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">{impactAnalysis}</div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                <Shield className="h-12 w-12 opacity-30" />
                <p className="text-sm">Selecione uma mudança regulatória e clique em</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm">para analisar o impacto com IA</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
