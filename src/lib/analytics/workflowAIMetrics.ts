import { supabase } from '@/integrations/supabase/client';

export interface WorkflowAISummary {
  total: number;
  aceitas: number;
  taxa: string;
}

/**
 * Get AI workflow summary metrics
 * Returns the total number of AI suggestions, accepted suggestions, and adoption rate
 */
export async function getWorkflowAISummary(): Promise<WorkflowAISummary | null> {
  try {
    // Query workflow steps to get AI suggestions data
    // In a real implementation, this would query actual AI suggestion data
    // For now, we'll use mock data to demonstrate the component
    
    const { data: workflows, error } = await supabase
      .from('smart_workflows')
      .select('*');
    
    if (error) {
      console.error('Error fetching workflow AI metrics:', error);
      return null;
    }

    // Mock calculation - in production this would be based on actual AI suggestion tracking
    const total = workflows?.length || 0;
    const aceitas = Math.floor(total * 0.75); // 75% acceptance rate as example
    const taxa = total > 0 ? ((aceitas / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      aceitas,
      taxa
    };
  } catch (error) {
    console.error('Error getting workflow AI summary:', error);
    return null;
  }
}
