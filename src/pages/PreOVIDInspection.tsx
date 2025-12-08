import React from 'react';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Ship, FileCheck, Brain, ClipboardCheck } from 'lucide-react';
import { OVIDInspectionDashboard } from '@/components/ovid/OVIDInspectionDashboard';

const PreOVIDInspection: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Ship}
        title="Pre-OVID Inspection"
        description="OCIMF Offshore Vessel Inspection Database - OVIQ4 (7300)"
        gradient="blue"
        badges={[
          { icon: ClipboardCheck, label: 'OVIQ4' },
          { icon: FileCheck, label: 'OCIMF' },
          { icon: Brain, label: 'IA Integrada' },
        ]}
      />
      <OVIDInspectionDashboard />
    </ModulePageWrapper>
  );
};

export default PreOVIDInspection;
