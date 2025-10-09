import React from "react";
import { MobileOptimizationCenter } from "@/components/mobile/mobile-optimization-center";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const MobileOptimizationPage = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <MobileOptimizationCenter />
    </ModulePageWrapper>
  );
};

export default MobileOptimizationPage;