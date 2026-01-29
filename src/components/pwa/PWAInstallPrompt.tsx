/**
 * PWA Install Prompt Component
 * Shows installation prompt and offline status
 */

import React from 'react';
import { Download, Wifi, WifiOff, Bell, RefreshCw, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePWAFeatures } from '@/hooks/use-pwa-features';
import { useTranslation } from 'react-i18next';

export function PWAInstallPrompt() {
  const { t } = useTranslation();
  const {
    status,
    installPWA,
    requestPushPermission,
    clearCache,
    getCacheStatus,
    updateServiceWorker
  } = usePWAFeatures();

  const [cacheInfo, setCacheInfo] = React.useState<{
    totalEntries: number;
    version: string;
  } | null>(null);

  React.useEffect(() => {
    getCacheStatus().then((info) => {
      if (info) {
        setCacheInfo({ totalEntries: info.totalEntries, version: info.version });
      }
    });
  }, [getCacheStatus]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t('pwa.title', 'Instalar Aplicativo')}
        </CardTitle>
        <CardDescription>
          {t('pwa.description', 'Instale o Nautilus One para acesso rápido e offline')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">
              {status.isOnline 
                ? t('pwa.online', 'Online') 
                : t('pwa.offline', 'Offline')}
            </span>
          </div>
          <Badge variant={status.isOnline ? "default" : "destructive"}>
            {status.isOnline ? 'Conectado' : 'Desconectado'}
          </Badge>
        </div>

        {/* Install Button */}
        {status.canInstall && !status.isInstalled && (
          <Button onClick={installPWA} className="w-full" size="lg">
            <Download className="h-4 w-4 mr-2" />
            {t('pwa.install', 'Instalar Aplicativo')}
          </Button>
        )}

        {status.isInstalled && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary font-medium">
              ✓ {t('pwa.installed', 'Aplicativo instalado')}
            </p>
          </div>
        )}

        {/* Push Notifications */}
        <div className="space-y-2">
          <Button
            variant="outline"
            onClick={requestPushPermission}
            disabled={status.pushEnabled}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            {status.pushEnabled 
              ? t('pwa.notificationsEnabled', 'Notificações Ativadas')
              : t('pwa.enableNotifications', 'Ativar Notificações')}
          </Button>
        </div>

        {/* Cache Info */}
        {cacheInfo && (
          <div className="p-3 rounded-lg bg-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                <Database className="h-4 w-4" />
                {t('pwa.cacheEntries', 'Itens em cache')}
              </span>
              <Badge variant="secondary">{cacheInfo.totalEntries}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t('pwa.swVersion', 'Versão SW')}
              </span>
              <Badge variant="outline">{cacheInfo.version}</Badge>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={updateServiceWorker} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('pwa.update', 'Atualizar')}
          </Button>
          <Button variant="outline" onClick={clearCache} className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" />
            {t('pwa.clearCache', 'Limpar Cache')}
          </Button>
        </div>

        {/* SW Version */}
        {status.swVersion && (
          <p className="text-xs text-center text-muted-foreground">
            Service Worker: {status.swVersion}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PWAInstallPrompt;
