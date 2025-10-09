import React from 'react';
import StrategicDashboard from '@/components/dashboard/strategic-dashboard';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

export default function Dashboard() {
  return (
    <ModulePageWrapper gradient="blue">
      <StrategicDashboard />
    </ModulePageWrapper>
  );
}