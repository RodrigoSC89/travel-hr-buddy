/**
 * Offline Page - PWA Fallback
 * Shown when user is offline and tries to access uncached content
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, Home, Ship } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  return (
    <>
      <Helmet>
        <title>Offline | Nautilus One</title>
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <WifiOff className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Ship className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2">Você está offline</h1>
            <p className="text-muted-foreground mb-6">
              Sem conexão com a internet. Verifique sua conexão e tente novamente.
            </p>

            <div className="space-y-3">
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Voltar ao início
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                💡 Dica: Alguns recursos podem estar disponíveis offline se você já os acessou antes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
