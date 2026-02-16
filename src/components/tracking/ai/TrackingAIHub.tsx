/**
 * Tracking AI Hub - Inteligência Artificial para Rastreamento & Telemetria
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Navigation, AlertTriangle, MapPin, Cloud, Fuel, Loader2, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AIResult {
  content: string;
  timestamp: Date;
}

const AI_TOOLS = [
  {
    id: 'route-prediction',
    name: 'Route Prediction AI',
    description: 'Previsão de rotas e ETA com machine learning baseado em histórico',
    icon: Navigation,
    color: 'text-primary',
    prompt: 'Analise padrões de navegação históricos e forneça previsões de rota e ETA para as embarcações da frota. Considere: 1) Rotas mais frequentes, 2) Velocidade média por segmento, 3) Paradas típicas em portos, 4) Sazonalidade. Forneça previsões com nível de confiança.',
  },
  {
    id: 'anomaly-detection',
    name: 'Anomaly Detection AI',
    description: 'Detecta padrões anômalos de navegação que podem indicar problemas',
    icon: AlertTriangle,
    color: 'text-destructive',
    prompt: 'Identifique possíveis anomalias em padrões de navegação marítima: 1) Desvios significativos de rota planejada, 2) Paradas não programadas, 3) Velocidade anormalmente baixa/alta, 4) Consumo de combustível irregular, 5) Perda de sinal AIS. Para cada anomalia, classifique a severidade e sugira ações.',
  },
  {
    id: 'geofencing-ai',
    name: 'Geofencing Intelligence',
    description: 'Geofencing adaptativo com IA que aprende padrões operacionais',
    icon: MapPin,
    color: 'text-success',
    prompt: 'Sugira configurações inteligentes de geofencing para a frota: 1) Zonas de exclusão baseadas em regulamentação marítima, 2) Alertas de aproximação de áreas de alto risco, 3) Corredores de navegação seguros, 4) Zonas de fundeio otimizadas, 5) Áreas de pesca proibida. Inclua coordenadas sugeridas e raio de cada zona.',
  },
  {
    id: 'weather-routing',
    name: 'Weather Routing AI',
    description: 'Otimização de rotas baseada em previsão meteorológica avançada',
    icon: Cloud,
    color: 'text-info',
    prompt: 'Forneça recomendações de weather routing para operações marítimas: 1) Análise de condições meteorológicas para as próximas 72h, 2) Rotas alternativas para evitar tempestades, 3) Janelas de tempo ideais para travessias, 4) Impacto de correntes e ondulação na eficiência, 5) Alertas de condições severas.',
  },
  {
    id: 'fuel-efficiency',
    name: 'Fuel Efficiency AI',
    description: 'Análise e otimização de consumo de combustível por rota e condição',
    icon: Fuel,
    color: 'text-warning',
    prompt: 'Analise a eficiência de combustível da frota e sugira otimizações: 1) Velocidade econômica ideal por tipo de embarcação, 2) Impacto de correntes e ventos no consumo, 3) Comparação de eficiência entre rotas, 4) Oportunidades de economia com slow steaming, 5) Projeção de custos de bunker para próximo trimestre.',
  },
];

export default function TrackingAIHub() {
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
          systemPrompt: 'Você é um especialista em navegação marítima, telemetria e rastreamento de frotas. Forneça análises técnicas detalhadas com dados acionáveis. Use terminologia marítima (AIS, ECDIS, VTS). Formate com markdown.',
          profile: 'tracking',
        },
      });
      if (error) throw error;
      setResults(prev => ({
        ...prev,
        [toolId]: { content: data?.response || 'Sem resposta.', timestamp: new Date() },
      }));
      toast.success('Análise concluída');
    } catch {
      toast.error('Erro na análise. Tente novamente.');
    } finally {
      setLoading(null);
    }
  }, []);

  const activeTool = AI_TOOLS.find(t => t.id === activeToolId) || AI_TOOLS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-hub-tracking/10 rounded-lg">
          <Brain className="h-6 w-6 text-hub-tracking" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Tracking AI Hub</h2>
          <p className="text-sm text-muted-foreground">
            5 ferramentas IA para rastreamento inteligente e predição de rotas
          </p>
        </div>
        <Badge variant="outline" className="ml-auto bg-hub-tracking/10 text-hub-tracking">
          <Sparkles className="h-3 w-3 mr-1" />
          Gemini 3 Flash
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {AI_TOOLS.map(tool => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeToolId === tool.id ? 'ring-2 ring-hub-tracking bg-hub-tracking/5' : ''
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
          <Textarea
            placeholder="Contexto adicional (rotas específicas, embarcações, datas)..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={() => runAITool(activeToolId, customPrompt ? `${activeTool.prompt}\n\nContexto: ${customPrompt}` : activeTool.prompt)}
            disabled={loading === activeToolId}
            className="w-full"
          >
            {loading === activeToolId ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Analisando...</>
            ) : (
              <><Zap className="h-4 w-4 mr-2" />Executar Análise IA</>
            )}
          </Button>

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
