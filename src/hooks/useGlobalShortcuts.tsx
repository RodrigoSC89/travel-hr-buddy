/**
 * useGlobalShortcuts - Atalhos de teclado globais
 * Benchmark: Linear (⌘K, ⌘.), Notion, Figma
 * Enhanced: G+key sequences for hub navigation
 */

import { useEffect, useCallback, useRef } from "react";
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

// Two-key sequences: G+<key> for hub navigation
const GO_SEQUENCES: Record<string, { path: string; label: string }> = {
  c: { path: "/command", label: "Comando" },
  o: { path: "/ops", label: "Operações" },
  m: { path: "/maintenance", label: "Manutenção" },
  p: { path: "/compliance", label: "Compliance" },
  i: { path: "/ai-hub", label: "IA Hub" },
  t: { path: "/tracking", label: "Rastreamento" },
  w: { path: "/workbench", label: "Workbench" },
  d: { path: "/", label: "Dashboard" },
};

const NEW_SEQUENCES: Record<string, { path: string; label: string }> = {
  v: { path: "/ops?tab=voyage", label: "Nova Viagem" },
  o: { path: "/maintenance?tab=overview", label: "Nova OS" },
  d: { path: "/documents?action=new", label: "Novo Documento" },
};

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const { setIsSearchOpen } = useSystemActions();
  const pendingPrefix = useRef<string | null>(null);
  const prefixTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shortcuts: ShortcutConfig[] = [
    // Navigation (legacy Ctrl+Shift combos kept for backward compat)
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
      pendingPrefix.current = null;
      return;
    }

    const key = e.key.toLowerCase();

    // Handle two-key sequences (G+key, N+key)
    if (pendingPrefix.current) {
      const prefix = pendingPrefix.current;
      pendingPrefix.current = null;
      if (prefixTimer.current) clearTimeout(prefixTimer.current);

      if (prefix === "g" && GO_SEQUENCES[key]) {
        e.preventDefault();
        const seq = GO_SEQUENCES[key];
        navigate(seq.path);
        toast.success(`→ ${seq.label}`, { duration: 1500 });
        return;
      }
      if (prefix === "n" && NEW_SEQUENCES[key]) {
        e.preventDefault();
        const seq = NEW_SEQUENCES[key];
        navigate(seq.path);
        toast.success(`+ ${seq.label}`, { duration: 1500 });
        return;
      }
    }

    // Start sequence if G or N pressed alone
    if ((key === "g" || key === "n") && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      pendingPrefix.current = key;
      if (prefixTimer.current) clearTimeout(prefixTimer.current);
      prefixTimer.current = setTimeout(() => { pendingPrefix.current = null; }, 800);
      return;
    }

    // Standard shortcuts
    for (const shortcut of shortcuts) {
      const ctrlMatch = shortcut.ctrl ? (e.metaKey || e.ctrlKey) : true;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;
      
      if (key === shortcut.key && ctrlMatch && shiftMatch && altMatch) {
        e.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate, shortcuts]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (prefixTimer.current) clearTimeout(prefixTimer.current);
    };
  }, [handleKeyDown]);

  return { shortcuts };
}
