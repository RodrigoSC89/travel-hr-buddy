import React, { Suspense } from "react";
import { Eye, Sparkles, Zap, Camera } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

// Lazy loading da interface AR
const ARInterface = React.lazy(() =>
  import("@/components/innovation/ar-interface").then(module => ({
    default: module.ARInterface,
  }))
);

const AR: React.FC = () => {
  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={Eye}
        title="Realidade Aumentada"
        description="Interface imersiva para visualização, manutenção e treinamento com tecnologia AR"
        gradient="indigo"
        badges={[
          { icon: Camera, label: "Interface Imersiva" },
          { icon: Sparkles, label: "Tecnologia Avançada" },
          { icon: Zap, label: "3 Aplicações" },
        ]}
      />

      <Suspense fallback={<DashboardSkeleton />}>
        <ARInterface />
      </Suspense>
    </ModulePageWrapper>
  );
};

export default AR;
