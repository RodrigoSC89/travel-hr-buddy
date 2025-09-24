import React from 'react';
import { PriceAlertDashboard } from '@/components/price-alerts/price-alert-dashboard';
import { BackToDashboard } from '@/components/ui/back-to-dashboard';

const PriceAlerts = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <BackToDashboard />
      <PriceAlertDashboard />
    </div>
  );
};

export default PriceAlerts;