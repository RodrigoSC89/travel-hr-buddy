/**
 * Feature Flags System - NAUTI ONE
 * Controle centralizado de funcionalidades por módulo
 * 
 * REGRA: Features sem backend real completo devem usar flags.
 * Em produção (STRICT_PROD=true), mocks e simulações são proibidos.
 */

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

// ============================================
// PRODUCTION SAFETY FLAGS
// ============================================

/** Helper to safely read Vite env vars */
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

/** Global strict mode - blocks mocks and fake data in production */
export const STRICT_PROD = env?.VITE_STRICT_PROD !== 'false';

/** BridgeLink WebSocket live stream (real WS not yet implemented, polling as fallback) */
export const FF_BRIDGELINK_LIVE_WS = env?.VITE_FF_BRIDGELINK_LIVE_WS === 'true';

/** StarFix real API integration (requires STARFIX_API_KEY secret) */
export const FF_STARFIX_REAL_API = env?.VITE_FF_STARFIX_REAL_API === 'true';

/** Terrastar real API integration (requires TERRASTAR_API_KEY secret) */
export const FF_TERRASTAR_REAL_API = env?.VITE_FF_TERRASTAR_REAL_API === 'true';

/** NautilusBrain AI semantic analysis in BridgeLink */
export const FF_NAUTILUS_BRAIN_AI = env?.VITE_FF_NAUTILUS_BRAIN_AI === 'true';

/** FMEA System full integration in BridgeLink */
export const FF_FMEA_SYSTEM = env?.VITE_FF_FMEA_SYSTEM === 'true';

/** IoT Sensor Analytics - time-series charts */
export const FF_IOT_ANALYTICS = env?.VITE_FF_IOT_ANALYTICS === 'true';

/** STCW AI Training recommendations engine */
export const FF_STCW_AI_TRAINING = env?.VITE_FF_STCW_AI_TRAINING === 'true';

/** Audit calendar visualization */
export const FF_AUDIT_CALENDAR = env?.VITE_FF_AUDIT_CALENDAR === 'true';

/** Advanced dashboard analytics */
export const FF_DASHBOARD_ANALYTICS = env?.VITE_FF_DASHBOARD_ANALYTICS === 'true';

/** AI Checklist generation (requires AI Edge Function) */
export const FF_AI_CHECKLIST_GEN = env?.VITE_FF_AI_CHECKLIST_GEN === 'true';

/**
 * Check if mock data should be blocked (production mode)
 */
export function shouldBlockMocks(): boolean {
  return STRICT_PROD;
}

// ============================================
// MODULE FEATURE FLAGS (existing)
// ============================================

export interface FeatureFlags {
  UNDERWATER_ENABLED: boolean;
  VRAR_ENABLED: boolean;
  AI_AUTONOMY_ENABLED: boolean;
  BETA_MODULES_ENABLED: boolean;
  BLOCKCHAIN_AUDIT_ENABLED: boolean;
  OCR_MULTIENGINE_ENABLED: boolean;
  DIGITAL_TWIN_3D_ENABLED: boolean;
  PREDICTIVE_TELEMETRY_ENABLED: boolean;
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  UNDERWATER_ENABLED: false,
  VRAR_ENABLED: true,
  AI_AUTONOMY_ENABLED: true,
  BETA_MODULES_ENABLED: true,
  BLOCKCHAIN_AUDIT_ENABLED: true,
  OCR_MULTIENGINE_ENABLED: true,
  DIGITAL_TWIN_3D_ENABLED: true,
  PREDICTIVE_TELEMETRY_ENABLED: true,
};

export function getFeatureFlags(): FeatureFlags {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('nauti_feature_flags');
      if (stored) {
        return { ...DEFAULT_FEATURE_FLAGS, ...JSON.parse(stored) };
      }
    } catch {
      logger.warn('Failed to parse feature flags from localStorage');
    }
  }
  return DEFAULT_FEATURE_FLAGS;
}

export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[flag] ?? false;
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  
  useEffect(() => {
    setFlags(getFeatureFlags());
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

export function setFeatureFlag(flag: keyof FeatureFlags, value: boolean): void {
  if (typeof window !== 'undefined') {
    const current = getFeatureFlags();
    const updated = { ...current, [flag]: value };
    localStorage.setItem('nauti_feature_flags', JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'nauti_feature_flags',
      newValue: JSON.stringify(updated),
    }));
  }
}

export function getDisabledRoutes(): string[] {
  const flags = getFeatureFlags();
  const disabled: string[] = [];
  if (!flags.UNDERWATER_ENABLED) {
    disabled.push('/ocean-sonar', '/underwater-drone', '/auto-sub', '/sonar-ai', '/deep-risk-ai', '/subsea-operations');
  }
  if (!flags.VRAR_ENABLED) {
    disabled.push('/advanced/vr-training');
  }
  return disabled;
}

export function isRouteDisabled(path: string): boolean {
  const disabledRoutes = getDisabledRoutes();
  return disabledRoutes.some(route => path.startsWith(route));
}
