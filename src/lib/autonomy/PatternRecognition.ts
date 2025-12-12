/**
 * Pattern Recognition - Optimized
 * Lightweight pattern recognition (disabled by default)
 */

import { Logger } from "@/lib/utils/logger";
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
  private isRunning = false;

  start() {
    // Disabled by default
    const ENABLE = import.meta.env.VITE_ENABLE_AUTONOMY === "true";
    if (!ENABLE) {
      Logger.info("PatternRecognition disabled", undefined, "PatternRecognition");
      return;
    }

    if (this.isRunning) return;
    this.isRunning = true;
    
    this.loadPatterns();
    Logger.info("PatternRecognition starting", undefined, "PatternRecognition");
  }

  stop() {
    this.isRunning = false;
    
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }
    
    this.savePatterns();
  }

  recordAction(action: AutonomousAction, success: boolean) {
    if (!this.isRunning) return;
    
    const patternKey = `${action.moduleId}_${action.action}`;
    const existing = this.patterns.get(patternKey);

    if (existing) {
      existing.occurrences++;
      existing.lastSeen = action.timestamp;
      existing.successRate = (
        (existing.successRate * (existing.occurrences - 1) + (success ? 1 : 0)) / 
        existing.occurrences
      );
    } else {
      this.patterns.set(patternKey, {
        id: patternKey,
        moduleId: action.moduleId,
        trigger: action.action,
        description: action.reason,
        recommendedAction: action.action,
        confidence: action.confidence * 100,
        occurrences: 1,
        lastSeen: action.timestamp,
        successRate: success ? 100 : 0
      });
    }
  }

  findPattern(moduleId: string, issueType: string): BehaviorPattern | null {
    for (const pattern of this.patterns.values()) {
      if (
        pattern.moduleId === moduleId && 
        pattern.trigger.includes(issueType) &&
        pattern.confidence > 50
      ) {
        return pattern;
      }
    }
    return null;
  }

  detectKnownFailure(moduleId: string): FailurePattern | null {
    for (const failure of this.failurePatterns.values()) {
      if (failure.moduleId === moduleId && failure.confidence > 70) {
        return failure;
      }
    }
    return null;
  }

  private loadPatterns() {
    try {
      const stored = localStorage.getItem("nautilus_patterns");
      if (stored) {
        const data = JSON.parse(stored);
        this.patterns = new Map(data.patterns || []);
        this.failurePatterns = new Map(data.failurePatterns || []);
      }
    } catch {
      // Ignore load errors
    }
  }

  private savePatterns() {
    try {
      localStorage.setItem("nautilus_patterns", JSON.stringify({
        patterns: Array.from(this.patterns.entries()),
        failurePatterns: Array.from(this.failurePatterns.entries()),
      }));
    } catch {
      // Ignore save errors
    }
  }

  getAllPatterns(): BehaviorPattern[] {
    return Array.from(this.patterns.values());
  }

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
    });
  }
}

export const patternRecognition = new PatternRecognition();
