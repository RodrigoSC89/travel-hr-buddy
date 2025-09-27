import React from 'react';
import AdvancedSystemMonitor from '@/components/monitoring/advanced-system-monitor';
import { OrganizationLayout } from '@/components/layout/organization-layout';

export default function SystemMonitorPage() {
  return (
    <OrganizationLayout>
      <div className="container mx-auto p-6">
        <AdvancedSystemMonitor />
      </div>
    </OrganizationLayout>
  );
}