/**
 * SEVI - Sistema de Evolução Vetorial Inteligente
 * Self-learning system based on feedback and operational patterns
 * NAUTILUS ONE v4.0 - Autonomous Platform
 */

export interface FeedbackEntry {
  id: string;
  moduleId: string;
  actionType: string;
  originalPrediction: number;
  actualOutcome: number;
  wasCorrect: boolean;
  timestamp: Date;
  context: Record<string, unknown>;
}

export interface LearningVector {
  moduleId: string;
  weights: number[];
  bias: number;
  accuracy: number;
  sampleCount: number;
  lastUpdated: Date;
}

export interface EvolutionMetrics {
  globalAccuracy: number;
  learningRate: number;
  totalFeedback: number;
  improvementTrend: number;
  moduleMetrics: Map<string, { accuracy: number; trend: number }>;
}

export interface PatternRecognition {
  pattern: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  suggestedAction: string;
}

/**
 * SEVI - Intelligent Vector Evolution System
 */
export class SEVILearningEngine {
  private feedbackHistory: FeedbackEntry[] = [];
  private learningVectors: Map<string, LearningVector> = new Map();
  private patterns: PatternRecognition[] = [];
  private learningRate = 0.01;
  private momentum = 0.9;

  constructor() {
    this.loadState();
  }

  /**
   * Process new feedback and update learning vectors
   */
  processFeedback(feedback: Omit<FeedbackEntry, 'id' | 'timestamp'>): void {
    const entry: FeedbackEntry = {
      ...feedback,
      id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date()
    };

    this.feedbackHistory.push(entry);
    this.updateLearningVector(entry);
    this.detectPatterns(entry);
    this.adjustLearningRate();
    this.saveState();
  }

  /**
   * Update learning vector based on feedback using gradient descent
   */
  private updateLearningVector(feedback: FeedbackEntry): void {
    const { moduleId, originalPrediction, actualOutcome, context } = feedback;
    
    let vector = this.learningVectors.get(moduleId);
    if (!vector) {
      vector = this.initializeVector(moduleId);
    }

    // Calculate error
    const error = actualOutcome - originalPrediction;
    const errorSquared = error * error;

    // Update weights using gradient descent with momentum
    const contextValues = Object.values(context).filter((v): v is number => typeof v === 'number');
    
    if (contextValues.length > 0) {
      // Ensure weights array matches context size
      while (vector.weights.length < contextValues.length) {
        vector.weights.push(Math.random() * 0.1 - 0.05);
      }

      // Gradient descent update
      for (let i = 0; i < contextValues.length; i++) {
        const gradient = -2 * error * contextValues[i];
        vector.weights[i] -= this.learningRate * gradient;
      }
      
      // Update bias
      vector.bias -= this.learningRate * (-2 * error);
    }

    // Update accuracy using exponential moving average
    const newSample = feedback.wasCorrect ? 1 : 0;
    vector.accuracy = vector.accuracy * 0.95 + newSample * 0.05;
    vector.sampleCount++;
    vector.lastUpdated = new Date();

    this.learningVectors.set(moduleId, vector);
  }

  /**
   * Initialize a new learning vector for a module
   */
  private initializeVector(moduleId: string): LearningVector {
    return {
      moduleId,
      weights: [0.1, 0.1, 0.1, 0.1, 0.1],
      bias: 0,
      accuracy: 0.5,
      sampleCount: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Detect patterns in feedback history
   */
  private detectPatterns(latestFeedback: FeedbackEntry): void {
    const recentFeedback = this.feedbackHistory.slice(-100);
    
    // Detect recurring error patterns
    const errorsByModule = new Map<string, number>();
    const errorsByAction = new Map<string, number>();
    
    recentFeedback.forEach(fb => {
      if (!fb.wasCorrect) {
        errorsByModule.set(fb.moduleId, (errorsByModule.get(fb.moduleId) || 0) + 1);
        errorsByAction.set(fb.actionType, (errorsByAction.get(fb.actionType) || 0) + 1);
      }
    });

    // Create pattern entries for significant error rates
    errorsByModule.forEach((count, moduleId) => {
      if (count >= 5) {
        const existingPattern = this.patterns.find(
          p => p.pattern === `high_error_${moduleId}`
        );
        
        if (existingPattern) {
          existingPattern.occurrences = count;
          existingPattern.lastSeen = new Date();
          existingPattern.confidence = Math.min(count / 10, 1);
        } else {
          this.patterns.push({
            pattern: `high_error_${moduleId}`,
            confidence: Math.min(count / 10, 1),
            occurrences: count,
            lastSeen: new Date(),
            suggestedAction: `Review and retrain ${moduleId} predictions`
          });
        }
      }
    });

    // Detect time-based patterns
    this.detectTemporalPatterns(recentFeedback);
  }

  /**
   * Detect time-based patterns in feedback
   */
  private detectTemporalPatterns(feedback: FeedbackEntry[]): void {
    const hourlyErrors = new Map<number, number>();
    
    feedback.forEach(fb => {
      if (!fb.wasCorrect) {
        const hour = fb.timestamp.getHours();
        hourlyErrors.set(hour, (hourlyErrors.get(hour) || 0) + 1);
      }
    });

    hourlyErrors.forEach((count, hour) => {
      if (count >= 3) {
        const patternId = `temporal_error_${hour}`;
        const existing = this.patterns.find(p => p.pattern === patternId);
        
        if (!existing) {
          this.patterns.push({
            pattern: patternId,
            confidence: Math.min(count / 5, 1),
            occurrences: count,
            lastSeen: new Date(),
            suggestedAction: `Investigate prediction accuracy at ${hour}:00 hours`
          });
        }
      }
    });
  }

  /**
   * Adjust learning rate based on recent performance
   */
  private adjustLearningRate(): void {
    const recentAccuracy = this.calculateRecentAccuracy();
    
    if (recentAccuracy > 0.9) {
      // High accuracy - reduce learning rate for stability
      this.learningRate = Math.max(0.001, this.learningRate * 0.95);
    } else if (recentAccuracy < 0.6) {
      // Low accuracy - increase learning rate for faster adaptation
      this.learningRate = Math.min(0.1, this.learningRate * 1.1);
    }
  }

  /**
   * Calculate accuracy over recent feedback
   */
  private calculateRecentAccuracy(): number {
    const recent = this.feedbackHistory.slice(-50);
    if (recent.length === 0) return 0.5;
    
    const correct = recent.filter(fb => fb.wasCorrect).length;
    return correct / recent.length;
  }

  /**
   * Make a prediction using learned vectors
   */
  predict(moduleId: string, context: Record<string, number>): number {
    const vector = this.learningVectors.get(moduleId);
    if (!vector) return 0.5; // Default neutral prediction
    
    const contextValues = Object.values(context);
    let prediction = vector.bias;
    
    for (let i = 0; i < Math.min(vector.weights.length, contextValues.length); i++) {
      prediction += vector.weights[i] * contextValues[i];
    }
    
    // Sigmoid activation to bound output to [0, 1]
    return 1 / (1 + Math.exp(-prediction));
  }

  /**
   * Get evolution metrics across all modules
   */
  getEvolutionMetrics(): EvolutionMetrics {
    const moduleMetrics = new Map<string, { accuracy: number; trend: number }>();
    
    this.learningVectors.forEach((vector, moduleId) => {
      const recentFeedback = this.feedbackHistory
        .filter(fb => fb.moduleId === moduleId)
        .slice(-20);
      
      const recentAccuracy = recentFeedback.length > 0
        ? recentFeedback.filter(fb => fb.wasCorrect).length / recentFeedback.length
        : vector.accuracy;
      
      const trend = recentAccuracy - vector.accuracy;
      
      moduleMetrics.set(moduleId, {
        accuracy: recentAccuracy,
        trend
      });
    });

    const globalAccuracy = this.calculateRecentAccuracy();
    const oldAccuracy = this.calculateOldAccuracy();
    
    return {
      globalAccuracy,
      learningRate: this.learningRate,
      totalFeedback: this.feedbackHistory.length,
      improvementTrend: globalAccuracy - oldAccuracy,
      moduleMetrics
    };
  }

  /**
   * Calculate accuracy from older feedback
   */
  private calculateOldAccuracy(): number {
    const oldFeedback = this.feedbackHistory.slice(-100, -50);
    if (oldFeedback.length === 0) return 0.5;
    
    const correct = oldFeedback.filter(fb => fb.wasCorrect).length;
    return correct / oldFeedback.length;
  }

  /**
   * Get detected patterns
   */
  getPatterns(): PatternRecognition[] {
    return this.patterns
      .filter(p => p.confidence > 0.3)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get recommendations based on learned patterns
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Based on patterns
    this.patterns
      .filter(p => p.confidence > 0.5)
      .forEach(p => recommendations.push(p.suggestedAction));
    
    // Based on module accuracy
    this.learningVectors.forEach((vector, moduleId) => {
      if (vector.accuracy < 0.6 && vector.sampleCount > 20) {
        recommendations.push(
          `Module ${moduleId} needs attention: accuracy ${(vector.accuracy * 100).toFixed(1)}%`
        );
      }
    });

    return recommendations.slice(0, 5);
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      const state = {
        feedbackHistory: this.feedbackHistory.slice(-500),
        learningVectors: Array.from(this.learningVectors.entries()),
        patterns: this.patterns,
        learningRate: this.learningRate
      };
      localStorage.setItem('sevi_learning_state', JSON.stringify(state));
    } catch (e) {
      // Silent fail for localStorage operations in learning engine
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem('sevi_learning_state');
      if (saved) {
        const state = JSON.parse(saved);
        this.feedbackHistory = (state.feedbackHistory || []).map((fb: FeedbackEntry) => ({
          ...fb,
          timestamp: new Date(fb.timestamp)
        }));
        this.learningVectors = new Map(state.learningVectors || []);
        this.patterns = (state.patterns || []).map((p: PatternRecognition) => ({
          ...p,
          lastSeen: new Date(p.lastSeen)
        }));
        this.learningRate = state.learningRate || 0.01;
      }
    } catch (e) {
      // Silent fail for localStorage operations in learning engine
    }
  }

  /**
   * Reset learning state
   */
  reset(): void {
    this.feedbackHistory = [];
    this.learningVectors.clear();
    this.patterns = [];
    this.learningRate = 0.01;
    localStorage.removeItem('sevi_learning_state');
  }
}

export const seviEngine = new SEVILearningEngine();
