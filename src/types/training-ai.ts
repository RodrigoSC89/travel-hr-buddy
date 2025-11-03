// PATCH 598: Training AI + LLM Feedback Engine Types

export interface AITrainingSession {
  id: string;
  crew_member_id: string;
  non_conformity_id: string | null;
  module: string;
  topic: string;
  explanation: string | null;
  llm_feedback: Record<string, any>;
  quiz_data: QuizQuestion[];
  score: number | null;
  passed: boolean;
  duration_minutes: number | null;
  created_at: string;
  completed_at: string | null;
  metadata: Record<string, any>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AITrainingHistory {
  id: string;
  crew_member_id: string;
  session_id: string;
  question: string;
  answer: string | null;
  correct_answer: string;
  is_correct: boolean | null;
  explanation: string | null;
  timestamp: string;
}

export interface TrainingLearningPath {
  id: string;
  crew_member_id: string;
  title: string;
  description: string | null;
  modules: string[];
  progress: number;
  status: 'active' | 'completed' | 'paused';
  ai_recommended: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingStats {
  total_sessions: number;
  completed_sessions: number;
  average_score: number;
  pass_rate: number;
  total_duration_minutes: number;
  modules_trained: string[];
}

export interface LLMExplanationRequest {
  non_conformity: string;
  module: string;
  context?: string;
}

export interface LLMExplanationResponse {
  explanation: string;
  key_points: string[];
  corrective_actions: string[];
  related_topics: string[];
}

export interface QuizGenerationRequest {
  topic: string;
  module: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  num_questions?: number;
  context?: string;
}

export interface QuizGenerationResponse {
  questions: QuizQuestion[];
  estimated_duration_minutes: number;
}
