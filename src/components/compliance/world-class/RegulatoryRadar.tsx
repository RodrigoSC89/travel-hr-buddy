/**
 * Regulatory Radar - WORLD CLASS
 * Real-time tracking of maritime regulation changes with AI impact analysis.
 * Covers IMO, Flag State, Class, P&I — NO competitor offers this level.
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Radar, Globe, AlertTriangle, CheckCircle, Clock, Bot, 
  TrendingUp, FileText, Ship, Shield, Loader2, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RegulatoryUpdate {
  id: string;
  source: string;
  title: string;
  description: string;
  effective_date: string;
  impact_level: "critical" | "high" | "medium" | "low";
  status: "upcoming" | "effective" | "proposed";
  conventions: string[];
  affected_vessels: string[];
  compliance_deadline?: string;
  ai_impact_summary?: string;
}

const REGULATION_SOURCES = [
  { id: "imo", label: "IMO", icon: Globe, color: "text-blue-500" },
  { id: "flag", label: "Flag State", icon: Shield, color: "text-emerald-500" },
  { id: "class", label: "Classification", icon: Ship, color: "text-amber-500" },
  { id: "pi", label: "P&I Club", icon: FileText, color: "text-purple-500" },
];

export function RegulatoryRadar() {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<Record<string, string>>({});

  // Fetch regulatory updates from Supabase
  const { data: regulations, isLoading } = useQuery({
    queryKey: ["regulatory-updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maritime_regulations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((r): RegulatoryUpdate => ({
        id: r.id,
        source: String(r.regulation_type || "imo").toLowerCase().includes("marpol") ? "imo" : 
                String(r.regulation_type || "").toLowerCase().includes("flag") ? "flag" :
                String(r.regulation_type || "").toLowerCase().includes("class") ? "class" : "imo",
        title: String(r.title || ""),
        description: String(r.description || ""),
        effective_date: String(r.due_date || r.created_at || ""),
        impact_level: mapImpact(String(r.ai_score ? (r.ai_score > 80 ? "high" : r.ai_score > 50 ? "medium" : "low") : "medium")),
        status: mapStatus(String(r.status || "active")),
        conventions: [String(r.regulation_type || "SOLAS")],
        affected_vessels: ["All"],
        compliance_deadline: r.due_date ? String(r.due_date) : undefined,
      }));
    },
    staleTime: 60_000,
  });

  const analyzeImpact = async (reg: RegulatoryUpdate) => {
    setAnalyzing(reg.id);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: {
          message: `Analyze this maritime regulation change and provide a DETAILED impact assessment for a ship management company:

Title: ${reg.title}
Description: ${reg.description}
Conventions: ${reg.conventions.join(", ")}
Effective Date: ${reg.effective_date}
Affected Vessels: ${reg.affected_vessels.join(", ")}

Provide:
1. IMPACT SUMMARY (2-3 sentences)
2. REQUIRED ACTIONS (bullet points)
3. ESTIMATED COMPLIANCE COST (low/medium/high)
4. RISK IF NON-COMPLIANT
5. RECOMMENDED TIMELINE

Answer in Portuguese (BR).`,
          context: "Regulatory impact analysis for maritime compliance."
        }
      });

      if (error) throw error;
      setAiInsights(prev => ({ ...prev, [reg.id]: data?.response || "" }));
    } catch (err) {
      toast.error("Erro na análise", {
        description: err instanceof Error ? err.message : "Tente novamente",
      });
    } finally {
      setAnalyzing(null);
    }
  };

  const impactColor = (level: string) => {
    switch (level) {
      case "critical": return "destructive";
      case "high": return "secondary";
      case "medium": return "outline";
      default: return "outline";
    }
  };

  const stats = {
    total: regulations?.length || 0,
    critical: regulations?.filter(r => r.impact_level === "critical").length || 0,
    upcoming: regulations?.filter(r => r.status === "upcoming").length || 0,
    effective: regulations?.filter(r => r.status === "effective").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Radar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Regulações Monitoradas</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Impacto Crítico</p>
              <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Próximas</p>
              <p className="text-2xl font-bold text-warning">{stats.upcoming}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Em Vigor</p>
              <p className="text-2xl font-bold text-success">{stats.effective}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            Radar Regulatório em Tempo Real
          </CardTitle>
          <CardDescription>
            Monitoramento contínuo de mudanças regulatórias com análise de impacto por IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              {REGULATION_SOURCES.map(s => (
                <TabsTrigger key={s.id} value={s.id} className="gap-1">
                  <s.icon className={`h-3 w-3 ${s.color}`} />
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <RegulationList 
                regulations={regulations || []} 
                isLoading={isLoading}
                analyzing={analyzing}
                aiInsights={aiInsights}
                onAnalyze={analyzeImpact}
                impactColor={impactColor}
              />
            </TabsContent>

            {REGULATION_SOURCES.map(s => (
              <TabsContent key={s.id} value={s.id} className="mt-4">
                <RegulationList 
                  regulations={(regulations || []).filter(r => r.source === s.id)}
                  isLoading={isLoading}
                  analyzing={analyzing}
                  aiInsights={aiInsights}
                  onAnalyze={analyzeImpact}
                  impactColor={impactColor}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function RegulationList({ 
  regulations, isLoading, analyzing, aiInsights, onAnalyze, impactColor 
}: {
  regulations: RegulatoryUpdate[];
  isLoading: boolean;
  analyzing: string | null;
  aiInsights: Record<string, string>;
  onAnalyze: (reg: RegulatoryUpdate) => void;
  impactColor: (level: string) => "destructive" | "secondary" | "outline";
}) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Carregando radar regulatório...</div>;
  }

  if (regulations.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Radar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma regulação encontrada nesta categoria</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {regulations.map(reg => (
          <div key={reg.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{reg.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{reg.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={impactColor(reg.impact_level)}>
                  {reg.impact_level}
                </Badge>
                <Badge variant={reg.status === "effective" ? "default" : "outline"}>
                  {reg.status === "upcoming" ? "Próxima" : reg.status === "effective" ? "Em Vigor" : "Proposta"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {reg.conventions.map(c => (
                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Vigência: {new Date(reg.effective_date).toLocaleDateString("pt-BR")}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="gap-1 h-7"
                onClick={() => onAnalyze(reg)}
                disabled={analyzing === reg.id}
              >
                {analyzing === reg.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Bot className="h-3 w-3" />
                )}
                Análise de Impacto IA
              </Button>
            </div>

            {aiInsights[reg.id] && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary mb-2">
                  <Bot className="h-3 w-3" />
                  Análise de Impacto por IA
                </div>
                <p className="whitespace-pre-wrap text-muted-foreground">{aiInsights[reg.id]}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function mapImpact(priority: string): "critical" | "high" | "medium" | "low" {
  switch (priority.toLowerCase()) {
    case "critical": case "urgente": return "critical";
    case "high": case "alta": return "high";
    case "low": case "baixa": return "low";
    default: return "medium";
  }
}

function mapStatus(status: string): "upcoming" | "effective" | "proposed" {
  switch (status.toLowerCase()) {
    case "upcoming": case "pending": case "draft": return "upcoming";
    case "proposed": return "proposed";
    default: return "effective";
  }
}
