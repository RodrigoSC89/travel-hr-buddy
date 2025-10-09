import React from 'react';
import { EnhancedReservationsDashboard } from '@/components/reservations/enhanced-reservations-dashboard';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';

const Reservations: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <EnhancedReservationsDashboard />
    </ModulePageWrapper>
  );
};

export default Reservations;