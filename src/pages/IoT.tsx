import React from 'react';
import { IoTDashboard } from '@/components/innovation/iot-dashboard';
import { ModulePageWrapper } from '@/components/ui/module-page-wrapper';
import { ModuleHeader } from '@/components/ui/module-header';
import { Smartphone, Activity, Wifi, Zap } from 'lucide-react';

const IoTPage: React.FC = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Smartphone}
        title="IoT Dashboard"
        description="Monitoramento e controle de dispositivos IoT em tempo real"
        gradient="blue"
        badges={[
          { icon: Activity, label: '342 Dispositivos' },
          { icon: Wifi, label: '99.2% Online' },
          { icon: Zap, label: 'Tempo Real' }
        ]}
      />
      <IoTDashboard />
    </ModulePageWrapper>
  );
};

export default IoTPage;