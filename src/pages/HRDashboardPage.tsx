/**
 * HR Dashboard - Refactored
 */
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Users, UserPlus, DollarSign, Calendar,
  MessageSquare, Brain, Target,
  Search, BarChart3, GraduationCap, Gift, ThermometerSun, Database
} from 'lucide-react';
import { HREmployeeList } from '@/components/hr/HREmployeeList';
import { HRPayrollDashboard } from '@/components/hr/HRPayrollDashboard';
import { HRAdmissionPipeline } from '@/components/hr/HRAdmissionPipeline';
import { HRVacationManager } from '@/components/hr/HRVacationManager';
import { HRTurnoverPrediction } from '@/components/hr/HRTurnoverPrediction';
import { HRChatbot } from '@/components/hr/HRChatbot';
import { HRPerformanceReview } from '@/components/hr/HRPerformanceReview';
import { HRTrainingLMS } from '@/components/hr/HRTrainingLMS';
import { HROKRsManager } from '@/components/hr/HROKRsManager';
import { HRBenefitsManager } from '@/components/hr/HRBenefitsManager';
import { HRClimateSurvey } from '@/components/hr/HRClimatesurvey';
import { useHRStats } from '@/hooks/useHRRealData';
import { HRStatsCards } from './hr/HRStatsCards';
import { HROverviewTab } from './hr/HROverviewTab';

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats, isLoading: statsLoading } = useHRStats();

  const displayStats = stats || {
    totalEmployees: 0, activeEmployees: 0, onLeave: 0, inTraining: 0,
    available: 0, pendingVacations: 0, expiringCertificates: 0, turnoverRate: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão de RH</h1>
          <p className="text-muted-foreground">Sistema integrado de Recursos Humanos com Inteligência Artificial</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /><span className="hidden sm:inline">Chat IA</span></Button>
          <Button className="gap-2"><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Nova Admissão</span></Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="h-4 w-4" />
        <span>{statsLoading ? 'Carregando dados...' : 'Dados em tempo real do Supabase'}</span>
      </div>

      <HRStatsCards statsLoading={statsLoading} displayStats={displayStats} />

      {displayStats.expiringCertificates > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-warning">{displayStats.expiringCertificates} certificados expirando nos próximos 30 dias</p>
                <p className="text-sm text-muted-foreground">Ação recomendada: renovar certificações antes do vencimento</p>
              </div>
              <Button variant="outline" size="sm" className="border-warning/30 text-warning hover:bg-warning/10">Ver Detalhes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {displayStats.totalEmployees === 0 && !statsLoading && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="font-medium text-primary">Nenhum funcionário cadastrado no sistema</p>
                <p className="text-sm text-muted-foreground">Adicione funcionários na aba "Colaboradores" para começar</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-md bg-muted p-1 text-muted-foreground w-max">
              <TabsTrigger value="overview" className="gap-2 whitespace-nowrap"><BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">Visão Geral</span></TabsTrigger>
              <TabsTrigger value="employees" className="gap-2 whitespace-nowrap"><Users className="h-4 w-4" /><span className="hidden sm:inline">Colaboradores</span></TabsTrigger>
              <TabsTrigger value="payroll" className="gap-2 whitespace-nowrap"><DollarSign className="h-4 w-4" /><span className="hidden sm:inline">Folha</span></TabsTrigger>
              <TabsTrigger value="admissions" className="gap-2 whitespace-nowrap"><UserPlus className="h-4 w-4" /><span className="hidden sm:inline">Admissões</span></TabsTrigger>
              <TabsTrigger value="vacations" className="gap-2 whitespace-nowrap"><Calendar className="h-4 w-4" /><span className="hidden sm:inline">Férias</span></TabsTrigger>
              <TabsTrigger value="turnover" className="gap-2 whitespace-nowrap"><Brain className="h-4 w-4" /><span className="hidden sm:inline">Predição IA</span></TabsTrigger>
              <TabsTrigger value="performance" className="gap-2 whitespace-nowrap"><Target className="h-4 w-4" /><span className="hidden sm:inline">Desempenho</span></TabsTrigger>
              <TabsTrigger value="training" className="gap-2 whitespace-nowrap"><GraduationCap className="h-4 w-4" /><span className="hidden sm:inline">Treinamentos</span></TabsTrigger>
              <TabsTrigger value="okrs" className="gap-2 whitespace-nowrap"><Target className="h-4 w-4" /><span className="hidden sm:inline">OKRs</span></TabsTrigger>
              <TabsTrigger value="benefits" className="gap-2 whitespace-nowrap"><Gift className="h-4 w-4" /><span className="hidden sm:inline">Benefícios</span></TabsTrigger>
              <TabsTrigger value="climate" className="gap-2 whitespace-nowrap"><ThermometerSun className="h-4 w-4" /><span className="hidden sm:inline">Clima</span></TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar colaborador..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        </div>

        <TabsContent value="overview"><HROverviewTab /></TabsContent>
        <TabsContent value="employees"><HREmployeeList searchQuery={searchQuery} /></TabsContent>
        <TabsContent value="payroll"><HRPayrollDashboard /></TabsContent>
        <TabsContent value="admissions"><HRAdmissionPipeline /></TabsContent>
        <TabsContent value="vacations"><HRVacationManager /></TabsContent>
        <TabsContent value="turnover"><HRTurnoverPrediction /></TabsContent>
        <TabsContent value="performance"><HRPerformanceReview /></TabsContent>
        <TabsContent value="training"><HRTrainingLMS /></TabsContent>
        <TabsContent value="okrs"><HROKRsManager /></TabsContent>
        <TabsContent value="benefits"><HRBenefitsManager /></TabsContent>
        <TabsContent value="climate"><HRClimateSurvey /></TabsContent>
      </Tabs>

      <HRChatbot />
    </div>
  );
}
