/**
 * Badge Gamification System - Real badge tracking with criteria
 * Tracks course completions, awards badges based on real progress
 */

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Lock, CheckCircle2, Star, Zap, BookOpen, Shield, Clock, Trophy, Target, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  icon: React.ElementType;
  description: string;
  criteria: string;
  requiredValue: number;
  category: "learning" | "consistency" | "mastery" | "special";
  tier: "bronze" | "silver" | "gold" | "platinum" | "master";
  xpReward: number;
}

interface UserProgress {
  totalCoursesCompleted: number;
  totalHoursStudied: number;
  consecutiveDaysActive: number;
  mandatoryCoursesCompleted: number;
  totalMandatoryCourses: number;
  averageScore: number;
  coursesThisMonth: number;
  perfectScores: number;
  categoriesCompleted: string[];
}

const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Learning badges
  {
    id: "first-step",
    name: "Primeiro Passo",
    emoji: "👣",
    icon: BookOpen,
    description: "Complete seu primeiro curso",
    criteria: "1 curso concluído",
    requiredValue: 1,
    category: "learning",
    tier: "bronze",
    xpReward: 50,
  },
  {
    id: "reader",
    name: "Leitor",
    emoji: "📚",
    icon: BookOpen,
    description: "Complete 10 cursos",
    criteria: "10 cursos concluídos",
    requiredValue: 10,
    category: "learning",
    tier: "silver",
    xpReward: 200,
  },
  {
    id: "scholar",
    name: "Estudioso",
    emoji: "🎓",
    icon: Award,
    description: "Complete 25 cursos",
    criteria: "25 cursos concluídos",
    requiredValue: 25,
    category: "learning",
    tier: "gold",
    xpReward: 500,
  },
  {
    id: "master",
    name: "Master",
    emoji: "🏆",
    icon: Trophy,
    description: "Complete 50 ou mais cursos — domínio total da plataforma",
    criteria: "50+ cursos concluídos",
    requiredValue: 50,
    category: "mastery",
    tier: "master",
    xpReward: 2000,
  },

  // Consistency badges
  {
    id: "focused",
    name: "Focado",
    emoji: "🎯",
    icon: Target,
    description: "Estude 7 dias consecutivos",
    criteria: "7 dias seguidos",
    requiredValue: 7,
    category: "consistency",
    tier: "bronze",
    xpReward: 100,
  },
  {
    id: "dedicated",
    name: "Dedicado",
    emoji: "💪",
    icon: Flame,
    description: "Estude 30 dias consecutivos",
    criteria: "30 dias seguidos",
    requiredValue: 30,
    category: "consistency",
    tier: "gold",
    xpReward: 500,
  },
  {
    id: "speedster",
    name: "Veloz",
    emoji: "⚡",
    icon: Zap,
    description: "Complete 3 cursos em um mês",
    criteria: "3 cursos/mês",
    requiredValue: 3,
    category: "consistency",
    tier: "silver",
    xpReward: 150,
  },

  // Mastery badges
  {
    id: "perfectionist",
    name: "Perfeccionista",
    emoji: "💎",
    icon: Star,
    description: "Obtenha nota máxima em 5 avaliações",
    criteria: "5 notas perfeitas",
    requiredValue: 5,
    category: "mastery",
    tier: "gold",
    xpReward: 400,
  },
  {
    id: "compliance-hero",
    name: "Herói do Compliance",
    emoji: "🛡️",
    icon: Shield,
    description: "Complete todos os cursos obrigatórios",
    criteria: "100% obrigatórios",
    requiredValue: 100, // percent
    category: "special",
    tier: "platinum",
    xpReward: 1000,
  },
  {
    id: "time-investor",
    name: "Investidor de Tempo",
    emoji: "⏳",
    icon: Clock,
    description: "Acumule 40 horas de treinamento",
    criteria: "40h estudadas",
    requiredValue: 40,
    category: "learning",
    tier: "gold",
    xpReward: 300,
  },
];

const TIER_STYLES: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  bronze: {
    bg: "bg-amber-900/20",
    border: "border-amber-700/40",
    text: "text-amber-600",
    glow: "",
  },
  silver: {
    bg: "bg-slate-300/10",
    border: "border-slate-400/40",
    text: "text-slate-400",
    glow: "",
  },
  gold: {
    bg: "bg-warning/10",
    border: "border-warning/40",
    text: "text-warning",
    glow: "shadow-warning/20 shadow-md",
  },
  platinum: {
    bg: "bg-info/10",
    border: "border-info/40",
    text: "text-info",
    glow: "shadow-info/20 shadow-md",
  },
  master: {
    bg: "bg-gradient-to-br from-accent/15 to-warning/15",
    border: "border-accent/50",
    text: "text-accent-foreground",
    glow: "shadow-accent/30 shadow-lg ring-1 ring-accent/20",
  },
};

interface Props {
  userProgress?: UserProgress;
}

export function BadgeGamificationSystem({ userProgress }: Props) {
  // Default progress for demo - in production this comes from Supabase
  const progress: UserProgress = userProgress || {
    totalCoursesCompleted: 12,
    totalHoursStudied: 24.5,
    consecutiveDaysActive: 7,
    mandatoryCoursesCompleted: 8,
    totalMandatoryCourses: 12,
    averageScore: 87,
    coursesThisMonth: 3,
    perfectScores: 2,
    categoriesCompleted: ["safety", "compliance", "leadership"],
  };

  const badgeStates = useMemo(() => {
    return BADGE_DEFINITIONS.map((badge) => {
      let currentValue = 0;

      switch (badge.id) {
        case "first-step":
        case "reader":
        case "scholar":
        case "master":
          currentValue = progress.totalCoursesCompleted;
          break;
        case "focused":
        case "dedicated":
          currentValue = progress.consecutiveDaysActive;
          break;
        case "speedster":
          currentValue = progress.coursesThisMonth;
          break;
        case "perfectionist":
          currentValue = progress.perfectScores;
          break;
        case "compliance-hero":
          currentValue = progress.totalMandatoryCourses > 0
            ? Math.round((progress.mandatoryCoursesCompleted / progress.totalMandatoryCourses) * 100)
            : 0;
          break;
        case "time-investor":
          currentValue = progress.totalHoursStudied;
          break;
      }

      const earned = currentValue >= badge.requiredValue;
      const progressPercent = Math.min(100, Math.round((currentValue / badge.requiredValue) * 100));

      return {
        ...badge,
        currentValue,
        earned,
        progressPercent,
      };
    });
  }, [progress]);

  const earnedCount = badgeStates.filter((b) => b.earned).length;
  const totalXP = badgeStates.filter((b) => b.earned).reduce((sum, b) => sum + b.xpReward, 0);
  const nextBadge = badgeStates.find((b) => !b.earned && b.progressPercent > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Suas Conquistas
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {earnedCount}/{BADGE_DEFINITIONS.length} badges
            </Badge>
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-xs">
              {totalXP} XP
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next badge progress */}
        {nextBadge && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-primary">
                Próxima conquista: {nextBadge.emoji} {nextBadge.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {nextBadge.currentValue}/{nextBadge.requiredValue}
              </span>
            </div>
            <Progress value={nextBadge.progressPercent} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{nextBadge.criteria}</p>
          </div>
        )}

        {/* Badge Grid */}
        <TooltipProvider>
          <div className="grid grid-cols-5 gap-3">
            {badgeStates.map((badge) => {
              const tierStyle = TIER_STYLES[badge.tier];
              const Icon = badge.icon;

              return (
                <Tooltip key={badge.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative p-3 rounded-xl border-2 text-center transition-all cursor-default",
                        badge.earned
                          ? `${tierStyle.bg} ${tierStyle.border} ${tierStyle.glow}`
                          : "bg-muted/30 border-border/30 opacity-40 grayscale"
                      )}
                    >
                      <div className="text-2xl mb-1">{badge.emoji}</div>
                      <p className={cn("text-[10px] font-medium leading-tight", badge.earned ? tierStyle.text : "text-muted-foreground")}>
                        {badge.name}
                      </p>
                      {!badge.earned && badge.progressPercent > 0 && (
                        <div className="mt-1">
                          <Progress value={badge.progressPercent} className="h-1" />
                        </div>
                      )}
                      {badge.earned && (
                        <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-success bg-background rounded-full" />
                      )}
                      {!badge.earned && (
                        <Lock className="absolute -top-1 -right-1 h-3.5 w-3.5 text-muted-foreground bg-background rounded-full p-0.5" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[200px]">
                    <div className="space-y-1">
                      <p className="font-semibold text-xs">
                        {badge.emoji} {badge.name}
                        <Badge variant="outline" className="ml-1 text-[9px] capitalize">
                          {badge.tier}
                        </Badge>
                      </p>
                      <p className="text-[11px] text-muted-foreground">{badge.description}</p>
                      <p className="text-[10px] font-mono">
                        Critério: {badge.criteria}
                      </p>
                      {badge.earned ? (
                        <p className="text-[10px] text-success font-medium">
                          ✅ Conquistado! +{badge.xpReward} XP
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">
                          Progresso: {badge.currentValue}/{badge.requiredValue} ({badge.progressPercent}%)
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* XP Level */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Nível de XP</span>
            <span className="text-xs font-medium">
              Nível {Math.floor(totalXP / 500) + 1} • {totalXP % 500}/500 XP
            </span>
          </div>
          <Progress value={(totalXP % 500) / 5} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export default BadgeGamificationSystem;
