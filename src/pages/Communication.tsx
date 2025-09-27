import React from 'react';
import { CommunicationModule } from '@/components/communication/communication-module';
import { MessageSquare } from 'lucide-react';
import { MaritimeCommunicationCenter } from '@/components/communication/maritime-communication-center';

const Communication = () => {
  return (
    <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Comunicação</h1>
              <p className="text-muted-foreground">
                Central de comunicação e mensagens
              </p>
            </div>
          </div>
      <MaritimeCommunicationCenter />
    </div>
  );
};

export default Communication;