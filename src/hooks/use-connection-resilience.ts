/**
 * useConnectionResilience Hook - PATCH 850
 * React hook for connection state and adaptive settings
 */

import { useState, useEffect } from 'react';
import { connectionResilience, type ConnectionState } from '@/lib/offline/connection-resilience';

export function useConnectionResilience() {
  const [state, setState] = useState<ConnectionState>(connectionResilience.getState());

  useEffect(() => {
    return connectionResilience.subscribe(setState);
  }, []);

  return {
    ...state,
    isSlowConnection: connectionResilience.isSlowConnection(),
    adaptiveSettings: connectionResilience.getAdaptiveSettings(),
    fetchWithRetry: connectionResilience.fetchWithRetry.bind(connectionResilience),
  };
}
