/**
 * ISPS Security Module Page
 */
import React from "react";
import { Shield, Lock, AlertTriangle, FileCheck } from "lucide-react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { safeLazyImport } from "@/utils/safeLazyImport";

const ISPSModule = safeLazyImport(
  () => import("@/components/safety/ISPSModule").then(m => ({ default: m.ISPSModule })),
  "ISPS Module"
);

const ISPSPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="orange">
      <ModuleHeader
        icon={Shield}
        title="ISPS Security & Cyber"
        description="International Ship and Port Facility Security Code + Maritime Cybersecurity"
        gradient="red"
        badges={[
          { icon: Lock, label: "Security Level" },
          { icon: AlertTriangle, label: "Threats" },
          { icon: FileCheck, label: "SSP" }
        ]}
      />
      <ISPSModule />
    </ModulePageWrapper>
  );
};

export default ISPSPage;
