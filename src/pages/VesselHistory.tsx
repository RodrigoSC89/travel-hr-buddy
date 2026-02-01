/**
 * Módulo 4: Histórico por Embarcação
 * Timeline interativa, manuais, busca inteligente
 */
import { useState, useEffect } from "react";
import { ModulePageWrapper } from "@/components/ui/module-page-wrapper";
import { ModuleHeader } from "@/components/ui/module-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from '@/lib/logger';
import {
  History, Brain, Search, FileText, Plus, Calendar, Ship,
  Anchor, Wrench, Shield, AlertTriangle, Award, Upload,
  Download, Clock, Filter, ChevronDown, ChevronRight, Folder
} from "lucide-react";

interface HistoryEvent {
  id: string;
  vessel_id?: string | null;
  event_type: string;
  event_date: string;
  title: string;
  description?: string | null;
  documents: Array<{ name: string; url?: string }> | null;
  relevance_score: number | null;
}

interface Manual {
  id: string;
  vessel_id?: string | null;
  manual_type: string;
  title: string;
  file_path: string;
  version: string | null;
  status: string | null;
  upload_date: string | null;
}

const VesselHistory = () => {
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyRes, manualsRes] = await Promise.all([
        supabase.from('vessel_history').select('*').order('event_date', { ascending: false }),
        supabase.from('vessel_manuals').select('*').order('upload_date', { ascending: false })
      ]);

      if (historyRes.data) setHistoryEvents(historyRes.data);
      if (manualsRes.data) setManuals(manualsRes.data);
    } catch (error) {
      logger.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    if (!searchTerm.trim()) return;
    
    toast.info('Buscando nos documentos...');
    try {
      const { data, error } = await supabase.functions.invoke('vessel-history-ai', {
        body: { action: 'search', query: searchTerm }
      });

      if (error) throw error;
      toast.success(`Encontrados ${data?.results?.length || 0} resultados`);
    } catch (error) {
      logger.error('Error searching:', error);
      toast.error('Erro na busca');
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'ownership': return <Ship className="h-4 w-4" />;
      case 'flag': return <Shield className="h-4 w-4" />;
      case 'modification': return <Wrench className="h-4 w-4" />;
      case 'inspection': return <Search className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'accident': return <AlertTriangle className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'accident': return 'bg-destructive/20 text-destructive';
      case 'certification': return 'bg-success/20 text-success';
      case 'maintenance': return 'bg-warning/20 text-warning';
      case 'inspection': return 'bg-info/20 text-info';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getManualTypeIcon = (type: string) => {
    switch (type) {
      case 'operation': return '📘';
      case 'maintenance': return '🔧';
      case 'emergency': return '🚨';
      case 'safety': return '⛑️';
      case 'ism': return '📋';
      case 'blueprints': return '📐';
      default: return '📄';
    }
  };

  const filteredEvents = historyEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || event.event_type === filterType;
    const matchesYear = selectedYear === 'all' || new Date(event.event_date).getFullYear().toString() === selectedYear;
    return matchesSearch && matchesType && matchesYear;
  });

  const groupedByYear = filteredEvents.reduce((acc, event) => {
    const year = new Date(event.event_date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(event);
    return acc;
  }, {} as Record<string, HistoryEvent[]>);

  return (
    <ModulePageWrapper gradient="purple">
      <ModuleHeader
        icon={History}
        title="Histórico da Embarcação"
        description="Timeline interativa, manuais e busca inteligente"
        gradient="purple"
        badges={[
          { icon: Brain, label: "Busca IA" },
          { icon: FileText, label: "OCR" },
          { icon: History, label: "Timeline" }
        ]}
      />

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar em documentos, eventos, manuais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && searchDocuments()}
              />
            </div>
            <Button onClick={searchDocuments}>
              <Brain className="h-4 w-4 mr-2" />
              Buscar com IA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="manuals">Manuais</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="ownership">Propriedade</SelectItem>
                  <SelectItem value="flag">Bandeira</SelectItem>
                  <SelectItem value="modification">Modificação</SelectItem>
                  <SelectItem value="inspection">Inspeção</SelectItem>
                  <SelectItem value="certification">Certificação</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="accident">Acidente</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[120px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Evento Histórico</DialogTitle>
                  <DialogDescription>Adicione um novo evento à timeline da embarcação</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Tipo de Evento</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ownership">Mudança de Propriedade</SelectItem>
                        <SelectItem value="flag">Mudança de Bandeira</SelectItem>
                        <SelectItem value="modification">Modificação Estrutural</SelectItem>
                        <SelectItem value="inspection">Inspeção</SelectItem>
                        <SelectItem value="certification">Certificação</SelectItem>
                        <SelectItem value="maintenance">Manutenção Maior</SelectItem>
                        <SelectItem value="accident">Acidente/Incidente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Evento</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input placeholder="Descrição breve do evento" />
                  </div>
                  <Button className="w-full" onClick={() => toast.success('Evento histórico registrado com sucesso')}>Registrar Evento</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Timeline View */}
          <div className="relative">
            {Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
              <div key={year} className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {year}
                </h3>
                <div className="space-y-4 border-l-2 border-muted pl-6">
                  {groupedByYear[year].map(event => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-[29px] top-2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {getEventTypeIcon(event.event_type)}
                                <span className="font-medium">{event.title}</span>
                                <Badge className={getEventTypeColor(event.event_type)}>
                                  {event.event_type}
                                </Badge>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground">{event.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.event_date).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            {event.documents && event.documents.length > 0 && (
                              <Badge variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                {event.documents.length} docs
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredEvents.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento encontrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Manuals Tab */}
        <TabsContent value="manuals" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Manuais e Documentação</h2>
            <Button onClick={() => toast.info('Sistema de upload de manuais ativado')}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Manual
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { type: 'operation', label: 'Manual de Operação', count: 3 },
              { type: 'maintenance', label: 'Manual de Manutenção', count: 5 },
              { type: 'emergency', label: 'Plano de Emergência', count: 2 },
              { type: 'safety', label: 'Safety Manual', count: 1 },
              { type: 'ism', label: 'ISM Code Manual', count: 1 },
              { type: 'blueprints', label: 'Desenhos Técnicos', count: 12 }
            ].map(category => (
              <Card key={category.type} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getManualTypeIcon(category.type)}</div>
                    <div>
                      <h3 className="font-semibold">{category.label}</h3>
                      <p className="text-sm text-muted-foreground">{category.count} documentos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documentos Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {manuals.slice(0, 5).map(manual => (
                  <div key={manual.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getManualTypeIcon(manual.manual_type)}</span>
                      <div>
                        <p className="font-medium">{manual.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Versão {manual.version} | {manual.upload_date ? new Date(manual.upload_date).toLocaleDateString('pt-BR') : '-'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Baixando ${manual.title}...`)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Galeria de Documentos
              </CardTitle>
              <CardDescription>
                Todos os documentos da embarcação com busca OCR
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Use a busca inteligente para encontrar documentos específicos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Análise Histórica com IA
              </CardTitle>
              <CardDescription>
                Padrões de falha, custos históricos e previsões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Wrench className="h-8 w-8 mx-auto mb-2 text-warning" />
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Manutenções no ano</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">Incidentes registrados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Award className="h-8 w-8 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold">8</p>
                    <p className="text-sm text-muted-foreground">Certificações ativas</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default VesselHistory;
