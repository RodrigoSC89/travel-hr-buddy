// @ts-nocheck
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { metrics, systemStatus, logs } = await req.json();

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context for AI
    const context = buildReportContext(metrics, systemStatus, logs);

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um analista técnico especializado em sistemas operacionais complexos. 
Sua tarefa é gerar relatórios operacionais concisos, técnicos e acionáveis.
Foque em: falhas detectadas, tendências preocupantes, módulos críticos e riscos potenciais.
Use linguagem clara e objetiva. Priorize informações de alta relevância.`
          },
          {
            role: 'user',
            content: `Analise os dados do sistema Nautilus One e gere um relatório operacional das últimas 24h:

${context}

Forneça um relatório estruturado com:
1. RESUMO EXECUTIVO (2-3 linhas)
2. MÉTRICAS PRINCIPAIS
3. INCIDENTES E FALHAS (se houver)
4. MÓDULOS MAIS UTILIZADOS
5. RISCOS POTENCIAIS
6. RECOMENDAÇÕES`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        report: generateFallbackReport()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function buildReportContext(metrics: any, systemStatus: any, logs: any[]): string {
  const errorLogs = logs.filter(l => l.level === 'error' || l.level === 'critical');
  const warningLogs = logs.filter(l => l.level === 'warning');
  
  return `
MÉTRICAS DO SISTEMA:
- CPU: ${metrics.cpu_usage?.toFixed(1)}%
- Memória: ${metrics.memory_usage} MB
- FPS: ${metrics.fps}
- Taxa de Erro: ${metrics.error_rate?.toFixed(2)}%
- Módulos Ativos: ${metrics.active_modules}
- Tempo Médio de Resposta: ${metrics.avg_response_time}ms

STATUS DOS MÓDULOS:
- Total: ${systemStatus.totalModules}
- Ativos: ${systemStatus.active}
- Degradados: ${systemStatus.degraded}
- Offline: ${systemStatus.offline}
- Saúde Geral: ${systemStatus.health}

LOGS DE ERRO (${errorLogs.length}):
${errorLogs.slice(0, 5).map(log => 
  `- [${log.category}] ${log.message}`
).join('\n') || 'Nenhum erro crítico'}

LOGS DE AVISO (${warningLogs.length}):
${warningLogs.slice(0, 3).map(log => 
  `- [${log.category}] ${log.message}`
).join('\n') || 'Nenhum aviso'}

MÓDULOS COM PROBLEMAS:
${systemStatus.modules?.filter((m: any) => m.status !== 'active').map((m: any) => 
  `- ${m.name}: ${m.status} (${m.responseTime}ms, erros: ${m.errors.join(', ')})`
).join('\n') || 'Todos os módulos operacionais'}
`;
}

function generateFallbackReport(): string {
  return `
RELATÓRIO OPERACIONAL NAUTILUS ONE
Gerado: ${new Date().toLocaleString('pt-BR')}
Modo: Fallback (IA indisponível)

RESUMO EXECUTIVO
Sistema operacional com métricas disponíveis. Relatório gerado em modo fallback devido à indisponibilidade temporária da IA. 
Todos os dados brutos estão disponíveis no dashboard para análise manual.

RECOMENDAÇÕES
- Verificar conectividade com serviço de IA
- Revisar métricas manualmente no dashboard
- Agendar nova geração de relatório em 15 minutos

STATUS: Operacional com recursos limitados
`;
}
