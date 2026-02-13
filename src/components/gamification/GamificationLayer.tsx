/**
 * Gamification Layer - Points, Badges, Leaderboards, Challenges
 */

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Medal,
  Star,
  Award,
  Target,
  Flame,
  Zap,
  Users,
  TrendingUp,
  Crown,
  Gift,
  Calendar,
  CheckCircle,
  Lock,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  points: number;
  level: number;
  streak: number;
  badges: string[];
  rank: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  deadline: Date;
  progress: number;
  target: number;
  type: "daily" | "weekly" | "monthly" | "special";
  completed: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const USERS: User[] = [
  { id: "u1", name: "Carlos Silva", role: "Chief Engineer", avatar: "", points: 12450, level: 15, streak: 28, badges: ["🏆", "⭐", "🔥"], rank: 1 },
  { id: "u2", name: "Maria Santos", role: "Safety Officer", avatar: "", points: 11200, level: 14, streak: 21, badges: ["🛡️", "📊"], rank: 2 },
  { id: "u3", name: "João Oliveira", role: "Master", avatar: "", points: 10850, level: 13, streak: 14, badges: ["🚢", "🎯"], rank: 3 },
  { id: "u4", name: "Ana Costa", role: "Chief Officer", avatar: "", points: 9500, level: 12, streak: 7, badges: ["📈"], rank: 4 },
  { id: "u5", name: "Pedro Lima", role: "Engineer", avatar: "", points: 8200, level: 11, streak: 3, badges: [], rank: 5 },
  { id: "u6", name: "Lucia Ferreira", role: "DPO", avatar: "", points: 7800, level: 10, streak: 12, badges: ["🎮"], rank: 6 }
];

const CHALLENGES: Challenge[] = [
  { id: "c1", title: "Completar Checklist Diário", description: "Complete todos os itens do checklist de segurança", points: 50, deadline: new Date(), progress: 8, target: 10, type: "daily", completed: false },
  { id: "c2", title: "Zero Incidentes", description: "Mantenha 7 dias sem incidentes de segurança", points: 200, deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), progress: 5, target: 7, type: "weekly", completed: false },
  { id: "c3", title: "Treinamento Completo", description: "Complete 3 módulos de treinamento", points: 150, deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), progress: 2, target: 3, type: "weekly", completed: false },
  { id: "c4", title: "Relatório Perfeito", description: "Submeta 10 relatórios sem erros", points: 300, deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), progress: 7, target: 10, type: "monthly", completed: false },
  { id: "c5", title: "Economia de Combustível", description: "Reduza consumo em 5% vs mês anterior", points: 500, deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), progress: 3, target: 5, type: "monthly", completed: false },
  { id: "c6", title: "Maratona de Conformidade", description: "30 dias com 100% compliance", points: 1000, deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), progress: 15, target: 30, type: "special", completed: false }
];

const ACHIEVEMENTS: Achievement[] = [
  { id: "a1", name: "Primeiro Login", description: "Acesse o sistema pela primeira vez", icon: "🚀", points: 10, unlocked: true, unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), rarity: "common" },
  { id: "a2", name: "Checklist Master", description: "Complete 100 checklists", icon: "✅", points: 100, unlocked: true, unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), rarity: "common" },
  { id: "a3", name: "Safety Champion", description: "30 dias sem incidentes", icon: "🛡️", points: 250, unlocked: true, unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), rarity: "rare" },
  { id: "a4", name: "Training Expert", description: "Complete 20 treinamentos", icon: "🎓", points: 200, unlocked: true, unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), rarity: "rare" },
  { id: "a5", name: "Report Pro", description: "Submeta 50 relatórios", icon: "📊", points: 150, unlocked: true, unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), rarity: "common" },
  { id: "a6", name: "Streak Master", description: "Mantenha 14 dias de streak", icon: "🔥", points: 300, unlocked: true, unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), rarity: "rare" },
  { id: "a7", name: "Green Hero", description: "Score ESG > 90", icon: "🌿", points: 500, unlocked: false, rarity: "epic" },
  { id: "a8", name: "Fleet Legend", description: "#1 no ranking por 3 meses", icon: "👑", points: 1000, unlocked: false, rarity: "legendary" },
  { id: "a9", name: "Perfect Year", description: "365 dias sem incidentes graves", icon: "⭐", points: 2000, unlocked: false, rarity: "legendary" }
];

export function GamificationLayer() {
  const [activeTab, setActiveTab] = useState("overview");
  const currentUser = USERS[0]; // Simulating logged user

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-gradient-to-r from-warning to-warning text-warning-foreground";
      case "epic": return "bg-gradient-to-r from-secondary to-accent text-secondary-foreground";
      case "rare": return "bg-gradient-to-r from-primary to-info text-primary-foreground";
      default: return "bg-muted/50 text-muted-foreground";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-warning" />;
      case 2: return <Medal className="h-6 w-6 text-muted-foreground" />;
      case 3: return <Medal className="h-6 w-6 text-warning" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case "daily": return "bg-success/20 text-success";
      case "weekly": return "bg-info/20 text-info";
      case "monthly": return "bg-accent/20 text-accent";
      case "special": return "bg-gradient-to-r from-warning to-warning text-warning-foreground";
      default: return "bg-muted";
    }
  };

  const levelProgress = (currentUser.points % 1000) / 10;
  const pointsToNextLevel = 1000 - (currentUser.points % 1000);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl">
            <Trophy className="h-6 w-6 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Gamification
              <Badge className="bg-gradient-to-r from-warning to-warning">
                <Sparkles className="h-3 w-3 mr-1" />
                Level {currentUser.level}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground">
              Pontos • Badges • Desafios • Leaderboard
            </p>
          </div>
        </div>
      </div>

      {/* User Stats Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {currentUser.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold">{currentUser.name}</h3>
                <p className="text-muted-foreground">{currentUser.role}</p>
                <div className="flex items-center gap-2 mt-2">
                  {currentUser.badges.map((badge) => (
                    <span key={badge} className="text-2xl">{badge}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">{currentUser.points.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">Pontos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <span className="text-2xl font-bold">{currentUser.level}</span>
                </div>
                <p className="text-sm text-muted-foreground">Level</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">{currentUser.streak}</span>
                </div>
                <p className="text-sm text-muted-foreground">Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold">#{currentUser.rank}</span>
                </div>
                <p className="text-sm text-muted-foreground">Rank</p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Progresso para Level {currentUser.level + 1}</span>
              <span>{pointsToNextLevel} pontos restantes</span>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Target className="h-4 w-4 mr-2" />
            Desafios
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="achievements">
            <Award className="h-4 w-4 mr-2" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="rewards">
            <Gift className="h-4 w-4 mr-2" />
            Recompensas
          </TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHALLENGES.map((challenge) => (
              <Card key={challenge.id} className={challenge.completed ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={getChallengeTypeColor(challenge.type)}>
                      {challenge.type === "daily" && "Diário"}
                      {challenge.type === "weekly" && "Semanal"}
                      {challenge.type === "monthly" && "Mensal"}
                      {challenge.type === "special" && "Especial"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="font-bold">{challenge.points}</span>
                    </div>
                  </div>
                  <CardTitle className="text-sm">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{challenge.progress}/{challenge.target}</span>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {challenge.deadline.toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <Progress value={(challenge.progress / challenge.target) * 100} />
                    {challenge.completed && (
                      <Badge className="bg-success/20 text-success w-full justify-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Global</CardTitle>
              <CardDescription>Classificação baseada em pontos totais</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {USERS.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 border rounded-lg flex items-center justify-between ${
                      user.id === currentUser.id ? "bg-primary/5 border-primary/30" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 flex justify-center">
                        {getRankIcon(user.rank)}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-warning" />
                        <span>{user.streak} dias</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>Lvl {user.level}</span>
                      </div>
                      <div className="flex items-center gap-1 min-w-20 justify-end">
                        <Star className="h-4 w-4 text-warning" />
                        <span className="font-bold">{user.points.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ACHIEVEMENTS.map((achievement) => (
              <Card
                key={achievement.id}
                className={!achievement.unlocked ? "opacity-60 grayscale" : ""}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <span className="text-5xl">{achievement.icon}</span>
                    <h3 className="font-bold mt-3">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        {achievement.points}
                      </Badge>
                    </div>
                    {achievement.unlocked ? (
                      <p className="text-xs text-muted-foreground mt-2">
                        Desbloqueado em {achievement.unlockedAt?.toLocaleDateString("pt-BR")}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center gap-1 mt-2 text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        <span className="text-xs">Bloqueado</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Loja de Recompensas</CardTitle>
              <CardDescription>Troque seus pontos por benefícios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "Day Off Extra", points: 5000, icon: "🏖️", available: true },
                  { name: "Voucher R$ 100", points: 3000, icon: "🎁", available: true },
                  { name: "Curso Premium", points: 2000, icon: "🎓", available: true },
                  { name: "Equipamento Personalizado", points: 4000, icon: "🎽", available: true },
                  { name: "Mentoria com Capitão", points: 1500, icon: "🚢", available: true },
                  { name: "Certificação Especial", points: 8000, icon: "📜", available: false }
                ].map((reward) => (
                  <Card key={reward.name}>
                    <CardContent className="pt-6 text-center">
                      <span className="text-4xl">{reward.icon}</span>
                      <h3 className="font-bold mt-2">{reward.name}</h3>
                      <div className="flex items-center justify-center gap-1 my-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-bold">{reward.points.toLocaleString()}</span>
                      </div>
                      <Button
                        className="w-full"
                        disabled={!reward.available || currentUser.points < reward.points}
                      >
                        {currentUser.points >= reward.points ? "Resgatar" : "Pontos insuficientes"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GamificationLayer;
