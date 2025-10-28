/**
 * PATCH 182.0 - Sonar Data Analyzer
 * Real-time analysis of sonar return data
 * 
 * Features:
 * - Signal processing
 * - Echo pattern recognition
 * - Distance/depth calculation
 * - Material classification
 */

export interface SonarPing {
  id: string;
  timestamp: string;
  angle: number; // degrees (0-360)
  distance: number; // meters
  intensity: number; // 0-100 (signal strength)
  echoDelay: number; // milliseconds
}

export interface SonarReturn {
  ping: SonarPing;
  depth: number; // calculated depth in meters
  material: "rock" | "sand" | "mud" | "metal" | "biological" | "unknown";
  confidence: number; // 0-100
  noise: number; // background noise level
}

export interface SonarPattern {
  type: "anomaly" | "structure" | "terrain" | "object";
  location: { angle: number; distance: number; depth: number };
  size: number; // estimated size in meters
  description: string;
  confidence: number;
}

export interface SonarAnalysis {
  timestamp: string;
  returns: SonarReturn[];
  patterns: SonarPattern[];
  coverage: number; // percentage of area scanned
  resolution: number; // meters per ping
  qualityScore: number; // 0-100
}

class DataAnalyzer {
  private readonly SPEED_OF_SOUND_WATER = 1500; // m/s
  private readonly MIN_RETURN_INTENSITY = 15;
  private readonly NOISE_THRESHOLD = 10;

  /**
   * Analyze sonar ping returns
   */
  analyzePings(pings: SonarPing[]): SonarAnalysis {
    const returns: SonarReturn[] = pings
      .filter(ping => ping.intensity > this.MIN_RETURN_INTENSITY)
      .map(ping => this.processPing(ping));

    const patterns = this.detectPatterns(returns);
    const coverage = this.calculateCoverage(pings);
    const resolution = this.calculateResolution(pings);
    const qualityScore = this.calculateQualityScore(returns);

    return {
      timestamp: new Date().toISOString(),
      returns,
      patterns,
      coverage,
      resolution,
      qualityScore,
    };
  }

  /**
   * Process individual sonar ping
   */
  private processPing(ping: SonarPing): SonarReturn {
    // Calculate actual depth from echo delay
    const depth = (ping.echoDelay / 1000) * this.SPEED_OF_SOUND_WATER / 2;

    // Classify material based on return characteristics
    const material = this.classifyMaterial(ping.intensity, ping.echoDelay);

    // Calculate confidence based on signal strength
    const confidence = Math.min(100, (ping.intensity / 100) * 100);

    // Estimate background noise
    const noise = Math.max(0, this.NOISE_THRESHOLD - (ping.intensity - 50));

    return {
      ping,
      depth,
      material,
      confidence,
      noise,
    };
  }

  /**
   * Classify material based on sonar characteristics
   */
  private classifyMaterial(
    intensity: number,
    echoDelay: number
  ): SonarReturn["material"] {
    // High intensity, short delay = hard surface (rock, metal)
    if (intensity > 80 && echoDelay < 50) {
      return "rock";
    }

    // Very high intensity = metal
    if (intensity > 90) {
      return "metal";
    }

    // Medium intensity = sand
    if (intensity > 50 && intensity < 80) {
      return "sand";
    }

    // Low intensity = soft surface (mud, biological)
    if (intensity < 50) {
      // Biological matter often has irregular patterns
      if (Math.random() > 0.7) {
        return "biological";
      }
      return "mud";
    }

    return "unknown";
  }

  /**
   * Detect patterns in sonar returns
   */
  private detectPatterns(returns: SonarReturn[]): SonarPattern[] {
    const patterns: SonarPattern[] = [];

    // Group returns by proximity
    const clusters = this.clusterReturns(returns);

    for (const cluster of clusters) {
      if (cluster.length < 3) continue; // Skip small clusters

      // Analyze cluster characteristics
      const avgIntensity = cluster.reduce((sum, r) => sum + r.ping.intensity, 0) / cluster.length;
      const materials = cluster.map(r => r.material);
      const uniqueMaterials = new Set(materials).size;

      // Detect anomalies (unusual patterns)
      if (uniqueMaterials === 1 && materials[0] === "metal") {
        patterns.push({
          type: "object",
          location: {
            angle: cluster[0].ping.angle,
            distance: cluster[0].ping.distance,
            depth: cluster[0].depth,
          },
          size: this.estimateClusterSize(cluster),
          description: "Metallic object detected",
          confidence: avgIntensity,
        });
      }

      // Detect structures (consistent hard surfaces)
      if (avgIntensity > 70 && cluster.length > 5) {
        patterns.push({
          type: "structure",
          location: {
            angle: cluster[0].ping.angle,
            distance: cluster[0].ping.distance,
            depth: cluster[0].depth,
          },
          size: this.estimateClusterSize(cluster),
          description: "Underwater structure or formation",
          confidence: Math.min(95, avgIntensity),
        });
      }

      // Detect terrain features
      if (this.isTerrainFeature(cluster)) {
        patterns.push({
          type: "terrain",
          location: {
            angle: cluster[0].ping.angle,
            distance: cluster[0].ping.distance,
            depth: cluster[0].depth,
          },
          size: this.estimateClusterSize(cluster),
          description: "Significant terrain feature",
          confidence: 80,
        });
      }
    }

    return patterns;
  }

  /**
   * Cluster nearby returns
   */
  private clusterReturns(returns: SonarReturn[]): SonarReturn[][] {
    const clusters: SonarReturn[][] = [];
    const processed = new Set<number>();
    const CLUSTER_THRESHOLD = 5; // meters

    for (let i = 0; i < returns.length; i++) {
      if (processed.has(i)) continue;

      const cluster: SonarReturn[] = [returns[i]];
      processed.add(i);

      for (let j = i + 1; j < returns.length; j++) {
        if (processed.has(j)) continue;

        const distance = this.calculateDistance(
          returns[i].ping.angle,
          returns[i].ping.distance,
          returns[j].ping.angle,
          returns[j].ping.distance
        );

        if (distance < CLUSTER_THRESHOLD) {
          cluster.push(returns[j]);
          processed.add(j);
        }
      }

      if (cluster.length > 0) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Calculate distance between two polar coordinates
   */
  private calculateDistance(
    angle1: number,
    dist1: number,
    angle2: number,
    dist2: number
  ): number {
    const rad1 = (angle1 * Math.PI) / 180;
    const rad2 = (angle2 * Math.PI) / 180;

    const x1 = dist1 * Math.cos(rad1);
    const y1 = dist1 * Math.sin(rad1);
    const x2 = dist2 * Math.cos(rad2);
    const y2 = dist2 * Math.sin(rad2);

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Estimate size of cluster
   */
  private estimateClusterSize(cluster: SonarReturn[]): number {
    if (cluster.length < 2) return 1;

    let maxDist = 0;
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const dist = this.calculateDistance(
          cluster[i].ping.angle,
          cluster[i].ping.distance,
          cluster[j].ping.angle,
          cluster[j].ping.distance
        );
        maxDist = Math.max(maxDist, dist);
      }
    }

    return maxDist;
  }

  /**
   * Check if cluster represents a terrain feature
   */
  private isTerrainFeature(cluster: SonarReturn[]): boolean {
    if (cluster.length < 5) return false;

    // Check for depth variation (indicates cliff, ridge, etc.)
    const depths = cluster.map(r => r.depth);
    const minDepth = Math.min(...depths);
    const maxDepth = Math.max(...depths);
    const depthVariation = maxDepth - minDepth;

    return depthVariation > 10; // More than 10m variation
  }

  /**
   * Calculate scan coverage percentage
   */
  private calculateCoverage(pings: SonarPing[]): number {
    const angles = new Set(pings.map(p => Math.floor(p.angle)));
    return (angles.size / 360) * 100;
  }

  /**
   * Calculate scan resolution
   */
  private calculateResolution(pings: SonarPing[]): number {
    if (pings.length < 2) return 0;

    const avgDistance = pings.reduce((sum, p) => sum + p.distance, 0) / pings.length;
    const angularResolution = 360 / pings.length; // degrees per ping
    
    // Convert to linear resolution at average distance
    return (avgDistance * Math.PI * angularResolution) / 180;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(returns: SonarReturn[]): number {
    if (returns.length === 0) return 0;

    const avgConfidence = returns.reduce((sum, r) => sum + r.confidence, 0) / returns.length;
    const avgNoise = returns.reduce((sum, r) => sum + r.noise, 0) / returns.length;
    
    // Quality is high confidence with low noise
    return Math.max(0, Math.min(100, avgConfidence - avgNoise));
  }

  /**
   * Generate real-time sonar pings (simulation)
   */
  generateSimulatedPings(
    numPings: number,
    centerDepth: number,
    radius: number
  ): SonarPing[] {
    const pings: SonarPing[] = [];

    for (let i = 0; i < numPings; i++) {
      const angle = (360 / numPings) * i;
      const distance = radius * (0.5 + Math.random() * 0.5);
      const depth = centerDepth + (Math.random() - 0.5) * 20;
      const echoDelay = (depth * 2 * 1000) / this.SPEED_OF_SOUND_WATER;
      
      // Simulate varying intensity based on depth and material
      let intensity = 100 - (depth / centerDepth) * 30 + Math.random() * 20;
      
      // Add some anomalies
      if (Math.random() > 0.95) {
        intensity = Math.random() * 100; // Random anomaly
      }

      pings.push({
        id: `ping-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        angle,
        distance,
        intensity: Math.max(0, Math.min(100, intensity)),
        echoDelay,
      });
    }

    return pings;
  }
}

export default DataAnalyzer;
