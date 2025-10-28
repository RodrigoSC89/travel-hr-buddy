/**
 * PATCH 413 - Unified Logs Page
 * Central dashboard for all system logs
 */

import { UnifiedLogsPanel } from "@/components/unified-logs-panel";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Database, Shield, Brain, Activity } from "lucide-react";

const UnifiedLogs = () => {
  return (
    <ModulePageWrapper gradient="slate">
      <ModuleHeader
        icon={Database}
        title="Unified Log Panel"
        description="Sistema centralizado de logs de acesso, IA e sistema"
        gradient="slate"
        badges={[
          { icon: Shield, label: "Acesso" },
          { icon: Brain, label: "IA" },
          { icon: Activity, label: "Sistema" }
        ]}
      />
      
      <UnifiedLogsPanel />
    </ModulePageWrapper>
  );
};

export default UnifiedLogs;
