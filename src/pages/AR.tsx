import React from "react";
import { Eye, Sparkles, Zap, Camera } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

// Lazy loading da interface AR com safeLazyImport
const ARInterface = safeLazyImport(
  () => import("@/components/innovation/ar-interface").then(module => ({ default: module.ARInterface })),
  "AR Interface"
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
          { icon: Zap, label: "3 Aplicações" }
        ]}
      />
      
      <ARInterface />
    </ModulePageWrapper>
  );
});

export default AR;