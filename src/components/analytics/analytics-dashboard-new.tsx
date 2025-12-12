import { memo } from 'react';
/**
 * Analytics Dashboard (Migrated)
 * Dashboard migrado para usar AnalyticsDashboardBase
 * FASE B.2 - Consolidação de Dashboards
 * 
 * @deprecated Use AnalyticsDashboardBase with configuration instead
 */

import { AnalyticsDashboardBase } from "@/components/dashboard-base";
import { analyticsDashboardConfig } from "@/components/dashboard-base/configs/analytics-dashboard-example.config";
import { useToast } from "@/hooks/use-toast";

export const AnalyticsDashboardNew = memo(() => {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    toast({
      title: "Erro ao carregar analytics",
      description: error.message,
      variant: "destructive",
    });
  });

  return (
    <AnalyticsDashboardBase
      config={analyticsDashboardConfig}
      onError={handleError}
    />
  );
};

export default AnalyticsDashboardNew;
