import React from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Shield, AlertTriangle, Package, Download } from "lucide-react";
import { PSCPackagePanel } from "@/components/psc/PSCPackagePanel";

const PSCPackagePage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="Gerador de Pacotes PSC"
        description="Documentação e rastreamento de deficiências para inspeção Port State Control"
        gradient="orange"
        badges={[
          { icon: Package, label: "Pacotes ZIP/PDF" },
          { icon: AlertTriangle, label: "Deficiências" },
          { icon: Download, label: "Exportação" },
        ]}
      />
      <PSCPackagePanel />
    </ModulePageWrapper>
  );
});

export default PSCPackagePage;
