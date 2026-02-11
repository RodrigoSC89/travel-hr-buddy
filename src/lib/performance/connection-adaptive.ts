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

    return {
      imageQuality: quality === 'slow' || saveData ? 60 : quality === 'moderate' ? 75 : 90,
      maxImageWidth: quality === 'slow' ? 640 : quality === 'moderate' ? 1024 : 1920,
      enableAnimations: quality !== 'slow' && !saveData,
      enablePrefetch: quality === 'fast',
      lazyLoadThreshold: quality === 'slow' ? '200px' : quality === 'moderate' ? '100px' : '50px',
      debounceMs: quality === 'slow' ? 500 : quality === 'moderate' ? 300 : 150,
      cacheTTL: quality === 'slow' ? 60 : quality === 'moderate' ? 30 : 15,
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
