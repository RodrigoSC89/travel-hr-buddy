/**
 * LVS Action Plan Generator - AI-powered corrective action plan for acceptance gaps
 */
import React, { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ClipboardList, Brain, Loader2, Target, Calendar, Users,
  AlertTriangle, CheckCircle2, ArrowRight, Download, Sparkles
} from "lucide-react";
import { ALL_LVS_SECTIONS, type Section, type ItemStatus } from "./lvs-data";
import { useNautilusAI } from "@/hooks/useNautilusAI";
import ReactMarkdown from "react-markdown";

interface LVSActionPlanGeneratorProps {
  onSavePlan?: (title: string, content: string, scope: string, priority: string, gapCount: number, estimatedDays: number) => Promise<any>;
}

const STATUS_CONFIG: Record<ItemStatus, { label: string }> = {
  approved: { label: "Aprovado" },
  pending: { label: "Pendente" },
  rejected: { label: "Rejeitado" },
  not_applicable: { label: "N/A" },
  not_verified: { label: "Não Verificado" },
};

interface ActionPlan {
  id: string;
  title: string;
  scope: string;
  generatedAt: string;
  content: string;
  gapCount: number;
  estimatedDays: number;
}

export function LVSActionPlanGenerator({ onSavePlan }: LVSActionPlanGeneratorProps = {}) {
  const { generate, isLoading } = useNautilusAI();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [activePlan, setActivePlan] = useState<ActionPlan | null>(null);
  const [scope, setScope] = useState("all");
  const [priority, setPriority] = useState("critical_first");

  const gaps = useMemo(() => {
    const allItems = ALL_LVS_SECTIONS.flatMap(s =>
      s.subsections.flatMap(ss =>
        ss.items.filter(i => i.status === "pending" || i.status === "rejected" || i.status === "not_verified")
          .map(i => ({ ...i, sectionCode: s.code, sectionTitle: s.title, etRef: s.etRef }))
      )
    );

    if (scope === "all") return allItems;
    return allItems.filter(i => i.etRef === scope);
  }, [scope]);

  const generatePlan = useCallback(async () => {
    if (gaps.length === 0) {
      toast.info("Nenhum gap encontrado para o escopo selecionado");
      return;
    }

    const gapSummary = gaps.slice(0, 60).map(g =>
      `[${g.ref}] ${g.question} — Status: ${STATUS_CONFIG[g.status].label}${g.pendency ? ` — Pendência: ${g.pendency}` : ""} — Seção: ${g.sectionCode}`
    ).join("\n");

    const result = await generate("peodp",
      `Você é um Gerente de Projetos especialista em aceitação de embarcações RSV Petrobras (ET-3000.00-1500-91C-PLL-017).

CONTEXTO: Temos ${gaps.length} itens pendentes/rejeitados na LVS de Aceitação.
Priorização: ${priority === "critical_first" ? "Itens críticos e rejeitados primeiro" : "Por ET/seção sequencial"}

GAPS PARA PLANO DE AÇÃO:
${gapSummary}

GERE UM PLANO DE AÇÃO COMPLETO COM:

1. **Resumo Executivo**: Visão geral dos gaps e estimativa de prazo
2. **Matriz de Responsabilidades**: Quem deve resolver cada categoria de gap
   - Comandante, Chefe de Máquinas, DPO, Safety Officer, Superintendente, etc.
3. **Cronograma Detalhado**: 
   - Semana 1-2: Ações imediatas (documentos faltantes, testes pendentes)
   - Semana 3-4: Correções técnicas (equipamentos, sistemas)
   - Semana 5+: Validação final e re-inspeção
4. **Ações Corretivas por Item**: Para cada gap, especifique:
   - Ação necessária
   - Responsável sugerido
   - Prazo estimado
   - Evidência esperada
   - Risco se não resolvido
5. **Recursos Necessários**: Materiais, certificados, serviços terceirizados
6. **Checklist de Validação**: Lista de verificação pré-inspeção final
7. **KPIs de Acompanhamento**: Métricas para monitorar o progresso

Use tabelas markdown e formatação clara. Seja específico e prático.`,
      { framework: "lvs_petrobras", gapCount: gaps.length, priority }
    );

    if (result) {
      const plan: ActionPlan = {
        id: crypto.randomUUID(),
        title: `Plano de Ação — ${scope === "all" ? "Todas ETs" : scope} — ${new Date().toLocaleDateString("pt-BR")}`,
        scope: scope === "all" ? "Todas ETs" : scope,
        generatedAt: new Date().toISOString(),
        content: result.response,
        gapCount: gaps.length,
        estimatedDays: Math.ceil(gaps.length * 1.5),
      };
      setPlans(prev => [plan, ...prev]);
      setActivePlan(plan);
      toast.success("Plano de ação gerado com sucesso!");
    }
  }, [gaps, scope, priority, generate]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Gerador de Plano de Ação</span>
            </div>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas ETs</SelectItem>
                <SelectItem value="ET-PLL-017">ET-PLL-017</SelectItem>
                <SelectItem value="ET-ROV-001">ET-ROV-001</SelectItem>
                <SelectItem value="ET-RSV-028">ET-RSV-028</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-48 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="critical_first">Críticos Primeiro</SelectItem>
                <SelectItem value="sequential">Sequencial por ET</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" /> {gaps.length} gaps encontrados
            </Badge>
            <div className="flex-1" />
            <Button onClick={generatePlan} disabled={isLoading} size="sm">
              {isLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Brain className="h-4 w-4 mr-1" />}
              Gerar Plano de Ação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: AlertTriangle, label: "Gaps Totais", value: gaps.length, color: "text-warning" },
          { icon: Target, label: "Rejeitados", value: gaps.filter(g => g.status === "rejected").length, color: "text-destructive" },
          { icon: Calendar, label: "Prazo Estimado", value: `${Math.ceil(gaps.length * 1.5)}d`, color: "text-primary" },
          { icon: Users, label: "Planos Gerados", value: plans.length, color: "text-muted-foreground" },
        ].map(s => (
          <Card key={s.label}><CardContent className="p-3 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-1 ${s.color}`} />
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </CardContent></Card>
        ))}
      </div>

      {/* Plan Display */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Planos Gerados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {plans.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhum plano gerado</p>
                ) : plans.map(p => (
                  <Card
                    key={p.id}
                    className={`cursor-pointer hover:bg-muted/30 transition ${activePlan?.id === p.id ? "border-primary" : ""}`}
                    onClick={() => setActivePlan(p)}
                  >
                    <CardContent className="p-3">
                      <p className="text-xs font-medium truncate">{p.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                        <span>{p.gapCount} gaps</span>
                        <span>•</span>
                        <span>~{p.estimatedDays} dias</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {activePlan ? activePlan.title : "Plano de Ação"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !activePlan ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Gerando plano de ação com IA...</p>
              </div>
            ) : activePlan ? (
              <ScrollArea className="h-[400px] rounded border p-4 bg-muted/20">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{activePlan.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm">Selecione o escopo e clique "Gerar Plano de Ação"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
