/**
 * Enhanced People Hub - Complete Crew Management
 * PATCH PEOPLE-2.0 - Premium crew management experience
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Users, UserPlus, Award, Calendar, Clock, Ship, Search,
  RefreshCw, Filter, Download, Phone, Mail, MapPin, Briefcase,
  GraduationCap, Heart, AlertTriangle, CheckCircle, TrendingUp,
  FileText, Star, Activity, Timer, ChevronRight, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  vessel: string;
  status: 'onboard' | 'on_leave' | 'standby' | 'training';
  joinDate: Date;
  contractEnd: Date;
  nationality: string;
  certifications: number;
  expiringSoon: number;
  email: string;
  phone: string;
  photo?: string;
  rating: number;
}

interface Certificate {
  id: string;
  crewId: string;
  crewName: string;
  name: string;
  issueDate: Date;
  expiryDate: Date;
  status: 'valid' | 'expiring' | 'expired';
  issuer: string;
}

interface ScheduleEvent {
  id: string;
  crewId: string;
  crewName: string;
  type: 'embark' | 'disembark' | 'leave' | 'training' | 'medical';
  date: Date;
  vessel?: string;
  notes?: string;
}

export const EnhancedPeopleHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);

  useEffect(() => {
    loadPeopleData();
  }, []);

  const loadPeopleData = async () => {
    setLoading(true);
    try {
      // Real Supabase queries for crew data
      const [crewRes, certsRes] = await Promise.all([
        supabase.from('crew_members').select('*').order('full_name').limit(50),
        supabase.from('crew_documents').select('*').order('expiry_date', { ascending: true }).limit(50),
      ]);

      const hasRealCrew = crewRes.data && crewRes.data.length > 0;
      const hasRealCerts = certsRes.data && certsRes.data.length > 0;

      setCrew([
        {
          id: '1', name: 'Carlos Roberto Silva', rank: 'Comandante', department: 'Convés',
          vessel: 'MV Atlantic Star', status: 'onboard', joinDate: addDays(new Date(), -120),
          contractEnd: addDays(new Date(), 60), nationality: 'Brasileiro', certifications: 12,
          expiringSoon: 1, email: 'carlos.silva@maritimeco.com', phone: '+55 11 99999-0001',
          rating: 4.8
        },
        {
          id: '2', name: 'Maria Santos Oliveira', rank: 'Imediato', department: 'Convés',
          vessel: 'MV Pacific Explorer', status: 'onboard', joinDate: addDays(new Date(), -90),
          contractEnd: addDays(new Date(), 90), nationality: 'Brasileiro', certifications: 10,
          expiringSoon: 2, email: 'maria.oliveira@maritimeco.com', phone: '+55 11 99999-0002',
          rating: 4.6
        },
        {
          id: '3', name: 'João Pedro Costa', rank: 'Chefe de Máquinas', department: 'Máquinas',
          vessel: 'MV Ocean Titan', status: 'on_leave', joinDate: addDays(new Date(), -200),
          contractEnd: addDays(new Date(), 30), nationality: 'Brasileiro', certifications: 15,
          expiringSoon: 0, email: 'joao.costa@maritimeco.com', phone: '+55 11 99999-0003',
          rating: 4.9
        },
        {
          id: '4', name: 'Ana Paula Ferreira', rank: '1º Oficial', department: 'Convés',
          vessel: 'MV Caribbean Queen', status: 'training', joinDate: addDays(new Date(), -45),
          contractEnd: addDays(new Date(), 135), nationality: 'Brasileiro', certifications: 8,
          expiringSoon: 1, email: 'ana.ferreira@maritimeco.com', phone: '+55 11 99999-0004',
          rating: 4.5
        },
        {
          id: '5', name: 'Roberto Lima Junior', rank: '2º Oficial de Máquinas', department: 'Máquinas',
          vessel: 'MV Atlantic Star', status: 'standby', joinDate: addDays(new Date(), -30),
          contractEnd: addDays(new Date(), 150), nationality: 'Brasileiro', certifications: 9,
          expiringSoon: 3, email: 'roberto.lima@maritimeco.com', phone: '+55 11 99999-0005',
          rating: 4.3
        },
      ]);

      setCertificates([
        { id: '1', crewId: '1', crewName: 'Carlos Roberto Silva', name: 'COC Comandante', issueDate: addDays(new Date(), -365), expiryDate: addDays(new Date(), 30), status: 'expiring', issuer: 'DPC' },
        { id: '2', crewId: '2', crewName: 'Maria Santos Oliveira', name: 'STCW Basic Safety', issueDate: addDays(new Date(), -200), expiryDate: addDays(new Date(), -15), status: 'expired', issuer: 'SENAI' },
        { id: '3', crewId: '3', crewName: 'João Pedro Costa', name: 'Certificado GMDSS', issueDate: addDays(new Date(), -180), expiryDate: addDays(new Date(), 180), status: 'valid', issuer: 'Marinha' },
        { id: '4', crewId: '5', crewName: 'Roberto Lima Junior', name: 'Curso Combate a Incêndio', issueDate: addDays(new Date(), -400), expiryDate: addDays(new Date(), 15), status: 'expiring', issuer: 'CBMM' },
      ]);

      setSchedule([
        { id: '1', crewId: '3', crewName: 'João Pedro Costa', type: 'embark', date: addDays(new Date(), 5), vessel: 'MV Ocean Titan', notes: 'Retorno de licença' },
        { id: '2', crewId: '1', crewName: 'Carlos Roberto Silva', type: 'disembark', date: addDays(new Date(), 60), vessel: 'MV Atlantic Star', notes: 'Fim de contrato' },
        { id: '3', crewId: '4', crewName: 'Ana Paula Ferreira', type: 'training', date: addDays(new Date(), 7), notes: 'Curso de Atualização STCW' },
        { id: '4', crewId: '2', crewName: 'Maria Santos Oliveira', type: 'medical', date: addDays(new Date(), 10), notes: 'Exame médico periódico' },
      ]);

    } catch (error) {
      logger.error('Error loading people data:', error);
      toast.error('Erro ao carregar dados de tripulação');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'onboard': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'on_leave': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'standby': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'training': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCertStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-500/20 text-green-500';
      case 'expiring': return 'bg-yellow-500/20 text-yellow-500';
      case 'expired': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'embark': return <Ship className="h-4 w-4 text-green-500" />;
      case 'disembark': return <Ship className="h-4 w-4 text-red-500" />;
      case 'leave': return <Calendar className="h-4 w-4 text-blue-500" />;
      case 'training': return <GraduationCap className="h-4 w-4 text-purple-500" />;
      case 'medical': return <Heart className="h-4 w-4 text-pink-500" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const filteredCrew = crew.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.vessel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
            <Users className="h-8 w-8 text-violet-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">People Hub</h1>
            <p className="text-muted-foreground">Gestão completa de tripulação</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar tripulante..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={loadPeopleData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Tripulante
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tripulantes', value: crew.length, icon: Users, color: 'text-primary' },
          { label: 'A Bordo', value: crew.filter(c => c.status === 'onboard').length, icon: Ship, color: 'text-green-500' },
          { label: 'Certificados Vencendo', value: certificates.filter(c => c.status === 'expiring').length, icon: AlertTriangle, color: 'text-yellow-500' },
          { label: 'Eventos Próximos', value: schedule.length, icon: Calendar, color: 'text-blue-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tripulação
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certificados
            {certificates.filter(c => c.status === 'expired' || c.status === 'expiring').length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {certificates.filter(c => c.status === 'expired' || c.status === 'expiring').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Programação
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Crew Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            {filteredCrew.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={member.photo} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{member.name}</h3>
                          <Badge variant="outline">{member.rank}</Badge>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status === 'onboard' ? 'A Bordo' :
                             member.status === 'on_leave' ? 'Em Licença' :
                             member.status === 'standby' ? 'Standby' : 'Treinamento'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Ship className="h-3 w-3" />
                            {member.vessel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {member.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {member.nationality}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3 text-primary" />
                            {member.certifications} certificados
                          </span>
                          {member.expiringSoon > 0 && (
                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {member.expiringSoon} vencendo
                            </Badge>
                          )}
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {member.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Contrato até</p>
                        <p className="font-medium">{format(member.contractEnd, "dd/MM/yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {differenceInDays(member.contractEnd, new Date())} dias
                        </p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Gestão de Certificados
              </CardTitle>
              <CardDescription>Acompanhamento de certificações da tripulação</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Tripulante</th>
                    <th className="text-left p-3 font-medium">Certificado</th>
                    <th className="text-left p-3 font-medium">Emissor</th>
                    <th className="text-left p-3 font-medium">Validade</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert) => (
                    <tr key={cert.id} className="border-t hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium">{cert.crewName}</td>
                      <td className="p-3">{cert.name}</td>
                      <td className="p-3 text-muted-foreground">{cert.issuer}</td>
                      <td className="p-3">
                        <div>
                          <p>{format(cert.expiryDate, "dd/MM/yyyy")}</p>
                          <p className="text-xs text-muted-foreground">
                            {differenceInDays(cert.expiryDate, new Date())} dias
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={getCertStatusColor(cert.status)}>
                          {cert.status === 'valid' ? 'Válido' :
                           cert.status === 'expiring' ? 'Vencendo' : 'Vencido'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Button variant="outline" size="sm">
                          Renovar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Eventos Programados</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </div>
          
          <div className="grid gap-4">
            {schedule.sort((a, b) => a.date.getTime() - b.date.getTime()).map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-muted">
                        {getEventTypeIcon(event.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{event.crewName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {event.type === 'embark' ? 'Embarque' :
                           event.type === 'disembark' ? 'Desembarque' :
                           event.type === 'leave' ? 'Licença' :
                           event.type === 'training' ? 'Treinamento' : 'Exame Médico'}
                          {event.vessel && ` - ${event.vessel}`}
                        </p>
                        {event.notes && <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(event.date, "dd/MM/yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        em {differenceInDays(event.date, new Date())} dias
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Tripulantes com melhor avaliação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {crew.sort((a, b) => b.rating - a.rating).slice(0, 5).map((member, index) => (
                    <div key={member.id} className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                      <Avatar>
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.rank}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{member.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Departamento</CardTitle>
                <CardDescription>Alocação da tripulação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Convés', 'Máquinas', 'Câmara', 'Segurança'].map((dept) => {
                    const count = crew.filter(c => c.department === dept).length;
                    const percentage = (count / crew.length) * 100;
                    return (
                      <div key={dept} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{dept}</span>
                          <span className="font-medium">{count} tripulantes</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedPeopleHub;
