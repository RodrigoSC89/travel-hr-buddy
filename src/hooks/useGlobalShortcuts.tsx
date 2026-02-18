/**
 * useGlobalShortcuts - Atalhos de teclado globais
 * Benchmark: Linear (⌘K, ⌘.), Notion, Figma
 */

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSystemActions } from "@/hooks/use-system-actions";
import { toast } from "sonner";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: string;
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const { setIsSearchOpen } = useSystemActions();

  const shortcuts: ShortcutConfig[] = [
    // Navigation
    { key: "d", ctrl: true, shift: true, action: () => navigate("/"), description: "Ir para Dashboard", category: "Navegação" },
    { key: "o", ctrl: true, shift: true, action: () => navigate("/ops"), description: "Ir para Operações", category: "Navegação" },
    { key: "m", ctrl: true, shift: true, action: () => navigate("/maintenance"), description: "Ir para Manutenção", category: "Navegação" },
    { key: "c", ctrl: true, shift: true, action: () => navigate("/compliance"), description: "Ir para Compliance", category: "Navegação" },
    { key: "p", ctrl: true, shift: true, action: () => navigate("/people"), description: "Ir para People Hub", category: "Navegação" },
    
    // Actions
    { key: ".", ctrl: true, action: () => toast.info("Command Menu", { description: "Use ⌘K para busca global" }), description: "Menu de ações", category: "Ações" },
    
    // View
    { key: "\\", ctrl: true, action: () => {
      const sidebar = document.querySelector('[data-tour="sidebar"]');
      if (sidebar) sidebar.dispatchEvent(new CustomEvent('toggle-sidebar'));
    }, description: "Toggle sidebar", category: "Visualização" },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger in input fields
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
      return;
    }

    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      
      if (e.key.toLowerCase() === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}
