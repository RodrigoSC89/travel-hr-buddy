// PATCH 509: AI Feedback Loop Service
import { supabase } from "@/integrations/supabase/client";
import { Logger } from "@/lib/utils/logger";

export interface AIFeedbackScore {
  id?: string;
  user_id?: string | null;
  command_type: string;
  command_data: Record<string, any>;
  self_score: number;
  feedback_data?: Record<string, any>;
  improvements?: string[];
  created_at?: string;
}

export class AIFeedbackService {
  /**
   * Record AI self-score after command execution
   */
  static async recordScore(feedback: AIFeedbackScore): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: "User not authenticated" };
      }

      const { error } = await supabase
        .from("ai_feedback_scores")
        .insert({
          user_id: user.id,
          command_type: feedback.command_type,
          command_data: feedback.command_data,
          self_score: feedback.self_score,
          feedback_data: feedback.feedback_data || {},
          improvements: feedback.improvements || []
        });

      if (error) {
        Logger.error("Error recording AI feedback score", error, "AIFeedbackService");
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      Logger.error("Exception recording AI feedback score", error, "AIFeedbackService");
      return { success: false, error: String(error) };
    }
  }

  /**
   * Get feedback scores by command type
   */
  static async getScoresByCommand(commandType: string): Promise<AIFeedbackScore[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_feedback_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("command_type", commandType)
        .order("created_at", { ascending: false });

      if (error) {
        Logger.error("Error fetching AI feedback scores", error, "AIFeedbackService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id || undefined,
        command_type: d.command_type,
        command_data: (d.command_data as any) || {},
        self_score: d.self_score,
        feedback_data: (d.feedback_data as any) || {},
        improvements: (d.improvements as any) || [],
        created_at: d.created_at
      }));
    } catch (error) {
      Logger.error("Exception fetching AI feedback scores", error, "AIFeedbackService");
      return [];
    }
  }

  /**
   * Get average score for a command type
   */
  static async getAverageScore(commandType: string): Promise<number> {
    try {
      const scores = await this.getScoresByCommand(commandType);
      
      if (scores.length === 0) return 0;

      const sum = scores.reduce((acc, score) => acc + score.self_score, 0);
      return sum / scores.length;
    } catch (error) {
      Logger.error("Exception calculating average score", error, "AIFeedbackService");
      return 0;
    }
  }

  /**
   * Get all feedback scores for dashboard
   */
  static async getAllScores(limit = 100): Promise<AIFeedbackScore[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from("ai_feedback_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        Logger.error("Error fetching all AI feedback scores", error, "AIFeedbackService");
        return [];
      }

      return (data || []).map(d => ({
        id: d.id,
        user_id: d.user_id || undefined,
        command_type: d.command_type,
        command_data: (d.command_data as any) || {},
        self_score: d.self_score,
        feedback_data: (d.feedback_data as any) || {},
        improvements: (d.improvements as any) || [],
        created_at: d.created_at
      }));
    } catch (error) {
      Logger.error("Exception fetching all AI feedback scores", error, "AIFeedbackService");
      return [];
    }
  }

  /**
   * Export scores to JSON
   */
  static async exportScores(): Promise<string> {
    try {
      const scores = await this.getAllScores(1000);
      return JSON.stringify(scores, null, 2);
    } catch (error) {
      Logger.error("Exception exporting AI feedback scores", error, "AIFeedbackService");
      return "[]";
    }
  }
}
