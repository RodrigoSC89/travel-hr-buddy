import React from 'react';
import SmartWorkflowAutomation from '@/components/automation/smart-workflow-automation';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const SmartWorkflowPage = () => {
  return (
    <ModulePageWrapper gradient="green">
      <SmartWorkflowAutomation />
    </ModulePageWrapper>
  );
};

export default SmartWorkflowPage;