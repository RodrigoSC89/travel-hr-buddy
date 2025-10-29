/**
 * PATCH 531 - DP Intelligence Positioning Analysis Tests
 * Tests for DP positioning analysis, drift detection, and thruster optimization
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

interface Position {
  lat: number;
  lon: number;
  heading: number;
  timestamp: string;
}

interface ThrusterStatus {
  id: string;
  name: string;
  power: number; // 0-100%
  azimuth: number; // degrees
  operational: boolean;
}

interface PositioningAnalysis {
  currentPosition: Position;
  targetPosition: Position;
  deviation: number; // meters
  driftRate: number; // m/s
  driftDirection: number; // degrees
  thrusterOptimization: {
    recommended: ThrusterStatus[];
    efficiency: number; // percentage
    powerSavings: number; // percentage
  };
  alerts: string[];
  status: 'optimal' | 'acceptable' | 'warning' | 'critical';
}

// Mock positioning analysis service
const analyzePositioning = (
  current: Position,
  target: Position,
  thrusters: ThrusterStatus[],
  environmentalFactors: any
): PositioningAnalysis => {
  // Calculate deviation (simplified Haversine formula)
  const R = 6371000; // Earth radius in meters
  const lat1 = current.lat * Math.PI / 180;
  const lat2 = target.lat * Math.PI / 180;
  const deltaLat = (target.lat - current.lat) * Math.PI / 180;
  const deltaLon = (target.lon - current.lon) * Math.PI / 180;
  
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const deviation = R * c;
  
  // Calculate drift rate (simplified)
  const driftRate = deviation / 60; // Assume 1 minute time window
  
  // Calculate drift direction
  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
  const driftDirection = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  
  // Analyze thruster optimization
  const operationalThrusters = thrusters.filter(t => t.operational);
  const avgPower = operationalThrusters.reduce((sum, t) => sum + t.power, 0) / operationalThrusters.length;
  
  const efficiency = operationalThrusters.length === thrusters.length ? 100 : 
                    (operationalThrusters.length / thrusters.length) * 100;
  
  // Calculate recommended thruster adjustments
  const recommended = thrusters.map(t => {
    if (!t.operational) return t;
    
    // Adjust power based on deviation
    let newPower = t.power;
    if (deviation > 5) {
      newPower = Math.min(100, t.power + 20);
    } else if (deviation < 1) {
      newPower = Math.max(30, t.power - 10);
    }
    
    return { ...t, power: newPower };
  });
  
  const powerSavings = recommended.reduce((sum, t) => sum + (thrusters.find(orig => orig.id === t.id)!.power - t.power), 0) / thrusters.length;
  
  // Determine status
  let status: 'optimal' | 'acceptable' | 'warning' | 'critical';
  const alerts: string[] = [];
  
  if (deviation < 1) {
    status = 'optimal';
  } else if (deviation < 3) {
    status = 'acceptable';
  } else if (deviation < 5) {
    status = 'warning';
    alerts.push('Position deviation exceeds 3 meters');
  } else {
    status = 'critical';
    alerts.push('Critical position deviation detected');
    alerts.push('Immediate corrective action required');
  }
  
  if (driftRate > 0.1) {
    alerts.push(`High drift rate detected: ${driftRate.toFixed(3)} m/s`);
  }
  
  if (operationalThrusters.length < thrusters.length) {
    alerts.push(`${thrusters.length - operationalThrusters.length} thruster(s) offline`);
  }
  
  return {
    currentPosition: current,
    targetPosition: target,
    deviation,
    driftRate,
    driftDirection,
    thrusterOptimization: {
      recommended,
      efficiency,
      powerSavings
    },
    alerts,
    status
  };
};

const detectDrift = (positions: Position[]): { detected: boolean; rate: number; direction: number; trend: 'increasing' | 'decreasing' | 'stable' } => {
  if (positions.length < 2) {
    return { detected: false, rate: 0, direction: 0, trend: 'stable' };
  }
  
  // Calculate drift between consecutive positions
  const drifts: number[] = [];
  for (let i = 1; i < positions.length; i++) {
    const deltaLat = positions[i].lat - positions[i - 1].lat;
    const deltaLon = positions[i].lon - positions[i - 1].lon;
    const drift = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon) * 111000; // Rough meters
    drifts.push(drift);
  }
  
  const avgDrift = drifts.reduce((a, b) => a + b, 0) / drifts.length;
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (drifts.length > 2) {
    const firstHalf = drifts.slice(0, Math.floor(drifts.length / 2));
    const secondHalf = drifts.slice(Math.floor(drifts.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.2) trend = 'increasing';
    else if (secondAvg < firstAvg * 0.8) trend = 'decreasing';
  }
  
  const detected = avgDrift > 0.5; // Threshold: 0.5 meters
  
  // Calculate average direction
  const lastPos = positions[positions.length - 1];
  const firstPos = positions[0];
  const deltaLat = lastPos.lat - firstPos.lat;
  const deltaLon = lastPos.lon - firstPos.lon;
  const direction = (Math.atan2(deltaLon, deltaLat) * 180 / Math.PI + 360) % 360;
  
  return { detected, rate: avgDrift, direction, trend };
};

describe("DP Intelligence - Positioning Analysis Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Position Deviation Analysis", () => {
    it("should calculate accurate position deviation", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5001, lon: -88.3001, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Bow Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.deviation).toBeGreaterThan(0);
      expect(analysis.deviation).toBeLessThan(20); // Should be small deviation
    });

    it("should report optimal status for minimal deviation", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.status).toBe('optimal');
      expect(analysis.deviation).toBeLessThan(1);
    });

    it("should report critical status for large deviation", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.51, lon: -88.31, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.status).toBe('critical');
      expect(analysis.alerts.length).toBeGreaterThan(0);
    });

    it("should calculate drift rate correctly", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5001, lon: -88.3001, heading: 0, timestamp: '2025-01-01T00:01:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.driftRate).toBeGreaterThan(0);
    });

    it("should calculate drift direction", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5001, lon: -88.3001, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.driftDirection).toBeGreaterThanOrEqual(0);
      expect(analysis.driftDirection).toBeLessThan(360);
    });
  });

  describe("Thruster Optimization", () => {
    it("should recommend power increase for large deviation", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.506, lon: -88.306, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 50, azimuth: 90, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      const avgRecommendedPower = analysis.thrusterOptimization.recommended
        .reduce((sum, t) => sum + t.power, 0) / analysis.thrusterOptimization.recommended.length;
      
      expect(avgRecommendedPower).toBeGreaterThan(50);
    });

    it("should recommend power decrease for minimal deviation", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 80, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 80, azimuth: 90, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      const avgRecommendedPower = analysis.thrusterOptimization.recommended
        .reduce((sum, t) => sum + t.power, 0) / analysis.thrusterOptimization.recommended.length;
      
      expect(avgRecommendedPower).toBeLessThan(80);
    });

    it("should calculate thruster efficiency correctly", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 50, azimuth: 90, operational: true },
        { id: 't3', name: 'Thruster 3', power: 50, azimuth: 180, operational: false }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.thrusterOptimization.efficiency).toBeLessThan(100);
      expect(analysis.thrusterOptimization.efficiency).toBeGreaterThan(0);
    });

    it("should alert on offline thrusters", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 0, azimuth: 90, operational: false }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      const hasOfflineAlert = analysis.alerts.some(alert => alert.includes('offline'));
      expect(hasOfflineAlert).toBe(true);
    });

    it("should maintain operational thrusters unchanged when offline", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: false }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      const offlineThruster = analysis.thrusterOptimization.recommended.find(t => t.id === 't1');
      expect(offlineThruster?.operational).toBe(false);
      expect(offlineThruster?.power).toBe(50); // Should not change
    });
  });

  describe("Drift Detection", () => {
    it("should detect drift from position history", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' },
        { lat: 25.5005, lon: -88.3005, heading: 0, timestamp: '2025-01-01T00:01:00Z' },
        { lat: 25.501, lon: -88.301, heading: 0, timestamp: '2025-01-01T00:02:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.detected).toBe(true);
      expect(drift.rate).toBeGreaterThan(0);
    });

    it("should not detect drift for stable position", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' },
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:01:00Z' },
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:02:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.detected).toBe(false);
      expect(drift.rate).toBe(0);
    });

    it("should calculate drift direction", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' },
        { lat: 25.501, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:01:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.direction).toBeGreaterThanOrEqual(0);
      expect(drift.direction).toBeLessThan(360);
    });

    it("should detect increasing drift trend", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' },
        { lat: 25.5001, lon: -88.3001, heading: 0, timestamp: '2025-01-01T00:01:00Z' },
        { lat: 25.5003, lon: -88.3003, heading: 0, timestamp: '2025-01-01T00:02:00Z' },
        { lat: 25.5006, lon: -88.3006, heading: 0, timestamp: '2025-01-01T00:03:00Z' },
        { lat: 25.501, lon: -88.301, heading: 0, timestamp: '2025-01-01T00:04:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.trend).toBe('increasing');
    });

    it("should detect decreasing drift trend", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' },
        { lat: 25.501, lon: -88.301, heading: 0, timestamp: '2025-01-01T00:01:00Z' },
        { lat: 25.5015, lon: -88.3015, heading: 0, timestamp: '2025-01-01T00:02:00Z' },
        { lat: 25.5017, lon: -88.3017, heading: 0, timestamp: '2025-01-01T00:03:00Z' },
        { lat: 25.5018, lon: -88.3018, heading: 0, timestamp: '2025-01-01T00:04:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.trend).toBe('decreasing');
    });

    it("should handle single position gracefully", () => {
      const positions: Position[] = [
        { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' }
      ];
      
      const drift = detectDrift(positions);
      
      expect(drift.detected).toBe(false);
      expect(drift.rate).toBe(0);
      expect(drift.trend).toBe('stable');
    });
  });

  describe("Alert System", () => {
    it("should generate alerts for high drift rate", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.51, lon: -88.31, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      const hasDriftAlert = analysis.alerts.some(alert => alert.toLowerCase().includes('drift'));
      expect(hasDriftAlert).toBe(true);
    });

    it("should prioritize critical alerts", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.51, lon: -88.31, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: false }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.status).toBe('critical');
      expect(analysis.alerts.length).toBeGreaterThan(0);
    });

    it("should have no alerts for optimal positioning", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 50, azimuth: 90, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.alerts).toHaveLength(0);
    });
  });

  describe("Performance and Edge Cases", () => {
    it("should handle zero thrusters gracefully", () => {
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [];
      
      expect(() => analyzePositioning(current, target, thrusters, {})).not.toThrow();
    });

    it("should handle extreme coordinates", () => {
      const current: Position = { lat: 89.9, lon: 179.9, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 89.9, lon: -179.9, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true }
      ];
      
      const analysis = analyzePositioning(current, target, thrusters, {});
      
      expect(analysis.deviation).toBeGreaterThan(0);
    });

    it("should complete analysis quickly", () => {
      const start = Date.now();
      const current: Position = { lat: 25.5, lon: -88.3, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const target: Position = { lat: 25.5001, lon: -88.3001, heading: 0, timestamp: '2025-01-01T00:00:00Z' };
      const thrusters: ThrusterStatus[] = [
        { id: 't1', name: 'Thruster 1', power: 50, azimuth: 0, operational: true },
        { id: 't2', name: 'Thruster 2', power: 50, azimuth: 90, operational: true },
        { id: 't3', name: 'Thruster 3', power: 50, azimuth: 180, operational: true },
        { id: 't4', name: 'Thruster 4', power: 50, azimuth: 270, operational: true }
      ];
      
      analyzePositioning(current, target, thrusters, {});
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });
  });
});
