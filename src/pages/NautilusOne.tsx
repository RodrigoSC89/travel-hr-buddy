import React from 'react';
import { NautilusOneDashboard } from '@/components/dp/nautilus-one-dashboard';
import EnterpriseLayout from '@/components/layout/enterprise-layout';

const NautilusOne: React.FC = () => {
  return (
    <EnterpriseLayout>
      <NautilusOneDashboard />
    </EnterpriseLayout>
  );
};

export default NautilusOne;
