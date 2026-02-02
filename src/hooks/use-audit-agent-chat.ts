/**
 * Audit Agent Chat Hook - Real Edge Function Integration
 * Connects audit agents to their respective Edge Functions
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  agentId?: string;
  isLoading?: boolean;
}

interface AuditAgentConfig {
  id: string;
  edgeFunction: string;
  fallbackFunction?: string;
}

// Map agent IDs to their corresponding Edge Functions
const AGENT_EDGE_FUNCTIONS: Record<string, AuditAgentConfig> = {
  peotram: { id: "peotram", edgeFunction: "peotram-ai-chat", fallbackFunction: "nauti-brain" },
  peodp: { id: "peodp", edgeFunction: "peodp-ai-chat", fallbackFunction: "nauti-brain" },
  sgso: { id: "sgso", edgeFunction: "sgso-assistant", fallbackFunction: "nauti-brain" },
  mlc: { id: "mlc", edgeFunction: "mlc-assistant", fallbackFunction: "nauti-brain" },
  ism: { id: "ism", edgeFunction: "compliance-ai", fallbackFunction: "nauti-brain" },
  isps: { id: "isps", edgeFunction: "compliance-ai", fallbackFunction: "nauti-brain" },
  marpol: { id: "marpol", edgeFunction: "environmental-ai", fallbackFunction: "nauti-brain" },
  solas: { id: "solas", edgeFunction: "safety-ai", fallbackFunction: "nauti-brain" },
  stcw: { id: "stcw", edgeFunction: "training-ai-assistant", fallbackFunction: "nauti-brain" },
  esg: { id: "esg", edgeFunction: "environmental-ai", fallbackFunction: "nauti-brain" }
};

export function useAuditAgentChat(agentId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const agentConfig = AGENT_EDGE_FUNCTIONS[agentId] || { 
    id: agentId, 
    edgeFunction: "nauti-brain" 
  };

  const sendMessage = useCallback(async (userMessage: string): Promise<string> => {
    setIsLoading(true);

    // Add user message immediately
    const userMsgId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Add loading message
    const loadingId = `loading-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: loadingId,
      role: "assistant",
      content: "Processando...",
      timestamp: new Date(),
      agentId,
      isLoading: true
    }]);

    try {
      // Try primary Edge Function
      const { data, error } = await supabase.functions.invoke(agentConfig.edgeFunction, {
        body: {
          message: userMessage,
          context: agentId,
          agentType: agentId.toUpperCase()
        }
      });

      if (error) {
        // Try fallback if primary fails
        if (agentConfig.fallbackFunction) {
          logger.warn(`Primary function ${agentConfig.edgeFunction} failed, trying fallback`);
          const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke(
            agentConfig.fallbackFunction,
            {
              body: {
                message: userMessage,
                context: `Você é o agente ${agentId.toUpperCase()} especializado em auditoria marítima. Responda à seguinte pergunta: ${userMessage}`,
                module: agentId
              }
            }
          );

          if (fallbackError) throw fallbackError;
          
          const response = fallbackData?.response || fallbackData?.message || 
            "Desculpe, não consegui processar sua solicitação.";
          
          // Remove loading and add response
          setMessages(prev => prev
            .filter(m => m.id !== loadingId)
            .concat({
              id: `agent-${Date.now()}`,
              role: "assistant",
              content: response,
              timestamp: new Date(),
              agentId
            })
          );
          
          setIsLoading(false);
          return response;
        }
        throw error;
      }

      const response = data?.response || data?.message || data?.answer || 
        JSON.stringify(data) || "Resposta processada com sucesso.";

      // Remove loading and add response
      setMessages(prev => prev
        .filter(m => m.id !== loadingId)
        .concat({
          id: `agent-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
          agentId
        })
      );

      setIsLoading(false);
      return response;

    } catch (error) {
      logger.error("Audit agent chat error", { agentId, error });
      
      // Generate fallback response based on agent type
      const fallbackResponse = generateFallbackResponse(agentId, userMessage);
      
      setMessages(prev => prev
        .filter(m => m.id !== loadingId)
        .concat({
          id: `agent-${Date.now()}`,
          role: "assistant",
          content: fallbackResponse,
          timestamp: new Date(),
          agentId
        })
      );

      setIsLoading(false);
      return fallbackResponse;
    }
  }, [agentId, agentConfig]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const initializeChat = useCallback((welcomeMessage: string) => {
    setMessages([{
      id: `welcome-${agentId}`,
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
      agentId
    }]);
  }, [agentId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    initializeChat
  };
}

function generateFallbackResponse(agentId: string, question: string): string {
  const agentResponses: Record<string, string> = {
    peotram: `📋 **Análise PEOTRAM**

Sua pergunta sobre "${question.substring(0, 50)}..." foi registrada.

O Programa de Excelência Operacional possui **13 elementos obrigatórios** que devem ser auditados periodicamente:
1. Liderança e Compromisso
2. Políticas e Objetivos
3. Organização, Recursos e Documentação
4. Gestão de Riscos
5. Planejamento de Operações
6. Manutenção e Integridade
7. Gestão de Mudanças
8. Gestão de Emergências
9. Competência e Treinamento
10. Investigação de Incidentes
11. Comunicação
12. Monitoramento e Medição
13. Auditorias e Revisões

🔗 **Referências:** PEOTRAM Rev. 6, ANP, NORMAM-01`,

    sgso: `📋 **Análise SGSO**

Base Normativa: **Resolução ANP nº 43/2007**

As 17 práticas obrigatórias incluem:
- Gestão de Segurança Operacional
- Análise de Riscos
- Procedimentos de Trabalho
- Gestão de Mudanças
- Treinamento e Capacitação

📎 **Referências:** ANP 43/2007, API RP 75`,

    mlc: `⚖️ **Análise MLC 2006**

A Maritime Labour Convention estabelece direitos e condições mínimas para marítimos através de 5 Títulos:

- **Título 1:** Requisitos mínimos para trabalho em navios
- **Título 2:** Condições de emprego
- **Título 3:** Acomodação, lazer, alimentação e catering
- **Título 4:** Proteção da saúde, cuidados médicos, bem-estar e segurança social
- **Título 5:** Conformidade e execução

📎 **Referências:** MLC 2006, ILO Guidelines`,

    ism: `🛡️ **Análise ISM Code**

O International Safety Management Code estabelece:
- Safety Management System (SMS)
- Document of Compliance (DOC)
- Safety Management Certificate (SMC)
- Gestão de emergências a bordo

📎 **Referências:** ISM Code, SOLAS Cap IX, IMO`,

    isps: `🔐 **Análise ISPS Code**

O International Ship and Port Facility Security Code cobre:
- Ship Security Plan (SSP)
- Níveis de segurança 1, 2 e 3
- International Ship Security Certificate (ISSC)
- Port Facility Security Assessment

📎 **Referências:** ISPS Code, SOLAS Cap XI-2, MARSEC`,

    marpol: `🌊 **Análise MARPOL**

A Convenção MARPOL 73/78 cobre os anexos:
- Anexo I: Poluição por óleo
- Anexo II: Substâncias líquidas nocivas
- Anexo III: Substâncias perigosas em embalagens
- Anexo IV: Esgoto sanitário
- Anexo V: Lixo
- Anexo VI: Poluição atmosférica

📎 **Referências:** MARPOL 73/78, BWM Convention`,

    solas: `🚢 **Análise SOLAS**

A Convenção SOLAS abrange:
- Equipamentos de salvatagem (LSA)
- Equipamentos de combate a incêndio (FFE)
- Navegação segura
- Estabilidade e subdivisão
- Comunicações de rádio

📎 **Referências:** SOLAS 1974, IMO Resolutions`,

    stcw: `📚 **Análise STCW**

A Convenção STCW 1978/2010 define:
- Certificação de competência
- Requisitos mínimos de treinamento
- Horas de descanso (10h em 24h, 77h em 7 dias)
- Qualificações DP (IMCA)
- Manila Amendments

📎 **Referências:** STCW 1978/2010, Manila Amendments`,

    esg: `🌱 **Análise ESG Marítimo**

Métricas ESG para operações marítimas:
- **Environmental:** CII Rating, EEXI, emissões GHG
- **Social:** Diversidade, MLC compliance, bem-estar
- **Governance:** Ética, transparência, auditorias

📎 **Referências:** IMO 2050, EU MRV, GRI Standards`
  };

  return agentResponses[agentId] || `Analisei sua pergunta sobre "${question.substring(0, 50)}...". 
  
Por favor, forneça mais detalhes para uma análise mais precisa. Posso ajudar com consultas sobre compliance, auditorias e regulamentações marítimas.`;
}
