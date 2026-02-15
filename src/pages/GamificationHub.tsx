/**
 * Gamification Hub - Complete engagement & achievement system
 * Leaderboards, badges, streaks, challenges, and XP tracking
 */
import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Star, Flame, Target, Shield, BookOpen, Clock,
  Award, Zap, CheckCircle2, Lock, TrendingUp, Crown,
  Users, Medal, Compass, Anchor, Ship, BarChart3,
  Sparkles, Heart, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ============================================
// BADGE DEFINITIONS - Maritime Themed
// ============================================
interface BadgeDef {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  description: string;
  criteria: string;
  requiredValue: number;
  category: "learning" | "consistency" | "mastery" | "maritime" | "compliance" | "leadership";
  tier: "bronze" | "silver" | "gold" | "platinum" | "master";
  xpReward: number;
}

const ALL_BADGES: BadgeDef[] = [
  // Learning
  { id: "first-voyage", name: "Primeira Viagem", emoji: "⛵", icon: Compass, description: "Complete seu primeiro treinamento", criteria: "1 curso", requiredValue: 1, category: "learning", tier: "bronze", xpReward: 50 },
  { id: "navigator", name: "Navegador", emoji: "🧭", icon: Compass, description: "Complete 10 treinamentos", criteria: "10 cursos", requiredValue: 10, category: "learning", tier: "silver", xpReward: 200 },
  { id: "captain", name: "Capitão", emoji: "👨‍✈️", icon: Anchor, description: "Complete 25 treinamentos", criteria: "25 cursos", requiredValue: 25, category: "learning", tier: "gold", xpReward: 500 },
  { id: "admiral", name: "Almirante", emoji: "🎖️", icon: Crown, description: "Complete 50+ treinamentos", criteria: "50+ cursos", requiredValue: 50, category: "learning", tier: "master", xpReward: 2000 },
  // Consistency
  { id: "steady-hand", name: "Mão Firme", emoji: "🎯", icon: Target, description: "7 dias consecutivos ativo", criteria: "7 dias seguidos", requiredValue: 7, category: "consistency", tier: "bronze", xpReward: 100 },
  { id: "iron-will", name: "Vontade de Ferro", emoji: "💪", icon: Flame, description: "30 dias consecutivos ativo", criteria: "30 dias seguidos", requiredValue: 30, category: "consistency", tier: "gold", xpReward: 500 },
  { id: "lighthouse", name: "Farol", emoji: "🗼", icon: Flame, description: "90 dias consecutivos ativo", criteria: "90 dias seguidos", requiredValue: 90, category: "consistency", tier: "platinum", xpReward: 1500 },
  // Maritime compliance
  { id: "stcw-master", name: "Mestre STCW", emoji: "📜", icon: Shield, description: "100% certificados STCW em dia", criteria: "100% STCW", requiredValue: 100, category: "compliance", tier: "platinum", xpReward: 1000 },
  { id: "safety-champion", name: "Campeão de Segurança", emoji: "🛡️", icon: Shield, description: "Zero incidentes em 180 dias", criteria: "180 dias sem incidentes", requiredValue: 180, category: "maritime", tier: "gold", xpReward: 800 },
  { id: "speed-demon", name: "Veloz", emoji: "⚡", icon: Zap, description: "3 cursos em um mês", criteria: "3 cursos/mês", requiredValue: 3, category: "consistency", tier: "silver", xpReward: 150 },
  { id: "perfectionist", name: "Perfeccionista", emoji: "💎", icon: Star, description: "5 notas perfeitas", criteria: "5 notas 100%", requiredValue: 5, category: "mastery", tier: "gold", xpReward: 400 },
  { id: "mentor", name: "Mentor", emoji: "🧑‍🏫", icon: Heart, description: "Ajude 10 colegas com treinamento", criteria: "10 mentorias", requiredValue: 10, category: "leadership", tier: "gold", xpReward: 600 },
  { id: "time-sailor", name: "Marinheiro do Tempo", emoji: "⏳", icon: Clock, description: "40h de treinamento acumuladas", criteria: "40h estudadas", requiredValue: 40, category: "learning", tier: "gold", xpReward: 300 },
  { id: "fleet-hero", name: "Herói da Frota", emoji: "🚢", icon: Ship, description: "Contribua em 5 embarcações", criteria: "5 navios", requiredValue: 5, category: "maritime", tier: "platinum", xpReward: 1200 },
];

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: "bg-amber-900/20", border: "border-amber-700/40", text: "text-amber-600", glow: "" },
  silver: { bg: "bg-slate-300/10", border: "border-slate-400/40", text: "text-slate-400", glow: "" },
  gold: { bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-500", glow: "shadow-yellow-500/20 shadow-md" },
  platinum: { bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400", glow: "shadow-cyan-500/20 shadow-md" },
  master: { bg: "bg-gradient-to-br from-purple-500/15 to-yellow-500/15", border: "border-purple-500/50", text: "text-purple-400", glow: "shadow-purple-500/30 shadow-lg ring-1 ring-purple-500/20" },
};

// ============================================
// MOCK LEADERBOARD (will be replaced by Supabase)
// ============================================
const LEADERBOARD = [
  { rank: 1, name: "Carlos Silva", role: "Chief Officer", xp: 4850, level: 10, badges: 12, streak: 45, avatar: "CS" },
  { rank: 2, name: "Ana Santos", role: "DPO", xp: 4200, level: 9, badges: 11, streak: 32, avatar: "AS" },
  { rank: 3, name: "Pedro Lima", role: "2nd Engineer", xp: 3800, level: 8, badges: 10, streak: 28, avatar: "PL" },
  { rank: 4, name: "Maria Costa", role: "Safety Officer", xp: 3500, level: 8, badges: 9, streak: 21, avatar: "MC" },
  { rank: 5, name: "João Ferreira", role: "AB Seaman", xp: 3100, level: 7, badges: 8, streak: 15, avatar: "JF" },
  { rank: 6, name: "Lucia Mendes", role: "Cook", xp: 2800, level: 6, badges: 7, streak: 12, avatar: "LM" },
  { rank: 7, name: "Roberto Dias", role: "Electrician", xp: 2500, level: 6, badges: 6, streak: 10, avatar: "RD" },
  { rank: 8, name: "Fernanda Rocha", role: "Cadet", xp: 2100, level: 5, badges: 5, streak: 7, avatar: "FR" },
];

// ============================================
// WEEKLY CHALLENGES
// ============================================
const CHALLENGES = [
  { id: "c1", title: "Maratona de Segurança", description: "Complete 3 módulos de segurança esta semana", progress: 2, target: 3, xpReward: 200, deadline: "3 dias", icon: Shield, color: "text-red-500" },
  { id: "c2", title: "Embaixador Ambiental", description: "Conclua o treinamento MARPOL Anexo VI", progress: 0, target: 1, xpReward: 150, deadline: "5 dias", icon: Compass, color: "text-green-500" },
  { id: "c3", title: "Sprint de Conhecimento", description: "Estude 5h esta semana", progress: 3.5, target: 5, xpReward: 100, deadline: "4 dias", icon: BookOpen, color: "text-blue-500" },
  { id: "c4", title: "Nota Perfeita", description: "Tire 100% em qualquer avaliação", progress: 0, target: 1, xpReward: 300, deadline: "7 dias", icon: Star, color: "text-yellow-500" },
];

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch real user progress from academy_progress
  const { data: academyProgress } = useQuery({
    queryKey: ["gamification-progress"],
    queryFn: async () => {
      const { data } = await supabase
        .from("academy_progress")
        .select("*")
        .eq("status", "completed");
      return data || [];
    },
  });

  const completedCourses = academyProgress?.length ?? 0;

  // Simulated progress (in production, aggregate from multiple tables)
  const userProgress = useMemo(() => ({
    totalCoursesCompleted: Math.max(completedCourses, 12),
    totalHoursStudied: 24.5,
    consecutiveDaysActive: 14,
    coursesThisMonth: 3,
    perfectScores: 2,
    safetyDays: 120,
    mentorships: 3,
    vesselsServed: 2,
    stcwCompliance: 85,
  }), [completedCourses]);

  const badgeStates = useMemo(() => {
    return ALL_BADGES.map((badge) => {
      let currentValue = 0;
      switch (badge.id) {
        case "first-voyage": case "navigator": case "captain": case "admiral":
          currentValue = userProgress.totalCoursesCompleted; break;
        case "steady-hand": case "iron-will": case "lighthouse":
          currentValue = userProgress.consecutiveDaysActive; break;
        case "speed-demon":
          currentValue = userProgress.coursesThisMonth; break;
        case "perfectionist":
          currentValue = userProgress.perfectScores; break;
        case "stcw-master":
          currentValue = userProgress.stcwCompliance; break;
        case "safety-champion":
          currentValue = userProgress.safetyDays; break;
        case "time-sailor":
          currentValue = userProgress.totalHoursStudied; break;
        case "mentor":
          currentValue = userProgress.mentorships; break;
        case "fleet-hero":
          currentValue = userProgress.vesselsServed; break;
      }
      const earned = currentValue >= badge.requiredValue;
      const progressPercent = Math.min(100, Math.round((currentValue / badge.requiredValue) * 100));
      return { ...badge, currentValue, earned, progressPercent };
    });
  }, [userProgress]);

  const earnedCount = badgeStates.filter(b => b.earned).length;
  const totalXP = badgeStates.filter(b => b.earned).reduce((sum, b) => sum + b.xpReward, 0);
  const currentLevel = Math.floor(totalXP / 500) + 1;
  const xpToNext = 500 - (totalXP % 500);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <Helmet>
        <title>Gamificação | Nauti One</title>
        <meta name="description" content="Sistema de conquistas, badges e ranking da tripulação marítima" />
      </Helmet>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Centro de Conquistas
            </h1>
            <p className="text-muted-foreground mt-1">Seu progresso, conquistas e ranking na tripulação</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{currentLevel}</div>
              <div className="text-xs text-muted-foreground">Nível</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{totalXP}</div>
              <div className="text-xs text-muted-foreground">XP Total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{earnedCount}</div>
              <div className="text-xs text-muted-foreground">Badges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 flex items-center gap-1">
                <Flame className="h-5 w-5" />
                {userProgress.consecutiveDaysActive}
              </div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
          </div>
        </div>
        {/* Level progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Nível {currentLevel}</span>
            <span className="text-muted-foreground">{xpToNext} XP para nível {currentLevel + 1}</span>
          </div>
          <Progress value={((totalXP % 500) / 500) * 100} className="h-3" />
        </div>
        <Sparkles className="absolute top-4 right-4 h-20 w-20 text-primary/5" />
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview" className="gap-1"><Trophy className="h-4 w-4" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="badges" className="gap-1"><Award className="h-4 w-4" /> Badges</TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-1"><BarChart3 className="h-4 w-4" /> Ranking</TabsTrigger>
          <TabsTrigger value="challenges" className="gap-1"><Target className="h-4 w-4" /> Desafios</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recent Badges */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-yellow-500" /> Badges Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {badgeStates.filter(b => b.earned).slice(0, 6).map(badge => (
                    <div key={badge.id} className={cn("p-2 rounded-lg border text-center", TIER_COLORS[badge.tier].bg, TIER_COLORS[badge.tier].border)}>
                      <div className="text-xl">{badge.emoji}</div>
                      <div className={cn("text-[9px] font-medium", TIER_COLORS[badge.tier].text)}>{badge.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Challenge Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Desafio da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                {CHALLENGES.slice(0, 2).map(challenge => {
                  const CIcon = challenge.icon;
                  return (
                    <div key={challenge.id} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CIcon className={cn("h-4 w-4", challenge.color)} />
                        <span className="text-xs font-medium">{challenge.title}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto">+{challenge.xpReward} XP</Badge>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5" />
                      <span className="text-[10px] text-muted-foreground">{challenge.progress}/{challenge.target} • {challenge.deadline}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-yellow-500" /> Top 3</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {LEADERBOARD.slice(0, 3).map((user, i) => (
                  <div key={user.rank} className="flex items-center gap-3">
                    <div className={cn("text-lg font-bold w-6 text-center", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-amber-700")}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </div>
                    <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{user.avatar}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{user.xp} XP</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BADGES TAB */}
        <TabsContent value="badges" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(["learning", "consistency", "mastery", "maritime", "compliance", "leadership"] as const).map(category => {
              const categoryBadges = badgeStates.filter(b => b.category === category);
              const categoryLabels = {
                learning: "📚 Aprendizado",
                consistency: "🔥 Consistência",
                mastery: "💎 Maestria",
                maritime: "🚢 Marítimo",
                compliance: "🛡️ Compliance",
                leadership: "👑 Liderança",
              };

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{categoryLabels[category]}</CardTitle>
                    <CardDescription className="text-xs">
                      {categoryBadges.filter(b => b.earned).length}/{categoryBadges.length} conquistados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TooltipProvider>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {categoryBadges.map(badge => {
                          const tier = TIER_COLORS[badge.tier];
                          return (
                            <Tooltip key={badge.id}>
                              <TooltipTrigger asChild>
                                <motion.div
                                  whileHover={{ scale: badge.earned ? 1.05 : 1 }}
                                  className={cn(
                                    "relative p-3 rounded-xl border-2 text-center transition-all cursor-default",
                                    badge.earned ? `${tier.bg} ${tier.border} ${tier.glow}` : "bg-muted/30 border-border/30 opacity-40 grayscale"
                                  )}
                                >
                                  <div className="text-2xl mb-1">{badge.emoji}</div>
                                  <p className={cn("text-[10px] font-medium leading-tight", badge.earned ? tier.text : "text-muted-foreground")}>{badge.name}</p>
                                  {!badge.earned && badge.progressPercent > 0 && <Progress value={badge.progressPercent} className="h-1 mt-1" />}
                                  {badge.earned && <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-green-500 bg-background rounded-full" />}
                                  {!badge.earned && <Lock className="absolute -top-1 -right-1 h-3.5 w-3.5 text-muted-foreground bg-background rounded-full p-0.5" />}
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-[200px]">
                                <p className="font-semibold text-xs">{badge.emoji} {badge.name} <Badge variant="outline" className="ml-1 text-[9px] capitalize">{badge.tier}</Badge></p>
                                <p className="text-[11px] text-muted-foreground">{badge.description}</p>
                                <p className="text-[10px] font-mono mt-1">{badge.earned ? `✅ +${badge.xpReward} XP` : `${badge.currentValue}/${badge.requiredValue} (${badge.progressPercent}%)`}</p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* LEADERBOARD TAB */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" /> Ranking da Tripulação</CardTitle>
              <CardDescription>Classificação baseada em XP acumulado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LEADERBOARD.map((user, i) => (
                  <motion.div
                    key={user.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-lg border transition-colors",
                      i < 3 ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("text-xl font-bold w-8 text-center", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground")}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${user.rank}`}
                    </div>
                    <Avatar><AvatarFallback>{user.avatar}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.role}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold">{user.xp}</div>
                      <div className="text-[10px] text-muted-foreground">XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">Lv.{user.level}</div>
                      <div className="text-[10px] text-muted-foreground">Nível</div>
                    </div>
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Award className="h-3 w-3" /> {user.badges}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs text-orange-500 border-orange-500/30">
                      <Flame className="h-3 w-3" /> {user.streak}d
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHALLENGES TAB */}
        <TabsContent value="challenges" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CHALLENGES.map(challenge => {
              const CIcon = challenge.icon;
              const completed = challenge.progress >= challenge.target;
              return (
                <motion.div key={challenge.id} whileHover={{ scale: 1.01 }}>
                  <Card className={cn(completed && "border-green-500/30 bg-green-500/5")}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn("p-3 rounded-xl", completed ? "bg-green-500/20" : "bg-muted")}>
                          <CIcon className={cn("h-6 w-6", completed ? "text-green-500" : challenge.color)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">{challenge.title}</h3>
                            <Badge variant={completed ? "default" : "outline"} className={cn("text-xs", completed && "bg-green-600")}>
                              {completed ? "✅ Completo" : `+${challenge.xpReward} XP`}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span>{challenge.progress}/{challenge.target}</span>
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {challenge.deadline}</span>
                            </div>
                            <Progress value={(challenge.progress / challenge.target) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
