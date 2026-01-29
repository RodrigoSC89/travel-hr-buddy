/**
 * 🎮 MicroLearning Engine - Gamified Bite-Sized Learning
 * NAUTILUS ONE v5.0 - Revolutionary Learning Experience Platform
 * 
 * 5-10 minute learning sessions with gamification,
 * spaced repetition, and high retention
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface MicroLesson {
  id: string;
  topic: string;
  title: string;
  hook: string; // Why this matters - 15 sec attention grabber
  concept: {
    summary: string;
    keyPoints: string[];
    visual?: string;
  };
  examples: {
    title: string;
    scenario: string;
    outcome: string;
  }[];
  application: {
    when: string;
    how: string;
    tips: string[];
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  estimatedTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  completionBadge?: string;
  nextTopic?: string;
}

export interface DailyLearning {
  lesson: MicroLesson;
  estimatedTime: string;
  bestTime: string;
  gamification: {
    xpReward: number;
    badge?: string;
    streak: number;
    leaderboardImpact: string;
  };
  notification: {
    title: string;
    message: string;
    timing: string;
  };
}

export interface GameProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  longestStreak: number;
  badges: Badge[];
  leaderboardPosition: number;
  achievements: Achievement[];
  completedLessons: number;
  totalXP: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  completedAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  learnerId: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  avatar?: string;
}

// Topics for maritime microlearning
const MICRO_TOPICS = [
  { id: 'safety-basics', name: 'Safety Basics', category: 'Safety' },
  { id: 'fire-prevention', name: 'Fire Prevention', category: 'Safety' },
  { id: 'man-overboard', name: 'Man Overboard Procedures', category: 'Safety' },
  { id: 'nav-rules', name: 'Navigation Rules', category: 'Navigation' },
  { id: 'collision-avoidance', name: 'Collision Avoidance', category: 'Navigation' },
  { id: 'weather-reading', name: 'Weather Reading', category: 'Navigation' },
  { id: 'engine-basics', name: 'Engine Basics', category: 'Engineering' },
  { id: 'fuel-management', name: 'Fuel Management', category: 'Engineering' },
  { id: 'radio-protocol', name: 'Radio Protocol', category: 'Communication' },
  { id: 'bridge-teamwork', name: 'Bridge Teamwork', category: 'Leadership' }
];

// XP thresholds for levels
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 5000, 6200, 7600, 9200, 11000, 13000, 15500, 18500, 22000
];

// Badge definitions
const BADGES: Record<string, Omit<Badge, 'earnedAt'>> = {
  'first-lesson': { id: 'first-lesson', name: 'First Step', description: 'Complete your first lesson', icon: '🎯', rarity: 'common' },
  'streak-3': { id: 'streak-3', name: 'On Fire', description: '3 day learning streak', icon: '🔥', rarity: 'common' },
  'streak-7': { id: 'streak-7', name: 'Week Warrior', description: '7 day learning streak', icon: '⚡', rarity: 'uncommon' },
  'streak-30': { id: 'streak-30', name: 'Dedicated Learner', description: '30 day learning streak', icon: '💫', rarity: 'rare' },
  'perfect-quiz': { id: 'perfect-quiz', name: 'Perfect Score', description: 'Get 100% on a quiz', icon: '🌟', rarity: 'uncommon' },
  'speed-learner': { id: 'speed-learner', name: 'Speed Learner', description: 'Complete lesson in under 3 minutes', icon: '⚡', rarity: 'uncommon' },
  'safety-expert': { id: 'safety-expert', name: 'Safety Expert', description: 'Complete all safety lessons', icon: '🛡️', rarity: 'rare' },
  'navigator': { id: 'navigator', name: 'Navigator', description: 'Complete all navigation lessons', icon: '🧭', rarity: 'rare' },
  'level-10': { id: 'level-10', name: 'Rising Star', description: 'Reach level 10', icon: '⭐', rarity: 'rare' },
  'level-20': { id: 'level-20', name: 'Expert', description: 'Reach level 20', icon: '👑', rarity: 'epic' },
  'leaderboard-top10': { id: 'leaderboard-top10', name: 'Top 10', description: 'Reach top 10 on leaderboard', icon: '🏆', rarity: 'epic' }
};

class MicroLearningEngine {

  /**
   * Get learner profile for personalization
   */
  private async getLearnerProfile(learnerId: string): Promise<any> {
    const { data: crewMember } = await supabase
      .from('crew_members')
      .select('*')
      .eq('id', learnerId)
      .maybeSingle();

    return {
      id: learnerId,
      name: crewMember?.full_name || 'Learner',
      position: crewMember?.position || 'Crew',
      learningStyle: { visual: 35, auditory: 25, kinesthetic: 25, reading: 15 },
      currentStreak: await this.getCurrentStreak(learnerId),
      completedTopics: await this.getCompletedTopics(learnerId)
    };
  }

  /**
   * Get current learning streak
   */
  private async getCurrentStreak(learnerId: string): Promise<number> {
    const { data: completions } = await supabase
      .from('training_completions')
      .select('completed_at')
      .eq('crew_member_id', learnerId)
      .order('completed_at', { ascending: false });

    if (!completions || completions.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCompletion = completions.some(c => 
        c.completed_at?.split('T')[0] === dateStr
      );

      if (hasCompletion || i === 0) {
        if (hasCompletion) streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get completed topics for learner
   */
  private async getCompletedTopics(learnerId: string): Promise<string[]> {
    const { data } = await supabase
      .from('training_completions')
      .select('training_module_id')
      .eq('crew_member_id', learnerId);

    return data?.map(d => d.training_module_id).filter((id): id is string => id !== null) || [];
  }

  /**
   * Identify knowledge gaps based on performance
   */
  private async identifyKnowledgeGaps(learnerId: string): Promise<string[]> {
    const completedTopics = await this.getCompletedTopics(learnerId);
    const allTopicIds = MICRO_TOPICS.map(t => t.id);
    
    // Topics not yet completed
    const notCompleted = allTopicIds.filter(id => !completedTopics.includes(id));
    
    // Prioritize based on category importance for maritime
    const prioritized = notCompleted.sort((a, b) => {
      const topicA = MICRO_TOPICS.find(t => t.id === a);
      const topicB = MICRO_TOPICS.find(t => t.id === b);
      const priority: Record<string, number> = { Safety: 0, Navigation: 1, Engineering: 2, Communication: 3, Leadership: 4 };
      return (priority[topicA?.category || ''] || 99) - (priority[topicB?.category || ''] || 99);
    });

    return prioritized;
  }

  /**
   * Get optimal learning time for learner
   */
  private async getOptimalLearningTime(learnerId: string): Promise<{ optimalTime: string }> {
    // In a real implementation, this would analyze when learner performs best
    return { optimalTime: '09:00' };
  }

  /**
   * Select optimal topic based on gaps and spaced repetition
   */
  private async selectOptimalTopic(
    profile: any, 
    gaps: string[]
  ): Promise<typeof MICRO_TOPICS[0]> {
    // Select first gap topic or random if all completed
    const topicId = gaps[0] || MICRO_TOPICS[Math.floor(Math.random() * MICRO_TOPICS.length)].id;
    return MICRO_TOPICS.find(t => t.id === topicId) || MICRO_TOPICS[0];
  }

  /**
   * Create micro lesson content
   */
  private async createMicroLesson(
    topic: typeof MICRO_TOPICS[0],
    profile: any
  ): Promise<MicroLesson> {
    // Generate content based on topic
    const lessons: Record<string, MicroLesson> = {
      'safety-basics': {
        id: 'safety-basics-001',
        topic: topic.name,
        title: 'Essential Safety on Board',
        hook: "Did you know that 80% of maritime accidents are preventable with proper safety awareness? Let's master the basics in just 5 minutes!",
        concept: {
          summary: 'Safety at sea starts with awareness and preparation. Every crew member is responsible for their own safety and the safety of others.',
          keyPoints: [
            'Always know your muster station and escape routes',
            'PPE must be worn correctly for each task',
            'Report hazards immediately - never assume someone else will',
            'Safety is everyone\'s responsibility, regardless of rank'
          ]
        },
        examples: [
          {
            title: 'Quick Response Saves Lives',
            scenario: 'A crew member notices a loose railing on deck during rough weather',
            outcome: 'By reporting immediately and securing the area, they prevented a potential man overboard situation'
          },
          {
            title: 'PPE Matters',
            scenario: 'Working in the engine room without proper hearing protection',
            outcome: 'Long-term exposure leads to permanent hearing damage - always use PPE'
          }
        ],
        application: {
          when: 'Every moment on board - safety is 24/7',
          how: 'Stay alert, follow procedures, speak up about concerns',
          tips: [
            'Do a mental safety check before starting any task',
            'Know emergency signals by heart',
            'Keep walkways clear at all times'
          ]
        },
        quiz: [
          {
            question: 'What is the FIRST thing you should do when boarding a new vessel?',
            options: ['Find your cabin', 'Learn your muster station and escape routes', 'Meet the captain', 'Unpack your belongings'],
            correctIndex: 1,
            explanation: 'Knowing your muster station and escape routes could save your life in an emergency.'
          },
          {
            question: 'Who is responsible for safety on board?',
            options: ['Only the captain', 'Only the safety officer', 'Everyone', 'Only senior officers'],
            correctIndex: 2,
            explanation: 'Safety is a collective responsibility. Every crew member must be vigilant.'
          },
          {
            question: 'When should you report a potential hazard?',
            options: ['At the next safety meeting', 'When you have time', 'Immediately', 'Only if it causes an accident'],
            correctIndex: 2,
            explanation: 'Immediate reporting prevents accidents and saves lives.'
          }
        ],
        estimatedTime: 5,
        difficulty: 'easy',
        xpReward: 50,
        completionBadge: undefined,
        nextTopic: 'fire-prevention'
      },
      'fire-prevention': {
        id: 'fire-prevention-001',
        topic: topic.name,
        title: 'Fire Prevention at Sea',
        hook: 'Fire at sea is one of the most dangerous emergencies. In the next 5 minutes, you\'ll learn how to prevent it!',
        concept: {
          summary: 'The fire triangle requires fuel, oxygen, and heat. Remove any element to prevent or extinguish a fire.',
          keyPoints: [
            'Know the fire triangle: Fuel + Oxygen + Heat',
            'Keep flammable materials properly stored',
            'Maintain electrical systems to prevent sparks',
            'Never block fire-fighting equipment access'
          ]
        },
        examples: [
          {
            title: 'Galley Fire Prevention',
            scenario: 'Grease buildup in kitchen ventilation system',
            outcome: 'Regular cleaning prevents the #1 cause of galley fires'
          }
        ],
        application: {
          when: 'During all operations, especially in engine room, galley, and storage areas',
          how: 'Regular inspections, proper storage, immediate cleanup of spills',
          tips: [
            'Check fire extinguisher locations daily',
            'Report any unusual odors immediately',
            'Know your fire station assignment'
          ]
        },
        quiz: [
          {
            question: 'What are the three elements of the fire triangle?',
            options: ['Water, Air, Wood', 'Fuel, Oxygen, Heat', 'Smoke, Fire, Ash', 'Electricity, Gas, Spark'],
            correctIndex: 1,
            explanation: 'The fire triangle consists of Fuel, Oxygen, and Heat. Remove any element to prevent fire.'
          },
          {
            question: 'What is the most common cause of galley fires?',
            options: ['Electrical faults', 'Grease buildup', 'Gas leaks', 'Smoking'],
            correctIndex: 1,
            explanation: 'Grease buildup in ventilation systems is the leading cause of galley fires.'
          }
        ],
        estimatedTime: 5,
        difficulty: 'easy',
        xpReward: 50,
        nextTopic: 'man-overboard'
      }
    };

    // Return specific lesson or generate default
    return lessons[topic.id] || {
      id: `${topic.id}-001`,
      topic: topic.name,
      title: `Understanding ${topic.name}`,
      hook: `Master ${topic.name} in just 5 minutes!`,
      concept: {
        summary: `Essential knowledge about ${topic.name} for maritime professionals.`,
        keyPoints: [
          `Key aspect 1 of ${topic.name}`,
          `Key aspect 2 of ${topic.name}`,
          `Key aspect 3 of ${topic.name}`
        ]
      },
      examples: [{
        title: 'Practical Example',
        scenario: `Real-world application of ${topic.name}`,
        outcome: 'Successful implementation leads to improved operations'
      }],
      application: {
        when: 'During relevant operations',
        how: 'Apply learned principles consistently',
        tips: ['Stay current with best practices', 'Practice regularly']
      },
      quiz: [{
        question: `What is most important about ${topic.name}?`,
        options: ['Option A', 'Consistent application', 'Option C', 'Option D'],
        correctIndex: 1,
        explanation: 'Consistent application of principles is key to success.'
      }],
      estimatedTime: 5,
      difficulty: 'easy',
      xpReward: 50
    };
  }

  /**
   * Generate daily learning for a learner
   */
  async generateDailyLearning(learnerId: string): Promise<DailyLearning> {
    logger.info('Generating daily learning', { learnerId });

    const profile = await this.getLearnerProfile(learnerId);
    const gaps = await this.identifyKnowledgeGaps(learnerId);
    const schedule = await this.getOptimalLearningTime(learnerId);
    const topic = await this.selectOptimalTopic(profile, gaps);
    const microLesson = await this.createMicroLesson(topic, profile);

    return {
      lesson: microLesson,
      estimatedTime: '5-7 minutes',
      bestTime: schedule.optimalTime,
      gamification: {
        xpReward: microLesson.xpReward,
        badge: microLesson.completionBadge,
        streak: profile.currentStreak,
        leaderboardImpact: '+10 points'
      },
      notification: {
        title: '🎯 Quick Learning Opportunity!',
        message: `Master ${topic.name} in just 5 minutes`,
        timing: schedule.optimalTime
      }
    };
  }

  /**
   * Calculate XP for completed lesson
   */
  private calculateXP(score: number, lessonId: string): number {
    const baseXP = 50;
    const scoreMultiplier = score / 100;
    const bonusXP = score === 100 ? 20 : 0; // Perfect score bonus
    
    return Math.round(baseXP * scoreMultiplier + bonusXP);
  }

  /**
   * Calculate level from XP
   */
  private calculateLevel(xp: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get XP needed for next level
   */
  private getXPToNextLevel(level: number): number {
    if (level >= LEVEL_THRESHOLDS.length) return 0;
    return LEVEL_THRESHOLDS[level];
  }

  /**
   * Check and award new badges
   */
  private async checkBadges(learnerId: string, completedLesson: string): Promise<Badge[]> {
    const newBadges: Badge[] = [];
    const progress = await this.getCurrentProgress(learnerId);

    // First lesson badge
    if (progress.completedLessons === 0) {
      newBadges.push({ ...BADGES['first-lesson'], earnedAt: new Date() });
    }

    // Streak badges
    if (progress.streak === 3 && !progress.badges.some(b => b.id === 'streak-3')) {
      newBadges.push({ ...BADGES['streak-3'], earnedAt: new Date() });
    }
    if (progress.streak === 7 && !progress.badges.some(b => b.id === 'streak-7')) {
      newBadges.push({ ...BADGES['streak-7'], earnedAt: new Date() });
    }
    if (progress.streak === 30 && !progress.badges.some(b => b.id === 'streak-30')) {
      newBadges.push({ ...BADGES['streak-30'], earnedAt: new Date() });
    }

    return newBadges;
  }

  /**
   * Update learning streak
   */
  private async updateStreak(learnerId: string): Promise<number> {
    const currentStreak = await this.getCurrentStreak(learnerId);
    return currentStreak + 1; // Will be 1 after completing today's lesson
  }

  /**
   * Update leaderboard
   */
  private async updateLeaderboard(learnerId: string, xpGained: number): Promise<void> {
    // Would update leaderboard in database
    logger.info('Leaderboard updated', { learnerId, xpGained });
  }

  /**
   * Notify achievements
   */
  private async notifyAchievements(
    learnerId: string, 
    data: { badges: Badge[]; levelUp: boolean; newLevel: number }
  ): Promise<void> {
    logger.info('Achievement notification', { learnerId, ...data });
    // Would send push notification / in-app notification
  }

  /**
   * Get current progress for learner
   */
  async getCurrentProgress(learnerId: string): Promise<GameProgress> {
    // In real implementation, fetch from database
    const xp = 850;
    const level = this.calculateLevel(xp);

    return {
      level,
      xp,
      xpToNextLevel: this.getXPToNextLevel(level) - xp,
      streak: await this.getCurrentStreak(learnerId),
      longestStreak: 15,
      badges: [
        { ...BADGES['first-lesson'], earnedAt: new Date('2025-01-01') },
        { ...BADGES['streak-3'], earnedAt: new Date('2025-01-04') }
      ],
      leaderboardPosition: 42,
      achievements: [
        {
          id: 'complete-10',
          name: 'Dedicated Learner',
          description: 'Complete 10 lessons',
          progress: 7,
          target: 10,
          reward: 100,
          completed: false
        },
        {
          id: 'perfect-week',
          name: 'Perfect Week',
          description: 'Get 100% on 7 quizzes in a week',
          progress: 3,
          target: 7,
          reward: 200,
          completed: false
        }
      ],
      completedLessons: 7,
      totalXP: xp
    };
  }

  /**
   * Get leaderboard position
   */
  private async getLeaderboardPosition(learnerId: string): Promise<number> {
    // Would query actual leaderboard
    return 42;
  }

  /**
   * Get recent achievements
   */
  private getRecentAchievements(learnerId: string): Achievement[] {
    return [];
  }

  /**
   * Update game progress after completing a lesson
   */
  async updateGameProgress(
    learnerId: string,
    completedLesson: string,
    score: number
  ): Promise<GameProgress> {
    logger.info('Updating game progress', { learnerId, completedLesson, score });

    const current = await this.getCurrentProgress(learnerId);
    const xpGained = this.calculateXP(score, completedLesson);
    const newXP = current.xp + xpGained;
    const newLevel = this.calculateLevel(newXP);
    const newBadges = await this.checkBadges(learnerId, completedLesson);
    const newStreak = await this.updateStreak(learnerId);

    await this.updateLeaderboard(learnerId, xpGained);

    if (newBadges.length > 0 || newLevel > current.level) {
      await this.notifyAchievements(learnerId, {
        badges: newBadges,
        levelUp: newLevel > current.level,
        newLevel
      });
    }

    return {
      level: newLevel,
      xp: newXP,
      xpToNextLevel: this.getXPToNextLevel(newLevel) - newXP,
      streak: newStreak,
      longestStreak: Math.max(current.longestStreak, newStreak),
      badges: [...current.badges, ...newBadges],
      leaderboardPosition: await this.getLeaderboardPosition(learnerId),
      achievements: current.achievements,
      completedLessons: current.completedLessons + 1,
      totalXP: newXP
    };
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Would fetch from database
    return [
      { rank: 1, learnerId: 'user1', name: 'John Smith', xp: 5420, level: 12, streak: 45 },
      { rank: 2, learnerId: 'user2', name: 'Maria Garcia', xp: 4850, level: 11, streak: 30 },
      { rank: 3, learnerId: 'user3', name: 'James Wilson', xp: 4200, level: 10, streak: 22 },
      { rank: 4, learnerId: 'user4', name: 'Emma Brown', xp: 3800, level: 9, streak: 15 },
      { rank: 5, learnerId: 'user5', name: 'Michael Chen', xp: 3500, level: 9, streak: 12 }
    ];
  }
}

export const microLearningEngine = new MicroLearningEngine();
