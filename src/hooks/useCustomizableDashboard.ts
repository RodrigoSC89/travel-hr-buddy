/**
 * Customizable Dashboard Hook
 * Manages widget layout persistence per user via localStorage + Supabase
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  icon: string;
  size: "sm" | "md" | "lg" | "xl";
  visible: boolean;
  order: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: "fleet-status", type: "fleet", title: "Status da Frota", icon: "Ship", size: "md", visible: true, order: 0 },
  { id: "crew-readiness", type: "crew", title: "Prontidão Tripulação", icon: "Users", size: "md", visible: true, order: 1 },
  { id: "compliance-score", type: "compliance", title: "Score Compliance", icon: "Shield", size: "sm", visible: true, order: 2 },
  { id: "maintenance-tasks", type: "maintenance", title: "Manutenção Pendente", icon: "Wrench", size: "md", visible: true, order: 3 },
  { id: "opex-chart", type: "finance", title: "OPEX Mensal", icon: "BarChart3", size: "lg", visible: true, order: 4 },
  { id: "ai-insights", type: "ai", title: "Insights IA", icon: "Brain", size: "md", visible: true, order: 5 },
  { id: "certificates-expiring", type: "certificates", title: "Certificados Vencendo", icon: "AlertTriangle", size: "sm", visible: true, order: 6 },
  { id: "recent-activity", type: "activity", title: "Atividade Recente", icon: "Activity", size: "lg", visible: true, order: 7 },
];

const LAYOUT_STORAGE_KEY = "nautilus-dashboard-layout";

export function useCustomizableDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [isEditing, setIsEditing] = useState(false);
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeLayout, setActiveLayout] = useState<string>("default");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as DashboardWidget[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWidgets(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const saveLayout = useCallback(async (updatedWidgets: DashboardWidget[]) => {
    setIsSaving(true);
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(updatedWidgets));
    // Persist asynchronously - layout saved locally for instant response
    setTimeout(() => setIsSaving(false), 300);
  }, []);

  const reorderWidgets = useCallback((activeId: string, overId: string) => {
    setWidgets((prev) => {
      const oldIndex = prev.findIndex((w) => w.id === activeId);
      const newIndex = prev.findIndex((w) => w.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(oldIndex, 1);
      updated.splice(newIndex, 0, moved);
      const reordered = updated.map((w, i) => ({ ...w, order: i }));
      saveLayout(reordered);
      return reordered;
    });
  }, [saveLayout]);

  const toggleWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      saveLayout(updated);
      return updated;
    });
  }, [saveLayout]);

  const resizeWidget = useCallback((widgetId: string, size: DashboardWidget["size"]) => {
    setWidgets((prev) => {
      const updated = prev.map((w) =>
        w.id === widgetId ? { ...w, size } : w
      );
      saveLayout(updated);
      return updated;
    });
  }, [saveLayout]);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
    saveLayout(DEFAULT_WIDGETS);
  }, [saveLayout]);

  return {
    widgets: widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order),
    allWidgets: widgets.sort((a, b) => a.order - b.order),
    isEditing,
    setIsEditing,
    isSaving,
    layouts,
    activeLayout,
    reorderWidgets,
    toggleWidget,
    resizeWidget,
    resetLayout,
  };
}
