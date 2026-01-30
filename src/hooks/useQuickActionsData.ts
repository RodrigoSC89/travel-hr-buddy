/**
 * Hook para dados reais de Quick Actions do Dashboard
 * Substitui dados mockados por ações dinâmicas baseadas no contexto
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: "documents" | "crew" | "maintenance" | "compliance" | "reports" | "alerts";
  priority: number;
  path: string;
  badge?: number;
  badgeType?: "warning" | "error" | "info";
}

export interface QuickActionStats {
  pendingAlerts: number;
  expiringCerts: number;
  pendingMaintenance: number;
  pendingDocuments: number;
  pendingApprovals: number;
}

export function useQuickActionsData() {
  const { user } = useAuth();

  // Fetch context-aware stats for dynamic actions
  const { data: stats, isLoading } = useQuery({
    queryKey: ["quick-action-stats", user?.id],
    queryFn: async (): Promise<QuickActionStats> => {
      const [
        { count: alertsCount },
        { count: certsCount },
        { count: maintenanceCount },
        { count: docsCount },
        { count: approvalsCount },
      ] = await Promise.all([
        // Active alerts
        supabase
          .from("soc_alerts")
          .select("id", { count: "exact", head: true })
          .is("acknowledged_at", null),
        // Expiring certificates (30 days)
        supabase
          .from("maritime_certificates")
          .select("id", { count: "exact", head: true })
          .lt("expiry_date", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
          .gt("expiry_date", new Date().toISOString()),
        // Pending maintenance
        supabase
          .from("maintenance_records")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        // Pending documents
        supabase
          .from("ai_generated_documents")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        // Pending approvals
        supabase
          .from("ai_decisions")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);

      return {
        pendingAlerts: alertsCount || 0,
        expiringCerts: certsCount || 0,
        pendingMaintenance: maintenanceCount || 0,
        pendingDocuments: docsCount || 0,
        pendingApprovals: approvalsCount || 0,
      };
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Generate dynamic actions based on stats
  const quickActions: QuickAction[] = [
    {
      id: "new-document",
      label: "Novo Documento",
      description: "Criar ou fazer upload de documento",
      icon: "FileText",
      category: "documents",
      priority: 1,
      path: "/documents",
      badge: stats?.pendingDocuments,
      badgeType: stats?.pendingDocuments ? "info" : undefined,
    },
    {
      id: "view-alerts",
      label: "Ver Alertas",
      description: "Alertas pendentes de atenção",
      icon: "AlertTriangle",
      category: "alerts",
      priority: stats?.pendingAlerts ? 0 : 5,
      path: "/dashboard",
      badge: stats?.pendingAlerts,
      badgeType: stats?.pendingAlerts ? "error" : undefined,
    },
    {
      id: "crew-management",
      label: "Gestão de Tripulação",
      description: "Gerenciar tripulantes e escalas",
      icon: "Users",
      category: "crew",
      priority: 2,
      path: "/crew-management",
    },
    {
      id: "certificates",
      label: "Certificados",
      description: "Verificar validade de certificados",
      icon: "Shield",
      category: "compliance",
      priority: stats?.expiringCerts ? 1 : 4,
      path: "/compliance",
      badge: stats?.expiringCerts,
      badgeType: stats?.expiringCerts ? "warning" : undefined,
    },
    {
      id: "maintenance",
      label: "Manutenção",
      description: "Gerenciar ordens de serviço",
      icon: "Wrench",
      category: "maintenance",
      priority: stats?.pendingMaintenance ? 2 : 3,
      path: "/intelligent-maintenance",
      badge: stats?.pendingMaintenance,
      badgeType: stats?.pendingMaintenance && stats.pendingMaintenance > 5 ? "warning" : undefined,
    },
    {
      id: "reports",
      label: "Relatórios",
      description: "Gerar e visualizar relatórios",
      icon: "BarChart3",
      category: "reports",
      priority: 6,
      path: "/analytics",
    },
    {
      id: "approvals",
      label: "Aprovações IA",
      description: "Decisões pendentes de aprovação",
      icon: "CheckCircle",
      category: "compliance",
      priority: stats?.pendingApprovals ? 1 : 7,
      path: "/ai-governance",
      badge: stats?.pendingApprovals,
      badgeType: stats?.pendingApprovals ? "info" : undefined,
    },
    {
      id: "training",
      label: "Treinamentos",
      description: "Cursos e certificações",
      icon: "GraduationCap",
      category: "crew",
      priority: 4,
      path: "/maritime-academy",
    },
  ];

  // Sort by priority
  const sortedActions = quickActions.sort((a, b) => a.priority - b.priority);

  return {
    quickActions: sortedActions,
    stats: stats || {
      pendingAlerts: 0,
      expiringCerts: 0,
      pendingMaintenance: 0,
      pendingDocuments: 0,
      pendingApprovals: 0,
    },
    isLoading,
    // Helper to get high priority actions (with badges)
    urgentActions: sortedActions.filter(a => a.badge && a.badge > 0),
  };
}
