/**
 * PATCH 182.0 - Risk Interpreter
 * AI-powered anomaly and obstacle detection
 * 
 * Features:
 * - Hazard classification
 * - Risk scoring
 * - Safe zone identification
 * - Navigation recommendations
 */

import { SonarReturn, SonarPattern } from './dataAnalyzer';

export interface Hazard {
  id: string;
  type: 'obstacle' | 'anomaly' | 'dangerous_terrain' | 'unknown_object' | 'low_visibility';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { angle: number; distance: number; depth: number };
  description: string;
  recommendation: string;
  affectedRadius: number; // meters
  confidence: number; // 0-100
}

export interface SafeZone {
  id: string;
  center: { angle: number; distance: number };
  radius: number;
  safetyScore: number; // 0-100
  characteristics: string[];
}

export interface RiskAssessment {
  timestamp: string;
  overallRisk: 'safe' | 'caution' | 'dangerous' | 'critical';
  riskScore: number; // 0-100 (higher = more risk)
  hazards: Hazard[];
  safeZones: SafeZone[];
  navigationAdvice: string;
  detectedAnomalies: number;
}

class RiskInterpreter {
  private readonly OBSTACLE_INTENSITY_THRESHOLD = 75;
  private readonly ANOMALY_CONFIDENCE_THRESHOLD = 80;
  private readonly CRITICAL_DEPTH_VARIANCE = 50; // meters
  private readonly SAFE_ZONE_MIN_SIZE = 10; // meters

  /**
   * Interpret sonar data and assess risks
   */
  assessRisks(
    returns: SonarReturn[],
    patterns: SonarPattern[],
    currentDepth: number
  ): RiskAssessment {
    const hazards = this.identifyHazards(returns, patterns, currentDepth);
    const safeZones = this.identifySafeZones(returns, hazards);
    const riskScore = this.calculateRiskScore(hazards);
    const overallRisk = this.categorizeRisk(riskScore);
    const navigationAdvice = this.generateNavigationAdvice(hazards, safeZones, overallRisk);
    const detectedAnomalies = patterns.filter(p => p.type === 'anomaly').length;

    return {
      timestamp: new Date().toISOString(),
      overallRisk,
      riskScore,
      hazards,
      safeZones,
      navigationAdvice,
      detectedAnomalies,
    };
  }

  /**
   * Identify hazards from sonar data
   */
  private identifyHazards(
    returns: SonarReturn[],
    patterns: SonarPattern[],
    currentDepth: number
  ): Hazard[] {
    const hazards: Hazard[] = [];

    // Detect obstacles from high-intensity returns
    const obstacles = returns.filter(
      r => r.ping.intensity > this.OBSTACLE_INTENSITY_THRESHOLD && r.material === 'rock'
    );

    for (const obstacle of obstacles) {
      // Check if obstacle is close to current position
      const distance = obstacle.ping.distance;
      const depthDiff = Math.abs(obstacle.depth - currentDepth);

      if (distance < 20 && depthDiff < 5) {
        hazards.push({
          id: `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'obstacle',
          severity: distance < 10 ? 'critical' : 'high',
          location: {
            angle: obstacle.ping.angle,
            distance: obstacle.ping.distance,
            depth: obstacle.depth,
          },
          description: `${obstacle.material.toUpperCase()} obstacle detected`,
          recommendation: `Immediate course correction recommended. Obstacle at ${distance.toFixed(1)}m`,
          affectedRadius: 5,
          confidence: obstacle.confidence,
        });
      }
    }

    // Detect dangerous terrain from patterns
    for (const pattern of patterns) {
      if (pattern.type === 'terrain' && pattern.confidence > 70) {
        const depthDiff = Math.abs(pattern.location.depth - currentDepth);
        
        if (depthDiff > this.CRITICAL_DEPTH_VARIANCE) {
          hazards.push({
            id: `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'dangerous_terrain',
            severity: depthDiff > 100 ? 'critical' : 'high',
            location: pattern.location,
            description: `Dangerous terrain: ${pattern.description}`,
            recommendation: `Avoid area. Depth variance: ${depthDiff.toFixed(0)}m`,
            affectedRadius: pattern.size,
            confidence: pattern.confidence,
          });
        }
      }

      // Detect anomalies
      if (pattern.type === 'anomaly' || pattern.type === 'object') {
        const severity = this.assessAnomalySeverity(pattern);
        
        hazards.push({
          id: `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: pattern.type === 'object' ? 'unknown_object' : 'anomaly',
          severity,
          location: pattern.location,
          description: pattern.description,
          recommendation: this.getAnomalyRecommendation(pattern, severity),
          affectedRadius: pattern.size,
          confidence: pattern.confidence,
        });
      }
    }

    // Detect low visibility zones
    const lowVisReturns = returns.filter(r => r.noise > 50);
    if (lowVisReturns.length > returns.length * 0.3) {
      hazards.push({
        id: `hazard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'low_visibility',
        severity: 'medium',
        location: { angle: 0, distance: 0, depth: currentDepth },
        description: 'Reduced sonar visibility due to high turbidity or noise',
        recommendation: 'Reduce speed and proceed with caution',
        affectedRadius: 50,
        confidence: 85,
      });
    }

    return hazards;
  }

  /**
   * Assess severity of anomaly
   */
  private assessAnomalySeverity(pattern: SonarPattern): Hazard['severity'] {
    if (pattern.confidence > 90 && pattern.size > 20) {
      return 'critical';
    } else if (pattern.confidence > 75 || pattern.size > 10) {
      return 'high';
    } else if (pattern.confidence > 60) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Get recommendation for anomaly
   */
  private getAnomalyRecommendation(pattern: SonarPattern, severity: Hazard['severity']): string {
    if (severity === 'critical') {
      return 'CRITICAL: Unidentified large object. Immediate evasive action required.';
    } else if (severity === 'high') {
      return 'HIGH: Unknown object detected. Maintain safe distance and monitor.';
    } else if (severity === 'medium') {
      return 'MEDIUM: Possible anomaly detected. Exercise caution.';
    }
    return 'LOW: Minor anomaly. Continue monitoring.';
  }

  /**
   * Identify safe zones
   */
  private identifySafeZones(returns: SonarReturn[], hazards: Hazard[]): SafeZone[] {
    const safeZones: SafeZone[] = [];
    const angleStep = 15; // Check every 15 degrees

    for (let angle = 0; angle < 360; angle += angleStep) {
      // Get returns in this direction
      const directionReturns = returns.filter(
        r => Math.abs(r.ping.angle - angle) < angleStep / 2
      );

      if (directionReturns.length === 0) continue;

      // Check if area is clear of hazards
      const hasHazards = hazards.some(h => 
        Math.abs(h.location.angle - angle) < angleStep &&
        h.location.distance < 50
      );

      if (hasHazards) continue;

      // Calculate average characteristics
      const avgDepth = directionReturns.reduce((sum, r) => sum + r.depth, 0) / directionReturns.length;
      const avgDistance = directionReturns.reduce((sum, r) => sum + r.ping.distance, 0) / directionReturns.length;
      const materials = directionReturns.map(r => r.material);

      // Determine if it's a good safe zone
      const isSoftBottom = materials.filter(m => m === 'sand' || m === 'mud').length > materials.length * 0.7;
      const isConsistent = new Set(materials).size <= 2;
      const hasGoodSignal = directionReturns.every(r => r.confidence > 60);

      if (isSoftBottom && isConsistent && hasGoodSignal) {
        const characteristics: string[] = [];
        
        if (isSoftBottom) characteristics.push('Soft bottom (safe for landing)');
        if (isConsistent) characteristics.push('Consistent terrain');
        if (hasGoodSignal) characteristics.push('Good sonar visibility');

        const safetyScore = this.calculateSafetyScore(directionReturns, hazards);

        if (safetyScore > 60) {
          safeZones.push({
            id: `safe-${Date.now()}-${angle}`,
            center: { angle, distance: avgDistance },
            radius: this.SAFE_ZONE_MIN_SIZE,
            safetyScore,
            characteristics,
          });
        }
      }
    }

    return safeZones;
  }

  /**
   * Calculate safety score for a zone
   */
  private calculateSafetyScore(returns: SonarReturn[], hazards: Hazard[]): number {
    let score = 100;

    // Penalize for nearby hazards
    const nearbyHazards = hazards.filter(h => h.location.distance < 50);
    score -= nearbyHazards.length * 10;

    // Penalize for low confidence returns
    const avgConfidence = returns.reduce((sum, r) => sum + r.confidence, 0) / returns.length;
    score = (score + avgConfidence) / 2;

    // Penalize for high noise
    const avgNoise = returns.reduce((sum, r) => sum + r.noise, 0) / returns.length;
    score -= avgNoise * 0.5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall risk score
   */
  private calculateRiskScore(hazards: Hazard[]): number {
    if (hazards.length === 0) return 0;

    const severityWeights = {
      low: 10,
      medium: 25,
      high: 50,
      critical: 100,
    };

    let totalRisk = 0;
    for (const hazard of hazards) {
      const baseRisk = severityWeights[hazard.severity];
      const confidenceFactor = hazard.confidence / 100;
      totalRisk += baseRisk * confidenceFactor;
    }

    // Normalize to 0-100 scale
    return Math.min(100, totalRisk / hazards.length);
  }

  /**
   * Categorize risk level
   */
  private categorizeRisk(riskScore: number): RiskAssessment['overallRisk'] {
    if (riskScore < 20) return 'safe';
    if (riskScore < 50) return 'caution';
    if (riskScore < 80) return 'dangerous';
    return 'critical';
  }

  /**
   * Generate navigation advice
   */
  private generateNavigationAdvice(
    hazards: Hazard[],
    safeZones: SafeZone[],
    overallRisk: RiskAssessment['overallRisk']
  ): string {
    if (overallRisk === 'critical') {
      const criticalHazards = hazards.filter(h => h.severity === 'critical');
      return `CRITICAL ALERT: ${criticalHazards.length} critical hazard(s) detected. Immediate evasive action required. Surface or retreat to safe distance.`;
    }

    if (overallRisk === 'dangerous') {
      return `HIGH RISK: Multiple hazards detected. Reduce speed and maintain heightened awareness. Consider alternative route.`;
    }

    if (overallRisk === 'caution') {
      if (safeZones.length > 0) {
        const bestZone = safeZones.reduce((best, zone) => 
          zone.safetyScore > best.safetyScore ? zone : best
        );
        return `CAUTION: Hazards present. Recommend heading ${bestZone.center.angle.toFixed(0)}° towards safe zone (safety score: ${bestZone.safetyScore.toFixed(0)}).`;
      }
      return `CAUTION: Some hazards detected. Proceed slowly and monitor sonar closely.`;
    }

    // Safe conditions
    if (safeZones.length > 3) {
      return `SAFE: Multiple safe zones identified. Current area is clear for navigation. Continue monitoring.`;
    }
    
    return `SAFE: No immediate hazards detected. Maintain current course and speed.`;
  }

  /**
   * Detect specific anomaly types
   */
  detectSpecificAnomalies(returns: SonarReturn[]): {
    wreckage: boolean;
    biologicalActivity: boolean;
    geologicalFeature: boolean;
    manMadeObject: boolean;
  } {
    const metals = returns.filter(r => r.material === 'metal');
    const biological = returns.filter(r => r.material === 'biological');
    const rocks = returns.filter(r => r.material === 'rock');

    return {
      wreckage: metals.length > 5 && metals.some(m => m.confidence > 85),
      biologicalActivity: biological.length > returns.length * 0.2,
      geologicalFeature: rocks.length > returns.length * 0.6 && rocks.some(r => r.depth > 100),
      manMadeObject: metals.length > 0 && metals.every(m => m.confidence > 90),
    };
  }
}

export default RiskInterpreter;
