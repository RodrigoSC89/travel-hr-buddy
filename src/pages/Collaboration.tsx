import React from "react";
import RealTimeWorkspace from "@/components/collaboration/real-time-workspace";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Users, MessageSquare, Share2 } from "lucide-react";

const Collaboration = () => {
  return (
    <ModulePageWrapper gradient="green">
      <ModuleHeader
        icon={Users}
        title="Colaboração em Tempo Real"
        description="Workspace colaborativo para equipes marítimas"
        gradient="green"
        badges={[
          { icon: MessageSquare, label: "Chat em Tempo Real" },
          { icon: Share2, label: "Compartilhamento" },
        ]}
      />

      <div className="h-[calc(100vh-400px)]">
        <RealTimeWorkspace />
      </div>
    </ModulePageWrapper>
  );
};

export default Collaboration;
