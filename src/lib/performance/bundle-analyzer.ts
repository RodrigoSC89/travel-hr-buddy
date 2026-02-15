/**
 * Sprint 5: Runtime Bundle & Network Analyzer
 * Tracks resource loading, bundle sizes, and connection quality
 */

export interface ResourceMetric {
  name: string;
  type: string;
  size: number; // bytes
  duration: number; // ms
  cached: boolean;
}

export interface NetworkProfile {
  effectiveType: string;  // 4g, 3g, 2g, slow-2g
  downlink: number;       // Mbps
  rtt: number;            // ms
  saveData: boolean;
  isOffline: boolean;
}

export interface BundleStats {
  totalResources: number;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  fontSize: number;
  avgLoadTime: number;
  cacheHitRate: number;
}

class BundleAnalyzer {
  getResourceMetrics(): ResourceMetric[] {
    if (typeof window === 'undefined') return [];
    
    return performance.getEntriesByType('resource').map((entry) => {
      const r = entry as PerformanceResourceTiming;
      return {
        name: r.name.split('/').pop() || r.name,
        type: this.getResourceType(r.initiatorType, r.name),
        size: r.transferSize || 0,
        duration: Math.round(r.duration),
        cached: r.transferSize === 0 && r.decodedBodySize > 0,
      };
    });
  }

  getBundleStats(): BundleStats {
    const resources = this.getResourceMetrics();
    const js = resources.filter(r => r.type === 'js');
    const css = resources.filter(r => r.type === 'css');
    const img = resources.filter(r => r.type === 'image');
    const font = resources.filter(r => r.type === 'font');
    const cached = resources.filter(r => r.cached);

    const sum = (arr: ResourceMetric[]) => arr.reduce((s, r) => s + r.size, 0);
    const avgDuration = resources.length > 0
      ? Math.round(resources.reduce((s, r) => s + r.duration, 0) / resources.length)
      : 0;

    return {
      totalResources: resources.length,
      totalSize: sum(resources),
      jsSize: sum(js),
      cssSize: sum(css),
      imageSize: sum(img),
      fontSize: sum(font),
      avgLoadTime: avgDuration,
      cacheHitRate: resources.length > 0 ? Math.round((cached.length / resources.length) * 100) : 0,
    };
  }

  getNetworkProfile(): NetworkProfile {
    const conn = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number; saveData: boolean } }).connection;
    return {
      effectiveType: conn?.effectiveType || '4g',
      downlink: conn?.downlink || 10,
      rtt: conn?.rtt || 50,
      saveData: conn?.saveData || false,
      isOffline: !navigator.onLine,
    };
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  private getResourceType(initiator: string, name: string): string {
    if (/\.js$/i.test(name) || initiator === 'script') return 'js';
    if (/\.css$/i.test(name) || initiator === 'css') return 'css';
    if (/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(name) || initiator === 'img') return 'image';
    if (/\.(woff2?|ttf|otf|eot)$/i.test(name)) return 'font';
    if (initiator === 'fetch' || initiator === 'xmlhttprequest') return 'api';
    return 'other';
  }
}

export const bundleAnalyzer = new BundleAnalyzer();
