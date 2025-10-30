/**
 * PATCH 591 - SocioCognitive Interaction Layer
 * 
 * Camada de interação que analisa intenções e contexto emocional do operador
 * 
 * @module ai/interface/sociocognitive-layer
 * @created 2025-01-24
 */

export type UrgencyLevel = "low" | "medium" | "high" | "critical";
export type ToneType = "calm" | "neutral" | "urgent" | "stressed" | "confident";
export type OperationalLoad = "minimal" | "normal" | "high" | "overload";

export interface CommandInput {
  text: string;
  timestamp: Date;
  source?: "text" | "voice";
  metadata?: Record<string, unknown>;
}

export interface CommandInterpretation {
  command: string;
  urgency: UrgencyLevel;
  tone: ToneType;
  intent: string;
  context: {
    operationalLoad: OperationalLoad;
    timestamp: Date;
  };
  confidence: number;
}

export interface SocialContext {
  commandId: string;
  interpretation: CommandInterpretation;
  response: string;
  adaptations: string[];
  timestamp: Date;
}

class SocioCognitiveLayer {
  private contextLog: SocialContext[] = [];
  private currentOperationalLoad: OperationalLoad = "normal";

  /**
   * Interpreta comando com base em urgência e tom
   */
  interpretCommand(input: CommandInput): CommandInterpretation {
    const urgency = this.detectUrgency(input.text);
    const tone = this.detectTone(input.text);
    const intent = this.extractIntent(input.text);
    
    const interpretation: CommandInterpretation = {
      command: input.text,
      urgency,
      tone,
      intent,
      context: {
        operationalLoad: this.currentOperationalLoad,
        timestamp: input.timestamp
      },
      confidence: this.calculateConfidence(urgency, tone)
    };

    return interpretation;
  }

  /**
   * Adapta resposta baseada em carga operacional
   */
  adaptResponse(interpretation: CommandInterpretation, baseResponse: string): string {
    const adaptations: string[] = [];
    let response = baseResponse;

    // Adapta resposta com base na urgência
    if (interpretation.urgency === "critical") {
      response = `🚨 URGENTE: ${response}`;
      adaptations.push("urgency-indicator-added");
    }

    // Adapta resposta com base na carga operacional
    if (interpretation.context.operationalLoad === "overload") {
      response += "\n\n💡 Sugestão: Priorize tarefas críticas. Posso ajudar a reorganizar.";
      adaptations.push("workload-suggestion-added");
    } else if (interpretation.context.operationalLoad === "high") {
      response += "\n\n📊 Carga alta detectada. Mantenha foco nas prioridades.";
      adaptations.push("focus-reminder-added");
    }

    // Adapta resposta com base no tom
    if (interpretation.tone === "stressed") {
      response += "\n\n🧘 Respire fundo. Estou aqui para ajudar.";
      adaptations.push("stress-support-added");
    }

    // Log contexto social
    this.logSocialContext(interpretation, response, adaptations);

    return response;
  }

  /**
   * Atualiza carga operacional percebida
   */
  setOperationalLoad(load: OperationalLoad): void {
    this.currentOperationalLoad = load;
  }

  /**
   * Obtém carga operacional atual
   */
  getOperationalLoad(): OperationalLoad {
    return this.currentOperationalLoad;
  }

  /**
   * Log de contexto social
   */
  private logSocialContext(
    interpretation: CommandInterpretation,
    response: string,
    adaptations: string[]
  ): void {
    const context: SocialContext = {
      commandId: `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      interpretation,
      response,
      adaptations,
      timestamp: new Date()
    };

    this.contextLog.push(context);

    // Mantém apenas os últimos 100 logs
    if (this.contextLog.length > 100) {
      this.contextLog.shift();
    }

    console.log("[SocioCognitive] Context logged:", {
      commandId: context.commandId,
      urgency: interpretation.urgency,
      tone: interpretation.tone,
      intent: interpretation.intent,
      operationalLoad: interpretation.context.operationalLoad,
      adaptations
    });
  }

  /**
   * Obtém histórico de contexto social
   */
  getContextLog(): SocialContext[] {
    return [...this.contextLog];
  }

  /**
   * Limpa log de contexto
   */
  clearContextLog(): void {
    this.contextLog = [];
  }

  /**
   * Detecta urgência do comando
   */
  private detectUrgency(text: string): UrgencyLevel {
    const lowerText = text.toLowerCase();
    
    const criticalKeywords = ["emergência", "urgente", "crítico", "agora", "imediatamente", "socorro"];
    const highKeywords = ["rápido", "importante", "prioridade", "logo"];
    const mediumKeywords = ["quando possível", "assim que", "favor"];
    
    if (criticalKeywords.some(keyword => lowerText.includes(keyword))) {
      return "critical";
    }
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return "high";
    }
    if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return "medium";
    }
    
    return "low";
  }

  /**
   * Detecta tom do comando
   */
  private detectTone(text: string): ToneType {
    const lowerText = text.toLowerCase();
    
    const stressedKeywords = ["não aguento", "difícil", "problema", "ajuda", "preciso urgente"];
    const urgentKeywords = ["urgente", "rápido", "agora"];
    const calmKeywords = ["por favor", "quando puder", "obrigado"];
    const confidentKeywords = ["sei", "vou", "farei", "certeza"];
    
    if (stressedKeywords.some(keyword => lowerText.includes(keyword))) {
      return "stressed";
    }
    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
      return "urgent";
    }
    if (calmKeywords.some(keyword => lowerText.includes(keyword))) {
      return "calm";
    }
    if (confidentKeywords.some(keyword => lowerText.includes(keyword))) {
      return "confident";
    }
    
    return "neutral";
  }

  /**
   * Extrai intenção do comando
   */
  private extractIntent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("criar") || lowerText.includes("novo")) {
      return "create";
    }
    if (lowerText.includes("deletar") || lowerText.includes("remover")) {
      return "delete";
    }
    if (lowerText.includes("atualizar") || lowerText.includes("modificar")) {
      return "update";
    }
    if (lowerText.includes("buscar") || lowerText.includes("encontrar") || lowerText.includes("procurar")) {
      return "search";
    }
    if (lowerText.includes("ajuda") || lowerText.includes("como")) {
      return "help";
    }
    if (lowerText.includes("status") || lowerText.includes("situação")) {
      return "status";
    }
    
    return "general";
  }

  /**
   * Calcula confiança da interpretação
   */
  private calculateConfidence(urgency: UrgencyLevel, tone: ToneType): number {
    let confidence = 0.7; // Base confidence
    
    // Aumenta confiança se urgência e tom são consistentes
    if ((urgency === "critical" && tone === "urgent") ||
        (urgency === "critical" && tone === "stressed")) {
      confidence = 0.95;
    } else if ((urgency === "high" && tone === "urgent") ||
               (urgency === "medium" && tone === "calm")) {
      confidence = 0.85;
    }
    
    return confidence;
  }
}

// Instância singleton
export const socioCognitiveLayer = new SocioCognitiveLayer();
