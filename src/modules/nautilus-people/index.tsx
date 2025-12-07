/**
 * Nautilus People Hub - Módulo Revolucionário de RH com LLM Integrada
 * Superando SAP SuccessFactors, Workday, BambooHR e OrangeHRM
 * Version: 1.0.0
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BarChart3, 
  Briefcase, 
  GraduationCap, 
  Heart, 
  FileText, 
  MessageSquare,
  Target,
  Clock,
  Award,
  TrendingUp,
  UserPlus
} from 'lucide-react';
import PeopleDashboard from './components/PeopleDashboard';
import CollaboratorRegistry from './components/CollaboratorRegistry';
import RecruitmentPipeline from './components/RecruitmentPipeline';
import PerformanceCenter from './components/PerformanceCenter';
import ClimateEngagement from './components/ClimateEngagement';
import PeopleAnalytics from './components/PeopleAnalytics';
import HRChatbot from './components/HRChatbot';
import OnboardingFlow from './components/OnboardingFlow';
import TimeAttendance from './components/TimeAttendance';
import CareerDevelopment from './components/CareerDevelopment';

const NautilusPeopleHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Nautilus People Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Plataforma Inteligente de Gestão de Pessoas com IA Integrada
            </p>
          </div>
          <HRChatbot />
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="colaboradores" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Users className="w-4 h-4" />
              Colaboradores
            </TabsTrigger>
            <TabsTrigger 
              value="recrutamento" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Recrutamento
            </TabsTrigger>
            <TabsTrigger 
              value="onboarding" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Onboarding
            </TabsTrigger>
            <TabsTrigger 
              value="desempenho" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Target className="w-4 h-4" />
              Desempenho
            </TabsTrigger>
            <TabsTrigger 
              value="frequencia" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Clock className="w-4 h-4" />
              Frequência
            </TabsTrigger>
            <TabsTrigger 
              value="carreira" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Carreira
            </TabsTrigger>
            <TabsTrigger 
              value="clima" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <Heart className="w-4 h-4" />
              Clima & Engajamento
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              People Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-0">
            <PeopleDashboard />
          </TabsContent>

          <TabsContent value="colaboradores" className="mt-0">
            <CollaboratorRegistry />
          </TabsContent>

          <TabsContent value="recrutamento" className="mt-0">
            <RecruitmentPipeline />
          </TabsContent>

          <TabsContent value="onboarding" className="mt-0">
            <OnboardingFlow />
          </TabsContent>

          <TabsContent value="desempenho" className="mt-0">
            <PerformanceCenter />
          </TabsContent>

          <TabsContent value="frequencia" className="mt-0">
            <TimeAttendance />
          </TabsContent>

          <TabsContent value="carreira" className="mt-0">
            <CareerDevelopment />
          </TabsContent>

          <TabsContent value="clima" className="mt-0">
            <ClimateEngagement />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <PeopleAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NautilusPeopleHub;
