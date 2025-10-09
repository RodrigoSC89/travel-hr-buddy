import React from 'react';
import { EnhancedCommunicationCenter } from '@/components/communication/enhanced-communication-center';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const Communication = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <EnhancedCommunicationCenter />
    </ModulePageWrapper>
  );
};

export default Communication;