import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Brain, 
  Eye,
  Battery,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Trophy,
  BookOpen,
  Activity,
  Heart,
  Zap,
  Shield,
  Calendar,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CrewMember {
  id: string;
  name: string;
  position: string;
  fatigueLevel: number;
  performanceScore: number;
  hoursWorked: number;
  restHours: number;
  competencyLevel: number;
  certifications: string[];
  achievements: Achievement[];
  trainingProgress: TrainingModule[];
  alertLevel: "green" | "yellow" | "red";
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  date: Date;
}

interface TrainingModule {
  id: string;
  name: string;
  category: string;
  progress: number;
  dueDate: Date;
  priority: "low" | "medium" | "high";
}

interface ShiftOptimization {
  crewMemberId: string;
  currentShift: string;
  recommendedShift: string;
  reason: string;
  impact: "positive" | "neutral" | "negative";
}

export const CrewIntelligenceSystem: React.FC = () => {
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<CrewMember | null>(null);
  const [shiftOptimizations, setShiftOptimizations] = useState<ShiftOptimization[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCrewData();
  }, []);

  const loadCrewData = () => {
    const mockCrew: CrewMember[] = [
      {
        id: "1",
        name: "Capitão João Silva",
        position: "Comandante",
        fatigueLevel: 25,
        performanceScore: 95,
        hoursWorked: 8,
        restHours: 12,
        competencyLevel: 98,
        certifications: ["Master Mariner", "STCW Advanced", "ECDIS"],
        achievements: [
          {
            id: "a1",
            title: "Navegador Expert",
            description: "1000 horas sem incidentes",
            points: 500,
            icon: "🏆",
            date: new Date("2025-01-15")
          },
          {
            id: "a2",
            title: "Mentor do Mês",
            description: "Treinamento de 5 oficiais",
            points: 300,
            icon: "👨‍🏫",
            date: new Date("2025-01-10")
          }
        ],
        trainingProgress: [
          {
            id: "t1",
            name: "Liderança Avançada",
            category: "Management",
            progress: 75,
            dueDate: new Date("2025-03-01"),
            priority: "medium"
          },
          {
            id: "t2",
            name: "Cyber Security at Sea",
            category: "Security",
            progress: 40,
            dueDate: new Date("2025-02-15"),
            priority: "high"
          }
        ],
        alertLevel: "green"
      },
      {
        id: "2",
        name: "Maria Santos",
        position: "Oficial de Máquinas",
        fatigueLevel: 45,
        performanceScore: 88,
        hoursWorked: 10,
        restHours: 8,
        competencyLevel: 92,
        certifications: ["Chief Engineer", "STCW II/2", "Refrigeration"],
        achievements: [
          {
            id: "a3",
            title: "Eficiência Energética",
            description: "15% economia de combustível",
            points: 400,
            icon: "⚡",
            date: new Date("2025-01-20")
          }
        ],
        trainingProgress: [
          {
            id: "t3",
            name: "Manutenção Preditiva",
            category: "Technical",
            progress: 60,
            dueDate: new Date("2025-02-28"),
            priority: "high"
          }
        ],
        alertLevel: "yellow"
      },
      {
        id: "3",
        name: "Pedro Costa",
        position: "Oficial de Náutica",
        fatigueLevel: 65,
        performanceScore: 82,
        hoursWorked: 12,
        restHours: 6,
        competencyLevel: 85,
        certifications: ["Officer of the Watch", "STCW II/1", "ARPA/RADAR"],
        achievements: [
          {
            id: "a4",
            title: "Vigilante Atento",
            description: "Detecção precoce de risco",
            points: 250,
            icon: "👁️",
            date: new Date("2025-01-18")
          }
        ],
        trainingProgress: [
          {
            id: "t4",
            name: "Bridge Resource Management",
            category: "Operations",
            progress: 30,
            dueDate: new Date("2025-02-20"),
            priority: "high"
          }
        ],
        alertLevel: "red"
      }
    ];

    setCrewMembers(mockCrew);
    setSelectedCrew(mockCrew[0]);
  };

  const analyzeCrewOptimization = () => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const optimizations: ShiftOptimization[] = [
        {
          crewMemberId: "3",
          currentShift: "00:00 - 12:00",
          recommendedShift: "08:00 - 16:00",
          reason: "Alto nível de fadiga detectado. Recomenda-se descanso imediato de 10 horas.",
          impact: "positive"
        },
        {
          crewMemberId: "2",
          currentShift: "12:00 - 20:00",
          recommendedShift: "14:00 - 22:00",
          reason: "Fadiga moderada. Ajuste de 2 horas para otimizar desempenho.",
          impact: "positive"
        }
      ];

      setShiftOptimizations(optimizations);
      setIsAnalyzing(false);

      toast({
        title: "✅ Análise Completa",
        description: `${optimizations.length} otimizações de escala identificadas`,
      });
    }, 2000);
  };

  const getFatigueLevelColor = (level: number) => {
    if (level < 30) return "bg-green-500";
    if (level < 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getAlertBadgeColor = (alert: CrewMember["alertLevel"]) => {
    switch (alert) {
    case "green": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    case "yellow": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    case "red": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
    }
  };

  const getPriorityColor = (priority: TrainingModule["priority"]) => {
    switch (priority) {
    case "low": return "text-muted-foreground";
    case "medium": return "text-yellow-600";
    case "high": return "text-red-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Crew Intelligence System
                  <Badge className="bg-green-400 text-green-900 hover:bg-green-300">
                    <Eye className="h-3 w-3 mr-1" />
                    AI VISUAL
                  </Badge>
                </CardTitle>
                <CardDescription className="text-white/90">
                  Detecção de fadiga por IA, otimização de escalas e análise de performance
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={analyzeCrewOptimization}
              disabled={isAnalyzing}
              size="lg"
              className="bg-white text-indigo-600 hover:bg-white/90"
            >
              <Zap className="h-5 w-5 mr-2" />
              {isAnalyzing ? "Analisando..." : "Otimizar Escalas"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Crew Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {crewMembers.map((crew) => (
          <Card 
            key={crew.id}
            className={`cursor-pointer transition-all ${
              selectedCrew?.id === crew.id ? "border-primary border-2" : "hover:border-primary/50"
            }`}
            onClick={() => setSelectedCrew(crew)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{crew.name}</h3>
                  <p className="text-sm text-muted-foreground">{crew.position}</p>
                </div>
                <Badge className={getAlertBadgeColor(crew.alertLevel)}>
                  {crew.alertLevel === "green" ? "✅ OK" : 
                    crew.alertLevel === "yellow" ? "⚠️ Atenção" : "🔴 Alerta"}
                </Badge>
              </div>

              <div className="space-y-3">
                {/* Fatigue Level */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      Nível de Fadiga
                    </span>
                    <span className="font-medium">{crew.fatigueLevel}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getFatigueLevelColor(crew.fatigueLevel)} transition-all`}
                      style={{ width: `${crew.fatigueLevel}%` }}
                    />
                  </div>
                </div>

                {/* Performance Score */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Performance
                    </span>
                    <span className="font-medium">{crew.performanceScore}%</span>
                  </div>
                  <Progress value={crew.performanceScore} className="h-2" />
                </div>

                {/* Work/Rest Hours */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{crew.hoursWorked}h trabalho</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span>{crew.restHours}h descanso</span>
                  </div>
                </div>

                {/* Competency */}
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    Competência
                  </span>
                  <span className="text-xs font-medium">{crew.competencyLevel}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed View */}
      {selectedCrew && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance & Training */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Treinamento Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCrew.trainingProgress.map((module) => (
                <div key={module.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{module.name}</h4>
                      <p className="text-xs text-muted-foreground">{module.category}</p>
                    </div>
                    <Badge className={getPriorityColor(module.priority)}>
                      {module.priority === "high" ? "🔥 Alta" : 
                        module.priority === "medium" ? "⚡ Média" : "📋 Baixa"}
                    </Badge>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span>{module.progress}% completo</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {module.dueDate.toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements & Gamification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Conquistas e Gamificação
              </CardTitle>
              <CardDescription>
                Sistema de mérito e reconhecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Total de Pontos</span>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                      {selectedCrew.achievements.reduce((sum, a) => sum + a.points, 0)}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(selectedCrew.achievements.reduce((sum, a) => sum + a.points, 0) / 1000) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Próxima recompensa: 1000 pontos
                </p>
              </div>

              {selectedCrew.achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        {achievement.points} pontos
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {achievement.date.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shift Optimizations */}
      {shiftOptimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Otimizações de Escala Recomendadas
            </CardTitle>
            <CardDescription>
              IA analisou padrões de fadiga e sugere os seguintes ajustes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shiftOptimizations.map((opt, idx) => {
              const crew = crewMembers.find(c => c.id === opt.crewMemberId);
              return (
                <div key={idx} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">{crew?.name}</h4>
                      <p className="text-sm text-muted-foreground">{crew?.position}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      ✅ Recomendado
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Escala Atual</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{opt.currentShift}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Escala Recomendada</span>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{opt.recommendedShift}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <p className="text-sm text-blue-900 dark:text-blue-300">
                      <strong>Justificativa:</strong> {opt.reason}
                    </p>
                  </div>
                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aplicar Otimização
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Compliance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status de Compliance Regulatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">STCW Rest Hours</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={92} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                92% da tripulação em compliance (min. 10h/24h)
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Certificações Válidas</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={100} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                100% das certificações atualizadas
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Treinamento em Dia</span>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <Progress value={78} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                78% dos módulos completos - 2 pendentes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
