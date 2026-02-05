import React, { Suspense, useState } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/Loading";
import { Brain, Anchor, GraduationCap, Award, Target } from "lucide-react";
import MentorDPProfessional from "@/components/mentor-dp/MentorDPProfessional";

const DPMentorIntelligence = React.lazy(() => import("@/components/premium/DPMentorIntelligence"));

const MentorDP = () => {
  const [activeTab, setActiveTab] = useState("intelligence");

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="Mentor DP - Dynamic Positioning Academy"
        description="Centro de treinamento e certificação DP com padrões NI/IMCA 2024"
        gradient="blue"
        badges={[
          { icon: Brain, label: "NI CPD 2024" },
          { icon: GraduationCap, label: "IMCA M117" },
          { icon: Award, label: "Certificação NI" },
          { icon: Target, label: "Simulador VR" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Intelligence (PREMIUM)
          </TabsTrigger>
          <TabsTrigger value="mentor" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Mentor AI Chat
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading fullScreen={false} message="Carregando..." />}>
          <TabsContent value="intelligence">
            <DPMentorIntelligence />
          </TabsContent>

          <TabsContent value="mentor">
            <MentorDPProfessional />
          </TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default MentorDP;
