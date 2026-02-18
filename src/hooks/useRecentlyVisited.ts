/**
 * useRecentlyVisited - Tracks recently visited pages for quick navigation
 * Persists to localStorage, max 15 entries, deduplicates
 */

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";

export interface RecentPage {
  path: string;
  label: string;
  hub?: string;
  timestamp: number;
}

const STORAGE_KEY = "nauti-recently-visited";
const MAX_ITEMS = 15;

// Route label map for auto-detection
const ROUTE_LABELS: Record<string, { label: string; hub?: string }> = {
  "/command": { label: "Central de Comando", hub: "command" },
  "/ops": { label: "Hub de Operações", hub: "ops" },
  "/maintenance": { label: "Hub de Manutenção", hub: "maintenance" },
  "/compliance": { label: "Hub de Compliance", hub: "compliance" },
  "/ai-hub": { label: "Hub de IA", hub: "ai" },
  "/tracking": { label: "Rastreamento", hub: "tracking" },
  "/workbench": { label: "Workbench", hub: "workbench" },
  "/voyage-command": { label: "Voyage Command" },
  "/fleet-command": { label: "Fleet Command" },
  "/commercial-ops": { label: "Operações Comerciais" },
  "/crew-planning": { label: "Planejamento de Tripulação" },
  "/crew-rotation": { label: "Rotação de Tripulação" },
  "/crew-payroll": { label: "Folha de Pagamento" },
  "/documents": { label: "Documentos" },
  "/pms-hub": { label: "PMS Hub" },
  "/ism-code": { label: "ISM Code" },
  "/mlc-inspection": { label: "MLC 2006" },
  "/peo-dp": { label: "PEO-DP" },
  "/peotram": { label: "PEOTRAM" },
  "/esg-emissions": { label: "ESG & Emissões" },
  "/world-class": { label: "World-Class Dashboard" },
  "/predictive-maintenance": { label: "Manutenção Preditiva" },
  "/fuel-management": { label: "Gestão de Combustível" },
  "/weather-routing": { label: "Weather Routing" },
  "/smart-voyage": { label: "Smart Voyage Optimizer" },
  "/chartering": { label: "Chartering Hub" },
  "/procurement": { label: "Procurement" },
  "/settings": { label: "Configurações" },
  "/reports": { label: "Relatórios" },
  "/analytics": { label: "Analytics" },
};

// External store for cross-component reactivity
let listeners: Set<() => void> = new Set();
let cachedPages: RecentPage[] | null = null;

function getPages(): RecentPage[] {
  if (cachedPages) return cachedPages;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cachedPages = raw ? JSON.parse(raw) : [];
  } catch {
    cachedPages = [];
  }
  return cachedPages!;
}

function setPages(pages: RecentPage[]) {
  cachedPages = pages;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return getPages();
}

export function useRecentlyVisited() {
  const location = useLocation();
  const pages = useSyncExternalStore(subscribe, getSnapshot);

  // Track page visit
  useEffect(() => {
    const path = location.pathname;
    
    // Skip auth, 404, callbacks
    if (["/auth", "/reset-password", "/auth-callback"].includes(path)) return;
    
    const basePath = path.split("?")[0];
    const routeInfo = ROUTE_LABELS[basePath];
    
    // Only track known routes
    if (!routeInfo) return;

    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    const label = tab 
      ? `${routeInfo.label} › ${tab.charAt(0).toUpperCase() + tab.slice(1)}`
      : routeInfo.label;

    const fullPath = tab ? `${basePath}?tab=${tab}` : basePath;

    const existing = getPages().filter((p) => p.path !== fullPath);
    const newPage: RecentPage = {
      path: fullPath,
      label,
      hub: routeInfo.hub,
      timestamp: Date.now(),
    };
    
    setPages([newPage, ...existing].slice(0, MAX_ITEMS));
  }, [location.pathname, location.search]);

  const clearHistory = useCallback(() => {
    setPages([]);
  }, []);

  return { recentPages: pages, clearHistory };
}
