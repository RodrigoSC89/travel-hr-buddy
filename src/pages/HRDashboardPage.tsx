/**
 * HR Dashboard - Central de Gestão de RH
 * Sistema completo de RH/DP com IA
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, UserPlus, DollarSign, Calendar, Clock, 
  TrendingUp, AlertTriangle, FileText, MessageSquare,
  Brain, Target, Award, HeartPulse, Search, Plus,
  Building2, BarChart3, Briefcase, GraduationCap
} from 'lucide-react';
import { HREmployeeList } from '@/components/hr/HREmployeeList';
import { HRPayrollDashboard } from '@/components/hr/HRPayrollDashboard';
import { HRAdmissionPipeline } from '@/components/hr/HRAdmissionPipeline';
import { HRVacationManager } from '@/components/hr/HRVacationManager';
import { HRTurnoverPrediction } from '@/components/hr/HRTurnoverPrediction';
import { HRChatbot } from '@/components/hr/HRChatbot';

export default function HRDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for overview
  const stats = {
    totalEmployees: 347,
    activeEmployees: 338,
    onLeave: 9,
    newHires: 12,
    turnoverRate: 1.8,
    avgSalary: 5420,
    pendingVacations: 23,
    expiringDocs: 8,
    highRiskEmployees: 5,
    pendingAdmissions: 4,
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground">Colaboradores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <UserPlus className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.newHires}</p>
                <p className="text-xs text-muted-foreground">Admissões/mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.turnoverRate}%</p>
                <p className="text-xs text-muted-foreground">Turnover</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.highRiskEmployees}</p>
                <p className="text-xs text-muted-foreground">Risco de Saída</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingVacations}</p>
                <p className="text-xs text-muted-foreground">Férias Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Alerts */}
      {stats.highRiskEmployees > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-5 w-5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium text-red-500">
                  IA detectou {stats.highRiskEmployees} colaboradores com alto risco de turnover
                </p>
                <p className="text-sm text-muted-foreground">
                  Ação recomendada: revisar salários e agendar 1-on-1 urgente
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-red-500/30 text-red-500 hover:bg-red-500/10">
                Ver Detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Colaboradores</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Folha</span>
            </TabsTrigger>
            <TabsTrigger value="admissions" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Admissões</span>
            </TabsTrigger>
            <TabsTrigger value="vacations" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Férias</span>
            </TabsTrigger>
            <TabsTrigger value="turnover" className="gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Predição IA</span>
            </TabsTrigger>
          </TabsList>

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
                <div className="p-3 bg-green-500/10 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium">Processar Folha</h3>
                <p className="text-xs text-muted-foreground">Cálculo automático com IA</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium">Avaliações</h3>
                <p className="text-xs text-muted-foreground">Desempenho e OKRs</p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-amber-500/10 rounded-full">
                  <GraduationCap className="h-6 w-6 text-amber-500" />
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
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full ${
                      item.type === 'success' ? 'bg-green-500' : 
                      item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
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
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
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
      </Tabs>

      {/* Floating AI Chat Button */}
      <HRChatbot />
    </div>
  );
}
