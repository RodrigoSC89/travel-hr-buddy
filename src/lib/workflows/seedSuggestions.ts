import { supabase } from '@/integrations/supabase/client';
import { workflowSuggestionTemplates } from './suggestionTemplates';

/**
 * Seeds AI suggestions for a newly created workflow
 * @param workflow_id - The ID of the workflow to seed suggestions for
 * @returns Promise<boolean> - Returns true if successful, false otherwise
 */
export async function seedSuggestionsForWorkflow(workflow_id: string): Promise<boolean> {
  try {
    // Map templates to include the workflow_id
    const enriched = workflowSuggestionTemplates.map((suggestion) => ({
      ...suggestion,
      workflow_id,
    }));

    // Insert suggestions into the database
    const { error } = await supabase
      .from('workflow_ai_suggestions')
      .insert(enriched);

    if (error) {
      console.error('Error seeding workflow suggestions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception when seeding workflow suggestions:', error);
    return false;
  }
}
