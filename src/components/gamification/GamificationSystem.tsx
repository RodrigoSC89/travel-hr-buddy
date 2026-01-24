/**
 * GamificationSystem - Full gamification experience
 * Points, badges, leaderboards, challenges
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Star, Award, Target, Users, TrendingUp,
  Medal, Crown, Flame, Zap, Shield, Heart, Gift
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Mock data
const mockLeaderboard = [
  { rank: 1, name: "Carlos Silva", vessel: "OSV Atlântico", points: 12450, avatar: "", streak: 15 },
  { rank: 2, name: "Ana Santos", vessel: "PSV Oceânico", points: 11200, avatar: "", streak: 12 },
  { rank: 3, name: "Roberto Lima", vessel: "AHTS Marítimo", points: 10800, avatar: "", streak: 8 },
  { rank: 4, name: "Marina Costa", vessel: "OSV Tropical", points: 9500, avatar: "", streak: 5 },
  { rank: 5, name: "João Oliveira", vessel: "PSV Norte", points: 8900, avatar: "", streak: 3 },
];

const mockBadges = [
  { id: "1", name: "Safety Champion", icon: Shield, description: "100 dias sem incidentes", earned: true, rarity: "legendary" },
  { id: "2", name: "Compliance Master", icon: Award, description: "Todas auditorias aprovadas", earned: true, rarity: "epic" },
  { id: "3", name: "Training Expert", icon: Star, description: "50 treinamentos concluídos", earned: true, rarity: "rare" },
  { id: "4", name: "Early Bird", icon: Zap, description: "Check-in antes das 6h por 30 dias", earned: false, rarity: "rare" },
  { id: "5", name: "Team Player", icon: Users, description: "Ajudou 20 colegas", earned: true, rarity: "common" },
  { id: "6", name: "Green Warrior", icon: Heart, description: "ESG Score acima de 90", earned: false, rarity: "epic" },
];

const mockChallenges = [
  { id: "1", title: "Zero Incidentes Janeiro", description: "Mantenha zero incidentes no mês", progress: 75, reward: 500, deadline: "31 Jan", participants: 45 },
  { id: "2", title: "Treinamento Completo", description: "Complete 5 treinamentos esta semana", progress: 60, reward: 200, deadline: "5 dias", participants: 120 },
  { id: "3", title: "Eco Champion", description: "Reduza emissões em 10%", progress: 40, reward: 350, deadline: "28 Fev", participants: 32 },
];

export function GamificationSystem() {
  const [activeTab, setActiveTab] = useState("overview");

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "from-warning to-warning";
      case "epic": return "from-secondary to-accent";
      case "rare": return "from-primary to-info";
      default: return "from-muted to-muted-foreground";
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/20">CS</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-yellow-500">
                <Crown className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Carlos Silva</h2>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                  Level 24
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">OSV Atlântico • Capitão</p>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="font-bold">12,450</span>
                  <span className="text-sm text-muted-foreground">pontos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="font-bold">15</span>
                  <span className="text-sm text-muted-foreground">dias streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="font-bold">8</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Próximo nível</p>
              <Progress value={72} className="w-40 h-2 mb-1" />
              <p className="text-xs text-muted-foreground">2,550 XP para Level 25</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2">
            <Target className="h-4 w-4" />
            Desafios
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  Pontos Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">+245</div>
                <p className="text-xs text-green-500">↑ 15% vs ontem</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Desafios Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">1 quase completo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Posição Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">#1</div>
                <p className="text-xs text-green-500">Líder da semana!</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "Completou treinamento SOLAS", points: "+50", time: "2h atrás", icon: Award },
                  { action: "Check-in diário realizado", points: "+10", time: "6h atrás", icon: Zap },
                  { action: "Relatório de segurança enviado", points: "+25", time: "1d atrás", icon: Shield },
                  { action: "Ajudou colega com procedimento", points: "+15", time: "2d atrás", icon: Users },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-600">
                      {activity.points}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Ranking Semanal
              </CardTitle>
              <CardDescription>Top performers da frota</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {mockLeaderboard.map((user, index) => (
                    <motion.div
                      key={user.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg",
                        user.rank === 1 ? "bg-yellow-500/10 border border-yellow-500/20" :
                        user.rank === 2 ? "bg-gray-500/10" :
                        user.rank === 3 ? "bg-amber-500/10" : "bg-muted/30"
                      )}
                    >
                      <div className="w-8 flex justify-center">
                        {getRankBadge(user.rank)}
                      </div>
                      <Avatar>
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.vessel}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{user.streak}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">pontos</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges */}
        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {mockBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative p-4 rounded-xl border",
                    badge.earned ? "bg-card" : "bg-muted/30 opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3",
                    badge.earned 
                      ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}`
                      : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-8 w-8",
                      badge.earned ? "text-white" : "text-muted-foreground"
                    )} />
                  </div>
                  <h3 className="text-center font-medium mb-1">{badge.name}</h3>
                  <p className="text-center text-xs text-muted-foreground">{badge.description}</p>
                  <Badge 
                    className={cn(
                      "absolute top-2 right-2 text-[10px]",
                      badge.rarity === "legendary" ? "bg-yellow-500" :
                      badge.rarity === "epic" ? "bg-purple-500" :
                      badge.rarity === "rare" ? "bg-blue-500" : "bg-gray-500"
                    )}
                  >
                    {badge.rarity}
                  </Badge>
                  {!badge.earned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-xl">
                      <Gift className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Challenges */}
        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            {mockChallenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                      <Gift className="h-3 w-3" />
                      {challenge.reward} pts
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span className="font-medium">{challenge.progress}%</span>
                    </div>
                    <Progress value={challenge.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participantes
                      </span>
                      <span>Termina em {challenge.deadline}</span>
                    </div>
                    <Button size="sm">Ver Detalhes</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GamificationSystem;
