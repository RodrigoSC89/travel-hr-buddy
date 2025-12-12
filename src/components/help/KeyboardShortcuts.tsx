import { useCallback, useEffect, useState } from "react";;
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Keyboard, 
  Home, 
  Search, 
  Settings, 
  HelpCircle,
  Moon,
  Sun,
  Bell,
  LogOut,
  RefreshCw
} from "lucide-react";

interface Shortcut {
  keys: string[];
  label: string;
  description: string;
  category: string;
  action?: () => void;
}

const SHORTCUT_CATEGORIES = {
  navigation: "Navegação",
  actions: "Ações Rápidas",
  system: "Sistema"
};

export const useKeyboardShortcuts = memo(() => {
  const navigate = useNavigate();
  const [helpOpen, setHelpOpen] = useState(false);

  const shortcuts: Shortcut[] = [
    // Navigation
    { keys: ["Ctrl", "K"], label: "Busca Rápida", description: "Abre a paleta de comandos", category: "navigation" },
    { keys: ["G", "H"], label: "Dashboard", description: "Ir para o dashboard principal", category: "navigation", action: () => navigate("/") },
    { keys: ["G", "S"], label: "Configurações", description: "Acessar configurações", category: "navigation", action: () => navigate("/settings") },
    { keys: ["G", "N"], label: "Notificações", description: "Abrir central de notificações", category: "navigation", action: () => navigate("/notifications-center") },
    { keys: ["G", "A"], label: "Analytics", description: "Ir para analytics", category: "navigation", action: () => navigate("/analytics") },
    { keys: ["G", "M"], label: "Manutenção", description: "Módulo de manutenção", category: "navigation", action: () => navigate("/maintenance-planner") },
    
    // Actions
    { keys: ["?"], label: "Ajuda", description: "Mostrar atalhos de teclado", category: "actions", action: () => setHelpOpen(true) },
    { keys: ["Esc"], label: "Fechar", description: "Fechar modal/dialog atual", category: "actions" },
    { keys: ["Ctrl", "R"], label: "Atualizar", description: "Recarregar dados da página", category: "system" },
    
    // System
    { keys: ["Ctrl", "Shift", "D"], label: "Modo Debug", description: "Ativar/desativar modo debug", category: "system" },
  ];

  // Listen for key sequences
  useEffect(() => {
    let keySequence: string[] = [];
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Help shortcut (?)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      // G + letter shortcuts (navigation)
      if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey) {
        keySequence = ["g"];
        clearTimeout(sequenceTimeout);
        sequenceTimeout = setTimeout(() => {
          keySequence = [];
        }, 1000);
        return;
      }

      if (keySequence[0] === "g" && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        const combo = `G+${key.toUpperCase()}`;
        
        // Find matching shortcut
        const shortcut = shortcuts.find(s => 
          s.keys.length === 2 && 
          s.keys[0] === "G" && 
          s.keys[1] === key.toUpperCase()
        );
        
        if (shortcut?.action) {
          e.preventDefault();
          shortcut.action();
        }
        
        keySequence = [];
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [navigate, shortcuts]);

  return { shortcuts, helpOpen, setHelpOpen };
};

export const KeyboardShortcutsHelp: React.FC = () => {
  const { shortcuts, helpOpen, setHelpOpen } = useKeyboardShortcuts();

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    });
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {SHORTCUT_CATEGORIES[category as keyof typeof SHORTCUT_CATEGORIES] || category}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{shortcut.label}</p>
                      <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <Badge variant="outline" className="font-mono text-xs px-2">
                            {key}
                          </Badge>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {category !== Object.keys(groupedShortcuts).slice(-1)[0] && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            Pressione <Badge variant="outline" className="font-mono text-xs mx-1">?</Badge> 
            a qualquer momento para ver esta ajuda
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsHelp;
