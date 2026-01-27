/**
 * VesselHistoryV2 - Histórico de Embarcação
 * Timeline interativa com IA para análise de padrões
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Ship, Brain, History, FileText, Wrench, Shield, AlertTriangle, 
  CheckCircle, Calendar, Search, TrendingUp
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

  useEffect(() => {
    setEvents([
      { id: "1", vessel_name: "MV Atlantic Star", event_type: "inspection", event_date: "2025-01-02", description: "Inspeção PSC - Santos", documents: ["PSC Report"], status: "completed" },
      { id: "2", vessel_name: "MV Atlantic Star", event_type: "maintenance", event_date: "2024-12-15", description: "Manutenção preventiva motor principal", documents: ["Work Order", "Spare Parts"], status: "completed" },
      { id: "3", vessel_name: "MV Atlantic Star", event_type: "retrofit", event_date: "2024-11-20", description: "Instalação BWTS", documents: ["BWTS Certificate", "Installation Report"], status: "completed" },
      { id: "4", vessel_name: "MV Pacific Dawn", event_type: "incident", event_date: "2024-10-05", description: "Near miss - procedimento de amarração", documents: ["Incident Report"], status: "closed" },
    ]);
    setLoading(false);
  }, []);

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
                <div className="flex gap-2">
                  <input type="text" placeholder="Buscar texto em documentos..." className="flex-1 px-3 py-2 border rounded-md bg-background" />
                  <Button size="sm" onClick={() => toast.success('Buscando documentos...')}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Busque por texto em certificados, relatórios e documentos digitalizados.</p>
                  <p className="mt-1">Suporta: PDF, imagens, documentos escaneados</p>
                </div>
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
