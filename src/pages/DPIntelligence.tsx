import React from "react";
import { ModuleErrorBoundary } from "@/components/layout/module-error-boundary";
import DPIntelligenceCenter from "@/components/dp-intelligence/dp-intelligence-center";

export default function DPIntelligence() {
  return (
    <ModuleErrorBoundary moduleName="DP Intelligence Center">
      <div className="container mx-auto py-6">
        <DPIntelligenceCenter />
      </div>
    </ModuleErrorBoundary>
  );
}
