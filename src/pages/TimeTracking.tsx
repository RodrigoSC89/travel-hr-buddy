/**
 * TimeTracking - Página de Controle de Ponto MVP
 * Dashboard completo para RH + Widget para colaboradores
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Clock,
  Users,
  Timer,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Coffee,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  MapPin,
  TrendingUp,
  FileText,
  LogIn
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ClockInWidget } from '@/components/hr/ClockInWidget';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';

const TimeTracking: React.FC = () => {
  const { records, stats, isLoading, loadRecords } = useTimeTracking();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Normal</Badge>;
      case 'late':
        return <Badge className="bg-warning text-warning-foreground"><AlertTriangle className="w-3 h-3 mr-1" />Atraso</Badge>;
      case 'absent':
        return <Badge className="bg-destructive text-destructive-foreground"><XCircle className="w-3 h-3 mr-1" />Falta</Badge>;
      case 'vacation':
        return <Badge className="bg-info text-info-foreground"><Sun className="w-3 h-3 mr-1" />Férias</Badge>;
      case 'off':
        return <Badge variant="secondary"><Coffee className="w-3 h-3 mr-1" />Folga</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'todos' || record.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
      <Helmet>
        <title>Controle de Ponto | Nautilus One</title>
        <meta name="description" content="Controle de ponto digital com geolocalização para gestão de tripulação marítima." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-8 w-8 text-primary" />
              Controle de Ponto
            </h1>
            <p className="text-muted-foreground">
              Registro de frequência com geolocalização e banco de horas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadRecords()}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.presentToday}</p>
                  <p className="text-sm text-muted-foreground">Presentes Hoje</p>
                </div>
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.lateToday}</p>
                  <p className="text-sm text-muted-foreground">Atrasos</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-info/10 to-info/5 border-info/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.onVacation}</p>
                  <p className="text-sm text-muted-foreground">Em Férias</p>
                </div>
                <Sun className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {stats.totalBankHours >= 0 ? '+' : ''}{stats.totalBankHours.toFixed(1)}h
                  </p>
                  <p className="text-sm text-muted-foreground">Banco de Horas</p>
                </div>
                <Timer className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border p-1">
            <TabsTrigger value="dashboard" className="gap-2">
              <Users className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="registros" className="gap-2">
              <Clock className="w-4 h-4" />
              Registros
            </TabsTrigger>
            <TabsTrigger value="banco" className="gap-2">
              <Timer className="w-4 h-4" />
              Banco de Horas
            </TabsTrigger>
            <TabsTrigger value="meu-ponto" className="gap-2">
              <LogIn className="w-4 h-4" />
              Meu Ponto
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Widget de Ponto (para teste) */}
              <ClockInWidget />

              {/* Calendário */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Calendário</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        loadRecords(date.toISOString().split('T')[0]);
                      }
                    }}
                    className="rounded-md"
                  />
                </CardContent>
              </Card>

              {/* Resumo do Dia */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resumo do Dia</CardTitle>
                  <CardDescription>
                    {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Turno Diurno (06h-14h)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {filteredRecords.filter(r => r.clock_in).length} colaboradores
                    </p>
                  </div>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="font-medium">Turno Vespertino (14h-22h)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">0 colaboradores</p>
                  </div>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Moon className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Turno Noturno (22h-06h)</span>
                    </div>
                    <p className="text-sm text-muted-foreground">0 colaboradores</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Registros Tab */}
          <TabsContent value="registros" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Buscar colaborador..." 
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="normal">Presentes</SelectItem>
                    <SelectItem value="late">Atrasos</SelectItem>
                    <SelectItem value="absent">Faltas</SelectItem>
                    <SelectItem value="vacation">Férias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => loadRecords()}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Registros de Ponto</CardTitle>
                <CardDescription>
                  {selectedDate?.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando registros...
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado para esta data.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">Colaborador</th>
                          <th className="text-center p-3 text-sm font-medium">Entrada</th>
                          <th className="text-center p-3 text-sm font-medium">Almoço</th>
                          <th className="text-center p-3 text-sm font-medium">Retorno</th>
                          <th className="text-center p-3 text-sm font-medium">Saída</th>
                          <th className="text-center p-3 text-sm font-medium">Local</th>
                          <th className="text-center p-3 text-sm font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {record.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{record.employee_name}</span>
                              </div>
                            </td>
                            <td className="text-center p-3 text-sm">
                              {record.clock_in || <span className="text-muted-foreground">--:--</span>}
                            </td>
                            <td className="text-center p-3 text-sm">
                              {record.lunch_out || <span className="text-muted-foreground">--:--</span>}
                            </td>
                            <td className="text-center p-3 text-sm">
                              {record.lunch_in || <span className="text-muted-foreground">--:--</span>}
                            </td>
                            <td className="text-center p-3 text-sm">
                              {record.clock_out || <span className="text-muted-foreground">--:--</span>}
                            </td>
                            <td className="text-center p-3">
                              {record.location_lat ? (
                                <Badge variant="outline" className="gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {record.is_remote ? 'Remoto' : 'Presencial'}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="text-center p-3">
                              {getStatusBadge(record.status)}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banco de Horas Tab */}
          <TabsContent value="banco" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Saldo de Banco de Horas</CardTitle>
                <CardDescription>Acompanhamento por colaborador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {records.map((record, index) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {record.employee_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{record.employee_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Horas trabalhadas: {record.worked_hours}h
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'text-2xl font-bold',
                          record.overtime_hours >= 0 ? 'text-green-500' : 'text-red-500'
                        )}>
                          {record.overtime_hours >= 0 ? '+' : ''}{record.overtime_hours}h
                        </div>
                        <TrendingUp className={cn(
                          'w-5 h-5',
                          record.overtime_hours >= 0 ? 'text-green-500' : 'text-red-500 rotate-180'
                        )} />
                      </div>
                    </motion.div>
                  ))}
                  
                  {records.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum registro de banco de horas encontrado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meu Ponto Tab */}
          <TabsContent value="meu-ponto" className="space-y-4">
            <div className="max-w-md mx-auto">
              <ClockInWidget />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default TimeTracking;
