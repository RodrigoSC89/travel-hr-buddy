/**
 * MMI Copilot Service - AI with vectorial history
 * Provides intelligent suggestions based on similar historical jobs
 */

export interface HistoricalJob {
  id: string;
  description: string;
  system: string;
  failure_type: string;
  action_taken: string;
  date: string;
  outcome: string;
}

export interface CopilotSuggestion {
  similar_jobs_found: number;
  historical_context: string;
  recommended_action: string;
  estimated_time: string;
  confidence: number;
}

// Mock historical database with vector similarity
const historicalDatabase: HistoricalJob[] = [
  {
    id: "HIST-001",
    description: "vazamento hidráulico no propulsor de popa",
    system: "propulsão",
    failure_type: "vazamento hidráulico",
    action_taken: "substituição do atuador e limpeza de dutos",
    date: "2025-08-15",
    outcome: "sucesso",
  },
  {
    id: "HIST-002",
    description: "falha no sistema de refrigeração do motor principal",
    system: "motor principal",
    failure_type: "superaquecimento",
    action_taken: "troca de bomba de água e limpeza do trocador de calor",
    date: "2025-07-20",
    outcome: "sucesso",
  },
  {
    id: "HIST-003",
    description: "vazamento de óleo no sistema hidráulico do guincho",
    system: "guincho hidráulico",
    failure_type: "vazamento hidráulico",
    action_taken: "substituição de vedações e teste de pressão",
    date: "2025-06-10",
    outcome: "sucesso",
  },
  {
    id: "HIST-004",
    description: "desgaste nos rolamentos do motor de popa",
    system: "propulsão",
    failure_type: "desgaste mecânico",
    action_taken: "substituição de rolamentos e balanceamento do eixo",
    date: "2025-05-05",
    outcome: "sucesso",
  },
];

/**
 * Simulates vector-based similarity search
 * In production, this would use embeddings (OpenAI, Cohere, etc.)
 */
function calculateSimilarity(prompt: string, historical: HistoricalJob): number {
  const promptLower = prompt.toLowerCase();
  const descLower = historical.description.toLowerCase();
  const systemLower = historical.system.toLowerCase();
  const failureLower = historical.failure_type.toLowerCase();
  
  // Simple keyword-based similarity (in production, use vector embeddings)
  const promptWords = promptLower.split(/\s+/).filter(w => w.length > 4);
  const allHistoricalWords = [
    ...descLower.split(/\s+/),
    ...systemLower.split(/\s+/),
    ...failureLower.split(/\s+/)
  ].filter(w => w.length > 4);
  
  // Common stop words in Portuguese that should not count
  const stopWords = ['sistema', 'falha', 'problema'];
  
  let matches = 0;
  for (const word of promptWords) {
    if (stopWords.includes(word)) continue;
    
    if (allHistoricalWords.some(hw => hw.includes(word) || word.includes(hw))) {
      matches++;
    }
  }
  
  return matches / Math.max(promptWords.length, 1);
}

/**
 * Generates AI suggestion based on historical similarity
 */
export async function generateCopilotSuggestion(prompt: string): Promise<CopilotSuggestion> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Find most similar historical job
  const similarities = historicalDatabase.map((job) => ({
    job,
    similarity: calculateSimilarity(prompt, job),
  }));
  
  similarities.sort((a, b) => b.similarity - a.similarity);
  const bestMatch = similarities[0];
  
  // Count similar jobs (similarity > 0.3)
  const similarJobs = similarities.filter((s) => s.similarity > 0.3);
  
  if (bestMatch && bestMatch.similarity > 0.25) {
    const job = bestMatch.job;
    const monthYear = new Date(job.date).toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
    
    return {
      similar_jobs_found: similarJobs.length,
      historical_context: `Foi encontrado ${similarJobs.length} job${similarJobs.length > 1 ? 's' : ''} semelhante${similarJobs.length > 1 ? 's' : ''} com falha no mesmo sistema em ${monthYear}. Ação tomada anteriormente: ${job.action_taken}.`,
      recommended_action: `Criar job de inspeção preventiva e abrir OS se confirmado desgaste. ${job.outcome === 'sucesso' ? 'Procedimento anterior foi bem-sucedido.' : ''}`,
      estimated_time: "2 dias",
      confidence: Math.min(0.95, bestMatch.similarity * 1.5),
    };
  }
  
  // No similar jobs found
  return {
    similar_jobs_found: 0,
    historical_context: "Nenhum job similar encontrado no histórico recente.",
    recommended_action: "Realizar inspeção detalhada e consultar manual técnico antes de proceder.",
    estimated_time: "3-5 dias",
    confidence: 0.3,
  };
}

/**
 * Formats a copilot suggestion as plain text for API response
 */
export function formatSuggestionAsText(suggestion: CopilotSuggestion): string {
  return `AÇÃO SUGERIDA (Confiança: ${(suggestion.confidence * 100).toFixed(0)}%):\n\n${suggestion.historical_context}\n\nAção recomendada: ${suggestion.recommended_action}\nPrazo estimado: ${suggestion.estimated_time}`;
}
