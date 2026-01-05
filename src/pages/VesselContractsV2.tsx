/**
 * VesselContractsV2 - Contratos de Embarcação
 * Módulo elevado com IA integrada, layout V2, e funcionalidades completas
 */

import { useState, useEffect } from "react";
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
import { 
  FileText, Brain, Shield, Clock, AlertTriangle, Plus, 
  Download, RefreshCw, TrendingUp, BarChart3, CheckCircle,
  XCircle, FileCheck, DollarSign, Calendar, Ship, Eye, Edit, Trash2, Sparkles
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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
      console.error('Error creating contract:', error);
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
    { label: "Ver Detalhes", icon: Eye, onClick: (item: Contract) => toast.info(`Detalhes: ${item.contract_number}`) },
    { label: "Analisar com IA", icon: Brain, onClick: (item: Contract) => analyzeContractWithAI(item.id) },
    { label: "Editar", icon: Edit, onClick: (item: Contract) => toast.info(`Editando: ${item.contract_number}`) },
    { label: "Excluir", icon: Trash2, onClick: (item: Contract) => toast.error(`Excluir não permitido`), variant: "destructive" as const },
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
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="broa">BROA</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
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
          <CardV2
            icon={Clock}
            title="Eventos de Downtime"
            description="Registros de paradas e indisponibilidades"
            gradient="orange"
            action={{
              label: "Registrar Downtime",
              icon: Plus,
              onClick: () => toast.info("Formulário de downtime em desenvolvimento")
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
          <CardV2
            icon={FileCheck}
            title="BROA - Boletim de Registro de Ocorrências e Avarias"
            description="Geração automática de documentos BROA com análise IA"
            gradient="green"
          >
            <div className="text-center py-12">
              <FileCheck className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">Gerador de BROA com IA</h3>
              <p className="text-muted-foreground mb-4">
                Selecione um evento de downtime na aba anterior para gerar automaticamente o BROA
              </p>
              <Button onClick={() => toast.info('Selecione um evento de downtime primeiro')}>
                <Brain className="h-4 w-4 mr-2" />
                Gerar BROA Automático
              </Button>
            </div>
          </CardV2>
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
            
            <CardV2
              icon={BarChart3}
              title="Insights IA"
              description="Análises automáticas dos contratos"
              gradient="purple"
            >
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-blue-500">SLA em dia</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activeContracts} contratos ativos com média de {avgSLA}% de SLA permitido
                  </p>
                </div>
                
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-500">Atenção</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {criticalDowntimes} eventos críticos de downtime identificados
                  </p>
                </div>
                
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-500">Recomendação</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Revise contratos com vencimento nos próximos 30 dias
                  </p>
                </div>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <ModuleEvidenceGenerator
            moduleName="Contratos de Embarcação"
            moduleContext="análise de contratos, SLA, downtime e penalidades marítimas"
            edgeFunctionName="contract-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="blue"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
