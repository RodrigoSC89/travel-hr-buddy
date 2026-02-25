/**
 * useCommandPalette - Enhanced command palette system
 * Supports fuzzy search, recent actions, AI-suggested commands
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentlyVisited } from "./useRecentlyVisited";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category: "navigation" | "action" | "search" | "recent" | "ai";
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  priority?: number;
}

const NAVIGATION_COMMANDS: Omit<CommandItem, "action">[] = [
  { id: "nav-dashboard", label: "Dashboard", description: "Painel principal", icon: "📊", category: "navigation", shortcut: "G D", keywords: ["home", "inicio", "painel"] },
  { id: "nav-command", label: "Command Center", description: "Centro de comando estratégico", icon: "🎯", category: "navigation", shortcut: "G C", keywords: ["comando", "estrategia"] },
  { id: "nav-ops", label: "Operações", description: "Hub operacional", icon: "⚙️", category: "navigation", shortcut: "G O", keywords: ["operacoes", "viagem", "voyage"] },
  { id: "nav-maintenance", label: "Manutenção", description: "PMS & ordens de serviço", icon: "🔧", category: "navigation", shortcut: "G M", keywords: ["pms", "manutencao", "work order"] },
  { id: "nav-compliance", label: "Compliance", description: "Arsenal regulatório", icon: "📋", category: "navigation", shortcut: "G P", keywords: ["ism", "isps", "mlc", "auditoria"] },
  { id: "nav-ai", label: "IA Hub", description: "Laboratório de IA", icon: "🧪", category: "navigation", shortcut: "G I", keywords: ["inteligencia", "ai", "ml"] },
  { id: "nav-tracking", label: "Rastreamento", description: "IoT & telemetria", icon: "📡", category: "navigation", shortcut: "G T", keywords: ["iot", "sensor", "gps"] },
  { id: "nav-workbench", label: "Workbench", description: "Centro de recursos", icon: "🛠️", category: "navigation", shortcut: "G W", keywords: ["documentos", "recursos"] },
  { id: "nav-people", label: "People Hub", description: "Gestão de tripulação", icon: "👥", category: "navigation", keywords: ["crew", "rh", "tripulacao"] },
  { id: "nav-finance", label: "Financeiro", description: "Controle financeiro", icon: "💰", category: "navigation", keywords: ["finance", "despesas", "receita"] },
];

const ACTION_COMMANDS: Omit<CommandItem, "action">[] = [
  { id: "act-new-voyage", label: "Nova Viagem", description: "Criar plano de viagem", icon: "🚢", category: "action", shortcut: "N V", keywords: ["criar", "viagem"] },
  { id: "act-new-maintenance", label: "Nova OS", description: "Criar ordem de serviço", icon: "🔧", category: "action", shortcut: "N O", keywords: ["criar", "manutencao"] },
  { id: "act-new-document", label: "Novo Documento", description: "Upload de documento", icon: "📄", category: "action", shortcut: "N D", keywords: ["upload", "documento"] },
  { id: "act-export", label: "Exportar Relatório", description: "Gerar relatório do módulo atual", icon: "📥", category: "action", keywords: ["export", "relatorio", "pdf"] },
];

const ROUTE_MAP: Record<string, string> = {
  "nav-dashboard": "/",
  "nav-command": "/command",
  "nav-ops": "/ops",
  "nav-maintenance": "/maintenance",
  "nav-compliance": "/compliance",
  "nav-ai": "/ai-hub",
  "nav-tracking": "/tracking",
  "nav-workbench": "/workbench",
  "nav-people": "/people",
  "nav-finance": "/ops?tab=finance",
  "act-new-voyage": "/ops?tab=voyage&action=new",
  "act-new-maintenance": "/maintenance?action=new",
  "act-new-document": "/workbench?tab=documents&action=new",
  "act-export": "/workbench?tab=reports",
};

function fuzzyMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  if (lower.includes(q)) return 100;
  
  let score = 0;
  let qi = 0;
  for (let i = 0; i < lower.length && qi < q.length; i++) {
    if (lower[i] === q[qi]) {
      score += 10;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const allCommands = useMemo((): CommandItem[] => {
    const nav = NAVIGATION_COMMANDS.map(cmd => ({
      ...cmd,
      action: () => {
        const route = ROUTE_MAP[cmd.id];
        if (route) navigate(route);
        setIsOpen(false);
        setSearch("");
      },
    }));

    const actions = ACTION_COMMANDS.map(cmd => ({
      ...cmd,
      action: () => {
        const route = ROUTE_MAP[cmd.id];
        if (route) navigate(route);
        setIsOpen(false);
        setSearch("");
      },
    }));

    return [...nav, ...actions];
  }, [navigate]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return allCommands;

    return allCommands
      .map(cmd => {
        const labelScore = fuzzyMatch(cmd.label, search);
        const descScore = fuzzyMatch(cmd.description || "", search) * 0.5;
        const keywordScore = (cmd.keywords || []).reduce((max, kw) => Math.max(max, fuzzyMatch(kw, search)), 0) * 0.7;
        const totalScore = Math.max(labelScore, descScore, keywordScore);
        return { ...cmd, priority: totalScore };
      })
      .filter(cmd => (cmd.priority || 0) > 0)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }, [search, allCommands]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
    setSearch("");
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setSearch("");
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSearch("");
  }, []);

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggle, close, isOpen]);

  return {
    isOpen,
    search,
    setSearch,
    commands: filteredCommands,
    allCommands,
    toggle,
    open,
    close,
  };
}
