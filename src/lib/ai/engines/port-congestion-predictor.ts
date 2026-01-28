/**
 * Port Congestion Predictor - ML Engine
 * Previsão de congestionamento portuário
 */

export interface PortData {
  portId: string;
  portName: string;
  country: string;
  region: string;
  capacity: PortCapacity;
  currentStatus: PortStatus;
  historicalData: HistoricalPortData[];
  scheduledArrivals: ScheduledArrival[];
  weather: PortWeather;
}

export interface PortCapacity {
  berthCount: number;
  maxVesselSize: string; // LOA
  annualThroughputTEU: number;
  craneCount: number;
  avgTurnaroundHours: number;
}

export interface PortStatus {
  occupancyRate: number; // 0-100
  vesselsAtBerth: number;
  vesselsAtAnchor: number;
  avgWaitingTime: number; // hours
  operationalStatus: 'normal' | 'busy' | 'congested' | 'critical';
  lastUpdated: Date;
}

export interface HistoricalPortData {
  date: Date;
  occupancyRate: number;
  avgWaitingTime: number;
  throughput: number;
  delays: number;
}

export interface ScheduledArrival {
  vesselId: string;
  vesselName: string;
  vesselType: string;
  eta: Date;
  estimatedBerthTime: number; // hours
  priority: 'normal' | 'high' | 'urgent';
}

export interface PortWeather {
  windSpeed: number;
  visibility: number;
  seaState: number;
  operationalImpact: 'none' | 'minor' | 'moderate' | 'severe';
}

export interface CongestionPrediction {
  portId: string;
  portName: string;
  predictionTime: Date;
  horizon: number; // hours
  predictions: HourlyPrediction[];
  peakCongestion: {
    time: Date;
    occupancy: number;
    waitTime: number;
  };
  alerts: CongestionAlert[];
  recommendations: PortRecommendation[];
  confidence: number;
}

export interface HourlyPrediction {
  time: Date;
  predictedOccupancy: number;
  predictedWaitTime: number;
  congestionLevel: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
}

export interface CongestionAlert {
  severity: 'info' | 'warning' | 'critical';
  type: 'peak_congestion' | 'extended_wait' | 'berth_shortage' | 'weather_impact';
  message: string;
  startTime: Date;
  endTime: Date;
  affectedVessels: number;
}

export interface PortRecommendation {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'timing' | 'alternative' | 'speed' | 'communication';
  action: string;
  estimatedBenefit: string;
  applicableTo: string[];
}

class PortCongestionPredictor {
  /**
   * Predict port congestion
   */
  predictCongestion(portData: PortData, horizonHours: number = 72): CongestionPrediction {
    const predictions = this.generateHourlyPredictions(portData, horizonHours);
    const peak = this.findPeakCongestion(predictions);
    const alerts = this.generateAlerts(predictions, portData);
    const recommendations = this.generateRecommendations(predictions, portData);
    const confidence = this.calculateConfidence(portData);

    return {
      portId: portData.portId,
      portName: portData.portName,
      predictionTime: new Date(),
      horizon: horizonHours,
      predictions,
      peakCongestion: peak,
      alerts,
      recommendations,
      confidence
    };
  }

  /**
   * Compare multiple ports for optimal arrival
   */
  comparePortOptions(ports: PortData[]): {
    rankings: Array<{
      portId: string;
      portName: string;
      score: number;
      currentWait: number;
      predictedWait24h: number;
      recommendation: string;
    }>;
    bestOption: string;
    analysis: string;
  } {
    const predictions = ports.map(p => ({
      port: p,
      prediction: this.predictCongestion(p, 24)
    }));

    const rankings = predictions.map(({ port, prediction }) => {
      const avg24hOccupancy = prediction.predictions.reduce(
        (sum, p) => sum + p.predictedOccupancy, 0
      ) / prediction.predictions.length;

      const score = 100 - avg24hOccupancy * 0.6 - port.currentStatus.avgWaitingTime * 0.4;

      return {
        portId: port.portId,
        portName: port.portName,
        score: Math.round(score),
        currentWait: port.currentStatus.avgWaitingTime,
        predictedWait24h: prediction.predictions[23]?.predictedWaitTime || 0,
        recommendation: this.getPortRecommendation(score, port.currentStatus)
      };
    }).sort((a, b) => b.score - a.score);

    const bestPort = rankings[0];

    return {
      rankings,
      bestOption: bestPort.portId,
      analysis: `${bestPort.portName} é a melhor opção com score ${bestPort.score} e tempo de espera estimado de ${bestPort.predictedWait24h.toFixed(1)}h.`
    };
  }

  /**
   * Suggest optimal arrival time
   */
  suggestArrivalTime(
    portData: PortData,
    earliestArrival: Date,
    latestArrival: Date
  ): {
    optimalTime: Date;
    expectedWait: number;
    congestionLevel: string;
    savings: {
      timeHours: number;
      percentReduction: number;
    };
  } {
    const prediction = this.predictCongestion(portData, 168); // 7 days
    
    // Filter predictions within arrival window
    const validPredictions = prediction.predictions.filter(p => 
      p.time >= earliestArrival && p.time <= latestArrival
    );

    if (validPredictions.length === 0) {
      return {
        optimalTime: earliestArrival,
        expectedWait: portData.currentStatus.avgWaitingTime,
        congestionLevel: 'moderate',
        savings: { timeHours: 0, percentReduction: 0 }
      };
    }

    // Find lowest congestion time
    const optimal = validPredictions.reduce((best, current) => 
      current.predictedWaitTime < best.predictedWaitTime ? current : best
    );

    const worstCase = validPredictions.reduce((worst, current) =>
      current.predictedWaitTime > worst.predictedWaitTime ? current : worst
    );

    return {
      optimalTime: optimal.time,
      expectedWait: optimal.predictedWaitTime,
      congestionLevel: optimal.congestionLevel,
      savings: {
        timeHours: Math.round((worstCase.predictedWaitTime - optimal.predictedWaitTime) * 10) / 10,
        percentReduction: Math.round((1 - optimal.predictedWaitTime / worstCase.predictedWaitTime) * 100)
      }
    };
  }

  private generateHourlyPredictions(portData: PortData, horizonHours: number): HourlyPrediction[] {
    const predictions: HourlyPrediction[] = [];
    const now = new Date();
    let currentOccupancy = portData.currentStatus.occupancyRate;
    let currentWait = portData.currentStatus.avgWaitingTime;

    for (let hour = 0; hour <= horizonHours; hour++) {
      const time = new Date(now.getTime() + hour * 60 * 60 * 1000);
      
      // Calculate arrivals effect
      const arrivalsInHour = portData.scheduledArrivals.filter(a => {
        const arrivalHour = new Date(a.eta).getTime();
        return arrivalHour >= time.getTime() && arrivalHour < time.getTime() + 3600000;
      });

      // Simulate occupancy changes
      const arrivalImpact = arrivalsInHour.length * 5;
      const departureRate = currentOccupancy * 0.02; // 2% turnover per hour
      const weatherImpact = this.calculateWeatherImpact(portData.weather);
      
      currentOccupancy = Math.max(0, Math.min(100,
        currentOccupancy + arrivalImpact - departureRate + weatherImpact
      ));

      // Calculate wait time based on occupancy
      currentWait = this.estimateWaitTime(currentOccupancy, portData.capacity);

      // Add some variability for realism
      const noise = (Math.random() - 0.5) * 5;
      const noisyOccupancy = Math.max(0, Math.min(100, currentOccupancy + noise));

      predictions.push({
        time,
        predictedOccupancy: Math.round(noisyOccupancy),
        predictedWaitTime: Math.round(currentWait * 10) / 10,
        congestionLevel: this.getCongestionLevel(noisyOccupancy),
        confidence: Math.max(0.5, 0.95 - hour * 0.005) // Confidence decreases over time
      });
    }

    return predictions;
  }

  private findPeakCongestion(predictions: HourlyPrediction[]): {
    time: Date;
    occupancy: number;
    waitTime: number;
  } {
    const peak = predictions.reduce((max, p) => 
      p.predictedOccupancy > max.predictedOccupancy ? p : max
    );

    return {
      time: peak.time,
      occupancy: peak.predictedOccupancy,
      waitTime: peak.predictedWaitTime
    };
  }

  private generateAlerts(
    predictions: HourlyPrediction[],
    portData: PortData
  ): CongestionAlert[] {
    const alerts: CongestionAlert[] = [];

    // Find critical periods
    const criticalPeriods = this.findCriticalPeriods(predictions);
    
    criticalPeriods.forEach(period => {
      alerts.push({
        severity: period.level === 'critical' ? 'critical' : 'warning',
        type: 'peak_congestion',
        message: `Congestionamento ${period.level} previsto de ${period.start.toLocaleString()} a ${period.end.toLocaleString()}`,
        startTime: period.start,
        endTime: period.end,
        affectedVessels: Math.ceil(period.avgOccupancy / 10)
      });
    });

    // Weather impact alert
    if (portData.weather.operationalImpact !== 'none') {
      alerts.push({
        severity: portData.weather.operationalImpact === 'severe' ? 'critical' : 'warning',
        type: 'weather_impact',
        message: `Condições meteorológicas podem impactar operações (${portData.weather.operationalImpact})`,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        affectedVessels: portData.currentStatus.vesselsAtBerth + portData.currentStatus.vesselsAtAnchor
      });
    }

    return alerts;
  }

  private generateRecommendations(
    predictions: HourlyPrediction[],
    portData: PortData
  ): PortRecommendation[] {
    const recommendations: PortRecommendation[] = [];

    // Find low congestion windows
    const lowPeriods = predictions.filter(p => p.congestionLevel === 'low');
    if (lowPeriods.length > 0) {
      recommendations.push({
        priority: 'high',
        type: 'timing',
        action: `Considerar chegada durante períodos de baixo congestionamento identificados`,
        estimatedBenefit: 'Redução de até 40% no tempo de espera',
        applicableTo: ['all_vessels']
      });
    }

    // Speed adjustment recommendation
    const avgNext24h = predictions.slice(0, 24).reduce((s, p) => s + p.predictedOccupancy, 0) / 24;
    if (avgNext24h > 80) {
      recommendations.push({
        priority: 'medium',
        type: 'speed',
        action: 'Reduzir velocidade para chegar após período de pico',
        estimatedBenefit: 'Economia de combustível + menor tempo de ancoragem',
        applicableTo: ['vessels_24h_out']
      });
    }

    // Communication recommendation
    if (portData.currentStatus.operationalStatus === 'critical') {
      recommendations.push({
        priority: 'urgent',
        type: 'communication',
        action: 'Contatar autoridade portuária para confirmar berço antes da chegada',
        estimatedBenefit: 'Evitar surpresas e permitir planejamento alternativo',
        applicableTo: ['all_vessels']
      });
    }

    return recommendations;
  }

  private calculateWeatherImpact(weather: PortWeather): number {
    switch (weather.operationalImpact) {
      case 'severe': return 15;
      case 'moderate': return 8;
      case 'minor': return 3;
      default: return 0;
    }
  }

  private estimateWaitTime(occupancy: number, capacity: PortCapacity): number {
    // Simple model: wait time increases exponentially with occupancy
    if (occupancy < 50) return 0;
    if (occupancy < 70) return (occupancy - 50) * 0.2;
    if (occupancy < 85) return 4 + (occupancy - 70) * 0.6;
    return 13 + (occupancy - 85) * 1.5;
  }

  private getCongestionLevel(occupancy: number): HourlyPrediction['congestionLevel'] {
    if (occupancy >= 90) return 'critical';
    if (occupancy >= 75) return 'high';
    if (occupancy >= 50) return 'moderate';
    return 'low';
  }

  private findCriticalPeriods(predictions: HourlyPrediction[]): Array<{
    start: Date;
    end: Date;
    level: string;
    avgOccupancy: number;
  }> {
    const periods: Array<{ start: Date; end: Date; level: string; avgOccupancy: number }> = [];
    let currentPeriod: { start: Date; predictions: HourlyPrediction[] } | null = null;

    for (const prediction of predictions) {
      if (prediction.congestionLevel === 'critical' || prediction.congestionLevel === 'high') {
        if (!currentPeriod) {
          currentPeriod = { start: prediction.time, predictions: [] };
        }
        currentPeriod.predictions.push(prediction);
      } else if (currentPeriod) {
        const avgOcc = currentPeriod.predictions.reduce(
          (s, p) => s + p.predictedOccupancy, 0
        ) / currentPeriod.predictions.length;

        periods.push({
          start: currentPeriod.start,
          end: currentPeriod.predictions[currentPeriod.predictions.length - 1].time,
          level: avgOcc >= 90 ? 'critical' : 'high',
          avgOccupancy: avgOcc
        });
        currentPeriod = null;
      }
    }

    return periods;
  }

  private calculateConfidence(portData: PortData): number {
    let confidence = 0.8;

    // More historical data = higher confidence
    if (portData.historicalData.length >= 30) confidence += 0.1;
    if (portData.historicalData.length >= 90) confidence += 0.05;

    // Recent data update = higher confidence
    const hoursSinceUpdate = (Date.now() - portData.currentStatus.lastUpdated.getTime()) / 3600000;
    if (hoursSinceUpdate < 1) confidence += 0.05;
    if (hoursSinceUpdate > 6) confidence -= 0.1;

    return Math.min(0.95, Math.max(0.5, confidence));
  }

  private getPortRecommendation(score: number, status: PortStatus): string {
    if (score >= 80) return 'Excelente escolha - baixo congestionamento';
    if (score >= 60) return 'Boa opção - congestionamento moderado';
    if (score >= 40) return 'Aceitável - considerar alternativas';
    return 'Não recomendado - alto congestionamento';
  }
}

export const portCongestionPredictor = new PortCongestionPredictor();
