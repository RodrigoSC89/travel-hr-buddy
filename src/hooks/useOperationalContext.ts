/**
 * Hook: useOperationalContext
 * PATCH 1000 - Captura contexto operacional para IA
 * DEBT-FIX: Removed (supabase as any) - intelligent_alerts doesn't exist, using satellite_alerts + maintenance_orders
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface OperationalContext {
  currentRoute: string;
  routeLabel: string;
  activeAlerts: number;
  pendingTasks: number;
  systemHealth: "healthy" | "degraded" | "critical";
  recentRoutes: string[];
  screenData: Record<string, unknown>;
  timestamp: string;
  userRole?: string;
}

interface UseOperationalContextReturn {
  context: OperationalContext;
  isLoading: boolean;
  refreshContext: () => Promise<void>;
  addScreenData: (key: string, value: unknown) => void;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Página Inicial",
  "/dashboard": "Dashboard Principal",
  "/nautilus-command": "Centro de Comando",
  "/fleet-ai": "Frota Inteligente",
  "/crew-command": "Tripulação",
  "/maintenance-command": "Manutenção",
  "/documents": "Documentos",
  "/reports-command": "Relatórios",
  "/esg-command": "ESG & Sustentabilidade",
  "/safety-command": "Segurança",
  "/audit-command": "Auditorias",
  "/voyage": "Viagens",
  "/training": "Treinamentos",
  "/settings": "Configurações",
};

export function useOperationalContext(): UseOperationalContextReturn {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [systemHealth, setSystemHealth] = useState<"healthy" | "degraded" | "critical">("healthy");
  const [recentRoutes, setRecentRoutes] = useState<string[]>([]);
  const [screenData, setScreenData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setRecentRoutes(prev => {
      const newRoutes = [location.pathname, ...prev.filter(r => r !== location.pathname)];
      return newRoutes.slice(0, 10);
    });
  }, [location.pathname]);

  const routeLabel = useMemo(() => {
    const path = location.pathname;
    if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
    
    for (const [route, label] of Object.entries(ROUTE_LABELS)) {
      if (path.startsWith(route) && route !== "/") return label;
    }
    
    return path.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Desconhecido";
  }, [location.pathname]);

  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch active alerts from satellite_alerts (typed table)
      const alertResult = await supabase
        .from("satellite_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_resolved", false);
      
      setActiveAlerts(alertResult.count || 0);

      // Fetch pending maintenance orders (typed table)
      const maintenanceResult = await supabase
        .from("maintenance_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      setPendingTasks(maintenanceResult.count || 0);

      const alertCount = alertResult.count || 0;
      if (alertCount > 10) {
        setSystemHealth("critical");
      } else if (alertCount > 5) {
        setSystemHealth("degraded");
      } else {
        setSystemHealth("healthy");
      }

    } catch {
      // Silent failure - non-critical context fetch
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContext();
    
    const interval = setInterval(refreshContext, 60000);
    return () => clearInterval(interval);
  }, [refreshContext]);

  const addScreenData = useCallback((key: string, value: unknown) => {
    setScreenData(prev => ({ ...prev, [key]: value }));
  }, []);

  const context = useMemo<OperationalContext>(() => ({
    currentRoute: location.pathname,
    routeLabel,
    activeAlerts,
    pendingTasks,
    systemHealth,
    recentRoutes,
    screenData,
    timestamp: new Date().toISOString(),
  }), [location.pathname, routeLabel, activeAlerts, pendingTasks, systemHealth, recentRoutes, screenData]);

  return {
    context,
    isLoading,
    refreshContext,
    addScreenData,
  };
}

export default useOperationalContext;
