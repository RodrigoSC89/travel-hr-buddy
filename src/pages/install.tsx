/**
 * Install App Page
 * Guides users through PWA installation
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Smartphone, Wifi, WifiOff, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWAStatus } from '@/hooks/usePWAStatus';
import { LanguageSelector } from '@/components/LanguageSelector';

function getInstallInstructions(platform: string): string {
  if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
    return 'Tap the Share button, then "Add to Home Screen"';
  }
  if (/android/i.test(navigator.userAgent)) {
    return 'Tap the menu (⋮), then "Add to Home Screen" or "Install App"';
  }
  return 'Click the install icon in the address bar';
}

function detectPlatform(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

export default function InstallPage() {
  const { t } = useTranslation();
  const { isInstalled, isOnline, canInstall, installPWA } = usePWAStatus();
  const platform = detectPlatform();

  const handleInstall = async () => {
    await installPWA();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Nautilus One</h1>
              <p className="text-sm text-blue-300">Maritime Management</p>
            </div>
          </div>
          <LanguageSelector />
        </div>

        {/* Status Card */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {t('pwa.installTitle')}
            </CardTitle>
            <CardDescription className="text-blue-200">
              {t('pwa.installDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              {isOnline ? (
                <>
                  <Wifi className="h-5 w-5 text-green-400" />
                  <span className="text-green-300">{t('common.online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-300">{t('common.offline')}</span>
                </>
              )}
            </div>

            {/* Install Status */}
            {isInstalled ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                <Check className="h-6 w-6 text-green-400" />
                <div>
                  <p className="font-medium text-green-300">{t('pwa.installed')}</p>
                  <p className="text-sm text-green-200/70">{t('pwa.offlineReady')}</p>
                </div>
              </div>
            ) : canInstall ? (
              <Button 
                onClick={handleInstall}
                className="w-full bg-blue-500 hover:bg-blue-600 gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                {t('pwa.installButton')}
              </Button>
            ) : (
              <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <p className="text-sm text-blue-200">
                  {getInstallInstructions(platform)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="bg-white/10 backdrop-blur border-white/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {[
                { icon: '📱', text: 'Works on all devices' },
                { icon: '📴', text: 'Full offline support' },
                { icon: '🔄', text: 'Auto-sync when online' },
                { icon: '🎤', text: 'Voice commands' },
                { icon: '🔔', text: 'Push notifications' }
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-blue-100">
                  <span className="text-xl">{feature.icon}</span>
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button 
          variant="outline" 
          className="w-full border-white/30 text-white hover:bg-white/10 gap-2"
          onClick={() => window.location.href = '/'}
        >
          Continue to App
          <ArrowRight className="h-4 w-4" />
        </Button>

        {/* Footer */}
        <p className="text-center text-blue-300/50 text-xs mt-8">
          Nautilus One v3.2.0 • Production Ready
        </p>
      </div>
    </div>
  );
}
