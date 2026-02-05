import React, { Suspense } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/ui/Loading";
import { Brain, Anchor, GraduationCap, Award, Target, MessageSquare, BookOpen, Gamepad2 } from "lucide-react";
import MentorDPProfessional from "@/components/mentor-dp/MentorDPProfessional";

const DPMentorIntelligence = React.lazy(() => import("@/components/premium/DPMentorIntelligence"));

const MentorDP = () => {
  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={Anchor}
        title="Mentor DP - Dynamic Positioning Academy"
        description="Centro de treinamento e certificação DP com IA Generativa, padrões NI/IMCA 2024"
        gradient="blue"
        badges={[
          { icon: MessageSquare, label: "AI Chat" },
          { icon: Brain, label: "NI CPD 2024" },
          { icon: GraduationCap, label: "IMCA M117" },
          { icon: Award, label: "Certificação NI" },
          { icon: Target, label: "Simulador VR" },
        ]}
      />

      <Tabs defaultValue="mentor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mentor" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Mentor AI Chat
          </TabsTrigger>
          <TabsTrigger value="academy" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Academia DP
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            Simulador
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
        </TabsList>

        <Suspense fallback={<Loading fullScreen={false} message="Carregando..." />}>
          <TabsContent value="mentor">
            <MentorDPProfessional />
          </TabsContent>

          <TabsContent value="academy">
            <MentorDPProfessional />
          </TabsContent>

          <TabsContent value="simulator">
            <MentorDPProfessional />
          </TabsContent>

          <TabsContent value="intelligence">
            <DPMentorIntelligence />
          </TabsContent>
        </Suspense>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default MentorDP;
