/**
 * PATCH 652 - Error Tracker Hook
 * React hook for error tracking
 */

import { useEffect, useState } from 'react';
import { errorTracker, type ErrorLog, type ErrorStats } from '@/lib/error-tracker';

export const useErrorTracker = () => {
  const [stats, setStats] = useState<ErrorStats>(errorTracker.getStats());

  useEffect(() => {
    // Update stats when new errors occur
    const unsubscribe = errorTracker.addListener(() => {
      setStats(errorTracker.getStats());
    });

    return unsubscribe;
  }, []);

  return {
    stats,
    track: errorTracker.track.bind(errorTracker),
    trackNetworkError: errorTracker.trackNetworkError.bind(errorTracker),
    trackValidationError: errorTracker.trackValidationError.bind(errorTracker),
    trackAuthError: errorTracker.trackAuthError.bind(errorTracker),
    trackRuntimeError: errorTracker.trackRuntimeError.bind(errorTracker),
    getErrors: errorTracker.getErrors.bind(errorTracker),
    getErrorsByCategory: errorTracker.getErrorsByCategory.bind(errorTracker),
    getErrorsBySeverity: errorTracker.getErrorsBySeverity.bind(errorTracker),
    clear: errorTracker.clear.bind(errorTracker),
  };
};
