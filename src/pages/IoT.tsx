import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { IoTDashboard } from '@/components/innovation/iot-dashboard';

const IoTPage: React.FC = () => {
  return (
    <MainLayout>
      <IoTDashboard />
    </MainLayout>
  );
};

export default IoTPage;