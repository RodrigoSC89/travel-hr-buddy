import { MultiTenantWrapper } from "@/components/layout/multi-tenant-wrapper";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Satellite } from "lucide-react";
import SatelliteTrackerValidation from "@/modules/satellite-tracker/validation/SatelliteTrackerValidation";

export default function SatelliteTrackerValidationPage() {
  return (
    <MultiTenantWrapper>
      <ModulePageWrapper gradient="blue">
        <ModuleHeader
          icon={Satellite}
          title="Satellite Tracker - Validação"
          description="PATCH 399 - Rastreamento de satélites em tempo real"
          gradient="blue"
        />
        <SatelliteTrackerValidation />
      </ModulePageWrapper>
    </MultiTenantWrapper>
  );
}
