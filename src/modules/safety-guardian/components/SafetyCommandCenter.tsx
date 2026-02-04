/**
 * Safety Command Center - Centro de Controle de Segurança Premium
 * Dashboard unificado para gestão completa de segurança marítima
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  Bell,
  Target,
  Award,
  BarChart3,
  Sparkles,
  HardHat,
  Flame,
  Users,
  BookOpen,
  Activity,
  FileText,
  Calendar,
  MessageSquare,
  Zap,
  ThermometerSun,
  Anchor
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Incident {
  id: string;
  type: 'incident' | 'near_miss' | 'unsafe_condition' | 'unsafe_act';
  title: string;
  description: string;
  vessel: string;
  location: string;
  date: string;
  reporter: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'action_pending' | 'resolved';
  rootCause?: string;
  correctiveActions: number;
}

interface DDSRecord {
  id: string;
  date: string;
  topic: string;
  vessel: string;
  conductor: string;
  participants: number;
  duration: number;
}

interface SafetyTraining {
  id: string;
  name: string;
  type: string;
  crewMember: string;
  vessel: string;
  status: 'completed' | 'in-progress' | 'expired' | 'scheduled';
  expiryDate?: string;
  score?: number;
}

// Mock data
const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'near_miss',
    title: 'Quase queda durante embarque de carga',
    description: 'Tripulante escorregou em óleo no convés durante operação de carga',
    vessel: 'MV Atlantic Pioneer',
    location: 'Convés Principal',
    date: '2024-06-15',
    reporter: 'João Silva',
    severity: 'medium',
    status: 'investigating',
    correctiveActions: 2
  },
  {
    id: '2',
    type: 'unsafe_condition',
    title: 'Corrimão danificado na escada principal',
    description: 'Corrimão solto pode causar queda',
    vessel: 'MV Pacific Star',
    location: 'Escada E2',
    date: '2024-06-14',
    reporter: 'Maria Santos',
    severity: 'high',
    status: 'action_pending',
    correctiveActions: 1
  },
  {
    id: '3',
    type: 'incident',
    title: 'Lesão leve em manuseio de equipamento',
    description: 'Pequeno corte no dedo durante troca de filtro',
    vessel: 'MV Ocean Voyager',
    location: 'Sala de Máquinas',
    date: '2024-06-10',
    reporter: 'Carlos Lima',
    severity: 'low',
    status: 'resolved',
    rootCause: 'Falta de uso de EPI adequado',
    correctiveActions: 3
  }
];

const mockDDS: DDSRecord[] = [
  { id: '1', date: '2024-06-15', topic: 'Trabalho em Altura', vessel: 'MV Atlantic Pioneer', conductor: 'Cap. João', participants: 12, duration: 15 },
  { id: '2', date: '2024-06-15', topic: 'Espaços Confinados', vessel: 'MV Pacific Star', conductor: 'SSO Pedro', participants: 8, duration: 20 },
  { id: '3', date: '2024-06-14', topic: 'Combate a Incêndio', vessel: 'MV Ocean Voyager', conductor: 'Of. Carlos', participants: 15, duration: 25 },
  { id: '4', date: '2024-06-14', topic: 'Primeiros Socorros', vessel: 'MV Atlantic Pioneer', conductor: 'Enf. Ana', participants: 10, duration: 15 }
];

const mockTrainings: SafetyTraining[] = [
  { id: '1', name: 'STCW Basic Safety', type: 'Mandatory', crewMember: 'João Silva', vessel: 'MV Atlantic Pioneer', status: 'completed', expiryDate: '2025-06-15', score: 95 },
  { id: '2', name: 'Fire Prevention', type: 'Mandatory', crewMember: 'Maria Santos', vessel: 'MV Pacific Star', status: 'expired', expiryDate: '2024-05-01' },
  { id: '3', name: 'First Aid at Sea', type: 'Mandatory', crewMember: 'Carlos Lima', vessel: 'MV Ocean Voyager', status: 'in-progress', score: 60 },
  { id: '4', name: 'Survival Craft', type: 'Mandatory', crewMember: 'Ana Rocha', vessel: 'MV Atlantic Pioneer', status: 'scheduled', expiryDate: '2024-07-20' }
];

const severityConfig = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Média', color: 'bg-warning/20 text-warning' },
  high: { label: 'Alta', color: 'bg-orange-500/20 text-orange-600' },
  critical: { label: 'Crítica', color: 'bg-destructive/20 text-destructive' }
};

const statusConfig = {
  open: { label: 'Aberto', color: 'bg-blue-500/20 text-blue-600' },
  investigating: { label: 'Investigando', color: 'bg-warning/20 text-warning' },
  action_pending: { label: 'Ação Pendente', color: 'bg-orange-500/20 text-orange-600' },
  resolved: { label: 'Resolvido', color: 'bg-success/20 text-success' }
};

const typeConfig = {
  incident: { label: 'Incidente', icon: AlertTriangle, color: 'text-destructive' },
  near_miss: { label: 'Quase Acidente', icon: Zap, color: 'text-warning' },
  unsafe_condition: { label: 'Condição Insegura', icon: ThermometerSun, color: 'text-orange-500' },
  unsafe_act: { label: 'Ato Inseguro', icon: Users, color: 'text-blue-500' }
};

export function SafetyCommandCenter() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate KPIs
  const kpis = useMemo(() => {
    const daysWithoutLTI = 127; // Lost Time Injury
    const totalIncidents = mockIncidents.filter(i => i.type === 'incident').length;
    const nearMisses = mockIncidents.filter(i => i.type === 'near_miss').length;
    const openItems = mockIncidents.filter(i => i.status !== 'resolved').length;
    const ddsToday = mockDDS.filter(d => d.date === '2024-06-15').length;
    const ddsCompliance = 85;
    const trainingCompliance = 78;
    const expiredTrainings = mockTrainings.filter(t => t.status === 'expired').length;

    return {
      daysWithoutLTI,
      totalIncidents,
      nearMisses,
      openItems,
      ddsToday,
      ddsCompliance,
      trainingCompliance,
      expiredTrainings,
      trir: 0.45,
      trirTarget: 0.50
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* LTI Counter Banner */}
      <Card className="bg-gradient-to-r from-success/10 via-success/5 to-transparent border-success/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
                <Shield className="h-10 w-10 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dias sem LTI (Lesão com Afastamento)</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold text-success">{kpis.daysWithoutLTI}</span>
                  <span className="text-lg text-muted-foreground">dias</span>
                </div>
                <p className="text-sm text-success mt-1">Meta: 365 dias • Progresso: {Math.round((kpis.daysWithoutLTI / 365) * 100)}%</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center px-6 border-l">
                <p className="text-3xl font-bold">{kpis.trir}</p>
                <p className="text-sm text-muted-foreground">TRIR Atual</p>
              </div>
              <div className="text-center px-6 border-l">
                <p className="text-3xl font-bold text-muted-foreground">{kpis.trirTarget}</p>
                <p className="text-sm text-muted-foreground">Meta TRIR</p>
              </div>
            </div>
          </div>
          <Progress value={(kpis.daysWithoutLTI / 365) * 100} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className={kpis.openItems > 0 ? 'border-warning/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Itens Abertos</p>
                <p className="text-2xl font-bold">{kpis.openItems}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Incidentes YTD</p>
                <p className="text-2xl font-bold">{kpis.totalIncidents}</p>
              </div>
              <Activity className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Near Misses</p>
                <p className="text-2xl font-bold">{kpis.nearMisses}</p>
              </div>
              <Zap className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">DDS Hoje</p>
                <p className="text-2xl font-bold">{kpis.ddsToday}</p>
              </div>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">DDS Compliance</p>
                <p className="text-2xl font-bold">{kpis.ddsCompliance}%</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.expiredTrainings > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Trein. Vencidos</p>
                <p className="text-2xl font-bold text-destructive">{kpis.expiredTrainings}</p>
              </div>
              <BookOpen className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="incidents" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ocorrências
            </TabsTrigger>
            <TabsTrigger value="dds" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              DDS
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Treinamentos
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="h-4 w-4" />
              IA Preditiva
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Reportar
            </Button>
          </div>
        </div>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Incidents */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Ocorrências Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockIncidents.map(incident => {
                    const TypeIcon = typeConfig[incident.type].icon;
                    return (
                      <div key={incident.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg bg-muted ${typeConfig[incident.type].color}`}>
                              <TypeIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{incident.title}</p>
                              <p className="text-sm text-muted-foreground">{incident.vessel} • {incident.location}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(incident.date), 'dd/MM/yyyy')} • {incident.reporter}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={severityConfig[incident.severity].color}>
                              {severityConfig[incident.severity].label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig[incident.status].color}>
                              {statusConfig[incident.status].label}
                            </Badge>
                          </div>
                        </div>
                        {incident.correctiveActions > 0 && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {incident.correctiveActions} ação(ões) corretiva(s)
                            </span>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* DDS Today */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  DDS de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDDS.filter(d => d.date === '2024-06-15').map(dds => (
                    <div key={dds.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{dds.topic}</Badge>
                        <span className="text-xs text-muted-foreground">{dds.duration} min</span>
                      </div>
                      <p className="text-sm font-medium">{dds.vessel}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{dds.conductor}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {dds.participants}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full mt-2" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar DDS
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Incidents Tab */}
        <TabsContent value="incidents" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-medium">Tipo</th>
                      <th className="text-left p-4 font-medium">Descrição</th>
                      <th className="text-left p-4 font-medium">Embarcação</th>
                      <th className="text-left p-4 font-medium">Data</th>
                      <th className="text-left p-4 font-medium">Severidade</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockIncidents.map(incident => {
                      const TypeIcon = typeConfig[incident.type].icon;
                      return (
                        <motion.tr 
                          key={incident.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-accent/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`h-4 w-4 ${typeConfig[incident.type].color}`} />
                              <span className="text-sm">{typeConfig[incident.type].label}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-sm">{incident.title}</p>
                            <p className="text-xs text-muted-foreground">{incident.location}</p>
                          </td>
                          <td className="p-4 text-sm">{incident.vessel}</td>
                          <td className="p-4 text-sm">{format(new Date(incident.date), 'dd/MM/yyyy')}</td>
                          <td className="p-4">
                            <Badge className={severityConfig[incident.severity].color}>
                              {severityConfig[incident.severity].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={statusConfig[incident.status].color}>
                              {statusConfig[incident.status].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DDS Tab */}
        <TabsContent value="dds" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de DDS</CardTitle>
                <CardDescription>Diálogos Diários de Segurança</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {mockDDS.map(dds => (
                      <div key={dds.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{dds.topic}</Badge>
                          <span className="text-sm">{format(new Date(dds.date), 'dd/MM/yyyy')}</span>
                        </div>
                        <p className="font-medium">{dds.vessel}</p>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>Condutor: {dds.conductor}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {dds.participants} participantes
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Duração: {dds.duration} minutos
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance por Embarcação</CardTitle>
                <CardDescription>Taxa de realização de DDS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['MV Atlantic Pioneer', 'MV Pacific Star', 'MV Ocean Voyager'].map((vessel, idx) => {
                    const compliance = [92, 78, 85][idx];
                    return (
                      <div key={vessel} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{vessel}</span>
                          <span className={`font-bold ${compliance >= 80 ? 'text-success' : 'text-warning'}`}>
                            {compliance}%
                          </span>
                        </div>
                        <Progress value={compliance} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Training Tab */}
        <TabsContent value="training" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockTrainings.map(training => {
              const statusColors = {
                completed: 'border-success/50 bg-success/5',
                'in-progress': 'border-warning/50 bg-warning/5',
                expired: 'border-destructive/50 bg-destructive/5',
                scheduled: 'border-muted'
              };
              
              return (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`${statusColors[training.status]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline">{training.type}</Badge>
                        <Badge className={
                          training.status === 'completed' ? 'bg-success/20 text-success' :
                          training.status === 'expired' ? 'bg-destructive/20 text-destructive' :
                          training.status === 'in-progress' ? 'bg-warning/20 text-warning' :
                          'bg-muted text-muted-foreground'
                        }>
                          {training.status === 'completed' ? 'Concluído' :
                           training.status === 'expired' ? 'Vencido' :
                           training.status === 'in-progress' ? 'Em Progresso' : 'Agendado'}
                        </Badge>
                      </div>
                      <h3 className="font-bold">{training.name}</h3>
                      <p className="text-sm text-muted-foreground">{training.crewMember}</p>
                      <p className="text-xs text-muted-foreground">{training.vessel}</p>
                      
                      {training.score !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span>{training.score}%</span>
                          </div>
                          <Progress value={training.score} className="h-2" />
                        </div>
                      )}
                      
                      {training.expiryDate && (
                        <p className="text-xs text-muted-foreground mt-3">
                          {training.status === 'expired' ? 'Venceu' : 'Vence'} em {format(new Date(training.expiryDate), 'dd/MM/yyyy')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* AI Tab */}
        <TabsContent value="ai" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Análise Preditiva de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      <span className="font-medium">Risco Elevado Detectado</span>
                    </div>
                    <p className="text-sm">
                      Padrão identificado: 3 near misses relacionados a trabalho em altura 
                      nos últimos 30 dias. Risco de incidente: 45%
                    </p>
                    <Button size="sm" className="mt-3">Implementar Medidas</Button>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ThermometerSun className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Condição de Risco</span>
                    </div>
                    <p className="text-sm">
                      MV Pacific Star: Corrimão danificado reportado há 3 dias. 
                      Histórico indica risco de queda se não reparado em 48h.
                    </p>
                    <Button size="sm" variant="outline" className="mt-3">Priorizar Reparo</Button>
                  </div>

                  <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-success" />
                      <span className="font-medium">Tendência Positiva</span>
                    </div>
                    <p className="text-sm">
                      Compliance de DDS aumentou 12% este mês. 
                      Continue incentivando a participação da tripulação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Recomendações da IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { priority: 'high', title: 'Treinamento de Altura', desc: 'Reforçar procedimentos de trabalho em altura', action: 'Agendar' },
                    { priority: 'high', title: 'Inspeção de EPI', desc: 'Verificar condição dos equipamentos de proteção', action: 'Iniciar' },
                    { priority: 'medium', title: 'Atualizar JSA', desc: 'Revisar análise de segurança do trabalho', action: 'Revisar' },
                    { priority: 'low', title: 'Campanha de Conscientização', desc: 'Promover cultura de segurança', action: 'Planejar' }
                  ].map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          rec.priority === 'high' ? 'bg-destructive' : 
                          rec.priority === 'medium' ? 'bg-warning' : 'bg-muted-foreground'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{rec.title}</p>
                          <p className="text-xs text-muted-foreground">{rec.desc}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">{rec.action}</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SafetyCommandCenter;
