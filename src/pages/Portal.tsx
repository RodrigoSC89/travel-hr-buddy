import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { User, Clock, FileText } from "lucide-react";
import { safeLazyImport } from "@/utils/safeLazyImport";

// Lazy loading do portal moderno com safeLazyImport
const ModernEmployeePortal = safeLazyImport(
  () => React.lazy(() => import(import("@/components/portal/modern-employee-portal").then(module => ({ default: module.ModernEmployeePortal })))),
  "Modern Employee Portal"
);

const Portal: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={User}
        title="Portal do Funcionário"
        description="Acesso personalizado aos seus recursos e informações"
        gradient="blue"
        badges={[
          { icon: Clock, label: "Acesso 24/7" },
          { icon: FileText, label: "Documentos" }
        ]}
      />
      
      <ModernEmployeePortal />
    </ModulePageWrapper>
  );
};

export default Portal;