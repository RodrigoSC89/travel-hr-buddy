/**
 * PATCH 180.0 - Sonar AI Engine
 * Simulated bathymetric scanning and depth analysis
 */

export interface SonarReading {
  id: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  depth: number; // meters
  terrain: 'shallow' | 'moderate' | 'deep' | 'trench';
  riskLevel: 'safe' | 'caution' | 'danger';
  obstacles: string[];
}

export interface BathymetricData {
  minDepth: number;
  maxDepth: number;
  avgDepth: number;
  readings: SonarReading[];
}

export class SonarEngine {
  private static instance: SonarEngine;

  private constructor() {}

  static getInstance(): SonarEngine {
    if (!SonarEngine.instance) {
      SonarEngine.instance = new SonarEngine();
    }
    return SonarEngine.instance;
  }

  /**
   * Generate simulated bathymetric data for a region
   */
  generateBathymetricData(
    centerLat: number,
    centerLon: number,
    radiusKm: number = 50
  ): BathymetricData {
    const readings: SonarReading[] = [];
    const gridSize = 20; // 20x20 grid of readings

    let minDepth = Infinity;
    let maxDepth = -Infinity;
    let totalDepth = 0;

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        // Calculate position in grid
        const latOffset = ((i - gridSize / 2) / gridSize) * radiusKm * 0.009; // ~0.009 deg per km
        const lonOffset = ((j - gridSize / 2) / gridSize) * radiusKm * 0.009;

        const lat = centerLat + latOffset;
        const lon = centerLon + lonOffset;

        // Generate depth with some variation (deeper in center)
        const distanceFromCenter = Math.sqrt(
          Math.pow(i - gridSize / 2, 2) + Math.pow(j - gridSize / 2, 2)
        );
        const baseDepth = 50 + distanceFromCenter * 15;
        const randomVariation = (Math.random() - 0.5) * 40;
        const depth = Math.max(10, baseDepth + randomVariation);

        const terrain = this.classifyTerrain(depth);
        const riskLevel = this.assessRisk(depth, terrain);
        const obstacles = this.detectObstacles(depth, terrain);

        readings.push({
          id: `sonar-${i}-${j}`,
          timestamp: new Date(),
          latitude: lat,
          longitude: lon,
          depth,
          terrain,
          riskLevel,
          obstacles
        });

        minDepth = Math.min(minDepth, depth);
        maxDepth = Math.max(maxDepth, depth);
        totalDepth += depth;
      }
    }

    return {
      minDepth,
      maxDepth,
      avgDepth: totalDepth / readings.length,
      readings
    };
  }

  /**
   * Classify terrain based on depth
   */
  private classifyTerrain(depth: number): SonarReading['terrain'] {
    if (depth < 50) return 'shallow';
    if (depth < 200) return 'moderate';
    if (depth < 1000) return 'deep';
    return 'trench';
  }

  /**
   * Assess navigation risk based on depth and terrain
   */
  private assessRisk(depth: number, terrain: SonarReading['terrain']): SonarReading['riskLevel'] {
    if (depth < 30) return 'danger'; // Too shallow
    if (depth < 50) return 'caution'; // Shallow
    if (terrain === 'trench') return 'caution'; // Very deep
    return 'safe';
  }

  /**
   * Detect potential obstacles
   */
  private detectObstacles(depth: number, terrain: SonarReading['terrain']): string[] {
    const obstacles: string[] = [];

    if (depth < 30) {
      obstacles.push('Shallow water - risk of grounding');
    }

    if (terrain === 'shallow' && Math.random() > 0.7) {
      obstacles.push('Possible reef structure detected');
    }

    if (terrain === 'moderate' && Math.random() > 0.85) {
      obstacles.push('Underwater formation detected');
    }

    if (depth < 50 && Math.random() > 0.9) {
      obstacles.push('Possible wreckage signature');
    }

    return obstacles;
  }

  /**
   * Generate AI-based route suggestions
   */
  analyzeSafeRoute(data: BathymetricData, targetLat: number, targetLon: number): {
    recommendation: string;
    safePath: { lat: number; lon: number }[];
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Check for danger zones
    const dangerZones = data.readings.filter(r => r.riskLevel === 'danger');
    const cautionZones = data.readings.filter(r => r.riskLevel === 'caution');

    if (dangerZones.length > 0) {
      warnings.push(`⚠️ ${dangerZones.length} danger zones detected - avoid shallow areas`);
    }

    if (cautionZones.length > 0) {
      warnings.push(`⚠️ ${cautionZones.length} caution zones detected - reduce speed`);
    }

    // Generate safe path (simplified - just avoid danger zones)
    const safeReadings = data.readings.filter(r => r.riskLevel === 'safe');
    const safePath = safeReadings.slice(0, 10).map(r => ({
      lat: r.latitude,
      lon: r.longitude
    }));

    const recommendation = this.generateRecommendation(data, warnings.length);

    return {
      recommendation,
      safePath,
      warnings
    };
  }

  /**
   * Generate AI recommendation text
   */
  private generateRecommendation(data: BathymetricData, warningCount: number): string {
    if (warningCount === 0) {
      return `✅ Safe passage confirmed. Average depth ${data.avgDepth.toFixed(0)}m. No significant obstacles detected. Proceed at cruising speed.`;
    } else if (warningCount === 1) {
      return `⚠️ Caution advised. Minor hazards detected. Average depth ${data.avgDepth.toFixed(0)}m. Reduce speed and monitor sonar continuously.`;
    } else {
      return `🚨 Route adjustment recommended. Multiple hazards detected. Average depth ${data.avgDepth.toFixed(0)}m. Consider alternative route or reduce speed to 5 knots.`;
    }
  }

  /**
   * Get depth color for visualization
   */
  getDepthColor(depth: number): string {
    if (depth < 30) return '#8B0000'; // Dark red - danger
    if (depth < 50) return '#FF4500'; // Orange red - shallow
    if (depth < 100) return '#FFA500'; // Orange
    if (depth < 200) return '#FFD700'; // Gold
    if (depth < 500) return '#4169E1'; // Royal blue
    if (depth < 1000) return '#000080'; // Navy
    return '#191970'; // Midnight blue - deep
  }

  /**
   * Get color legend for bathymetric map
   */
  getColorLegend(): Array<{ depth: string; color: string; label: string }> {
    return [
      { depth: '< 30m', color: '#8B0000', label: 'Danger - Shallow' },
      { depth: '30-50m', color: '#FF4500', label: 'Caution - Shallow' },
      { depth: '50-100m', color: '#FFA500', label: 'Safe - Moderate' },
      { depth: '100-200m', color: '#FFD700', label: 'Safe - Deep' },
      { depth: '200-500m', color: '#4169E1', label: 'Safe - Very Deep' },
      { depth: '500-1000m', color: '#000080', label: 'Safe - Extreme Depth' },
      { depth: '> 1000m', color: '#191970', label: 'Trench' }
    ];
  }
}

export default SonarEngine;
