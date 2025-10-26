/**
 * Adaptive UI Engine - PATCH 222
 * 
 * Motor de reconfiguração automática da UI baseada em:
 * - Tipo de dispositivo (mobile, tablet, desktop)
 * - Qualidade de rede (latência, largura de banda)
 * - Contexto da missão/operação
 * 
 * @module core/adaptiveUI
 */

import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'console';
export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
export type UIMode = 'full' | 'optimized' | 'minimal' | 'emergency';
export type ComponentWeight = 'light' | 'medium' | 'heavy';

export interface NetworkMetrics {
  latency: number; // ms
  bandwidth: number; // Mbps
  quality: NetworkQuality;
  online: boolean;
}

export interface DeviceCapabilities {
  type: DeviceType;
  screenWidth: number;
  screenHeight: number;
  touchEnabled: boolean;
  memory?: number; // GB
  cores?: number;
}

export interface MissionContext {
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'training' | 'operational' | 'emergency' | 'maintenance';
  timeConstraint?: 'relaxed' | 'normal' | 'urgent';
}

export interface AdaptiveUIConfig {
  mode: UIMode;
  device: DeviceCapabilities;
  network: NetworkMetrics;
  mission?: MissionContext;
  features: {
    enableAnimations: boolean;
    enableAutoRefresh: boolean;
    enableRealtime: boolean;
    enableRichContent: boolean;
    enableOfflineMode: boolean;
  };
  components: {
    preferredWeight: ComponentWeight;
    lazyLoadThreshold: number;
    maxConcurrentRequests: number;
  };
}

class AdaptiveUIEngine {
  private config: AdaptiveUIConfig;
  private listeners: Set<(config: AdaptiveUIConfig) => void> = new Set();
  private networkCheckInterval?: NodeJS.Timeout;
  private resizeObserver?: ResizeObserver;

  constructor() {
    this.config = this.detectInitialConfig();
    this.startMonitoring();
  }

  /**
   * Detecta a configuração inicial do sistema
   */
  private detectInitialConfig(): AdaptiveUIConfig {
    const device = this.detectDevice();
    const network = this.detectNetwork();
    const mode = this.determineUIMode(device, network);

    return {
      mode,
      device,
      network,
      features: this.determineFeatures(mode, network),
      components: this.determineComponentConfig(mode, device, network)
    };
  }

  /**
   * Detecta o tipo e capacidades do dispositivo
   */
  private detectDevice(): DeviceCapabilities {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const touchEnabled = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    let type: DeviceType = 'desktop';
    if (width < 768) {
      type = 'mobile';
    } else if (width < 1024) {
      type = 'tablet';
    }

    // Tentar detectar memória (navegadores modernos)
    const memory = (navigator as any).deviceMemory;
    const cores = navigator.hardwareConcurrency;

    return {
      type,
      screenWidth: width,
      screenHeight: height,
      touchEnabled,
      memory,
      cores
    };
  }

  /**
   * Detecta a qualidade da rede
   */
  private detectNetwork(): NetworkMetrics {
    const online = navigator.onLine;
    
    // Usar Network Information API se disponível
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    let bandwidth = 10; // Default estimate
    let latency = 100; // Default estimate

    if (connection) {
      // downlink em Mbps
      bandwidth = connection.downlink || bandwidth;
      // rtt (round-trip time) em ms
      latency = connection.rtt || latency;
    }

    const quality = this.calculateNetworkQuality(latency, bandwidth, online);

    return {
      latency,
      bandwidth,
      quality,
      online
    };
  }

  /**
   * Calcula a qualidade da rede baseado em métricas
   */
  private calculateNetworkQuality(
    latency: number,
    bandwidth: number,
    online: boolean
  ): NetworkQuality {
    if (!online) return 'offline';
    
    if (latency < 50 && bandwidth > 10) return 'excellent';
    if (latency < 100 && bandwidth > 5) return 'good';
    if (latency < 200 && bandwidth > 2) return 'fair';
    return 'poor';
  }

  /**
   * Determina o modo de UI apropriado
   */
  private determineUIMode(
    device: DeviceCapabilities,
    network: NetworkMetrics,
    mission?: MissionContext
  ): UIMode {
    // Emergency mode para missões críticas
    if (mission?.priority === 'critical' || mission?.type === 'emergency') {
      return 'emergency';
    }

    // Minimal mode para rede ruim ou mobile
    if (network.quality === 'poor' || network.quality === 'offline') {
      return 'minimal';
    }

    // Optimized mode para tablet ou rede fair
    if (device.type === 'tablet' || network.quality === 'fair') {
      return 'optimized';
    }

    // Full mode para desktop com boa rede
    if (device.type === 'desktop' && network.quality === 'excellent') {
      return 'full';
    }

    return 'optimized'; // Default
  }

  /**
   * Determina features habilitadas baseado no modo
   */
  private determineFeatures(
    mode: UIMode,
    network: NetworkMetrics
  ): AdaptiveUIConfig['features'] {
    const baseFeatures = {
      enableAnimations: false,
      enableAutoRefresh: false,
      enableRealtime: false,
      enableRichContent: false,
      enableOfflineMode: false
    };

    switch (mode) {
      case 'full':
        return {
          enableAnimations: true,
          enableAutoRefresh: true,
          enableRealtime: network.quality === 'excellent',
          enableRichContent: true,
          enableOfflineMode: false
        };
      
      case 'optimized':
        return {
          enableAnimations: false,
          enableAutoRefresh: true,
          enableRealtime: false,
          enableRichContent: false,
          enableOfflineMode: false
        };
      
      case 'minimal':
        return {
          enableAnimations: false,
          enableAutoRefresh: false,
          enableRealtime: false,
          enableRichContent: false,
          enableOfflineMode: true
        };
      
      case 'emergency':
        return {
          enableAnimations: false,
          enableAutoRefresh: false,
          enableRealtime: false,
          enableRichContent: false,
          enableOfflineMode: true
        };
      
      default:
        return baseFeatures;
    }
  }

  /**
   * Determina configuração de componentes
   */
  private determineComponentConfig(
    mode: UIMode,
    device: DeviceCapabilities,
    network: NetworkMetrics
  ): AdaptiveUIConfig['components'] {
    const configs: Record<UIMode, AdaptiveUIConfig['components']> = {
      full: {
        preferredWeight: 'heavy',
        lazyLoadThreshold: 0.5,
        maxConcurrentRequests: 10
      },
      optimized: {
        preferredWeight: 'medium',
        lazyLoadThreshold: 0.7,
        maxConcurrentRequests: 5
      },
      minimal: {
        preferredWeight: 'light',
        lazyLoadThreshold: 0.9,
        maxConcurrentRequests: 2
      },
      emergency: {
        preferredWeight: 'light',
        lazyLoadThreshold: 1.0,
        maxConcurrentRequests: 1
      }
    };

    return configs[mode];
  }

  /**
   * Inicia monitoramento automático
   */
  private startMonitoring(): void {
    // Monitorar mudanças de rede
    window.addEventListener('online', () => this.updateConfiguration());
    window.addEventListener('offline', () => this.updateConfiguration());

    // Monitorar mudanças de tamanho de tela
    window.addEventListener('resize', () => this.updateConfiguration());

    // Network Information API listeners
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', () => this.updateConfiguration());
    }

    // Poll periódico para network metrics
    this.networkCheckInterval = setInterval(() => {
      this.updateNetworkMetrics();
    }, 30000); // 30 segundos
  }

  /**
   * Atualiza métricas de rede periodicamente
   */
  private updateNetworkMetrics(): void {
    const newNetwork = this.detectNetwork();
    const oldQuality = this.config.network.quality;
    
    if (newNetwork.quality !== oldQuality) {
      console.log(`[AdaptiveUI] Network quality changed: ${oldQuality} → ${newNetwork.quality}`);
      this.updateConfiguration();
    }
  }

  /**
   * Atualiza configuração completa
   */
  private updateConfiguration(): void {
    const device = this.detectDevice();
    const network = this.detectNetwork();
    const mode = this.determineUIMode(device, network, this.config.mission);

    this.config = {
      mode,
      device,
      network,
      mission: this.config.mission,
      features: this.determineFeatures(mode, network),
      components: this.determineComponentConfig(mode, device, network)
    };

    console.log('[AdaptiveUI] Configuration updated:', this.config.mode);
    this.notifyListeners();
  }

  /**
   * Define o contexto da missão
   */
  public setMissionContext(mission: MissionContext): void {
    this.config.mission = mission;
    this.updateConfiguration();
  }

  /**
   * Obtém a configuração atual
   */
  public getConfig(): AdaptiveUIConfig {
    return { ...this.config };
  }

  /**
   * Força um modo específico de UI
   */
  public forceMode(mode: UIMode): void {
    this.config.mode = mode;
    this.config.features = this.determineFeatures(mode, this.config.network);
    this.config.components = this.determineComponentConfig(
      mode,
      this.config.device,
      this.config.network
    );
    this.notifyListeners();
  }

  /**
   * Registra um listener para mudanças de configuração
   */
  public subscribe(callback: (config: AdaptiveUIConfig) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.config);
      } catch (error) {
        console.error('[AdaptiveUI] Listener error:', error);
      }
    });
  }

  /**
   * Para o monitoramento
   */
  public destroy(): void {
    if (this.networkCheckInterval) {
      clearInterval(this.networkCheckInterval);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.listeners.clear();
  }
}

// Singleton instance
export const adaptiveUIEngine = new AdaptiveUIEngine();

/**
 * React Hook para usar a Adaptive UI
 */
export function useAdaptiveUI(): AdaptiveUIConfig {
  const [config, setConfig] = useState<AdaptiveUIConfig>(
    adaptiveUIEngine.getConfig()
  );

  useEffect(() => {
    const unsubscribe = adaptiveUIEngine.subscribe(setConfig);
    return unsubscribe;
  }, []);

  return config;
}
