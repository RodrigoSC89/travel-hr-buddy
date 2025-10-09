import React from 'react';
import SystemPerformanceMonitor from '@/components/monitoring/system-performance-monitor';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const SystemMonitor = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <SystemPerformanceMonitor />
    </ModulePageWrapper>
  );
};

export default SystemMonitor;