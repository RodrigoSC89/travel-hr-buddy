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

class ConnectionAdaptiveService {
  private listeners: Set<(info: ConnectionInfo) => void> = new Set();
  private currentInfo: ConnectionInfo;
  private initialized = false;

  constructor() {
    // Safe initialization - defer until DOM is ready
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

  private detectConnection(): ConnectionInfo {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) {
      return {
        quality: 'moderate',
        effectiveType: '4g',
        downlink: 5,
        rtt: 100,
        saveData: false,
      };
    }

    const effectiveType = connection.effectiveType || '4g';
    const downlink = connection.downlink || 5;
    const rtt = connection.rtt || 100;
    const saveData = connection.saveData || false;

    let quality: ConnectionQuality = 'fast';
    
    // PATCH v17 iOS PWA: REMOVIDO check navigator.onLine - nunca setar 'offline'
    if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
      quality = 'slow';
    } else if (effectiveType === '3g' || downlink < 2 || rtt > 300) {
      quality = 'moderate';
    }

    return { quality, effectiveType, downlink, rtt, saveData };
  }

  private setupListeners() {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      connection.addEventListener('change', () => {
        this.currentInfo = this.detectConnection();
        this.notifyListeners();
      });
    }

    // PATCH v17 iOS PWA: REMOVIDO listeners online/offline - causam falsos positivos
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

  // Recomendações baseadas na conexão
  getRecommendations() {
    const { quality, saveData } = this.currentInfo;

    return {
      // Qualidade de imagem (0-100)
      imageQuality: quality === 'slow' || saveData ? 60 : quality === 'moderate' ? 75 : 90,
      
      // Tamanho máximo de imagem em pixels
      maxImageWidth: quality === 'slow' ? 640 : quality === 'moderate' ? 1024 : 1920,
      
      // Habilitar animações
      enableAnimations: quality !== 'slow' && !saveData,
      
      // Prefetch de recursos
      enablePrefetch: quality === 'fast',
      
      // Lazy loading agressivo
      lazyLoadThreshold: quality === 'slow' ? '200px' : quality === 'moderate' ? '100px' : '50px',
      
      // Debounce para requisições
      debounceMs: quality === 'slow' ? 500 : quality === 'moderate' ? 300 : 150,
      
      // Cache TTL em minutos
      cacheTTL: quality === 'slow' ? 60 : quality === 'moderate' ? 30 : 15,
    };
  }

  // Verificar se deve usar recursos pesados
  shouldLoadHeavyResources(): boolean {
    const { quality, saveData } = this.currentInfo;
    return quality !== 'slow' && quality !== 'offline' && !saveData;
  }
}

export const connectionAdaptive = new ConnectionAdaptiveService();

// Hook para React
export function useConnectionQuality() {
  return connectionAdaptive.getInfo();
}
