import React, { Suspense } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { User, Clock, FileText } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy loading do portal moderno
const ModernEmployeePortal = React.lazy(() => 
  import("@/components/portal/modern-employee-portal").then(module => ({
    default: module.ModernEmployeePortal
  }))
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
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Carregando portal do funcionário...</p>
          </div>
        </div>
      }>
        <ModernEmployeePortal />
      </Suspense>
    </ModulePageWrapper>
  );
};

export default Portal;