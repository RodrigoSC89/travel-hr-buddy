/**
 * Export Center Page - Multi-format data export
 */
import React from "react";
import { Download, FileText, Table, FileImage } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

const ExportCenter = () => (
  <div className="text-center py-12 text-muted-foreground">
    <Download className="h-12 w-12 mx-auto mb-4 opacity-30" />
    <p>Use as opções de exportação disponíveis em cada módulo.</p>
  </div>
);

const ExportCenterPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Download}
        title="Centro de Exportação"
        description="Exporte dados em múltiplos formatos: PDF, Excel, CSV, JSON"
        gradient="blue"
        badges={[
          { icon: FileText, label: "PDF" },
          { icon: Table, label: "Excel/CSV" },
          { icon: FileImage, label: "Imagens" }
        ]}
      />
      <ExportCenter />
    </ModulePageWrapper>
  );
};

export default ExportCenterPage;
