/**
 * Hook: useOperationalContext
 * PATCH 1000 - Captura contexto operacional para IA
 * 
 * Fornece informações sobre:
 * - Rota atual
 * - Dados da tela
 * - Alertas ativos
 * - Histórico de navegação
 * - Performance do sistema
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

// Route labels mapping
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

  // Track route history
  useEffect(() => {
    setRecentRoutes(prev => {
      const newRoutes = [location.pathname, ...prev.filter(r => r !== location.pathname)];
      return newRoutes.slice(0, 10); // Keep last 10 routes
    });
  }, [location.pathname]);

  // Get route label
  const routeLabel = useMemo(() => {
    const path = location.pathname;
    if (ROUTE_LABELS[path]) return ROUTE_LABELS[path];
    
    // Try to match partial paths
    for (const [route, label] of Object.entries(ROUTE_LABELS)) {
      if (path.startsWith(route) && route !== "/") return label;
    }
    
    return path.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Desconhecido";
  }, [location.pathname]);

  // Fetch operational data
  const refreshContext = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch active alerts - use any to avoid type issues
      const alertResult = await (supabase as any)
        .from("intelligent_alerts")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      
      setActiveAlerts(alertResult.count || 0);

      // Fetch pending maintenance orders
      const maintenanceResult = await (supabase as any)
        .from("maintenance_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      
      setPendingTasks(maintenanceResult.count || 0);

      // Determine system health based on alerts
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

  // Initial fetch and periodic refresh
  useEffect(() => {
    refreshContext();
    
    const interval = setInterval(refreshContext, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [refreshContext]);

  // Add screen-specific data
  const addScreenData = useCallback((key: string, value: unknown) => {
    setScreenData(prev => ({ ...prev, [key]: value }));
  }, []);

  // Build context object
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
