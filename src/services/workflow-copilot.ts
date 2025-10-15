/**
 * Example integration for Workflows Copilot Suggest API
 * 
 * This file demonstrates how to call the workflows-copilot-suggest
 * Supabase Edge Function from a React component or service.
 */

import React from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowSuggestionRequest {
  workflow: string;
  logs?: string;
  falhas?: string;
  atrasos?: string;
}

/**
 * Calls the workflows-copilot-suggest function with streaming support
 * @param request - The workflow suggestion request parameters
 * @param onChunk - Callback function to handle each chunk of streamed data
 * @returns Promise that resolves when streaming is complete
 */
export async function getWorkflowSuggestions(
  request: WorkflowSuggestionRequest,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    // Get the Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vnbptmixvwropvanyhdb.supabase.co';
    const functionUrl = `${supabaseUrl}/functions/v1/workflows-copilot-suggest`;

    // Make the request
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get suggestions');
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      const text = decoder.decode(value, { stream: true });
      onChunk(text);
    }
  } catch (error) {
    console.error('Error getting workflow suggestions:', error);
    throw error;
  }
}

/**
 * Example React Hook for using workflow suggestions
 */
export function useWorkflowSuggestions() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const getSuggestions = async (request: WorkflowSuggestionRequest) => {
    setIsLoading(true);
    setError(null);
    setSuggestion('');

    try {
      await getWorkflowSuggestions(request, (chunk) => {
        setSuggestion((prev) => prev + chunk);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    suggestion,
    isLoading,
    error,
    getSuggestions,
  };
}

/**
 * Example usage in a component:
 * 
 * ```tsx
 * import { useWorkflowSuggestions } from '@/services/workflow-copilot';
 * 
 * function WorkflowCopilotPanel() {
 *   const { suggestion, isLoading, error, getSuggestions } = useWorkflowSuggestions();
 * 
 *   const handleGetSuggestions = async () => {
 *     await getSuggestions({
 *       workflow: 'Manutenção preventiva de equipamentos',
 *       logs: 'Última execução: 2025-01-10, Duração: 45min',
 *       falhas: 'Falha na etapa 3: timeout ao conectar com sensor',
 *       atrasos: 'Etapa 2 atrasada em 3 dias'
 *     });
 *   };
 * 
 *   return (
 *     <div>
 *       <button onClick={handleGetSuggestions} disabled={isLoading}>
 *         {isLoading ? 'Gerando sugestões...' : 'Obter Sugestões'}
 *       </button>
 *       {error && <div className="error">{error}</div>}
 *       {suggestion && (
 *         <div className="suggestion">
 *           <pre>{suggestion}</pre>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
