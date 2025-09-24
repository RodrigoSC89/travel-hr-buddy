import React from 'react';
import { MaritimeDashboard } from '@/components/maritime/maritime-dashboard';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const Maritime = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToDashboard />
      <MaritimeDashboard />
    </div>
  );
};

export default Maritime;