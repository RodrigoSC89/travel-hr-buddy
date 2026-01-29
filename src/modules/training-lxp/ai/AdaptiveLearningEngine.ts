/**
 * 🎓 Adaptive Learning Engine - AI-Powered Personalized Education
 * NAUTILUS ONE v5.0 - Revolutionary Learning Experience Platform
 * 
 * Creates personalized curriculum based on learning style,
 * knowledge gaps, and real-time performance adaptation
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface LearningStyle {
  visual: number;
  auditory: number;
  kinesthetic: number;
  reading: number;
}

export interface LearnerProfile {
  id: string;
  name: string;
  learningStyle: LearningStyle;
  preferredPace: 'slow' | 'normal' | 'fast';
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  strengths: string[];
  challenges: string[];
  optimalLearningTime: string;
  retentionRate: number;
  completedModules: number;
  averageScore: number;
  streak: number;
}

export interface KnowledgeGap {
  topic: string;
  category: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTimeToClose: string;
}

export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredCertifications: string[];
  deadline?: Date;
  priority: 'optional' | 'recommended' | 'required' | 'mandatory';
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'interactive' | 'reading' | 'simulation' | 'vr' | 'quiz' | 'practical';
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  learningObjectives: string[];
  prerequisites: string[];
  assessmentType: 'quiz' | 'practical' | 'simulation' | 'peer-review';
  xpReward: number;
  badge?: string;
}

export interface PersonalizedCurriculum {
  id: string;
  learnerId: string;
  objective: LearningObjective;
  modules: CurriculumModule[];
  estimatedTime: number;
  learningPath: {
    phase: string;
    modules: string[];
    milestone: string;
  }[];
  assessments: {
    moduleId: string;
    type: string;
    weight: number;
  }[];
  personalization: {
    style: LearningStyle;
    pace: string;
    difficulty: string;
    contentFormat: string[];
  };
  createdAt: Date;
  confidence: number;
}

export interface LearningPerformance {
  moduleId: string;
  score: number;
  time: number;
  expectedTime: number;
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
  engagementScore: number;
}

export interface Adaptation {
  action: 'increase_difficulty' | 'simplify' | 'maintain' | 'change_format';
  reason: string;
  adjustments: {
    skipBasics?: boolean;
    addAdvancedContent?: boolean;
    acceleratePace?: boolean;
    addExamples?: boolean;
    slowerPace?: boolean;
    moreGuidance?: boolean;
    alternativeExplanations?: boolean;
    changeContentType?: string;
  };
  suggestedContent?: CurriculumModule[];
}

// Maritime training categories
const TRAINING_CATEGORIES = [
  'Safety & Emergency', 'Navigation', 'Engineering', 'Cargo Operations',
  'Bridge Procedures', 'Environmental', 'Leadership', 'Communication',
  'Medical', 'Security', 'Compliance', 'Technical Systems'
];

// Default learning style weights
const CONTENT_TYPE_BY_STYLE: Record<string, string[]> = {
  visual: ['video', 'interactive', 'simulation'],
  auditory: ['video', 'discussion', 'lecture'],
  kinesthetic: ['simulation', 'vr', 'practical'],
  reading: ['reading', 'documentation', 'case-study']
};

class AdaptiveLearningEngine {

  /**
   * Build learner profile from historical data and assessments
   */
  async buildLearnerProfile(learnerId: string): Promise<LearnerProfile> {
    try {
      // Fetch crew member data
      const { data: crewMember } = await supabase
        .from('crew_members')
        .select('*')
        .eq('id', learnerId)
        .maybeSingle();

      // Fetch training completions
      const { data: completions } = await supabase
        .from('training_completions')
        .select('*')
        .eq('crew_member_id', learnerId);

      // Calculate learning style (would come from assessment in real implementation)
      const learningStyle = this.assessLearningStyle(completions || []);

      // Calculate performance metrics
      const metrics = this.calculatePerformanceMetrics(completions || []);

      // Identify strengths and challenges
      const { strengths, challenges } = this.identifyStrengthsAndChallenges(completions || []);

      return {
        id: learnerId,
        name: crewMember?.full_name || 'Unknown',
        learningStyle,
        preferredPace: this.determinePace(metrics),
        currentLevel: this.determineLevel(metrics),
        strengths,
        challenges,
        optimalLearningTime: '09:00-11:00', // Would be learned over time
        retentionRate: metrics.retentionRate,
        completedModules: completions?.length || 0,
        averageScore: metrics.averageScore,
        streak: this.calculateStreak(completions || [])
      };
    } catch (error) {
      logger.error('Failed to build learner profile', error as Error);
      // Return default profile
      return this.getDefaultProfile(learnerId);
    }
  }

  /**
   * Assess learning style based on performance patterns
   */
  private assessLearningStyle(completions: any[]): LearningStyle {
    // In a real implementation, this would analyze:
    // - Performance on different content types
    // - Time spent on different formats
    // - User preferences and feedback
    
    const videoScore = this.getContentTypeScore(completions, 'video');
    const interactiveScore = this.getContentTypeScore(completions, 'interactive');
    const readingScore = this.getContentTypeScore(completions, 'reading');
    const practicalScore = this.getContentTypeScore(completions, 'practical');

    const total = videoScore + interactiveScore + readingScore + practicalScore || 1;

    return {
      visual: Math.round((videoScore / total) * 100) || 35,
      auditory: Math.round((videoScore * 0.5 / total) * 100) || 20,
      kinesthetic: Math.round((practicalScore / total) * 100) || 25,
      reading: Math.round((readingScore / total) * 100) || 20
    };
  }

  /**
   * Get score for a specific content type
   */
  private getContentTypeScore(completions: any[], type: string): number {
    const typeCompletions = completions.filter(c => c.content_type === type);
    if (typeCompletions.length === 0) return 25;
    return typeCompletions.reduce((sum, c) => sum + (c.quiz_score || 70), 0) / typeCompletions.length;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(completions: any[]): {
    averageScore: number;
    retentionRate: number;
    avgTimePerModule: number;
    passRate: number;
  } {
    if (completions.length === 0) {
      return { averageScore: 0, retentionRate: 75, avgTimePerModule: 30, passRate: 0 };
    }

    const scores = completions.map(c => c.quiz_score || 0);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passed = completions.filter(c => c.passed).length;

    return {
      averageScore: Math.round(averageScore),
      retentionRate: Math.round(75 + (averageScore - 70) * 0.5),
      avgTimePerModule: 30,
      passRate: Math.round((passed / completions.length) * 100)
    };
  }

  /**
   * Determine learning pace from metrics
   */
  private determinePace(metrics: { averageScore: number; passRate: number }): LearnerProfile['preferredPace'] {
    if (metrics.averageScore > 85 && metrics.passRate > 90) return 'fast';
    if (metrics.averageScore < 70 || metrics.passRate < 70) return 'slow';
    return 'normal';
  }

  /**
   * Determine current level
   */
  private determineLevel(metrics: { averageScore: number }): LearnerProfile['currentLevel'] {
    if (metrics.averageScore >= 90) return 'expert';
    if (metrics.averageScore >= 80) return 'advanced';
    if (metrics.averageScore >= 60) return 'intermediate';
    return 'beginner';
  }

  /**
   * Identify strengths and challenges from completions
   */
  private identifyStrengthsAndChallenges(completions: any[]): {
    strengths: string[];
    challenges: string[];
  } {
    const categoryScores: Record<string, number[]> = {};

    completions.forEach(c => {
      const category = c.category || 'General';
      if (!categoryScores[category]) categoryScores[category] = [];
      categoryScores[category].push(c.quiz_score || 70);
    });

    const avgByCategory = Object.entries(categoryScores).map(([cat, scores]) => ({
      category: cat,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    }));

    const sorted = avgByCategory.sort((a, b) => b.avg - a.avg);

    return {
      strengths: sorted.slice(0, 3).map(s => s.category),
      challenges: sorted.slice(-3).map(s => s.category).filter(c => 
        avgByCategory.find(a => a.category === c)?.avg || 0 < 75
      )
    };
  }

  /**
   * Calculate learning streak
   */
  private calculateStreak(completions: any[]): number {
    if (completions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCompletion = completions.some(c => 
        c.completed_at?.split('T')[0] === dateStr
      );

      if (hasCompletion) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get default profile for new learners
   */
  private getDefaultProfile(learnerId: string): LearnerProfile {
    return {
      id: learnerId,
      name: 'New Learner',
      learningStyle: { visual: 30, auditory: 25, kinesthetic: 25, reading: 20 },
      preferredPace: 'normal',
      currentLevel: 'beginner',
      strengths: [],
      challenges: [],
      optimalLearningTime: '09:00-11:00',
      retentionRate: 75,
      completedModules: 0,
      averageScore: 0,
      streak: 0
    };
  }

  /**
   * Analyze knowledge gaps based on profile and objective
   */
  async analyzeKnowledgeGaps(
    profile: LearnerProfile,
    objective: LearningObjective
  ): Promise<KnowledgeGap[]> {
    const gaps: KnowledgeGap[] = [];

    // Get required skills for objective
    const requiredSkills = this.getRequiredSkillsForObjective(objective);

    for (const skill of requiredSkills) {
      const currentLevel = this.assessCurrentSkillLevel(profile, skill);
      const requiredLevel = skill.minimumLevel;

      if (currentLevel < requiredLevel) {
        gaps.push({
          topic: skill.name,
          category: skill.category,
          currentLevel,
          requiredLevel,
          gap: requiredLevel - currentLevel,
          priority: this.calculateGapPriority(requiredLevel - currentLevel, skill.critical),
          estimatedTimeToClose: this.estimateTimeToClose(requiredLevel - currentLevel)
        });
      }
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Get required skills for an objective
   */
  private getRequiredSkillsForObjective(objective: LearningObjective): Array<{
    name: string;
    category: string;
    minimumLevel: number;
    critical: boolean;
  }> {
    // In real implementation, this would come from a skills matrix
    return [
      { name: 'Safety Procedures', category: 'Safety', minimumLevel: 80, critical: true },
      { name: 'Emergency Response', category: 'Safety', minimumLevel: 75, critical: true },
      { name: 'Navigation Basics', category: 'Navigation', minimumLevel: 70, critical: false },
      { name: 'Communication', category: 'Bridge', minimumLevel: 65, critical: false }
    ];
  }

  /**
   * Assess current skill level
   */
  private assessCurrentSkillLevel(profile: LearnerProfile, skill: any): number {
    // Based on profile performance
    if (profile.strengths.includes(skill.category)) {
      return 80 + Math.random() * 15;
    }
    if (profile.challenges.includes(skill.category)) {
      return 40 + Math.random() * 20;
    }
    return 55 + Math.random() * 25;
  }

  /**
   * Calculate gap priority
   */
  private calculateGapPriority(gap: number, critical: boolean): KnowledgeGap['priority'] {
    if (critical && gap > 30) return 'critical';
    if (gap > 40) return 'high';
    if (gap > 20) return 'medium';
    return 'low';
  }

  /**
   * Estimate time to close gap
   */
  private estimateTimeToClose(gap: number): string {
    const hours = Math.ceil(gap * 0.5);
    if (hours <= 2) return '1-2 hours';
    if (hours <= 5) return '3-5 hours';
    if (hours <= 10) return '5-10 hours';
    return '10+ hours';
  }

  /**
   * Create personalized curriculum
   */
  async createPersonalizedCurriculum(
    learnerId: string,
    objective: LearningObjective
  ): Promise<PersonalizedCurriculum> {
    logger.info('Creating personalized curriculum', { learnerId, objective: objective.title });

    // Build learner profile
    const profile = await this.buildLearnerProfile(learnerId);

    // Analyze knowledge gaps
    const knowledgeGaps = await this.analyzeKnowledgeGaps(profile, objective);

    // Generate modules based on gaps and profile
    const modules = this.generateModules(profile, knowledgeGaps, objective);

    // Create learning path
    const learningPath = this.createLearningPath(modules, profile);

    // Create assessments
    const assessments = this.createAssessments(modules);

    // Calculate estimated time
    const estimatedTime = modules.reduce((sum, m) => sum + m.duration, 0);

    // Determine preferred content formats
    const preferredFormats = this.getPreferredFormats(profile.learningStyle);

    const curriculum: PersonalizedCurriculum = {
      id: crypto.randomUUID(),
      learnerId,
      objective,
      modules,
      estimatedTime,
      learningPath,
      assessments,
      personalization: {
        style: profile.learningStyle,
        pace: profile.preferredPace,
        difficulty: profile.currentLevel,
        contentFormat: preferredFormats
      },
      createdAt: new Date(),
      confidence: 82 + Math.random() * 10
    };

    logger.info('Curriculum created', { 
      moduleCount: modules.length, 
      estimatedTime,
      confidence: curriculum.confidence 
    });

    return curriculum;
  }

  /**
   * Generate modules based on learner profile and gaps
   */
  private generateModules(
    profile: LearnerProfile,
    gaps: KnowledgeGap[],
    objective: LearningObjective
  ): CurriculumModule[] {
    const modules: CurriculumModule[] = [];
    const preferredTypes = this.getPreferredFormats(profile.learningStyle);

    gaps.forEach((gap, index) => {
      // Introduction module
      modules.push({
        id: `module-${index}-intro`,
        title: `Introduction to ${gap.topic}`,
        description: `Foundational concepts for ${gap.topic}`,
        type: preferredTypes[0] as CurriculumModule['type'],
        duration: this.getDurationByPace(15, profile.preferredPace),
        difficulty: 'beginner',
        learningObjectives: [`Understand basic ${gap.topic} concepts`],
        prerequisites: [],
        assessmentType: 'quiz',
        xpReward: 50,
        badge: undefined
      });

      // Core content module
      modules.push({
        id: `module-${index}-core`,
        title: `${gap.topic} - Core Concepts`,
        description: `In-depth training on ${gap.topic}`,
        type: preferredTypes[1] as CurriculumModule['type'] || 'interactive',
        duration: this.getDurationByPace(30, profile.preferredPace),
        difficulty: 'intermediate',
        learningObjectives: [`Apply ${gap.topic} principles`, `Demonstrate ${gap.topic} proficiency`],
        prerequisites: [`module-${index}-intro`],
        assessmentType: 'practical',
        xpReward: 100,
        badge: undefined
      });

      // Advanced/Practical module for high priority gaps
      if (gap.priority === 'critical' || gap.priority === 'high') {
        modules.push({
          id: `module-${index}-advanced`,
          title: `${gap.topic} - Advanced Application`,
          description: `Real-world scenarios and simulations for ${gap.topic}`,
          type: 'simulation',
          duration: this.getDurationByPace(45, profile.preferredPace),
          difficulty: 'advanced',
          learningObjectives: [`Master ${gap.topic}`, `Handle complex ${gap.topic} scenarios`],
          prerequisites: [`module-${index}-core`],
          assessmentType: 'simulation',
          xpReward: 150,
          badge: `${gap.topic} Expert`
        });
      }
    });

    // Add certification assessment
    modules.push({
      id: 'final-assessment',
      title: `${objective.title} - Final Assessment`,
      description: 'Comprehensive assessment for certification',
      type: 'quiz',
      duration: 60,
      difficulty: 'advanced',
      learningObjectives: objective.requiredCertifications,
      prerequisites: modules.slice(-1).map(m => m.id),
      assessmentType: 'quiz',
      xpReward: 300,
      badge: objective.title
    });

    return modules;
  }

  /**
   * Get duration adjusted for pace
   */
  private getDurationByPace(baseDuration: number, pace: string): number {
    const multiplier = { slow: 1.3, normal: 1, fast: 0.8 }[pace] || 1;
    return Math.round(baseDuration * multiplier);
  }

  /**
   * Get preferred content formats from learning style
   */
  private getPreferredFormats(style: LearningStyle): string[] {
    const ranked = Object.entries(style)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([key]) => key);

    const formats: string[] = [];
    ranked.forEach(styleName => {
      formats.push(...(CONTENT_TYPE_BY_STYLE[styleName] || []));
    });

    return [...new Set(formats)];
  }

  /**
   * Create learning path with phases
   */
  private createLearningPath(modules: CurriculumModule[], profile: LearnerProfile): PersonalizedCurriculum['learningPath'] {
    const phases: PersonalizedCurriculum['learningPath'] = [];
    
    // Foundation phase
    const foundationModules = modules.filter(m => m.difficulty === 'beginner');
    if (foundationModules.length > 0) {
      phases.push({
        phase: 'Foundation',
        modules: foundationModules.map(m => m.id),
        milestone: 'Complete foundational concepts'
      });
    }

    // Core phase
    const coreModules = modules.filter(m => m.difficulty === 'intermediate');
    if (coreModules.length > 0) {
      phases.push({
        phase: 'Core Development',
        modules: coreModules.map(m => m.id),
        milestone: 'Master core skills'
      });
    }

    // Advanced phase
    const advancedModules = modules.filter(m => m.difficulty === 'advanced');
    if (advancedModules.length > 0) {
      phases.push({
        phase: 'Advanced Mastery',
        modules: advancedModules.map(m => m.id),
        milestone: 'Achieve certification'
      });
    }

    return phases;
  }

  /**
   * Create assessments for modules
   */
  private createAssessments(modules: CurriculumModule[]): PersonalizedCurriculum['assessments'] {
    return modules.map(m => ({
      moduleId: m.id,
      type: m.assessmentType,
      weight: m.difficulty === 'advanced' ? 30 : m.difficulty === 'intermediate' ? 25 : 15
    }));
  }

  /**
   * Adapt content in real-time based on performance
   */
  async adaptInRealTime(
    learnerId: string,
    moduleId: string,
    performance: LearningPerformance
  ): Promise<Adaptation> {
    logger.info('Adapting learning content', { learnerId, moduleId, score: performance.score });

    // High performer - increase difficulty
    if (performance.score > 0.9 && performance.time < performance.expectedTime * 0.7) {
      return {
        action: 'increase_difficulty',
        reason: 'Exceptional performance - ready for advanced content',
        adjustments: {
          skipBasics: true,
          addAdvancedContent: true,
          acceleratePace: true
        },
        suggestedContent: [{
          id: 'advanced-challenge',
          title: 'Advanced Challenge',
          description: 'Challenge content for high performers',
          type: 'simulation',
          duration: 20,
          difficulty: 'advanced',
          learningObjectives: ['Master advanced concepts'],
          prerequisites: [moduleId],
          assessmentType: 'simulation',
          xpReward: 200
        }]
      };
    }

    // Struggling - simplify
    if (performance.score < 0.6 || performance.attempts > 3) {
      return {
        action: 'simplify',
        reason: 'Content may be too difficult - adding support',
        adjustments: {
          addExamples: true,
          slowerPace: true,
          moreGuidance: true,
          alternativeExplanations: true
        },
        suggestedContent: [{
          id: 'reinforcement',
          title: 'Concept Reinforcement',
          description: 'Additional examples and explanations',
          type: 'interactive',
          duration: 15,
          difficulty: 'beginner',
          learningObjectives: ['Reinforce understanding'],
          prerequisites: [],
          assessmentType: 'quiz',
          xpReward: 30
        }]
      };
    }

    // Average performance - consider content format change
    if (performance.engagementScore < 0.5) {
      return {
        action: 'change_format',
        reason: 'Low engagement - trying different content format',
        adjustments: {
          changeContentType: 'interactive'
        }
      };
    }

    // Good progress - maintain
    return {
      action: 'maintain',
      reason: 'Good progress - continuing on current path',
      adjustments: {}
    };
  }
}

export const adaptiveLearningEngine = new AdaptiveLearningEngine();
