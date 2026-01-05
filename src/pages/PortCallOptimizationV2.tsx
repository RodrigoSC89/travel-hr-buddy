/**
 * PortCallOptimizationV2 - Otimização de Escala Portuária
 * Módulo elevado com IA para JIT Arrival e coordenação portuária
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Anchor, Brain, Clock, AlertTriangle, Plus, Download, RefreshCw, 
  TrendingUp, CheckCircle, Ship, MapPin, Navigation, Timer, Sparkles, Calendar
} from "lucide-react";

interface PortCall {
  id: string;
  vessel_name: string;
  port_name: string;
  eta: string;
  etd: string;
  berth: string;
  status: string;
  waiting_time_hours: number;
  jit_score: number;
  operations: string[];
}

const QUICK_QUESTIONS = [
  "O que é Just-in-Time Arrival?",
  "Como otimizar tempo de espera?",
  "Quais documentos para Port Clearance?",
  "Como funciona a previsão de ETA?",
  "O que afeta o tempo de berço?",
  "Como reduzir custos portuários?"
];

const EVIDENCE_FIELDS = [
  { name: "vessel_name", label: "Embarcação", type: "text" as const, required: true },
  { name: "port_name", label: "Porto", type: "text" as const, required: true },
  { name: "observed_condition", label: "Condição Observada", type: "textarea" as const, required: true },
  { name: "delay_reason", label: "Motivo do Atraso", type: "text" as const },
];

export default function PortCallOptimizationV2() {
  const [portCalls, setPortCalls] = useState<PortCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPortCalls([
      { id: "1", vessel_name: "MV Atlantic Star", port_name: "Santos", eta: "2025-01-05T08:00", etd: "2025-01-06T18:00", berth: "Berço 12", status: "approaching", waiting_time_hours: 2.5, jit_score: 94, operations: ["Carga", "Abastecimento"] },
      { id: "2", vessel_name: "MV Pacific Dawn", port_name: "Rotterdam", eta: "2025-01-07T14:00", etd: "2025-01-09T06:00", berth: "Europort T3", status: "scheduled", waiting_time_hours: 0, jit_score: 98, operations: ["Descarga", "Manutenção"] },
    ]);
    setLoading(false);
  }, []);

  const avgJIT = portCalls.length > 0 ? (portCalls.reduce((a, p) => a + p.jit_score, 0) / portCalls.length).toFixed(0) : 0;
  const totalWaiting = portCalls.reduce((a, p) => a + p.waiting_time_hours, 0);

  const stats = [
    { label: "Escalas Ativas", value: portCalls.length, icon: Anchor, color: "blue" as const },
    { label: "Score JIT Médio", value: `${avgJIT}%`, icon: Timer, color: "green" as const },
    { label: "Tempo Espera Total", value: `${totalWaiting}h`, icon: Clock, color: "orange" as const },
    { label: "Em Aproximação", value: portCalls.filter(p => p.status === 'approaching').length, icon: Navigation, color: "purple" as const },
  ];

  const columns = [
    { key: "vessel_name", label: "Embarcação", sortable: true },
    { key: "port_name", label: "Porto", sortable: true },
    { key: "eta", label: "ETA", render: (item: PortCall) => new Date(item.eta).toLocaleString('pt-BR') },
    { key: "berth", label: "Berço" },
    { key: "jit_score", label: "JIT Score", render: (item: PortCall) => (
      <Badge variant={item.jit_score >= 90 ? "default" : "secondary"}>{item.jit_score}%</Badge>
    )},
    { key: "status", label: "Status", render: (item: PortCall) => (
      <Badge variant={item.status === 'approaching' ? 'default' : 'secondary'}>
        {item.status === 'approaching' ? 'Aproximando' : item.status === 'scheduled' ? 'Agendado' : item.status}
      </Badge>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Anchor}
      title="Port Call Optimization"
      description="Otimização Just-in-Time de escalas portuárias com IA preditiva"
      gradient="cyan"
      badges={[
        { icon: Brain, label: "IA Preditiva" },
        { icon: Timer, label: "JIT Arrival" },
        { icon: Navigation, label: "ETA Precision" },
        { icon: Sparkles, label: "Layout V2" }
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="calls" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="calls">Escalas</TabsTrigger>
          <TabsTrigger value="jit">JIT Planning</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="calls">
          <DataTableV2
            data={portCalls}
            columns={columns}
            title="Escalas Portuárias"
            icon={Anchor}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            loading={loading}
            actions={[
              { label: "Otimizar ETA", icon: Brain, onClick: (item) => toast.success(`Otimizando ETA para ${item.vessel_name}`) },
              { label: "Port Clearance", icon: CheckCircle, onClick: (item) => toast.info("Gerando documentação") },
            ]}
          />
        </TabsContent>

        <TabsContent value="jit">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Timer} title="JIT Arrival Planner" description="Planejamento de chegada otimizada" gradient="green">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">JIT Ativo</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Economia estimada: $12,500/escala em tempo de espera
                  </p>
                </div>
                {portCalls.map(call => (
                  <div key={call.id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{call.vessel_name}</span>
                      <Badge>{call.jit_score}% JIT</Badge>
                    </div>
                    <Progress value={call.jit_score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardV2>
            <CardV2 icon={MapPin} title="Coordenação Portuária" description="Status de berços e agentes" gradient="blue">
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Mapa de berços em desenvolvimento</p>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Port Call Optimization"
            moduleContext="otimização de escalas portuárias, JIT arrival, coordenação com agentes e port clearance"
            systemPrompt="Você é especialista em operações portuárias e JIT arrival. Ajude com otimização de ETA, redução de tempo de espera e documentação portuária."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="port-call-ai"
            accentColor="cyan"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Port Call Optimization"
            moduleContext="operações portuárias, atrasos, JIT arrival e coordenação"
            edgeFunctionName="port-call-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="cyan"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
