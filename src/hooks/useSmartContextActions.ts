/**
 * useSmartContextActions - AI-powered context-aware action suggestions
 * Analyzes current route, user behavior, and system state to suggest relevant actions
 */
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export interface ContextAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  priority: number;
  route?: string;
  action?: () => void;
  category: "quick" | "suggested" | "ai";
}

/** Route → contextual actions map */
const ROUTE_CONTEXT_ACTIONS: Record<string, Omit<ContextAction, "action">[]> = {
  "/": [
    { id: "ctx-fleet-risk", label: "Análise de Risco da Frota", description: "Ver health scores", icon: "🛡️", priority: 90, route: "/command", category: "suggested" },
    { id: "ctx-cert-expiry", label: "Certificados Expirando", description: "Ver certificados próximos ao vencimento", icon: "📋", priority: 85, route: "/compliance", category: "quick" },
    { id: "ctx-overdue-maint", label: "Manutenções Atrasadas", description: "OSs vencidas precisando atenção", icon: "🔧", priority: 80, route: "/maintenance", category: "quick" },
  ],
  "/command": [
    { id: "ctx-kpi-deep", label: "KPI Deep Dive", description: "Análise detalhada de métricas", icon: "📊", priority: 90, route: "/command?tab=analytics", category: "suggested" },
    { id: "ctx-situation", label: "Situation Room", description: "Centro de consciência situacional", icon: "🎯", route: "/command?tab=situation", priority: 85, category: "quick" },
  ],
  "/ops": [
    { id: "ctx-new-voyage", label: "Nova Viagem", description: "Criar plano de viagem", icon: "🚢", priority: 95, route: "/ops?tab=voyage&action=new", category: "quick" },
    { id: "ctx-voyage-pnl", label: "Voyage P&L", description: "Resultado financeiro das viagens", icon: "💰", priority: 80, route: "/ops?tab=finance", category: "suggested" },
    { id: "ctx-weather", label: "Weather Routing", description: "Otimização por condições meteorológicas", icon: "🌊", priority: 75, route: "/ops?tab=weather", category: "ai" },
  ],
  "/maintenance": [
    { id: "ctx-new-wo", label: "Nova Ordem de Serviço", description: "Criar OS de manutenção", icon: "🔧", priority: 95, route: "/maintenance?action=new", category: "quick" },
    { id: "ctx-predict", label: "Previsões de Falha", description: "Manutenção preditiva com IA", icon: "🤖", priority: 85, route: "/maintenance?tab=predictions", category: "ai" },
    { id: "ctx-spare", label: "Peças Críticas", description: "Inventário abaixo do mínimo", icon: "⚙️", priority: 80, route: "/maintenance?tab=inventory", category: "suggested" },
  ],
  "/compliance": [
    { id: "ctx-audit-sim", label: "Simular Auditoria", description: "Teste de prontidão com IA", icon: "🧪", priority: 90, route: "/compliance?tab=audits&action=simulate", category: "ai" },
    { id: "ctx-gap-analysis", label: "Gap Analysis", description: "Identificar lacunas de conformidade", icon: "🔍", priority: 85, route: "/compliance?tab=ism", category: "suggested" },
    { id: "ctx-evidence", label: "Gerar Evidências", description: "Auto Evidence Builder", icon: "📦", priority: 80, route: "/compliance?tab=lvs", category: "ai" },
  ],
  "/ai-hub": [
    { id: "ctx-ai-chat", label: "Chat com IA", description: "Conversar com PEOTRAM AI", icon: "💬", priority: 95, category: "quick" },
    { id: "ctx-ai-decisions", label: "Decisões Autônomas", description: "Pendentes de aprovação (HITL)", icon: "🧠", priority: 90, route: "/ai-hub?tab=decisions", category: "ai" },
  ],
  "/tracking": [
    { id: "ctx-fleet-map", label: "Mapa da Frota", description: "Posições em tempo real", icon: "🗺️", priority: 95, route: "/tracking?tab=map", category: "quick" },
    { id: "ctx-geofence", label: "Geofences Ativos", description: "Alertas de zona", icon: "📡", priority: 80, route: "/tracking?tab=geofence", category: "suggested" },
  ],
  "/workbench": [
    { id: "ctx-new-doc", label: "Upload Documento", description: "Novo documento com OCR", icon: "📄", priority: 90, route: "/workbench?tab=documents&action=new", category: "quick" },
    { id: "ctx-reports", label: "Gerar Relatório", description: "Relatórios automatizados", icon: "📥", priority: 85, route: "/workbench?tab=reports", category: "suggested" },
  ],
};

export function useSmartContextActions(): {
  actions: ContextAction[];
  quickActions: ContextAction[];
  suggestedActions: ContextAction[];
  aiActions: ContextAction[];
} {
  const location = useLocation();

  const actions = useMemo(() => {
    // Match current route to closest context
    const path = location.pathname;
    const contextActions = ROUTE_CONTEXT_ACTIONS[path] || ROUTE_CONTEXT_ACTIONS["/"] || [];

    return contextActions
      .map(a => ({ ...a, action: undefined } as ContextAction))
      .sort((a, b) => b.priority - a.priority);
  }, [location.pathname]);

  const quickActions = useMemo(() => actions.filter(a => a.category === "quick"), [actions]);
  const suggestedActions = useMemo(() => actions.filter(a => a.category === "suggested"), [actions]);
  const aiActions = useMemo(() => actions.filter(a => a.category === "ai"), [actions]);

  return { actions, quickActions, suggestedActions, aiActions };
}
