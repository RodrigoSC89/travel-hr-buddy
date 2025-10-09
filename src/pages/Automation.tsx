import React from 'react';
import { AutomationHub } from '@/components/automation/automation-hub';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

export default function Automation() {
  return (
    <ModulePageWrapper gradient="purple">
      <AutomationHub />
    </ModulePageWrapper>
  );
};