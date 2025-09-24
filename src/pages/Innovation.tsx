import React from 'react';
import { AIAssistantPanel } from '@/components/innovation/AIAssistantPanel';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Innovation = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToDashboard />
      <AIAssistantPanel />
    </div>
  );
};

export default Innovation;