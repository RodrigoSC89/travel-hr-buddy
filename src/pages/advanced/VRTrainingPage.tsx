/**
 * VR/AR Training Page
 * Simulações imersivas para treinamento de emergência
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, Play, Users, Award, Brain, 
  Target, Clock, Trophy, Star, CheckCircle
} from "lucide-react";

const VRTrainingPage = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const scenarios = [
    {
      id: "fire-engine-room",
      title: "Incêndio na Praça de Máquinas",
      duration: "25 min",
      difficulty: "advanced",
      completions: 45,
      avgScore: 78,
      description: "Responda a um incêndio no engine room com procedimentos SOLAS"
    },
    {
      id: "man-overboard",
      title: "Homem ao Mar (MOB)",
      duration: "15 min",
      difficulty: "intermediate",
      completions: 89,
      avgScore: 85,
      description: "Procedimento completo de resgate de homem ao mar"
    },
    {
      id: "abandon-ship",
      title: "Abandono de Navio",
      duration: "30 min",
      difficulty: "advanced",
      completions: 32,
      avgScore: 72,
      description: "Evacuação completa com baleeiras e comunicação de emergência"
    },
    {
      id: "collision",
      title: "Colisão e Alagamento",
      duration: "35 min",
      difficulty: "expert",
      completions: 18,
      avgScore: 68,
      description: "Controle de avarias após colisão com alagamento progressivo"
    },
    {
      id: "medical-emergency",
      title: "Emergência Médica",
      duration: "20 min",
      difficulty: "intermediate",
      completions: 67,
      avgScore: 82,
      description: "Atendimento de emergência médica a bordo"
    },
    {
      id: "oil-spill",
      title: "Derramamento de Óleo",
      duration: "25 min",
      difficulty: "intermediate",
      completions: 54,
      avgScore: 79,
      description: "Contenção e resposta a derramamento de óleo (SOPEP)"
    }
  ];

  const leaderboard = [
    { rank: 1, name: "Cmte. João Silva", score: 9450, scenarios: 12, badge: "Elite" },
    { rank: 2, name: "1º Of. Maria Santos", score: 8920, scenarios: 11, badge: "Expert" },
    { rank: 3, name: "2º Of. Pedro Lima", score: 8100, scenarios: 10, badge: "Expert" },
    { rank: 4, name: "Eng. Carlos Souza", score: 7650, scenarios: 9, badge: "Advanced" },
    { rank: 5, name: "3º Of. Ana Costa", score: 7200, scenarios: 8, badge: "Advanced" }
  ];

  const myProgress = {
    completed: 4,
    total: 6,
    avgScore: 81,
    totalTime: "2h 15min",
    rank: 8,
    nextBadge: "Expert",
    progressToBadge: 75
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-orange-500";
      case "expert": return "bg-red-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Gamepad2 className="h-8 w-8 text-primary" />
            VR/AR Training Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Simulações imersivas para treinamento de emergência
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2 py-1.5">
            <Brain className="h-4 w-4 text-green-500" />
            AI Coach Ativo
          </Badge>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Iniciar Sessão
          </Button>
        </div>
      </div>

      {/* My Progress */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Meu Progresso</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Cenários</p>
                  <p className="text-2xl font-bold">{myProgress.completed}/{myProgress.total}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score Médio</p>
                  <p className="text-2xl font-bold text-green-500">{myProgress.avgScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tempo Total</p>
                  <p className="text-2xl font-bold">{myProgress.totalTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ranking</p>
                  <p className="text-2xl font-bold">#{myProgress.rank}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Progresso para {myProgress.nextBadge}</span>
                  <span>{myProgress.progressToBadge}%</span>
                </div>
                <Progress value={myProgress.progressToBadge} className="h-2" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Award className="h-16 w-16 text-yellow-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Cenários VR</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <Card 
                key={scenario.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedScenario === scenario.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{scenario.title}</CardTitle>
                    <Badge className={getDifficultyColor(scenario.difficulty)}>
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {scenario.description}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span>{scenario.duration}</span>
                    </div>
                    <div>
                      <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <span>{scenario.completions}</span>
                    </div>
                    <div>
                      <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                      <span>{scenario.avgScore}%</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((user) => (
                  <div 
                    key={user.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      user.rank <= 3 ? "bg-gradient-to-r from-yellow-500/10 to-transparent" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        user.rank === 1 ? "bg-yellow-500 text-yellow-950" :
                        user.rank === 2 ? "bg-gray-300 text-gray-700" :
                        user.rank === 3 ? "bg-orange-400 text-orange-950" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {user.rank}
                      </div>
                      <div>
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.scenarios} cenários completados
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{user.badge}</Badge>
                      <p className="text-xl font-bold text-primary">{user.score.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: "Primeiro Cenário", icon: "🎯", unlocked: true, description: "Complete seu primeiro cenário VR" },
                  { name: "Apagador de Incêndios", icon: "🔥", unlocked: true, description: "Complete todos os cenários de incêndio" },
                  { name: "Socorrista", icon: "🏥", unlocked: true, description: "Complete o cenário de emergência médica" },
                  { name: "Herói MOB", icon: "🌊", unlocked: true, description: "Score perfeito em Homem ao Mar" },
                  { name: "Expert em Abandono", icon: "🚤", unlocked: false, description: "Complete todos os níveis de abandono" },
                  { name: "Mestre de Emergências", icon: "👑", unlocked: false, description: "Complete todos os cenários com 90%+" }
                ].map((achievement, idx) => (
                  <div 
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked ? "bg-primary/5" : "bg-muted/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">{achievement.icon}</span>
                      <div>
                        <p className="font-semibold">{achievement.name}</p>
                        {achievement.unlocked && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics de Treinamento</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Análise detalhada de performance, áreas de melhoria e 
                  recomendações personalizadas baseadas em IA.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VRTrainingPage;
