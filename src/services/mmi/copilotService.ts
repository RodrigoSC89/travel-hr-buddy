/**
 * AI Copilot Service for MMI
 * Provides intelligent recommendations based on historical data
 */

import OpenAI from 'openai';
import { generateEmbedding, formatJobForEmbedding } from './embeddingService';
import { supabase } from '@/integrations/supabase/client';

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date: string;
  component_name?: string; // Flat format
  asset_name?: string; // Flat format
  vessel?: string; // Flat format
  component?: { // Nested format (from jobsApi)
    name: string;
    asset: {
      name: string;
      vessel: string;
    };
  };
  suggestion_ia?: string;
  can_postpone?: boolean;
}

export interface AIRecommendation {
  technical_action: string;
  component: string;
  deadline: string;
  requires_work_order: boolean;
  reasoning: string;
  similar_cases?: Array<{
    job_id: string;
    action: string;
    outcome: string;
    similarity: number;
  }>;
}

/**
 * Get AI recommendation for a job using historical context
 */
export async function getAIRecommendation(job: Job): Promise<AIRecommendation> {
  try {
    // Extract component details from either flat or nested format
    const componentName = job.component_name || job.component?.name || '';
    const assetName = job.asset_name || job.component?.asset.name || '';
    const vessel = job.vessel || job.component?.asset.vessel || '';

    // Generate embedding for the job
    const jobText = formatJobForEmbedding({
      title: job.title,
      description: job.description,
      component_name: componentName,
      asset_name: assetName,
      vessel: vessel,
      priority: job.priority,
    });
    
    const embedding = await generateEmbedding(jobText);
    
    // Find similar historical cases
    const { data: similarHistory, error } = await supabase.rpc('match_mmi_job_history', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
    });

    if (error) {
      console.error('Error fetching similar history:', error);
    }

    // Get OpenAI client
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return generateMockRecommendation(job, similarHistory || []);
    }

    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    // Build context from similar cases
    const historicalContext = similarHistory && similarHistory.length > 0
      ? `\n\nCasos similares encontrados no histórico:\n${similarHistory.map((h: any, i: number) => 
          `${i + 1}. Ação: ${h.action}\n   Recomendação: ${h.ai_recommendation || 'N/A'}\n   Resultado: ${h.outcome || 'N/A'}\n   Similaridade: ${(h.similarity * 100).toFixed(1)}%`
        ).join('\n\n')}`
      : '\n\nNenhum caso similar encontrado no histórico.';

    // Create enriched prompt
    const prompt = `Você é um especialista em manutenção marítima e industrial. Analise o seguinte job de manutenção e forneça uma recomendação técnica detalhada.

Job Atual:
- Título: ${job.title}
- Descrição: ${job.description || 'N/A'}
- Componente: ${componentName}
- Equipamento: ${assetName}
- Embarcação: ${vessel}
- Prioridade: ${job.priority}
- Status: ${job.status}
- Prazo: ${job.due_date}
${historicalContext}

Com base nas informações acima e nos casos históricos similares, forneça uma recomendação estruturada em formato JSON com os seguintes campos:
- technical_action: Ação técnica recomendada (string detalhada)
- component: Componente envolvido (string)
- deadline: Prazo sugerido no formato YYYY-MM-DD (string)
- requires_work_order: Se é necessário criar uma OS (boolean)
- reasoning: Justificativa da recomendação baseada no histórico (string)

Responda APENAS com o JSON válido, sem markdown ou texto adicional.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente especializado em manutenção marítima e industrial que fornece recomendações técnicas precisas em formato JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || '';
    
    // Parse JSON response
    let recommendation: AIRecommendation;
    try {
      // Try to extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      recommendation = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return generateMockRecommendation(job, similarHistory || []);
    }

    // Add similar cases to the recommendation
    recommendation.similar_cases = similarHistory?.slice(0, 3).map((h: any) => ({
      job_id: h.job_id,
      action: h.action,
      outcome: h.outcome || 'Pendente',
      similarity: h.similarity,
    }));

    return recommendation;
  } catch (error) {
    console.error('Error getting AI recommendation:', error);
    return generateMockRecommendation(job, []);
  }
}

/**
 * Generate a mock recommendation for testing/fallback
 */
function generateMockRecommendation(job: Job, similarHistory: any[]): AIRecommendation {
  const isCritical = job.priority === 'Crítica';
  const hasHistory = similarHistory.length > 0;
  const componentName = job.component_name || job.component?.name || 'Componente';

  return {
    technical_action: isCritical
      ? `Realizar inspeção imediata de ${componentName}. Verificar todos os componentes relacionados e preparar para substituição se necessário.`
      : `Agendar manutenção preventiva de ${componentName} durante a próxima janela de manutenção programada.`,
    component: componentName,
    deadline: job.due_date,
    requires_work_order: isCritical || job.priority === 'Alta',
    reasoning: hasHistory
      ? `Com base em ${similarHistory.length} caso(s) similar(es) no histórico, esta ação é recomendada para evitar falhas futuras e garantir a continuidade operacional.`
      : 'Recomendação baseada nas melhores práticas de manutenção marítima e nas características do equipamento.',
    similar_cases: similarHistory.slice(0, 3).map((h: any) => ({
      job_id: h.job_id,
      action: h.action,
      outcome: h.outcome || 'Pendente',
      similarity: h.similarity,
    })),
  };
}

/**
 * Log AI interaction for future learning
 */
export async function logAIInteraction(
  jobId: string,
  action: string,
  recommendation: AIRecommendation,
  embedding: number[]
): Promise<void> {
  try {
    await supabase.from('mmi_job_history').insert({
      job_id: jobId,
      action,
      ai_recommendation: recommendation.reasoning,
      action_details: {
        technical_action: recommendation.technical_action,
        component: recommendation.component,
        deadline: recommendation.deadline,
        requires_work_order: recommendation.requires_work_order,
      },
      embedding,
    });
  } catch (error) {
    console.error('Error logging AI interaction:', error);
  }
}
