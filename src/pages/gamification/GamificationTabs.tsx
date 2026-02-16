/**
 * Gamification Tabs - Overview, Badges, Leaderboard, Challenges
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import {
  Trophy, Star, Flame, Target, Award, Zap, CheckCircle2, Lock,
  Crown, BarChart3, BookOpen, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeState {
  id: string; name: string; emoji: string; description: string;
  tier: string; xpReward: number; currentValue: number; requiredValue: number;
  earned: boolean; progressPercent: number; category: string;
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: "bg-amber-900/20", border: "border-amber-700/40", text: "text-amber-600", glow: "" },
  silver: { bg: "bg-slate-300/10", border: "border-slate-400/40", text: "text-slate-400", glow: "" },
  gold: { bg: "bg-yellow-500/10", border: "border-yellow-500/40", text: "text-yellow-500", glow: "shadow-yellow-500/20 shadow-md" },
  platinum: { bg: "bg-cyan-500/10", border: "border-cyan-500/40", text: "text-cyan-400", glow: "shadow-cyan-500/20 shadow-md" },
  master: { bg: "bg-gradient-to-br from-purple-500/15 to-yellow-500/15", border: "border-purple-500/50", text: "text-purple-400", glow: "shadow-purple-500/30 shadow-lg ring-1 ring-purple-500/20" },
};

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

const CHALLENGES = [
  { id: "c1", title: "Maratona de Segurança", description: "Complete 3 módulos de segurança esta semana", progress: 2, target: 3, xpReward: 200, deadline: "3 dias", icon: Target, color: "text-red-500" },
  { id: "c2", title: "Embaixador Ambiental", description: "Conclua o treinamento MARPOL Anexo VI", progress: 0, target: 1, xpReward: 150, deadline: "5 dias", icon: Target, color: "text-green-500" },
  { id: "c3", title: "Sprint de Conhecimento", description: "Estude 5h esta semana", progress: 3.5, target: 5, xpReward: 100, deadline: "4 dias", icon: BookOpen, color: "text-blue-500" },
  { id: "c4", title: "Nota Perfeita", description: "Tire 100% em qualquer avaliação", progress: 0, target: 1, xpReward: 300, deadline: "7 dias", icon: Star, color: "text-yellow-500" },
];

interface GamificationTabsProps {
  activeTab: string;
  setActiveTab: (v: string) => void;
  badgeStates: BadgeState[];
}

export function GamificationTabs({ activeTab, setActiveTab, badgeStates }: GamificationTabsProps) {
  return (
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
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4 text-yellow-500" /> Badges Recentes</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {badgeStates.filter(b => b.earned).slice(0, 6).map(badge => (
                  <div key={badge.id} className={cn("p-2 rounded-lg border text-center", TIER_COLORS[badge.tier]?.bg, TIER_COLORS[badge.tier]?.border)}>
                    <div className="text-xl">{badge.emoji}</div>
                    <div className={cn("text-[9px] font-medium", TIER_COLORS[badge.tier]?.text)}>{badge.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-blue-500" /> Desafio da Semana</CardTitle></CardHeader>
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
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4 text-yellow-500" /> Top 3</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {LEADERBOARD.slice(0, 3).map((user, i) => (
                <div key={user.rank} className="flex items-center gap-3">
                  <div className={cn("text-lg font-bold w-6 text-center", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-amber-700")}>{["🥇", "🥈", "🥉"][i]}</div>
                  <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{user.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{user.name}</div><div className="text-[10px] text-muted-foreground">{user.xp} XP</div></div>
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
            const categoryLabels: Record<string, string> = { learning: "📚 Aprendizado", consistency: "🔥 Consistência", mastery: "💎 Maestria", maritime: "🚢 Marítimo", compliance: "🛡️ Compliance", leadership: "👑 Liderança" };
            return (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{categoryLabels[category]}</CardTitle>
                  <CardDescription className="text-xs">{categoryBadges.filter(b => b.earned).length}/{categoryBadges.length} conquistados</CardDescription>
                </CardHeader>
                <CardContent>
                  <TooltipProvider>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {categoryBadges.map(badge => {
                        const tier = TIER_COLORS[badge.tier] || TIER_COLORS.bronze;
                        return (
                          <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                              <motion.div whileHover={{ scale: badge.earned ? 1.05 : 1 }} className={cn("relative p-3 rounded-xl border-2 text-center transition-all cursor-default", badge.earned ? `${tier.bg} ${tier.border} ${tier.glow}` : "bg-muted/30 border-border/30 opacity-40 grayscale")}>
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
          <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="h-5 w-5 text-yellow-500" /> Ranking da Tripulação</CardTitle><CardDescription>Classificação baseada em XP acumulado</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {LEADERBOARD.map((user, i) => (
                <motion.div key={user.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn("flex items-center gap-4 p-3 rounded-lg border transition-colors", i < 3 ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50")}>
                  <div className={cn("text-xl font-bold w-8 text-center", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${user.rank}`}</div>
                  <Avatar><AvatarFallback>{user.avatar}</AvatarFallback></Avatar>
                  <div className="flex-1"><div className="font-medium text-sm">{user.name}</div><div className="text-xs text-muted-foreground">{user.role}</div></div>
                  <div className="text-center"><div className="text-sm font-bold">{user.xp}</div><div className="text-[10px] text-muted-foreground">XP</div></div>
                  <div className="text-center"><div className="text-sm font-medium">Lv.{user.level}</div><div className="text-[10px] text-muted-foreground">Nível</div></div>
                  <Badge variant="outline" className="gap-1 text-xs"><Award className="h-3 w-3" /> {user.badges}</Badge>
                  <Badge variant="outline" className="gap-1 text-xs text-orange-500 border-orange-500/30"><Flame className="h-3 w-3" /> {user.streak}d</Badge>
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
                      <div className={cn("p-3 rounded-xl", completed ? "bg-green-500/20" : "bg-muted")}><CIcon className={cn("h-6 w-6", completed ? "text-green-500" : challenge.color)} /></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between"><h3 className="font-semibold text-sm">{challenge.title}</h3><Badge variant={completed ? "default" : "outline"} className={cn("text-xs", completed && "bg-green-600")}>{completed ? "✅ Completo" : `+${challenge.xpReward} XP`}</Badge></div>
                        <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] mb-1"><span>{challenge.progress}/{challenge.target}</span><span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {challenge.deadline}</span></div>
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
  );
}
