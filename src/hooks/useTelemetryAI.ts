/**
 * Telemetry AI Hook
 * LLM integration for telemetry analysis and insights
 */

import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TelemetryAIResponse {
  analysis: string;
  recommendations: string[];
  riskAssessment: "low" | "medium" | "high" | "critical";
  confidence: number;
}

export function useTelemetryAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<TelemetryAIResponse | null>(null);
  const [streamingText, setStreamingText] = useState("");

  const analyzeData = useCallback(async (data: {
    weatherData?: any[];
    satelliteData?: any[];
    alerts?: any[];
    syncStatus?: any[];
  }) => {
    setIsLoading(true);
    setStreamingText("");
    setResponse(null);

    try {
      const systemPrompt = `Você é um especialista em análise de telemetria marítima e operações navais. 
Analise os dados fornecidos e forneça:
1. Uma análise detalhada da situação operacional
2. Recomendações de ações baseadas nos dados
3. Avaliação de risco (low, medium, high, critical)
4. Insights sobre padrões detectados

Responda em português brasileiro de forma clara e profissional.`;

      const userPrompt = `Analise os seguintes dados de telemetria:

DADOS METEOROLÓGICOS:
${JSON.stringify(data.weatherData || [], null, 2)}

DADOS DE SATÉLITE:
${JSON.stringify(data.satelliteData || [], null, 2)}

STATUS DE SINCRONIZAÇÃO:
${JSON.stringify(data.syncStatus || [], null, 2)}

ALERTAS ATIVOS:
${JSON.stringify(data.alerts || [], null, 2)}

Forneça uma análise completa com recomendações práticas.`;

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telemetry-ai`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Limite de requisições excedido. Tente novamente mais tarde.");
          throw new Error("Rate limit exceeded");
        }
        if (resp.status === 402) {
          toast.error("Créditos insuficientes. Adicione mais créditos à sua conta.");
          throw new Error("Payment required");
        }
        throw new Error("Failed to get AI response");
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch {
            // Incomplete JSON, will be completed in next chunk
          }
        }
      }

      // Parse the response into structured format
      const parsedResponse = parseAIResponse(fullText);
      setResponse(parsedResponse);
      
      return parsedResponse;
    } catch (error) {
      console.error("AI analysis error:", error);
      toast.error("Erro ao analisar dados com IA");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const askQuestion = useCallback(async (question: string, context?: any) => {
    setIsLoading(true);
    setStreamingText("");

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telemetry-ai`;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: [
            { 
              role: "system", 
              content: `Você é um assistente especializado em telemetria marítima e operações navais. 
Responda de forma clara e profissional em português brasileiro.
${context ? `Contexto atual: ${JSON.stringify(context)}` : ""}`
            },
            { role: "user", content: question }
          ]
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Failed to get AI response");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setStreamingText(fullText);
            }
          } catch {
            // Incomplete JSON
          }
        }
      }

      return fullText;
    } catch (error) {
      console.error("AI question error:", error);
      toast.error("Erro ao processar pergunta");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    response,
    streamingText,
    analyzeData,
    askQuestion,
  };
}

function parseAIResponse(text: string): TelemetryAIResponse {
  // Extract risk level from text
  let riskAssessment: TelemetryAIResponse["riskAssessment"] = "low";
  if (text.toLowerCase().includes("crítico") || text.toLowerCase().includes("critical")) {
    riskAssessment = "critical";
  } else if (text.toLowerCase().includes("alto") || text.toLowerCase().includes("high")) {
    riskAssessment = "high";
  } else if (text.toLowerCase().includes("médio") || text.toLowerCase().includes("medium")) {
    riskAssessment = "medium";
  }

  // Extract recommendations (lines starting with numbers or bullets)
  const recommendationPatterns = text.match(/(?:^|\n)\s*(?:\d+[\.\)]|[-•*])\s*([^\n]+)/g) || [];
  const recommendations = recommendationPatterns
    .map(r => r.replace(/^\s*(?:\d+[\.\)]|[-•*])\s*/, "").trim())
    .filter(r => r.length > 10)
    .slice(0, 5);

  return {
    analysis: text,
    recommendations: recommendations.length > 0 ? recommendations : [
      "Monitorar condições meteorológicas continuamente",
      "Verificar status de sincronização regularmente",
      "Manter comunicação com embarcações ativas"
    ],
    riskAssessment,
    confidence: 0.85,
  };
}
