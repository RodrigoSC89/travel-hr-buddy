/**
 * Seed Suggestions for Workflow
 * 
 * This module provides functionality to automatically seed AI suggestions
 * when a new workflow is created.
 */

import { supabase } from '@/integrations/supabase/client';
import { workflowSuggestionTemplates } from './suggestionTemplates';

/**
 * Seeds automatic suggestions for a newly created workflow
 * 
 * @param workflow_id - The UUID of the workflow to seed suggestions for
 * @returns Promise that resolves when suggestions are seeded
 */
export async function seedSuggestionsForWorkflow(workflow_id: string): Promise<void> {
  try {
    // Enrich templates with workflow_id
    const enrichedSuggestions = workflowSuggestionTemplates.map((template) => ({
      ...template,
      workflow_id,
      status: 'pendente' as const,
      is_acted_upon: false,
      is_dismissed: false
    }));

    // Insert suggestions into database
    const { error } = await supabase
      .from('workflow_ai_suggestions')
      .insert(enrichedSuggestions);

    if (error) {
      console.error('Error seeding workflow suggestions:', error);
      throw error;
    }

    console.log(`Successfully seeded ${enrichedSuggestions.length} suggestions for workflow ${workflow_id}`);
  } catch (error) {
    console.error('Failed to seed suggestions for workflow:', error);
    throw error;
  }
}

/**
 * Gets all suggestions for a specific workflow
 * 
 * @param workflow_id - The UUID of the workflow
 * @returns Promise with suggestions array
 */
export async function getWorkflowSuggestions(workflow_id: string) {
  const { data, error } = await supabase
    .from('workflow_ai_suggestions')
    .select('*')
    .eq('workflow_id', workflow_id)
    .eq('is_dismissed', false)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workflow suggestions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Updates a suggestion status
 * 
 * @param suggestion_id - The UUID of the suggestion
 * @param updates - Fields to update
 */
export async function updateSuggestion(
  suggestion_id: string,
  updates: {
    status?: 'pendente' | 'em_progresso' | 'concluido' | 'dispensado';
    is_acted_upon?: boolean;
    is_dismissed?: boolean;
  }
) {
  const { error } = await supabase
    .from('workflow_ai_suggestions')
    .update(updates)
    .eq('id', suggestion_id);

  if (error) {
    console.error('Error updating suggestion:', error);
    throw error;
  }
}
