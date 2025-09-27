import React from 'react';
import { IntegrationsHub } from '@/components/integrations/integrations-hub';
import { Globe } from 'lucide-react';

const Integrations = () => {
  return (
    <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integrações</h1>
              <p className="text-muted-foreground">
                Central de integrações e conectores
              </p>
            </div>
          </div>
      <IntegrationsHub />
    </div>
  );
};

export default Integrations;