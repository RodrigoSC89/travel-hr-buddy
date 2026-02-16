/**
 * Crew & People AI Hub - Suite Disruptiva IA para Gestão de Tripulação
 * Fadiga Preditiva, Wellbeing AI, Crew Matching, Training Simulator
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users, Heart, Brain, AlertTriangle, UserCheck, GraduationCap,
  Activity, Moon, Clock, TrendingUp, Loader2, Shield, Zap,
  Smile, Frown, Meh, Target, BarChart3, Stethoscope, Sparkles
} from "lucide-react";
import { useNautilusEnhancementAI } from "@/hooks/useNautilusEnhancementAI";
import { useToast } from "@/hooks/use-toast";

// ============ FATIGUE PREDICTION AI ============
export const FatiguePredictionAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { analyzeWellbeing, isLoading } = useNautilusEnhancementAI();
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await analyzeWellbeing([
      { analysisType: 'fatigue_prediction', vesselId, factors: ['work_hours', 'rest_periods', 'voyage_duration', 'noise_levels', 'circadian_rhythm'] }
    ]);
    if (res) setResult(res.response);
  };

  const crewRisk = [
    { name: "Carlos Silva", role: "Chief Officer", fatigue: 72, risk: "Alto", hours: "14h trabalhadas" },
    { name: "Maria Santos", role: "2nd Engineer", fatigue: 45, risk: "Moderado", hours: "10h trabalhadas" },
    { name: "João Pereira", role: "AB Seaman", fatigue: 28, risk: "Baixo", hours: "8h trabalhadas" },
    { name: "Ana Costa", role: "Cook", fatigue: 61, risk: "Alto", hours: "12h trabalhadas" },
  ];

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-destructive" />
          Predição de Fadiga IA
          <Badge className="ml-auto bg-destructive/10 text-destructive">MLC 2006</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {crewRisk.map((crew) => (
            <div key={crew.name} className="flex items-center gap-3 p-2 rounded-lg border">
              {crew.fatigue > 60 ? <Frown className="h-4 w-4 text-destructive" /> : crew.fatigue > 40 ? <Meh className="h-4 w-4 text-warning" /> : <Smile className="h-4 w-4 text-success" />}
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{crew.name}</span>
                  <Badge variant={crew.risk === "Alto" ? "destructive" : "secondary"} className="text-xs">{crew.risk}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{crew.role} • {crew.hours}</p>
                <Progress value={crew.fatigue} className="h-1.5 mt-1" />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
          Análise de Fadiga Completa
        </Button>

        {result && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ WELLBEING AI ============
export const WellbeingAI: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  const { analyzeWellbeing, isLoading } = useNautilusEnhancementAI();
  const [insights, setInsights] = useState<any>(null);

  const handleAnalyze = async () => {
    const res = await analyzeWellbeing([{ vesselId, type: 'comprehensive_wellbeing' }]);
    if (res) setInsights(res.response);
  };

  return (
    <Card className="border-pink-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          Wellbeing Score IA
          <Badge className="ml-auto bg-pink-500/10 text-pink-500">Wellness Engine</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Score Geral", value: "78/100", icon: Heart, color: "text-accent" },
            { label: "Moral Equipe", value: "Alto", icon: Smile, color: "text-success" },
            { label: "Estresse Médio", value: "4.2/10", icon: Activity, color: "text-warning" },
            { label: "Descanso Adequado", value: "85%", icon: Moon, color: "text-info" },
          ].map((m) => (
            <div key={m.label} className="p-3 rounded-lg border text-center">
              <m.icon className={`h-5 w-5 mx-auto ${m.color} mb-1`} />
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="font-bold">{m.value}</p>
            </div>
          ))}
        </div>

        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full" variant="outline">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Análise de Bem-Estar Completa
        </Button>

        {insights && (
          <div className="p-3 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap">
            {typeof insights === 'string' ? insights : JSON.stringify(insights, null, 2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ============ CREW MATCHING AI ============
export const CrewMatchingAI: React.FC = () => {
  const { invoke, isLoading } = useNautilusEnhancementAI();
  const [matches, setMatches] = useState<any>(null);
  const [position, setPosition] = useState("");

  const handleMatch = async () => {
    const res = await invoke('resource_availability', `Encontre os melhores candidatos para a posição: ${position}. Considere: certificações STCW, experiência em tipo de embarcação, histórico de desempenho, compatibilidade de personalidade com equipe atual, disponibilidade e custo.`);
    if (res) setMatches(res.response);
  };

  return (
    <Card className="border-emerald-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-emerald-500" />
          Crew Matching IA
          <Badge className="ml-auto bg-emerald-500/10 text-emerald-500">Smart Match</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Ex: Chief Engineer para AHTS"
          value={position}
          onChange={e => setPosition(e.target.value)}
        />

        <Button onClick={handleMatch} disabled={isLoading || !position} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Target className="h-4 w-4 mr-2" />}
          Encontrar Candidatos Ideais
        </Button>

        {matches && (
          <ScrollArea className="h-48 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof matches === 'string' ? matches : JSON.stringify(matches, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ TRAINING SIMULATOR AI ============
export const TrainingSimulatorAI: React.FC = () => {
  const { simulateTraining, isLoading } = useNautilusEnhancementAI();
  const [scenario, setScenario] = useState<any>(null);
  const [scenarioType, setScenarioType] = useState("");

  const handleSimulate = async () => {
    const res = await simulateTraining(scenarioType || "man_overboard");
    if (res) setScenario(res.response);
  };

  const scenarios = [
    { id: "man_overboard", label: "Homem ao Mar", icon: "🚨" },
    { id: "fire_drill", label: "Incêndio a Bordo", icon: "🔥" },
    { id: "abandon_ship", label: "Abandono de Navio", icon: "🚢" },
    { id: "oil_spill", label: "Derramamento Óleo", icon: "🛢️" },
    { id: "collision", label: "Colisão/Encalhe", icon: "⚓" },
    { id: "medical_emergency", label: "Emergência Médica", icon: "🏥" },
  ];

  return (
    <Card className="border-warning/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-warning" />
          Simulador de Treinamento IA
          <Badge className="ml-auto bg-warning/10 text-warning">Drill Sim</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          {scenarios.map((s) => (
            <Button
              key={s.id}
              variant={scenarioType === s.id ? "default" : "outline"}
              size="sm"
              onClick={() => setScenarioType(s.id)}
              className="text-xs"
            >
              <span className="mr-1">{s.icon}</span>
              {s.label}
            </Button>
          ))}
        </div>

        <Button onClick={handleSimulate} disabled={isLoading || !scenarioType} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          Iniciar Simulação
        </Button>

        {scenario && (
          <ScrollArea className="h-48 rounded-md border p-3 bg-muted/30">
            <p className="text-sm whitespace-pre-wrap">{typeof scenario === 'string' ? scenario : JSON.stringify(scenario, null, 2)}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

// ============ MAIN EXPORT ============
const CrewAIHub: React.FC<{ vesselId?: string }> = ({ vesselId }) => {
  return (
    <Tabs defaultValue="fatigue" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="fatigue"><Moon className="h-3 w-3 mr-1" />Fadiga</TabsTrigger>
        <TabsTrigger value="wellbeing"><Heart className="h-3 w-3 mr-1" />Bem-Estar</TabsTrigger>
        <TabsTrigger value="matching"><UserCheck className="h-3 w-3 mr-1" />Matching</TabsTrigger>
        <TabsTrigger value="training"><GraduationCap className="h-3 w-3 mr-1" />Treinamento</TabsTrigger>
      </TabsList>
      <TabsContent value="fatigue"><FatiguePredictionAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="wellbeing"><WellbeingAI vesselId={vesselId} /></TabsContent>
      <TabsContent value="matching"><CrewMatchingAI /></TabsContent>
      <TabsContent value="training"><TrainingSimulatorAI /></TabsContent>
    </Tabs>
  );
};

export default CrewAIHub;
