/**
 * SafetyHumanFactorsV2 - Fatores Humanos
 * Neurociência e QE para segurança operacional
 */

import { useState, useEffect } from "react";
import { PageLayoutV2, CardV2, StatsGridV2, ModuleAIChat, ModuleEvidenceGenerator } from "@/components/v2";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  Brain, Heart, Activity, AlertTriangle, CheckCircle, 
  TrendingUp, Users, Sparkles, Moon, Coffee
} from "lucide-react";

const QUICK_QUESTIONS = [
  "O que é QE (Quociente Emocional)?",
  "Como medir fadiga da tripulação?",
  "Fatores que afetam desempenho?",
  "Como reduzir erro humano?",
  "Indicadores de estresse?",
  "Boas práticas de wellness?"
];

const EVIDENCE_FIELDS = [
  { name: "crew_name", label: "Tripulante", type: "text" as const, required: true },
  { name: "factor_type", label: "Tipo de Fator", type: "select" as const, options: [
    { value: "fatigue", label: "Fadiga" },
    { value: "stress", label: "Estresse" },
    { value: "emotional", label: "Emocional" },
    { value: "cognitive", label: "Cognitivo" }
  ], required: true },
  { name: "observed_condition", label: "Observação/Avaliação", type: "textarea" as const, required: true },
];

export default function SafetyHumanFactorsV2() {
  const [metrics, setMetrics] = useState({
    avgQE: 78,
    fatigueRisk: 15,
    stressLevel: 22,
    wellnessScore: 85
  });

  const stats = [
    { label: "QE Médio", value: `${metrics.avgQE}%`, icon: Heart, color: "purple" as const },
    { label: "Risco Fadiga", value: `${metrics.fatigueRisk}%`, icon: Moon, color: "orange" as const },
    { label: "Nível Estresse", value: `${metrics.stressLevel}%`, icon: Activity, color: "red" as const },
    { label: "Wellness Score", value: `${metrics.wellnessScore}%`, icon: CheckCircle, color: "green" as const },
  ];

  return (
    <PageLayoutV2
      icon={Brain}
      title="Fatores Humanos"
      description="Neurociência e Quociente Emocional para segurança operacional"
      gradient="purple"
      badges={[
        { icon: Brain, label: "Neurociência" },
        { icon: Heart, label: "QE Assessment" },
        { icon: Activity, label: "Fadiga Tracking" },
      ]}
    >
      <StatsGridV2 stats={stats} columns={4} />

      <Tabs defaultValue="assessment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="assessment">Avaliações</TabsTrigger>
          <TabsTrigger value="fatigue">Fadiga</TabsTrigger>
          <TabsTrigger value="ai-assistant">IA Assistente</TabsTrigger>
          <TabsTrigger value="evidence">Evidências</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardV2 icon={Heart} title="Quociente Emocional" description="Avaliação de inteligência emocional" gradient="purple">
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-5xl font-bold text-purple-500">{metrics.avgQE}%</p>
                  <p className="text-muted-foreground">QE Médio da Tripulação</p>
                </div>
                <div className="space-y-2">
                  {["Autoconsciência", "Autogestão", "Empatia", "Habilidades Sociais"].map((skill, idx) => (
                    <div key={skill} className="flex justify-between items-center">
                      <span className="text-sm">{skill}</span>
                      <Progress value={70 + idx * 8} className="w-32 h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardV2>
            <CardV2 icon={Activity} title="Monitoramento de Estresse" description="Indicadores em tempo real" gradient="red">
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-500">Níveis Normais</span>
                  </div>
                  <p className="text-sm text-muted-foreground">85% da tripulação com estresse controlado</p>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <span className="font-medium text-orange-500">Atenção</span>
                  </div>
                  <p className="text-sm text-muted-foreground">3 tripulantes com fadiga elevada</p>
                </div>
              </div>
            </CardV2>
          </div>
        </TabsContent>

        <TabsContent value="fatigue">
          <CardV2 icon={Moon} title="Gestão de Fadiga" description="Monitoramento de horas de descanso" gradient="blue">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Horas de Descanso (24h)", value: "8.5h", status: "ok" },
                { label: "Horas de Descanso (7d)", value: "77h", status: "ok" },
                { label: "Trabalho Contínuo", value: "6h", status: "ok" },
                { label: "Alertas Fadiga", value: "2", status: "warning" }
              ].map(item => (
                <div key={item.label} className={`p-4 rounded-lg ${item.status === 'ok' ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </CardV2>
        </TabsContent>

        <TabsContent value="ai-assistant">
          <ModuleAIChat
            moduleName="Safety Human Factors"
            moduleContext="fatores humanos, neurociência, QE, fadiga e estresse na operação marítima"
            systemPrompt="Você é especialista em fatores humanos e neurociência aplicada à segurança marítima. Ajude com avaliação de QE, gestão de fadiga e redução de erro humano."
            quickQuestions={QUICK_QUESTIONS}
            edgeFunctionName="human-factors-ai"
            accentColor="purple"
          />
        </TabsContent>

        <TabsContent value="evidence">
          <ModuleEvidenceGenerator
            moduleName="Safety Human Factors"
            moduleContext="fatores humanos, fadiga, estresse, QE e segurança operacional"
            edgeFunctionName="human-factors-generate-evidence"
            fields={EVIDENCE_FIELDS}
            accentColor="purple"
          />
        </TabsContent>
      </Tabs>
    </PageLayoutV2>
  );
}
