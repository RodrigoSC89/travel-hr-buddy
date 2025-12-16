/**
 * Performance Provider
 * PATCH 624 - Context provider para funcionalidades de performance
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useConnectionAdaptive } from '@/hooks/useConnectionAdaptive';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { PERFORMANCE_CONFIG } from '@/lib/performance';

interface PerformanceContextValue {
  // Conexão
  connectionQuality: 'fast' | 'moderate' | 'slow' | 'offline';
  isOnline: boolean;
  saveData: boolean;
  
  // Modo leve
  lightMode: boolean;
  setLightMode: (value: boolean) => void;
  
  // Cache
  hasPendingSync: boolean;
  clearCache: () => void;
  
  // Configurações
  config: typeof PERFORMANCE_CONFIG;
  
  // Recomendações
  shouldLoadImages: boolean;
  shouldAnimate: boolean;
  debounceMs: number;
}

const PerformanceContext = createContext<PerformanceContextValue | null>(null);

export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  const connection = useConnectionAdaptive();
  const offline = useOfflineMode();
  const [lightMode, setLightModeState] = useState(false);
  
  // Carregar preferência de lightMode
  useEffect(() => {
    const saved = localStorage.getItem('lightMode');
    if (saved !== null) {
      setLightModeState(saved === 'true');
    }
  }, []);
  
  // Salvar preferência de lightMode
  const setLightMode = (value: boolean) => {
    setLightModeState(value);
    localStorage.setItem('lightMode', String(value));
  };
  
  // Determinar se deve carregar imagens
  const shouldLoadImages = !lightMode && connection.quality !== 'slow' && connection.quality !== 'offline';
  
  // Determinar se deve animar
  const shouldAnimate = !lightMode && connection.recommendations.enableAnimations;
  
  // Debounce baseado em conexão
  const debounceMs = lightMode 
    ? PERFORMANCE_CONFIG.DEBOUNCE_SLOW 
    : connection.recommendations.debounceMs;
  
  const value: PerformanceContextValue = {
    connectionQuality: connection.quality,
    isOnline: connection.isOnline,
    saveData: connection.saveData,
    lightMode,
    setLightMode,
    hasPendingSync: offline.hasPendingSync,
    clearCache: offline.clearExpiredCache,
    config: PERFORMANCE_CONFIG,
    shouldLoadImages,
    shouldAnimate,
    debounceMs,
  };
  
  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

/**
 * Hook simplificado para verificar se deve usar modo leve
 */
export function useShouldOptimize(): boolean {
  const { lightMode, connectionQuality, saveData } = usePerformance();
  return lightMode || connectionQuality === 'slow' || connectionQuality === 'offline' || saveData;
}
