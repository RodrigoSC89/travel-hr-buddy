import { WorldClassDocumentCenter } from "@/components/documents/WorldClassDocumentCenter";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { FileText, Upload, Search, Shield, ScanLine, Lock } from "lucide-react";

const DocumentsPage = () => {
  return (
    <ModulePageWrapper gradient="purple" data-testid="documents-page">
      <ModuleHeader
        icon={FileText}
        title="Centro de Documentos World-Class"
        description="Gestão documental que supera SoftExpert — OCR, assinatura digital, compliance e retenção automatizada"
        gradient="purple"
        badges={[
          { icon: Upload, label: "Upload Rápido" },
          { icon: Search, label: "Busca IA" },
          { icon: Shield, label: "Compliance" },
          { icon: ScanLine, label: "OCR" },
          { icon: Lock, label: "Assinatura Digital" }
        ]}
      />
      <WorldClassDocumentCenter />
    </ModulePageWrapper>
  );
};

export default DocumentsPage;
