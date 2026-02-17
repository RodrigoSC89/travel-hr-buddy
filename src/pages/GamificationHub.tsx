/**
 * Gamification Hub - Orchestrator
 * Refactored: tabs extracted to src/pages/gamification/
 */
import React, { useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Trophy, Flame, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GamificationTabs } from "./gamification/GamificationTabs";

// Badge definitions
const ALL_BADGES = [
  { id: "first-voyage", name: "Primeira Viagem", emoji: "⛵", description: "Complete seu primeiro treinamento", requiredValue: 1, category: "learning", tier: "bronze", xpReward: 50 },
  { id: "navigator", name: "Navegador", emoji: "🧭", description: "Complete 10 treinamentos", requiredValue: 10, category: "learning", tier: "silver", xpReward: 200 },
  { id: "captain", name: "Capitão", emoji: "👨‍✈️", description: "Complete 25 treinamentos", requiredValue: 25, category: "learning", tier: "gold", xpReward: 500 },
  { id: "admiral", name: "Almirante", emoji: "🎖️", description: "Complete 50+ treinamentos", requiredValue: 50, category: "learning", tier: "master", xpReward: 2000 },
  { id: "steady-hand", name: "Mão Firme", emoji: "🎯", description: "7 dias consecutivos ativo", requiredValue: 7, category: "consistency", tier: "bronze", xpReward: 100 },
  { id: "iron-will", name: "Vontade de Ferro", emoji: "💪", description: "30 dias consecutivos ativo", requiredValue: 30, category: "consistency", tier: "gold", xpReward: 500 },
  { id: "lighthouse", name: "Farol", emoji: "🗼", description: "90 dias consecutivos ativo", requiredValue: 90, category: "consistency", tier: "platinum", xpReward: 1500 },
  { id: "stcw-master", name: "Mestre STCW", emoji: "📜", description: "100% certificados STCW em dia", requiredValue: 100, category: "compliance", tier: "platinum", xpReward: 1000 },
  { id: "safety-champion", name: "Campeão de Segurança", emoji: "🛡️", description: "Zero incidentes em 180 dias", requiredValue: 180, category: "maritime", tier: "gold", xpReward: 800 },
  { id: "speed-demon", name: "Veloz", emoji: "⚡", description: "3 cursos em um mês", requiredValue: 3, category: "consistency", tier: "silver", xpReward: 150 },
  { id: "perfectionist", name: "Perfeccionista", emoji: "💎", description: "5 notas perfeitas", requiredValue: 5, category: "mastery", tier: "gold", xpReward: 400 },
  { id: "mentor", name: "Mentor", emoji: "🧑‍🏫", description: "Ajude 10 colegas com treinamento", requiredValue: 10, category: "leadership", tier: "gold", xpReward: 600 },
  { id: "time-sailor", name: "Marinheiro do Tempo", emoji: "⏳", description: "40h de treinamento acumuladas", requiredValue: 40, category: "learning", tier: "gold", xpReward: 300 },
  { id: "fleet-hero", name: "Herói da Frota", emoji: "🚢", description: "Contribua em 5 embarcações", requiredValue: 5, category: "maritime", tier: "platinum", xpReward: 1200 },
];

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const { data: academyProgress } = useQuery({ queryKey: ["gamification-progress"], queryFn: async () => { const { data } = await supabase.from("academy_progress").select("*").eq("status", "completed"); return data || []; } });
  const completedCourses = academyProgress?.length ?? 0;

  const userProgress = useMemo(() => ({ totalCoursesCompleted: Math.max(completedCourses, 12), totalHoursStudied: 24.5, consecutiveDaysActive: 14, coursesThisMonth: 3, perfectScores: 2, safetyDays: 120, mentorships: 3, vesselsServed: 2, stcwCompliance: 85 }), [completedCourses]);

  const badgeStates = useMemo(() => {
    return ALL_BADGES.map((badge) => {
      let currentValue = 0;
      switch (badge.id) {
        case "first-voyage": case "navigator": case "captain": case "admiral": currentValue = userProgress.totalCoursesCompleted; break;
        case "steady-hand": case "iron-will": case "lighthouse": currentValue = userProgress.consecutiveDaysActive; break;
        case "speed-demon": currentValue = userProgress.coursesThisMonth; break;
        case "perfectionist": currentValue = userProgress.perfectScores; break;
        case "stcw-master": currentValue = userProgress.stcwCompliance; break;
        case "safety-champion": currentValue = userProgress.safetyDays; break;
        case "time-sailor": currentValue = userProgress.totalHoursStudied; break;
        case "mentor": currentValue = userProgress.mentorships; break;
        case "fleet-hero": currentValue = userProgress.vesselsServed; break;
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
      <Helmet><title>Gamificação | Nauti One</title></Helmet>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-accent/10 via-primary/10 to-info/10 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div><h1 className="text-3xl font-bold flex items-center gap-3"><Trophy className="h-8 w-8 text-warning" />Centro de Conquistas</h1><p className="text-muted-foreground mt-1">Seu progresso, conquistas e ranking na tripulação</p></div>
          <div className="flex items-center gap-4">
            <div className="text-center"><div className="text-3xl font-bold text-accent-foreground">{currentLevel}</div><div className="text-xs text-muted-foreground">Nível</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-warning">{totalXP}</div><div className="text-xs text-muted-foreground">XP Total</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-info">{earnedCount}</div><div className="text-xs text-muted-foreground">Badges</div></div>
            <div className="text-center"><div className="text-3xl font-bold text-warning flex items-center gap-1"><Flame className="h-5 w-5" />{userProgress.consecutiveDaysActive}</div><div className="text-xs text-muted-foreground">Streak</div></div>
          </div>
        </div>
        <div className="mt-4"><div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Nível {currentLevel}</span><span className="text-muted-foreground">{xpToNext} XP para nível {currentLevel + 1}</span></div><Progress value={((totalXP % 500) / 500) * 100} className="h-3" /></div>
        <Sparkles className="absolute top-4 right-4 h-20 w-20 text-primary/5" />
      </motion.div>
      <GamificationTabs activeTab={activeTab} setActiveTab={setActiveTab} badgeStates={badgeStates} />
    </div>
  );
}
