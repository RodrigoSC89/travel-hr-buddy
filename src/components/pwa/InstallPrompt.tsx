/**
 * PATCH 837: PWA Install Prompt
 * Encourage users to install the app
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Zap, WifiOff, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedAt = new Date(wasDismissed);
      const daysSinceDismissed = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
    setDismissed(true);
    setShowPrompt(false);
  };

  if (!showPrompt || dismissed || !deferredPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-primary rounded-xl shadow-lg">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              <button
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-foreground mt-4">
              Instale o Nautica
            </h2>
            <p className="text-muted-foreground mt-1">
              Tenha acesso rápido e uma experiência melhor
            </p>
          </div>

          {/* Benefits */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Zap className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Acesso instantâneo</p>
                <p className="text-xs text-muted-foreground">Abra direto da tela inicial</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <WifiOff className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Funciona offline</p>
                <p className="text-xs text-muted-foreground">Use mesmo sem internet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Bell className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Notificações</p>
                <p className="text-xs text-muted-foreground">Receba alertas importantes</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
            <Button
              onClick={handleDismiss}
              variant="ghost"
              className="flex-1"
            >
              Agora não
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 gap-2"
            >
              <Download className="w-4 h-4" />
              Instalar
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
