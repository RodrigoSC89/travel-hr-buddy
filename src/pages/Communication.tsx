import React from "react";
import { EnhancedCommunicationCenter } from "@/components/communication/enhanced-communication-center";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { MessageSquare, Users, Zap, Globe } from "lucide-react";

const Communication = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={MessageSquare}
        title="Centro de Comunicação"
        description="Sistema integrado de mensagens, chat e comunicação marítima em tempo real"
        gradient="blue"
        badges={[
          { icon: Users, label: "Chat em Equipe" },
          { icon: Zap, label: "Tempo Real" },
          { icon: Globe, label: "Alcance Global" }
        ]}
      />
      <EnhancedCommunicationCenter />
    </ModulePageWrapper>
  );
};

export default Communication;