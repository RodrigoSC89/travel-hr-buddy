/**
 * ONNX Predictive Maintenance Engine
 * Modelo ML local para previsão de falhas com 30 dias de antecedência
 * Nível: Semi-autônomo
 */

import * as ort from 'onnxruntime-web';

export interface EquipmentTelemetry {
  equipmentId: string;
  temperature: number;
  vibration: number;
  pressure: number;
  runningHours: number;
  lastMaintenance: Date;
  sensorReadings: Record<string, number>;
}

export interface FailurePrediction {
  equipmentId: string;
  failureProbability: number;
  predictedFailureDate: Date | null;
  daysUntilFailure: number | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendedActions: string[];
  confidence: number;
  affectedComponents: string[];
}

export interface MaintenanceSchedule {
  equipmentId: string;
  scheduledDate: Date;
  maintenanceType: 'preventive' | 'predictive' | 'corrective';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedDuration: number; // hours
  requiredParts: string[];
  estimatedCost: number;
}

class PredictiveMaintenanceONNX {
  private session: ort.InferenceSession | null = null;
  private modelLoaded = false;
  private readonly modelPath = '/models/nautilus_maintenance_predictor.onnx';

  async initialize(): Promise<boolean> {
    try {
      // Configure ONNX Runtime for WebAssembly
      ort.env.wasm.wasmPaths = '/onnx/';
      
      this.session = await ort.InferenceSession.create(this.modelPath, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      });
      
      this.modelLoaded = true;
      console.debug('[PredictiveMaintenanceONNX] Model loaded successfully');
      return true;
    } catch (error) {
      console.error('[PredictiveMaintenanceONNX] Failed to load model:', error);
      // Fallback to heuristic-based prediction
      this.modelLoaded = false;
      return false;
    }
  }

  async predictFailure(telemetry: EquipmentTelemetry): Promise<FailurePrediction> {
    if (this.session && this.modelLoaded) {
      return this.runONNXInference(telemetry);
    }
    return this.heuristicPrediction(telemetry);
  }

  private async runONNXInference(telemetry: EquipmentTelemetry): Promise<FailurePrediction> {
    try {
      // Prepare input tensor
      const inputData = new Float32Array([
        telemetry.temperature,
        telemetry.vibration,
        telemetry.pressure,
        telemetry.runningHours,
        this.daysSinceLastMaintenance(telemetry.lastMaintenance),
        ...Object.values(telemetry.sensorReadings).slice(0, 10).map(v => v || 0)
      ]);

      // Pad to expected input size (16 features)
      while (inputData.length < 16) {
        inputData[inputData.length] = 0;
      }

      const inputTensor = new ort.Tensor('float32', inputData, [1, 16]);
      const feeds = { input: inputTensor };
      
      const results = await this.session!.run(feeds);
      const output = results.output.data as Float32Array;

      const failureProbability = Math.min(1, Math.max(0, output[0]));
      const daysUntilFailure = Math.max(0, Math.round(output[1] * 30));

      return this.buildPredictionResult(
        telemetry.equipmentId,
        failureProbability,
        daysUntilFailure,
        0.92 // ONNX model confidence
      );
    } catch (error) {
      console.error('[PredictiveMaintenanceONNX] Inference error:', error);
      return this.heuristicPrediction(telemetry);
    }
  }

  private heuristicPrediction(telemetry: EquipmentTelemetry): FailurePrediction {
    // Advanced heuristic-based prediction as fallback
    const daysSinceMaintenance = this.daysSinceLastMaintenance(telemetry.lastMaintenance);
    
    let riskScore = 0;
    const issues: string[] = [];

    // Temperature analysis
    if (telemetry.temperature > 95) {
      riskScore += 0.35;
      issues.push('Temperatura crítica detectada');
    } else if (telemetry.temperature > 80) {
      riskScore += 0.15;
      issues.push('Temperatura elevada');
    }

    // Vibration analysis
    if (telemetry.vibration > 8) {
      riskScore += 0.30;
      issues.push('Vibração excessiva - possível desbalanceamento');
    } else if (telemetry.vibration > 5) {
      riskScore += 0.12;
      issues.push('Vibração acima do normal');
    }

    // Pressure analysis
    if (telemetry.pressure < 0.8 || telemetry.pressure > 1.2) {
      riskScore += 0.20;
      issues.push('Pressão fora da faixa operacional');
    }

    // Running hours analysis
    if (telemetry.runningHours > 10000) {
      riskScore += 0.15;
      issues.push('Equipamento próximo do fim da vida útil');
    } else if (telemetry.runningHours > 5000) {
      riskScore += 0.08;
    }

    // Maintenance interval analysis
    if (daysSinceMaintenance > 180) {
      riskScore += 0.25;
      issues.push('Manutenção preventiva atrasada');
    } else if (daysSinceMaintenance > 90) {
      riskScore += 0.10;
    }

    const failureProbability = Math.min(1, riskScore);
    const daysUntilFailure = failureProbability > 0.7 
      ? Math.round((1 - failureProbability) * 30) 
      : failureProbability > 0.4 
        ? Math.round((1 - failureProbability) * 60)
        : null;

    return this.buildPredictionResult(
      telemetry.equipmentId,
      failureProbability,
      daysUntilFailure,
      0.78, // Heuristic confidence
      issues
    );
  }

  private buildPredictionResult(
    equipmentId: string,
    failureProbability: number,
    daysUntilFailure: number | null,
    confidence: number,
    issues: string[] = []
  ): FailurePrediction {
    const riskLevel = this.calculateRiskLevel(failureProbability);
    const recommendedActions = this.generateRecommendations(riskLevel, issues);
    const affectedComponents = this.identifyAffectedComponents(issues);

    return {
      equipmentId,
      failureProbability,
      predictedFailureDate: daysUntilFailure !== null 
        ? new Date(Date.now() + daysUntilFailure * 24 * 60 * 60 * 1000)
        : null,
      daysUntilFailure,
      riskLevel,
      recommendedActions,
      confidence,
      affectedComponents
    };
  }

  private calculateRiskLevel(probability: number): FailurePrediction['riskLevel'] {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.3) return 'medium';
    return 'low';
  }

  private generateRecommendations(
    riskLevel: FailurePrediction['riskLevel'],
    issues: string[]
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case 'critical':
        recommendations.push('⚠️ AÇÃO IMEDIATA: Programar manutenção corretiva nas próximas 48h');
        recommendations.push('Preparar peças de reposição para troca emergencial');
        recommendations.push('Notificar equipe de operações sobre possível parada');
        break;
      case 'high':
        recommendations.push('Agendar manutenção preventiva para os próximos 7 dias');
        recommendations.push('Aumentar frequência de monitoramento para cada 4 horas');
        recommendations.push('Verificar estoque de peças sobressalentes');
        break;
      case 'medium':
        recommendations.push('Incluir na próxima janela de manutenção programada');
        recommendations.push('Monitorar evolução dos indicadores diariamente');
        break;
      case 'low':
        recommendations.push('Manter monitoramento padrão');
        recommendations.push('Revisar na próxima inspeção de rotina');
        break;
    }

    // Add specific recommendations based on issues
    if (issues.some(i => i.includes('temperatura'))) {
      recommendations.push('Verificar sistema de refrigeração e ventilação');
    }
    if (issues.some(i => i.includes('vibração'))) {
      recommendations.push('Realizar análise de alinhamento e balanceamento');
    }
    if (issues.some(i => i.includes('pressão'))) {
      recommendations.push('Inspecionar vedações e conexões do sistema hidráulico');
    }

    return recommendations;
  }

  private identifyAffectedComponents(issues: string[]): string[] {
    const components: string[] = [];
    
    if (issues.some(i => i.toLowerCase().includes('temperatura'))) {
      components.push('Sistema de Refrigeração', 'Radiador', 'Termostato');
    }
    if (issues.some(i => i.toLowerCase().includes('vibração'))) {
      components.push('Rolamentos', 'Eixo Principal', 'Acoplamentos');
    }
    if (issues.some(i => i.toLowerCase().includes('pressão'))) {
      components.push('Bomba Hidráulica', 'Válvulas', 'Vedações');
    }
    if (issues.some(i => i.toLowerCase().includes('vida útil'))) {
      components.push('Componentes de Desgaste', 'Filtros', 'Correias');
    }

    return [...new Set(components)];
  }

  generateMaintenanceSchedule(
    predictions: FailurePrediction[],
    constraints?: {
      maxConcurrentMaintenance?: number;
      preferredDays?: number[]; // 0-6 (Sunday-Saturday)
      budgetLimit?: number;
    }
  ): MaintenanceSchedule[] {
    const schedules: MaintenanceSchedule[] = [];
    const sortedPredictions = [...predictions].sort(
      (a, b) => a.failureProbability > b.failureProbability ? -1 : 1
    );

    for (const prediction of sortedPredictions) {
      if (prediction.riskLevel === 'low' && prediction.failureProbability < 0.2) {
        continue; // Skip low-risk equipment
      }

      const maintenanceType = this.determineMaintenanceType(prediction);
      const scheduledDate = this.calculateOptimalDate(
        prediction,
        constraints?.preferredDays
      );

      schedules.push({
        equipmentId: prediction.equipmentId,
        scheduledDate,
        maintenanceType,
        priority: this.mapRiskToPriority(prediction.riskLevel),
        estimatedDuration: this.estimateDuration(maintenanceType, prediction),
        requiredParts: prediction.affectedComponents.slice(0, 5),
        estimatedCost: this.estimateCost(maintenanceType, prediction)
      });
    }

    // Apply constraints
    if (constraints?.maxConcurrentMaintenance) {
      return this.optimizeSchedule(schedules, constraints.maxConcurrentMaintenance);
    }

    return schedules;
  }

  private determineMaintenanceType(
    prediction: FailurePrediction
  ): MaintenanceSchedule['maintenanceType'] {
    if (prediction.riskLevel === 'critical') return 'corrective';
    if (prediction.failureProbability > 0.5) return 'predictive';
    return 'preventive';
  }

  private calculateOptimalDate(
    prediction: FailurePrediction,
    preferredDays?: number[]
  ): Date {
    let targetDate: Date;

    if (prediction.daysUntilFailure !== null && prediction.daysUntilFailure < 14) {
      // Schedule before predicted failure
      targetDate = new Date(Date.now() + (prediction.daysUntilFailure - 2) * 24 * 60 * 60 * 1000);
    } else if (prediction.riskLevel === 'critical') {
      targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    } else if (prediction.riskLevel === 'high') {
      targetDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else {
      targetDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    // Adjust to preferred day if specified
    if (preferredDays && preferredDays.length > 0) {
      while (!preferredDays.includes(targetDate.getDay())) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
    }

    return targetDate;
  }

  private mapRiskToPriority(riskLevel: FailurePrediction['riskLevel']): MaintenanceSchedule['priority'] {
    const mapping: Record<FailurePrediction['riskLevel'], MaintenanceSchedule['priority']> = {
      critical: 'urgent',
      high: 'high',
      medium: 'normal',
      low: 'low'
    };
    return mapping[riskLevel];
  }

  private estimateDuration(
    type: MaintenanceSchedule['maintenanceType'],
    prediction: FailurePrediction
  ): number {
    const baseDuration = {
      preventive: 4,
      predictive: 6,
      corrective: 12
    };
    return baseDuration[type] + prediction.affectedComponents.length * 0.5;
  }

  private estimateCost(
    type: MaintenanceSchedule['maintenanceType'],
    prediction: FailurePrediction
  ): number {
    const baseCost = {
      preventive: 2000,
      predictive: 5000,
      corrective: 15000
    };
    return baseCost[type] + prediction.affectedComponents.length * 500;
  }

  private optimizeSchedule(
    schedules: MaintenanceSchedule[],
    maxConcurrent: number
  ): MaintenanceSchedule[] {
    // Simple optimization: spread out concurrent maintenance
    const dateGroups = new Map<string, MaintenanceSchedule[]>();
    
    for (const schedule of schedules) {
      const dateKey = schedule.scheduledDate.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(schedule);
    }

    const optimized: MaintenanceSchedule[] = [];
    
    for (const [, group] of dateGroups) {
      const sorted = group.sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      let dayOffset = 0;
      for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && i % maxConcurrent === 0) {
          dayOffset++;
        }
        const adjusted = { ...sorted[i] };
        if (dayOffset > 0) {
          adjusted.scheduledDate = new Date(
            adjusted.scheduledDate.getTime() + dayOffset * 24 * 60 * 60 * 1000
          );
        }
        optimized.push(adjusted);
      }
    }

    return optimized;
  }

  private daysSinceLastMaintenance(lastMaintenance: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastMaintenance.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isModelLoaded(): boolean {
    return this.modelLoaded;
  }
}

export const predictiveMaintenanceONNX = new PredictiveMaintenanceONNX();
