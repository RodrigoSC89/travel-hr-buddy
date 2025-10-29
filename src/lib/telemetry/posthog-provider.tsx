/**
 * PATCH 499: PostHog Provider Component
 * React provider for PostHog telemetry
 */

import React, { useEffect, createContext, useContext } from 'react';
import { initTelemetry, getTelemetryStatus } from './index';

interface TelemetryContextValue {
  isEnabled: boolean;
  hasConsent: boolean;
  status: ReturnType<typeof getTelemetryStatus>;
}

const TelemetryContext = createContext<TelemetryContextValue>({
  isEnabled: false,
  hasConsent: false,
  status: {
    enabled: false,
    initialized: false,
    hasConsent: false,
    online: true,
    queuedEvents: 0,
  },
});

export function useTelemetry() {
  return useContext(TelemetryContext);
}

interface TelemetryProviderProps {
  children: React.ReactNode;
}

export function TelemetryProvider({ children }: TelemetryProviderProps) {
  useEffect(() => {
    // Initialize telemetry on mount
    initTelemetry();
  }, []);

  const status = getTelemetryStatus();

  const value: TelemetryContextValue = {
    isEnabled: status.enabled,
    hasConsent: status.hasConsent,
    status,
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}
