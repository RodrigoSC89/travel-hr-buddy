import { UnifiedLogsPanel } from "@/components/unified-logs-panel";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { ScrollText, Database, Activity } from "lucide-react";

const UnifiedLogs = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={ScrollText}
        title="Unified Logs Panel"
        description="Consolidação de logs de acesso, AI assistant e sistema em tempo real"
        gradient="blue"
        badges={[
          { icon: Database, label: "Multi-Source" },
          { icon: Activity, label: "Real-Time" },
          { icon: ScrollText, label: "Unified View" }
        ]}
      />
      <UnifiedLogsPanel />
    </ModulePageWrapper>
  );
};

export default UnifiedLogs;
