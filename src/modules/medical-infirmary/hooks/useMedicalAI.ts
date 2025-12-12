/**
 * Hook for Medical AI Integration
 */

import { useState, useCallback } from "react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { MedicalRecord, CrewMember, MedicalSupply, AIAnalysis } from "../types";

interface TriageResult {
  urgency: "low" | "medium" | "high" | "critical";
  recommendations: string[];
  possibleDiagnoses: string[];
  suggestedTests: string[];
  medicationSuggestions: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function useMedicalAI() {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente médico IA do Nautilus. Posso ajudar com triagem de sintomas, protocolos de primeiros socorros, verificar interações medicamentosas, analisar estoque e muito mais. Como posso ajudar?",
      timestamp: new Date()
    }
  ]);

  const analyzeSymptoms = useCallback(async (symptoms: string[], patientInfo?: Partial<CrewMember>): Promise<TriageResult | null> => {
    const result = await invoke("wellbeing_analyze", `Triagem médica: ${symptoms.join(", ")}`, {
      symptoms,
      patientInfo,
      analysisType: "triage"
    });

    if (result?.response) {
      return {
        urgency: result.response.urgency || "medium",
        recommendations: result.response.recommendations || [],
        possibleDiagnoses: result.response.possibleDiagnoses || [],
        suggestedTests: result.response.suggestedTests || [],
        medicationSuggestions: result.response.medicationSuggestions || []
      };
    }
    return null;
  }, [invoke]);

  const analyzeMedicationInteractions = useCallback(async (medications: string[], allergies: string[]): Promise<string[]> => {
    const result = await invoke("wellbeing_analyze", "Verificar interações medicamentosas", {
      medications,
      allergies,
      analysisType: "drug_interactions"
    });

    return result?.response?.interactions || [];
  }, [invoke]);

  const analyzeInventoryRisks = useCallback(async (supplies: MedicalSupply[]): Promise<AIAnalysis | null> => {
    const result = await invoke("resource_availability", "Analisar riscos de estoque médico", {
      supplies,
      analysisType: "inventory_risk"
    });

    if (result?.response) {
      return {
        riskLevel: result.response.riskLevel || "low",
        recommendations: result.response.recommendations || [],
        predictedIssues: result.response.predictedIssues || [],
        confidence: result.response.confidence || 0.8
      };
    }
    return null;
  }, [invoke]);

  const predictHealthIssues = useCallback(async (crewData: CrewMember[], records: MedicalRecord[]): Promise<AIAnalysis | null> => {
    const result = await invoke("wellbeing_analyze", "Análise preditiva de saúde da tripulação", {
      crew: crewData,
      recentRecords: records,
      analysisType: "predictive_health"
    });

    if (result?.response) {
      return {
        riskLevel: result.response.riskLevel || "low",
        recommendations: result.response.recommendations || [],
        predictedIssues: result.response.predictedIssues || [],
        confidence: result.response.confidence || 0.75
      };
    }
    return null;
  }, [invoke]);

  const generateTreatmentSuggestion = useCallback(async (
    symptoms: string[],
    diagnosis: string,
    patientInfo: Partial<CrewMember>
  ): Promise<{ treatment: string; medications: any[] } | null> => {
    const result = await invoke("wellbeing_analyze", `Sugestão de tratamento para: ${diagnosis}`, {
      symptoms,
      diagnosis,
      patientInfo,
      analysisType: "treatment_suggestion"
    });

    if (result?.response) {
      return {
        treatment: result.response.treatment || "",
        medications: result.response.medications || []
      };
    }
    return null;
  }, [invoke]);

  const sendChatMessage = useCallback(async (message: string): Promise<string> => {
    setChatHistory(prev => [...prev, { role: "user", content: message, timestamp: new Date() }]);

    const result = await invoke("emergency_guidance", message, {
      context: "medical_assistant",
      chatHistory: chatHistory.slice(-10) // Last 10 messages for context
    });

    let response = "Desculpe, não consegui processar sua solicitação. Tente novamente.";

    if (result?.response) {
      response = typeof result.response === "string" 
        ? result.response 
        : result.response.message || result.response.guidance || response;
    } else {
      // Fallback responses based on keywords
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes("dor")) {
        response = "Para dor, primeiro avalie a intensidade (1-10) e localização. Para cefaleia leve/moderada: Paracetamol 500-1000mg. Para dor muscular: considerar anti-inflamatório. Se dor intensa ou persistente, considere telemedicina.";
      } else if (lowerMessage.includes("corte") || lowerMessage.includes("ferimento") || lowerMessage.includes("sangr")) {
        response = "Protocolo para ferimentos: 1) Usar EPIs, 2) Controlar sangramento com compressão, 3) Lavar com soro fisiológico, 4) Aplicar antisséptico, 5) Curativo apropriado. Se profundo (>2cm) ou sangramento intenso: sutura. Verificar vacina antitetânica.";
      } else if (lowerMessage.includes("estoque") || lowerMessage.includes("medicamento")) {
        response = "Verificando estoque... Temos itens críticos que precisam de reposição (Soro fisiológico, Adrenalina) e itens próximos ao vencimento (Dipirona). Recomendo solicitar reposição via módulo de compras.";
      } else if (lowerMessage.includes("enjoo") || lowerMessage.includes("tontura") || lowerMessage.includes("náusea")) {
        response = "Para cinetose (enjoo de movimento): Dramin 100mg a cada 8h. Orientar: evitar leitura em movimento, manter olhar no horizonte, hidratação adequada. Se vômitos persistentes, considerar hidratação EV.";
      } else if (lowerMessage.includes("febre") || lowerMessage.includes("temperatura")) {
        response = "Para febre: 1) Verificar temperatura axilar, 2) Se >38°C: Paracetamol 500-1000mg ou Dipirona 1g, 3) Hidratação, 4) Repouso. Se febre >39°C ou persistente por >48h: avaliar infecção, considerar telemedicina.";
      } else if (lowerMessage.includes("alergia")) {
        response = "Reação alérgica: 1) LEVE (urticária localizada): Anti-histamínico oral, 2) MODERADA (urticária difusa, edema): considerar corticoide, 3) GRAVE (anafilaxia - dispneia, hipotensão): ADRENALINA IM urgente + acionar emergência.";
      }
    }

    setChatHistory(prev => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    return response;
  }, [invoke, chatHistory]);

  const clearChatHistory = useCallback(() => {
    setChatHistory([{
      role: "assistant",
      content: "Histórico limpo. Como posso ajudar?",
      timestamp: new Date()
    }]);
  }, []);

  return {
    isLoading,
    chatHistory,
    sendChatMessage,
    clearChatHistory,
    analyzeSymptoms,
    analyzeMedicationInteractions,
    analyzeInventoryRisks,
    predictHealthIssues,
    generateTreatmentSuggestion
  };
}
