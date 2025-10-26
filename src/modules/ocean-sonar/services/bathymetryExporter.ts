/**
 * PATCH 183.0 - Bathymetric Mapper v2
 * Export utilities for bathymetric data
 * 
 * Features:
 * - GeoJSON export
 * - PNG image export
 * - Offline data caching
 */

import { BathymetricData, SonarReading } from './sonarEngine';

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number, number]; // [lon, lat, depth]
  };
  properties: {
    depth: number;
    terrain: string;
    riskLevel: string;
    obstacles: string[];
    timestamp: string;
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  metadata: {
    minDepth: number;
    maxDepth: number;
    avgDepth: number;
    totalReadings: number;
    exportTime: string;
  };
}

class BathymetryExporter {
  /**
   * Export bathymetric data to GeoJSON format
   */
  exportToGeoJSON(data: BathymetricData): GeoJSONCollection {
    const features: GeoJSONFeature[] = data.readings.map(reading => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [reading.longitude, reading.latitude, -reading.depth], // Negative depth for elevation
      },
      properties: {
        depth: reading.depth,
        terrain: reading.terrain,
        riskLevel: reading.riskLevel,
        obstacles: reading.obstacles,
        timestamp: reading.timestamp.toISOString(),
      },
    }));

    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        minDepth: data.minDepth,
        maxDepth: data.maxDepth,
        avgDepth: data.avgDepth,
        totalReadings: data.readings.length,
        exportTime: new Date().toISOString(),
      },
    };
  }

  /**
   * Download GeoJSON file
   */
  downloadGeoJSON(data: BathymetricData, filename: string = 'bathymetry.geojson'): void {
    const geoJSON = this.exportToGeoJSON(data);
    const jsonString = JSON.stringify(geoJSON, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }

  /**
   * Export bathymetric data to PNG image
   */
  async exportToPNG(
    data: BathymetricData,
    width: number = 800,
    height: number = 800,
    includeColorbar: boolean = true
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        const gridSize = Math.sqrt(data.readings.length);
        
        // Set canvas size
        const colorbarWidth = includeColorbar ? 100 : 0;
        canvas.width = width + colorbarWidth;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Fill background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate cell size
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;

        // Draw bathymetric data
        data.readings.forEach((reading, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          
          const x = col * cellWidth;
          const y = row * cellHeight;

          // Get color based on depth
          const color = this.getDepthColor(
            reading.depth,
            data.minDepth,
            data.maxDepth
          );

          ctx.fillStyle = color;
          ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1); // +1 to avoid gaps
        });

        // Draw colorbar
        if (includeColorbar) {
          this.drawColorbar(ctx, width, 0, colorbarWidth, height, data.minDepth, data.maxDepth);
        }

        // Add title and metadata
        this.drawMetadata(ctx, data, width, height);

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Download PNG file
   */
  async downloadPNG(
    data: BathymetricData,
    filename: string = 'bathymetry.png',
    width: number = 800,
    height: number = 800
  ): Promise<void> {
    const blob = await this.exportToPNG(data, width, height, true);
    this.downloadBlob(blob, filename);
  }

  /**
   * Get color for depth value using gradient
   */
  private getDepthColor(depth: number, minDepth: number, maxDepth: number): string {
    const normalized = (depth - minDepth) / (maxDepth - minDepth);
    
    // Color gradient: shallow (cyan) -> medium (blue) -> deep (dark blue)
    const colors = [
      { stop: 0.0, color: { r: 0, g: 255, b: 255 } },     // Shallow - Cyan
      { stop: 0.2, color: { r: 0, g: 200, b: 255 } },     // Light Blue
      { stop: 0.4, color: { r: 0, g: 150, b: 255 } },     // Medium Blue
      { stop: 0.6, color: { r: 0, g: 100, b: 200 } },     // Blue
      { stop: 0.8, color: { r: 0, g: 50, b: 150 } },      // Dark Blue
      { stop: 1.0, color: { r: 0, g: 0, b: 100 } },       // Very Dark Blue
    ];

    // Find the two colors to interpolate between
    let lowerColor = colors[0];
    let upperColor = colors[colors.length - 1];

    for (let i = 0; i < colors.length - 1; i++) {
      if (normalized >= colors[i].stop && normalized <= colors[i + 1].stop) {
        lowerColor = colors[i];
        upperColor = colors[i + 1];
        break;
      }
    }

    // Interpolate
    const range = upperColor.stop - lowerColor.stop;
    const localNormalized = (normalized - lowerColor.stop) / range;

    const r = Math.round(
      lowerColor.color.r + (upperColor.color.r - lowerColor.color.r) * localNormalized
    );
    const g = Math.round(
      lowerColor.color.g + (upperColor.color.g - lowerColor.color.g) * localNormalized
    );
    const b = Math.round(
      lowerColor.color.b + (upperColor.color.b - lowerColor.color.b) * localNormalized
    );

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Draw colorbar legend
   */
  private drawColorbar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  ): void {
    const steps = 100;
    const stepHeight = height / steps;

    // Draw gradient
    for (let i = 0; i < steps; i++) {
      const depth = minDepth + ((maxDepth - minDepth) * i) / steps;
      const color = this.getDepthColor(depth, minDepth, maxDepth);
      
      ctx.fillStyle = color;
      ctx.fillRect(x + 10, y + i * stepHeight, width - 60, stepHeight + 1);
    }

    // Draw labels
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';

    const labels = [
      { text: `${minDepth.toFixed(0)}m`, y: y + height - 5 },
      { text: `${((minDepth + maxDepth) / 2).toFixed(0)}m`, y: y + height / 2 },
      { text: `${maxDepth.toFixed(0)}m`, y: y + 10 },
    ];

    labels.forEach(label => {
      ctx.fillText(label.text, x + width - 45, label.y);
    });

    // Draw title
    ctx.save();
    ctx.translate(x + 5, y + height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Depth', 0, 0);
    ctx.restore();
  }

  /**
   * Draw metadata on image
   */
  private drawMetadata(
    ctx: CanvasRenderingContext2D,
    data: BathymetricData,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, 30);
    ctx.fillRect(0, height - 30, width, 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    
    // Title
    ctx.fillText('Bathymetric Map', 10, 20);
    
    // Bottom metadata
    ctx.font = '11px monospace';
    const avgDepth = `Avg: ${data.avgDepth.toFixed(1)}m`;
    const range = `Range: ${data.minDepth.toFixed(0)}-${data.maxDepth.toFixed(0)}m`;
    const readings = `${data.readings.length} readings`;
    const timestamp = new Date().toLocaleString();
    
    ctx.fillText(`${avgDepth} | ${range} | ${readings}`, 10, height - 10);
    
    ctx.textAlign = 'right';
    ctx.fillText(timestamp, width - 10, height - 10);
  }

  /**
   * Utility to download blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Save bathymetric data to localStorage (offline support)
   */
  saveToCache(data: BathymetricData, key: string = 'bathymetry-cache'): void {
    try {
      const cacheData = {
        data,
        timestamp: new Date().toISOString(),
        version: '183.0',
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save bathymetry data to cache:', error);
    }
  }

  /**
   * Load bathymetric data from localStorage
   */
  loadFromCache(key: string = 'bathymetry-cache'): BathymetricData | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Convert timestamp strings back to Date objects
      cacheData.data.readings = cacheData.data.readings.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp),
      }));

      return cacheData.data;
    } catch (error) {
      console.error('Failed to load bathymetry data from cache:', error);
      return null;
    }
  }

  /**
   * Clear cached data
   */
  clearCache(key: string = 'bathymetry-cache'): void {
    localStorage.removeItem(key);
  }

  /**
   * Check if cache exists
   */
  hasCachedData(key: string = 'bathymetry-cache'): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get cache metadata
   */
  getCacheMetadata(key: string = 'bathymetry-cache'): {
    timestamp: string;
    version: string;
    size: number;
  } | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return {
        timestamp: cacheData.timestamp,
        version: cacheData.version,
        size: new Blob([cached]).size,
      };
    } catch (error) {
      return null;
    }
  }
}

export default BathymetryExporter;
