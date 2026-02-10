/**
 * Crew Scheduling Dashboard - Centro de Gestão de Escalas Premium
 * Planejamento e gestão de rotação de tripulação
 */

import { useState, useMemo, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { 
  Users, 
  Calendar as CalendarIcon,
  Ship,
  Plane,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Sparkles,
  UserPlus,
  RefreshCw,
  FileText,
  MapPin,
  Timer,
  Briefcase,
  UserCheck,
  UserX
} from 'lucide-react';
import { format, addDays, differenceInDays, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  status: 'onboard' | 'onleave' | 'standby' | 'training';
  embarkDate: string;
  disembarkDate: string;
  daysOnboard: number;
  maxDays: number;
  nationality: string;
  certificates: { valid: number; expiring: number; expired: number };
  nextAssignment?: string;
}

interface Rotation {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  rank: string;
  type: 'embark' | 'disembark' | 'transfer';
  vessel: string;
  date: string;
  port: string;
  flightBooked: boolean;
  visaStatus: 'approved' | 'pending' | 'required';
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ManningLevel {
  vessel: string;
  totalRequired: number;
  current: number;
  officers: { required: number; current: number };
  ratings: { required: number; current: number };
  status: 'optimal' | 'warning' | 'critical';
}

// Fallback data
const fallbackCrew: CrewMember[] = [
  { id: '1', name: 'João Silva', rank: 'Master', department: 'Deck', vessel: 'MV Atlantic Pioneer', status: 'onboard', embarkDate: '2024-04-01', disembarkDate: '2024-07-01', daysOnboard: 75, maxDays: 120, nationality: 'Brazil', certificates: { valid: 8, expiring: 1, expired: 0 } },
  { id: '2', name: 'Maria Santos', rank: 'Chief Engineer', department: 'Engine', vessel: 'MV Pacific Star', status: 'onboard', embarkDate: '2024-03-15', disembarkDate: '2024-06-25', daysOnboard: 92, maxDays: 120, nationality: 'Portugal', certificates: { valid: 10, expiring: 0, expired: 0 } },
  { id: '3', name: 'Pedro Costa', rank: '2nd Officer', department: 'Deck', vessel: 'MV Ocean Voyager', status: 'onboard', embarkDate: '2024-05-01', disembarkDate: '2024-08-01', daysOnboard: 45, maxDays: 120, nationality: 'Brazil', certificates: { valid: 6, expiring: 2, expired: 0 } },
  { id: '4', name: 'Ana Rocha', rank: '3rd Engineer', department: 'Engine', vessel: 'MV Atlantic Pioneer', status: 'onleave', embarkDate: '2024-07-15', disembarkDate: '2024-10-15', daysOnboard: 0, maxDays: 120, nationality: 'Brazil', certificates: { valid: 7, expiring: 0, expired: 1 }, nextAssignment: 'MV Northern Spirit' },
  { id: '5', name: 'Carlos Lima', rank: 'AB Seaman', department: 'Deck', vessel: 'MV Pacific Star', status: 'standby', embarkDate: '-', disembarkDate: '-', daysOnboard: 0, maxDays: 180, nationality: 'Philippines', certificates: { valid: 5, expiring: 1, expired: 0 } },
  { id: '6', name: 'Roberto Alves', rank: 'Bosun', department: 'Deck', vessel: 'MV Ocean Voyager', status: 'training', embarkDate: '2024-07-01', disembarkDate: '2024-10-01', daysOnboard: 0, maxDays: 150, nationality: 'Brazil', certificates: { valid: 6, expiring: 0, expired: 0 } }
];

const fallbackRotations: Rotation[] = [
  { id: '1', crewMemberId: '2', crewMemberName: 'Maria Santos', rank: 'Chief Engineer', type: 'disembark', vessel: 'MV Pacific Star', date: '2024-06-25', port: 'Rotterdam', flightBooked: true, visaStatus: 'approved', status: 'confirmed' },
  { id: '2', crewMemberId: '4', crewMemberName: 'Ana Rocha', rank: '3rd Engineer', type: 'embark', vessel: 'MV Northern Spirit', date: '2024-07-15', port: 'Singapore', flightBooked: false, visaStatus: 'pending', status: 'pending' },
  { id: '3', crewMemberId: '1', crewMemberName: 'João Silva', rank: 'Master', type: 'disembark', vessel: 'MV Atlantic Pioneer', date: '2024-07-01', port: 'Santos', flightBooked: true, visaStatus: 'approved', status: 'confirmed' },
  { id: '4', crewMemberId: '6', crewMemberName: 'Roberto Alves', rank: 'Bosun', type: 'embark', vessel: 'MV Ocean Voyager', date: '2024-07-01', port: 'Rio de Janeiro', flightBooked: true, visaStatus: 'approved', status: 'confirmed' }
];

const fallbackManning: ManningLevel[] = [
  { vessel: 'MV Atlantic Pioneer', totalRequired: 22, current: 21, officers: { required: 8, current: 8 }, ratings: { required: 14, current: 13 }, status: 'warning' },
  { vessel: 'MV Pacific Star', totalRequired: 20, current: 20, officers: { required: 7, current: 7 }, ratings: { required: 13, current: 13 }, status: 'optimal' },
  { vessel: 'MV Ocean Voyager', totalRequired: 18, current: 15, officers: { required: 6, current: 5 }, ratings: { required: 12, current: 10 }, status: 'critical' },
  { vessel: 'MV Northern Spirit', totalRequired: 18, current: 8, officers: { required: 6, current: 3 }, ratings: { required: 12, current: 5 }, status: 'critical' }
];

const statusConfig = {
  onboard: { label: 'A Bordo', color: 'bg-success/20 text-success', icon: Ship },
  onleave: { label: 'Licença', color: 'bg-blue-500/20 text-blue-600', icon: Plane },
  standby: { label: 'Standby', color: 'bg-warning/20 text-warning', icon: Clock },
  training: { label: 'Treinamento', color: 'bg-purple-500/20 text-purple-600', icon: Briefcase }
};

const manningStatusConfig = {
  optimal: { label: 'Ótimo', color: 'bg-success/10 border-success/30 text-success' },
  warning: { label: 'Atenção', color: 'bg-warning/10 border-warning/30 text-warning' },
  critical: { label: 'Crítico', color: 'bg-destructive/10 border-destructive/30 text-destructive' }
};

export function CrewSchedulingDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [crewData, setCrewData] = useState<CrewMember[]>(fallbackCrew);
  const [rotationsData] = useState<Rotation[]>(fallbackRotations);
  const [manningData] = useState<ManningLevel[]>(fallbackManning);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("crew_members")
          .select("id, full_name, rank, department, status, nationality")
          .limit(50);

        if (data && data.length > 0) {
          setCrewData(data.map((c: any) => ({
            id: c.id,
            name: c.full_name || "N/A",
            rank: c.rank || "AB",
            department: c.department || "Deck",
            vessel: "N/A",
            status: (c.status === "active" ? "onboard" : "onleave") as CrewMember["status"],
            embarkDate: "-",
            disembarkDate: "-",
            daysOnboard: 0,
            maxDays: 120,
            nationality: c.nationality || "N/A",
            certificates: { valid: 5, expiring: 0, expired: 0 }
          })));
        }
      } catch { /* keep fallback */ }
    };
    load();
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const onboard = crewData.filter(c => c.status === 'onboard').length;
    const onleave = crewData.filter(c => c.status === 'onleave').length;
    const standby = crewData.filter(c => c.status === 'standby').length;
    const training = crewData.filter(c => c.status === 'training').length;
    
    const upcomingRotations = rotationsData.filter(r => 
      isAfter(new Date(r.date), new Date()) && 
      differenceInDays(new Date(r.date), new Date()) <= 30
    ).length;
    
    const pendingVisas = rotationsData.filter(r => r.visaStatus !== 'approved').length;
    const pendingFlights = rotationsData.filter(r => !r.flightBooked).length;
    
    const criticalManning = manningData.filter(m => m.status === 'critical').length;
    
    const avgDaysOnboard = onboard > 0 ? crewData.filter(c => c.status === 'onboard')
      .reduce((acc, c) => acc + c.daysOnboard, 0) / onboard : 0;

    return {
      totalCrew: crewData.length,
      onboard,
      onleave,
      standby,
      training,
      upcomingRotations,
      pendingVisas,
      pendingFlights,
      criticalManning,
      avgDaysOnboard: Math.round(avgDaysOnboard)
    };
  }, [crewData, rotationsData, manningData]);

  const filteredCrew = crewData.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.vessel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="col-span-2 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tripulantes</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{kpis.totalCrew}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.onboard} a bordo • {kpis.standby} standby
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">A Bordo</p>
                <p className="text-2xl font-bold text-success">{kpis.onboard}</p>
              </div>
              <Ship className="h-5 w-5 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rotações (30d)</p>
                <p className="text-2xl font-bold">{kpis.upcomingRotations}</p>
              </div>
              <RefreshCw className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.pendingVisas > 0 ? 'border-warning/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vistos Pendentes</p>
                <p className="text-2xl font-bold text-warning">{kpis.pendingVisas}</p>
              </div>
              <FileText className="h-5 w-5 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.criticalManning > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Manning Crítico</p>
                <p className="text-2xl font-bold text-destructive">{kpis.criticalManning}</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="crew" className="gap-2">
              <Users className="h-4 w-4" />
              Tripulação
            </TabsTrigger>
            <TabsTrigger value="rotations" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Rotações
            </TabsTrigger>
            <TabsTrigger value="manning" className="gap-2">
              <Ship className="h-4 w-4" />
              Manning
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendário
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar tripulante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[200px]"
            />
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Nova Rotação
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Próximas Rotações */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Próximas Rotações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rotationsData.map(rotation => (
                    <div key={rotation.id} className="p-4 border rounded-lg hover:bg-accent/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            rotation.type === 'embark' ? 'bg-success/20' : 
                            rotation.type === 'disembark' ? 'bg-blue-500/20' : 'bg-warning/20'
                          }`}>
                            {rotation.type === 'embark' ? (
                              <UserCheck className="h-5 w-5 text-success" />
                            ) : rotation.type === 'disembark' ? (
                              <UserX className="h-5 w-5 text-blue-500" />
                            ) : (
                              <RefreshCw className="h-5 w-5 text-warning" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold">{rotation.crewMemberName}</h3>
                            <p className="text-sm text-muted-foreground">{rotation.rank}</p>
                            <p className="text-sm mt-1">
                              {rotation.type === 'embark' ? 'Embarque' : rotation.type === 'disembark' ? 'Desembarque' : 'Transferência'}
                              {' '} - {rotation.vessel}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{format(new Date(rotation.date), 'dd/MM/yyyy')}</p>
                          <p className="text-sm text-muted-foreground">{rotation.port}</p>
                          <div className="flex gap-1 mt-2">
                            <Badge variant={rotation.flightBooked ? 'default' : 'destructive'} className="text-xs">
                              {rotation.flightBooked ? '✈️ Voo OK' : '✈️ Pendente'}
                            </Badge>
                            <Badge variant={rotation.visaStatus === 'approved' ? 'default' : 'secondary'} className="text-xs">
                              {rotation.visaStatus === 'approved' ? '📄 Visto OK' : '📄 Pendente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Status da Tripulação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Status da Tripulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusConfig).map(([key, config]) => {
                    const count = crewData.filter(c => c.status === key).length;
                    const percentage = Math.round((count / (crewData.length || 1)) * 100);
                    const StatusIcon = config.icon;
                    
                    return (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className="font-medium">{config.label}</span>
                          </div>
                          <span className="text-sm font-bold">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Média dias a bordo</p>
                    <p className="text-3xl font-bold text-primary">{kpis.avgDaysOnboard}</p>
                    <p className="text-xs text-muted-foreground">dias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Crew Tab */}
        <TabsContent value="crew" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-4 font-medium">Tripulante</th>
                      <th className="text-left p-4 font-medium">Cargo</th>
                      <th className="text-left p-4 font-medium">Embarcação</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Dias a Bordo</th>
                      <th className="text-left p-4 font-medium">Certificados</th>
                      <th className="text-left p-4 font-medium">Desembarque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrew.map(crew => {
                      const StatusIcon = statusConfig[crew.status].icon;
                      const daysProgress = (crew.daysOnboard / crew.maxDays) * 100;
                      
                      return (
                        <motion.tr
                          key={crew.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-accent/30 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{crew.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{crew.name}</p>
                                <p className="text-xs text-muted-foreground">{crew.nationality}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{crew.rank}</p>
                            <p className="text-xs text-muted-foreground">{crew.department}</p>
                          </td>
                          <td className="p-4 text-sm">{crew.vessel}</td>
                          <td className="p-4">
                            <Badge className={statusConfig[crew.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[crew.status].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {crew.status === 'onboard' ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Progress value={daysProgress} className="w-16 h-2" />
                                  <span className="text-sm">{crew.daysOnboard}/{crew.maxDays}</span>
                                </div>
                                {daysProgress > 80 && (
                                  <p className="text-xs text-warning">Rotação próxima</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-success/10 text-success text-xs">{crew.certificates.valid}</Badge>
                              {crew.certificates.expiring > 0 && (
                                <Badge variant="outline" className="bg-warning/10 text-warning text-xs">{crew.certificates.expiring}</Badge>
                              )}
                              {crew.certificates.expired > 0 && (
                                <Badge variant="outline" className="bg-destructive/10 text-destructive text-xs">{crew.certificates.expired}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            {crew.disembarkDate !== '-' ? format(new Date(crew.disembarkDate), 'dd/MM/yyyy') : '-'}
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

        {/* Rotations Tab */}
        <TabsContent value="rotations" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Embarques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <UserCheck className="h-5 w-5" />
                  Embarques Programados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rotationsData.filter(r => r.type === 'embark').map(rotation => (
                    <div key={rotation.id} className="p-4 border rounded-lg border-success/20 bg-success/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rotation.crewMemberName}</span>
                        <Badge variant="outline">{format(new Date(rotation.date), 'dd/MM')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rotation.rank}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Ship className="h-4 w-4" />
                        <span>{rotation.vessel}</span>
                        <MapPin className="h-4 w-4 ml-2" />
                        <span>{rotation.port}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={rotation.flightBooked ? 'default' : 'destructive'}>
                          {rotation.flightBooked ? 'Voo Reservado' : 'Voo Pendente'}
                        </Badge>
                        <Badge variant={rotation.visaStatus === 'approved' ? 'default' : 'secondary'}>
                          {rotation.visaStatus === 'approved' ? 'Visto OK' : 'Visto Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Desembarques */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-500">
                  <UserX className="h-5 w-5" />
                  Desembarques Programados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rotationsData.filter(r => r.type === 'disembark').map(rotation => (
                    <div key={rotation.id} className="p-4 border rounded-lg border-blue-500/20 bg-blue-500/5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{rotation.crewMemberName}</span>
                        <Badge variant="outline">{format(new Date(rotation.date), 'dd/MM')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rotation.rank}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <Ship className="h-4 w-4" />
                        <span>{rotation.vessel}</span>
                        <MapPin className="h-4 w-4 ml-2" />
                        <span>{rotation.port}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Badge variant={rotation.flightBooked ? 'default' : 'destructive'}>
                          {rotation.flightBooked ? 'Voo Reservado' : 'Voo Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Manning Tab */}
        <TabsContent value="manning" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manningData.map((manning: ManningLevel) => {
              const percentage = Math.round((manning.current / manning.totalRequired) * 100);
              const config = manningStatusConfig[manning.status as keyof typeof manningStatusConfig];
              
              return (
                <motion.div
                  key={manning.vessel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className={`border-2 ${config.color}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{manning.vessel}</h3>
                          <p className="text-sm text-muted-foreground">
                            {manning.current} / {manning.totalRequired} tripulantes
                          </p>
                        </div>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Lotação Geral</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-3" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold">{manning.officers.current}/{manning.officers.required}</p>
                          <p className="text-xs text-muted-foreground">Oficiais</p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg text-center">
                          <p className="text-2xl font-bold">{manning.ratings.current}/{manning.ratings.required}</p>
                          <p className="text-xs text-muted-foreground">Praças</p>
                        </div>
                      </div>

                      {manning.status !== 'optimal' && (
                        <Button className="w-full mt-4" variant={manning.status === 'critical' ? 'destructive' : 'outline'}>
                          <UserPlus className="h-4 w-4 mr-2" />
                          {manning.status === 'critical' ? 'Alocar Tripulação Urgente' : 'Planejar Alocação'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendário de Rotações</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Eventos em {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecione uma data'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rotationsData.map(rotation => (
                    <div key={rotation.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            rotation.type === 'embark' ? 'bg-success/20' : 'bg-blue-500/20'
                          }`}>
                            {rotation.type === 'embark' ? (
                              <UserCheck className="h-5 w-5 text-success" />
                            ) : (
                              <UserX className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{rotation.crewMemberName}</p>
                            <p className="text-sm text-muted-foreground">
                              {rotation.type === 'embark' ? 'Embarque' : 'Desembarque'} - {rotation.vessel}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{format(new Date(rotation.date), 'dd/MM')}</p>
                          <p className="text-sm text-muted-foreground">{rotation.port}</p>
                        </div>
                      </div>
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

export default CrewSchedulingDashboard;
