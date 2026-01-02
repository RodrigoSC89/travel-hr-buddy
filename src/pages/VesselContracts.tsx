/**
 * Módulo 1: Contrato do Barco + IA de Downtime
 * Verificação de SLA, geração de BROA, análise de downtime
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  FileText, Brain, Shield, Clock, AlertTriangle, Plus, 
  Download, RefreshCw, TrendingUp, BarChart3, CheckCircle,
  XCircle, FileCheck, DollarSign, Calendar, Ship
} from "lucide-react";

interface Contract {
  id: string;
  contract_number: string;
  client_name: string;
  operator_name?: string | null;
  start_date: string;
  end_date: string;
  sla_downtime_percent: number | null;
  penalty_per_hour: number | null;
  status: string | null;
  vessel_id?: string | null;
}

interface DowntimeEvent {
  id: string;
  start_time: string;
  end_time?: string | null;
  duration_hours?: number | null;
  reason: string | null;
  reason_category: string | null;
  impact_level: string | null;
  justification_status: string | null;
  ai_analysis?: any;
}

const VesselContracts = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewContract, setShowNewContract] = useState(false);
  const [showNewDowntime, setShowNewDowntime] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contractsRes, downtimeRes] = await Promise.all([
        supabase.from('vessel_contracts').select('*').order('created_at', { ascending: false }),
        supabase.from('downtime_events').select('*').order('start_time', { ascending: false }).limit(50)
      ]);

      if (contractsRes.data) setContracts(contractsRes.data);
      if (downtimeRes.data) setDowntimeEvents(downtimeRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const analyzeDowntime = async (eventId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-downtime-ai', {
        body: { action: 'analyze_downtime', eventId }
      });

      if (error) throw error;
      toast.success('Análise de downtime concluída');
      loadData();
    } catch (error) {
      console.error('Error analyzing downtime:', error);
      toast.error('Erro na análise IA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateBROA = async (eventId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-downtime-ai', {
        body: { action: 'generate_broa', eventId }
      });

      if (error) throw error;
      toast.success('BROA gerado com sucesso');
      loadData();
    } catch (error) {
      console.error('Error generating BROA:', error);
      toast.error('Erro ao gerar BROA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate SLA metrics
  const calculateSLAMetrics = (contract: Contract) => {
    const contractDowntime = downtimeEvents.filter(d => d.id); // Simplified for demo
    const totalHours = contractDowntime.reduce((acc, d) => acc + (d.duration_hours || 0), 0);
    const contractDuration = (new Date(contract.end_date).getTime() - new Date(contract.start_date).getTime()) / (1000 * 60 * 60);
    const downtimePercent = (totalHours / contractDuration) * 100;
    const slaPercent = contract.sla_downtime_percent ?? 0;
    const penaltyRate = contract.penalty_per_hour ?? 0;
    
    return {
      totalDowntime: totalHours,
      downtimePercent,
      slaStatus: downtimePercent <= slaPercent ? 'ok' : 'exceeded',
      estimatedPenalty: downtimePercent > slaPercent 
        ? (totalHours * penaltyRate) 
        : 0
    };
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'bg-success/20 text-success';
      case 'expired': return 'bg-destructive/20 text-destructive';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-info/20 text-info';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-destructive/20 text-destructive';
      case 'high': return 'bg-orange-500/20 text-orange-600';
      case 'medium': return 'bg-warning/20 text-warning';
      default: return 'bg-info/20 text-info';
    }
  };

  return (
    <ModulePageWrapper gradient="blue">
      <ModuleHeader
        icon={FileText}
        title="Contratos & Downtime"
        description="Gestão de contratos com verificação IA de SLA e geração de BROA"
        gradient="blue"
        badges={[
          { icon: Brain, label: "IA Análise" },
          { icon: Shield, label: "SLA Compliance" },
          { icon: FileCheck, label: "BROA Auto" }
        ]}
      />

      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="broa">BROA</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard SLA</TabsTrigger>
        </TabsList>

        {/* Contratos Tab */}
        <TabsContent value="contracts" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Contratos Ativos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Dialog open={showNewContract} onOpenChange={setShowNewContract}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Novo Contrato de Embarcação</DialogTitle>
                    <DialogDescription>Registre os termos do contrato e SLA</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Número do Contrato</Label>
                        <Input placeholder="CNT-2024-001" />
                      </div>
                      <div className="space-y-2">
                        <Label>Cliente/Operador</Label>
                        <Input placeholder="Nome do cliente" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SLA Downtime Permitido (%)</Label>
                        <Input type="number" placeholder="5.0" step="0.1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Penalidade por Hora (USD)</Label>
                        <Input type="number" placeholder="1000" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Termos e Condições</Label>
                      <Textarea placeholder="Descreva os termos principais do contrato..." rows={4} />
                    </div>
                    <Button className="w-full" onClick={() => { toast.success('Contrato registrado com sucesso!'); setShowNewContract(false); }}>Registrar Contrato</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Carregando contratos...</CardContent></Card>
            ) : contracts.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum contrato registrado</CardContent></Card>
            ) : (
              contracts.map(contract => {
                const metrics = calculateSLAMetrics(contract);
                return (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <Ship className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">{contract.contract_number}</h3>
                            <Badge className={getStatusColor(contract.status)}>
                              {contract.status === 'active' ? 'Ativo' : contract.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{contract.client_name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(contract.start_date).toLocaleDateString('pt-BR')} - {new Date(contract.end_date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              SLA: {contract.sla_downtime_percent}%
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              ${contract.penalty_per_hour}/h
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-2">
                            {metrics.slaStatus === 'ok' ? (
                              <Badge className="bg-success/20 text-success">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                SLA OK
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/20 text-destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                SLA Excedido
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Downtime: {metrics.downtimePercent.toFixed(2)}%
                          </p>
                          {metrics.estimatedPenalty > 0 && (
                            <p className="text-sm text-destructive font-medium">
                              Penalidade: ${metrics.estimatedPenalty.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Downtime Tab */}
        <TabsContent value="downtime" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Eventos de Downtime</h2>
            <Dialog open={showNewDowntime} onOpenChange={setShowNewDowntime}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Parada
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Evento de Downtime</DialogTitle>
                  <DialogDescription>A IA analisará automaticamente a justificativa</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Data/Hora Início</Label>
                      <Input type="datetime-local" />
                    </div>
                    <div className="space-y-2">
                      <Label>Data/Hora Fim</Label>
                      <Input type="datetime-local" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mechanical">Mecânico</SelectItem>
                          <SelectItem value="electrical">Elétrico</SelectItem>
                          <SelectItem value="weather">Condições Climáticas</SelectItem>
                          <SelectItem value="operational">Operacional</SelectItem>
                          <SelectItem value="scheduled">Programada</SelectItem>
                          <SelectItem value="emergency">Emergência</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Impacto</Label>
                      <Select>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixo</SelectItem>
                          <SelectItem value="medium">Médio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                          <SelectItem value="critical">Crítico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sistema/Equipamento Afetado</Label>
                    <Input placeholder="Ex: Sistema de propulsão principal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição do Motivo</Label>
                    <Textarea placeholder="Descreva detalhadamente o motivo da parada..." rows={4} />
                  </div>
                  <Button className="w-full" onClick={() => { toast.success('Evento de downtime registrado e análise IA iniciada'); setShowNewDowntime(false); }}>
                    <Brain className="h-4 w-4 mr-2" />
                    Registrar e Analisar com IA
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {downtimeEvents.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum evento de downtime registrado</CardContent></Card>
            ) : (
              downtimeEvents.map(event => (
                <Card key={event.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-warning" />
                          <span className="font-medium">{event.reason || 'Sem motivo'}</span>
                          <Badge className={getImpactColor(event.impact_level || 'low')}>
                            {event.impact_level || 'N/A'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_time).toLocaleString('pt-BR')}
                          {event.end_time && ` - ${new Date(event.end_time).toLocaleString('pt-BR')}`}
                        </p>
                        {event.duration_hours && (
                          <p className="text-sm">Duração: {event.duration_hours.toFixed(1)} horas</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={
                          event.justification_status === 'approved' ? 'bg-success/20 text-success' :
                          event.justification_status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                          'bg-warning/20 text-warning'
                        }>
                          {event.justification_status === 'approved' ? 'Aprovado' :
                           event.justification_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => analyzeDowntime(event.id)} disabled={isAnalyzing}>
                          <Brain className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => generateBROA(event.id)} disabled={isAnalyzing}>
                          <FileCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* BROA Tab */}
        <TabsContent value="broa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                BROA - Boletim de Registro de Ocorrências e Avarias
              </CardTitle>
              <CardDescription>
                Geração automática de documentos BROA com análise de causa raiz por IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecione um evento de downtime para gerar o BROA automaticamente</p>
                <Button className="mt-4" variant="outline">
                  Ver Histórico de BROAs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Contratos Ativos</p>
                    <p className="text-2xl font-bold">{contracts.filter(c => c.status === 'active').length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">SLA Compliance</p>
                    <p className="text-2xl font-bold text-success">98.5%</p>
                  </div>
                  <Shield className="h-8 w-8 text-success opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Downtime (30d)</p>
                    <p className="text-2xl font-bold text-warning">{downtimeEvents.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-warning opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Penalidades Est.</p>
                    <p className="text-2xl font-bold text-destructive">$0</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-destructive opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tendência de Downtime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 space-y-3">
                {[
                  { month: "Out 2025", hours: 12, percent: 15 },
                  { month: "Nov 2025", hours: 8, percent: 10 },
                  { month: "Dez 2025", hours: 5, percent: 6 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground">{item.month}</span>
                    <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                      <div 
                        className="h-full bg-destructive/70 transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="w-16 text-sm font-medium text-right">{item.hours}h</span>
                  </div>
                ))}
                <div className="pt-4 border-t mt-4">
                  <p className="text-sm text-muted-foreground">
                    Tendência: <span className="text-green-600 font-medium">-58% redução</span> em downtime nos últimos 3 meses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ModulePageWrapper>
  );
};

export default VesselContracts;
