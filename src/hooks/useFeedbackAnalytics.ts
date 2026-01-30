/**
 * Feedback Analytics Hook
 * Aggregates NPS, bugs, and feature requests data
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NPSMetrics {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  trend: 'up' | 'down' | 'stable';
}

interface FeedbackItem {
  id: string;
  type: 'nps' | 'bug' | 'feature';
  title?: string;
  description: string;
  score?: number;
  priority?: string;
  module?: string;
  createdAt: string;
  userId?: string;
}

interface FeedbackAnalytics {
  nps: NPSMetrics;
  bugs: {
    total: number;
    byPriority: Record<string, number>;
    recent: FeedbackItem[];
  };
  features: {
    total: number;
    recent: FeedbackItem[];
  };
  recentFeedback: FeedbackItem[];
}

export function useFeedbackAnalytics() {
  const [analytics, setAnalytics] = useState<FeedbackAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all feedback from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error: queryError } = await supabase
        .from('ai_feedback_scores' as any)
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

      const feedback: FeedbackItem[] = (data || []).map((item: any) => ({
        id: item.id,
        type: item.command_type as 'nps' | 'bug' | 'feature',
        title: item.feedback_data?.title,
        description: item.feedback_data?.description || '',
        score: item.self_score,
        priority: item.feedback_data?.priority,
        module: item.feedback_data?.module,
        createdAt: item.created_at,
        userId: item.user_id,
      }));

      // Calculate NPS
      const npsResponses = feedback.filter(f => f.type === 'nps' && f.score !== undefined);
      const promoters = npsResponses.filter(f => (f.score || 0) >= 9).length;
      const passives = npsResponses.filter(f => (f.score || 0) >= 7 && (f.score || 0) <= 8).length;
      const detractors = npsResponses.filter(f => (f.score || 0) <= 6).length;
      const totalNPS = npsResponses.length;
      
      const npsScore = totalNPS > 0 
        ? Math.round(((promoters - detractors) / totalNPS) * 100) 
        : 0;

      // Calculate bugs by priority
      const bugs = feedback.filter(f => f.type === 'bug');
      const bugsByPriority = bugs.reduce((acc, bug) => {
        const priority = bug.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Features
      const features = feedback.filter(f => f.type === 'feature');

      setAnalytics({
        nps: {
          score: npsScore,
          promoters,
          passives,
          detractors,
          totalResponses: totalNPS,
          trend: npsScore > 50 ? 'up' : npsScore < 30 ? 'down' : 'stable',
        },
        bugs: {
          total: bugs.length,
          byPriority: bugsByPriority,
          recent: bugs.slice(0, 5),
        },
        features: {
          total: features.length,
          recent: features.slice(0, 5),
        },
        recentFeedback: feedback.slice(0, 10),
      });

    } catch (err) {
      console.error('[FeedbackAnalytics] Error:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refresh: fetchAnalytics,
  };
}

export default useFeedbackAnalytics;
