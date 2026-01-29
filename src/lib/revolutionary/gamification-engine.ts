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
  // Safety
  'safety.drill_participation': 50,
  'safety.near_miss_report': 100,
  'safety.hazard_identified': 75,
  'safety.zero_incidents_month': 500,
  'safety.first_aid_assist': 150,
  
  // Training
  'training.course_completed': 100,
  'training.certification_renewed': 200,
  'training.perfect_score': 150,
  'training.mentor_session': 80,
  'training.knowledge_share': 60,
  
  // Maintenance
  'maintenance.task_completed': 30,
  'maintenance.preventive_check': 40,
  'maintenance.issue_resolved': 75,
  'maintenance.equipment_optimization': 100,
  
  // Teamwork
  'teamwork.helped_colleague': 25,
  'teamwork.cross_training': 60,
  'teamwork.positive_feedback': 30,
  'teamwork.conflict_resolution': 80,
  
  // Compliance
  'compliance.checklist_completed': 20,
  'compliance.audit_passed': 200,
  'compliance.documentation_updated': 40,
  'compliance.regulation_champion': 150,
  
  // General
  'general.login_streak': 10,
  'general.profile_complete': 50,
  'general.feedback_provided': 20,
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
  20000, 26000, 33000, 41000, 50000, 60000, 71000, 83000, 96000, 110000,
];

// Rank names based on level
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

// Available badges
const BADGES: Badge[] = [
  // Safety Badges
  {
    id: 'safety_champion',
    name: 'Campeão de Segurança',
    description: 'Participou de 50 simulações de segurança',
    icon: '🛡️',
    category: 'safety',
    rarity: 'epic',
    pointsRequired: 2500,
  },
  {
    id: 'vigilant_eye',
    name: 'Olho Vigilante',
    description: 'Reportou 10 riscos potenciais',
    icon: '👁️',
    category: 'safety',
    rarity: 'rare',
  },
  {
    id: 'zero_hero',
    name: 'Herói Zero Acidentes',
    description: '12 meses sem incidentes na embarcação',
    icon: '🏆',
    category: 'safety',
    rarity: 'legendary',
    pointsRequired: 6000,
  },
  
  // Training Badges
  {
    id: 'knowledge_seeker',
    name: 'Buscador de Conhecimento',
    description: 'Completou 10 cursos de treinamento',
    icon: '📚',
    category: 'training',
    rarity: 'rare',
  },
  {
    id: 'master_certified',
    name: 'Mestre Certificado',
    description: 'Possui todas as certificações obrigatórias ativas',
    icon: '🎓',
    category: 'training',
    rarity: 'epic',
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Ajudou 5 colegas em treinamentos',
    icon: '🧑‍🏫',
    category: 'training',
    rarity: 'rare',
  },
  
  // Teamwork Badges
  {
    id: 'team_player',
    name: 'Jogador de Equipe',
    description: 'Recebeu 20 feedbacks positivos de colegas',
    icon: '🤝',
    category: 'teamwork',
    rarity: 'rare',
  },
  {
    id: 'bridge_builder',
    name: 'Construtor de Pontes',
    description: 'Trabalhou em 5 departamentos diferentes',
    icon: '🌉',
    category: 'teamwork',
    rarity: 'epic',
  },
  
  // Leadership Badges
  {
    id: 'emerging_leader',
    name: 'Líder Emergente',
    description: 'Liderou 3 projetos com sucesso',
    icon: '⭐',
    category: 'leadership',
    rarity: 'rare',
  },
  {
    id: 'captain_material',
    name: 'Material de Capitão',
    description: 'Demonstrou liderança excepcional',
    icon: '👑',
    category: 'leadership',
    rarity: 'legendary',
    pointsRequired: 10000,
  },
  
  // Compliance Badges
  {
    id: 'compliance_expert',
    name: 'Expert em Compliance',
    description: 'Passou em 10 auditorias sem não-conformidades',
    icon: '✅',
    category: 'compliance',
    rarity: 'epic',
  },
  {
    id: 'documentation_pro',
    name: 'Profissional de Documentação',
    description: 'Manteve 100% dos documentos atualizados por 6 meses',
    icon: '📋',
    category: 'compliance',
    rarity: 'rare',
  },
  
  // Milestone Badges
  {
    id: 'first_steps',
    name: 'Primeiros Passos',
    description: 'Completou o onboarding',
    icon: '🚀',
    category: 'milestone',
    rarity: 'common',
  },
  {
    id: 'one_year',
    name: 'Um Ano a Bordo',
    description: 'Completou 1 ano de serviço',
    icon: '🎂',
    category: 'milestone',
    rarity: 'rare',
  },
  {
    id: 'five_years',
    name: 'Veterano de 5 Anos',
    description: 'Completou 5 anos de serviço',
    icon: '🏅',
    category: 'milestone',
    rarity: 'epic',
  },
  {
    id: 'decade_legend',
    name: 'Lenda de Uma Década',
    description: 'Completou 10 anos de serviço',
    icon: '🏛️',
    category: 'milestone',
    rarity: 'legendary',
  },
  
  // Innovation Badges
  {
    id: 'innovator',
    name: 'Inovador',
    description: 'Sugeriu 5 melhorias implementadas',
    icon: '💡',
    category: 'innovation',
    rarity: 'rare',
  },
  {
    id: 'problem_solver',
    name: 'Solucionador de Problemas',
    description: 'Resolveu 20 problemas técnicos complexos',
    icon: '🔧',
    category: 'innovation',
    rarity: 'epic',
  },
];

class GamificationEngine {
  
  // Calculate level from total points
  calculateLevel(points: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  // Get rank name from level
  getRankName(level: number): string {
    return RANKS[Math.min(level - 1, RANKS.length - 1)];
  }

  // Calculate progress to next level (0-100)
  getProgressToNextLevel(points: number): number {
    const level = this.calculateLevel(points);
    if (level >= LEVEL_THRESHOLDS.length) return 100;
    
    const currentThreshold = LEVEL_THRESHOLDS[level - 1];
    const nextThreshold = LEVEL_THRESHOLDS[level];
    const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    
    return Math.min(100, Math.max(0, progress));
  }

  // Award points for an action
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
    }

    return newBadges;
  }

  // Award a specific badge
  async awardBadge(crewMemberId: string, badge: Badge): Promise<void> {
    try {
      await supabase.from('crew_badges').insert({
        crew_member_id: crewMemberId,
        badge_id: badge.id,
        badge_name: badge.name,
        badge_icon: badge.icon,
        badge_rarity: badge.rarity,
        badge_category: badge.category,
        earned_at: new Date().toISOString(),
      });

      logger.info('Badge awarded', { crewMemberId, badge: badge.name });
    } catch (error) {
      logger.error('Error awarding badge', error as Error);
    }
  }

  // Get crew member's gamification profile
  async getCrewProfile(crewMemberId: string): Promise<CrewMemberPoints | null> {
    const { data } = await supabase
      .from('crew_gamification')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .maybeSingle();

    if (!data) return null;

    return {
      crewMemberId: data.crew_member_id,
      totalPoints: data.total_points,
      level: data.level,
      rank: data.rank,
      streakDays: data.streak_days || 0,
      lastActivity: new Date(data.last_activity),
    };
  }

  // Get leaderboard
  async getLeaderboard(
    limit: number = 10,
    vesselId?: string
  ): Promise<LeaderboardEntry[]> {
    let query = supabase
      .from('crew_gamification')
      .select(`
        crew_member_id,
        total_points,
        level,
        crew_members!inner(full_name, avatar_url, vessel_id)
      `)
      .order('total_points', { ascending: false })
      .limit(limit);

    if (vesselId) {
      query = query.eq('crew_members.vessel_id', vesselId);
    }

    const { data } = await query;

    if (!data) return [];

    // Get badge counts
    const crewIds = data.map(d => d.crew_member_id);
    const { data: badgeCounts } = await supabase
      .from('crew_badges')
      .select('crew_member_id')
      .in('crew_member_id', crewIds);

    const badgeCountMap: Record<string, number> = {};
    badgeCounts?.forEach(b => {
      badgeCountMap[b.crew_member_id] = (badgeCountMap[b.crew_member_id] || 0) + 1;
    });

    return data.map((entry, index) => ({
      rank: index + 1,
      crewMemberId: entry.crew_member_id,
      crewMemberName: (entry.crew_members as unknown as { full_name: string }).full_name,
      avatarUrl: (entry.crew_members as unknown as { avatar_url?: string }).avatar_url,
      totalPoints: entry.total_points,
      level: entry.level,
      badgeCount: badgeCountMap[entry.crew_member_id] || 0,
    }));
  }

  // Get available badges
  getAvailableBadges(): Badge[] {
    return BADGES;
  }

  // Get crew member's badges
  async getCrewBadges(crewMemberId: string): Promise<Achievement[]> {
    const { data } = await supabase
      .from('crew_badges')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .order('earned_at', { ascending: false });

    if (!data) return [];

    return data.map(b => ({
      id: b.id,
      badge: BADGES.find(badge => badge.id === b.badge_id) || {
        id: b.badge_id,
        name: b.badge_name,
        description: '',
        icon: b.badge_icon,
        category: b.badge_category as BadgeCategory,
        rarity: b.badge_rarity as Badge['rarity'],
      },
      earnedAt: new Date(b.earned_at),
      crewMemberId: b.crew_member_id,
    }));
  }

  // Get daily/weekly challenges
  async getChallenges(): Promise<Challenge[]> {
    const today = new Date();
    return [
      { id: 'daily', title: 'Guardião do Dia', description: 'Complete 5 checklists', type: 'daily', points: 100, progress: 3, target: 5, deadline: today, isCompleted: false },
      { id: 'weekly', title: 'Aprendiz da Semana', description: 'Complete 3 módulos', type: 'weekly', points: 300, progress: 1, target: 3, deadline: today, isCompleted: false },
    ];
  }

  async updateStreak(crewMemberId: string): Promise<{ streakDays: number; bonus: number }> {
    return { streakDays: 7, bonus: 35 };
  }
}

export const gamificationEngine = new GamificationEngine();

export const gamificationEngine = new GamificationEngine();
