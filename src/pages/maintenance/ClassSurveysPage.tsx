/**
 * Class Surveys Page - DNV GL / Lloyd's / ABS
 * Gestão de vistorias de classe marítima
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Shield, Calendar, FileText, AlertTriangle, CheckCircle2, 
  Clock, Ship, Plus, Search, Filter, Download, RefreshCw,
  CalendarDays, ClipboardCheck, ExternalLink, BarChart3
} from 'lucide-react';
import { format, addDays, differenceInDays, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Survey types and interfaces
interface Survey {
  id: string;
  vesselName: string;
  vesselIMO: string;
  surveyType: 'Annual' | 'Intermediate' | 'Special' | 'Renewal' | 'Bottom' | 'Drydock';
  classificationSociety: 'DNV' | 'Lloyd\'s' | 'ABS' | 'BV' | 'ClassNK' | 'RINA';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Pending';
  scheduledDate: Date;
  completedDate?: Date;
  findings: number;
  criticalFindings: number;
  inspector?: string;
  location?: string;
  certificates: string[];
  nextDueDate?: Date;
}

// Mock data for surveys
const mockSurveys: Survey[] = [
  {
    id: 'SRV-001',
    vesselName: 'Atlantic Pioneer',
    vesselIMO: '9876543',
    surveyType: 'Annual',
    classificationSociety: 'DNV',
    status: 'Scheduled',
    scheduledDate: addDays(new Date(), 15),
    findings: 0,
    criticalFindings: 0,
    certificates: ['Safety Construction', 'Safety Equipment', 'Load Line'],
    nextDueDate: addDays(new Date(), 380)
  },
  {
    id: 'SRV-002',
    vesselName: 'Pacific Voyager',
    vesselIMO: '8765432',
    surveyType: 'Intermediate',
    classificationSociety: 'Lloyd\'s',
    status: 'In Progress',
    scheduledDate: new Date(),
    findings: 3,
    criticalFindings: 0,
    inspector: 'James Morrison',
    location: 'Singapore',
    certificates: ['Class Maintenance', 'Statutory'],
    nextDueDate: addDays(new Date(), 900)
  },
  {
    id: 'SRV-003',
    vesselName: 'Northern Star',
    vesselIMO: '7654321',
    surveyType: 'Special',
    classificationSociety: 'ABS',
    status: 'Overdue',
    scheduledDate: addDays(new Date(), -10),
    findings: 5,
    criticalFindings: 2,
    certificates: ['Hull', 'Machinery'],
    nextDueDate: addDays(new Date(), -10)
  },
  {
    id: 'SRV-004',
    vesselName: 'Coral Queen',
    vesselIMO: '6543210',
    surveyType: 'Drydock',
    classificationSociety: 'DNV',
    status: 'Completed',
    scheduledDate: addDays(new Date(), -30),
    completedDate: addDays(new Date(), -25),
    findings: 8,
    criticalFindings: 1,
    inspector: 'Maria Santos',
    location: 'Rotterdam',
    certificates: ['Bottom Survey', 'Propeller Shaft'],
    nextDueDate: addDays(new Date(), 1800)
  },
  {
    id: 'SRV-005',
    vesselName: 'Ocean Explorer',
    vesselIMO: '5432109',
    surveyType: 'Renewal',
    classificationSociety: 'BV',
    status: 'Pending',
    scheduledDate: addDays(new Date(), 45),
    findings: 0,
    criticalFindings: 0,
    certificates: ['Class Certificate', 'Safety Radio'],
    nextDueDate: addDays(new Date(), 1825)
  }
];

// Survey statistics
const surveyStats = {
  total: mockSurveys.length,
  scheduled: mockSurveys.filter(s => s.status === 'Scheduled').length,
  inProgress: mockSurveys.filter(s => s.status === 'In Progress').length,
  completed: mockSurveys.filter(s => s.status === 'Completed').length,
  overdue: mockSurveys.filter(s => s.status === 'Overdue').length,
  complianceRate: 87
};

export default function ClassSurveysPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [surveys] = useState<Survey[]>(mockSurveys);

  const getStatusColor = (status: Survey['status']) => {
    switch (status) {
      case 'Scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'Pending': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: Survey['status']) => {
    switch (status) {
      case 'Scheduled': return <Calendar className="h-4 w-4" />;
      case 'In Progress': return <Clock className="h-4 w-4" />;
      case 'Completed': return <CheckCircle2 className="h-4 w-4" />;
      case 'Overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'Pending': return <FileText className="h-4 w-4" />;
      default: return null;
    }
  };

  const getDaysUntil = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (days < 0) return { text: `${Math.abs(days)} dias atrás`, urgent: true };
    if (days === 0) return { text: 'Hoje', urgent: true };
    if (days <= 7) return { text: `${days} dias`, urgent: true };
    if (days <= 30) return { text: `${days} dias`, urgent: false };
    return { text: `${days} dias`, urgent: false };
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.vesselIMO.includes(searchTerm) ||
                         survey.surveyType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'scheduled') return matchesSearch && survey.status === 'Scheduled';
    if (activeTab === 'in-progress') return matchesSearch && survey.status === 'In Progress';
    if (activeTab === 'overdue') return matchesSearch && (survey.status === 'Overdue' || survey.criticalFindings > 0);
    if (activeTab === 'completed') return matchesSearch && survey.status === 'Completed';
    return matchesSearch;
  });

  const handleScheduleSurvey = () => {
    toast({
      title: "Agendar Nova Vistoria",
      description: "Abrindo formulário de agendamento de vistoria de classe..."
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Atualizando",
      description: "Sincronizando dados com sociedades classificadoras..."
    });
  };

  const handleExport = () => {
    toast({
      title: "Exportando Relatório",
      description: "Gerando relatório de vistorias em PDF..."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Vistorias</p>
                <p className="text-2xl font-bold">{surveyStats.total}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-blue-500">{surveyStats.scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-500">{surveyStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className="text-2xl font-bold text-red-500">{surveyStats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conformidade</p>
                <p className="text-2xl font-bold text-green-500">{surveyStats.complianceRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={surveyStats.complianceRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por navio, IMO ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleScheduleSurvey}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Vistoria
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs and List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Vistorias de Classe
          </CardTitle>
          <CardDescription>
            Gerencie vistorias obrigatórias de sociedades classificadoras (DNV, Lloyd's, ABS, BV, ClassNK)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas ({surveys.length})</TabsTrigger>
              <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
              <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
              <TabsTrigger value="overdue" className="text-red-500">
                Críticas ({surveys.filter(s => s.status === 'Overdue' || s.criticalFindings > 0).length})
              </TabsTrigger>
              <TabsTrigger value="completed">Concluídas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-0">
              <div className="space-y-3">
                {filteredSurveys.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma vistoria encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tente ajustar os filtros ou agende uma nova vistoria
                    </p>
                    <Button className="mt-4" onClick={handleScheduleSurvey}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agendar Vistoria
                    </Button>
                  </div>
                ) : (
                  filteredSurveys.map((survey) => {
                    const daysInfo = getDaysUntil(survey.scheduledDate);
                    return (
                      <Card key={survey.id} className={`transition-colors hover:bg-muted/50 ${survey.status === 'Overdue' ? 'border-red-500/50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-muted rounded-lg">
                                <Ship className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{survey.vesselName}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    IMO {survey.vesselIMO}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {survey.surveyType} Survey • {survey.classificationSociety}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {survey.certificates.slice(0, 3).map((cert, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {cert}
                                    </Badge>
                                  ))}
                                  {survey.certificates.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{survey.certificates.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {format(survey.scheduledDate, "dd MMM yyyy", { locale: ptBR })}
                                  </span>
                                </div>
                                <span className={`text-xs ${daysInfo.urgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                                  {daysInfo.text}
                                </span>
                              </div>
                              
                              {(survey.findings > 0 || survey.criticalFindings > 0) && (
                                <div className="text-right">
                                  <p className="text-sm font-medium">{survey.findings} achados</p>
                                  {survey.criticalFindings > 0 && (
                                    <p className="text-xs text-red-500">
                                      {survey.criticalFindings} críticos
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              <Badge 
                                variant="outline" 
                                className={`gap-1 ${getStatusColor(survey.status)}`}
                              >
                                {getStatusIcon(survey.status)}
                                {survey.status}
                              </Badge>
                              
                              <Button variant="ghost" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Classification Societies */}
      <Card>
        <CardHeader>
          <CardTitle>Sociedades Classificadoras</CardTitle>
          <CardDescription>Status de integração com as principais sociedades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'DNV', status: 'connected', vessels: 12 },
              { name: "Lloyd's Register", status: 'connected', vessels: 8 },
              { name: 'ABS', status: 'connected', vessels: 5 },
              { name: 'Bureau Veritas', status: 'pending', vessels: 3 },
              { name: 'ClassNK', status: 'disconnected', vessels: 0 }
            ].map((society) => (
              <Card key={society.name} className="border-dashed">
                <CardContent className="pt-4 text-center">
                  <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                    society.status === 'connected' ? 'bg-green-500' :
                    society.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                  }`} />
                  <p className="font-medium text-sm">{society.name}</p>
                  <p className="text-xs text-muted-foreground">{society.vessels} navios</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
