/**
 * Adaptive Training Engine
 * IA gera cursos personalizados baseado em gaps de competência identificados
 * Nível: Semi-autônomo
 */

export interface CrewCompetencyProfile {
  crewMemberId: string;
  name: string;
  position: string;
  department: string;
  competencies: CompetencyAssessment[];
  learningStyle: LearningStyle;
  trainingHistory: TrainingRecord[];
  performanceGaps: PerformanceGap[];
  certificationNeeds: CertificationNeed[];
  preferredLanguage: string;
  availableTrainingHours: number; // per week
}

export interface CompetencyAssessment {
  competencyId: string;
  competencyName: string;
  category: CompetencyCategory;
  currentLevel: number; // 1-5
  requiredLevel: number; // 1-5
  gap: number; // required - current
  lastAssessed: Date;
  assessmentMethod: 'test' | 'observation' | 'self_assessment' | 'peer_review';
}

export type CompetencyCategory = 
  | 'technical' 
  | 'safety' 
  | 'leadership' 
  | 'communication' 
  | 'regulatory' 
  | 'operational';

export interface LearningStyle {
  primary: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  secondary: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredDuration: 'short' | 'medium' | 'long'; // modules
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
  socialPreference: 'individual' | 'group' | 'mixed';
}

export interface TrainingRecord {
  courseId: string;
  courseName: string;
  completedAt: Date;
  score: number;
  timeSpent: number; // minutes
  attempts: number;
  feedback: string;
  certificateIssued: boolean;
}

export interface PerformanceGap {
  area: string;
  description: string;
  severity: 'minor' | 'moderate' | 'significant';
  identifiedFrom: 'assessment' | 'incident' | 'observation' | 'audit';
  recommendedTraining: string[];
}

export interface CertificationNeed {
  certificationName: string;
  certificationCode: string;
  required: boolean;
  currentStatus: 'none' | 'expired' | 'expiring_soon' | 'valid';
  expiryDate: Date | null;
  requiredBy: Date;
  trainingRequired: boolean;
}

export interface AdaptiveCourse {
  courseId: string;
  title: string;
  description: string;
  targetCompetencies: string[];
  modules: CourseModule[];
  estimatedDuration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  adaptations: CourseAdaptation[];
  assessments: CourseAssessment[];
  certification: string | null;
  priority: 'required' | 'recommended' | 'optional';
}

export interface CourseModule {
  moduleId: string;
  title: string;
  type: ModuleType;
  content: ModuleContent;
  duration: number; // minutes
  interactiveElements: InteractiveElement[];
  checkpoints: Checkpoint[];
  adaptiveRules: AdaptiveRule[];
}

export type ModuleType = 
  | 'video' 
  | 'reading' 
  | 'simulation' 
  | 'quiz' 
  | 'practical' 
  | 'case_study' 
  | 'discussion';

export interface ModuleContent {
  primaryContent: string; // URL or content ID
  alternativeFormats: Array<{ type: string; contentId: string }>;
  supportingMaterials: string[];
  languageVersions: Record<string, string>;
}

export interface InteractiveElement {
  type: 'question' | 'exercise' | 'simulation' | 'reflection';
  content: string;
  correctAnswer?: string;
  feedback: { correct: string; incorrect: string };
}

export interface Checkpoint {
  position: number; // percentage through module
  type: 'understanding_check' | 'knowledge_gate' | 'skill_demonstration';
  requiredScore: number;
  retryAllowed: boolean;
}

export interface AdaptiveRule {
  condition: string; // e.g., "score < 70"
  action: 'repeat_section' | 'provide_help' | 'simplify' | 'skip_ahead' | 'alternative_content';
  parameters: Record<string, unknown>;
}

export interface CourseAdaptation {
  adaptationType: 'content' | 'pace' | 'difficulty' | 'format';
  description: string;
  appliedBased: string; // learning style, performance, etc.
}

export interface CourseAssessment {
  assessmentId: string;
  type: 'pre' | 'formative' | 'summative';
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number | null; // minutes
  attemptsAllowed: number;
}

export interface AssessmentQuestion {
  questionId: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'short_answer' | 'practical';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  competencyMapped: string;
  difficulty: number; // 1-5
}

export interface LearningPath {
  pathId: string;
  crewMemberId: string;
  title: string;
  goal: string;
  courses: LearningPathCourse[];
  estimatedDuration: number; // total hours
  deadline: Date | null;
  progress: number; // percentage
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue';
  adaptations: string[];
}

export interface LearningPathCourse {
  courseId: string;
  order: number;
  required: boolean;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number | null;
  completedAt: Date | null;
}

export interface TrainingRecommendation {
  crewMemberId: string;
  crewMemberName: string;
  recommendedCourses: RecommendedCourse[];
  priorityAreas: string[];
  estimatedTimeToComplete: number; // hours
  complianceImpact: string;
  careerImpact: string;
}

export interface RecommendedCourse {
  course: AdaptiveCourse;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  relevanceScore: number;
  deadline: Date | null;
}

class AdaptiveTrainingEngine {
  private courseTemplates: Map<string, AdaptiveCourse> = new Map();

  constructor() {
    this.initializeCourseTemplates();
  }

  private initializeCourseTemplates(): void {
    // STCW Basic Safety Training
    this.courseTemplates.set('stcw_basic_safety', {
      courseId: 'stcw_basic_safety',
      title: 'STCW Basic Safety Training',
      description: 'Treinamento básico de segurança conforme convenção STCW',
      targetCompetencies: ['fire_fighting', 'survival_at_sea', 'first_aid', 'personal_safety'],
      modules: this.generateSafetyModules(),
      estimatedDuration: 480,
      difficulty: 'intermediate',
      prerequisites: [],
      adaptations: [],
      assessments: this.generateSafetyAssessments(),
      certification: 'STCW A-VI/1',
      priority: 'required'
    });

    // Leadership & Management
    this.courseTemplates.set('leadership_maritime', {
      courseId: 'leadership_maritime',
      title: 'Liderança Marítima',
      description: 'Desenvolvimento de competências de liderança para oficiais',
      targetCompetencies: ['team_management', 'decision_making', 'crisis_leadership', 'communication'],
      modules: this.generateLeadershipModules(),
      estimatedDuration: 360,
      difficulty: 'advanced',
      prerequisites: ['stcw_basic_safety'],
      adaptations: [],
      assessments: this.generateLeadershipAssessments(),
      certification: null,
      priority: 'recommended'
    });

    // MLC 2006 Compliance
    this.courseTemplates.set('mlc_compliance', {
      courseId: 'mlc_compliance',
      title: 'Conformidade MLC 2006',
      description: 'Entendimento e aplicação da Convenção do Trabalho Marítimo',
      targetCompetencies: ['regulatory_knowledge', 'crew_welfare', 'documentation'],
      modules: this.generateMLCModules(),
      estimatedDuration: 240,
      difficulty: 'intermediate',
      prerequisites: [],
      adaptations: [],
      assessments: this.generateMLCAssessments(),
      certification: null,
      priority: 'required'
    });
  }

  private generateSafetyModules(): CourseModule[] {
    return [
      {
        moduleId: 'safety_intro',
        title: 'Introdução à Segurança Marítima',
        type: 'video',
        content: {
          primaryContent: 'safety_intro_video',
          alternativeFormats: [{ type: 'reading', contentId: 'safety_intro_text' }],
          supportingMaterials: ['safety_checklist.pdf'],
          languageVersions: { pt: 'safety_intro_pt', en: 'safety_intro_en' }
        },
        duration: 30,
        interactiveElements: [
          {
            type: 'question',
            content: 'Qual é o primeiro passo ao identificar um perigo a bordo?',
            correctAnswer: 'Avaliar o risco e comunicar à equipe',
            feedback: {
              correct: 'Correto! A comunicação é essencial.',
              incorrect: 'A comunicação imediata é fundamental.'
            }
          }
        ],
        checkpoints: [
          { position: 50, type: 'understanding_check', requiredScore: 60, retryAllowed: true }
        ],
        adaptiveRules: [
          {
            condition: 'score < 60',
            action: 'repeat_section',
            parameters: { section: 'core_concepts' }
          }
        ]
      },
      {
        moduleId: 'fire_fighting',
        title: 'Combate a Incêndio',
        type: 'simulation',
        content: {
          primaryContent: 'fire_sim_3d',
          alternativeFormats: [{ type: 'video', contentId: 'fire_video' }],
          supportingMaterials: ['fire_procedures.pdf', 'extinguisher_guide.pdf'],
          languageVersions: { pt: 'fire_sim_pt', en: 'fire_sim_en' }
        },
        duration: 60,
        interactiveElements: [
          {
            type: 'simulation',
            content: 'Simule a evacuação durante incêndio',
            feedback: {
              correct: 'Evacuação bem executada!',
              incorrect: 'Revise os procedimentos de evacuação.'
            }
          }
        ],
        checkpoints: [
          { position: 100, type: 'skill_demonstration', requiredScore: 80, retryAllowed: true }
        ],
        adaptiveRules: [
          {
            condition: 'attempts > 3',
            action: 'provide_help',
            parameters: { helpType: 'video_walkthrough' }
          }
        ]
      }
    ];
  }

  private generateLeadershipModules(): CourseModule[] {
    return [
      {
        moduleId: 'leadership_fundamentals',
        title: 'Fundamentos de Liderança',
        type: 'reading',
        content: {
          primaryContent: 'leadership_guide',
          alternativeFormats: [{ type: 'video', contentId: 'leadership_video' }],
          supportingMaterials: [],
          languageVersions: { pt: 'leadership_pt', en: 'leadership_en' }
        },
        duration: 45,
        interactiveElements: [],
        checkpoints: [],
        adaptiveRules: []
      }
    ];
  }

  private generateMLCModules(): CourseModule[] {
    return [
      {
        moduleId: 'mlc_overview',
        title: 'Visão Geral MLC 2006',
        type: 'reading',
        content: {
          primaryContent: 'mlc_guide',
          alternativeFormats: [],
          supportingMaterials: ['mlc_checklist.pdf'],
          languageVersions: { pt: 'mlc_pt', en: 'mlc_en' }
        },
        duration: 60,
        interactiveElements: [],
        checkpoints: [],
        adaptiveRules: []
      }
    ];
  }

  private generateSafetyAssessments(): CourseAssessment[] {
    return [
      {
        assessmentId: 'safety_pre',
        type: 'pre',
        questions: [
          {
            questionId: 'q1',
            type: 'multiple_choice',
            question: 'Qual equipamento deve ser usado ao combater incêndio Classe B?',
            options: ['Água', 'Espuma', 'CO2', 'Qualquer um'],
            correctAnswer: 'Espuma',
            explanation: 'Incêndios Classe B (líquidos inflamáveis) requerem espuma ou CO2',
            competencyMapped: 'fire_fighting',
            difficulty: 3
          }
        ],
        passingScore: 0,
        timeLimit: null,
        attemptsAllowed: 1
      },
      {
        assessmentId: 'safety_final',
        type: 'summative',
        questions: [],
        passingScore: 70,
        timeLimit: 60,
        attemptsAllowed: 3
      }
    ];
  }

  private generateLeadershipAssessments(): CourseAssessment[] {
    return [];
  }

  private generateMLCAssessments(): CourseAssessment[] {
    return [];
  }

  analyzeCompetencyGaps(profile: CrewCompetencyProfile): PerformanceGap[] {
    const gaps: PerformanceGap[] = [];

    for (const competency of profile.competencies) {
      if (competency.gap > 0) {
        gaps.push({
          area: competency.competencyName,
          description: `Nível atual: ${competency.currentLevel}, Requerido: ${competency.requiredLevel}`,
          severity: competency.gap >= 2 ? 'significant' : competency.gap >= 1 ? 'moderate' : 'minor',
          identifiedFrom: 'assessment',
          recommendedTraining: this.findTrainingForCompetency(competency.competencyId)
        });
      }
    }

    return gaps.sort((a, b) => {
      const severityOrder = { significant: 0, moderate: 1, minor: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  private findTrainingForCompetency(competencyId: string): string[] {
    const training: string[] = [];
    
    for (const [courseId, course] of this.courseTemplates) {
      if (course.targetCompetencies.includes(competencyId)) {
        training.push(courseId);
      }
    }

    return training;
  }

  generatePersonalizedCourse(
    profile: CrewCompetencyProfile,
    baseCourse: AdaptiveCourse
  ): AdaptiveCourse {
    const adaptedCourse = { ...baseCourse };
    const adaptations: CourseAdaptation[] = [];

    // Adapt based on learning style
    if (profile.learningStyle.primary === 'visual') {
      adaptations.push({
        adaptationType: 'format',
        description: 'Priorizando conteúdo visual e vídeos',
        appliedBased: 'learning_style'
      });
    } else if (profile.learningStyle.primary === 'kinesthetic') {
      adaptations.push({
        adaptationType: 'format',
        description: 'Incluindo mais simulações e exercícios práticos',
        appliedBased: 'learning_style'
      });
    }

    // Adapt based on available time
    if (profile.availableTrainingHours < 5) {
      adaptations.push({
        adaptationType: 'pace',
        description: 'Módulos condensados para treinamento intensivo',
        appliedBased: 'time_constraint'
      });
    }

    // Adapt based on previous performance
    const relevantHistory = profile.trainingHistory.filter(t => 
      baseCourse.targetCompetencies.some(c => t.courseName.toLowerCase().includes(c))
    );
    
    if (relevantHistory.length > 0) {
      const avgScore = relevantHistory.reduce((sum, t) => sum + t.score, 0) / relevantHistory.length;
      if (avgScore < 70) {
        adaptations.push({
          adaptationType: 'difficulty',
          description: 'Reforço de conceitos básicos incluído',
          appliedBased: 'previous_performance'
        });
      } else if (avgScore > 90) {
        adaptations.push({
          adaptationType: 'difficulty',
          description: 'Conteúdo avançado priorizado',
          appliedBased: 'previous_performance'
        });
      }
    }

    adaptedCourse.adaptations = adaptations;
    return adaptedCourse;
  }

  generateLearningPath(profile: CrewCompetencyProfile): LearningPath {
    const gaps = this.analyzeCompetencyGaps(profile);
    const certNeeds = profile.certificationNeeds.filter(c => 
      c.currentStatus !== 'valid' || c.trainingRequired
    );

    const courses: LearningPathCourse[] = [];
    let totalDuration = 0;

    // Add required certification training first
    for (const certNeed of certNeeds) {
      const relatedCourse = this.findCourseForCertification(certNeed.certificationCode);
      if (relatedCourse) {
        courses.push({
          courseId: relatedCourse.courseId,
          order: courses.length + 1,
          required: certNeed.required,
          status: courses.length === 0 ? 'available' : 'locked',
          score: null,
          completedAt: null
        });
        totalDuration += relatedCourse.estimatedDuration;
      }
    }

    // Add gap-closing training
    for (const gap of gaps) {
      for (const trainingId of gap.recommendedTraining) {
        if (!courses.some(c => c.courseId === trainingId)) {
          const course = this.courseTemplates.get(trainingId);
          if (course) {
            courses.push({
              courseId: trainingId,
              order: courses.length + 1,
              required: gap.severity === 'significant',
              status: 'locked',
              score: null,
              completedAt: null
            });
            totalDuration += course.estimatedDuration;
          }
        }
      }
    }

    // Calculate deadline based on certification needs
    const urgentDeadline = certNeeds
      .filter(c => c.required)
      .map(c => c.requiredBy)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      pathId: crypto.randomUUID(),
      crewMemberId: profile.crewMemberId,
      title: `Plano de Desenvolvimento - ${profile.name}`,
      goal: 'Fechar gaps de competência e manter certificações em dia',
      courses,
      estimatedDuration: Math.round(totalDuration / 60),
      deadline: urgentDeadline || null,
      progress: 0,
      status: 'not_started',
      adaptations: []
    };
  }

  private findCourseForCertification(certCode: string): AdaptiveCourse | null {
    for (const course of this.courseTemplates.values()) {
      if (course.certification === certCode) {
        return course;
      }
    }
    return null;
  }

  generateRecommendations(profile: CrewCompetencyProfile): TrainingRecommendation {
    const gaps = this.analyzeCompetencyGaps(profile);
    const recommendations: RecommendedCourse[] = [];

    // Certification-based recommendations
    for (const certNeed of profile.certificationNeeds) {
      if (certNeed.currentStatus !== 'valid' && certNeed.trainingRequired) {
        const course = this.findCourseForCertification(certNeed.certificationCode);
        if (course) {
          recommendations.push({
            course,
            reason: `Certificação ${certNeed.certificationName} ${certNeed.currentStatus === 'none' ? 'não obtida' : 'expirada/expirando'}`,
            priority: certNeed.required ? 'critical' : 'high',
            relevanceScore: 100,
            deadline: certNeed.requiredBy
          });
        }
      }
    }

    // Gap-based recommendations
    for (const gap of gaps) {
      for (const courseId of gap.recommendedTraining) {
        if (!recommendations.some(r => r.course.courseId === courseId)) {
          const course = this.courseTemplates.get(courseId);
          if (course) {
            recommendations.push({
              course,
              reason: `Gap identificado: ${gap.area}`,
              priority: gap.severity === 'significant' ? 'high' : gap.severity === 'moderate' ? 'medium' : 'low',
              relevanceScore: gap.severity === 'significant' ? 90 : gap.severity === 'moderate' ? 70 : 50,
              deadline: null
            });
          }
        }
      }
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const totalTime = recommendations.reduce((sum, r) => sum + r.course.estimatedDuration, 0);

    return {
      crewMemberId: profile.crewMemberId,
      crewMemberName: profile.name,
      recommendedCourses: recommendations,
      priorityAreas: gaps.slice(0, 3).map(g => g.area),
      estimatedTimeToComplete: Math.round(totalTime / 60),
      complianceImpact: this.assessComplianceImpact(recommendations),
      careerImpact: this.assessCareerImpact(gaps, profile)
    };
  }

  private assessComplianceImpact(recommendations: RecommendedCourse[]): string {
    const critical = recommendations.filter(r => r.priority === 'critical').length;
    if (critical > 0) {
      return `${critical} treinamento(s) crítico(s) para conformidade regulatória`;
    }
    return 'Conformidade em dia, treinamentos recomendados para melhoria contínua';
  }

  private assessCareerImpact(gaps: PerformanceGap[], profile: CrewCompetencyProfile): string {
    const leadershipGaps = gaps.filter(g => 
      g.area.toLowerCase().includes('leadership') || 
      g.area.toLowerCase().includes('liderança')
    );

    if (leadershipGaps.length > 0 && profile.position.includes('Officer')) {
      return 'Desenvolvimento de liderança recomendado para progressão de carreira';
    }

    const significantGaps = gaps.filter(g => g.severity === 'significant');
    if (significantGaps.length > 0) {
      return 'Fechamento de gaps críticos necessário para manter qualificação';
    }

    return 'Perfil competitivo, treinamentos adicionais podem acelerar promoção';
  }

  getAllCourses(): AdaptiveCourse[] {
    return Array.from(this.courseTemplates.values());
  }

  getCourse(courseId: string): AdaptiveCourse | null {
    return this.courseTemplates.get(courseId) || null;
  }
}

export const adaptiveTrainingEngine = new AdaptiveTrainingEngine();
