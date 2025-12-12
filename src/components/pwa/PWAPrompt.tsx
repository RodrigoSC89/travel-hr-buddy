/**
import { useEffect, useState, useCallback } from "react";;
 * PWA Install Prompt Component
 * PATCH 833: User-friendly PWA installation prompt
 */

import React, { useState, useEffect } from "react";
import { X, Download, Smartphone, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePWA } from "@/lib/pwa/service-worker-registration";
import { motion, AnimatePresence } from "framer-motion";

export const PWAInstallPrompt = memo(function() {
  const { isInstallable, isInstalled, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isInstalled) return;
    
    const dismissedAt = localStorage.getItem("pwa_prompt_dismissed");
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Show prompt after a delay
    const timer = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa_prompt_dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowPrompt(false);
    }
  };

  if (dismissed || !showPrompt || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Instalar App</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Instale o Nautica para acesso rápido e funcionalidades offline.
            </CardDescription>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Acesso direto da tela inicial</span>
              </div>
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>Funciona offline</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
              <Button
                className="flex-1"
                onClick={handleInstall}
              >
                Instalar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export const PWAUpdatePrompt = memo(function() {
  const { hasUpdate, updateApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      setShowPrompt(true);
    }
  }, [hasUpdate]);

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-96 z-50"
      >
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <RefreshCw className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Nova versão disponível</p>
                <p className="text-sm text-muted-foreground">
                  Atualize para obter as últimas melhorias
                </p>
              </div>
              <Button size="sm" onClick={updateApp}>
                Atualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export const OfflineIndicator = memo(function() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-yellow-950 text-center py-1 text-sm font-medium z-50"
    >
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
      </div>
    </motion.div>
  );
}
