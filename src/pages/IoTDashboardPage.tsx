import React from 'react';
import { IoTSensorDashboard } from '@/components/iot/IoTSensorDashboard';

const IoTDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">IoT Sensor Dashboard</h1>
          <p className="text-muted-foreground">Real-time vessel sensor monitoring and alerts</p>
        </div>
        <IoTSensorDashboard />
      </div>
    </div>
  );
};

export default IoTDashboardPage;
