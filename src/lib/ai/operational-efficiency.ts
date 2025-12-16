/**
 * Operational Efficiency Analysis - PATCH 950
 * Real-time efficiency analysis using local data
 */

export interface OperationalMetric {
  id: string;
  name: string;
  category: 'workflow' | 'resource' | 'time' | 'cost';
  value: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  timestamp: Date;
}

export interface EfficiencyInsight {
  id: string;
  type: 'bottleneck' | 'rework' | 'delay' | 'waste' | 'opportunity';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  potentialSavings?: number;
  affectedArea: string;
  timestamp: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  userId?: string;
  retries: number;
  errors: string[];
}

export interface EfficiencyReport {
  period: { start: Date; end: Date };
  overallScore: number;
  categoryScores: Record<string, number>;
  insights: EfficiencyInsight[];
  trends: {
    metric: string;
    values: { date: Date; value: number }[];
  }[];
  recommendations: string[];
}

class OperationalEfficiencyEngine {
  private workflows: Map<string, WorkflowStep[]> = new Map();
  private metrics: OperationalMetric[] = [];
  private insights: EfficiencyInsight[] = [];

  /**
   * Record workflow step
   */
  recordWorkflowStep(workflowId: string, step: WorkflowStep): void {
    const steps = this.workflows.get(workflowId) || [];
    
    const existingIndex = steps.findIndex(s => s.id === step.id);
    if (existingIndex >= 0) {
      steps[existingIndex] = step;
    } else {
      steps.push(step);
    }
    
    this.workflows.set(workflowId, steps);
  }

  /**
   * Analyze workflow for inefficiencies
   */
  analyzeWorkflow(workflowId: string): EfficiencyInsight[] {
    const steps = this.workflows.get(workflowId);
    if (!steps || steps.length === 0) return [];

    const insights: EfficiencyInsight[] = [];
    const now = new Date();

    // Detect blocked steps
    const blockedSteps = steps.filter(s => s.status === 'blocked');
    if (blockedSteps.length > 0) {
      insights.push({
        id: `bottleneck_${workflowId}`,
        type: 'bottleneck',
        severity: blockedSteps.length > 2 ? 'high' : 'medium',
        title: 'Gargalo no Fluxo de Trabalho',
        description: `${blockedSteps.length} etapa(s) bloqueada(s): ${blockedSteps.map(s => s.name).join(', ')}`,
        impact: 'Atraso na conclusão do processo',
        recommendation: 'Identificar e resolver dependências bloqueantes',
        affectedArea: workflowId,
        timestamp: now
      });
    }

    // Detect rework (retries > 1)
    const reworkSteps = steps.filter(s => s.retries > 1);
    if (reworkSteps.length > 0) {
      const totalRetries = reworkSteps.reduce((sum, s) => sum + s.retries, 0);
      insights.push({
        id: `rework_${workflowId}`,
        type: 'rework',
        severity: totalRetries > 5 ? 'high' : 'medium',
        title: 'Retrabalho Detectado',
        description: `${totalRetries} tentativas extras em ${reworkSteps.length} etapa(s)`,
        impact: `Aproximadamente ${totalRetries * 15} minutos perdidos`,
        recommendation: 'Revisar procedimentos e treinamento para reduzir erros',
        potentialSavings: totalRetries * 50, // R$ estimate
        affectedArea: workflowId,
        timestamp: now
      });
    }

    // Detect delays (steps taking too long)
    const completedSteps = steps.filter(s => s.status === 'completed' && s.endTime);
    completedSteps.forEach(step => {
      const duration = step.endTime!.getTime() - step.startTime.getTime();
      const expectedDuration = 30 * 60 * 1000; // 30 minutes baseline
      
      if (duration > expectedDuration * 2) {
        insights.push({
          id: `delay_${step.id}`,
          type: 'delay',
          severity: duration > expectedDuration * 3 ? 'high' : 'medium',
          title: 'Atraso na Execução',
          description: `"${step.name}" levou ${Math.round(duration / 60000)} minutos (esperado: ~30min)`,
          impact: 'Atraso cascata nas etapas seguintes',
          recommendation: 'Analisar causa raiz do atraso e otimizar processo',
          affectedArea: workflowId,
          timestamp: now
        });
      }
    });

    // Detect error patterns
    const stepsWithErrors = steps.filter(s => s.errors.length > 0);
    if (stepsWithErrors.length > 0) {
      const allErrors = stepsWithErrors.flatMap(s => s.errors);
      const errorCounts = allErrors.reduce((acc, err) => {
        acc[err] = (acc[err] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const frequentErrors = Object.entries(errorCounts)
        .filter(([, count]) => count >= 2)
        .map(([error]) => error);

      if (frequentErrors.length > 0) {
        insights.push({
          id: `errors_${workflowId}`,
          type: 'waste',
          severity: 'high',
          title: 'Erros Recorrentes',
          description: `Erros frequentes: ${frequentErrors.join(', ')}`,
          impact: 'Perda de produtividade e possíveis retrabalhos',
          recommendation: 'Implementar validações e treinamento específico',
          affectedArea: workflowId,
          timestamp: now
        });
      }
    }

    this.insights.push(...insights);
    return insights;
  }

  /**
   * Record operational metric
   */
  recordMetric(metric: OperationalMetric): void {
    // Calculate trend based on recent values
    const recentMetrics = this.metrics
      .filter(m => m.name === metric.name)
      .slice(-10);

    if (recentMetrics.length >= 3) {
      const oldAvg = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2))
        .reduce((sum, m) => sum + m.value, 0) / Math.floor(recentMetrics.length / 2);
      const newAvg = recentMetrics.slice(-Math.floor(recentMetrics.length / 2))
        .reduce((sum, m) => sum + m.value, 0) / Math.floor(recentMetrics.length / 2);
      
      const change = ((newAvg - oldAvg) / oldAvg) * 100;
      
      // Determine if higher is better based on metric name
      const higherIsBetter = !['error_rate', 'delay', 'cost', 'waste'].some(
        keyword => metric.name.toLowerCase().includes(keyword)
      );

      if (Math.abs(change) < 5) {
        metric.trend = 'stable';
      } else if ((change > 0 && higherIsBetter) || (change < 0 && !higherIsBetter)) {
        metric.trend = 'improving';
      } else {
        metric.trend = 'declining';
      }
    }

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Generate efficiency report
   */
  generateReport(startDate: Date, endDate: Date): EfficiencyReport {
    const periodMetrics = this.metrics.filter(
      m => m.timestamp >= startDate && m.timestamp <= endDate
    );

    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const categories = ['workflow', 'resource', 'time', 'cost'];
    
    categories.forEach(cat => {
      const catMetrics = periodMetrics.filter(m => m.category === cat);
      if (catMetrics.length > 0) {
        const avgPerformance = catMetrics.reduce((sum, m) => {
          const performance = (m.value / m.target) * 100;
          return sum + Math.min(100, performance);
        }, 0) / catMetrics.length;
        categoryScores[cat] = Math.round(avgPerformance);
      } else {
        categoryScores[cat] = 100;
      }
    });

    // Overall score
    const overallScore = Math.round(
      Object.values(categoryScores).reduce((sum, s) => sum + s, 0) / categories.length
    );

    // Get period insights
    const periodInsights = this.insights.filter(
      i => i.timestamp >= startDate && i.timestamp <= endDate
    );

    // Generate trends
    const metricNames = [...new Set(periodMetrics.map(m => m.name))];
    const trends = metricNames.map(name => ({
      metric: name,
      values: periodMetrics
        .filter(m => m.name === name)
        .map(m => ({ date: m.timestamp, value: m.value }))
    }));

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (overallScore < 70) {
      recommendations.push('Revisar processos críticos e identificar gargalos principais');
    }
    if (categoryScores.time < 80) {
      recommendations.push('Otimizar tempos de execução com automação de tarefas repetitivas');
    }
    if (categoryScores.resource < 80) {
      recommendations.push('Melhorar alocação de recursos e reduzir desperdícios');
    }
    if (periodInsights.filter(i => i.type === 'rework').length > 0) {
      recommendations.push('Implementar validações para reduzir retrabalho');
    }
    if (periodInsights.filter(i => i.type === 'bottleneck').length > 0) {
      recommendations.push('Resolver gargalos identificados para melhorar fluxo');
    }

    return {
      period: { start: startDate, end: endDate },
      overallScore,
      categoryScores,
      insights: periodInsights,
      trends,
      recommendations
    };
  }

  /**
   * Get real-time efficiency score
   */
  getRealTimeScore(): {
    score: number;
    trending: 'up' | 'down' | 'stable';
    topIssue?: EfficiencyInsight;
  } {
    const recentMetrics = this.metrics.slice(-50);
    
    if (recentMetrics.length === 0) {
      return { score: 100, trending: 'stable' };
    }

    const avgPerformance = recentMetrics.reduce((sum, m) => {
      return sum + Math.min(100, (m.value / m.target) * 100);
    }, 0) / recentMetrics.length;

    // Determine trend
    const oldMetrics = recentMetrics.slice(0, 25);
    const newMetrics = recentMetrics.slice(-25);
    
    const oldAvg = oldMetrics.length > 0 
      ? oldMetrics.reduce((sum, m) => sum + m.value, 0) / oldMetrics.length 
      : 0;
    const newAvg = newMetrics.length > 0
      ? newMetrics.reduce((sum, m) => sum + m.value, 0) / newMetrics.length
      : 0;

    let trending: 'up' | 'down' | 'stable' = 'stable';
    if (newAvg > oldAvg * 1.05) trending = 'up';
    else if (newAvg < oldAvg * 0.95) trending = 'down';

    // Get top issue
    const recentInsights = this.insights
      .filter(i => Date.now() - i.timestamp.getTime() < 60 * 60 * 1000)
      .sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

    return {
      score: Math.round(avgPerformance),
      trending,
      topIssue: recentInsights[0]
    };
  }

  /**
   * Get insights by type
   */
  getInsights(type?: EfficiencyInsight['type']): EfficiencyInsight[] {
    if (!type) return [...this.insights];
    return this.insights.filter(i => i.type === type);
  }

  /**
   * Clear old data
   */
  cleanup(maxAgeDays: number = 30): void {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    this.insights = this.insights.filter(i => i.timestamp.getTime() > cutoff);
  }
}

export const operationalEfficiencyEngine = new OperationalEfficiencyEngine();
