/**
 * Compliance Regulatory Change Tracker
 * Monitors and alerts on regulatory changes from IMO, ILO, Flag States, OCIMF, etc.
 * Uses AI to assess impact on the company's SMS and recommend actions.
 * ✅ P0-002: Real Supabase data from maritime_regulations table
 */

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import {
  Globe, AlertTriangle, CheckCircle, Clock, TrendingUp, Sparkles,
  FileText, Shield, Calendar, Loader2
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

const mapImpactLevel = (aiScore: number | null): RegulatoryChange["impactLevel"] => {
  if (aiScore === null) return "medium";
  if (aiScore >= 90) return "critical";
  if (aiScore >= 70) return "high";
  if (aiScore >= 40) return "medium";
  return "low";
};

const mapStatus = (status: string | null): RegulatoryChange["status"] => {
  switch (status) {
    case "compliant": return "completed";
    case "in_progress": return "implementing";
    case "non_compliant": return "assessed";
    default: return "new";
  }
};

const mapRegulationToChange = (reg: {
  id: string;
  title: string;
  description: string | null;
  regulation_type: string | null;
  due_date: string | null;
  ai_score: number | null;
  status: string | null;
  requirement_code: string | null;
}): RegulatoryChange => ({
  id: reg.id,
  source: reg.regulation_type || "IMO",
  title: reg.title,
  description: reg.description || "Sem descrição disponível.",
  effectiveDate: reg.due_date || new Date().toISOString().split("T")[0],
  impactLevel: mapImpactLevel(reg.ai_score),
  affectedAreas: [reg.regulation_type || "Compliance", reg.requirement_code || "Operations"].filter(Boolean),
  status: mapStatus(reg.status),
});

const EMPTY_CHANGES: RegulatoryChange[] = [];

export function ComplianceRegulatoryChangeTracker({
  moduleId,
  moduleName,
}: ComplianceRegulatoryChangeTrackerProps) {
  const { analyze } = useNautilusAI();
  const [selectedChange, setSelectedChange] = useState<RegulatoryChange | null>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: changes = EMPTY_CHANGES, isLoading: isLoadingData } = useQuery({
    queryKey: ["regulatory-changes", moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maritime_regulations")
        .select("id, title, description, regulation_type, due_date, ai_score, status, requirement_code")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        logger.warn("Failed to fetch maritime_regulations", { error: error.message });
        return EMPTY_CHANGES;
      }

      if (!data || data.length === 0) return EMPTY_CHANGES;
      return data.map(mapRegulationToChange);
    },
    staleTime: 5 * 60 * 1000,
  });

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
    }
    setIsAnalyzing(false);
  }, [analyze, moduleId, moduleName]);

  const stats = {
    total: changes.length,
    critical: changes.filter(c => c.impactLevel === "critical").length,
    new: changes.filter(c => c.status === "new").length,
    implementing: changes.filter(c => c.status === "implementing").length,
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando mudanças regulatórias...</span>
      </div>
    );
  }

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
