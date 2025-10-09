import React from "react";
import { AdvancedIntegrationsHub } from "@/components/integrations/advanced-integrations-hub";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";

const Integrations = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <AdvancedIntegrationsHub />
    </ModulePageWrapper>
  );
};

export default Integrations;
