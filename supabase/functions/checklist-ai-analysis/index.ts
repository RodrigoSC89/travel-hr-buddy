import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  required: boolean;
  category: string;
  value?: any;
  status: string;
  notes?: string;
  evidence?: any[];
  historicalData?: any[];
}

interface ChecklistAnalysisRequest {
  checklist: {
    id: string;
    title: string;
    type: string;
    items: ChecklistItem[];
    vessel: any;
    inspector: any;
  };
  analysisType: 'validation' | 'anomaly_detection' | 'completion_check' | 'compliance_review';
}

interface AnalysisResult {
  overallScore: number;
  anomalies: Array<{
    itemId: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    suggestion: string;
    confidence: number;
  }>;
  suggestions: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  missingItems: string[];
  inconsistencies: string[];
  comparisonWithHistory: {
    similarChecklists: number;
    averageScore: number;
    trendAnalysis: 'improving' | 'stable' | 'declining';
    deviations: string[];
  };
  predictiveInsights: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { checklist, analysisType }: ChecklistAnalysisRequest = await req.json();
    
    console.log(`Analyzing checklist: ${checklist.id}, type: ${analysisType}`);

    // Preparar dados para análise
    const checklistSummary = {
      title: checklist.title,
      type: checklist.type,
      totalItems: checklist.items.length,
      completedItems: checklist.items.filter(item => item.status === 'completed').length,
      requiredItems: checklist.items.filter(item => item.required).length,
      completedRequiredItems: checklist.items.filter(item => item.required && item.status === 'completed').length,
      items: checklist.items.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        type: item.type,
        required: item.required,
        status: item.status,
        hasValue: item.value !== undefined && item.value !== null && item.value !== '',
        hasNotes: item.notes && item.notes.length > 0,
        hasEvidence: item.evidence && item.evidence.length > 0,
        hasHistoricalData: item.historicalData && item.historicalData.length > 0
      }))
    };

    const systemPrompt = getSystemPrompt(analysisType, checklist.type);
    const userPrompt = `
      Analise o seguinte checklist marítimo e forneça uma análise detalhada:

      DADOS DO CHECKLIST:
      ${JSON.stringify(checklistSummary, null, 2)}

      INFORMAÇÕES DO NAVIO:
      ${JSON.stringify(checklist.vessel, null, 2)}

      INFORMAÇÕES DO INSPETOR:
      ${JSON.stringify(checklist.inspector, null, 2)}

      Por favor, forneça uma análise estruturada seguindo o formato JSON especificado no prompt do sistema.
      Foque em:
      1. Identificação de anomalias e inconsistências
      2. Verificação de conformidade com regulamentações marítimas
      3. Sugestões específicas para melhorias
      4. Avaliação de riscos operacionais
      5. Comparação com padrões da indústria
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiAnalysis = data.choices[0].message.content;

    console.log('AI Analysis completed:', aiAnalysis);

    // Parse da resposta da IA
    let analysisResult: AnalysisResult;
    try {
      analysisResult = JSON.parse(aiAnalysis);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback analysis se o parsing falhar
      analysisResult = createFallbackAnalysis(checklist);
    }

    // Enriquecer a análise com dados adicionais
    analysisResult = enrichAnalysis(analysisResult, checklist);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      checklist_id: checklist.id,
      analysis_type: analysisType,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in checklist-ai-analysis function:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getSystemPrompt(analysisType: string, checklistType: string): string {
  const basePrompt = `
    Você é um especialista em segurança marítima e conformidade regulatória com 20+ anos de experiência em auditorias PEOTRAM, IMO, MARPOL, STCW e outras regulamentações marítimas internacionais.

    Sua tarefa é analisar checklists marítimos e fornecer insights críticos para segurança operacional.

    SEMPRE responda em formato JSON válido seguindo esta estrutura exata:
    {
      "overallScore": number (0-100),
      "anomalies": [
        {
          "itemId": "string",
          "type": "missing_value|unexpected_value|out_of_range|pattern_deviation|evidence_mismatch",
          "severity": "low|medium|high|critical",
          "description": "string",
          "suggestion": "string",
          "confidence": number (0-1)
        }
      ],
      "suggestions": ["string array of general suggestions"],
      "riskLevel": "low|medium|high|critical",
      "missingItems": ["string array of missing required items"],
      "inconsistencies": ["string array of inconsistencies found"],
      "comparisonWithHistory": {
        "similarChecklists": number,
        "averageScore": number,
        "trendAnalysis": "improving|stable|declining",
        "deviations": ["string array of deviations from normal patterns"]
      },
      "predictiveInsights": ["string array of predictive insights"]
    }
  `;

  switch (analysisType) {
    case 'validation':
      return basePrompt + `
        FOCO: Validação de completude e conformidade regulatória.
        - Verifique se todos os itens obrigatórios estão preenchidos
        - Identifique não-conformidades com regulamentações marítimas
        - Valide consistência entre dados relacionados
      `;
    
    case 'anomaly_detection':
      return basePrompt + `
        FOCO: Detecção de anomalias e padrões suspeitos.
        - Identifique valores fora do padrão normal
        - Detecte inconsistências temporais ou operacionais
        - Sinalize potenciais riscos de segurança
      `;
    
    case 'completion_check':
      return basePrompt + `
        FOCO: Verificação de completude do checklist.
        - Confirme que todos os itens necessários foram verificados
        - Identifique lacunas na documentação
        - Valide evidências e documentação de suporte
      `;
    
    case 'compliance_review':
      return basePrompt + `
        FOCO: Revisão de conformidade regulatória.
        - Verifique conformidade com IMO, MARPOL, SOLAS, STCW
        - Identifique não-conformidades regulamentares
        - Sugira ações corretivas específicas
      `;
    
    default:
      return basePrompt;
  }
}

function createFallbackAnalysis(checklist: any): AnalysisResult {
  const completedItems = checklist.items.filter((item: ChecklistItem) => item.status === 'completed').length;
  const totalItems = checklist.items.length;
  const requiredItems = checklist.items.filter((item: ChecklistItem) => item.required);
  const completedRequiredItems = requiredItems.filter((item: ChecklistItem) => item.status === 'completed').length;
  
  const overallScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const complianceScore = requiredItems.length > 0 ? Math.round((completedRequiredItems / requiredItems.length) * 100) : 100;
  
  const missingRequired = requiredItems
    .filter((item: ChecklistItem) => item.status !== 'completed')
    .map((item: ChecklistItem) => item.title);

  const riskLevel = complianceScore >= 90 ? 'low' : 
                   complianceScore >= 70 ? 'medium' : 
                   complianceScore >= 50 ? 'high' : 'critical';

  return {
    overallScore: Math.max(overallScore, complianceScore),
    anomalies: missingRequired.map((title: string, index: number) => ({
      itemId: `missing_${index}`,
      type: 'missing_value',
      severity: 'high' as const,
      description: `Item obrigatório não completado: ${title}`,
      suggestion: `Complete o item ${title} antes de finalizar o checklist`,
      confidence: 0.9
    })),
    suggestions: [
      'Complete todos os itens obrigatórios pendentes',
      'Adicione evidências fotográficas quando aplicável',
      'Revise as observações para garantir clareza',
      'Verifique conformidade com regulamentações aplicáveis'
    ],
    riskLevel,
    missingItems: missingRequired,
    inconsistencies: [],
    comparisonWithHistory: {
      similarChecklists: 0,
      averageScore: overallScore,
      trendAnalysis: 'stable' as const,
      deviations: []
    },
    predictiveInsights: [
      'Análise preditiva limitada - dados históricos insuficientes',
      'Recomenda-se completar mais checklists para melhor análise'
    ]
  };
}

function enrichAnalysis(analysis: AnalysisResult, checklist: any): AnalysisResult {
  // Adicionar insights específicos baseados no tipo de checklist
  const typeSpecificInsights = getTypeSpecificInsights(checklist.type, analysis.overallScore);
  
  return {
    ...analysis,
    suggestions: [...analysis.suggestions, ...typeSpecificInsights.suggestions],
    predictiveInsights: [...analysis.predictiveInsights, ...typeSpecificInsights.insights]
  };
}

function getTypeSpecificInsights(checklistType: string, score: number) {
  const insights = {
    suggestions: [] as string[],
    insights: [] as string[]
  };

  switch (checklistType) {
    case 'dp':
      insights.suggestions.push(
        'Verifique redundância dos sistemas DP conforme IMO MSC.1/Circ.1580',
        'Confirme procedimentos de emergência para falha de DP',
        'Valide capability plot para condições atuais'
      );
      if (score < 90) {
        insights.insights.push('Sistema DP com score baixo pode indicar risco operacional elevado');
      }
      break;
    
    case 'machine_routine':
      insights.suggestions.push(
        'Monitore temperaturas e pressões dentro dos limites operacionais',
        'Verifique níveis de óleo e combustível',
        'Confirme funcionamento de sistemas de segurança'
      );
      break;
    
    case 'nautical_routine':
      insights.suggestions.push(
        'Verifique equipamentos de navegação e comunicação',
        'Confirme compliance com COLREG e SOLAS',
        'Valide cartas náuticas atualizadas'
      );
      break;
    
    case 'safety':
      insights.suggestions.push(
        'Verifique equipamentos de combate a incêndio',
        'Confirme procedimentos de abandono',
        'Valide treinamento da tripulação'
      );
      break;
  }

  return insights;
}