import React, { Suspense } from "react";
import { Shield, Lock, CheckCircle, FileCheck } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { DashboardSkeleton } from "@/components/ui/loading-skeleton";

// Lazy loading do sistema blockchain
const BlockchainDocuments = React.lazy(() => 
  import("@/components/innovation/blockchain-documents").then(module => ({
    default: module.BlockchainDocuments
  }))
);

const Blockchain: React.FC = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Shield}
        title="Blockchain Documents"
        description="Certificação e validação segura de documentos com tecnologia blockchain"
        gradient="green"
        badges={[
          { icon: Lock, label: "Segurança Máxima" },
          { icon: CheckCircle, label: "Validação Distribuída" },
          { icon: FileCheck, label: "Certificação" }
        ]}
      />
      
      <Suspense fallback={<DashboardSkeleton />}>
        <BlockchainDocuments />
      </Suspense>
    </ModulePageWrapper>
  );
};

export default Blockchain;