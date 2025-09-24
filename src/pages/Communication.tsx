import React from 'react';
import { CommunicationModule } from '@/components/communication/communication-module';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Communication = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToDashboard />
      <CommunicationModule />
    </div>
  );
};

export default Communication;