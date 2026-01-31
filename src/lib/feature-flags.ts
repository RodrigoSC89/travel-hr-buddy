/**
 * Feature Flags System - NAUTI ONE
 * Controle centralizado de funcionalidades por módulo
 * 
 * IMPORTANTE: Desabilitar módulos incompletos para produção
 */

export interface FeatureFlags {
  // Operações Submarinas - DESABILITADO por estar incompleto
  UNDERWATER_ENABLED: boolean;
  
  // VR/AR Training
  VRAR_ENABLED: boolean;
  
  // IA Autônoma (decisões automáticas)
  AI_AUTONOMY_ENABLED: boolean;
  
  // Módulos Beta
  BETA_MODULES_ENABLED: boolean;
  
  // Blockchain Audit
  BLOCKCHAIN_AUDIT_ENABLED: boolean;
  
  // OCR Multi-Engine
  OCR_MULTIENGINE_ENABLED: boolean;
  
  // Digital Twin 3D
  DIGITAL_TWIN_3D_ENABLED: boolean;
  
  // Telemetria Preditiva
  PREDICTIVE_TELEMETRY_ENABLED: boolean;
}

/**
 * Configurações padrão de feature flags
 * UNDERWATER_ENABLED = false conforme requisito
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  UNDERWATER_ENABLED: false, // DESABILITADO - módulo incompleto
  VRAR_ENABLED: true,
  AI_AUTONOMY_ENABLED: true,
  BETA_MODULES_ENABLED: true,
  BLOCKCHAIN_AUDIT_ENABLED: true,
  OCR_MULTIENGINE_ENABLED: true,
  DIGITAL_TWIN_3D_ENABLED: true,
  PREDICTIVE_TELEMETRY_ENABLED: true,
};

/**
 * Obter feature flags do ambiente ou usar padrão
 */
export function getFeatureFlags(): FeatureFlags {
  // Tentar carregar do localStorage para permitir override em dev
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nauti_feature_flags');
      if (stored) {
        return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      logger.warn('Failed to parse feature flags from localStorage');
    }
  }
  
  return DEFAULT_FEATURE_FLAGS;
}

/**
 * Verificar se uma feature está habilitada
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag] ?? false;
}

/**
 * Hook para usar feature flags em componentes React
 */
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  
  useEffect(() => {
    setFlags(getFeatureFlags());
    
    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'nauti_feature_flags') {
        setFlags(getFeatureFlags());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return flags;
}

/**
 * Atualizar feature flag (apenas dev)
 */
export function setFeatureFlag(flag: keyof FeatureFlags, value: boolean): void {
  if (typeof window !== 'undefined') {
    const current = getFeatureFlags();
    const updated = { ...current, [flag]: value };
    localStorage.setItem('nauti_feature_flags', JSON.stringify(updated));
    
    // Disparar evento para atualizar componentes
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nauti_feature_flags',
      newValue: JSON.stringify(updated),
    }));
  }
}

/**
 * Rotas desabilitadas por feature flags
 */
export function getDisabledRoutes(): string[] {
  const flags = getFeatureFlags();
  const disabled: string[] = [];
  
  if (!flags.UNDERWATER_ENABLED) {
    disabled.push(
      '/ocean-sonar',
      '/underwater-drone',
      '/auto-sub',
      '/sonar-ai',
      '/deep-risk-ai',
      '/subsea-operations'
    );
  }
  
  if (!flags.VRAR_ENABLED) {
    disabled.push('/advanced/vr-training');
  }
  
  return disabled;
}

/**
 * Verificar se rota está desabilitada
 */
export function isRouteDisabled(path: string): boolean {
  const disabledRoutes = getDisabledRoutes();
  return disabledRoutes.some(route => path.startsWith(route));
}
