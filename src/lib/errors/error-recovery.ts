/**
 * FASE 3.3 - Error Recovery
 * Sistema de recuperação automática de erros
 */

import { ErrorLog } from './types';

interface RecoveryStrategy {
  name: string;
  canHandle: (error: Error) => boolean;
  recover: () => Promise<void>;
}

class ErrorRecoveryManager {
  private strategies: RecoveryStrategy[] = [];
  private recoveryAttempts = new Map<string, number>();
  private readonly MAX_RECOVERY_ATTEMPTS = 3;

  /**
   * Register a recovery strategy
   */
  registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(error: Error, errorKey: string): Promise<boolean> {
    // Check recovery attempts
    const attempts = this.recoveryAttempts.get(errorKey) || 0;
    if (attempts >= this.MAX_RECOVERY_ATTEMPTS) {
      return false;
    }

    // Find applicable strategy
    const strategy = this.strategies.find(s => s.canHandle(error));
    if (!strategy) {
      return false;
    }

    try {
      // Increment attempts
      this.recoveryAttempts.set(errorKey, attempts + 1);

      // Attempt recovery
      await strategy.recover();

      // Reset attempts on success
      this.recoveryAttempts.delete(errorKey);
      
      return true;
    } catch (recoveryError) {
      return false;
    }
  }

  /**
   * Reset recovery attempts for a key
   */
  resetAttempts(errorKey: string): void {
    this.recoveryAttempts.delete(errorKey);
  }

  /**
   * Clear all recovery attempts
   */
  clearAllAttempts(): void {
    this.recoveryAttempts.clear();
  }
}

// Singleton instance
export const errorRecoveryManager = new ErrorRecoveryManager();

/**
 * Default recovery strategies
 */

// Network error recovery
errorRecoveryManager.registerStrategy({
  name: 'network-recovery',
  canHandle: (error) => {
    return error.message?.includes('network') || 
           error.message?.includes('fetch') ||
           error.name === 'NetworkError';
  },
  recover: async () => {
    // Wait and check connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Optionally ping a health endpoint
    if (typeof window !== 'undefined') {
      try {
        await fetch('/health', { method: 'HEAD' });
      } catch {
        throw new Error('Network still unavailable');
      }
    }
  },
});

// Auth error recovery
errorRecoveryManager.registerStrategy({
  name: 'auth-recovery',
  canHandle: (error) => {
    return error.message?.includes('auth') ||
           error.message?.includes('unauthorized') ||
           error.name === 'AuthenticationError';
  },
  recover: async () => {
    // Try to refresh auth token
    if (typeof window !== 'undefined') {
      // Trigger auth refresh (implementation depends on your auth system)
      const event = new CustomEvent('auth:refresh');
      window.dispatchEvent(event);
      
      // Wait for refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  },
});

// Cache recovery
errorRecoveryManager.registerStrategy({
  name: 'cache-recovery',
  canHandle: (error) => {
    return error.message?.includes('cache');
  },
  recover: async () => {
    // Clear problematic cache
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }
  },
});

/**
 * Utility: Reset application state
 */
export async function resetApplicationState(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Clear local storage (except auth)
    const authData = localStorage.getItem('auth');
    localStorage.clear();
    if (authData) {
      localStorage.setItem('auth', authData);
    }

    // Clear session storage
    sessionStorage.clear();

    // Clear caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    }

    // Clear React Query cache
    const event = new CustomEvent('reactquery:clear');
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Failed to reset application state:', error);
  }
}

/**
 * Utility: Reload page safely
 */
export function reloadPageSafely(delay: number = 1000): void {
  if (typeof window === 'undefined') return;

  setTimeout(() => {
    window.location.reload();
  }, delay);
}

/**
 * Utility: Navigate to safe route
 */
export function navigateToSafeRoute(route: string = '/'): void {
  if (typeof window === 'undefined') return;

  window.location.href = route;
}
