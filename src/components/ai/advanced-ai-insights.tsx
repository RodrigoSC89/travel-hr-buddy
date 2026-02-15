/**
 * Advanced AI Insights - Connected to ai_insights table
 */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain, TrendingUp, Lightbulb, Target, AlertTriangle,
  CheckCircle, Zap, BarChart3, Activity, Clock, Sparkles,
  RefreshCw, Loader2
} from "lucide-react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { InsightImplementationDialog } from "@/components/dialogs/InsightImplementationDialog";

interface SelectedInsight {
  id: number;
  title: string;
  description: string;
  recommendations: string[];
  estimatedSavings: string;
  confidence: number;
}

const AdvancedAIInsights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("insights");
  const [implementDialogOpen, setImplementDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<SelectedInsight | undefined>(undefined);

  const { data: aiInsights = [], isLoading } = useQuery({
    queryKey: ["advanced-ai-insights"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []).map((i, idx) => ({
        id: idx + 1,
        dbId: i.id,
        title: i.title,
        description: i.description,
        confidence: Math.round(i.confidence * 100),
        impact: i.priority === "high" ? "high" : i.priority === "medium" ? "medium" : "low",
        category: i.category || "general",
        recommendations: Array.isArray((i.metadata as any)?.recommendations)
          ? (i.metadata as any).recommendations
          : ["Analisar dados detalhados", "Implementar ação corretiva"],
        estimatedSavings: (i.metadata as any)?.savings || i.impact_value || "N/A",
        status: i.status === "read" ? "active" : "new",
      }));
    },
    staleTime: 60_000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (dbId: string) => {
      await supabase.from("ai_insights").update({ status: "read" }).eq("id", dbId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["advanced-ai-insights"] }),
  });

  const getImpactConfig = (impact: string) => {
    switch (impact) {
      case "high": return { color: "text-destructive", bg: "bg-destructive/10", label: "Alto Impacto" };
      case "medium": return { color: "text-warning", bg: "bg-warning/10", label: "Médio Impacto" };
      default: return { color: "text-primary", bg: "bg-primary/10", label: "Baixo Impacto" };
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "efficiency": return <Zap className="h-5 w-5 text-warning" />;
      case "safety": return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case "compliance": return <CheckCircle className="h-5 w-5 text-success" />;
      default: return <Brain className="h-5 w-5 text-primary" />;
    }
  };

  const radarData = [
    { metric: "Eficiência", value: 85 },
    { metric: "Segurança", value: 90 },
    { metric: "Compliance", value: 92 },
    { metric: "Qualidade", value: 88 },
    { metric: "Custo", value: 78 },
  ];

  // Override with real data if available
  if (aiInsights.length > 0) {
    const avgConfidence = Math.round(aiInsights.reduce((s, i) => s + i.confidence, 0) / aiInsights.length);
    radarData[0].value = avgConfidence;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              AI Insights Avançados
              <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1" />{aiInsights.length} insights</Badge>
            </h2>
            <p className="text-sm text-muted-foreground">Análises inteligentes em tempo real</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["advanced-ai-insights"] })}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Total Insights</p>
          <p className="text-2xl font-bold">{aiInsights.length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Alto Impacto</p>
          <p className="text-2xl font-bold text-destructive">{aiInsights.filter(i => i.impact === "high").length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Novos</p>
          <p className="text-2xl font-bold text-primary">{aiInsights.filter(i => i.status === "new").length}</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">Confiança Média</p>
          <p className="text-2xl font-bold">{aiInsights.length > 0 ? Math.round(aiInsights.reduce((s, i) => s + i.confidence, 0) / aiInsights.length) : 0}%</p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights"><Lightbulb className="h-4 w-4 mr-2" />Insights</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="h-4 w-4 mr-2" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />)}</div>
          ) : aiInsights.length === 0 ? (
            <Card><CardContent className="py-12 text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Nenhum insight disponível. O sistema gera insights automaticamente.</p>
            </CardContent></Card>
          ) : (
            aiInsights.map((insight) => {
              const impactConfig = getImpactConfig(insight.impact);
              return (
                <Card key={insight.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(insight.category)}
                        <div>
                          <CardTitle className="text-base">{insight.title}</CardTitle>
                          <CardDescription>{insight.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={impactConfig.bg + " " + impactConfig.color}>{impactConfig.label}</Badge>
                        {insight.status === "new" && <Badge variant="destructive" className="animate-pulse">Novo</Badge>}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confiança:</span>
                        <Progress value={insight.confidence} className="h-2 flex-1" />
                        <span className="text-xs font-medium">{insight.confidence}%</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {insight.recommendations.slice(0, 3).map((rec: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">💡 {rec}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Savings: {insight.estimatedSavings}</span>
                        <div className="flex gap-2">
                          {insight.status === "new" && (
                            <Button size="sm" variant="ghost" onClick={() => markReadMutation.mutate(insight.dbId)}>
                              <CheckCircle className="h-4 w-4 mr-1" />Marcar como lido
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInsight({
                                id: insight.id,
                                title: insight.title,
                                description: insight.description,
                                recommendations: insight.recommendations,
                                estimatedSavings: insight.estimatedSavings,
                                confidence: insight.confidence,
                              });
                              setImplementDialogOpen(true);
                            }}
                          >
                            <Zap className="h-4 w-4 mr-1" />Implementar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Performance da IA</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {implementDialogOpen && selectedInsight && (
        <InsightImplementationDialog
          open={implementDialogOpen}
          onOpenChange={setImplementDialogOpen}
          insight={selectedInsight}
        />
      )}
    </div>
  );
};

export default AdvancedAIInsights;
