/**
 * Anomaly Detection System - PATCH 950
 * Detects behavioral anomalies in system and operations
 */

export interface SystemMetric {
  name: string;
  value: number;
  timestamp: Date;
  unit: string;
}

export interface AnomalyAlert {
  id: string;
  type: "system" | "operational" | "security" | "performance";
  severity: "info" | "warning" | "critical";
  metric: string;
  currentValue: number;
  expectedRange: { min: number; max: number };
  deviation: number;
  message: string;
  timestamp: Date;
  suggestion: string;
}

export interface OperationalBaseline {
  metric: string;
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  samples: number;
}

// System metrics to monitor
const MONITORED_METRICS = {
  cpu_usage: { min: 0, max: 80, unit: "%", warning: 70, critical: 90 },
  memory_usage: { min: 0, max: 85, unit: "%", warning: 75, critical: 95 },
  disk_usage: { min: 0, max: 90, unit: "%", warning: 80, critical: 95 },
  sync_queue_size: { min: 0, max: 100, unit: "items", warning: 50, critical: 100 },
  response_time: { min: 0, max: 2000, unit: "ms", warning: 1500, critical: 3000 },
  error_rate: { min: 0, max: 5, unit: "%", warning: 3, critical: 10 },
  llm_latency: { min: 0, max: 5000, unit: "ms", warning: 3000, critical: 8000 },
  battery_level: { min: 20, max: 100, unit: "%", warning: 30, critical: 15 },
  network_latency: { min: 0, max: 500, unit: "ms", warning: 300, critical: 1000 }
};

class AnomalyDetectionEngine {
  private baselines: Map<string, OperationalBaseline> = new Map();
  private recentMetrics: Map<string, SystemMetric[]> = new Map();
  private alerts: AnomalyAlert[] = [];
  private alertListeners: ((alert: AnomalyAlert) => void)[] = [];
  private maxHistorySize = 1000;

  /**
   * Calculate z-score for anomaly detection
   */
  private calculateZScore(value: number, mean: number, stdDev: number): number {
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }

  /**
   * Update baseline with new sample using exponential moving average
   */
  private updateBaseline(metric: string, value: number): void {
    const existing = this.baselines.get(metric);
    const alpha = 0.1; // Smoothing factor

    if (!existing) {
      this.baselines.set(metric, {
        metric,
        mean: value,
        stdDev: 0,
        min: value,
        max: value,
        samples: 1
      });
      return;
    }

    // Update using exponential moving average
    const newMean = alpha * value + (1 - alpha) * existing.mean;
    const newVariance = alpha * Math.pow(value - newMean, 2) + 
                       (1 - alpha) * Math.pow(existing.stdDev, 2);
    
    this.baselines.set(metric, {
      metric,
      mean: newMean,
      stdDev: Math.sqrt(newVariance),
      min: Math.min(existing.min, value),
      max: Math.max(existing.max, value),
      samples: existing.samples + 1
    });
  }

  /**
   * Detect anomaly in metric
   */
  private detectAnomaly(metric: SystemMetric): AnomalyAlert | null {
    const config = MONITORED_METRICS[metric.name as keyof typeof MONITORED_METRICS];
    const baseline = this.baselines.get(metric.name);

    // Check against static thresholds
    if (config) {
      if (metric.value >= config.critical) {
        return this.createAlert(metric, "critical", config);
      }
      if (metric.value >= config.warning) {
        return this.createAlert(metric, "warning", config);
      }
    }

    // Check against learned baseline using z-score
    if (baseline && baseline.samples >= 30) {
      const zScore = this.calculateZScore(metric.value, baseline.mean, baseline.stdDev);
      
      if (Math.abs(zScore) > 3) {
        return {
          id: `anomaly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: this.categorizeMetric(metric.name),
          severity: Math.abs(zScore) > 4 ? "critical" : "warning",
          metric: metric.name,
          currentValue: metric.value,
          expectedRange: {
            min: baseline.mean - 2 * baseline.stdDev,
            max: baseline.mean + 2 * baseline.stdDev
          },
          deviation: zScore,
          message: `Desvio estatístico detectado em ${metric.name}: z-score = ${zScore.toFixed(2)}`,
          timestamp: new Date(),
          suggestion: this.generateSuggestion(metric.name, zScore)
        };
      }
    }

    return null;
  }

  /**
   * Create alert from threshold violation
   */
  private createAlert(
    metric: SystemMetric, 
    severity: "warning" | "critical",
    config: typeof MONITORED_METRICS[keyof typeof MONITORED_METRICS]
  ): AnomalyAlert {
    const threshold = severity === "critical" ? config.critical : config.warning;
    
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: this.categorizeMetric(metric.name),
      severity,
      metric: metric.name,
      currentValue: metric.value,
      expectedRange: { min: config.min, max: threshold },
      deviation: ((metric.value - threshold) / threshold) * 100,
      message: this.getAlertMessage(metric.name, metric.value, severity),
      timestamp: new Date(),
      suggestion: this.generateSuggestion(metric.name, metric.value > threshold ? 1 : -1)
    };
  }

  /**
   * Categorize metric type
   */
  private categorizeMetric(name: string): AnomalyAlert["type"] {
    if (["cpu_usage", "memory_usage", "disk_usage"].includes(name)) return "system";
    if (["response_time", "llm_latency", "error_rate"].includes(name)) return "performance";
    if (["sync_queue_size", "network_latency"].includes(name)) return "operational";
    return "system";
  }

  /**
   * Get alert message
   */
  private getAlertMessage(metric: string, value: number, severity: string): string {
    const messages: Record<string, string> = {
      cpu_usage: `Uso de CPU ${severity === "critical" ? "crítico" : "elevado"}: ${value.toFixed(1)}%`,
      memory_usage: `Uso de memória ${severity === "critical" ? "crítico" : "elevado"}: ${value.toFixed(1)}%`,
      disk_usage: `Espaço em disco ${severity === "critical" ? "crítico" : "baixo"}: ${value.toFixed(1)}% usado`,
      sync_queue_size: `Fila de sincronização ${severity === "critical" ? "cheia" : "grande"}: ${value} itens pendentes`,
      response_time: `Tempo de resposta ${severity === "critical" ? "muito lento" : "lento"}: ${value}ms`,
      error_rate: `Taxa de erro ${severity === "critical" ? "crítica" : "elevada"}: ${value.toFixed(2)}%`,
      llm_latency: `LLM respondendo ${severity === "critical" ? "muito lentamente" : "lentamente"}: ${value}ms`,
      battery_level: `Bateria ${severity === "critical" ? "crítica" : "baixa"}: ${value.toFixed(0)}%`,
      network_latency: `Latência de rede ${severity === "critical" ? "crítica" : "alta"}: ${value}ms`
    };
    return messages[metric] || `Anomalia em ${metric}: ${value}`;
  }

  /**
   * Generate suggestion for anomaly
   */
  private generateSuggestion(metric: string, direction: number): string {
    const suggestions: Record<string, { high: string; low: string }> = {
      cpu_usage: {
        high: "Feche aplicações desnecessárias ou reduza operações em paralelo",
        low: "Sistema operando normalmente"
      },
      memory_usage: {
        high: "Limpe cache local ou reinicie o aplicativo",
        low: "Memória disponível adequada"
      },
      disk_usage: {
        high: "Execute limpeza de arquivos temporários e logs antigos",
        low: "Espaço em disco adequado"
      },
      sync_queue_size: {
        high: "Verifique conexão de rede e force sincronização manual",
        low: "Sincronização funcionando normalmente"
      },
      response_time: {
        high: "Verifique carga do sistema e otimize consultas",
        low: "Performance adequada"
      },
      error_rate: {
        high: "Verifique logs de erro e conexões de rede",
        low: "Taxa de erro aceitável"
      },
      llm_latency: {
        high: "Reduza complexidade dos prompts ou use modelo mais leve",
        low: "LLM respondendo adequadamente"
      },
      battery_level: {
        high: "Bateria carregada",
        low: "Conecte o dispositivo à energia"
      },
      network_latency: {
        high: "Verifique conexão de rede ou use modo offline",
        low: "Conexão de rede adequada"
      }
    };

    const suggestion = suggestions[metric];
    if (!suggestion) return "Monitore a métrica";
    return direction > 0 ? suggestion.high : suggestion.low;
  }

  /**
   * Record metric and check for anomalies
   */
  recordMetric(metric: SystemMetric): AnomalyAlert | null {
    // Store in history
    const history = this.recentMetrics.get(metric.name) || [];
    history.push(metric);
    
    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
    this.recentMetrics.set(metric.name, history);

    // Update baseline
    this.updateBaseline(metric.name, metric.value);

    // Check for anomaly
    const alert = this.detectAnomaly(metric);
    
    if (alert) {
      this.alerts.push(alert);
      
      // Keep only last 100 alerts
      if (this.alerts.length > 100) {
        this.alerts = this.alerts.slice(-100);
      }

      // Notify listeners
      this.alertListeners.forEach(listener => listener(alert));
    }

    return alert;
  }

  /**
   * Record multiple metrics at once
   */
  recordMetrics(metrics: SystemMetric[]): AnomalyAlert[] {
    return metrics
      .map(m => this.recordMetric(m))
      .filter((a): a is AnomalyAlert => a !== null);
  }

  /**
   * Get current system health score
   */
  getHealthScore(): {
    score: number;
    status: "healthy" | "degraded" | "critical";
    issues: string[];
    } {
    const recentAlerts = this.alerts.filter(
      a => Date.now() - a.timestamp.getTime() < 15 * 60 * 1000 // Last 15 minutes
    );

    const criticalCount = recentAlerts.filter(a => a.severity === "critical").length;
    const warningCount = recentAlerts.filter(a => a.severity === "warning").length;

    let score = 100 - (criticalCount * 20) - (warningCount * 5);
    score = Math.max(0, Math.min(100, score));

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (criticalCount > 0) status = "critical";
    else if (warningCount > 2) status = "degraded";

    return {
      score,
      status,
      issues: recentAlerts.map(a => a.message)
    };
  }

  /**
   * Get alerts by severity
   */
  getAlerts(severity?: AnomalyAlert["severity"]): AnomalyAlert[] {
    if (!severity) return [...this.alerts];
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: AnomalyAlert) => void): () => void {
    this.alertListeners.push(callback);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== callback);
    };
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Export baselines for persistence
   */
  exportBaselines(): OperationalBaseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * Import baselines
   */
  importBaselines(baselines: OperationalBaseline[]): void {
    baselines.forEach(b => this.baselines.set(b.metric, b));
  }
}

export const anomalyDetectionEngine = new AnomalyDetectionEngine();

// Collect system metrics periodically
export function startMetricCollection(intervalMs: number = 30000): () => void {
  const collectMetrics = () => {
    const metrics: SystemMetric[] = [];
    const now = new Date();

    // Memory usage (browser)
    if ("memory" in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        metrics.push({
          name: "memory_usage",
          value: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          timestamp: now,
          unit: "%"
        });
      }
    }

    // Estimate response time from recent navigation
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      metrics.push({
        name: "response_time",
        value: navEntries[0].responseEnd - navEntries[0].requestStart,
        timestamp: now,
        unit: "ms"
      });
    }

    // Record metrics
    if (metrics.length > 0) {
      anomalyDetectionEngine.recordMetrics(metrics);
    }
  });

  const intervalId = setInterval(collectMetrics, intervalMs);
  collectMetrics(); // Initial collection

  return () => clearInterval(intervalId);
}
