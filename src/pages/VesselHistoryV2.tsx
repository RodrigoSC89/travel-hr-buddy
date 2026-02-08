/**
 * VesselHistoryV2 - Histórico de Embarcação
 * Timeline interativa com IA para análise de padrões
 * CRUD completo para inserir/remover eventos
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Ship, Brain, History, FileText, Wrench, Shield, AlertTriangle, 
  CheckCircle, Calendar, Search, TrendingUp, Plus, Edit2, Trash2
} from "lucide-react";
import { VesselTimelineAdvanced } from "@/components/vessel-history/VesselTimelineAdvanced";

interface HistoryEvent {
  id: string;
  vessel_name: string;
  event_type: string;
  event_date: string;
  description: string;
  documents: string[];
  status: string;
  cost?: number;
}

const QUICK_QUESTIONS = [
  "Como consultar histórico de manutenção?",
  "Quais eventos são obrigatórios registrar?",
  "Como identificar padrões de falha?",
  "Requisitos de documentação ISM?",
  "Como funciona a análise preditiva?",
  "O que é Class Survey History?"
];

const EVIDENCE_FIELDS = [
  { name: "vessel_name", label: "Embarcação", type: "text" as const, required: true },
  { name: "event_type", label: "Tipo de Evento", type: "select" as const, options: [
    { value: "maintenance", label: "Manutenção" },
    { value: "inspection", label: "Inspeção" },
    { value: "incident", label: "Incidente" },
    { value: "retrofit", label: "Retrofit" }
  ], required: true },
  { name: "observed_condition", label: "Descrição", type: "textarea" as const, required: true },
];

export default function VesselHistoryV2() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoryEvent | null>(null);
  const [formData, setFormData] = useState({
    vessel_name: "",
    event_type: "maintenance",
    event_date: new Date().toISOString().split('T')[0],
    description: "",
    cost: 0
  });

  useEffect(() => {
    setEvents([
      { id: "1", vessel_name: "MV Atlantic Star", event_type: "inspection", event_date: "2026-01-30", description: "Inspeção PSC - Santos", documents: ["PSC Report"], status: "completed", cost: 5000 },
      { id: "2", vessel_name: "MV Atlantic Star", event_type: "maintenance", event_date: "2026-01-23", description: "Manutenção preventiva motor principal", documents: ["Work Order", "Spare Parts"], status: "completed", cost: 45000 },
      { id: "3", vessel_name: "MV Atlantic Star", event_type: "retrofit", event_date: "2025-11-20", description: "Instalação BWTS", documents: ["BWTS Certificate", "Installation Report"], status: "completed", cost: 850000 },
      { id: "4", vessel_name: "MV Pacific Dawn", event_type: "incident", event_date: "2025-10-05", description: "Near miss - procedimento de amarração", documents: ["Incident Report"], status: "closed" },
    ]);
    setLoading(false);
  }, []);

  const handleOpenAddDialog = () => {
    setEditingEvent(null);
    setFormData({
      vessel_name: "",
      event_type: "maintenance",
      event_date: new Date().toISOString().split('T')[0],
      description: "",
      cost: 0
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (event: HistoryEvent) => {
    setEditingEvent(event);
    setFormData({
      vessel_name: event.vessel_name,
      event_type: event.event_type,
      event_date: event.event_date,
      description: event.description,
      cost: event.cost || 0
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success("Evento excluído com sucesso");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...event, ...formData, documents: event.documents }
          : event
      ));
      toast.success("Evento atualizado com sucesso");
    } else {
      const newEvent: HistoryEvent = {
        id: Date.now().toString(),
        ...formData,
        documents: [],
        status: "pending"
      };
      setEvents(prev => [newEvent, ...prev]);
      toast.success("Evento adicionado com sucesso");
    }
    
    setIsAddDialogOpen(false);
  };

  const totalEvents = events.length;
  const inspections = events.filter(e => e.event_type === 'inspection').length;
  const maintenances = events.filter(e => e.event_type === 'maintenance').length;
  const incidents = events.filter(e => e.event_type === 'incident').length;

  const stats = [
    { label: "Total de Eventos", value: totalEvents, icon: History, color: "blue" as const },
    { label: "Inspeções", value: inspections, icon: Shield, color: "green" as const },
    { label: "Manutenções", value: maintenances, icon: Wrench, color: "orange" as const },
    { label: "Incidentes", value: incidents, icon: AlertTriangle, color: "red" as const },
  ];

  const getEventIcon = (type: string) => {
    switch(type) {
      case 'inspection': return <Shield className="h-5 w-5 text-green-500" />;
      case 'maintenance': return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'retrofit': return <Ship className="h-5 w-5 text-blue-500" />;
      case 'incident': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <PageLayoutV2
      icon={History}
      title="Histórico de Embarcação"
      description="Timeline interativa com IA para análise de padrões e predição"
      gradient="teal"
      badges={[
        { icon: Brain, label: "IA Preditiva" },
        { icon: History, label: "Timeline" },
        { icon: Search, label: "OCR Search" },
      ]}
    >
      {/* Action Buttons */}
      <div className="flex justify-end mb-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? "Editar Evento" : "Novo Evento no Histórico"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vessel_name">Embarcação</Label>
                  <Input
                    id="vessel_name"
                    value={formData.vessel_name}
                    onChange={e => setFormData({ ...formData, vessel_name: e.target.value })}
                    placeholder="MV Atlantic Star"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_type">Tipo de Evento</Label>
                  <Select value={formData.event_type} onValueChange={v => setFormData({ ...formData, event_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Manutenção</SelectItem>
                      <SelectItem value="inspection">Inspeção</SelectItem>
                      <SelectItem value="incident">Incidente</SelectItem>
                      <SelectItem value="retrofit">Retrofit</SelectItem>
                      <SelectItem value="crew_change">Troca Tripulação</SelectItem>
                      <SelectItem value="voyage">Viagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Custo (R$)</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o evento..."
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEvent ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="analysis">Análise IA</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <CardV2 icon={History} title="Timeline de Eventos" description="Histórico cronológico da embarcação com filtros avançados" gradient="blue">
            <VesselTimelineAdvanced 
              showFilters={true}
              maxHeight="600px"
              onEventClick={(event) => toast.info(`Evento: ${event.title}`)}
            />
          </CardV2>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={TrendingUp} title="Análise de Padrões" gradient="purple">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Manutenção Preventiva</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Padrão de manutenção regular identificado - próxima em 45 dias</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-500">Predição IA</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Nenhuma falha crítica prevista nos próximos 90 dias</p>
                </div>
              </div>
            </CardV2>
            <CardV2 icon={Search} title="Busca OCR" description="Pesquisa em documentos digitalizados" gradient="orange">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar em documentos digitalizados..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        toast.info(`Buscando "${(e.target as HTMLInputElement).value}" nos documentos OCR...`);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Busca por texto extraído via OCR nos documentos cadastrados. Pressione Enter para buscar.
                </p>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Histórico de Embarcação"
            moduleContext="histórico de manutenção, inspeções, retrofits e análise preditiva"
            systemPrompt="Você é especialista em gestão de histórico de embarcações. Ajude com análise de padrões, predição de falhas e documentação ISM."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="vessel-history-ai"
            accentColor="teal"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Histórico de Embarcação"
            moduleContext="histórico de eventos, manutenção, inspeções e análise preditiva"
            edgeFunctionName="vessel-history-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="teal"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
