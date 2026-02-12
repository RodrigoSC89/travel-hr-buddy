/**
 * VesselContractsUnified - Premium Vessel Contracts Hub
 * Unified interface with Intelligence Premium features
 */

import React, { lazy, Suspense, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/Loading";
import { FileText, Brain, Shield, Clock, Scale, DollarSign } from "lucide-react";

// Lazy load components
const VesselContractsV2 = lazy(() => import("./CharterPartyV2"));
const ContractProcurementIntelligence = lazy(() => import("@/components/premium/ContractProcurementIntelligence"));

function LoadingFallback() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={`contract-skeleton-${i}`} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function VesselContractsUnified() {
  const [activeTab, setActiveTab] = useState("intelligence");

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Vessel Contracts & Charter Party Hub"
        description="Gestão completa de contratos BIMCO, charter party, laytime e demurrage"
        gradient="blue"
        badges={[
          { icon: Brain, label: "AI Analysis" },
          { icon: Scale, label: "BIMCO Standard" },
          { icon: Clock, label: "Laytime/Demurrage" },
          { icon: DollarSign, label: "TCE Analytics" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence (PREMIUM)
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Contracts & Downtime
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading fullScreen={false} message="Carregando..." />}>
          <TabsContent value="intelligence">
            <ContractProcurementIntelligence />
          </TabsContent>

          <TabsContent value="contracts">
            <VesselContractsV2 />
          </TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
}
