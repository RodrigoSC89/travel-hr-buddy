/**
 * NautilusInference - Embedded AI Inference Engine
 * Local offline AI analysis using ONNX Runtime
 * Phase Beta 3.1
 */

import * as ort from "onnxruntime-web";

export class NautilusInference {
  private session: ort.InferenceSession | null = null;
  private modelUrl: string | null = null;

  /**
   * Load ONNX model
   * @param modelUrl URL or path to ONNX model file
   */
  async loadModel(modelUrl: string): Promise<void> {
    try {
      console.log("🧠 [NautilusAI] Loading model from:", modelUrl);

      this.session = await ort.InferenceSession.create(modelUrl);
      this.modelUrl = modelUrl;

      console.log("🧠 [NautilusAI] Model loaded successfully:", modelUrl);
      console.log("🧠 [NautilusAI] Input names:", this.session.inputNames);
      console.log("🧠 [NautilusAI] Output names:", this.session.outputNames);
    } catch (error) {
      console.error("🧠 [NautilusAI] Failed to load model:", error);
      throw new Error(`Failed to load AI model: ${error}`);
    }
  }

  /**
   * Analyze text using the loaded model
   * @param text Input text to analyze
   * @returns Analysis result
   */
  async analyze(text: string): Promise<string> {
    if (!this.session) {
      throw new Error("🧠 [NautilusAI] Model not loaded. Call loadModel() first.");
    }

    try {
      console.log("🧠 [NautilusAI] Analyzing text:", text.substring(0, 50) + "...");

      // Convert text to embeddings (simplified - in production use proper tokenizer)
      const embeddings = this.textToEmbeddings(text);

      // Create input tensor
      const inputTensor = new ort.Tensor(
        "float32",
        embeddings,
        [1, embeddings.length]
      );

      // Run inference
      const feeds: Record<string, ort.Tensor> = {};
      feeds[this.session.inputNames[0]] = inputTensor;

      const results = await this.session.run(feeds);
      const outputName = this.session.outputNames[0];
      const output = results[outputName];

      console.log("🧠 [NautilusAI] Inference complete");

      return this.formatOutput(output);
    } catch (error) {
      console.error("🧠 [NautilusAI] Analysis error:", error);
      throw new Error(`Analysis failed: ${error}`);
    }
  }

  /**
   * Analyze contextual logs and DP reports
   * @param logs Array of log entries
   * @returns Contextual analysis
   */
  async analyzeContext(logs: string[]): Promise<{
    summary: string;
    insights: string[];
    risks: string[];
  }> {
    if (!this.session) {
      throw new Error("🧠 [NautilusAI] Model not loaded. Call loadModel() first.");
    }

    console.log(`🧠 [NautilusAI] Analyzing ${logs.length} log entries`);

    // Combine logs for context
    const combinedText = logs.join(" | ");
    const result = await this.analyze(combinedText);

    // Parse result (simplified - in production use proper NLP)
    return {
      summary: `Analysis of ${logs.length} entries: ${result}`,
      insights: this.extractInsights(result, logs),
      risks: this.extractRisks(result, logs),
    };
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.session !== null;
  }

  /**
   * Get model information
   */
  getModelInfo(): { url: string | null; loaded: boolean } {
    return {
      url: this.modelUrl,
      loaded: this.session !== null,
    };
  }

  /**
   * Unload model and free resources
   */
  async unload(): Promise<void> {
    if (this.session) {
      console.log("🧠 [NautilusAI] Unloading model");
      // ONNX Runtime Web doesn't have explicit dispose in current version
      this.session = null;
      this.modelUrl = null;
      console.log("🧠 [NautilusAI] Model unloaded");
    }
  }

  /**
   * Convert text to embeddings (simplified)
   * In production, use proper tokenizer and embedding model
   */
  private textToEmbeddings(text: string): Float32Array {
    // Simple character-based encoding (placeholder)
    // In production, use proper tokenization (e.g., BERT tokenizer)
    const maxLength = 128;
    const embeddings = new Float32Array(maxLength);

    for (let i = 0; i < Math.min(text.length, maxLength); i++) {
      embeddings[i] = text.charCodeAt(i) / 255.0; // Normalize to [0, 1]
    }

    return embeddings;
  }

  /**
   * Format model output
   */
  private formatOutput(output: ort.Tensor): string {
    const data = output.data as Float32Array;

    // Simple classification output
    if (data.length === 1) {
      return `🧩 Confidence: ${(data[0] * 100).toFixed(2)}%`;
    }

    // Multi-class output
    const maxIndex = data.indexOf(Math.max(...Array.from(data)));
    const confidence = data[maxIndex];

    return `🧩 Class ${maxIndex} (confidence: ${(confidence * 100).toFixed(2)}%)`;
  }

  /**
   * Extract insights from analysis
   */
  private extractInsights(result: string, logs: string[]): string[] {
    const insights: string[] = [];

    // Pattern detection (simplified)
    if (logs.some((log) => log.toLowerCase().includes("error"))) {
      insights.push("⚠️ Error patterns detected in logs");
    }

    if (logs.some((log) => log.toLowerCase().includes("warning"))) {
      insights.push("⚡ Warning conditions present");
    }

    if (logs.length > 10) {
      insights.push("📊 High volume of events detected");
    }

    return insights.length > 0 ? insights : ["✅ No significant patterns detected"];
  }

  /**
   * Extract risks from analysis
   */
  private extractRisks(result: string, logs: string[]): string[] {
    const risks: string[] = [];

    // Risk pattern detection (simplified)
    const criticalKeywords = ["critical", "failure", "emergency", "alarm"];
    const hasCritical = logs.some((log) =>
      criticalKeywords.some((kw) => log.toLowerCase().includes(kw))
    );

    if (hasCritical) {
      risks.push("🔴 Critical events detected - immediate attention required");
    }

    const dpKeywords = ["dp", "dynamic positioning", "thruster"];
    const hasDPIssues = logs.some((log) =>
      dpKeywords.some((kw) => log.toLowerCase().includes(kw))
    );

    if (hasDPIssues) {
      risks.push("⚓ DP system events require monitoring");
    }

    return risks.length > 0 ? risks : ["✅ No significant risks identified"];
  }
}

// Singleton instance
export const nautilusInference = new NautilusInference();
