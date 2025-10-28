/**
 * PATCH 187.0 - Mobile Home Screen
 * 
 * Main dashboard for mobile app with quick access to key features
 */

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ship,
  CheckSquare,
  AlertTriangle,
  Activity,
  Wifi,
  WifiOff,
  RefreshCw,
  LogIn,
} from "lucide-react";
import { enhancedSyncEngine } from "../services/enhanced-sync-engine";
import { networkDetector } from "../services/networkDetector";
import { biometricAuthService } from "../services/biometric-auth";
import { structuredLogger } from "@/lib/logger/structured-logger";

export const MobileHome: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState(enhancedSyncEngine.getStatus());
  const [isOnline, setIsOnline] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Initialize sync engine
    enhancedSyncEngine.initialize();

    // Subscribe to sync status
    const unsubscribe = enhancedSyncEngine.addStatusListener((status) => {
      setSyncStatus(status);
      setPendingCount(status.pendingChanges);
    });

    // Monitor network status
    const unsubscribeNetwork = networkDetector.addListener((online: boolean) => {
      setIsOnline(online);
    });

    // Check biometric availability
    biometricAuthService.isAvailable().then((result) => {
      setBiometricAvailable(result.available);
    });

    return () => {
      unsubscribe();
      unsubscribeNetwork();
    };
  }, []);

  const handleQuickSync = async () => {
    try {
      await enhancedSyncEngine.forceSync();
      structuredLogger.info("Manual sync completed");
    } catch (error) {
      structuredLogger.error("Manual sync failed", error as Error);
    }
  };

  const handleBiometricAuth = async () => {
    const result = await biometricAuthService.authenticate();
    if (result.success) {
      structuredLogger.info("Biometric authentication successful");
    } else {
      structuredLogger.warn("Biometric authentication failed", { error: result.error });
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nautilus One</h1>
          <p className="text-sm text-muted-foreground">Mobile Command Center</p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      {/* Sync Status Alert */}
      {pendingCount > 0 && (
        <Alert>
          <RefreshCw className="h-4 w-4" />
          <AlertDescription>
            {pendingCount} alteração(ões) pendente(s) de sincronização
            <Button
              variant="link"
              size="sm"
              onClick={handleQuickSync}
              className="ml-2"
            >
              Sincronizar agora
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Biometric Auth Card */}
      {biometricAvailable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Autenticação Biométrica
            </CardTitle>
            <CardDescription>
              Acesso rápido e seguro com biometria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBiometricAuth} className="w-full">
              Autenticar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader className="pb-2">
            <Ship className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-base">Embarcações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader className="pb-2">
            <CheckSquare className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle className="text-base">Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">12</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader className="pb-2">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <CardTitle className="text-base">Incidentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
            <p className="text-xs text-muted-foreground">Abertos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardHeader className="pb-2">
            <Activity className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle className="text-base">Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Programadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Status de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Modo:</span>
            <Badge variant={syncStatus.mode === "realtime" ? "default" : "secondary"}>
              {syncStatus.mode}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Última sincronização:</span>
            <span>
              {syncStatus.lastSync
                ? new Date(syncStatus.lastSync).toLocaleTimeString()
                : "Nunca"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Alterações pendentes:</span>
            <span className="font-semibold">{syncStatus.pendingChanges}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
