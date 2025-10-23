/**
 * LLM Chain of Thought Engine
 * Enables multi-step reasoning with context awareness
 */

import { nautilusRespond } from "./nautilusLLM";

export interface ChainStep {
  id: string;
  step: string;
  status: "pending" | "processing" | "completed" | "error";
  response?: string;
  confidence?: number;
  executionTime?: number;
  timestamp?: string;
}

export interface ChainResult {
  chainId: string;
  steps: ChainStep[];
  totalTime: number;
  completed: boolean;
  error?: string;
}

/**
 * Execute a chain of thought reasoning steps
 */
export async function runLLMChain(
  steps: string[],
  contextId?: string,
  onStepComplete?: (step: ChainStep) => void
): Promise<ChainResult> {
  const chainId = `chain-${Date.now()}`;
  const startTime = Date.now();
  
  const chainSteps: ChainStep[] = steps.map((step, index) => ({
    id: `step-${index}`,
    step,
    status: "pending" as const,
  }));

  const results: ChainStep[] = [];
  let previousResponses = "";

  for (let i = 0; i < chainSteps.length; i++) {
    const currentStep = chainSteps[i];
    currentStep.status = "processing";
    currentStep.timestamp = new Date().toISOString();
    
    if (onStepComplete) {
      onStepComplete({ ...currentStep });
    }

    try {
      const stepStartTime = Date.now();
      
      // Build context-aware prompt
      const prompt = `
ETAPA ${i + 1}/${chainSteps.length}: ${currentStep.step}

${previousResponses ? `CONTEXTO DAS ETAPAS ANTERIORES:\n${previousResponses}\n` : ""}

Analise esta etapa considerando:
1. O contexto do sistema atual
2. As respostas das etapas anteriores (se houver)
3. Forneça uma resposta clara e acionável

Seja objetivo e técnico.`;

      const response = await nautilusRespond({
        prompt,
        contextId,
        mode: "safe"
      });
      
      const executionTime = Date.now() - stepStartTime;
      
      currentStep.status = "completed";
      currentStep.response = response.response;
      currentStep.confidence = response.confidenceScore;
      currentStep.executionTime = executionTime;
      
      // Accumulate context for next steps
      previousResponses += `\n[Etapa ${i + 1}]: ${currentStep.step}\nResposta: ${response.response}\n`;
      
      results.push({ ...currentStep });
      
      if (onStepComplete) {
        onStepComplete({ ...currentStep });
      }
    } catch (error) {
      currentStep.status = "error";
      currentStep.response = error instanceof Error ? error.message : "Unknown error";
      results.push({ ...currentStep });
      
      if (onStepComplete) {
        onStepComplete({ ...currentStep });
      }
      
      return {
        chainId,
        steps: results,
        totalTime: Date.now() - startTime,
        completed: false,
        error: `Failed at step ${i + 1}: ${currentStep.response}`,
      };
    }
  }

  return {
    chainId,
    steps: results,
    totalTime: Date.now() - startTime,
    completed: true,
  };
}

/**
 * Parse natural language command into chain steps
 */
export function parseNaturalLanguageToChain(command: string): string[] {
  // Simple parsing - can be enhanced with LLM
  const steps = command
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  return steps.length > 0 ? steps : [command];
}

/**
 * Common chain templates for quick actions
 */
export const CHAIN_TEMPLATES = {
  systemHealth: [
    "Verificar status de todos os módulos críticos",
    "Identificar módulos com latência acima de 500ms",
    "Cruzar com logs de erro das últimas 2 horas",
    "Sugerir ações corretivas prioritárias",
  ],
  fleetAnalysis: [
    "Analisar posição atual de toda a frota",
    "Verificar alertas ativos por embarcação",
    "Correlacionar com condições meteorológicas",
    "Gerar relatório de risco operacional",
  ],
  maintenanceAudit: [
    "Verificar tarefas de manutenção pendentes",
    "Identificar equipamentos críticos sem manutenção recente",
    "Analisar histórico de falhas dos últimos 30 dias",
    "Gerar plano de manutenção prioritizado",
  ],
  crewWellness: [
    "Verificar status da tripulação ativa",
    "Analisar relatórios de fadiga e bem-estar",
    "Cruzar com horas trabalhadas nos últimos 7 dias",
    "Sugerir ações de suporte e rotação",
  ],
  sarPreparation: [
    "Verificar embarcações disponíveis para SAR",
    "Analisar condições meteorológicas da região",
    "Calcular tempos de resposta",
    "Gerar plano de ação SAR",
  ],
};
