/**
 * PATCH 598 - AI Training Module Types
 */

export interface CrewMember {
  id: string;
  name: string;
  rank: string;
  department: string;
  email?: string;
}

export interface TrainingModule {
  id: string;
  name: string;
  type: 'MLC' | 'PSC' | 'LSA_FFA' | 'OVID' | 'GENERAL';
  description: string;
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  type: 'MLC' | 'PSC' | 'LSA_FFA' | 'OVID' | 'GENERAL';
  questions: QuizQuestion[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  estimatedDuration: number;
}

export interface TrainingResult {
  id: string;
  quizId: string;
  crewMemberId: string;
  score: number;
  passed: boolean;
  completedAt: string;
  timeTakenSeconds: number;
}

export interface LearningProgress {
  moduleType: string;
  totalQuizzesTaken: number;
  totalQuizzesPassed: number;
  averageScore: number;
  lastTrainingDate: string;
  improvementRate: number;
  weakAreas: string[];
  strongAreas: string[];
}
