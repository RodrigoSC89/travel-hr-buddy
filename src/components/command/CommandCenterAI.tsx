/**
 * Command Center AI - Centro de Comando Unificado
 * Dashboard inteligente com visão 360° de toda operação
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import { AIModuleEnhancer } from "@/components/ai/AIModuleEnhancer";
import {
  Brain, Ship, Users, Wrench, Shield, DollarSign, 
  AlertTriangle, TrendingUp, Activity, Sparkles, Zap, LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";

export function CommandCenterAI() {
  const { analyze, isLoading } = useNautilusAI();
  const [briefing, setBriefing] = useState<string>("");

  const generateBriefing = async () => {
    const result = await analyze("command", `
      Gere um briefing executivo do dia considerando:
      - Status da frota (5 embarcações ativas)
      - Tripulação (45 pessoas a bordo, 2 alertas de fadiga)
      - Manutenção (3 pendências, 1 crítica)
      - Compliance (Score 92%, auditoria PEO-DP em 15 dias)
      - Financeiro (Budget on track, OPEX +5%)
      
      Priorize alertas e sugira ações para hoje.
    `);
    if (result) {
      setBriefing(result.response);
      toast.success("Briefing gerado!");
    }
  };

  const kpis = [
    { label: "Embarcações Ativas", value: "5/6", icon: Ship, color: "text-blue-500", trend: "stable" },
    { label: "Tripulação a Bordo", value: "45", icon: Users, color: "text-green-500", trend: "up" },
    { label: "Manutenções Pendentes", value: "3", icon: Wrench, color: "text-orange-500", trend: "down" },
    { label: "Score Compliance", value: "92%", icon: Shield, color: "text-purple-500", trend: "up" },
    { label: "OPEX vs Budget", value: "+5%", icon: DollarSign, color: "text-yellow-500", trend: "warning" },
    { label: "Alertas Ativos", value: "4", icon: AlertTriangle, color: "text-red-500", trend: "attention" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-slate-500/20 to-zinc-500/20 rounded-xl">
            <LayoutDashboard className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Command Center
              <Badge className="bg-gradient-to-r from-slate-500 to-zinc-500">
                <Sparkles className="h-3 w-3 mr-1" />
                Visão 360°
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Dashboard unificado • Alertas inteligentes • Decisão assistida
            </p>
          </div>
        </div>
        <Button onClick={generateBriefing} disabled={isLoading}>
          <Zap className="h-4 w-4 mr-2" />
          Gerar Briefing IA
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                <div>
                  <p className="text-xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview"><Activity className="h-4 w-4 mr-2" />Visão Geral</TabsTrigger>
          <TabsTrigger value="ai-assistant"><Brain className="h-4 w-4 mr-2" />Assistente IA</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {briefing ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Briefing Executivo
                  <Badge variant="outline"><Brain className="h-3 w-3 mr-1" />IA</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {briefing}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Clique em "Gerar Briefing IA" para uma análise completa</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-assistant">
          <AIModuleEnhancer
            module="command"
            title="Assistente Command Center"
            description="Pergunte sobre qualquer aspecto da operação"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommandCenterAI;
