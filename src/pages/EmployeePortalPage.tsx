/**
 * Portal do Colaborador - Super App Mobile-First
 * PWA com acesso a holerite, férias, benefícios, chat IA
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, Calendar, Gift, MessageSquare, User, 
  Bell, ChevronRight, Download, Clock, TrendingUp,
  Briefcase, GraduationCap, Heart, AlertCircle
} from 'lucide-react';

export default function EmployeePortalPage() {
  const [activeTab, setActiveTab] = useState('home');

  // Mock employee data
  const employee = {
    name: 'João Silva',
    position: 'Desenvolvedor Full-Stack Sênior',
    department: 'Tecnologia',
    avatar: '',
    hireDate: '2022-03-15',
    vacationDays: 25,
    vacationExpiry: '2026-03-15',
  };

  const notifications = [
    { id: 1, title: 'Holerite de Janeiro disponível', time: '2h', unread: true },
    { id: 2, title: 'Férias aprovadas para Fevereiro', time: '1d', unread: true },
    { id: 3, title: 'Novo curso recomendado', time: '2d', unread: false },
  ];

  const quickActions = [
    { icon: FileText, label: 'Holerite', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Calendar, label: 'Férias', color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: Clock, label: 'Ponto', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Gift, label: 'Benefícios', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="min-h-screen pb-20 space-y-6">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 -mx-3 -mt-4 md:mx-0 md:mt-0 md:rounded-xl">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white/20">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback className="bg-white/20 text-xl">
              {employee.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Olá, {employee.name.split(' ')[0]}!</h1>
            <p className="text-sm text-primary-foreground/80">{employee.position}</p>
            <Badge variant="secondary" className="mt-1 text-xs">
              {employee.department}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground relative">
            <Bell className="h-5 w-5" />
            {notifications.filter(n => n.unread).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
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
                Vence em {new Date(employee.vacationExpiry).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Button size="sm" variant="secondary">Solicitar</Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Card key={action.label} className="cursor-pointer hover:border-primary/50 transition-all active:scale-95">
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
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold text-green-500">R$ 8.420,18</p>
                  <p className="text-sm text-muted-foreground">Janeiro 2026</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  PDF
                </Button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Salário Bruto</p>
                  <p className="font-medium">R$ 12.000,00</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Descontos</p>
                  <p className="font-medium text-red-500">-R$ 3.579,82</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" />
                Meus Benefícios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Vale Refeição', balance: 'R$ 847,50', progress: 65 },
                { name: 'Vale Alimentação', balance: 'R$ 420,00', progress: 42 },
                { name: 'Plano de Saúde', balance: 'Ativo', progress: 100 },
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
                <Bell className="h-5 w-5 text-blue-500" />
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
              <CardTitle className="text-lg">Meus Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: 'Holerite Janeiro 2026', date: '05/01/2026', type: 'PDF' },
                { name: 'Informe de Rendimentos 2025', date: '28/02/2026', type: 'PDF' },
                { name: 'Contrato de Trabalho', date: '15/03/2022', type: 'PDF' },
                { name: 'Política de Férias', date: '01/01/2026', type: 'PDF' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <FileText className="h-5 w-5 text-red-500" />
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
              ].map((req, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
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
                <TrendingUp className="h-5 w-5 text-green-500" />
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
              ].map((okr, i) => (
                <div key={i}>
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
                <GraduationCap className="h-5 w-5 text-purple-500" />
                Treinamentos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'React Avançado', duration: '8h', match: 95 },
                { name: 'Liderança Técnica', duration: '4h', match: 88 },
                { name: 'AWS Solutions Architect', duration: '20h', match: 75 },
              ].map((course, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
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
      <Button 
        size="lg" 
        className="fixed bottom-24 right-4 md:bottom-6 h-14 w-14 rounded-full shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
}
