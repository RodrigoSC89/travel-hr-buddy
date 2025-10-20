import React, { ComponentType, LazyExoticComponent } from 'react';

/**
 * safeLazyImport - Universal Safe Lazy Import
 * 
 * Replaces React.lazy to eliminate "Failed to fetch dynamically imported module" errors.
 * Provides automatic retry mechanism with exponential backoff and visual fallback.
 * 
 * @param importFunc - Dynamic import function
 * @param retries - Number of retry attempts (default: 3)
 * @param delay - Initial delay in ms (default: 1000)
 * @returns LazyExoticComponent with safe error handling
 * 
 * @example
 * const MyComponent = safeLazyImport(() => import('./MyComponent'));
 */
export function safeLazyImport<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3,
  delay: number = 1000
): LazyExoticComponent<T> {
  return React.lazy(() => 
    new Promise<{ default: T }>((resolve, reject) => {
      const attemptImport = async (remainingRetries: number) => {
        try {
          const module = await importFunc();
          resolve(module);
        } catch (error) {
          console.error(`[safeLazyImport] Import failed, ${remainingRetries} retries left`, error);
          
          if (remainingRetries === 0) {
            // Last attempt failed - reject with detailed error
            console.error('[safeLazyImport] All retry attempts exhausted', error);
            reject(error);
            return;
          }
          
          // Exponential backoff: delay * (retries - remainingRetries + 1)
          const backoffDelay = delay * (retries - remainingRetries + 1);
          
          setTimeout(() => {
            attemptImport(remainingRetries - 1);
          }, backoffDelay);
        }
      };
      
      attemptImport(retries);
    })
  );
}

/**
 * SafeLazyFallback - Default fallback component for lazy imports
 * Shows a loading state with Nautilus branding
 */
export const SafeLazyFallback: React.FC<{ error?: Error }> = ({ error }) => {
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center p-8 bg-slate-900 border border-red-500 rounded-lg max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Module Load Error</h2>
          <p className="text-slate-400 mb-4">Failed to load module after multiple attempts.</p>
          <pre className="text-xs text-left bg-slate-950 p-3 rounded overflow-auto max-h-40 text-red-400">
            {error.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-400 text-sm">Loading Nautilus Module...</p>
      </div>
    </div>
  );
};

export default safeLazyImport;
