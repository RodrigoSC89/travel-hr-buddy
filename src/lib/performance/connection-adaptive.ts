/**
 * Connection Adaptive Service
 * PATCH: Otimizações para conexões 4G instáveis
 * 
 * Detecta qualidade da conexão e ajusta comportamento do app
 */

export type ConnectionQuality = 'fast' | 'moderate' | 'slow' | 'offline';

interface ConnectionInfo {
  quality: ConnectionQuality;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/** Navigator Network Information API (experimental) */
interface NetworkInformation extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

class ConnectionAdaptiveService {
  private listeners: Set<(info: ConnectionInfo) => void> = new Set();
  private currentInfo: ConnectionInfo;
  private initialized = false;

  constructor() {
    this.currentInfo = this.getDefaultInfo();
    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        this.initialize();
      } else {
        window.addEventListener('load', () => this.initialize(), { once: true });
      }
    }
  }

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.currentInfo = this.detectConnection();
    this.setupListeners();
    this.notifyListeners();
  }

  private getDefaultInfo(): ConnectionInfo {
    return {
      quality: 'moderate',
      effectiveType: '4g',
      downlink: 5,
      rtt: 100,
      saveData: false,
    };
  }

  private getConnection(): NetworkInformation | undefined {
    const nav = navigator as NavigatorWithConnection;
    return nav.connection || nav.mozConnection || nav.webkitConnection;
  }

  private detectConnection(): ConnectionInfo {
    const connection = this.getConnection();

    if (!connection) {
      return this.getDefaultInfo();
    }

    const effectiveType = connection.effectiveType || '4g';
    const downlink = connection.downlink || 5;
    const rtt = connection.rtt || 100;
    const saveData = connection.saveData || false;

    let quality: ConnectionQuality = 'fast';
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
      quality = 'slow';
    } else if (effectiveType === '3g' || downlink < 2 || rtt > 300) {
      quality = 'moderate';
    }

    return { quality, effectiveType, downlink, rtt, saveData };
  }

  private setupListeners() {
    const connection = this.getConnection();

    if (connection) {
      connection.addEventListener('change', () => {
        this.currentInfo = this.detectConnection();
        this.notifyListeners();
      });
    }
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentInfo));
  }

  getInfo(): ConnectionInfo {
    return this.currentInfo;
  }

  getQuality(): ConnectionQuality {
    return this.currentInfo.quality;
  }

  onChange(callback: (info: ConnectionInfo) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getRecommendations() {
    const { quality, saveData } = this.currentInfo;
    const isSlow = quality === 'slow' || saveData;

    return {
      imageQuality: isSlow ? 40 : quality === 'moderate' ? 60 : 90,
      maxImageWidth: isSlow ? 480 : quality === 'moderate' ? 800 : 1920,
      enableAnimations: quality === 'fast',
      enablePrefetch: quality === 'fast' && !saveData,
      lazyLoadThreshold: isSlow ? '400px' : quality === 'moderate' ? '200px' : '50px',
      debounceMs: isSlow ? 800 : quality === 'moderate' ? 400 : 150,
      cacheTTL: isSlow ? 120 : quality === 'moderate' ? 60 : 15, // minutes
      /** Max concurrent Supabase requests */
      maxConcurrentRequests: isSlow ? 2 : quality === 'moderate' ? 4 : 10,
      /** Suggested page size for paginated queries */
      pageSize: isSlow ? 10 : quality === 'moderate' ? 25 : 50,
      /** Whether to load 3D, maps, heavy charts */
      loadHeavyModules: quality === 'fast' && !saveData,
      /** Suggested refetch interval (ms) - longer on slow */
      refetchInterval: isSlow ? 300000 : quality === 'moderate' ? 120000 : 60000, // 5m/2m/1m
    };
  }

  shouldLoadHeavyResources(): boolean {
    const { quality, saveData } = this.currentInfo;
    return quality !== 'slow' && quality !== 'offline' && !saveData;
  }
}

export const connectionAdaptive = new ConnectionAdaptiveService();

export function useConnectionQuality() {
  return connectionAdaptive.getInfo();
}
