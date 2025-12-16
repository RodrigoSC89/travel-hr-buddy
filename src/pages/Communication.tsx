import React from "react";
import { CommunicationCenterProfessional } from "@/components/communication/CommunicationCenterProfessional";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const Communication = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <CommunicationCenterProfessional />
    </ModulePageWrapper>
  );
};

export default Communication;
