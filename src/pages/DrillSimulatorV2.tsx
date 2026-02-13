/**
 * DrillSimulatorV2 - Drill Simulator
 * Simulação de exercícios de emergência
 */

import { useState } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, DataTableV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Siren, Brain, Timer, CheckCircle, AlertTriangle, 
  Play, Users, Award, Target
} from "lucide-react";

interface DrillRecord {
  id: string;
  drill_type: string;
  date: string;
  duration_minutes: number;
  participants: number;
  score: number;
  status: string;
}

const QUICK_QUESTIONS = [
  "Quais drills são obrigatórios?",
  "Frequência mínima de exercícios?",
  "Como avaliar performance?",
  "Requisitos SOLAS para drills?",
  "Como documentar exercícios?",
  "Cenários de emergência?"
];

const EVIDENCE_FIELDS = [
  { name: "drill_type", label: "Tipo de Exercício", type: "select" as const, options: [
    { value: "fire", label: "Incêndio" },
    { value: "abandon_ship", label: "Abandono" },
    { value: "man_overboard", label: "Homem ao Mar" },
    { value: "oil_spill", label: "Derramamento" },
    { value: "security", label: "Segurança ISPS" }
  ], required: true },
  { name: "observed_condition", label: "Observações/Falhas", type: "textarea" as const, required: true },
  { name: "participants", label: "Participantes", type: "text" as const },
];

export default function DrillSimulatorV2() {
  const [drills, setDrills] = useState<DrillRecord[]>([
    { id: "1", drill_type: "fire", date: "2025-01-02", duration_minutes: 25, participants: 18, score: 92, status: "completed" },
    { id: "2", drill_type: "abandon_ship", date: "2024-12-28", duration_minutes: 35, participants: 22, score: 88, status: "completed" },
    { id: "3", drill_type: "man_overboard", date: "2024-12-15", duration_minutes: 15, participants: 12, score: 95, status: "completed" },
  ]);

  const avgScore = drills.length > 0 ? (drills.reduce((a, d) => a + d.score, 0) / drills.length).toFixed(0) : 0;
  const totalDrills = drills.length;
  const totalParticipants = drills.reduce((a, d) => a + d.participants, 0);

  const stats = [
    { label: "Total Exercícios", value: totalDrills, icon: Siren, color: "blue" as const },
    { label: "Score Médio", value: `${avgScore}%`, icon: Target, color: "green" as const },
    { label: "Participações", value: totalParticipants, icon: Users, color: "purple" as const },
    { label: "Próximo Drill", value: "5 dias", icon: Timer, color: "orange" as const },
  ];

  const columns = [
    { key: "drill_type", label: "Tipo", render: (item: DrillRecord) => (
      <Badge variant={item.drill_type === 'fire' ? 'destructive' : 'secondary'}>
        {item.drill_type === 'fire' ? 'Incêndio' : item.drill_type === 'abandon_ship' ? 'Abandono' : item.drill_type === 'man_overboard' ? 'Homem ao Mar' : item.drill_type}
      </Badge>
    )},
    { key: "date", label: "Data", render: (item: DrillRecord) => new Date(item.date).toLocaleDateString('pt-BR') },
    { key: "duration_minutes", label: "Duração", render: (item: DrillRecord) => `${item.duration_minutes} min` },
    { key: "participants", label: "Participantes" },
    { key: "score", label: "Score", render: (item: DrillRecord) => (
      <div className="flex items-center gap-2">
        <Progress value={item.score} className="w-16 h-2" />
        <span className={item.score >= 90 ? 'text-green-500' : item.score >= 70 ? 'text-orange-500' : 'text-red-500'}>{item.score}%</span>
      </div>
    )},
  ];

  return (
    <PageLayoutV2
      icon={Siren}
      title="Drill Simulator"
      description="Simulação e avaliação de exercícios de emergência"
      gradient="red"
      badges={[
        { icon: Brain, label: "IA Avaliação" },
        { icon: Timer, label: "Performance" },
        { icon: Award, label: "Certificação" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="drills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="drills">Exercícios</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="drills">
          <DataTableV2
            data={drills}
            columns={columns}
            title="Histórico de Exercícios"
            icon={Siren}
            searchable
            onRefresh={() => toast.success("Dados atualizados")}
            actions={[
              { label: "Avaliar com IA", icon: Brain, onClick: (item) => { navigator.clipboard?.writeText(`Drill: ${item.drill_type} | Participantes: ${item.participants} | Score: ${item.score}%`); toast.success(`Avaliação de "${item.drill_type}" copiada`, { description: `Score: ${item.score}% | ${item.participants} participantes` }); } },
              { label: "Ver Relatório", icon: Target, onClick: (item) => { navigator.clipboard?.writeText(`Relatório: ${item.drill_type} | Score: ${item.score}% | Duração: ${item.duration_minutes} min | Data: ${new Date(item.date).toLocaleDateString('pt-BR')}`); toast.info(`Relatório: ${item.drill_type}`, { description: `Score: ${item.score}% | Duração: ${item.duration_minutes} min | Data: ${new Date(item.date).toLocaleDateString('pt-BR')}`, duration: 6000 }); } },
            ]}
          />
        </TabsContent>

        <TabsContent value="simulator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { type: "Incêndio", icon: Siren, color: "red", description: "Combate a incêndio e evacuação" },
              { type: "Abandono", icon: Users, color: "orange", description: "Procedimentos de abandono de navio" },
              { type: "Homem ao Mar", icon: AlertTriangle, color: "blue", description: "Resgate de pessoa na água" }
            ].map(drill => (
              <CardV2 key={drill.type} icon={drill.icon} title={`Drill: ${drill.type}`} description={drill.description} gradient={drill.color as "red" | "orange" | "blue"}>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <drill.icon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">Clique para iniciar simulação</p>
                  </div>
                  <Button className="w-full" onClick={async () => {
                    const { error } = await (await import("@/integrations/supabase/client")).supabase.from("action_items").insert({ title: `Drill: ${drill.type}`, description: drill.description, source_module: "drill-simulator", status: "in_progress", priority: "high" });
                    if (error) { toast.error("Erro ao registrar drill: " + error.message); } else { toast.success(`Drill de ${drill.type} registrado e iniciado!`); }
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Simulação
                  </Button>
                </div>
              </CardV2>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Drill Simulator"
            moduleContext="simulação de exercícios de emergência, drills SOLAS, avaliação de performance"
            systemPrompt="Você é especialista em exercícios de emergência marítima. Ajude com planejamento de drills, avaliação de performance e requisitos SOLAS."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="drill-simulator-ai"
            accentColor="red"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Drill Simulator"
            moduleContext="exercícios de emergência, drills, avaliação de performance"
            edgeFunctionName="drill-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="red"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
