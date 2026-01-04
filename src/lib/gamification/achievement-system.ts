/**
 * Gamification System - Nautilus One v3.2.0
 * Achievement system, leaderboards, and challenges for maritime operations
 */

// Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  badge: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  icon: string;
  category: 'safety' | 'compliance' | 'efficiency' | 'teamwork' | 'learning';
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  unlockedAt?: Date;
}

interface UserProgress {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  streaks: {
    dailyCheckIn: number;
    safetyReports: number;
    trainingCompleted: number;
  };
  statistics: {
    auditsCompleted: number;
    incidentsFreedays: number;
    trainingHours: number;
    complianceScore: number;
  };
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'vessel';
  startDate: Date;
  endDate: Date;
  rewards: {
    points: number;
    badge?: string;
  };
  participants: string[];
  leaderboard: Array<{
    participantId: string;
    score: number;
    rank: number;
  }>;
  status: 'upcoming' | 'active' | 'completed';
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  achievements: number;
  vessel?: string;
}

// Achievement definitions
const ACHIEVEMENTS: Record<string, Omit<Achievement, 'unlockedAt' | 'requirements'> & { requirements: { type: string; target: number } }> = {
  // PEOTRAM achievements
  PEOTRAM_MASTER: {
    id: 'peotram_master',
    title: '🏆 PEOTRAM Master',
    description: 'Complete 10 PEOTRAM audits with 100% compliance',
    points: 1000,
    badge: 'gold',
    icon: '🏆',
    category: 'compliance',
    requirements: { type: 'peotram_100_percent', target: 10 },
  },
  QUICK_AUDITOR: {
    id: 'quick_auditor',
    title: '⚡ Quick Auditor',
    description: 'Complete a PEOTRAM audit in under 2 hours',
    points: 500,
    badge: 'silver',
    icon: '⚡',
    category: 'efficiency',
    requirements: { type: 'peotram_under_2h', target: 1 },
  },
  AUDIT_STREAK: {
    id: 'audit_streak',
    title: '🔥 Audit Streak',
    description: 'Complete audits for 30 consecutive days',
    points: 750,
    badge: 'gold',
    icon: '🔥',
    category: 'compliance',
    requirements: { type: 'audit_streak_days', target: 30 },
  },
  
  // Crew wellness achievements
  WELLNESS_CHAMPION: {
    id: 'wellness_champion',
    title: '💚 Wellness Champion',
    description: 'Maintain wellness score >80 for 30 days',
    points: 750,
    badge: 'gold',
    icon: '💚',
    category: 'teamwork',
    requirements: { type: 'wellness_score_days', target: 30 },
  },
  DAILY_HERO: {
    id: 'daily_hero',
    title: '📅 Daily Hero',
    description: 'Complete daily check-ins for 100 consecutive days',
    points: 1000,
    badge: 'gold',
    icon: '📅',
    category: 'teamwork',
    requirements: { type: 'checkin_streak', target: 100 },
  },
  
  // Safety achievements
  ZERO_INCIDENTS: {
    id: 'zero_incidents',
    title: '🛡️ Safety Leader',
    description: '90 days without safety incidents',
    points: 2000,
    badge: 'platinum',
    icon: '🛡️',
    category: 'safety',
    requirements: { type: 'incident_free_days', target: 90 },
  },
  HAZARD_HUNTER: {
    id: 'hazard_hunter',
    title: '🔍 Hazard Hunter',
    description: 'Report 50 near-miss incidents',
    points: 750,
    badge: 'gold',
    icon: '🔍',
    category: 'safety',
    requirements: { type: 'near_miss_reports', target: 50 },
  },
  SAFETY_OBSERVER: {
    id: 'safety_observer',
    title: '👁️ Safety Observer',
    description: 'Complete 100 safety observations',
    points: 500,
    badge: 'silver',
    icon: '👁️',
    category: 'safety',
    requirements: { type: 'safety_observations', target: 100 },
  },
  
  // Learning achievements
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    title: '📚 Knowledge Seeker',
    description: 'Complete 50 training modules',
    points: 750,
    badge: 'gold',
    icon: '📚',
    category: 'learning',
    requirements: { type: 'training_modules', target: 50 },
  },
  CERTIFICATION_PRO: {
    id: 'certification_pro',
    title: '🎓 Certification Pro',
    description: 'Maintain all certifications current for 1 year',
    points: 1500,
    badge: 'platinum',
    icon: '🎓',
    category: 'learning',
    requirements: { type: 'certs_current_days', target: 365 },
  },
  
  // Efficiency achievements
  FUEL_SAVER: {
    id: 'fuel_saver',
    title: '⛽ Fuel Saver',
    description: 'Achieve 10% fuel savings on 5 voyages',
    points: 1000,
    badge: 'gold',
    icon: '⛽',
    category: 'efficiency',
    requirements: { type: 'fuel_savings_voyages', target: 5 },
  },
  ECO_WARRIOR: {
    id: 'eco_warrior',
    title: '🌍 Eco Warrior',
    description: 'Reduce emissions by 20% over baseline',
    points: 1500,
    badge: 'platinum',
    icon: '🌍',
    category: 'efficiency',
    requirements: { type: 'emissions_reduction', target: 20 },
  },
  
  // Teamwork achievements
  TEAM_PLAYER: {
    id: 'team_player',
    title: '🤝 Team Player',
    description: 'Participate in 20 team challenges',
    points: 500,
    badge: 'silver',
    icon: '🤝',
    category: 'teamwork',
    requirements: { type: 'team_challenges', target: 20 },
  },
  MENTOR: {
    id: 'mentor',
    title: '👨‍🏫 Mentor',
    description: 'Help 10 crew members complete certifications',
    points: 1000,
    badge: 'gold',
    icon: '👨‍🏫',
    category: 'teamwork',
    requirements: { type: 'mentored_certs', target: 10 },
  },
};

// Level thresholds
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  500,    // Level 2
  1500,   // Level 3
  3000,   // Level 4
  5000,   // Level 5
  8000,   // Level 6
  12000,  // Level 7
  17000,  // Level 8
  23000,  // Level 9
  30000,  // Level 10
  40000,  // Level 11
  52000,  // Level 12
  66000,  // Level 13
  82000,  // Level 14
  100000, // Level 15
];

export class GamificationSystem {
  private static userProgress: Map<string, UserProgress> = new Map();
  private static challenges: Challenge[] = [];
  
  // Initialize user progress
  static initializeUser(userId: string): UserProgress {
    const progress: UserProgress = {
      userId,
      totalPoints: 0,
      level: 1,
      achievements: [],
      streaks: {
        dailyCheckIn: 0,
        safetyReports: 0,
        trainingCompleted: 0,
      },
      statistics: {
        auditsCompleted: 0,
        incidentsFreedays: 0,
        trainingHours: 0,
        complianceScore: 0,
      },
    };
    
    this.userProgress.set(userId, progress);
    return progress;
  }
  
  // Get user progress
  static getUserProgress(userId: string): UserProgress {
    return this.userProgress.get(userId) || this.initializeUser(userId);
  }
  
  // Add points to user
  static addPoints(userId: string, points: number, reason: string): {
    newPoints: number;
    levelUp: boolean;
    newLevel?: number;
  } {
    const progress = this.getUserProgress(userId);
    const oldLevel = progress.level;
    
    progress.totalPoints += points;
    progress.level = this.calculateLevel(progress.totalPoints);
    
    this.userProgress.set(userId, progress);
    
    const levelUp = progress.level > oldLevel;
    
    console.log(`[Gamification] ${userId}: +${points} points (${reason})`);
    
    return {
      newPoints: progress.totalPoints,
      levelUp,
      newLevel: levelUp ? progress.level : undefined,
    };
  }
  
  // Check and award achievements
  static checkAchievements(
    userId: string,
    stats: Partial<UserProgress['statistics']>
  ): Achievement[] {
    const progress = this.getUserProgress(userId);
    const newAchievements: Achievement[] = [];
    
    // Update statistics
    Object.assign(progress.statistics, stats);
    
    // Check each achievement
    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if already unlocked
      if (progress.achievements.some(a => a.id === id)) continue;
      
      // Check if requirements met
      const isMet = this.checkRequirements(achievement.requirements, progress);
      
      if (isMet) {
        const unlockedAchievement: Achievement = {
          ...achievement,
          unlockedAt: new Date(),
          requirements: {
            ...achievement.requirements,
            current: achievement.requirements.target,
          },
        };
        
        progress.achievements.push(unlockedAchievement);
        newAchievements.push(unlockedAchievement);
        
        // Award points
        this.addPoints(userId, achievement.points, `Achievement: ${achievement.title}`);
      }
    }
    
    this.userProgress.set(userId, progress);
    return newAchievements;
  }
  
  // Update streak
  static updateStreak(
    userId: string,
    streakType: keyof UserProgress['streaks'],
    increment: boolean
  ): number {
    const progress = this.getUserProgress(userId);
    
    if (increment) {
      progress.streaks[streakType]++;
      
      // Bonus points for streak milestones
      const streak = progress.streaks[streakType];
      if (streak % 7 === 0) {
        this.addPoints(userId, 50, `${streakType} 7-day streak`);
      }
      if (streak % 30 === 0) {
        this.addPoints(userId, 200, `${streakType} 30-day streak`);
      }
    } else {
      progress.streaks[streakType] = 0;
    }
    
    this.userProgress.set(userId, progress);
    return progress.streaks[streakType];
  }
  
  // Get leaderboard
  static getLeaderboard(
    category: 'global' | 'vessel' | 'department',
    filter?: string,
    limit: number = 10
  ): LeaderboardEntry[] {
    let entries: LeaderboardEntry[] = [];
    
    this.userProgress.forEach((progress, id) => {
      entries.push({
        rank: 0,
        userId: id,
        name: `User ${id.substring(0, 8)}`, // Would be replaced with real names
        points: progress.totalPoints,
        level: progress.level,
        achievements: progress.achievements.length,
      });
    });
    
    // Sort by points
    entries.sort((a, b) => b.points - a.points);
    
    // Assign ranks
    entries = entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    
    return entries.slice(0, limit);
  }
  
  // Create challenge
  static createChallenge(challenge: Omit<Challenge, 'id' | 'leaderboard' | 'status'>): Challenge {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge-${Date.now()}`,
      leaderboard: [],
      status: new Date() < challenge.startDate ? 'upcoming' : 'active',
    };
    
    this.challenges.push(newChallenge);
    return newChallenge;
  }
  
  // Get active challenges
  static getActiveChallenges(): Challenge[] {
    const now = new Date();
    
    return this.challenges
      .filter(c => c.startDate <= now && c.endDate >= now)
      .map(c => ({ ...c, status: 'active' as const }));
  }
  
  // Join challenge
  static joinChallenge(challengeId: string, userId: string): boolean {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return false;
    
    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      challenge.leaderboard.push({
        participantId: userId,
        score: 0,
        rank: challenge.leaderboard.length + 1,
      });
    }
    
    return true;
  }
  
  // Update challenge score
  static updateChallengeScore(challengeId: string, userId: string, score: number): void {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return;
    
    const entry = challenge.leaderboard.find(e => e.participantId === userId);
    if (entry) {
      entry.score = score;
    }
    
    // Re-rank
    challenge.leaderboard.sort((a, b) => b.score - a.score);
    challenge.leaderboard.forEach((e, i) => {
      e.rank = i + 1;
    });
  }
  
  // Complete challenge
  static completeChallenge(challengeId: string): Array<{
    userId: string;
    rank: number;
    rewards: { points: number; badge?: string };
  }> {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return [];
    
    challenge.status = 'completed';
    
    const winners: Array<{
      userId: string;
      rank: number;
      rewards: { points: number; badge?: string };
    }> = [];
    
    // Award top 3
    for (let i = 0; i < Math.min(3, challenge.leaderboard.length); i++) {
      const entry = challenge.leaderboard[i];
      const multiplier = [1.5, 1.2, 1][i] || 1;
      const points = Math.round(challenge.rewards.points * multiplier);
      
      this.addPoints(entry.participantId, points, `Challenge: ${challenge.title}`);
      
      winners.push({
        userId: entry.participantId,
        rank: entry.rank,
        rewards: {
          points,
          badge: i === 0 ? challenge.rewards.badge : undefined,
        },
      });
    }
    
    return winners;
  }
  
  // Get all achievements (with progress)
  static getAllAchievements(userId: string): Array<Achievement & { progress: number }> {
    const progress = this.getUserProgress(userId);
    
    return Object.values(ACHIEVEMENTS).map(achievement => {
      const unlocked = progress.achievements.find(a => a.id === achievement.id);
      const currentProgress = this.getRequirementProgress(achievement.requirements, progress);
      
      return {
        ...achievement,
        requirements: {
          ...achievement.requirements,
          current: currentProgress,
        },
        unlockedAt: unlocked?.unlockedAt,
        progress: Math.min(100, (currentProgress / achievement.requirements.target) * 100),
      };
    });
  }
  
  // Private: Calculate level from points
  private static calculateLevel(points: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (points >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }
  
  // Private: Check if requirements are met
  private static checkRequirements(
    requirements: { type: string; target: number },
    progress: UserProgress
  ): boolean {
    const current = this.getRequirementProgress(requirements, progress);
    return current >= requirements.target;
  }
  
  // Private: Get current progress for requirement
  private static getRequirementProgress(
    requirements: { type: string; target: number },
    progress: UserProgress
  ): number {
    switch (requirements.type) {
      case 'peotram_100_percent':
        return progress.statistics.auditsCompleted; // Simplified
      case 'peotram_under_2h':
        return progress.statistics.auditsCompleted > 0 ? 1 : 0;
      case 'audit_streak_days':
        return progress.streaks.safetyReports;
      case 'wellness_score_days':
        return progress.streaks.dailyCheckIn;
      case 'checkin_streak':
        return progress.streaks.dailyCheckIn;
      case 'incident_free_days':
        return progress.statistics.incidentsFreedays;
      case 'near_miss_reports':
      case 'safety_observations':
        return progress.statistics.auditsCompleted * 2; // Simplified
      case 'training_modules':
        return Math.floor(progress.statistics.trainingHours / 2);
      case 'certs_current_days':
        return progress.statistics.incidentsFreedays; // Simplified
      default:
        return 0;
    }
  }
  
  // Get points to next level
  static getPointsToNextLevel(userId: string): {
    currentLevel: number;
    currentPoints: number;
    pointsToNext: number;
    nextLevelThreshold: number;
    progress: number;
  } {
    const progress = this.getUserProgress(userId);
    const currentThreshold = LEVEL_THRESHOLDS[progress.level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[progress.level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    
    return {
      currentLevel: progress.level,
      currentPoints: progress.totalPoints,
      pointsToNext: nextThreshold - progress.totalPoints,
      nextLevelThreshold: nextThreshold,
      progress: ((progress.totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100,
    };
  }
}

export default GamificationSystem;
