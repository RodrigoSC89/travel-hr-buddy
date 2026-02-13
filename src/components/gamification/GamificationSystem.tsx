/**
 * GamificationSystem - Full gamification experience with real data
 */
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Star, Award, Target, Users, TrendingUp,
  Medal, Crown, Flame, Zap, Shield, Heart, Gift, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useGamificationData } from "@/hooks/useGamificationData";

const BADGE_ICONS: Record<string, React.ComponentType<any>> = {
  "1": Shield, "2": Award, "3": Star, "4": Zap, "5": Users, "6": Heart,
};

export function GamificationSystem() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data, isLoading } = useGamificationData();

  const leaderboard = data?.leaderboard || [];
  const badges = data?.badges || [];
  const challenges = data?.challenges || [];

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
      case 1: return <Crown className="h-5 w-5 text-warning" />;
      case 2: return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3: return <Medal className="h-5 w-5 text-warning" />;
      default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const topUser = leaderboard[0];

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-primary">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {topUser ? topUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-warning">
                <Crown className="h-4 w-4 text-warning-foreground" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{topUser?.name || "Sem dados"}</h2>
                <Badge className="bg-gradient-to-r from-warning to-warning/80 text-warning-foreground">
                  Level {Math.floor((topUser?.points || 0) / 500)}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-3">{topUser?.vessel || "Sem embarcação"}</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-warning" />
                  <span className="font-bold">{topUser?.points?.toLocaleString() || 0}</span>
                  <span className="text-sm text-muted-foreground">pontos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-destructive" />
                  <span className="font-bold">{topUser?.streak || 0}</span>
                  <span className="text-sm text-muted-foreground">dias streak</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-accent" />
                  <span className="font-bold">{badges.filter(b => b.earned).length}</span>
                  <span className="text-sm text-muted-foreground">badges</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2"><TrendingUp className="h-4 w-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2"><Trophy className="h-4 w-4" />Ranking</TabsTrigger>
          <TabsTrigger value="badges" className="gap-2"><Award className="h-4 w-4" />Conquistas</TabsTrigger>
          <TabsTrigger value="challenges" className="gap-2"><Target className="h-4 w-4" />Desafios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Star className="h-4 w-4 text-warning" />Total de Pontos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leaderboard.reduce((acc, l) => acc + l.points, 0).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Todos os tripulantes</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Target className="h-4 w-4 text-info" />Desafios Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{challenges.length}</div>
                <p className="text-xs text-muted-foreground">{challenges.filter(c => c.progress >= 75).length} quase completos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4 text-accent" />Participantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{leaderboard.length}</div>
                <p className="text-xs text-muted-foreground">Tripulantes ativos</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-warning" />Ranking</CardTitle>
              <CardDescription>Top performers da frota</CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum tripulante cadastrado</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {leaderboard.map((user, index) => (
                      <motion.div
                        key={user.rank}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "flex items-center gap-4 p-3 rounded-lg",
                          user.rank === 1 ? "bg-warning/10 border border-warning/20" :
                          user.rank === 2 ? "bg-muted/50" :
                          user.rank === 3 ? "bg-warning/10" : "bg-muted/30"
                        )}
                      >
                        <div className="w-8 flex justify-center">{getRankBadge(user.rank)}</div>
                        <Avatar><AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.vessel}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame className="h-4 w-4 text-destructive" />
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.id] || Award;
              return (
                <motion.div
                  key={badge.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn("relative p-4 rounded-xl border", badge.earned ? "bg-card" : "bg-muted/30 opacity-60")}
                >
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3",
                    badge.earned ? `bg-gradient-to-br ${getRarityColor(badge.rarity)}` : "bg-muted"
                  )}>
                    <Icon className={cn("h-8 w-8", badge.earned ? "text-primary-foreground" : "text-muted-foreground")} />
                  </div>
                  <h3 className="text-center font-medium mb-1">{badge.name}</h3>
                  <p className="text-center text-xs text-muted-foreground">{badge.description}</p>
                  <Badge className={cn(
                    "absolute top-2 right-2 text-[10px]",
                    badge.rarity === "legendary" ? "bg-warning" :
                    badge.rarity === "epic" ? "bg-accent" :
                    badge.rarity === "rare" ? "bg-info" : "bg-muted-foreground"
                  )}>{badge.rarity}</Badge>
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

        <TabsContent value="challenges" className="mt-6">
          <div className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum desafio ativo</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <Card key={challenge.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge variant="secondary" className="gap-1"><Gift className="h-3 w-3" />{challenge.reward} pts</Badge>
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
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" />{challenge.participants} participantes</span>
                        <span>Termina em {challenge.deadline}</span>
                      </div>
                      <Button size="sm">Ver Detalhes</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default GamificationSystem;
