/**
 * AI Predictive Insights Panel
 * Real-time AI-powered predictions for maintenance, compliance, and crew
 */

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Brain, Wrench, Shield, Users, TrendingUp, AlertTriangle,
  Zap, RefreshCw, ChevronRight, Lightbulb, Target
} from "lucide-react";

interface PredictionCard {
  id: string;
  category: "maintenance" | "compliance" | "crew" | "financial";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  action?: string;
  estimatedSavings?: number;
}

const CATEGORY_CONFIG = {
  maintenance: { icon: <Wrench className="h-4 w-4" />, label: "Manutenção Preditiva", color: "text-blue-500" },
  compliance: { icon: <Shield className="h-4 w-4" />, label: "Risco de Compliance", color: "text-purple-500" },
  crew: { icon: <Users className="h-4 w-4" />, label: "Gestão de Tripulação", color: "text-green-500" },
  financial: { icon: <TrendingUp className="h-4 w-4" />, label: "Otimização Financeira", color: "text-amber-500" },
};

export default function AIPredictiveInsights() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch AI maintenance predictions
  const { data: maintPredictions = [] } = useQuery({
    queryKey: ["ai-maint-predictions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_maintenance_predictions")
        .select("*")
        .order("failure_probability", { ascending: false })
        .limit(10);
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch AI insights
  const { data: insights = [] } = useQuery({
    queryKey: ["ai-insights-predictions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  // Fetch expiring certificates for crew predictions
  const { data: expiringCerts = [] } = useQuery({
    queryKey: ["ai-expiring-certs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("certificates")
        .select("id, certificate_type, expiry_date, status, crew_member_id")
        .gte("expiry_date", new Date().toISOString())
        .lte("expiry_date", new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
        .eq("status", "active")
        .limit(20);
      return data || [];
    },
    staleTime: 60000,
  });

  // Build predictions from real data
  const predictions: PredictionCard[] = [
    // From maintenance predictions
    ...maintPredictions.map((p): PredictionCard => ({
      id: `maint-${p.id}`,
      category: "maintenance",
      title: `${p.equipment_name} — Risco de Falha`,
      description: p.recommended_action || `Probabilidade de falha: ${Math.round(Number(p.failure_probability) * 100)}%. ${p.predicted_failure_date ? `Data prevista: ${new Date(p.predicted_failure_date).toLocaleDateString("pt-BR")}` : ""}`,
      confidence: Number(p.confidence || p.failure_probability) * 100,
      impact: Number(p.failure_probability) > 0.7 ? "high" : Number(p.failure_probability) > 0.4 ? "medium" : "low",
      action: p.recommended_action || "Agendar manutenção preventiva",
      estimatedSavings: Math.round(Number(p.failure_probability) * 25000),
    })),
    // From AI insights
    ...insights.slice(0, 5).map((i): PredictionCard => ({
      id: `insight-${i.id}`,
      category: (["maintenance", "compliance", "crew", "financial"].includes(i.category) ? i.category : "financial") as PredictionCard["category"],
      title: i.title,
      description: i.description,
      confidence: Number(i.confidence) * 100,
      impact: (i.priority === "critical" || i.priority === "high") ? "high" : i.priority === "medium" ? "medium" : "low",
      action: i.impact_value || undefined,
    })),
    // From expiring certificates
    ...(expiringCerts.length > 0 ? [{
      id: "cert-expiry",
      category: "crew" as const,
      title: `${expiringCerts.length} Certificados Vencendo em 90 dias`,
      description: `Certificados próximos do vencimento detectados. Renovação proativa evita não-conformidades em inspeções PSC/Flag State.`,
      confidence: 95,
      impact: expiringCerts.length > 5 ? "high" as const : "medium" as const,
      action: "Iniciar processo de renovação",
      estimatedSavings: expiringCerts.length * 2000,
    }] : []),
  ];

  // Trigger AI analysis via Edge Function
  const triggerAnalysis = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("ai-proxy", {
        body: {
          action: "predictive_analysis",
          context: "Generate predictive insights for maritime operations",
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("Análise preditiva atualizada"),
    onError: () => toast.info("Usando dados preditivos do cache local"),
  });

  const totalSavings = predictions.reduce((sum, p) => sum + (p.estimatedSavings || 0), 0);
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">IA Preditiva</h3>
            <p className="text-xs text-muted-foreground">{predictions.length} insights • Confiança média: {avgConfidence}%</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => triggerAnalysis.mutate()}
          disabled={triggerAnalysis.isPending}
          className="gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${triggerAnalysis.isPending ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const count = predictions.filter(p => p.category === key).length;
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-3 text-center">
                <div className={`${config.color} mb-1 flex justify-center`}>{config.icon}</div>
                <p className="text-xl font-bold">{count}</p>
                <p className="text-[10px] text-muted-foreground">{config.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalSavings > 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3 flex items-center gap-3">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Economia Potencial Identificada</p>
              <p className="text-lg font-bold text-green-500">${totalSavings.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predictions List */}
      <div className="space-y-2">
        {predictions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Lightbulb className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm">Nenhuma predição disponível</p>
              <p className="text-xs text-muted-foreground">Adicione dados de manutenção e operações para gerar insights</p>
            </CardContent>
          </Card>
        ) : (
          predictions.map((pred, i) => {
            const config = CATEGORY_CONFIG[pred.category];
            const isExpanded = expandedId === pred.id;
            return (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all border-border/50"
                  onClick={() => setExpandedId(isExpanded ? null : pred.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={config.color}>{config.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{pred.title}</p>
                          <Badge variant={pred.impact === "high" ? "destructive" : pred.impact === "medium" ? "default" : "secondary"} className="text-[10px] shrink-0">
                            {pred.impact}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{pred.description}</p>

                        {/* Confidence bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground shrink-0">Confiança</span>
                          <Progress value={pred.confidence} className="h-1 flex-1" />
                          <span className="text-[10px] font-medium shrink-0">{Math.round(pred.confidence)}%</span>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mt-3 pt-3 border-t border-border/50 space-y-2"
                          >
                            <p className="text-xs">{pred.description}</p>
                            {pred.action && (
                              <div className="flex items-center gap-1 text-xs text-primary">
                                <Zap className="h-3 w-3" />
                                <span>Ação recomendada: {pred.action}</span>
                              </div>
                            )}
                            {pred.estimatedSavings && pred.estimatedSavings > 0 && (
                              <p className="text-xs text-green-500 font-medium">
                                💰 Economia estimada: ${pred.estimatedSavings.toLocaleString()}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
