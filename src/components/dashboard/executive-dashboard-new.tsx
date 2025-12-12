import { memo } from 'react';
/**
 * Executive Dashboard (Migrated)
 * Dashboard migrado para usar ExecutiveDashboardBase
 * FASE B.2 - Consolidação de Dashboards
 * 
 * @deprecated Use ExecutiveDashboardBase with configuration instead
 */

import { ExecutiveDashboardBase } from "@/components/dashboard-base";
import { executiveDashboardConfig } from "@/components/dashboard-base/configs/executive-dashboard-example.config";
import { useToast } from "@/hooks/use-toast";

export const ExecutiveDashboardNew = memo(() => {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    toast({
      title: "Erro ao carregar dashboard",
      description: error.message,
      variant: "destructive",
    });
  });

  return (
    <ExecutiveDashboardBase
      config={executiveDashboardConfig}
      onError={handleError}
    />
  );
});

export default ExecutiveDashboardNew;
