/**
 * Command AI Hub - Inteligência Artificial para Central de Comando
 * 
 * Ferramentas IA disruptivas:
 * 1. Strategic Decision AI - Análise de decisão com IA para operações
 * 2. Fleet Optimization AI - Otimização inteligente de frota
 * 3. Executive Insights AI - Relatórios executivos auto-gerados
 * 4. Crisis Management AI - Gestão de crises com IA preditiva
 * 5. KPI Forecasting - Previsão de KPIs operacionais
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Target, TrendingUp, AlertTriangle, BarChart3, Loader2, Sparkles, Shield, Compass, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AIResult {
  content: string;
  timestamp: Date;
  tool: string;
}

const AI_TOOLS = [
  {
    id: 'strategic-decision',
    name: 'Strategic Decision AI',
    description: 'Analisa cenários e recomenda decisões estratégicas para operações marítimas',
    icon: Target,
    color: 'text-primary',
    prompt: 'Analise o cenário operacional atual da frota e forneça recomendações estratégicas para otimização de operações marítimas. Considere fatores como condições meteorológicas, custos operacionais, compliance regulatório e eficiência de tripulação.',
  },
  {
    id: 'fleet-optimization',
    name: 'Fleet Optimization AI',
    description: 'Otimiza alocação de recursos, rotas e scheduling da frota',
    icon: Compass,
    color: 'text-success',
    prompt: 'Sugira otimizações para a frota marítima considerando: 1) Alocação eficiente de embarcações por rota, 2) Minimização de tempo ocioso, 3) Balanceamento de carga de trabalho da tripulação, 4) Redução de custos de combustível. Forneça um plano acionável.',
  },
  {
    id: 'executive-insights',
    name: 'Executive Insights AI',
    description: 'Gera relatórios executivos com insights acionáveis automaticamente',
    icon: BarChart3,
    color: 'text-accent',
    prompt: 'Gere um relatório executivo resumido com: 1) Status geral da operação, 2) KPIs críticos e tendências, 3) Riscos identificados e mitigações, 4) Oportunidades de melhoria, 5) Recomendações para os próximos 30 dias. Formato profissional para diretoria.',
  },
  {
    id: 'crisis-management',
    name: 'Crisis Management AI',
    description: 'Identifica riscos potenciais e gera planos de contingência com IA',
    icon: AlertTriangle,
    color: 'text-destructive',
    prompt: 'Analise potenciais cenários de crise para operações marítimas e gere planos de contingência para: 1) Falha mecânica em embarcação, 2) Condições meteorológicas severas, 3) Incidente de segurança, 4) Falha de comunicação, 5) Emergência médica a bordo. Para cada cenário, forneça procedimentos de resposta rápida.',
  },
  {
    id: 'kpi-forecasting',
    name: 'KPI Forecasting AI',
    description: 'Prevê tendências de KPIs e identifica desvios antes que ocorram',
    icon: TrendingUp,
    color: 'text-warning',
    prompt: 'Com base nos dados operacionais, projete tendências de KPIs para os próximos 90 dias: 1) Taxa de utilização da frota, 2) Custo por milha náutica, 3) Índice de compliance, 4) Tempo médio de resposta a incidentes, 5) Satisfação da tripulação. Identifique possíveis desvios e sugira ações preventivas.',
  },
];

export default function CommandAIHub() {
  const [activeToolId, setActiveToolId] = useState(AI_TOOLS[0].id);
  const [results, setResults] = useState<Record<string, AIResult>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const runAITool = useCallback(async (toolId: string, prompt: string) => {
    setLoading(toolId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          question: prompt,
          systemPrompt: `Você é um especialista em gestão de operações marítimas e comando operacional. Forneça análises detalhadas, práticas e acionáveis. Use dados reais quando disponíveis. Formate com markdown para melhor legibilidade.`,
          profile: 'command',
        },
      });

      if (error) throw error;

      setResults(prev => ({
        ...prev,
        [toolId]: {
          content: data?.response || 'Sem resposta disponível.',
          timestamp: new Date(),
          tool: toolId,
        },
      }));
      toast.success('Análise IA concluída');
    } catch (err) {
      toast.error('Erro na análise IA. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }, []);

  const activeTool = AI_TOOLS.find(t => t.id === activeToolId) || AI_TOOLS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Command AI Hub</h2>
          <p className="text-sm text-muted-foreground">
            5 ferramentas de IA para decisões estratégicas e operacionais
          </p>
        </div>
        <Badge variant="outline" className="ml-auto bg-primary/10 text-primary">
          <Sparkles className="h-3 w-3 mr-1" />
          Gemini 3 Flash
        </Badge>
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {AI_TOOLS.map(tool => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeToolId === tool.id ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setActiveToolId(tool.id)}
          >
            <CardContent className="p-4 text-center">
              <tool.icon className={`h-8 w-8 mx-auto mb-2 ${tool.color}`} />
              <p className="text-xs font-medium leading-tight">{tool.name}</p>
              {results[tool.id] && (
                <Badge variant="secondary" className="mt-2 text-[10px]">✓ Pronto</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Tool Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <activeTool.icon className={`h-5 w-5 ${activeTool.color}`} />
            <div>
              <CardTitle className="text-lg">{activeTool.name}</CardTitle>
              <CardDescription>{activeTool.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom context */}
          <Textarea
            placeholder="Adicione contexto adicional para a análise (opcional)..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="min-h-[80px]"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => runAITool(activeToolId, customPrompt ? `${activeTool.prompt}\n\nContexto adicional: ${customPrompt}` : activeTool.prompt)}
              disabled={loading === activeToolId}
              className="flex-1"
            >
              {loading === activeToolId ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" />Executar Análise IA</>
              )}
            </Button>
          </div>

          {/* Result */}
          {results[activeToolId] && (
            <ScrollArea className="h-[400px] rounded-lg border p-4 bg-muted/30">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{results[activeToolId].content}</ReactMarkdown>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Gerado em: {results[activeToolId].timestamp.toLocaleString('pt-BR')}
              </p>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
