/**
 * MMI Copilot Service
 * Provides vector-based similarity search and AI suggestions based on historical maintenance jobs
 */

export interface HistoricalJob {
  id: string;
  title: string;
  description: string;
  component: string;
  vessel: string;
  resolution: string;
  estimated_time: string;
  outcome: string;
}

export interface CopilotSuggestion {
  similar_jobs_found: number;
  historical_context: string;
  recommended_action: string;
  estimated_time: string;
  confidence: number;
}

// Mock historical maintenance jobs database
const historicalJobs: HistoricalJob[] = [
  {
    id: "HIST-001",
    title: "Falha no gerador STBD",
    description: "Gerador STBD apresentando ruído incomum e aumento de temperatura durante operação",
    component: "Gerador STBD",
    vessel: "Navio Atlantic Star",
    resolution: "Substituição do ventilador do gerador e limpeza do sistema de arrefecimento",
    estimated_time: "2 dias",
    outcome: "Resolvido com sucesso. Sistema operando normalmente após intervenção.",
  },
  {
    id: "HIST-002",
    title: "Vazamento hidráulico no propulsor de popa",
    description: "Sistema hidráulico do propulsor de popa apresentando vazamento de óleo",
    component: "Sistema Hidráulico",
    vessel: "Navio Oceanic Explorer",
    resolution: "Troca de vedações e inspeção de válvulas de alívio",
    estimated_time: "1 dia",
    outcome: "Vazamento eliminado. Recomendada inspeção preventiva a cada 6 meses.",
  },
  {
    id: "HIST-003",
    title: "Bomba hidráulica com vibração excessiva",
    description: "Bomba hidráulica principal apresentando vibração excessiva e ruído anormal",
    component: "Bomba Hidráulica",
    vessel: "Navio Pacific Voyager",
    resolution: "Substituição de rolamentos e balanceamento do rotor",
    estimated_time: "3 dias",
    outcome: "Vibração normalizada. Sistema estável após 100 horas de operação.",
  },
  {
    id: "HIST-004",
    title: "Válvula de segurança com leitura fora do padrão",
    description: "Válvula de segurança do sistema principal apresentando leitura de pressão inconsistente",
    component: "Sistema de Segurança",
    vessel: "Navio Atlantic Star",
    resolution: "Calibração e substituição do sensor de pressão",
    estimated_time: "1 dia",
    outcome: "Leitura normalizada. Teste de pressão realizado com sucesso.",
  },
];

/**
 * Calculate similarity between two strings using a simple vector-like approach
 * In production, this would use actual embeddings from OpenAI or similar
 * @param text1 - First text to compare
 * @param text2 - Second text to compare
 * @returns Similarity score between 0 and 1
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const uniqueWords = new Set([...words1, ...words2]);
  let matches = 0;
  
  uniqueWords.forEach(word => {
    if (words1.includes(word) && words2.includes(word)) {
      matches++;
    }
  });
  
  // Calculate Jaccard similarity
  const similarity = matches / uniqueWords.size;
  
  // Boost similarity for important keywords
  const keywords = ['gerador', 'bomba', 'hidráulico', 'válvula', 'motor', 'temperatura', 'vazamento', 'vibração', 'ruído'];
  let keywordBoost = 0;
  
  keywords.forEach(keyword => {
    if (text1.toLowerCase().includes(keyword) && text2.toLowerCase().includes(keyword)) {
      keywordBoost += 0.1;
    }
  });
  
  return Math.min(similarity + keywordBoost, 1.0);
}

/**
 * Find similar historical jobs based on the given prompt
 * @param prompt - Description of the maintenance issue
 * @param threshold - Minimum similarity threshold (0-1)
 * @param limit - Maximum number of results to return
 * @returns Array of historical jobs with similarity scores
 */
export function findSimilarJobs(
  prompt: string,
  threshold: number = 0.3,
  limit: number = 3
): Array<HistoricalJob & { similarity: number }> {
  const results = historicalJobs
    .map(job => ({
      ...job,
      similarity: calculateSimilarity(
        prompt,
        `${job.title} ${job.description} ${job.component}`
      ),
    }))
    .filter(job => job.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
  
  return results;
}

/**
 * Generate AI-powered maintenance suggestion based on historical data
 * @param prompt - Description of the maintenance issue
 * @returns Copilot suggestion with historical context and recommendations
 */
export async function generateCopilotSuggestion(prompt: string): Promise<CopilotSuggestion> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (!prompt || prompt.trim().length === 0) {
    return {
      similar_jobs_found: 0,
      historical_context: "Nenhuma descrição fornecida. Por favor, descreva o problema de manutenção.",
      recommended_action: "Fornecer descrição detalhada do problema para receber sugestões.",
      estimated_time: "N/A",
      confidence: 0,
    };
  }
  
  const similarJobs = findSimilarJobs(prompt, 0.2, 3);
  
  if (similarJobs.length === 0) {
    return {
      similar_jobs_found: 0,
      historical_context: "Não foram encontrados casos históricos semelhantes para este tipo de falha.",
      recommended_action: "Realizar inspeção detalhada e documentar o caso para futuras referências. Consultar manual técnico do equipamento.",
      estimated_time: "A definir após inspeção",
      confidence: 0.3,
    };
  }
  
  // Calculate average confidence based on similarity scores
  const avgSimilarity = similarJobs.reduce((sum, job) => sum + job.similarity, 0) / similarJobs.length;
  const confidence = Math.round(avgSimilarity * 100) / 100;
  
  // Build historical context
  const contextParts = similarJobs.map((job, index) => 
    `Caso ${index + 1}: ${job.title} — ${job.description.substring(0, 80)}...`
  );
  const historicalContext = `Foi encontrado ${similarJobs.length} job${similarJobs.length > 1 ? 's' : ''} semelhante${similarJobs.length > 1 ? 's' : ''} com falha no mesmo sistema:\n\n${contextParts.join('\n')}`;
  
  // Use the most similar job's resolution as basis for recommendation
  const mostSimilarJob = similarJobs[0];
  const recommendedAction = `Criar job de inspeção preventiva seguindo o padrão do caso histórico. Ação sugerida: ${mostSimilarJob.resolution}`;
  const estimatedTime = mostSimilarJob.estimated_time;
  
  return {
    similar_jobs_found: similarJobs.length,
    historical_context: historicalContext,
    recommended_action: recommendedAction,
    estimated_time: estimatedTime,
    confidence: confidence,
  };
}

/**
 * Format copilot suggestion as readable text
 * @param suggestion - Copilot suggestion object
 * @returns Formatted text for display
 */
export function formatSuggestionAsText(suggestion: CopilotSuggestion): string {
  let text = '';
  
  if (suggestion.similar_jobs_found > 0) {
    text += `📊 Contexto Histórico:\n${suggestion.historical_context}\n\n`;
    text += `✅ Ação Recomendada:\n${suggestion.recommended_action}\n\n`;
    text += `⏱️ Tempo Estimado: ${suggestion.estimated_time}\n\n`;
    text += `🎯 Confiança da Sugestão: ${Math.round(suggestion.confidence * 100)}%`;
  } else {
    text += `ℹ️ ${suggestion.historical_context}\n\n`;
    text += `📋 ${suggestion.recommended_action}`;
  }
  
  return text;
}
