/**
 * Adaptive Learning AI
 * Personalized crew training with ML-powered skill assessment
 */

import { supabase } from '@/integrations/supabase/client';

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  certifications: Certification[];
  completedTrainings: string[];
  skillScores: Record<string, number>;
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  preferredLanguage: string;
}

export interface Certification {
  id: string;
  name: string;
  issuedAt: string;
  expiresAt: string;
  status: 'valid' | 'expiring' | 'expired';
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'required' | 'recommended' | 'optional';
  trainingModules: string[];
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  prerequisites: string[];
  deliveryMethods: ('video' | 'text' | 'interactive' | 'simulation')[];
  completionRate: number;
  avgScore: number;
}

export interface LearningPath {
  required: SkillGap[];
  recommended: SkillGap[];
  optional: SkillGap[];
  estimatedTime: number;
  deliveryMethod: string;
  modules: TrainingModule[];
}

export interface TestResult {
  score: number;
  passed: boolean;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  timeSpent: number;
}

export interface SimulationScenario {
  id: string;
  name: string;
  type: 'emergency' | 'navigation' | 'maintenance' | 'communication';
  description: string;
  objectives: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number;
}

/**
 * Adaptive Learning AI System
 */
export class AdaptiveLearningAI {
  private static instance: AdaptiveLearningAI;

  // Role-based skill requirements
  private roleRequirements: Record<string, Record<string, number>> = {
    captain: {
      navigation: 95,
      leadership: 90,
      safety_management: 95,
      emergency_response: 95,
      communication: 90,
      regulatory_compliance: 90
    },
    chief_officer: {
      navigation: 90,
      cargo_operations: 90,
      safety_management: 85,
      leadership: 80,
      emergency_response: 85
    },
    engineer: {
      machinery_operations: 90,
      maintenance: 85,
      safety_systems: 80,
      troubleshooting: 85,
      regulatory_compliance: 75
    },
    deck_officer: {
      navigation: 80,
      watchkeeping: 85,
      communication: 75,
      safety_procedures: 80
    },
    crew_member: {
      safety_procedures: 75,
      emergency_response: 70,
      basic_operations: 70,
      teamwork: 70
    }
  };

  private constructor() {}

  static getInstance(): AdaptiveLearningAI {
    if (!this.instance) {
      this.instance = new AdaptiveLearningAI();
    }
    return this.instance;
  }

  /**
   * Assess current skill levels
   */
  async assessSkills(crewMember: CrewMember): Promise<Record<string, number>> {
    // Get historical performance data
    const { data: performanceData } = await supabase
      .from('ai_training_history')
      .select('*')
      .eq('crew_member_id', crewMember.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const skillScores: Record<string, number> = { ...crewMember.skillScores };

    if (performanceData && performanceData.length > 0) {
      // Analyze recent performance to update skill estimates
      for (const record of performanceData) {
        const data = (record as Record<string, unknown>).interaction_data as Record<string, unknown> | undefined;
        const skill = data?.skill as string | undefined;
        const score = data?.score as number | undefined;
        if (skill && typeof score === 'number') {
          const currentScore = skillScores[skill] || 50;
          // Weighted average with recent performance
          skillScores[skill] = currentScore * 0.7 + score * 0.3;
        }
      }
    }

    return skillScores;
  }

  /**
   * Identify skill gaps based on role requirements
   */
  async identifySkillGaps(role: string, currentSkills: Record<string, number>): Promise<SkillGap[]> {
    const requirements = this.roleRequirements[role.toLowerCase()] || this.roleRequirements.crew_member;
    const gaps: SkillGap[] = [];

    for (const [skill, requiredLevel] of Object.entries(requirements)) {
      const currentLevel = currentSkills[skill] || 0;
      const gap = requiredLevel - currentLevel;

      if (gap > 0) {
        gaps.push({
          skill,
          currentLevel,
          requiredLevel,
          gap,
          priority: this.calculatePriority(gap, requiredLevel),
          trainingModules: this.findTrainingModules(skill, gap)
        });
      }
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { required: 0, recommended: 1, optional: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority] || b.gap - a.gap;
    });
  }

  /**
   * Calculate gap priority
   */
  private calculatePriority(gap: number, requiredLevel: number): SkillGap['priority'] {
    if (gap > 30 || requiredLevel >= 90) return 'required';
    if (gap > 15) return 'recommended';
    return 'optional';
  }

  /**
   * Find training modules for skill gap
   */
  private findTrainingModules(skill: string, gap: number): string[] {
    const moduleMap: Record<string, string[]> = {
      navigation: ['NAV-101', 'NAV-201', 'NAV-301'],
      safety_management: ['SAFE-101', 'SAFE-201', 'ISM-101'],
      emergency_response: ['EMER-101', 'EMER-201', 'FIRE-101', 'SAR-101'],
      leadership: ['LEAD-101', 'LEAD-201', 'TEAM-101'],
      regulatory_compliance: ['REG-101', 'SOLAS-101', 'MLC-101', 'STCW-101'],
      machinery_operations: ['MACH-101', 'MACH-201', 'ENGINE-101'],
      cargo_operations: ['CARGO-101', 'CARGO-201', 'TANKER-101']
    };

    const modules = moduleMap[skill] || [`${skill.toUpperCase()}-101`];
    
    // Return modules based on gap size
    if (gap > 40) return modules;
    if (gap > 20) return modules.slice(0, 2);
    return modules.slice(0, 1);
  }

  /**
   * Generate personalized training path
   */
  async generateTrainingPath(crewMember: CrewMember): Promise<LearningPath> {
    const skills = await this.assessSkills(crewMember);
    const gaps = await this.identifySkillGaps(crewMember.role, skills);
    const learningStyle = await this.detectLearningStyle(crewMember.id);

    // Group gaps by priority
    const required = gaps.filter(g => g.priority === 'required');
    const recommended = gaps.filter(g => g.priority === 'recommended');
    const optional = gaps.filter(g => g.priority === 'optional');

    // Get training modules
    const moduleIds = [...new Set(gaps.flatMap(g => g.trainingModules))];
    const modules = await this.getTrainingModules(moduleIds);

    // Calculate total time
    const estimatedTime = modules.reduce((sum, m) => sum + m.duration, 0);

    // Adapt delivery method based on learning style
    const deliveryMethod = this.adaptDeliveryMethod(learningStyle);

    return {
      required,
      recommended,
      optional,
      estimatedTime,
      deliveryMethod,
      modules
    };
  }

  /**
   * Detect learning style from history
   */
  async detectLearningStyle(crewMemberId: string): Promise<CrewMember['learningStyle']> {
    const { data } = await supabase
      .from('ai_training_history')
      .select('interaction_data')
      .eq('crew_member_id', crewMemberId)
      .limit(20);

    if (!data || data.length === 0) {
      return 'visual'; // Default
    }

    // Analyze interaction patterns
    const styles = { visual: 0, auditory: 0, kinesthetic: 0, reading: 0 };

    for (const record of data) {
      const interaction = (record as Record<string, unknown>).interaction_data as Record<string, unknown> | undefined;
      if (interaction?.preferredFormat === 'video') styles.visual++;
      if (interaction?.preferredFormat === 'audio') styles.auditory++;
      if (interaction?.preferredFormat === 'simulation') styles.kinesthetic++;
      if (interaction?.preferredFormat === 'text') styles.reading++;
    }

    const maxStyle = Object.entries(styles).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxStyle[0] as CrewMember['learningStyle'];
  }

  /**
   * Adapt delivery method based on learning style
   */
  private adaptDeliveryMethod(style: CrewMember['learningStyle']): string {
    const methods: Record<string, string> = {
      visual: 'Video tutorials with visual demonstrations and infographics',
      auditory: 'Audio lessons with podcasts and verbal explanations',
      kinesthetic: 'Interactive simulations and hands-on exercises',
      reading: 'Text-based materials with detailed documentation'
    };
    return methods[style || 'visual'];
  }

  /**
   * Get training modules
   */
  private async getTrainingModules(moduleIds: string[]): Promise<TrainingModule[]> {
    // Simulated module data
    return moduleIds.map((id, idx) => ({
      id,
      title: `Training Module ${id}`,
      description: `Comprehensive training for ${id.split('-')[0]} skills`,
      duration: [45, 60, 30, 90, 50][idx % 5],
      difficulty: (['beginner', 'intermediate', 'advanced'] as const)[idx % 3],
      skills: [id.split('-')[0].toLowerCase()],
      prerequisites: [],
      deliveryMethods: ['video', 'interactive'],
      completionRate: [82, 78, 90, 85, 76][idx % 5],
      avgScore: [75, 82, 88, 71, 80][idx % 5]
    }));
  }

  /**
   * Generate adaptive test for skill validation
   */
  async generateAdaptiveTest(skill: string, currentLevel: number): Promise<{
    questions: { id: string; type: string; difficulty: string; skill: string; points: number }[];
    difficulty: string;
    timeLimit: number;
  }> {
    const difficulty = currentLevel < 50 ? 'beginner' : currentLevel < 75 ? 'intermediate' : 'advanced';
    const questionCount = difficulty === 'beginner' ? 10 : difficulty === 'intermediate' ? 15 : 20;
    const timeLimit = questionCount * 2; // 2 minutes per question

    return {
      questions: Array(questionCount).fill(null).map((_, i) => ({
        id: `q-${skill}-${i}`,
        type: i % 2 === 0 ? 'multiple_choice' : 'true_false',
        difficulty,
        skill,
        points: difficulty === 'advanced' ? 3 : difficulty === 'intermediate' ? 2 : 1
      })),
      difficulty,
      timeLimit
    };
  }

  /**
   * Validate competency with test
   */
  async validateCompetency(
    crewMember: CrewMember,
    skill: string,
    answers: Record<string, { correct: boolean }>
  ): Promise<TestResult> {
    const test = await this.generateAdaptiveTest(skill, crewMember.skillScores[skill] || 50);
    const passingScore = 70;

    // Calculate score (simplified)
    const correctAnswers = Object.values(answers).filter(a => a.correct).length;
    const score = (correctAnswers / test.questions.length) * 100;

    // Analyze strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (score >= 90) {
      strengths.push(`Excellent ${skill} knowledge`);
      recommendations.push(`Consider advanced ${skill} certification`);
    } else if (score >= 70) {
      strengths.push(`Solid ${skill} fundamentals`);
      recommendations.push(`Review advanced ${skill} concepts`);
    } else {
      weaknesses.push(`${skill} needs improvement`);
      recommendations.push(`Complete ${skill} refresher training`);
      recommendations.push('Schedule mentor sessions');
    }

    return {
      score,
      passed: score >= passingScore,
      strengths,
      weaknesses,
      recommendations,
      timeSpent: Math.floor(test.timeLimit * 0.7) + 5
    };
  }

  /**
   * Get available simulations
   */
  async getAvailableSimulations(crewMember: CrewMember): Promise<SimulationScenario[]> {
    const roleSimulations: Record<string, SimulationScenario[]> = {
      captain: [
        {
          id: 'sim-emergency-1',
          name: 'Man Overboard Response',
          type: 'emergency',
          description: 'Command rescue operation for man overboard situation',
          objectives: ['Coordinate rescue team', 'Execute Williamson turn', 'Communicate with coast guard'],
          difficulty: 'hard',
          estimatedDuration: 30
        },
        {
          id: 'sim-nav-1',
          name: 'Restricted Visibility Navigation',
          type: 'navigation',
          description: 'Navigate through fog with limited visibility',
          objectives: ['Use radar effectively', 'Maintain safe speed', 'Sound proper signals'],
          difficulty: 'medium',
          estimatedDuration: 20
        }
      ],
      engineer: [
        {
          id: 'sim-maint-1',
          name: 'Engine Failure Response',
          type: 'maintenance',
          description: 'Diagnose and respond to main engine failure',
          objectives: ['Identify failure cause', 'Execute emergency procedures', 'Restore propulsion'],
          difficulty: 'hard',
          estimatedDuration: 45
        }
      ],
      default: [
        {
          id: 'sim-fire-1',
          name: 'Fire Fighting Drill',
          type: 'emergency',
          description: 'Respond to fire in accommodation area',
          objectives: ['Sound alarm', 'Evacuate personnel', 'Control fire spread'],
          difficulty: 'medium',
          estimatedDuration: 25
        }
      ]
    };

    return roleSimulations[crewMember.role.toLowerCase()] || roleSimulations.default;
  }

  /**
   * Run training simulation
   */
  async runSimulation(
    crewMember: CrewMember,
    scenarioId: string
  ): Promise<{
    completed: boolean;
    score: number;
    feedback: string[];
    objectivesAchieved: boolean[];
    improvementAreas: string[];
  }> {
    // Simulated result
    const score = 78;
    const completed = true;

    return {
      completed,
      score,
      feedback: [
        score >= 80 ? 'Excellent response time and decision making' : 'Response time could be improved',
        score >= 70 ? 'Good communication with team' : 'Work on clear communication during emergencies',
        'Remember to document all actions taken'
      ],
      objectivesAchieved: [true, score >= 70, score >= 80],
      improvementAreas: score < 80 ? ['Response time', 'Coordination'] : []
    };
  }
}

// Export singleton instance
export const adaptiveLearning = AdaptiveLearningAI.getInstance();
