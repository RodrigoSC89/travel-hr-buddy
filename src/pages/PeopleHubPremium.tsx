/**
 * People Hub Premium - Centro de Gestão de Pessoas Completo
 * Integra todos os componentes de RH com abas
 * ENTERPRISE UPGRADE - Phase 7
 */

import React, { Suspense, lazy } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutDashboard, Users, Calendar, GraduationCap, 
  Heart, Award, UserPlus, Brain, Activity, Star, ClipboardList
} from "lucide-react";

// Lazy load original components
const PeopleCommandCenter = lazy(() => import("@/modules/people-hub/components/PeopleCommandCenter"));
const CrewSchedulerOriginal = lazy(() => import("@/modules/people-hub/components/CrewScheduler"));
const CompetencyMatrix = lazy(() => import("@/modules/people-hub/components/CompetencyMatrix"));
const CrewWellnessPanel = lazy(() => import("@/modules/people-hub/components/CrewWellnessPanel"));
const CrewIntelligenceHub = lazy(() => import("@/components/premium/CrewIntelligenceHub"));
const PeopleIntelligenceHub = lazy(() => import("@/components/premium/PeopleIntelligenceHub"));
const TrainingAcademyIntelligence = lazy(() => import("@/components/premium/TrainingAcademyIntelligence"));
const MentorDPUnified = lazy(() => import("@/components/mentor-dp/MentorDPUnified"));

// Enterprise Components - Phase 7
import { 
  TalentPipeline,
  PerformanceReviews,
  TrainingMatrix,
  CrewScheduler
} from "@/components/enterprise";

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function PeopleHubPremium() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "advanced";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            People Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Centro de gestão de tripulação e recursos humanos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Activity className="h-3 w-3 mr-1 animate-pulse" />
            247 ativos
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            <Brain className="h-3 w-3 mr-1" />
            STCW/MLC AI
          </Badge>
          <Badge variant="outline" className="text-sm">
            Enterprise
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 h-auto p-1">
          <TabsTrigger value="advanced" className="flex flex-col items-center gap-1 py-2">
            <Brain className="h-4 w-4" />
            <span className="text-xs">Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex flex-col items-center gap-1 py-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">STCW/MLC</span>
          </TabsTrigger>
          <TabsTrigger value="talent" className="flex flex-col items-center gap-1 py-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs">Talentos</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex flex-col items-center gap-1 py-2">
            <Star className="h-4 w-4" />
            <span className="text-xs">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="training-matrix" className="flex flex-col items-center gap-1 py-2">
            <ClipboardList className="h-4 w-4" />
            <span className="text-xs">Matriz</span>
          </TabsTrigger>
          <TabsTrigger value="crew-scheduler" className="flex flex-col items-center gap-1 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Escalas</span>
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex flex-col items-center gap-1 py-2">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Rotações</span>
          </TabsTrigger>
          <TabsTrigger value="competency" className="flex flex-col items-center gap-1 py-2">
            <Award className="h-4 w-4" />
            <span className="text-xs">Competências</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex flex-col items-center gap-1 py-2">
            <GraduationCap className="h-4 w-4" />
            <span className="text-xs">Treinamento</span>
          </TabsTrigger>
          <TabsTrigger value="mentor-dp" className="flex flex-col items-center gap-1 py-2">
            <Award className="h-4 w-4" />
            <span className="text-xs">Mentor DP</span>
          </TabsTrigger>
          <TabsTrigger value="wellness" className="flex flex-col items-center gap-1 py-2">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Bem-estar</span>
          </TabsTrigger>
          <TabsTrigger value="command" className="flex flex-col items-center gap-1 py-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-xs">Dashboard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="advanced">
          <Suspense fallback={<LoadingSkeleton />}>
            <PeopleIntelligenceHub />
          </Suspense>
        </TabsContent>

        <TabsContent value="intelligence">
          <Suspense fallback={<LoadingSkeleton />}>
            <CrewIntelligenceHub />
          </Suspense>
        </TabsContent>

        {/* Enterprise Components - Phase 7 */}
        <TabsContent value="talent">
          <TalentPipeline />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceReviews />
        </TabsContent>

        <TabsContent value="training-matrix">
          <TrainingMatrix />
        </TabsContent>

        <TabsContent value="crew-scheduler">
          <CrewScheduler />
        </TabsContent>

        <TabsContent value="command">
          <Suspense fallback={<LoadingSkeleton />}>
            <PeopleCommandCenter />
          </Suspense>
        </TabsContent>

        <TabsContent value="scheduler">
          <Suspense fallback={<LoadingSkeleton />}>
            <CrewSchedulerOriginal />
          </Suspense>
        </TabsContent>

        <TabsContent value="competency">
          <Suspense fallback={<LoadingSkeleton />}>
            <CompetencyMatrix />
          </Suspense>
        </TabsContent>

        <TabsContent value="training">
          <Suspense fallback={<LoadingSkeleton />}>
            <TrainingAcademyIntelligence />
          </Suspense>
        </TabsContent>

        <TabsContent value="mentor-dp">
          <Suspense fallback={<LoadingSkeleton />}>
            <MentorDPUnified />
          </Suspense>
        </TabsContent>

        <TabsContent value="wellness">
          <Suspense fallback={<LoadingSkeleton />}>
            <CrewWellnessPanel />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
