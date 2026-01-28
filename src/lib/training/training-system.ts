/**
 * Training System - Sistema de Treinamento Completo
 * Prompt 16: Training System (onboarding, tutorials, certificações)
 */

export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration_minutes: number;
  modules: CourseModule[];
  prerequisites: string[];
  certificate_available: boolean;
  passing_score: number;
  created_at: string;
  updated_at: string;
  enrollment_count: number;
  completion_rate: number;
  average_rating: number;
}

export type CourseCategory = 
  | 'onboarding'
  | 'product_training'
  | 'compliance'
  | 'technical'
  | 'best_practices'
  | 'certification';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  quiz?: Quiz;
  duration_minutes: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'text' | 'interactive' | 'simulation';
  content: string;
  duration_minutes: number;
  resources?: { title: string; url: string }[];
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit_minutes?: number;
  allow_retry: boolean;
  max_attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'matching' | 'fill_blank';
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  points: number;
}

export interface UserProgress {
  user_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  current_module: number;
  current_lesson: number;
  completed_lessons: string[];
  quiz_attempts: QuizAttempt[];
  score?: number;
  certificate_issued: boolean;
  certificate_url?: string;
}

export interface QuizAttempt {
  quiz_id: string;
  attempt_number: number;
  score: number;
  passed: boolean;
  answers: { question_id: string; answer: string | string[] }[];
  started_at: string;
  completed_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target_element?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlight: boolean;
  action?: { type: 'click' | 'input' | 'navigate'; target: string };
  completed: boolean;
}

export interface OnboardingTour {
  id: string;
  name: string;
  description: string;
  steps: OnboardingStep[];
  trigger: 'first_login' | 'feature_first_use' | 'manual';
  target_roles: string[];
  completion_reward?: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  user_name: string;
  course_id: string;
  course_title: string;
  issued_at: string;
  valid_until?: string;
  score: number;
  verification_code: string;
  pdf_url: string;
}

// Training courses database
const TRAINING_COURSES: TrainingCourse[] = [
  {
    id: 'onb-1',
    title: 'Bem-vindo ao Nauti One',
    description: 'Tour completo pelo sistema e configuração inicial',
    category: 'onboarding',
    level: 'beginner',
    duration_minutes: 30,
    modules: [
      {
        id: 'onb-1-m1',
        title: 'Conhecendo o Dashboard',
        order: 1,
        duration_minutes: 10,
        lessons: [
          {
            id: 'onb-1-m1-l1',
            title: 'Visão geral do Dashboard',
            type: 'video',
            content: 'https://videos.nautione.com/onboarding/dashboard-overview.mp4',
            duration_minutes: 5
          },
          {
            id: 'onb-1-m1-l2',
            title: 'Personalizando widgets',
            type: 'interactive',
            content: 'Tutorial interativo de personalização de dashboard',
            duration_minutes: 5
          }
        ]
      },
      {
        id: 'onb-1-m2',
        title: 'Navegação e Menu',
        order: 2,
        duration_minutes: 10,
        lessons: [
          {
            id: 'onb-1-m2-l1',
            title: 'Menu principal',
            type: 'video',
            content: 'https://videos.nautione.com/onboarding/navigation.mp4',
            duration_minutes: 5
          },
          {
            id: 'onb-1-m2-l2',
            title: 'Atalhos de teclado',
            type: 'text',
            content: '# Atalhos de Teclado\n\n- `Ctrl+K`: Busca global\n- `Ctrl+N`: Nova entrada\n- `Ctrl+S`: Salvar\n- `Esc`: Fechar modal',
            duration_minutes: 5
          }
        ]
      },
      {
        id: 'onb-1-m3',
        title: 'Configurações Iniciais',
        order: 3,
        duration_minutes: 10,
        lessons: [
          {
            id: 'onb-1-m3-l1',
            title: 'Configurando seu perfil',
            type: 'interactive',
            content: 'Tutorial de configuração de perfil',
            duration_minutes: 5
          },
          {
            id: 'onb-1-m3-l2',
            title: 'Preferências de notificação',
            type: 'video',
            content: 'https://videos.nautione.com/onboarding/notifications.mp4',
            duration_minutes: 5
          }
        ],
        quiz: {
          id: 'onb-1-m3-q1',
          questions: [
            {
              id: 'q1',
              question: 'Qual atalho abre a busca global?',
              type: 'multiple_choice',
              options: ['Ctrl+K', 'Ctrl+F', 'Ctrl+S', 'Ctrl+G'],
              correct_answer: 'Ctrl+K',
              explanation: 'Ctrl+K abre a busca global em qualquer tela do sistema.',
              points: 10
            },
            {
              id: 'q2',
              question: 'O dashboard pode ser personalizado.',
              type: 'true_false',
              correct_answer: 'true',
              explanation: 'Sim! Você pode arrastar widgets e configurar quais métricas exibir.',
              points: 10
            }
          ],
          passing_score: 70,
          allow_retry: true,
          max_attempts: 3
        }
      }
    ],
    prerequisites: [],
    certificate_available: true,
    passing_score: 70,
    created_at: '2025-01-01',
    updated_at: '2026-01-28',
    enrollment_count: 1523,
    completion_rate: 92,
    average_rating: 4.8
  },
  {
    id: 'crew-1',
    title: 'Gestão de Tripulação Completa',
    description: 'Domine todas as funcionalidades de crew management',
    category: 'product_training',
    level: 'intermediate',
    duration_minutes: 60,
    modules: [
      {
        id: 'crew-1-m1',
        title: 'Cadastro de Tripulantes',
        order: 1,
        duration_minutes: 20,
        lessons: [
          {
            id: 'crew-1-m1-l1',
            title: 'Cadastro individual',
            type: 'video',
            content: 'https://videos.nautione.com/crew/cadastro.mp4',
            duration_minutes: 10
          },
          {
            id: 'crew-1-m1-l2',
            title: 'Importação em lote',
            type: 'interactive',
            content: 'Tutorial de importação CSV',
            duration_minutes: 10
          }
        ]
      },
      {
        id: 'crew-1-m2',
        title: 'Gestão de Documentos',
        order: 2,
        duration_minutes: 20,
        lessons: [
          {
            id: 'crew-1-m2-l1',
            title: 'Upload e validação',
            type: 'video',
            content: 'https://videos.nautione.com/crew/documentos.mp4',
            duration_minutes: 10
          },
          {
            id: 'crew-1-m2-l2',
            title: 'OCR automático',
            type: 'text',
            content: '# OCR de Documentos\n\nO sistema extrai automaticamente dados de certificados escaneados.',
            duration_minutes: 10
          }
        ]
      },
      {
        id: 'crew-1-m3',
        title: 'Escalas e Embarques',
        order: 3,
        duration_minutes: 20,
        lessons: [
          {
            id: 'crew-1-m3-l1',
            title: 'Planejando escalas',
            type: 'simulation',
            content: 'Simulação de planejamento de escala',
            duration_minutes: 15
          },
          {
            id: 'crew-1-m3-l2',
            title: 'Crew change',
            type: 'video',
            content: 'https://videos.nautione.com/crew/crew-change.mp4',
            duration_minutes: 5
          }
        ],
        quiz: {
          id: 'crew-1-m3-q1',
          questions: [
            {
              id: 'cq1',
              question: 'Qual formato é aceito para importação em lote?',
              type: 'multiple_choice',
              options: ['CSV', 'PDF', 'DOCX', 'TXT'],
              correct_answer: 'CSV',
              explanation: 'O sistema aceita arquivos CSV seguindo o template fornecido.',
              points: 20
            },
            {
              id: 'cq2',
              question: 'O OCR funciona em quais tipos de documento?',
              type: 'multiple_choice',
              options: ['Apenas PDF', 'PDF e imagens', 'Apenas fotos', 'Todos os formatos'],
              correct_answer: 'PDF e imagens',
              explanation: 'OCR funciona em PDFs e imagens (JPG, PNG) de boa qualidade.',
              points: 20
            }
          ],
          passing_score: 60,
          allow_retry: true,
          max_attempts: 3
        }
      }
    ],
    prerequisites: ['onb-1'],
    certificate_available: true,
    passing_score: 70,
    created_at: '2025-01-01',
    updated_at: '2026-01-28',
    enrollment_count: 892,
    completion_rate: 78,
    average_rating: 4.6
  },
  {
    id: 'comp-1',
    title: 'Compliance MLC 2006 & STCW',
    description: 'Certificação em compliance marítimo',
    category: 'compliance',
    level: 'advanced',
    duration_minutes: 120,
    modules: [
      {
        id: 'comp-1-m1',
        title: 'Fundamentos MLC 2006',
        order: 1,
        duration_minutes: 40,
        lessons: [
          {
            id: 'comp-1-m1-l1',
            title: 'Visão geral da convenção',
            type: 'video',
            content: 'https://videos.nautione.com/compliance/mlc-overview.mp4',
            duration_minutes: 20
          },
          {
            id: 'comp-1-m1-l2',
            title: 'Requisitos de horas de trabalho',
            type: 'text',
            content: '# Horas de Trabalho MLC 2006\n\n## Limites\n- Máximo 14h em 24h\n- Máximo 72h em 7 dias\n\n## Descanso\n- Mínimo 10h em 24h\n- Um período de 6h consecutivas',
            duration_minutes: 20
          }
        ]
      },
      {
        id: 'comp-1-m2',
        title: 'STCW Convention',
        order: 2,
        duration_minutes: 40,
        lessons: [
          {
            id: 'comp-1-m2-l1',
            title: 'Certificações obrigatórias',
            type: 'video',
            content: 'https://videos.nautione.com/compliance/stcw-certs.mp4',
            duration_minutes: 20
          },
          {
            id: 'comp-1-m2-l2',
            title: 'Matriz de competências',
            type: 'interactive',
            content: 'Simulador de matriz de competências',
            duration_minutes: 20
          }
        ]
      },
      {
        id: 'comp-1-m3',
        title: 'Usando o Nauti One para Compliance',
        order: 3,
        duration_minutes: 40,
        lessons: [
          {
            id: 'comp-1-m3-l1',
            title: 'Monitoramento automático',
            type: 'simulation',
            content: 'Demonstração do módulo de compliance',
            duration_minutes: 20
          },
          {
            id: 'comp-1-m3-l2',
            title: 'Preparação para inspeções',
            type: 'video',
            content: 'https://videos.nautione.com/compliance/inspection-prep.mp4',
            duration_minutes: 20
          }
        ],
        quiz: {
          id: 'comp-1-m3-q1',
          questions: [
            {
              id: 'compq1',
              question: 'Qual o máximo de horas de trabalho em 24h segundo MLC 2006?',
              type: 'multiple_choice',
              options: ['12 horas', '14 horas', '16 horas', '18 horas'],
              correct_answer: '14 horas',
              explanation: 'MLC 2006 limita o trabalho a 14 horas em qualquer período de 24h.',
              points: 25
            },
            {
              id: 'compq2',
              question: 'O período mínimo de descanso consecutivo é de:',
              type: 'multiple_choice',
              options: ['4 horas', '5 horas', '6 horas', '8 horas'],
              correct_answer: '6 horas',
              explanation: 'É necessário ao menos um período de 6 horas consecutivas de descanso.',
              points: 25
            },
            {
              id: 'compq3',
              question: 'STCW exige certificação específica por função.',
              type: 'true_false',
              correct_answer: 'true',
              explanation: 'Sim, cada função de bordo tem requisitos específicos de certificação STCW.',
              points: 25
            }
          ],
          passing_score: 80,
          time_limit_minutes: 30,
          allow_retry: true,
          max_attempts: 2
        }
      }
    ],
    prerequisites: ['onb-1', 'crew-1'],
    certificate_available: true,
    passing_score: 80,
    created_at: '2025-01-01',
    updated_at: '2026-01-28',
    enrollment_count: 456,
    completion_rate: 85,
    average_rating: 4.9
  }
];

// Onboarding tours
const ONBOARDING_TOURS: OnboardingTour[] = [
  {
    id: 'tour-first-login',
    name: 'Tour de Boas-vindas',
    description: 'Conheça as principais funcionalidades do Nauti One',
    trigger: 'first_login',
    target_roles: ['admin', 'hr_manager', 'fleet_manager', 'viewer'],
    steps: [
      {
        id: 'step-1',
        title: 'Bem-vindo ao Nauti One! 🚢',
        description: 'Este é seu centro de comando marítimo. Vamos fazer um tour rápido pelas principais funcionalidades.',
        position: 'center',
        highlight: false,
        completed: false
      },
      {
        id: 'step-2',
        title: 'Dashboard',
        description: 'Aqui você vê todas as métricas importantes: tripulantes, embarcações, alertas e compliance.',
        target_element: '[data-tour="dashboard"]',
        position: 'bottom',
        highlight: true,
        completed: false
      },
      {
        id: 'step-3',
        title: 'Menu de Navegação',
        description: 'Use o menu lateral para acessar todos os módulos do sistema.',
        target_element: '[data-tour="sidebar"]',
        position: 'right',
        highlight: true,
        completed: false
      },
      {
        id: 'step-4',
        title: 'Busca Global',
        description: 'Pressione Ctrl+K para buscar qualquer coisa no sistema.',
        target_element: '[data-tour="search"]',
        position: 'bottom',
        highlight: true,
        action: { type: 'click', target: '[data-tour="search"]' },
        completed: false
      },
      {
        id: 'step-5',
        title: 'Notificações',
        description: 'Alertas importantes aparecem aqui. Configure suas preferências em Configurações.',
        target_element: '[data-tour="notifications"]',
        position: 'bottom',
        highlight: true,
        completed: false
      },
      {
        id: 'step-6',
        title: 'Ajuda',
        description: 'Precisa de ajuda? Clique aqui para acessar documentação, FAQ e suporte.',
        target_element: '[data-tour="help"]',
        position: 'left',
        highlight: true,
        completed: false
      },
      {
        id: 'step-7',
        title: 'Tour Concluído! 🎉',
        description: 'Você está pronto para começar! Explore o sistema e não hesite em usar o suporte.',
        position: 'center',
        highlight: false,
        completed: false
      }
    ],
    completion_reward: 'badge-first-tour'
  },
  {
    id: 'tour-crew-module',
    name: 'Tour do Módulo Crew',
    description: 'Aprenda a gerenciar tripulação',
    trigger: 'feature_first_use',
    target_roles: ['admin', 'hr_manager'],
    steps: [
      {
        id: 'crew-step-1',
        title: 'Gestão de Tripulação',
        description: 'Aqui você gerencia todos os tripulantes, documentos e escalas.',
        position: 'center',
        highlight: false,
        completed: false
      },
      {
        id: 'crew-step-2',
        title: 'Lista de Tripulantes',
        description: 'Veja todos os tripulantes cadastrados com filtros avançados.',
        target_element: '[data-tour="crew-list"]',
        position: 'right',
        highlight: true,
        completed: false
      },
      {
        id: 'crew-step-3',
        title: 'Novo Tripulante',
        description: 'Clique aqui para cadastrar um novo tripulante.',
        target_element: '[data-tour="new-crew"]',
        position: 'bottom',
        highlight: true,
        action: { type: 'click', target: '[data-tour="new-crew"]' },
        completed: false
      }
    ]
  }
];

class TrainingSystem {
  private courses: Map<string, TrainingCourse> = new Map();
  private userProgress: Map<string, UserProgress[]> = new Map();
  private certificates: Map<string, Certificate> = new Map();

  constructor() {
    TRAINING_COURSES.forEach(course => {
      this.courses.set(course.id, course);
    });
  }

  /**
   * Get all courses
   */
  getCourses(filters?: {
    category?: CourseCategory;
    level?: CourseLevel;
  }): TrainingCourse[] {
    let courses = Array.from(this.courses.values());

    if (filters?.category) {
      courses = courses.filter(c => c.category === filters.category);
    }
    if (filters?.level) {
      courses = courses.filter(c => c.level === filters.level);
    }

    return courses.sort((a, b) => b.enrollment_count - a.enrollment_count);
  }

  /**
   * Get course by ID
   */
  getCourse(courseId: string): TrainingCourse | undefined {
    return this.courses.get(courseId);
  }

  /**
   * Enroll user in course
   */
  enrollUser(userId: string, courseId: string): UserProgress {
    const course = this.courses.get(courseId);
    if (!course) throw new Error('Course not found');

    const progress: UserProgress = {
      user_id: userId,
      course_id: courseId,
      status: 'not_started',
      current_module: 0,
      current_lesson: 0,
      completed_lessons: [],
      quiz_attempts: [],
      certificate_issued: false
    };

    const userCourses = this.userProgress.get(userId) || [];
    userCourses.push(progress);
    this.userProgress.set(userId, userCourses);

    course.enrollment_count++;

    return progress;
  }

  /**
   * Get user progress
   */
  getUserProgress(userId: string, courseId: string): UserProgress | undefined {
    const userCourses = this.userProgress.get(userId) || [];
    return userCourses.find(p => p.course_id === courseId);
  }

  /**
   * Get all user courses
   */
  getUserCourses(userId: string): UserProgress[] {
    return this.userProgress.get(userId) || [];
  }

  /**
   * Start course
   */
  startCourse(userId: string, courseId: string): UserProgress | null {
    const userCourses = this.userProgress.get(userId) || [];
    const progress = userCourses.find(p => p.course_id === courseId);
    
    if (!progress) return null;

    progress.status = 'in_progress';
    progress.started_at = new Date().toISOString();
    progress.current_module = 0;
    progress.current_lesson = 0;

    return progress;
  }

  /**
   * Complete lesson
   */
  completeLesson(userId: string, courseId: string, lessonId: string): UserProgress | null {
    const userCourses = this.userProgress.get(userId) || [];
    const progress = userCourses.find(p => p.course_id === courseId);
    
    if (!progress) return null;

    if (!progress.completed_lessons.includes(lessonId)) {
      progress.completed_lessons.push(lessonId);
    }

    // Check if course is completed
    const course = this.courses.get(courseId);
    if (course) {
      const totalLessons = course.modules.reduce(
        (sum, m) => sum + m.lessons.length, 0
      );
      if (progress.completed_lessons.length >= totalLessons) {
        progress.status = 'completed';
        progress.completed_at = new Date().toISOString();
      }
    }

    return progress;
  }

  /**
   * Submit quiz attempt
   */
  submitQuiz(
    userId: string,
    courseId: string,
    quizId: string,
    answers: { question_id: string; answer: string | string[] }[]
  ): { passed: boolean; score: number; attempt: QuizAttempt } | null {
    const course = this.courses.get(courseId);
    const userCourses = this.userProgress.get(userId) || [];
    const progress = userCourses.find(p => p.course_id === courseId);

    if (!course || !progress) return null;

    // Find quiz
    let quiz: Quiz | undefined;
    for (const module of course.modules) {
      if (module.quiz?.id === quizId) {
        quiz = module.quiz;
        break;
      }
    }

    if (!quiz) return null;

    // Check attempt limit
    const existingAttempts = progress.quiz_attempts.filter(a => a.quiz_id === quizId);
    if (existingAttempts.length >= quiz.max_attempts) {
      return null;
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(q => {
      totalPoints += q.points;
      const userAnswer = answers.find(a => a.question_id === q.id);
      if (userAnswer) {
        if (Array.isArray(q.correct_answer)) {
          if (Array.isArray(userAnswer.answer) && 
              q.correct_answer.every(a => userAnswer.answer.includes(a))) {
            earnedPoints += q.points;
          }
        } else if (userAnswer.answer === q.correct_answer) {
          earnedPoints += q.points;
        }
      }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= quiz.passing_score;

    const attempt: QuizAttempt = {
      quiz_id: quizId,
      attempt_number: existingAttempts.length + 1,
      score,
      passed,
      answers,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString()
    };

    progress.quiz_attempts.push(attempt);

    if (passed) {
      progress.score = score;
    }

    return { passed, score, attempt };
  }

  /**
   * Issue certificate
   */
  issueCertificate(userId: string, userName: string, courseId: string): Certificate | null {
    const course = this.courses.get(courseId);
    const userCourses = this.userProgress.get(userId) || [];
    const progress = userCourses.find(p => p.course_id === courseId);

    if (!course || !progress || progress.status !== 'completed') {
      return null;
    }

    if (!course.certificate_available || progress.certificate_issued) {
      return null;
    }

    const certificate: Certificate = {
      id: `CERT-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      course_id: courseId,
      course_title: course.title,
      issued_at: new Date().toISOString(),
      score: progress.score || 0,
      verification_code: this.generateVerificationCode(),
      pdf_url: `/certificates/${userId}/${courseId}.pdf`
    };

    this.certificates.set(certificate.id, certificate);
    progress.certificate_issued = true;
    progress.certificate_url = certificate.pdf_url;

    return certificate;
  }

  /**
   * Get onboarding tour
   */
  getOnboardingTour(tourId: string): OnboardingTour | undefined {
    return ONBOARDING_TOURS.find(t => t.id === tourId);
  }

  /**
   * Get tours for user role
   */
  getToursForRole(role: string, trigger: OnboardingTour['trigger']): OnboardingTour[] {
    return ONBOARDING_TOURS.filter(
      t => t.trigger === trigger && t.target_roles.includes(role)
    );
  }

  /**
   * Get learning statistics
   */
  getStatistics(userId: string): {
    courses_enrolled: number;
    courses_completed: number;
    certificates_earned: number;
    total_learning_hours: number;
    current_streak_days: number;
  } {
    const userCourses = this.userProgress.get(userId) || [];
    const completed = userCourses.filter(p => p.status === 'completed');
    const certificates = Array.from(this.certificates.values())
      .filter(c => c.user_id === userId);

    const totalMinutes = userCourses
      .filter(p => p.status === 'completed' || p.status === 'in_progress')
      .reduce((sum, p) => {
        const course = this.courses.get(p.course_id);
        return sum + (course?.duration_minutes || 0);
      }, 0);

    return {
      courses_enrolled: userCourses.length,
      courses_completed: completed.length,
      certificates_earned: certificates.length,
      total_learning_hours: Math.round(totalMinutes / 60),
      current_streak_days: this.calculateStreak(userId)
    };
  }

  private generateVerificationCode(): string {
    return `NAUTI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }

  private calculateStreak(userId: string): number {
    // Simplified streak calculation
    return Math.floor(Math.random() * 30) + 1;
  }
}

export const trainingSystem = new TrainingSystem();
