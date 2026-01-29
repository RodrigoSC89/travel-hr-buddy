/**
 * 🎮 Gamification Engine - Crew Engagement System
 * PATCH REVOLUTION v2.0
 * 
 * Sistema de pontos, badges, rankings e conquistas
 * para engajamento da tripulação
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface CrewMemberPoints {
  crewMemberId: string;
  totalPoints: number;
  level: number;
  rank: string;
  streakDays: number;
  lastActivity: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  pointsRequired?: number;
  condition?: string;
}

export type BadgeCategory = 
  | 'safety'
  | 'training'
  | 'maintenance'
  | 'teamwork'
  | 'leadership'
  | 'compliance'
  | 'innovation'
  | 'milestone';

export interface Achievement {
  id: string;
  badge: Badge;
  earnedAt: Date;
  crewMemberId: string;
}

export interface LeaderboardEntry {
  rank: number;
  crewMemberId: string;
  crewMemberName: string;
  avatarUrl?: string;
  totalPoints: number;
  level: number;
  badgeCount: number;
  vessel?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  points: number;
  progress: number;
  target: number;
  deadline: Date;
  isCompleted: boolean;
}

// Point values for different actions
const POINT_VALUES = {
  'safety.drill_participation': 50,
  'safety.near_miss_report': 100,
  'safety.hazard_identified': 75,
  'safety.zero_incidents_month': 500,
  'safety.first_aid_assist': 150,
  'training.course_completed': 100,
  'training.certification_renewed': 200,
  'training.perfect_score': 150,
  'training.mentor_session': 80,
  'training.knowledge_share': 60,
  'maintenance.task_completed': 30,
  'maintenance.preventive_check': 40,
  'maintenance.issue_resolved': 75,
  'maintenance.equipment_optimization': 100,
  'teamwork.helped_colleague': 25,
  'teamwork.cross_training': 60,
  'teamwork.positive_feedback': 30,
  'teamwork.conflict_resolution': 80,
  'compliance.checklist_completed': 20,
  'compliance.audit_passed': 200,
  'compliance.documentation_updated': 40,
  'compliance.regulation_champion': 150,
  'general.login_streak': 10,
  'general.profile_complete': 50,
  'general.feedback_provided': 20,
};

const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
  20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000, 110000,
];

const RANKS = [
  'Marinheiro Iniciante',
  'Marinheiro',
  'Marinheiro Experiente',
  'Oficial de Convés Jr.',
  'Oficial de Convés',
  'Oficial de Convés Sr.',
  'Terceiro Oficial',
  'Segundo Oficial',
  'Primeiro Oficial',
  'Imediato',
  'Capitão Auxiliar',
  'Capitão',
  'Capitão Veterano',
  'Comodoro',
  'Contra-Almirante',
  'Vice-Almirante',
  'Almirante',
  'Almirante de Esquadra',
  'Almirante de Frota',
  'Grande Almirante',
  'Lenda Marítima',
];

const BADGES: Badge[] = [
  { id: 'safety_champion', name: 'Campeão de Segurança', description: 'Participou de 50 simulações de segurança', icon: '🛡️', category: 'safety', rarity: 'epic', pointsRequired: 2500 },
  { id: 'vigilant_eye', name: 'Olho Vigilante', description: 'Reportou 10 riscos potenciais', icon: '👁️', category: 'safety', rarity: 'rare' },
  { id: 'zero_hero', name: 'Herói Zero Acidentes', description: '12 meses sem incidentes', icon: '🏆', category: 'safety', rarity: 'legendary', pointsRequired: 6000 },
  { id: 'knowledge_seeker', name: 'Buscador de Conhecimento', description: 'Completou 10 cursos', icon: '📚', category: 'training', rarity: 'rare' },
  { id: 'master_certified', name: 'Mestre Certificado', description: 'Todas as certificações ativas', icon: '🎓', category: 'training', rarity: 'epic' },
  { id: 'mentor', name: 'Mentor', description: 'Ajudou 5 colegas', icon: '🧑‍🏫', category: 'training', rarity: 'rare' },
  { id: 'team_player', name: 'Jogador de Equipe', description: '20 feedbacks positivos', icon: '🤝', category: 'teamwork', rarity: 'rare' },
  { id: 'bridge_builder', name: 'Construtor de Pontes', description: 'Trabalhou em 5 departamentos', icon: '🌉', category: 'teamwork', rarity: 'epic' },
  { id: 'emerging_leader', name: 'Líder Emergente', description: 'Liderou 3 projetos', icon: '⭐', category: 'leadership', rarity: 'rare' },
  { id: 'captain_material', name: 'Material de Capitão', description: 'Liderança excepcional', icon: '👑', category: 'leadership', rarity: 'legendary', pointsRequired: 10000 },
  { id: 'compliance_expert', name: 'Expert em Compliance', description: '10 auditorias sem NC', icon: '✅', category: 'compliance', rarity: 'epic' },
  { id: 'documentation_pro', name: 'Pro de Documentação', description: '100% docs atualizados', icon: '📋', category: 'compliance', rarity: 'rare' },
  { id: 'first_steps', name: 'Primeiros Passos', description: 'Completou onboarding', icon: '🚀', category: 'milestone', rarity: 'common' },
  { id: 'one_year', name: 'Um Ano a Bordo', description: '1 ano de serviço', icon: '🎂', category: 'milestone', rarity: 'rare' },
  { id: 'five_years', name: 'Veterano de 5 Anos', description: '5 anos de serviço', icon: '🏅', category: 'milestone', rarity: 'epic' },
  { id: 'decade_legend', name: 'Lenda de Uma Década', description: '10 anos de serviço', icon: '🏛️', category: 'milestone', rarity: 'legendary' },
  { id: 'innovator', name: 'Inovador', description: '5 melhorias implementadas', icon: '💡', category: 'innovation', rarity: 'rare' },
  { id: 'problem_solver', name: 'Solucionador', description: '20 problemas resolvidos', icon: '🔧', category: 'innovation', rarity: 'epic' },
];

class GamificationEngine {
  calculateLevel(points: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  getRankName(level: number): string {
    return RANKS[Math.min(level - 1, RANKS.length - 1)];
  }

  getProgressToNextLevel(points: number): number {
    const level = this.calculateLevel(points);
    if (level >= LEVEL_THRESHOLDS.length) return 100;
    
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level];
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  }

  async awardPoints(
    crewMemberId: string,
    action: keyof typeof POINT_VALUES,
    multiplier: number = 1,
    metadata?: Record<string, unknown>
  ): Promise<{ points: number; newTotal: number; levelUp?: boolean }> {
    const basePoints = POINT_VALUES[action] || 0;
    const points = Math.round(basePoints * multiplier);
    const newTotal = points + 1000; // Simulated
    const levelUp = false;

    logger.info('Points awarded', { crewMemberId, action, points, metadata });
    return { points, newTotal, levelUp };
  }

  async awardBadge(crewMemberId: string, badge: Badge): Promise<void> {
    try {
      logger.info('Badge awarded', { crewMemberId, badge: badge.name });
    } catch (error) {
      logger.error('Error awarding badge', error as Error);
    }
  }

  async getCrewProfile(crewMemberId: string): Promise<CrewMemberPoints | null> {
    // Simulated profile
    return {
      crewMemberId,
      totalPoints: 2500,
      level: 8,
      rank: 'Segundo Oficial',
      streakDays: 15,
      lastActivity: new Date(),
    };
  }

  async getLeaderboard(limit: number = 10, vesselId?: string): Promise<LeaderboardEntry[]> {
    // Simulated leaderboard
    return [
      { rank: 1, crewMemberId: '1', crewMemberName: 'João Silva', totalPoints: 15000, level: 12, badgeCount: 8 },
      { rank: 2, crewMemberId: '2', crewMemberName: 'Maria Santos', totalPoints: 12500, level: 11, badgeCount: 7 },
      { rank: 3, crewMemberId: '3', crewMemberName: 'Pedro Costa', totalPoints: 10000, level: 10, badgeCount: 6 },
      { rank: 4, crewMemberId: '4', crewMemberName: 'Ana Oliveira', totalPoints: 8500, level: 9, badgeCount: 5 },
      { rank: 5, crewMemberId: '5', crewMemberName: 'Carlos Lima', totalPoints: 7000, level: 8, badgeCount: 4 },
    ].slice(0, limit);
  }

  getAvailableBadges(): Badge[] {
    return BADGES;
  }

  async getCrewBadges(crewMemberId: string): Promise<Achievement[]> {
    return [
      { id: '1', badge: BADGES[0], earnedAt: new Date('2024-01-15'), crewMemberId },
      { id: '2', badge: BADGES[3], earnedAt: new Date('2024-02-20'), crewMemberId },
      { id: '3', badge: BADGES[12], earnedAt: new Date('2024-03-01'), crewMemberId },
    ];
  }

  async getChallenges(): Promise<Challenge[]> {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    return [
      { id: 'daily_1', title: 'Guardião do Dia', description: 'Complete 5 checklists de segurança', type: 'daily', points: 100, progress: 3, target: 5, deadline: today, isCompleted: false },
      { id: 'daily_2', title: 'Documentador', description: 'Atualize 3 documentos', type: 'daily', points: 75, progress: 1, target: 3, deadline: today, isCompleted: false },
      { id: 'weekly_1', title: 'Aprendiz da Semana', description: 'Complete 3 módulos de treinamento', type: 'weekly', points: 300, progress: 1, target: 3, deadline: weekEnd, isCompleted: false },
      { id: 'weekly_2', title: 'Mentor Ativo', description: 'Ajude 2 colegas com treinamento', type: 'weekly', points: 200, progress: 0, target: 2, deadline: weekEnd, isCompleted: false },
    ];
  }

  async updateStreak(crewMemberId: string): Promise<{ streakDays: number; bonus: number }> {
    return { streakDays: 7, bonus: 35 };
  }
}

export const gamificationEngine = new GamificationEngine();
