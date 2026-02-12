/**
 * HR Dashboard - Central de Gestão de RH
 * Sistema completo de RH/DP com dados reais do Supabase
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, UserPlus, DollarSign, Calendar, Clock, 
  TrendingUp, AlertTriangle, FileText, MessageSquare,
  Brain, Target, Award, HeartPulse, Search, Plus,
  Building2, BarChart3, Briefcase, GraduationCap, Gift, ThermometerSun,
  Database
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

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real data from Supabase
  const { data: stats, isLoading: statsLoading } = useHRStats();

  // Fallback stats when loading or no data
  const displayStats = stats || {
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    inTraining: 0,
    available: 0,
    pendingVacations: 0,
    expiringCertificates: 0,
    turnoverRate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Gestão de RH
          </h1>
          <p className="text-muted-foreground">
            Sistema integrado de Recursos Humanos com Inteligência Artificial
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat IA</span>
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova Admissão</span>
          </Button>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Database className="h-4 w-4" />
        <span>
          {statsLoading ? 'Carregando dados...' : `Dados em tempo real do Supabase`}
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayStats.totalEmployees}</p>
                )}
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/20 rounded-lg">
                <UserPlus className="h-5 w-5 text-success" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayStats.activeEmployees}</p>
                )}
                <p className="text-xs text-muted-foreground">Embarcados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-warning" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayStats.turnoverRate}%</p>
                )}
                <p className="text-xs text-muted-foreground">Turnover</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayStats.expiringCertificates}</p>
                )}
                <p className="text-xs text-muted-foreground">Cert. Expirando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <Calendar className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{displayStats.pendingVacations}</p>
                )}
                <p className="text-xs text-muted-foreground">Férias Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Alerts - Only show if there are expiring certificates or issues */}
      {displayStats.expiringCertificates > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-warning">
                  {displayStats.expiringCertificates} certificados expirando nos próximos 30 dias
                </p>
                <p className="text-sm text-muted-foreground">
                  Ação recomendada: renovar certificações antes do vencimento
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-warning/30 text-warning hover:bg-warning/10">
                Ver Detalhes
              </Button>
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
                <p className="font-medium text-primary">
                  Nenhum funcionário cadastrado no sistema
                </p>
                <p className="text-sm text-muted-foreground">
                  Adicione funcionários na aba "Colaboradores" para começar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col gap-4">
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-10 items-center justify-start gap-1 rounded-md bg-muted p-1 text-muted-foreground w-max">
              <TabsTrigger value="overview" className="gap-2 whitespace-nowrap">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
              </TabsTrigger>
              <TabsTrigger value="employees" className="gap-2 whitespace-nowrap">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Colaboradores</span>
              </TabsTrigger>
              <TabsTrigger value="payroll" className="gap-2 whitespace-nowrap">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Folha</span>
              </TabsTrigger>
              <TabsTrigger value="admissions" className="gap-2 whitespace-nowrap">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Admissões</span>
              </TabsTrigger>
              <TabsTrigger value="vacations" className="gap-2 whitespace-nowrap">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Férias</span>
              </TabsTrigger>
              <TabsTrigger value="turnover" className="gap-2 whitespace-nowrap">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Predição IA</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="gap-2 whitespace-nowrap">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Desempenho</span>
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2 whitespace-nowrap">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Treinamentos</span>
              </TabsTrigger>
              <TabsTrigger value="okrs" className="gap-2 whitespace-nowrap">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">OKRs</span>
              </TabsTrigger>
              <TabsTrigger value="benefits" className="gap-2 whitespace-nowrap">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">Benefícios</span>
              </TabsTrigger>
              <TabsTrigger value="climate" className="gap-2 whitespace-nowrap">
                <ThermometerSun className="h-4 w-4" />
                <span className="hidden sm:inline">Clima</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar colaborador..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-primary/10 rounded-full">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium">Nova Admissão</h3>
                <p className="text-xs text-muted-foreground">Admissão digital em 1 dia</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-success/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
                <h3 className="font-medium">Processar Folha</h3>
                <p className="text-xs text-muted-foreground">Cálculo automático com IA</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-accent/10 rounded-full">
                  <Target className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-medium">Avaliações</h3>
                <p className="text-xs text-muted-foreground">Desempenho e OKRs</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-warning/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-warning" />
                </div>
                <h3 className="font-medium">Treinamentos</h3>
                <p className="text-xs text-muted-foreground">LMS e desenvolvimento</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Pending Items */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atividades Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'Admissão aprovada', employee: 'Maria Silva', time: '2h atrás', type: 'success' },
                  { action: 'Férias solicitadas', employee: 'João Santos', time: '4h atrás', type: 'info' },
                  { action: 'Atestado enviado', employee: 'Ana Costa', time: '1d atrás', type: 'warning' },
                  { action: 'Avaliação concluída', employee: 'Carlos Oliveira', time: '2d atrás', type: 'success' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-success' : 
                      item.type === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.employee}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pendências</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Aprovar férias', count: 5, priority: 'high' },
                  { title: 'Documentos pendentes', count: 8, priority: 'medium' },
                  { title: 'Admissões em andamento', count: 4, priority: 'high' },
                  { title: 'Avaliações atrasadas', count: 3, priority: 'low' },
                ].map((item) => (
                  <div key={item.title} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <Badge variant={
                      item.priority === 'high' ? 'destructive' : 
                      item.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {item.count}
                    </Badge>
                    <span className="text-sm">{item.title}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="employees">
          <HREmployeeList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="payroll">
          <HRPayrollDashboard />
        </TabsContent>

        <TabsContent value="admissions">
          <HRAdmissionPipeline />
        </TabsContent>

        <TabsContent value="vacations">
          <HRVacationManager />
        </TabsContent>

        <TabsContent value="turnover">
          <HRTurnoverPrediction />
        </TabsContent>

        <TabsContent value="performance">
          <HRPerformanceReview />
        </TabsContent>

        <TabsContent value="training">
          <HRTrainingLMS />
        </TabsContent>

        <TabsContent value="okrs">
          <HROKRsManager />
        </TabsContent>

        <TabsContent value="benefits">
          <HRBenefitsManager />
        </TabsContent>

        <TabsContent value="climate">
          <HRClimateSurvey />
        </TabsContent>
      </Tabs>

      {/* Floating AI Chat Button */}
      <HRChatbot />
    </div>
  );
}
