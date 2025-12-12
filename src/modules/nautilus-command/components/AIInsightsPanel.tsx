/**
import { useState, useMemo, useCallback } from "react";;
 * AI Insights Panel - Painel de Insights com IA
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Sparkles, Brain, TrendingUp, AlertTriangle, Target,
  FileText, RefreshCw, Loader2, CheckCircle, Clock,
  Download, Share2, Eye, Zap
} from "lucide-react";
import { useNautilusCommandAI, SystemContext } from "../hooks/useNautilusCommandAI";

interface AIInsightsPanelProps {
  context: SystemContext;
}

export const AIInsightsPanel = memo(function({ context }: AIInsightsPanelProps) {
  const { 
    generateBriefing, 
    analyzeAlerts, 
    suggestActions, 
    get360View,
    isLoading 
  } = useNautilusCommandAI();
  
  const [activeInsight, setActiveInsight] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (action: string, generator: () => Promise<string | null>) => {
    setLoadingAction(action);
    try {
      const result = await generator();
      if (result) {
        setInsights(prev => ({ ...prev, [action]: result }));
        setActiveInsight(action);
        toast.success(`${action} gerado com sucesso!`);
      }
    } catch (error) {
      toast.error("Erro ao gerar análise");
    } finally {
      setLoadingAction(null);
    }
  };

  const exportInsight = (content: string, title: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Insight exportado!");
  };

  const quickActions = [
    {
      id: "briefing",
      label: "Briefing Diário",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Resumo executivo do dia",
      action: () => handleAction("Briefing Diário", () => generateBriefing(context))
    },
    {
      id: "alerts",
      label: "Alertas Críticos",
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      description: "Análise de alertas ativos",
      action: () => handleAction("Alertas Críticos", () => analyzeAlerts(context))
    },
    {
      id: "actions",
      label: "Ações Prioritárias",
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Sugestões de ações",
      action: () => handleAction("Ações Prioritárias", () => suggestActions(context))
    },
    {
      id: "360",
      label: "Visão 360°",
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Visão completa da operação",
      action: () => handleAction("Visão 360°", () => get360View(context))
    }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <span className="text-base">Insights IA</span>
            <Badge variant="secondary" className="ml-2 text-[10px]">
              <Zap className="h-3 w-3 mr-1" />
              Tempo Real
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-3 space-y-4">
        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 flex-shrink-0">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isThisLoading = loadingAction === action.label;
            
            return (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto py-3 flex flex-col items-center gap-1 hover:border-primary ${action.bgColor}`}
                onClick={action.action}
                disabled={isLoading}
              >
                <div className={`p-2 rounded-lg ${action.bgColor}`}>
                  {isThisLoading ? (
                    <Loader2 className={`h-5 w-5 animate-spin ${action.color}`} />
                  ) : (
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  )}
                </div>
                <span className="text-xs font-medium">{action.label}</span>
                <span className="text-[10px] text-muted-foreground">{action.description}</span>
              </Button>
            );
          })}
        </div>

        {/* Results Area */}
        {activeInsight && insights[activeInsight] && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{activeInsight}</span>
                <Badge variant="outline" className="text-[10px]">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                  Gerado
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7"
                  onClick={() => handleexportInsight}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Exportar
                </Button>
                <Button variant="ghost" size="sm" className="h-7">
                  <Share2 className="h-3 w-3 mr-1" />
                  Compartilhar
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 rounded-lg bg-muted/50 p-3">
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                {insights[activeInsight]}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground flex-shrink-0">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Gerado em {new Date().toLocaleTimeString()}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => {
                  const action = quickActions.find(a => a.label === activeInsight);
                  if (action) action.action();
                }}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!activeInsight && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/30" />
              <p className="text-sm text-muted-foreground">
                Selecione uma ação para gerar insights
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
