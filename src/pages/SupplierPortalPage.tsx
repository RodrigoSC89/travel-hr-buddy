import * as React from 'react';
import { Suspense, useState } from "react";
import { SupplierPortal } from '@/components/suppliers/SupplierPortal';
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/Loading";
import { Store, Brain, Package, Star, DollarSign, FileText } from "lucide-react";

const ContractProcurementIntelligence = React.lazy(() => import("@/components/premium/ContractProcurementIntelligence"));

const SupplierPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("intelligence");

  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Store}
        title="Supplier Portal & Procurement Intelligence"
        description="Gestão avançada de fornecedores, contratos e procurement"
        gradient="green"
        badges={[
          { icon: Brain, label: "AI Analytics" },
          { icon: Package, label: "RFQ Automation" },
          { icon: Star, label: "Supplier Scoring" },
          { icon: DollarSign, label: "Spend Analytics" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence (PREMIUM)
          </TabsTrigger>
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Portal Clássico
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading fullScreen={false} message="Carregando..." />}>
          <TabsContent value="intelligence">
            <ContractProcurementIntelligence />
          </TabsContent>

          <TabsContent value="portal">
            <SupplierPortal />
          </TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default SupplierPortalPage;
