/**
 * Pattern Recognition
 * Learns behavioral patterns and predicts system issues
 */

import { logsEngine } from "@/lib/monitoring/LogsEngine";
import type { AutonomousAction } from "./AutonomyEngine";

export interface BehaviorPattern {
  id: string;
  moduleId: string;
  trigger: string;
  description: string;
  recommendedAction: string;
  confidence: number;
  occurrences: number;
  lastSeen: string;
  successRate: number;
}

export interface FailurePattern {
  id: string;
  moduleId: string;
  description: string;
  symptoms: string[];
  confidence: number;
  occurrences: number;
}

class PatternRecognition {
  private patterns: Map<string, BehaviorPattern> = new Map();
  private failurePatterns: Map<string, FailurePattern> = new Map();
  private learningInterval: NodeJS.Timeout | null = null;
  private readonly LEARNING_INTERVAL_MS = 60000; // 1 minute

  /**
   * Start pattern learning
   */
  start() {
    console.log("🧠 PatternRecognition: Iniciando aprendizado de padrões...");
    
    // Load existing patterns from storage
    this.loadPatterns();

    // Periodic pattern analysis
    this.learningInterval = setInterval(() => {
      this.analyzePatterns();
    }, this.LEARNING_INTERVAL_MS);

    logsEngine.info("pattern-recognition", "Sistema de reconhecimento de padrões ativado");
  }

  /**
   * Stop pattern learning
   */
  stop() {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    this.savePatterns();
    console.log("🧠 PatternRecognition: Stopped");
  }

  /**
   * Record an autonomous action for learning
   */
  recordAction(action: AutonomousAction, success: boolean) {
    const patternKey = `${action.moduleId}_${action.action}`;
    const existing = this.patterns.get(patternKey);

    if (existing) {
      // Update existing pattern
      existing.occurrences++;
      existing.lastSeen = action.timestamp;
      existing.successRate = (
        (existing.successRate * (existing.occurrences - 1) + (success ? 1 : 0)) / 
        existing.occurrences
      );
      existing.confidence = Math.min(100, existing.confidence + (success ? 2 : -5));
    } else {
      // Create new pattern
      this.patterns.set(patternKey, {
        id: patternKey,
        moduleId: action.moduleId,
        trigger: this.inferTrigger(action),
        description: action.reason,
        recommendedAction: action.action,
        confidence: action.confidence * 100,
        occurrences: 1,
        lastSeen: action.timestamp,
        successRate: success ? 100 : 0
      });
    }

    this.savePatterns();
  }

  /**
   * Find a pattern for a specific module and issue
   */
  findPattern(moduleId: string, issueType: string): BehaviorPattern | null {
    for (const pattern of this.patterns.values()) {
      if (
        pattern.moduleId === moduleId && 
        pattern.trigger.includes(issueType) &&
        pattern.confidence > 50 &&
        pattern.successRate > 60
      ) {
        return pattern;
      }
    }
    return null;
  }

  /**
   * Detect known failure patterns
   */
  detectKnownFailure(moduleId: string): FailurePattern | null {
    for (const failure of this.failurePatterns.values()) {
      if (failure.moduleId === moduleId && failure.confidence > 70) {
        return failure;
      }
    }
    return null;
  }

  /**
   * Analyze logs to discover new patterns
   */
  private analyzePatterns() {
    const recentLogs = logsEngine.getRecentLogs(100);
    const errorLogs = recentLogs.filter(log => log.level === "error" || log.level === "critical");

    // Group errors by module
    const errorsByModule = errorLogs.reduce((acc, log) => {
      const module = log.module || "unknown";
      if (!acc[module]) acc[module] = [];
      acc[module].push(log);
      return acc;
    }, {} as Record<string, typeof errorLogs>);

    // Detect recurring failure patterns
    for (const [moduleId, errors] of Object.entries(errorsByModule)) {
      if (errors.length >= 3) {
        const patternId = `failure_${moduleId}_${Date.now()}`;
        const symptoms = [...new Set(errors.map(e => e.message))];
        
        this.failurePatterns.set(patternId, {
          id: patternId,
          moduleId,
          description: `Falha recorrente detectada em ${moduleId}`,
          symptoms,
          confidence: Math.min(100, errors.length * 15),
          occurrences: errors.length
        });

        logsEngine.warning("pattern-recognition", "Novo padrão de falha detectado", {
          moduleId,
          occurrences: errors.length,
          symptoms
        });
      }
    }
  }

  /**
   * Infer trigger from action
   */
  private inferTrigger(action: AutonomousAction): string {
    const triggerMap: Record<string, string> = {
      "restart": "high-error-rate",
      "cache-clear": "memory-issue",
      "reconnect-ai": "ai-connection-failure",
      "hotfix": "known-failure-pattern",
      "fallback": "critical-degradation"
    };
    return triggerMap[action.action] || "unknown-trigger";
  }

  /**
   * Load patterns from localStorage
   */
  private loadPatterns() {
    try {
      const stored = localStorage.getItem("nautilus_patterns");
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(data.patterns || []);
        this.failurePatterns = new Map(data.failurePatterns || []);
        console.log(`🧠 Carregados ${this.patterns.size} padrões conhecidos`);
      }
    } catch (error) {
      console.error("Erro ao carregar padrões:", error);
    }
  }

  /**
   * Save patterns to localStorage
   */
  private savePatterns() {
    try {
      const data = {
        patterns: Array.from(this.patterns.entries()),
        failurePatterns: Array.from(this.failurePatterns.entries()),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem("nautilus_patterns", JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar padrões:", error);
    }
  }

  /**
   * Get all learned patterns
   */
  getAllPatterns(): BehaviorPattern[] {
    return Array.from(this.patterns.values());
  }

  /**
   * Get pattern statistics
   */
  getStatistics() {
    const patterns = Array.from(this.patterns.values());
    return {
      totalPatterns: patterns.length,
      averageConfidence: patterns.length > 0 
        ? patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length 
        : 0,
      averageSuccessRate: patterns.length > 0
        ? patterns.reduce((sum, p) => sum + p.successRate, 0) / patterns.length
        : 0,
      knownFailures: this.failurePatterns.size
    };
  }
}

// Singleton instance
export const patternRecognition = new PatternRecognition();
