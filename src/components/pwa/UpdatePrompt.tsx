/**
import { useState, useCallback } from "react";;
 * PATCH 837: PWA Update Prompt
 * Prompt users to update the app
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServiceWorker } from "@/lib/pwa/service-worker-manager";

export const UpdatePrompt = memo(function() {
  const { updateAvailable, skipWaiting } = useServiceWorker();
  const [dismissed, setDismissed] = React.useState(false);

  const handleUpdate = () => {
    skipWaiting();
    window.location.reload();
  });

  if (!updateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Gradient header */}
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  Nova versão disponível!
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Uma nova versão do Nautica está pronta. Atualize agora para ter acesso às últimas melhorias.
                </p>
                
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar
                  </Button>
                  <Button
                    onClick={handleSetDismissed}
                    variant="ghost"
                    size="sm"
                  >
                    Depois
                  </Button>
                </div>
              </div>

              <button
                onClick={handleSetDismissed}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
