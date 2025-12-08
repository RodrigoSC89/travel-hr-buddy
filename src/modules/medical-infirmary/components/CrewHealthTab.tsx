/**
 * Crew Health Management Tab
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Search, User, Heart, Syringe, AlertTriangle, 
  Calendar, FileText, Phone, CheckCircle2, Clock, Filter,
  Plus, Download, Brain
} from 'lucide-react';
import { mockCrewMembers } from '../data/mockData';
import { CrewMember } from '../types';
import { toast } from 'sonner';
import { useMedicalAI } from '../hooks/useMedicalAI';

export default function CrewHealthTab() {
  const { predictHealthIssues, isLoading } = useMedicalAI();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<any>(null);

  const filteredCrew = mockCrewMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    fit: mockCrewMembers.filter(m => m.status === 'fit').length,
    restricted: mockCrewMembers.filter(m => m.status === 'restricted').length,
    unfit: mockCrewMembers.filter(m => m.status === 'unfit').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fit': return <Badge className="bg-green-500/20 text-green-500">Apto</Badge>;
      case 'restricted': return <Badge className="bg-amber-500/20 text-amber-500">Restrição</Badge>;
      case 'unfit': return <Badge className="bg-red-500/20 text-red-500">Inapto</Badge>;
      default: return null;
    }
  };

  const getVaccinationStatus = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'expiring': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const handleAIAnalysis = async () => {
    const result = await predictHealthIssues(mockCrewMembers, []);
    if (result) {
      setAiPrediction(result);
      toast.success('Análise preditiva concluída');
    } else {
      toast.error('Erro na análise');
    }
  };

  const handleExport = () => {
    toast.success('Exportando fichas médicas...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tripulante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleAIAnalysis} disabled={isLoading}>
            <Brain className="h-4 w-4 mr-2" />
            Análise Preditiva
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ficha
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={statusFilter === null ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter(null)}
              >
                Todos ({mockCrewMembers.length})
              </Button>
              <Button 
                variant={statusFilter === 'fit' ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('fit')}
              >
                Aptos ({statusCounts.fit})
              </Button>
              <Button 
                variant={statusFilter === 'restricted' ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('restricted')}
              >
                Com Restrição ({statusCounts.restricted})
              </Button>
              <Button 
                variant={statusFilter === 'unfit' ? "default" : "outline"} 
                size="sm"
                onClick={() => setStatusFilter('unfit')}
              >
                Inaptos ({statusCounts.unfit})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Prediction Alert */}
      {aiPrediction && (
        <Card className={`border-l-4 ${
          aiPrediction.riskLevel === 'high' ? 'border-l-red-500 bg-red-500/5' :
          aiPrediction.riskLevel === 'medium' ? 'border-l-amber-500 bg-amber-500/5' :
          'border-l-green-500 bg-green-500/5'
        }`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Análise Preditiva de Saúde
              <Badge variant="outline">{Math.round(aiPrediction.confidence * 100)}% confiança</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Riscos Identificados:</p>
                <ul className="text-sm space-y-1">
                  {aiPrediction.predictedIssues?.length > 0 ? 
                    aiPrediction.predictedIssues.map((issue: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        {issue}
                      </li>
                    )) : 
                    <li className="text-muted-foreground">Nenhum risco crítico identificado</li>
                  }
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Recomendações:</p>
                <ul className="text-sm space-y-1">
                  {aiPrediction.recommendations?.slice(0, 3).map((rec: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockCrewMembers.length}</p>
                <p className="text-xs text-muted-foreground">Total Tripulação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Heart className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{statusCounts.fit}</p>
                <p className="text-xs text-muted-foreground">Aptos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Syringe className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCrewMembers.reduce((acc, m) => 
                    acc + m.vaccinations.filter(v => v.status === 'expiring').length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Vacinas a Vencer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockCrewMembers.filter(m => {
                    const next = new Date(m.nextCheckup);
                    const today = new Date();
                    const diff = (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
                    return diff <= 30;
                  }).length}
                </p>
                <p className="text-xs text-muted-foreground">Exames Próximos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crew List */}
      <Card>
        <CardHeader>
          <CardTitle>Fichas Médicas da Tripulação</CardTitle>
          <CardDescription>Clique em um tripulante para ver detalhes</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredCrew.map((member) => (
                <Dialog key={member.id}>
                  <DialogTrigger asChild>
                    <div 
                      className="p-4 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedCrew(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm">Tipo: {member.bloodType}</p>
                            <p className="text-xs text-muted-foreground">
                              Próx. exame: {new Date(member.nextCheckup).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          {getStatusBadge(member.status)}
                        </div>
                      </div>
                      {(member.allergies.length > 0 || member.conditions.length > 0) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {member.allergies.map((allergy, i) => (
                            <Badge key={i} variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {allergy}
                            </Badge>
                          ))}
                          {member.conditions.map((condition, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <span>{member.name}</span>
                          <p className="text-sm font-normal text-muted-foreground">{member.position}</p>
                        </div>
                        {getStatusBadge(member.status)}
                      </DialogTitle>
                      <DialogDescription>Ficha médica completa do tripulante</DialogDescription>
                    </DialogHeader>
                    
                    <Tabs defaultValue="info" className="mt-4">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Informações</TabsTrigger>
                        <TabsTrigger value="vaccines">Vacinação</TabsTrigger>
                        <TabsTrigger value="history">Histórico</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="info" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Tipo Sanguíneo</p>
                            <p className="font-medium text-lg">{member.bloodType}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="mt-1">{getStatusBadge(member.status)}</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Último Check-up</p>
                            <p className="font-medium">{new Date(member.lastCheckup).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm text-muted-foreground">Próximo Check-up</p>
                            <p className="font-medium">{new Date(member.nextCheckup).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <p className="text-sm font-medium text-red-500 mb-2">Alergias</p>
                          {member.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {member.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive">{allergy}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma alergia registrada</p>
                          )}
                        </div>
                        
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm font-medium mb-2">Condições de Saúde</p>
                          {member.conditions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {member.conditions.map((condition, i) => (
                                <Badge key={i} variant="secondary">{condition}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhuma condição registrada</p>
                          )}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="vaccines" className="mt-4">
                        <div className="space-y-3">
                          {member.vaccinations.map((vaccine, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-3">
                                {getVaccinationStatus(vaccine.status)}
                                <div>
                                  <p className="font-medium">{vaccine.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Aplicada: {new Date(vaccine.date).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm">Validade: {new Date(vaccine.expiryDate).toLocaleDateString('pt-BR')}</p>
                                <Badge variant={
                                  vaccine.status === 'valid' ? 'default' :
                                  vaccine.status === 'expiring' ? 'secondary' : 'destructive'
                                }>
                                  {vaccine.status === 'valid' ? 'Válida' :
                                   vaccine.status === 'expiring' ? 'A vencer' : 'Vencida'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="history" className="mt-4">
                        <p className="text-center text-muted-foreground py-8">
                          Ver aba de Prontuários para histórico completo de atendimentos
                        </p>
                      </TabsContent>
                    </Tabs>
                    
                    <DialogFooter className="mt-4">
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Imprimir Ficha
                      </Button>
                      <Button>
                        <Phone className="h-4 w-4 mr-2" />
                        Telemedicina
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
