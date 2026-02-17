/**
 * Compliance AI Hub - IA Disruptiva para Auditorias & Conformidade
 * 
 * Suite completa de ferramentas IA:
 * 1. Auto-Evidence Generator - Gera evidências automaticamente do SGI
 * 2. Gap Analyzer AI - Identifica gaps de conformidade automaticamente
 * 3. Regulatory Intelligence - Monitora mudanças regulatórias (IMO/ILO/ANVISA)
 * 4. Auto-NC Resolver - Resolve NCs com root cause analysis e action plans
 * 5. Audit Prep AI - Pacotes de preparação para inspeções
 * 6. Compliance Score Predictor - Prevê scores de conformidade
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, FileCheck, Search, Globe, Wrench, ClipboardCheck, TrendingUp, Loader2, Sparkles, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface AIResult {
  content: string;
  timestamp: Date;
}

const AI_TOOLS = [
  {
    id: 'auto-evidence',
    name: 'Auto-Evidence Generator',
    description: 'Gera evidências de conformidade automaticamente a partir de todo o SGI da empresa',
    icon: FileCheck,
    color: 'text-emerald-500',
    prompt: 'Gere automaticamente evidências de conformidade para auditoria marítima. Busque dados de: 1) Registros de manutenção (PMS), 2) Treinamentos e certificações da tripulação (STCW), 3) Inspeções realizadas, 4) Drills e exercícios de emergência, 5) Registros de segurança do trabalho. Para cada item, indique a fonte, data e relevância para ISM/ISPS/MLC/SOLAS.',
  },
  {
    id: 'gap-analyzer',
    name: 'Gap Analyzer AI',
    description: 'Identifica lacunas de conformidade comparando dados reais vs requisitos',
    icon: Search,
    color: 'text-red-500',
    prompt: 'Realize uma análise de gap completa comparando o estado atual de conformidade com os requisitos de: 1) ISM Code - 13 elementos, 2) ISPS Code - Níveis 1-3, 3) MLC 2006 - Condições de trabalho e vida a bordo, 4) STCW - Competências e certificações, 5) MARPOL - Gestão de resíduos. Para cada gap, classifique a severidade (Crítico/Maior/Menor) e prazo de remediação.',
  },
  {
    id: 'regulatory-intelligence',
    name: 'Regulatory Intelligence',
    description: 'Monitora e analisa mudanças regulatórias de IMO, ILO, ANVISA e flag states',
    icon: Globe,
    color: 'text-info',
    prompt: 'Analise as últimas mudanças regulatórias marítimas relevantes: 1) Resoluções IMO recentes (MEPC, MSC), 2) Emendas ILO/MLC, 3) Alterações ANVISA para embarcações, 4) Novas circulares de flag states, 5) Requisitos CII/EEXI para eficiência energética. Para cada mudança, indique impacto operacional, prazo de implementação e ações necessárias.',
  },
  {
    id: 'auto-nc-resolver',
    name: 'Auto-NC Resolver',
    description: 'Resolve NCs automaticamente com análise de causa raiz e planos de ação',
    icon: Wrench,
    color: 'text-warning',
    prompt: 'Para as não-conformidades abertas, gere automaticamente: 1) Análise de causa raiz (5 Whys + Ishikawa), 2) Ações corretivas imediatas, 3) Ações preventivas de longo prazo, 4) Responsáveis sugeridos por departamento, 5) Prazos realistas baseados em complexidade, 6) Evidências necessárias para fechamento. Priorize por severidade e risco de reincidência.',
  },
  {
    id: 'audit-prep',
    name: 'Audit Prep AI',
    description: 'Gera pacotes completos de preparação para inspeções e auditorias',
    icon: ClipboardCheck,
    color: 'text-purple-500',
    prompt: 'Prepare um pacote completo de preparação para auditoria: 1) Checklist de documentos obrigatórios por tipo de inspeção, 2) Briefing para tripulação sobre pontos de atenção, 3) Áreas de risco baseadas em histórico, 4) Simulação de perguntas típicas do auditor, 5) Plano de apresentação da documentação. Inclua dicas específicas para PSC, OVID, SIRE e auditorias internas.',
  },
  {
    id: 'score-predictor',
    name: 'Compliance Score Predictor',
    description: 'Prevê scores de conformidade e identifica tendências de risco',
    icon: TrendingUp,
    color: 'text-cyan-500',
    prompt: 'Projete os scores de conformidade para os próximos 6 meses: 1) Score geral de compliance (0-100), 2) Score por categoria (ISM, ISPS, MLC, STCW, MARPOL), 3) Tendência de evolução, 4) Áreas que mais impactam o score, 5) Ações que mais elevariam o score rapidamente. Inclua benchmarking com padrões da indústria marítima.',
  },
];

export default function ComplianceAIHub() {
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
          systemPrompt: 'Você é um auditor sênior especialista em compliance marítimo com 20+ anos de experiência em ISM Code, ISPS, MLC 2006, STCW, MARPOL e PSC. Forneça análises detalhadas e acionáveis seguindo padrões IMO/OCIMF. Use markdown para formatação profissional.',
          profile: 'compliance',
        },
      });
      if (error) throw error;
      setResults(prev => ({
        ...prev,
        [toolId]: { content: data?.response || 'Sem resposta.', timestamp: new Date() },
      }));
      toast.success('Análise de compliance concluída');
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
        <div className="p-2 bg-destructive/10 rounded-lg">
          <Brain className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Compliance AI Hub</h2>
          <p className="text-sm text-muted-foreground">
            6 ferramentas IA disruptivas para compliance marítimo automatizado
          </p>
        </div>
        <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive">
          <Sparkles className="h-3 w-3 mr-1" />
          Gemini 3 Flash
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {AI_TOOLS.map(tool => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeToolId === tool.id ? 'ring-2 ring-destructive bg-destructive/5' : ''
            }`}
            onClick={() => setActiveToolId(tool.id)}
          >
            <CardContent className="p-3 text-center">
              <tool.icon className={`h-7 w-7 mx-auto mb-1.5 ${tool.color}`} />
              <p className="text-[11px] font-medium leading-tight">{tool.name}</p>
              {results[tool.id] && (
                <Badge variant="secondary" className="mt-1.5 text-[9px]">✓</Badge>
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
            placeholder="Contexto adicional (tipo de auditoria, embarcação, standard específico)..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            onClick={() => runAITool(activeToolId, customPrompt ? `${activeTool.prompt}\n\nContexto: ${customPrompt}` : activeTool.prompt)}
            disabled={loading === activeToolId}
            className="w-full"
            variant="destructive"
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
