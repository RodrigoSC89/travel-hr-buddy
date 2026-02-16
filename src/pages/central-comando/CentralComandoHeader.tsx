import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GuidedTour, tourStyles } from "@/components/onboarding/GuidedTour";
import {
  RefreshCw, Sun, Moon, Maximize2, Mic, MicOff,
  ChevronRight, Sparkles, Radio, Compass, Brain,
  AlertTriangle, Building2,
} from "lucide-react";

interface CentralComandoHeaderProps {
  tenant: { id: string | null; name: string | null };
  isConnected: boolean;
  lastSync: Date;
  alertCounts: { critical: number; high: number; total: number };
  isRefreshing: boolean;
  isDarkMode: boolean;
  isListening: boolean;
  voiceSupported: boolean;
  showAIPanel: boolean;
  isAITyping: boolean;
  onRefresh: () => void;
  onToggleTheme: () => void;
  onToggleFullscreen: () => void;
  onToggleVoice: () => void;
  onToggleAIPanel: () => void;
}

export const CentralComandoHeader: React.FC<CentralComandoHeaderProps> = ({
  tenant, isConnected, lastSync, alertCounts, isRefreshing, isDarkMode,
  isListening, voiceSupported, showAIPanel, isAITyping,
  onRefresh, onToggleTheme, onToggleFullscreen, onToggleVoice, onToggleAIPanel,
}) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-purple-600 shadow-lg shadow-primary/25">
              <Compass className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-success border-2 border-background flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Central de Comando
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {tenant?.name || "Todas Organizações"}
            </p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted'}`} />
              <span className="text-xs font-medium">{isConnected ? 'Online' : 'Conectando...'}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {lastSync.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>

          {alertCounts.critical > 0 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20"
            >
              <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
              <span className="text-xs font-semibold text-destructive">
                {alertCounts.critical} alertas críticos
              </span>
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {voiceSupported && (
            <Button
              variant={isListening ? "default" : "ghost"}
              size="icon"
              onClick={onToggleVoice}
              className={isListening ? "bg-destructive hover:bg-destructive/90 animate-pulse" : ""}
              aria-label={isListening ? "Parar reconhecimento de voz" : "Ativar reconhecimento de voz"}
              title={isListening ? "Parar voz" : "Ativar voz"}
            >
              {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isRefreshing} aria-label="Atualizar dados" title="Atualizar">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Alternar tema" title="Alternar tema">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="hidden lg:flex" aria-label="Tela cheia" title="Tela cheia">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <GuidedTour autoStart={false} />
          <motion.div whileHover={{ scale: 1.05 }} data-tour="ia-button">
            <Badge
              className="cursor-pointer bg-gradient-to-r from-secondary via-accent to-destructive text-secondary-foreground border-0 shadow-lg shadow-secondary/25 px-3 py-1"
              onClick={onToggleAIPanel}
            >
              <Brain className="h-3 w-3 mr-1.5 animate-pulse" />
              IA Ativa
              <ChevronRight className={`h-3 w-3 ml-1 transition-transform ${showAIPanel ? 'rotate-90' : ''}`} />
            </Badge>
          </motion.div>
        </div>
        {/* eslint-disable-next-line react/no-danger -- tourStyles is a static CSS string */}
        <style dangerouslySetInnerHTML={{ __html: tourStyles }} />
      </div>
    </header>
  );
};
