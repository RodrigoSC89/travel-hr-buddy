/**
 * Mobile Layout - Main layout wrapper for mobile app
 * Provides navigation, error handling, and offline support
 */

import React, { Suspense, ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OfflineIndicator } from "./OfflineIndicator";
import { useOfflineSync } from "../hooks/useOfflineSync";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

// Error fallback component
function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <WifiOff className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Algo deu errado
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {error.message || "Ocorreu um erro inesperado"}
            </p>
          </div>
          
          <Button 
            onClick={resetErrorBoundary}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

export const MobileLayout = memo(function({ children, showNav = true }: MobileLayoutProps) {
  const { isOnline, pendingChanges, isSyncing } = useOfflineSync();

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
      }}
    >
      <div className="min-h-screen bg-background">
        {/* Offline indicator */}
        <OfflineIndicator />
        
        {/* Main content */}
        <Suspense fallback={<LoadingFallback />}>
          <main className="pb-safe">
            {children}
          </main>
        </Suspense>
        
        {/* Sync status bar (when syncing) */}
        {isSyncing && (
          <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 px-4 flex items-center justify-center gap-2 z-50">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Sincronizando {pendingChanges} alterações...</span>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
});
