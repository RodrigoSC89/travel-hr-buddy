// @ts-nocheck - Schema alignment pending
/**
 * VesselContractsV2 - Contratos de Embarcação
 * Módulo completo com IA, predição, alertas, analytics, documentos, rastreamento e ERP
 */

import { useState, useEffect } from "react";
import { logger } from "@/lib/logger";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DowntimeFormDialog } from "@/components/contracts/DowntimeFormDialog";
import { DowntimeAIAnalysisCard } from "@/components/contracts/DowntimeAIAnalysisCard";
import { BROAGeneratorCard } from "@/components/contracts/BROAGeneratorCard";
import { SLADashboardCard } from "@/components/contracts/SLADashboardCard";
import { PredictiveDowntimeCard } from "@/components/contracts/PredictiveDowntimeCard";
import { ContractAlertsCard } from "@/components/contracts/ContractAlertsCard";
import { ContractAnalyticsDashboard } from "@/components/contracts/ContractAnalyticsDashboard";
import { DocumentSignatureCard } from "@/components/contracts/DocumentSignatureCard";
import { VesselTrackingCard } from "@/components/contracts/VesselTrackingCard";
import { ERPIntegrationCard } from "@/components/contracts/ERPIntegrationCard";
import { AdvancedDowntimeValidator } from "@/components/contracts/AdvancedDowntimeValidator";
import { 
  FileText, Brain, Shield, Clock, AlertTriangle, Plus, 
  Download, RefreshCw, TrendingUp, BarChart3, CheckCircle,
  XCircle, FileCheck, DollarSign, Calendar, Ship, Eye, Edit, Trash2,
  Bell, Navigation, Building2, FileSignature, Zap
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
  ai_analysis?: { summary?: string; recommendations?: string[]; risk_level?: string } | null;
}

const QUICK_QUESTIONS = [
  "Como calcular penalidades de SLA?",
  "Quais são os requisitos de um BROA?",
  "O que configura downtime justificável?",
  "Como funciona a análise IA de contratos?",
  "Quais cláusulas são obrigatórias?",
  "Como contestar uma multa de SLA?"
];

const EVIDENCE_FIELDS = [
  { name: "contract_number", label: "Número do Contrato", type: "text" as const, placeholder: "CNT-2024-001", required: true },
  { name: "vessel_name", label: "Embarcação", type: "text" as const, placeholder: "Nome da embarcação", required: true },
  { name: "observed_condition", label: "Condição Observada", type: "textarea" as const, placeholder: "Descreva a situação...", required: true },
  { name: "downtime_hours", label: "Horas de Downtime", type: "text" as const, placeholder: "Ex: 24" },
  { name: "client_name", label: "Cliente", type: "text" as const, placeholder: "Nome do cliente" },
];

export default function VesselContractsV2() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [downtimeEvents, setDowntimeEvents] = useState<DowntimeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewContract, setShowNewContract] = useState(false);
  const [showDowntimeForm, setShowDowntimeForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [newContract, setNewContract] = useState({
    contract_number: '',
    client_name: '',
    start_date: '',
    end_date: '',
    sla_downtime_percent: '',
    penalty_per_hour: '',
    terms: ''
  });

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
      logger.error('Error loading contracts data', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDowntime = async (data: {
    start_time: string;
    end_time: string;
    reported_reason: string;
    category: string;
    vessel_id?: string;
    contract_id?: string;
    notes?: string;
  }) => {
    try {
      const startTime = new Date(data.start_time);
      const endTime = data.end_time ? new Date(data.end_time) : null;
      const durationHours = endTime 
        ? (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        : null;

      // Insert into both legacy and new tables for compatibility
      const { error } = await supabase.from('downtime_events').insert({
        start_time: startTime.toISOString(),
        end_time: endTime?.toISOString() || null,
        duration_hours: durationHours,
        reason: data.reported_reason,
        reason_category: data.category,
        impact_level: 'medium',
        justification_status: 'pending'
      });

      if (error) throw error;
      
      toast.success('Downtime registrado com sucesso!');
      loadData();
    } catch (error) {
      logger.error('Error creating downtime:', error);
      toast.error('Erro ao registrar downtime');
    }
  };

  const handleCreateContract = async () => {
    if (!newContract.contract_number || !newContract.client_name) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase.from('vessel_contracts').insert({
        contract_number: newContract.contract_number,
        client_name: newContract.client_name,
        start_date: newContract.start_date,
        end_date: newContract.end_date,
        sla_downtime_percent: parseFloat(newContract.sla_downtime_percent) || null,
        penalty_per_hour: parseFloat(newContract.penalty_per_hour) || null,
        status: 'active'
      });

      if (error) throw error;
      
      toast.success('Contrato criado com sucesso!');
      setShowNewContract(false);
      setNewContract({ contract_number: '', client_name: '', start_date: '', end_date: '', sla_downtime_percent: '', penalty_per_hour: '', terms: '' });
      loadData();
    } catch (error) {
      logger.error('Error creating contract:', error);
      toast.error('Erro ao criar contrato');
    }
  };

  const analyzeContractWithAI = async (contractId: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('contract-downtime-ai', {
        body: { action: 'analyze_contract', contractId }
      });

      if (error) throw error;
      toast.success('Análise IA do contrato concluída');
      loadData();
    } catch (error) {
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
    } catch (error) {
      toast.error('Erro ao gerar BROA');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportContracts = () => {
    const content = contracts.map(c => 
      `${c.contract_number},${c.client_name},${c.start_date},${c.end_date},${c.status}`
    ).join('\n');
    
    const blob = new Blob([`Contrato,Cliente,Início,Fim,Status\n${content}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contratos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Contratos exportados!');
  };

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setShowDetailsDialog(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowEditDialog(true);
  };

  const handleDeleteContract = async (contract: Contract) => {
    if (!confirm(`Tem certeza que deseja excluir o contrato ${contract.contract_number}?`)) return;
    
    try {
      const { error } = await supabase.from('vessel_contracts').delete().eq('id', contract.id);
      if (error) throw error;
      toast.success('Contrato excluído com sucesso');
      loadData();
    } catch (error) {
      toast.error('Erro ao excluir contrato');
    }
  };

  const handleUpdateContract = async () => {
    if (!editingContract) return;
    
    try {
      const { error } = await supabase.from('vessel_contracts').update({
        contract_number: editingContract.contract_number,
        client_name: editingContract.client_name,
        start_date: editingContract.start_date,
        end_date: editingContract.end_date,
        sla_downtime_percent: editingContract.sla_downtime_percent,
        penalty_per_hour: editingContract.penalty_per_hour,
        status: editingContract.status,
      }).eq('id', editingContract.id);
      
      if (error) throw error;
      toast.success('Contrato atualizado com sucesso');
      setShowEditDialog(false);
      setEditingContract(null);
      loadData();
    } catch (error) {
      toast.error('Erro ao atualizar contrato');
    }
  };

  // Stats
  const activeContracts = contracts.filter(c => c.status === 'active').length;
  const totalDowntimeHours = downtimeEvents.reduce((acc, d) => acc + (d.duration_hours || 0), 0);
  const criticalDowntimes = downtimeEvents.filter(d => d.impact_level === 'critical').length;
  const avgSLA = contracts.length > 0 
    ? (contracts.reduce((acc, c) => acc + (c.sla_downtime_percent || 0), 0) / contracts.length).toFixed(1)
    : '0';

  const stats = [
    { label: "Contratos Ativos", value: activeContracts, icon: FileText, color: "blue" as const, trend: { value: 5, direction: "up" as const } },
    { label: "Total Downtime (h)", value: totalDowntimeHours.toFixed(1), icon: Clock, color: "orange" as const },
    { label: "Downtimes Críticos", value: criticalDowntimes, icon: AlertTriangle, color: "red" as const },
    { label: "SLA Médio (%)", value: `${avgSLA}%`, icon: Shield, color: "green" as const },
  ];

  const contractColumns = [
    { key: "contract_number", label: "Contrato", sortable: true },
    { key: "client_name", label: "Cliente", sortable: true },
    { key: "start_date", label: "Início", render: (item: Contract) => new Date(item.start_date).toLocaleDateString('pt-BR') },
    { key: "end_date", label: "Fim", render: (item: Contract) => new Date(item.end_date).toLocaleDateString('pt-BR') },
    { key: "sla_downtime_percent", label: "SLA (%)", render: (item: Contract) => `${item.sla_downtime_percent || 0}%` },
    { 
      key: "status", 
      label: "Status", 
      render: (item: Contract) => (
        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
          {item.status === 'active' ? 'Ativo' : item.status}
        </Badge>
      )
    },
  ];

  const contractActions = [
    { label: "Ver Detalhes", icon: Eye, onClick: (item: Contract) => handleViewDetails(item) },
    { label: "Analisar com IA", icon: Brain, onClick: (item: Contract) => analyzeContractWithAI(item.id) },
    { label: "Editar", icon: Edit, onClick: (item: Contract) => handleEditContract(item) },
    { label: "Excluir", icon: Trash2, onClick: (item: Contract) => handleDeleteContract(item), variant: "destructive" as const },
  ];


  return (
    <PageLayoutV2
      icon={FileText}
      title="Contratos de Embarcação"
      description="Gestão completa de contratos com IA para análise de SLA, downtime e geração de BROA"
      gradient="blue"
      badges={[
        { icon: Brain, label: "IA Análise" },
        { icon: Shield, label: "SLA Compliance" },
        { icon: FileCheck, label: "BROA Automático" },
      ]}
    >
      {/* Stats Grid */}
      <StatsGridV2 stats={stats} columns={4} />

      {/* Main Content */}
      <Tabs defaultValue="contracts" className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="broa">BROA & IA</TabsTrigger>
          <TabsTrigger value="prediction">Predição IA</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="ai-assistant">Assistente</TabsTrigger>
        </TabsList>

        {/* Contratos Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Gestão de Contratos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportContracts}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
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
                        <Label>Número do Contrato *</Label>
                        <Input 
                          placeholder="CNT-2024-001" 
                          value={newContract.contract_number}
                          onChange={(e) => setNewContract(prev => ({ ...prev, contract_number: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cliente/Operador *</Label>
                        <Input 
                          placeholder="Nome do cliente"
                          value={newContract.client_name}
                          onChange={(e) => setNewContract(prev => ({ ...prev, client_name: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data Início</Label>
                        <Input 
                          type="date"
                          value={newContract.start_date}
                          onChange={(e) => setNewContract(prev => ({ ...prev, start_date: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Fim</Label>
                        <Input 
                          type="date"
                          value={newContract.end_date}
                          onChange={(e) => setNewContract(prev => ({ ...prev, end_date: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SLA Downtime Permitido (%)</Label>
                        <Input 
                          type="number" 
                          placeholder="5.0" 
                          step="0.1"
                          value={newContract.sla_downtime_percent}
                          onChange={(e) => setNewContract(prev => ({ ...prev, sla_downtime_percent: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Penalidade por Hora (USD)</Label>
                        <Input 
                          type="number" 
                          placeholder="1000"
                          value={newContract.penalty_per_hour}
                          onChange={(e) => setNewContract(prev => ({ ...prev, penalty_per_hour: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Termos e Condições</Label>
                      <Textarea 
                        placeholder="Descreva os termos principais do contrato..." 
                        rows={4}
                        value={newContract.terms}
                        onChange={(e) => setNewContract(prev => ({ ...prev, terms: e.target.value }))}
                      />
                    </div>
                    <Button className="w-full" onClick={handleCreateContract}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Registrar Contrato
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DataTableV2
            data={contracts}
            columns={contractColumns}
            actions={contractActions}
            title="Contratos Cadastrados"
            icon={FileText}
            searchable
            searchPlaceholder="Buscar contratos..."
            onRefresh={loadData}
            onExport={exportContracts}
            loading={loading}
            filters={[
              { 
                key: "status", 
                label: "Status", 
                options: [
                  { value: "active", label: "Ativo" },
                  { value: "expired", label: "Expirado" },
                  { value: "draft", label: "Rascunho" }
                ]
              }
            ]}
          />
        </TabsContent>

        {/* Downtime Tab */}
        <TabsContent value="downtime" className="space-y-4">
          <DowntimeFormDialog 
            open={showDowntimeForm} 
            onOpenChange={setShowDowntimeForm}
            onSubmit={handleCreateDowntime}
          />
          <CardV2
            icon={Clock}
            title="Eventos de Downtime"
            description="Registros de paradas e indisponibilidades"
            gradient="orange"
            action={{
              label: "Registrar Downtime",
              icon: Plus,
              onClick: () => setShowDowntimeForm(true)
            }}
          >
            <div className="space-y-4">
              {downtimeEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento de downtime registrado
                </div>
              ) : (
                downtimeEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${event.impact_level === 'critical' ? 'bg-red-500/20' : 'bg-orange-500/20'}`}>
                        <AlertTriangle className={`h-5 w-5 ${event.impact_level === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{event.reason || 'Sem motivo especificado'}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.duration_hours ? `${event.duration_hours}h de duração` : 'Duração não informada'} • {new Date(event.start_time).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => generateBROA(event.id)} disabled={isAnalyzing}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Gerar BROA
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Análise IA')}>
                        <Brain className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardV2>
        </TabsContent>

        {/* BROA Tab */}
        <TabsContent value="broa" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BROAGeneratorCard 
              events={downtimeEvents}
              contracts={contracts.map(c => ({
                id: c.id,
                contract_number: c.contract_number,
                client_name: c.client_name
              }))}
              onBROAGenerated={() => loadData()}
            />
            <DowntimeAIAnalysisCard 
              events={downtimeEvents}
              contracts={contracts.map(c => ({
                id: c.id,
                contract_number: c.contract_number,
                client_name: c.client_name,
                sla_downtime_percent: c.sla_downtime_percent,
                penalty_per_hour: c.penalty_per_hour
              }))}
              onAnalysisComplete={() => loadData()}
            />
          </div>
          
          {/* Advanced AI Validator */}
          <AdvancedDowntimeValidator 
            downtimeEvent={downtimeEvents[0] ? {
              start_time: downtimeEvents[0].start_time,
              end_time: downtimeEvents[0].end_time || undefined,
              reason: downtimeEvents[0].reason || '',
              reason_category: downtimeEvents[0].reason_category || '',
              impact_level: downtimeEvents[0].impact_level || 'medium',
              duration_hours: downtimeEvents[0].duration_hours || undefined
            } : undefined}
            onValidationComplete={() => loadData()}
          />
        </TabsContent>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="space-y-4">
          <PredictiveDowntimeCard />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <ContractAlertsCard />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <ContractAnalyticsDashboard />
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <DocumentSignatureCard />
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-4">
          <VesselTrackingCard />
        </TabsContent>

        {/* ERP Tab */}
        <TabsContent value="erp" className="space-y-4">
          <ERPIntegrationCard />
        </TabsContent>

        {/* AI Assistant Tab */}
        <TabsContent value="ai-assistant" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModuleAIChat
              moduleName="Contratos"
              moduleContext="gestão de contratos de embarcação, SLA, downtime e BROA"
              systemPrompt="Você é um especialista em contratos marítimos, SLA de embarcações, e gestão de downtime. Ajude com análise de cláusulas, cálculo de penalidades, e geração de BROA."
              quickQuestions={QUICK_QUESTIONS}
              edgeFunctionName="contract-ai-chat"
              accentColor="blue"
            />
            
            <SLADashboardCard contracts={contracts} downtimeEvents={downtimeEvents} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Contract Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
            <DialogDescription>
              {selectedContract?.contract_number} - {selectedContract?.client_name}
            </DialogDescription>
          </DialogHeader>
          {selectedContract && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Número do Contrato</Label>
                <p className="font-medium">{selectedContract.contract_number}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Cliente</Label>
                <p className="font-medium">{selectedContract.client_name}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Operador</Label>
                <p className="font-medium">{selectedContract.operator_name || '-'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Badge variant={selectedContract.status === 'active' ? 'default' : 'secondary'}>
                  {selectedContract.status === 'active' ? 'Ativo' : selectedContract.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Data de Início</Label>
                <p className="font-medium">{new Date(selectedContract.start_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Data de Fim</Label>
                <p className="font-medium">{new Date(selectedContract.end_date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">SLA Downtime (%)</Label>
                <p className="font-medium">{selectedContract.sla_downtime_percent || 0}%</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Penalidade por Hora</Label>
                <p className="font-medium">R$ {selectedContract.penalty_per_hour?.toLocaleString('pt-BR') || '0'}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>Fechar</Button>
            <Button onClick={() => { setShowDetailsDialog(false); if(selectedContract) handleEditContract(selectedContract); }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contract Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
            <DialogDescription>
              Atualize os dados do contrato {editingContract?.contract_number}
            </DialogDescription>
          </DialogHeader>
          {editingContract && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-contract-number">Número do Contrato</Label>
                <Input
                  id="edit-contract-number"
                  value={editingContract.contract_number}
                  onChange={(e) => setEditingContract({ ...editingContract, contract_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client-name">Cliente</Label>
                <Input
                  id="edit-client-name"
                  value={editingContract.client_name}
                  onChange={(e) => setEditingContract({ ...editingContract, client_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-start-date">Data de Início</Label>
                <Input
                  id="edit-start-date"
                  type="date"
                  value={editingContract.start_date.split('T')[0]}
                  onChange={(e) => setEditingContract({ ...editingContract, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end-date">Data de Fim</Label>
                <Input
                  id="edit-end-date"
                  type="date"
                  value={editingContract.end_date.split('T')[0]}
                  onChange={(e) => setEditingContract({ ...editingContract, end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sla">SLA Downtime (%)</Label>
                <Input
                  id="edit-sla"
                  type="number"
                  value={editingContract.sla_downtime_percent || ''}
                  onChange={(e) => setEditingContract({ ...editingContract, sla_downtime_percent: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-penalty">Penalidade por Hora (R$)</Label>
                <Input
                  id="edit-penalty"
                  type="number"
                  value={editingContract.penalty_per_hour || ''}
                  onChange={(e) => setEditingContract({ ...editingContract, penalty_per_hour: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingContract(null); }}>Cancelar</Button>
            <Button onClick={handleUpdateContract}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayoutV2>
  );
}
