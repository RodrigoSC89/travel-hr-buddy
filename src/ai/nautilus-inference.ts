/**
 * NautilusInference - Sistema de Inferência IA Local
 * 
 * Módulo de inferência embarcada usando ONNX Runtime Web para análise
 * contextual de logs, relatórios DP, eventos FMEA e outros dados.
 * Opera 100% offline no browser.
 * 
 * @module NautilusInference
 * @version 1.0.0 (Beta 3.1)
 */

import type * as ORT from "onnxruntime-web";

let ort: typeof ORT | null = null;
const loadORT = async () => {
  if (!ort) {
    ort = await import("onnxruntime-web");
  }
  return ort;
};
import { logger } from "@/lib/logger";

export interface InferenceResult {
  text: string;
  confidence: number;
  category?: string;
  timestamp: number;
}

export interface AnalysisResult {
  summary: string;
  sentiment?: "positive" | "negative" | "neutral";
  keywords: string[];
  categories: string[];
  risks?: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
  }[];
  dpEvents?: {
    type: string;
    timestamp: number;
    description: string;
  }[];
  fmeaPatterns?: {
    failureMode: string;
    effect: string;
    severity: number;
  }[];
}

class NautilusInferenceEngine {
  private session: ORT.InferenceSession | null = null;
  private isLoaded = false;
  private modelUrl: string | null = null;

  /**
   * Carrega modelo ONNX para inferência local
   * @param modelUrl - URL do modelo ONNX (ex: /models/nautilus-mini.onnx)
   */
  async loadModel(modelUrl: string): Promise<void> {
    try {
      logger.info("🧠 [Nautilus] Carregando modelo IA embarcada:", modelUrl);
      
      const ortLib = await loadORT();
      this.session = await ortLib.InferenceSession.create(modelUrl, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
      
      this.isLoaded = true;
      this.modelUrl = modelUrl;
      
      logger.info("🧠 [Nautilus] Modelo IA embarcada carregado com sucesso");
      logger.info("🧠 [Nautilus] Inputs:", this.session.inputNames);
      logger.info("🧠 [Nautilus] Outputs:", this.session.outputNames);
    } catch (error) {
      logger.error("🧠 [Nautilus] Erro ao carregar modelo", { error });
      throw error;
    }
  }

  /**
   * Analisa texto usando o modelo carregado
   * @param text - Texto para análise
   * @returns Resultado da inferência
   */
  async analyze(text: string): Promise<InferenceResult> {
    if (!this.isLoaded || !this.session) {
      logger.warn("🧠 [Nautilus] Modelo não carregado. Usando análise baseada em regras.");
      return this.fallbackAnalyze(text);
    }

    try {
      // Prepara tensor de entrada (simplificado para demonstração)
      // Em produção, seria necessário tokenização e embeddings apropriados
      const ortLib = await loadORT();
      const textLength = text.length;
      const inputData = new Float32Array([textLength, text.split(" ").length]);
      const inputTensor = new ortLib.Tensor("float32", inputData, [1, 2]);

      // Executa inferência
      const results = await this.session.run({
        input: inputTensor
      });

      // Processa resultado
      const output = results.output;
      const confidence = output.data[0] as number;

      return {
        text: `🧩 Análise IA: ${text.substring(0, 50)}...`,
        confidence: Math.min(Math.max(confidence, 0), 1),
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error("🧠 [Nautilus] Erro durante inferência", { error });
      return this.fallbackAnalyze(text);
    }
  }

  /**
   * Análise contextual de logs e relatórios DP
   * @param text - Texto para análise
   * @returns Análise detalhada
   */
  async analyzeContext(text: string): Promise<AnalysisResult> {
    logger.info("🧠 [Nautilus] Analisando contexto...");

    // Detecção de palavras-chave
    const keywords = this.extractKeywords(text);
    
    // Detecção de categorias
    const categories = this.detectCategories(text);
    
    // Análise de sentimento
    const sentiment = this.analyzeSentiment(text);
    
    // Detecção de eventos DP
    const dpEvents = this.detectDPEvents(text);
    
    // Detecção de padrões FMEA
    const fmeaPatterns = this.detectFMEAPatterns(text);
    
    // Detecção de riscos
    const risks = this.detectRisks(text);

    const summary = this.generateSummary(text, keywords, categories);

    return {
      summary,
      sentiment,
      keywords,
      categories,
      dpEvents,
      fmeaPatterns,
      risks
    };
  }

  /**
   * Análise fallback baseada em regras (quando modelo não está disponível)
   */
  private fallbackAnalyze(text: string): InferenceResult {
    const confidence = text.length > 10 ? 0.7 : 0.5;
    return {
      text: `🧩 Análise baseada em regras: ${text.substring(0, 50)}...`,
      confidence,
      category: "general",
      timestamp: Date.now()
    };
  }

  /**
   * Extrai palavras-chave do texto
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(["o", "a", "de", "da", "do", "e", "em", "para", "com", "por", "que", "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for"]);
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Conta frequência
    const freq = new Map<string, number>();
    words.forEach(word => {
      freq.set(word, (freq.get(word) || 0) + 1);
    });
    
    // Retorna top 10 palavras
    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * Detecta categorias do texto
   */
  private detectCategories(text: string): string[] {
    const categories: string[] = [];
    const lowerText = text.toLowerCase();

    const categoryPatterns = {
      "DP System": /\b(dp|dynamic positioning|thruster|position|reference)\b/i,
      "FMEA": /\b(fmea|failure|risk|mitigation|failure mode)\b/i,
      "ASOG": /\b(asog|procedure|emergency|shutdown)\b/i,
      "Safety": /\b(safety|hazard|incident|accident|injury)\b/i,
      "Operations": /\b(operation|maintenance|inspection|repair)\b/i,
      "Weather": /\b(weather|wind|wave|current|forecast)\b/i,
      "Compliance": /\b(compliance|audit|regulation|standard|imca)\b/i,
    };

    Object.entries(categoryPatterns).forEach(([category, pattern]) => {
      if (pattern.test(lowerText)) {
        categories.push(category);
      }
    });

    return categories;
  }

  /**
   * Analisa sentimento do texto
   */
  private analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
    const lowerText = text.toLowerCase();
    
    const positiveWords = ["good", "excellent", "success", "normal", "stable", "bom", "excelente", "sucesso", "normal", "estável"];
    const negativeWords = ["fail", "error", "critical", "alarm", "warning", "falha", "erro", "crítico", "alerta", "aviso"];
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  }

  /**
   * Detecta eventos DP
   */
  private detectDPEvents(text: string): AnalysisResult["dpEvents"] {
    const events: AnalysisResult["dpEvents"] = [];
    const lowerText = text.toLowerCase();

    const dpPatterns = [
      { pattern: /dp (system|operating)/i, type: "DP System Status" },
      { pattern: /thruster (allocation|failure|update)/i, type: "Thruster Event" },
      { pattern: /position (accuracy|loss|reference)/i, type: "Position Event" },
      { pattern: /reference (loss|update|system)/i, type: "Reference System Event" },
    ];

    dpPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(lowerText)) {
        events?.push({
          type,
          timestamp: Date.now(),
          description: text.substring(0, 100)
        });
      }
    });

    return events;
  }

  /**
   * Detecta padrões FMEA
   */
  private detectFMEAPatterns(text: string): AnalysisResult["fmeaPatterns"] {
    const patterns: AnalysisResult["fmeaPatterns"] = [];
    const lowerText = text.toLowerCase();

    const fmeaPatterns = [
      {
        match: /thruster fail/i,
        failureMode: "Thruster Failure",
        effect: "Loss of position keeping capability",
        severity: 8
      },
      {
        match: /position reference loss/i,
        failureMode: "Position Reference Loss",
        effect: "Degraded position accuracy",
        severity: 7
      },
      {
        match: /power (loss|failure)/i,
        failureMode: "Power System Failure",
        effect: "Complete system shutdown",
        severity: 9
      },
    ];

    fmeaPatterns.forEach(({ match, failureMode, effect, severity }) => {
      if (match.test(lowerText)) {
        patterns?.push({ failureMode, effect, severity });
      }
    });

    return patterns;
  }

  /**
   * Detecta riscos no texto
   */
  private detectRisks(text: string): AnalysisResult["risks"] {
    const risks: AnalysisResult["risks"] = [];
    const lowerText = text.toLowerCase();

    const riskPatterns = [
      {
        pattern: /critical|emergency/i,
        type: "Critical Event",
        severity: "critical" as const,
        description: "Critical event or emergency situation detected"
      },
      {
        pattern: /high (risk|severity)/i,
        type: "High Risk",
        severity: "high" as const,
        description: "High risk situation identified"
      },
      {
        pattern: /warning|alert/i,
        type: "Warning",
        severity: "medium" as const,
        description: "Warning or alert condition"
      },
    ];

    riskPatterns.forEach(({ pattern, type, severity, description }) => {
      if (pattern.test(lowerText)) {
        risks?.push({ type, severity, description });
      }
    });

    return risks;
  }

  /**
   * Gera resumo do texto
   */
  private generateSummary(text: string, keywords: string[], categories: string[]): string {
    const preview = text.substring(0, 150);
    const categoryStr = categories.length > 0 ? ` Categories: ${categories.join(", ")}.` : "";
    const keywordStr = keywords.length > 0 ? ` Key terms: ${keywords.slice(0, 5).join(", ")}.` : "";
    
    return `${preview}...${categoryStr}${keywordStr}`;
  }

  /**
   * Verifica se o modelo está carregado
   */
  isModelLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Obtém informações do modelo
   */
  getModelInfo() {
    return {
      loaded: this.isLoaded,
      url: this.modelUrl,
      inputs: this.session?.inputNames || [],
      outputs: this.session?.outputNames || []
    };
  }

  /**
   * Descarrega o modelo da memória
   */
  async unloadModel(): Promise<void> {
    if (this.session) {
      logger.info("🧠 [Nautilus] Descarregando modelo...");
      this.session = null;
      this.isLoaded = false;
      this.modelUrl = null;
      logger.info("🧠 [Nautilus] Modelo descarregado");
    }
  }
}

// Exporta instância singleton
export const nautilusInference = new NautilusInferenceEngine();
