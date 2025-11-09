// PATCH 598: Training AI Service
// @ts-nocheck - Tabelas criadas, aguardando aplicação no Supabase
import { supabase } from '@/integrations/supabase/client';
import type {
  AITrainingSession,
  AITrainingHistory,
  TrainingLearningPath,
  TrainingStats,
  LLMExplanationRequest,
  LLMExplanationResponse,
  QuizGenerationRequest,
  QuizGenerationResponse,
} from '@/types/training-ai';

export class TrainingAIService {
  /**
   * Get training sessions for a crew member
   */
  static async getTrainingSessions(crewMemberId: string): Promise<AITrainingSession[]> {
    const { data, error } = await supabase
      .from('ai_training_sessions')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching training sessions:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new training session
   */
  static async createTrainingSession(
    session: Partial<AITrainingSession>
  ): Promise<AITrainingSession> {
    const { data, error } = await supabase
      .from('ai_training_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      console.error('Error creating training session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update a training session
   */
  static async updateTrainingSession(
    id: string,
    updates: Partial<AITrainingSession>
  ): Promise<AITrainingSession> {
    const { data, error } = await supabase
      .from('ai_training_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating training session:', error);
      throw error;
    }

    return data;
  }

  /**
   * Complete a training session
   */
  static async completeTrainingSession(
    id: string,
    score: number,
    durationMinutes: number
  ): Promise<AITrainingSession> {
    const passed = score >= 70; // 70% passing score
    return this.updateTrainingSession(id, {
      score,
      passed,
      duration_minutes: durationMinutes,
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get training history for a session
   */
  static async getTrainingHistory(sessionId: string): Promise<AITrainingHistory[]> {
    const { data, error } = await supabase
      .from('ai_training_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching training history:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Add training history entry
   */
  static async addTrainingHistory(
    history: Partial<AITrainingHistory>
  ): Promise<AITrainingHistory> {
    const { data, error } = await supabase
      .from('ai_training_history')
      .insert(history)
      .select()
      .single();

    if (error) {
      console.error('Error adding training history:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get learning paths for a crew member
   */
  static async getLearningPaths(crewMemberId: string): Promise<TrainingLearningPath[]> {
    const { data, error } = await supabase
      .from('training_learning_paths')
      .select('*')
      .eq('crew_member_id', crewMemberId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching learning paths:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a learning path
   */
  static async createLearningPath(
    path: Partial<TrainingLearningPath>
  ): Promise<TrainingLearningPath> {
    const { data, error } = await supabase
      .from('training_learning_paths')
      .insert(path)
      .select()
      .single();

    if (error) {
      console.error('Error creating learning path:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get training statistics for a crew member
   */
  static async getTrainingStats(crewMemberId: string): Promise<TrainingStats> {
    const { data, error } = await supabase.rpc('get_training_stats', {
      p_crew_member_id: crewMemberId,
    });

    if (error) {
      console.error('Error fetching training stats:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get LLM explanation for a non-conformity
   */
  static async getLLMExplanation(
    request: LLMExplanationRequest
  ): Promise<LLMExplanationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-training-explanation', {
      body: request,
    });

    if (error) {
      console.error('Error generating LLM explanation:', error);
      throw error;
    }

    return data;
  }

  /**
   * Generate quiz based on a topic
   */
  static async generateQuiz(
    request: QuizGenerationRequest
  ): Promise<QuizGenerationResponse> {
    const { data, error } = await supabase.functions.invoke('generate-training-quiz', {
      body: request,
    });

    if (error) {
      console.error('Error generating quiz:', error);
      throw error;
    }

    return data;
  }

  /**
   * Export training history to CSV
   */
  static async exportTrainingHistory(crewMemberId: string): Promise<string> {
    const sessions = await this.getTrainingSessions(crewMemberId);
    
    // Create CSV header
    let csv = 'Session ID,Module,Topic,Score,Passed,Duration (minutes),Created At,Completed At\n';
    
    // Add data rows
    sessions.forEach(session => {
      csv += `${session.id},${session.module},${session.topic},${session.score || 'N/A'},${session.passed ? 'Yes' : 'No'},${session.duration_minutes || 'N/A'},${new Date(session.created_at).toLocaleDateString()},${session.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'In Progress'}\n`;
    });
    
    return csv;
  }
}
