import React from 'react';
import SystemOverview from '@/components/dashboard/system-overview';

const SystemOverviewPage = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Visão Geral do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento completo de todos os componentes do Nautilus One
          </p>
        </div>
        <SystemOverview />
      </div>
    </div>
  );
};

export default SystemOverviewPage;