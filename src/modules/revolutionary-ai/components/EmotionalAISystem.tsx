/**
 * Emotional AI System
 * PATCH REVOLUTION v1.0
 * AI that understands emotions and optimizes team dynamics
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Smile, Frown, Meh, Heart, Users, TrendingUp,
  AlertTriangle, MessageSquare, Phone, Video,
  Brain, Activity, Shield, Zap, Target
} from "lucide-react";
import { motion } from "framer-motion";

interface CrewEmotionalState {
  id: string;
  name: string;
  role: string;
  primaryEmotion: "happy" | "neutral" | "frustrated" | "stressed" | "anxious";
  emotionIntensity: number;
  trend: "improving" | "stable" | "declining";
  riskLevel: "low" | "medium" | "high";
  lastInteraction: string;
  teamCompatibility: number;
  stressFactors: string[];
}

interface TeamDynamics {
  overallMorale: number;
  conflictRisk: number;
  collaborationScore: number;
  leadershipEffectiveness: number;
  communicationHealth: number;
}

const mockCrewEmotions: CrewEmotionalState[] = [
  {
    id: "1",
    name: "Carlos Ferreira",
    role: "Captain",
    primaryEmotion: "happy",
    emotionIntensity: 85,
    trend: "stable",
    riskLevel: "low",
    lastInteraction: "2h ago",
    teamCompatibility: 92,
    stressFactors: [],
  },
  {
    id: "2",
    name: "Maria Santos",
    role: "Chief Officer",
    primaryEmotion: "stressed",
    emotionIntensity: 72,
    trend: "declining",
    riskLevel: "medium",
    lastInteraction: "30m ago",
    teamCompatibility: 78,
    stressFactors: ["Workload increase", "Deadline pressure"],
  },
  {
    id: "3",
    name: "João Lima",
    role: "Chief Engineer",
    primaryEmotion: "neutral",
    emotionIntensity: 60,
    trend: "stable",
    riskLevel: "low",
    lastInteraction: "1h ago",
    teamCompatibility: 88,
    stressFactors: [],
  },
  {
    id: "4",
    name: "Pedro Costa",
    role: "2nd Officer",
    primaryEmotion: "frustrated",
    emotionIntensity: 78,
    trend: "declining",
    riskLevel: "high",
    lastInteraction: "15m ago",
    teamCompatibility: 65,
    stressFactors: ["Conflict with Chief Officer", "Sleep deprivation", "Personal issues"],
  },
  {
    id: "5",
    name: "Ana Silva",
    role: "Bosun",
    primaryEmotion: "happy",
    emotionIntensity: 80,
    trend: "improving",
    riskLevel: "low",
    lastInteraction: "45m ago",
    teamCompatibility: 95,
    stressFactors: [],
  },
];

const mockTeamDynamics: TeamDynamics = {
  overallMorale: 76,
  conflictRisk: 35,
  collaborationScore: 82,
  leadershipEffectiveness: 88,
  communicationHealth: 74,
};

const emotionIcons = {
  happy: Smile,
  neutral: Meh,
  frustrated: Frown,
  stressed: AlertTriangle,
  anxious: Activity,
};

const emotionColors = {
  happy: "text-green-500 bg-green-500/10",
  neutral: "text-yellow-500 bg-yellow-500/10",
  frustrated: "text-red-500 bg-red-500/10",
  stressed: "text-orange-500 bg-orange-500/10",
  anxious: "text-purple-500 bg-purple-500/10",
};

const riskColors = {
  low: "bg-green-500/10 text-green-500 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
  high: "bg-red-500/10 text-red-500 border-red-500/30",
};

export function EmotionalAISystem() {
  const [selectedCrew, setSelectedCrew] = useState<CrewEmotionalState | null>(null);

  const highRiskCount = mockCrewEmotions.filter(c => c.riskLevel === "high").length;
  const avgCompatibility = Math.round(
    mockCrewEmotions.reduce((acc, c) => acc + c.teamCompatibility, 0) / mockCrewEmotions.length
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-accent" />
            Emotional AI System
          </h2>
          <p className="text-muted-foreground">
            Inteligência emocional e otimização de dinâmica de equipe
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-success/10 text-success">
            <Smile className="h-3 w-3 mr-1" />
            Moral: {mockTeamDynamics.overallMorale}%
          </Badge>
          {highRiskCount > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {highRiskCount} Atenção
            </Badge>
          )}
        </div>
      </div>

      {/* Team Dynamics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Moral Geral", value: mockTeamDynamics.overallMorale, icon: Smile, color: "text-success" },
          { label: "Risco Conflito", value: mockTeamDynamics.conflictRisk, icon: AlertTriangle, color: "text-warning", inverted: true },
          { label: "Colaboração", value: mockTeamDynamics.collaborationScore, icon: Users, color: "text-primary" },
          { label: "Liderança", value: mockTeamDynamics.leadershipEffectiveness, icon: Shield, color: "text-secondary" },
          { label: "Comunicação", value: mockTeamDynamics.communicationHealth, icon: MessageSquare, color: "text-info" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold">{metric.value}%</div>
                <Progress 
                  value={metric.inverted ? 100 - metric.value : metric.value} 
                  className="h-1.5 mt-2" 
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crew Emotional States */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              Estado Emocional da Tripulação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {mockCrewEmotions.map((crew, index) => {
                  const EmotionIcon = emotionIcons[crew.primaryEmotion];
                  return (
                    <motion.div
                      key={crew.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        crew.riskLevel === "high" ? "bg-red-500/5 border-red-500/30" : "bg-card"
                      }`}
                      onClick={() => setSelectedCrew(crew)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className={emotionColors[crew.primaryEmotion]}>
                              <EmotionIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium text-sm">{crew.name}</h4>
                            <p className="text-xs text-muted-foreground">{crew.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={riskColors[crew.riskLevel]}>
                            {crew.riskLevel}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {crew.trend === "improving" && <TrendingUp className="h-3 w-3 inline text-green-500" />}
                            {crew.trend === "declining" && <TrendingUp className="h-3 w-3 inline text-red-500 rotate-180" />}
                            {" "}{crew.lastInteraction}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Compatibilidade:</span>
                        <Progress value={crew.teamCompatibility} className="flex-1 h-1.5" />
                        <span className="text-xs font-medium">{crew.teamCompatibility}%</span>
                      </div>
                      {crew.stressFactors.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {crew.stressFactors.map((factor, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-orange-500/10 text-orange-500">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Recomendações da IA Emocional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-500">Conflito Detectado</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tensão entre Pedro Costa (2nd Officer) e Maria Santos (Chief Officer). 
                      Recomendado: Mediação pelo Capitão nas próximas 24h.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Iniciar Mediação
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
                        Teleconsulta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-500">Estresse Elevado</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Maria Santos apresenta sinais de burnout. Carga de trabalho 35% acima da média.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Target className="h-4 w-4 mr-1" />
                        Redistribuir Tarefas
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-start gap-3">
                  <Smile className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-500">Oportunidade de Team Building</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Moral geral está em 76%. Evento social pode aumentar para 85%+ 
                      baseado em padrões históricos.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Users className="h-4 w-4 mr-1" />
                        Agendar Evento
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-500">Insight Cultural</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Equipe multicultural (5 nacionalidades). IA detectou diferenças de estilo 
                      de comunicação. Micro-training cultural recomendado.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Ver Training
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI */}
      <Card className="bg-gradient-to-br from-accent/10 to-secondary/5">
        <CardContent className="pt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Impacto da IA Emocional
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success">-80%</div>
              <div className="text-sm text-muted-foreground">Conflitos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">+50%</div>
              <div className="text-sm text-muted-foreground">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">-40%</div>
              <div className="text-sm text-muted-foreground">Turnover</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500">+60%</div>
              <div className="text-sm text-muted-foreground">Segurança</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
