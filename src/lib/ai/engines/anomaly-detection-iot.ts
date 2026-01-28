/**
 * Anomaly Detection IoT Engine
 * Detecção automática de anomalias em sensores com alertas e ações corretivas
 * Nível: Autônomo
 */

export interface SensorReading {
  sensorId: string;
  sensorType: SensorType;
  equipmentId: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'good' | 'suspect' | 'bad';
}

export type SensorType = 
  | 'temperature'
  | 'pressure'
  | 'vibration'
  | 'flow_rate'
  | 'level'
  | 'rpm'
  | 'power'
  | 'humidity'
  | 'voltage'
  | 'current';

export interface AnomalyDetection {
  id: string;
  sensorId: string;
  sensorType: SensorType;
  equipmentId: string;
  anomalyType: AnomalyType;
  severity: 'info' | 'warning' | 'alert' | 'critical';
  detectedValue: number;
  expectedRange: { min: number; max: number };
  deviation: number; // percentage from expected
  confidence: number;
  description: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'auto_corrected';
  correctiveAction: CorrectiveAction | null;
  relatedAnomalies: string[];
}

export type AnomalyType = 
  | 'threshold_breach'
  | 'sudden_change'
  | 'drift'
  | 'oscillation'
  | 'flat_line'
  | 'correlation_break'
  | 'pattern_deviation';

export interface CorrectiveAction {
  id: string;
  type: 'automatic' | 'manual' | 'scheduled';
  action: string;
  executed: boolean;
  executedAt: Date | null;
  success: boolean | null;
  result: string | null;
}

export interface SensorBaseline {
  sensorId: string;
  sensorType: SensorType;
  normalRange: { min: number; max: number };
  warningThresholds: { low: number; high: number };
  criticalThresholds: { low: number; high: number };
  rateOfChangeLimit: number; // max change per minute
  correlatedSensors: Array<{ sensorId: string; expectedCorrelation: number }>;
  seasonalPattern: number[] | null; // 24-hour pattern
  lastUpdated: Date;
}

export interface IoTHealthStatus {
  equipmentId: string;
  equipmentName: string;
  overallHealth: number; // 0-100
  sensorsOnline: number;
  sensorsTotal: number;
  activeAnomalies: number;
  recentAlerts: AnomalyDetection[];
  trends: Array<{
    metric: string;
    trend: 'stable' | 'improving' | 'degrading';
    forecast: string;
  }>;
  lastReading: Date;
  nextMaintenance: Date | null;
}

class AnomalyDetectionIoTEngine {
  private baselines: Map<string, SensorBaseline> = new Map();
  private readingHistory: Map<string, SensorReading[]> = new Map();
  private activeAnomalies: Map<string, AnomalyDetection> = new Map();
  private readonly HISTORY_SIZE = 1000; // readings to keep per sensor

  async processReading(reading: SensorReading): Promise<AnomalyDetection | null> {
    // Store in history
    this.addToHistory(reading);

    // Get or create baseline
    const baseline = this.getOrCreateBaseline(reading);

    // Run all detection algorithms
    const detections = await Promise.all([
      this.checkThresholdBreach(reading, baseline),
      this.checkSuddenChange(reading),
      this.checkDrift(reading, baseline),
      this.checkOscillation(reading),
      this.checkFlatLine(reading),
      this.checkCorrelationBreak(reading, baseline)
    ]);

    // Find most significant anomaly
    const anomalies = detections.filter(d => d !== null) as AnomalyDetection[];
    
    if (anomalies.length === 0) return null;

    // Sort by severity and return most critical
    const sorted = anomalies.sort((a, b) => {
      const severityOrder = { critical: 0, alert: 1, warning: 2, info: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    const primaryAnomaly = sorted[0];
    
    // Link related anomalies
    primaryAnomaly.relatedAnomalies = sorted.slice(1).map(a => a.id);

    // Execute automatic corrective action if critical
    if (primaryAnomaly.severity === 'critical') {
      primaryAnomaly.correctiveAction = await this.executeCorrectiveAction(primaryAnomaly);
    }

    // Store active anomaly
    this.activeAnomalies.set(primaryAnomaly.id, primaryAnomaly);

    return primaryAnomaly;
  }

  private addToHistory(reading: SensorReading): void {
    const history = this.readingHistory.get(reading.sensorId) || [];
    history.push(reading);
    
    // Keep only recent readings
    if (history.length > this.HISTORY_SIZE) {
      history.shift();
    }
    
    this.readingHistory.set(reading.sensorId, history);
  }

  private getOrCreateBaseline(reading: SensorReading): SensorBaseline {
    let baseline = this.baselines.get(reading.sensorId);
    
    if (!baseline) {
      baseline = this.createDefaultBaseline(reading);
      this.baselines.set(reading.sensorId, baseline);
    }

    return baseline;
  }

  private createDefaultBaseline(reading: SensorReading): SensorBaseline {
    // Default thresholds by sensor type
    const defaults: Record<SensorType, { min: number; max: number; rate: number }> = {
      temperature: { min: 20, max: 90, rate: 5 },
      pressure: { min: 0.8, max: 1.5, rate: 0.1 },
      vibration: { min: 0, max: 10, rate: 2 },
      flow_rate: { min: 0, max: 1000, rate: 50 },
      level: { min: 0, max: 100, rate: 10 },
      rpm: { min: 0, max: 3000, rate: 100 },
      power: { min: 0, max: 1000, rate: 50 },
      humidity: { min: 30, max: 80, rate: 5 },
      voltage: { min: 380, max: 440, rate: 20 },
      current: { min: 0, max: 500, rate: 30 }
    };

    const def = defaults[reading.sensorType] || { min: 0, max: 100, rate: 10 };

    return {
      sensorId: reading.sensorId,
      sensorType: reading.sensorType,
      normalRange: { min: def.min, max: def.max },
      warningThresholds: { 
        low: def.min * 0.9, 
        high: def.max * 1.1 
      },
      criticalThresholds: { 
        low: def.min * 0.8, 
        high: def.max * 1.2 
      },
      rateOfChangeLimit: def.rate,
      correlatedSensors: [],
      seasonalPattern: null,
      lastUpdated: new Date()
    };
  }

  private async checkThresholdBreach(
    reading: SensorReading,
    baseline: SensorBaseline
  ): Promise<AnomalyDetection | null> {
    const value = reading.value;
    
    // Check critical thresholds
    if (value <= baseline.criticalThresholds.low || value >= baseline.criticalThresholds.high) {
      return this.createAnomaly(reading, 'threshold_breach', 'critical', baseline, 
        `Valor ${value} ${reading.unit} excede limites críticos`);
    }

    // Check warning thresholds
    if (value <= baseline.warningThresholds.low || value >= baseline.warningThresholds.high) {
      return this.createAnomaly(reading, 'threshold_breach', 'warning', baseline,
        `Valor ${value} ${reading.unit} fora da faixa de alerta`);
    }

    // Check normal range
    if (value < baseline.normalRange.min || value > baseline.normalRange.max) {
      return this.createAnomaly(reading, 'threshold_breach', 'info', baseline,
        `Valor ${value} ${reading.unit} ligeiramente fora do normal`);
    }

    return null;
  }

  private async checkSuddenChange(reading: SensorReading): Promise<AnomalyDetection | null> {
    const history = this.readingHistory.get(reading.sensorId) || [];
    
    if (history.length < 2) return null;

    const previousReading = history[history.length - 2];
    const timeDiff = (new Date(reading.timestamp).getTime() - 
                     new Date(previousReading.timestamp).getTime()) / 60000; // minutes

    if (timeDiff === 0) return null;

    const rateOfChange = Math.abs(reading.value - previousReading.value) / timeDiff;
    const baseline = this.baselines.get(reading.sensorId);

    if (!baseline) return null;

    if (rateOfChange > baseline.rateOfChangeLimit * 2) {
      return this.createAnomaly(reading, 'sudden_change', 'alert', baseline,
        `Mudança brusca detectada: ${rateOfChange.toFixed(2)} ${reading.unit}/min`);
    }

    if (rateOfChange > baseline.rateOfChangeLimit) {
      return this.createAnomaly(reading, 'sudden_change', 'warning', baseline,
        `Taxa de mudança elevada: ${rateOfChange.toFixed(2)} ${reading.unit}/min`);
    }

    return null;
  }

  private async checkDrift(
    reading: SensorReading,
    baseline: SensorBaseline
  ): Promise<AnomalyDetection | null> {
    const history = this.readingHistory.get(reading.sensorId) || [];
    
    if (history.length < 50) return null;

    // Calculate moving average over last 50 readings
    const recent = history.slice(-50);
    const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;

    // Calculate earlier average
    const earlier = history.slice(-100, -50);
    if (earlier.length < 20) return null;

    const earlierAvg = earlier.reduce((sum, r) => sum + r.value, 0) / earlier.length;

    // Check for drift
    const drift = Math.abs(recentAvg - earlierAvg) / earlierAvg * 100;

    if (drift > 15) {
      return this.createAnomaly(reading, 'drift', 'warning', baseline,
        `Deriva de ${drift.toFixed(1)}% detectada nas últimas leituras`);
    }

    return null;
  }

  private async checkOscillation(reading: SensorReading): Promise<AnomalyDetection | null> {
    const history = this.readingHistory.get(reading.sensorId) || [];
    
    if (history.length < 20) return null;

    // Count direction changes in last 20 readings
    const recent = history.slice(-20);
    let directionChanges = 0;

    for (let i = 2; i < recent.length; i++) {
      const prev = recent[i - 1].value - recent[i - 2].value;
      const curr = recent[i].value - recent[i - 1].value;
      
      if (prev * curr < 0) {
        directionChanges++;
      }
    }

    // High oscillation if direction changes more than 70% of the time
    if (directionChanges > recent.length * 0.7) {
      const baseline = this.baselines.get(reading.sensorId);
      return this.createAnomaly(reading, 'oscillation', 'warning', baseline!,
        `Oscilação excessiva detectada: ${directionChanges} reversões`);
    }

    return null;
  }

  private async checkFlatLine(reading: SensorReading): Promise<AnomalyDetection | null> {
    const history = this.readingHistory.get(reading.sensorId) || [];
    
    if (history.length < 10) return null;

    const recent = history.slice(-10);
    const values = recent.map(r => r.value);
    const allSame = values.every(v => v === values[0]);

    if (allSame && values[0] !== 0) {
      const baseline = this.baselines.get(reading.sensorId);
      return this.createAnomaly(reading, 'flat_line', 'alert', baseline!,
        `Sensor travado: mesmo valor (${values[0]}) por ${recent.length} leituras`);
    }

    // Check for very low variance
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const cv = Math.sqrt(variance) / mean; // coefficient of variation

    if (cv < 0.001 && mean !== 0) {
      const baseline = this.baselines.get(reading.sensorId);
      return this.createAnomaly(reading, 'flat_line', 'warning', baseline!,
        `Variação muito baixa detectada - possível sensor com problema`);
    }

    return null;
  }

  private async checkCorrelationBreak(
    reading: SensorReading,
    baseline: SensorBaseline
  ): Promise<AnomalyDetection | null> {
    if (baseline.correlatedSensors.length === 0) return null;

    for (const corr of baseline.correlatedSensors) {
      const correlatedHistory = this.readingHistory.get(corr.sensorId) || [];
      const myHistory = this.readingHistory.get(reading.sensorId) || [];

      if (correlatedHistory.length < 10 || myHistory.length < 10) continue;

      // Calculate recent correlation
      const recent1 = myHistory.slice(-10).map(r => r.value);
      const recent2 = correlatedHistory.slice(-10).map(r => r.value);

      const actualCorr = this.calculateCorrelation(recent1, recent2);
      const expectedCorr = corr.expectedCorrelation;

      if (Math.abs(actualCorr - expectedCorr) > 0.5) {
        return this.createAnomaly(reading, 'correlation_break', 'warning', baseline,
          `Correlação com sensor ${corr.sensorId} quebrada: esperado ${expectedCorr.toFixed(2)}, atual ${actualCorr.toFixed(2)}`);
      }
    }

    return null;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : num / den;
  }

  private createAnomaly(
    reading: SensorReading,
    type: AnomalyType,
    severity: AnomalyDetection['severity'],
    baseline: SensorBaseline,
    description: string
  ): AnomalyDetection {
    const deviation = ((reading.value - (baseline.normalRange.min + baseline.normalRange.max) / 2) /
                       ((baseline.normalRange.max - baseline.normalRange.min) / 2)) * 100;

    return {
      id: crypto.randomUUID(),
      sensorId: reading.sensorId,
      sensorType: reading.sensorType,
      equipmentId: reading.equipmentId,
      anomalyType: type,
      severity,
      detectedValue: reading.value,
      expectedRange: baseline.normalRange,
      deviation: Math.abs(deviation),
      confidence: 0.85 + Math.random() * 0.1,
      description,
      timestamp: new Date(),
      status: 'active',
      correctiveAction: null,
      relatedAnomalies: []
    };
  }

  private async executeCorrectiveAction(anomaly: AnomalyDetection): Promise<CorrectiveAction> {
    // Determine automatic action based on anomaly type and sensor
    const actions: Record<SensorType, Record<AnomalyType, string>> = {
      temperature: {
        threshold_breach: 'Ativar sistema de refrigeração auxiliar',
        sudden_change: 'Verificar sistema de controle térmico',
        drift: 'Recalibrar termostato',
        oscillation: 'Estabilizar controle PID',
        flat_line: 'Verificar sensor de temperatura',
        correlation_break: 'Verificar sistema integrado',
        pattern_deviation: 'Analisar padrão operacional'
      },
      pressure: {
        threshold_breach: 'Ajustar válvula de alívio',
        sudden_change: 'Verificar vazamentos',
        drift: 'Recalibrar transdutor',
        oscillation: 'Estabilizar bomba',
        flat_line: 'Verificar sensor de pressão',
        correlation_break: 'Verificar linha hidráulica',
        pattern_deviation: 'Verificar ciclo operacional'
      },
      vibration: {
        threshold_breach: 'Reduzir carga do equipamento',
        sudden_change: 'Parada de emergência para inspeção',
        drift: 'Programar balanceamento',
        oscillation: 'Verificar fixação',
        flat_line: 'Verificar acelerômetro',
        correlation_break: 'Verificar acoplamento',
        pattern_deviation: 'Analisar frequência'
      },
      flow_rate: {
        threshold_breach: 'Ajustar bomba',
        sudden_change: 'Verificar obstrução',
        drift: 'Verificar filtros',
        oscillation: 'Verificar válvula',
        flat_line: 'Verificar sensor de fluxo',
        correlation_break: 'Verificar bypass',
        pattern_deviation: 'Verificar demanda'
      },
      level: {
        threshold_breach: 'Ativar bomba de transferência',
        sudden_change: 'Verificar vazamento',
        drift: 'Verificar consumo',
        oscillation: 'Verificar sensor',
        flat_line: 'Calibrar sensor de nível',
        correlation_break: 'Verificar sistema',
        pattern_deviation: 'Verificar consumo'
      },
      rpm: {
        threshold_breach: 'Ajustar controle de velocidade',
        sudden_change: 'Verificar carga',
        drift: 'Verificar controlador',
        oscillation: 'Verificar acoplamento',
        flat_line: 'Verificar encoder',
        correlation_break: 'Verificar transmissão',
        pattern_deviation: 'Verificar ciclo'
      },
      power: {
        threshold_breach: 'Redistribuir carga',
        sudden_change: 'Verificar curto-circuito',
        drift: 'Verificar isolamento',
        oscillation: 'Verificar harmônicos',
        flat_line: 'Verificar medidor',
        correlation_break: 'Verificar quadro',
        pattern_deviation: 'Verificar demanda'
      },
      humidity: {
        threshold_breach: 'Ativar desumidificador',
        sudden_change: 'Verificar vazamento',
        drift: 'Verificar ventilação',
        oscillation: 'Verificar controle',
        flat_line: 'Verificar higrômetro',
        correlation_break: 'Verificar HVAC',
        pattern_deviation: 'Verificar ambiente'
      },
      voltage: {
        threshold_breach: 'Ajustar regulador',
        sudden_change: 'Verificar gerador',
        drift: 'Verificar AVR',
        oscillation: 'Verificar carga',
        flat_line: 'Verificar voltímetro',
        correlation_break: 'Verificar sincronização',
        pattern_deviation: 'Verificar demanda'
      },
      current: {
        threshold_breach: 'Reduzir carga',
        sudden_change: 'Verificar motor',
        drift: 'Verificar isolamento',
        oscillation: 'Verificar harmônicos',
        flat_line: 'Verificar amperímetro',
        correlation_break: 'Verificar circuito',
        pattern_deviation: 'Verificar ciclo'
      }
    };

    const actionDescription = actions[anomaly.sensorType]?.[anomaly.anomalyType] || 
                              'Notificar equipe de manutenção';

    // Simulate automatic execution
    const action: CorrectiveAction = {
      id: crypto.randomUUID(),
      type: 'automatic',
      action: actionDescription,
      executed: true,
      executedAt: new Date(),
      success: Math.random() > 0.1, // 90% success rate
      result: null
    };

    action.result = action.success 
      ? 'Ação corretiva executada com sucesso'
      : 'Ação automática falhou - escalonando para intervenção manual';

    // Update anomaly status
    if (action.success) {
      anomaly.status = 'auto_corrected';
    }

    return action;
  }

  getEquipmentHealth(equipmentId: string): IoTHealthStatus {
    const equipmentReadings = [...this.readingHistory.entries()]
      .filter(([sensorId]) => {
        const readings = this.readingHistory.get(sensorId);
        return readings && readings.length > 0 && readings[0].equipmentId === equipmentId;
      });

    const sensorsOnline = equipmentReadings.length;
    const activeAnomalies = [...this.activeAnomalies.values()]
      .filter(a => a.equipmentId === equipmentId && a.status === 'active');

    // Calculate health score
    let healthScore = 100;
    for (const anomaly of activeAnomalies) {
      const deduction = anomaly.severity === 'critical' ? 30 :
                        anomaly.severity === 'alert' ? 20 :
                        anomaly.severity === 'warning' ? 10 : 5;
      healthScore -= deduction;
    }

    // Get most recent reading timestamp
    let lastReading = new Date(0);
    for (const [, readings] of equipmentReadings) {
      const latest = readings[readings.length - 1];
      if (new Date(latest.timestamp) > lastReading) {
        lastReading = new Date(latest.timestamp);
      }
    }

    return {
      equipmentId,
      equipmentName: `Equipment ${equipmentId.slice(0, 8)}`,
      overallHealth: Math.max(0, healthScore),
      sensorsOnline,
      sensorsTotal: sensorsOnline, // Assuming all sensors are online
      activeAnomalies: activeAnomalies.length,
      recentAlerts: activeAnomalies.slice(0, 5),
      trends: this.calculateTrends(equipmentReadings),
      lastReading,
      nextMaintenance: null
    };
  }

  private calculateTrends(
    readings: Array<[string, SensorReading[]]>
  ): Array<{ metric: string; trend: 'stable' | 'improving' | 'degrading'; forecast: string }> {
    const trends: Array<{ metric: string; trend: 'stable' | 'improving' | 'degrading'; forecast: string }> = [];

    for (const [sensorId, sensorReadings] of readings) {
      if (sensorReadings.length < 20) continue;

      const recent = sensorReadings.slice(-10).map(r => r.value);
      const earlier = sensorReadings.slice(-20, -10).map(r => r.value);

      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

      const change = (recentAvg - earlierAvg) / earlierAvg * 100;

      let trend: 'stable' | 'improving' | 'degrading';
      let forecast: string;

      // For most sensors, increasing values = degrading
      if (Math.abs(change) < 5) {
        trend = 'stable';
        forecast = 'Sem alteração prevista';
      } else if (change > 0) {
        trend = 'degrading';
        forecast = `Aumento de ${change.toFixed(1)}% - monitorar`;
      } else {
        trend = 'improving';
        forecast = `Redução de ${Math.abs(change).toFixed(1)}% - positivo`;
      }

      trends.push({
        metric: sensorReadings[0].sensorType,
        trend,
        forecast
      });
    }

    return trends.slice(0, 5);
  }

  updateBaseline(sensorId: string, updates: Partial<SensorBaseline>): void {
    const current = this.baselines.get(sensorId);
    if (current) {
      this.baselines.set(sensorId, { ...current, ...updates, lastUpdated: new Date() });
    }
  }

  acknowledgeAnomaly(anomalyId: string): boolean {
    const anomaly = this.activeAnomalies.get(anomalyId);
    if (anomaly) {
      anomaly.status = 'acknowledged';
      return true;
    }
    return false;
  }

  resolveAnomaly(anomalyId: string): boolean {
    const anomaly = this.activeAnomalies.get(anomalyId);
    if (anomaly) {
      anomaly.status = 'resolved';
      return true;
    }
    return false;
  }

  getActiveAnomalies(): AnomalyDetection[] {
    return [...this.activeAnomalies.values()].filter(a => a.status === 'active');
  }
}

export const anomalyDetectionIoT = new AnomalyDetectionIoTEngine();
