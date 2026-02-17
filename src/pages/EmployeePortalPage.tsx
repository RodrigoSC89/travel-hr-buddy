/**
 * Portal do Colaborador - Super App Mobile-First
 * PWA com acesso a holerite, férias, benefícios, chat IA
 * Conectado a dados reais do Supabase
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, Calendar, Gift, MessageSquare, User, 
  Bell, ChevronRight, Download, Clock, TrendingUp,
  Briefcase, GraduationCap, Heart, AlertCircle, Loader2
} from 'lucide-react';
import { useEmployeeProfile, useEmployeePayslips } from '@/hooks/useEmployeePortal';
import { HRChatbot } from '@/components/hr/HRChatbot';

export default function EmployeePortalPage() {
  const [activeTab, setActiveTab] = useState('home');
  
  // Real data from Supabase
  const { data: profile, isLoading: loadingProfile } = useEmployeeProfile();
  const { data: payslips, isLoading: loadingPayslips } = useEmployeePayslips();

  const latestPayslip = payslips?.[0];

  const notifications = [
    { id: 1, title: `Holerite de ${latestPayslip ? getMonthName(latestPayslip.reference_month) : 'Janeiro'} disponível`, time: '2h', unread: true },
    { id: 2, title: 'Férias aprovadas para Fevereiro', time: '1d', unread: true },
    { id: 3, title: 'Novo curso recomendado', time: '2d', unread: false },
  ];

  const quickActions = [
    { icon: FileText, label: 'Holerite', color: 'text-primary', bg: 'bg-primary/10', tab: 'documents' },
    { icon: Calendar, label: 'Férias', color: 'text-success', bg: 'bg-success/10', tab: 'requests' },
    { icon: Clock, label: 'Ponto', color: 'text-accent-foreground', bg: 'bg-accent/10', tab: 'home' },
    { icon: Gift, label: 'Benefícios', color: 'text-warning', bg: 'bg-warning/10', tab: 'home' },
  ];

  const formatCurrency = (value: number) => 
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (loadingProfile) {
    return (
      <div className="min-h-screen pb-20 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={`portal-skeleton-${i}`} className="h-20" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const employee = {
    name: profile?.full_name || 'Colaborador',
    position: profile?.position || 'Cargo',
    department: profile?.department || 'Departamento',
    avatar: profile?.avatar_url || '',
    hireDate: profile?.hire_date || '',
    vacationDays: profile?.vacation_balance || 0,
    vacationExpiry: profile?.vacation_expiry || '',
  };

  const benefits = profile?.benefits || {
    vr_balance: 0,
    va_balance: 0,
    health_plan: false,
    dental_plan: false,
  };

  return (
    <div className="min-h-screen pb-20 space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 -mx-3 -mt-4 md:mx-0 md:mt-0 md:rounded-xl">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback className="bg-white/20 text-xl">
              {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Olá, {employee.name.split(' ')[0]}!</h1>
            <p className="text-sm text-primary-foreground/80">{employee.position}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {employee.department}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground relative" aria-label="Notificações" title="Notificações">
            <Bell className="h-5 w-5" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-xs flex items-center justify-center">
                {notifications.filter(n => n.unread).length}
              </span>
            )}
          </Button>
        </div>

        {/* Vacation Alert */}
        <Card className="mt-4 bg-white/10 border-white/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            <div className="flex-1">
              <p className="text-sm font-medium">{employee.vacationDays} dias de férias</p>
              <p className="text-xs text-primary-foreground/70">
                {employee.vacationExpiry 
                  ? `Vence em ${new Date(employee.vacationExpiry).toLocaleDateString('pt-BR')}`
                  : 'Consulte o RH para mais informações'}
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('requests')}>
              Solicitar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Card 
            key={action.label} 
            className="cursor-pointer hover:border-primary/50 transition-all active:scale-95"
            onClick={() => setActiveTab(action.tab)}
          >
            <CardContent className="p-4 flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${action.bg}`}>
                <action.icon className={`h-5 w-5 ${action.color}`} />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="requests">Solicitações</TabsTrigger>
          <TabsTrigger value="development">Carreira</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4 mt-4">
          {/* Latest Payslip */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Último Holerite
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPayslips ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : latestPayslip ? (
                <>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(latestPayslip.net_salary)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {getMonthName(latestPayslip.reference_month)} {latestPayslip.reference_year}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Salário Bruto</p>
                      <p className="font-medium">{formatCurrency(latestPayslip.gross_salary)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Descontos</p>
                      <p className="font-medium text-destructive">
                        -{formatCurrency(latestPayslip.inss_deduction + latestPayslip.irrf_deduction + latestPayslip.other_deductions)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground grid grid-cols-3 gap-2">
                    <div>
                      <span>INSS:</span>
                      <span className="ml-1 font-medium">{formatCurrency(latestPayslip.inss_deduction)}</span>
                    </div>
                    <div>
                      <span>IRRF:</span>
                      <span className="ml-1 font-medium">{formatCurrency(latestPayslip.irrf_deduction)}</span>
                    </div>
                    {latestPayslip.overtime_amount > 0 && (
                      <div>
                        <span>H.E.:</span>
                        <span className="ml-1 font-medium text-success">+{formatCurrency(latestPayslip.overtime_amount)}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum holerite disponível
                </p>
              )}
            </CardContent>
          </Card>

          {/* Benefits Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-warning" />
                Meus Benefícios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Vale Refeição', balance: formatCurrency(benefits.vr_balance), progress: (benefits.vr_balance / 1000) * 100 },
                { name: 'Vale Alimentação', balance: formatCurrency(benefits.va_balance), progress: (benefits.va_balance / 600) * 100 },
                { name: 'Plano de Saúde', balance: benefits.health_plan ? 'Ativo' : 'Inativo', progress: benefits.health_plan ? 100 : 0 },
              ].map((benefit) => (
                <div key={benefit.name} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">{benefit.name}</span>
                      <span className="text-sm font-medium">{benefit.balance}</span>
                    </div>
                    <Progress value={benefit.progress} className="h-2" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Avisos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  {notif.unread && <div className="w-2 h-2 rounded-full bg-primary" />}
                  <div className="flex-1">
                    <p className="text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.time}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Meus Holerites</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingPayslips ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : payslips && payslips.length > 0 ? (
                payslips.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                    <FileText className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Holerite {getMonthName(p.reference_month)} {p.reference_year}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Líquido: {formatCurrency(p.net_salary)}
                      </p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Nenhum documento disponível</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Outros Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Informe de Rendimentos 2025', date: '28/02/2026', type: 'PDF' },
                { name: 'Contrato de Trabalho', date: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('pt-BR') : 'N/A', type: 'PDF' },
                { name: 'Política de Férias', date: '01/01/2026', type: 'PDF' },
              ].map((doc) => (
                <div key={doc.name} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.date}</p>
                  </div>
                  <Badge variant="secondary">{doc.type}</Badge>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 mt-4">
          <div className="flex gap-2 mb-4">
            <Button className="flex-1 gap-2">
              <Calendar className="h-4 w-4" />
              Solicitar Férias
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              Enviar Atestado
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Minhas Solicitações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { type: 'Férias', period: '15-25/02/2026', status: 'approved', date: '10/01/2026' },
                { type: 'Atestado Médico', period: '2 dias', status: 'approved', date: '05/01/2026' },
                { type: 'Home Office', period: 'Sexta-feira', status: 'pending', date: '08/01/2026' },
              ].map((req) => (
                <div key={`${req.type}-${req.date}`} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{req.type}</p>
                    <p className="text-xs text-muted-foreground">{req.period}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={req.status === 'approved' ? 'default' : 'secondary'}>
                      {req.status === 'approved' ? 'Aprovado' : 'Pendente'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{req.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development" className="space-y-4 mt-4">
          {/* OKRs Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Meus OKRs - Q1 2026
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-sm text-muted-foreground">67%</span>
                </div>
                <Progress value={67} className="h-3" />
              </div>
              
              {[
                { objective: 'Entregar projeto Alpha', progress: 80 },
                { objective: 'Melhorar performance do app', progress: 60 },
                { objective: 'Mentorar 2 juniores', progress: 50 },
              ].map((okr) => (
                <div key={okr.objective}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{okr.objective}</span>
                    <span className="text-xs text-muted-foreground">{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recommended Training */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent" />
                Treinamentos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'React Avançado', duration: '8h', match: 95 },
                { name: 'Liderança Técnica', duration: '4h', match: 88 },
                { name: 'AWS Solutions Architect', duration: '20h', match: 75 },
              ].map((course) => (
                <div key={course.name} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">{course.duration}</p>
                  </div>
                  <Badge variant="secondary">{course.match}% match</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Floating Chat Button */}
      <HRChatbot />
    </div>
  );
}

// Helper function
function getMonthName(month: number): string {
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  return months[month - 1] || 'Janeiro';
}
