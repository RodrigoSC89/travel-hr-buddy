// PATCH 900 - Communication Center Professional (Stable & Enhanced)
// Replaces the old flickering communication center with a stable professional version
// Features: LLM Integration, stable UI, professional layout, functional buttons

import React from "react";
import { CommunicationCenterProfessional } from "@/components/communication/CommunicationCenterProfessional";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

export const CommunicationCenter: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <CommunicationCenterProfessional />
    </ModulePageWrapper>
  );
});

export default CommunicationCenter;
