import React from 'react';
import AdvancedSystemMonitor from '@/components/monitoring/advanced-system-monitor';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const AdvancedSystemMonitorPage = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <AdvancedSystemMonitor />
    </ModulePageWrapper>
  );
};

export default AdvancedSystemMonitorPage;