/**
 * AppLoader - Loading state for lazy-loaded routes
 * Includes retry mechanism for stuck loads
 */
import * as React from "react";
import { ShipLoader } from "@/components/ui/ship-loader";

export const AppLoader = () => {
  const [showRetry, setShowRetry] = React.useState(false);
  
  React.useEffect(() => {
    const retryTimeout = setTimeout(() => setShowRetry(true), 15000);
    return () => clearTimeout(retryTimeout);
  }, []);
  
  const handleRetry = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch { /* ignore cleanup errors */ }
    window.location.href = window.location.origin + '/?_sw=' + Date.now();
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <ShipLoader size="lg" label="Carregando Nauti One..." />
        {showRetry && (
          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">O carregamento está demorando mais que o normal.</p>
            <button onClick={handleRetry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
              Limpar cache e recarregar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
