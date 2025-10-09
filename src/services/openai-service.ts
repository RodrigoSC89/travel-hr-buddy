/**
 * OpenAI API Service
 * Test and interact with OpenAI API for AI chat and completions
 */

export interface OpenAITestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test OpenAI API connection
 */
export async function testOpenAI(): Promise<OpenAITestResponse> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
      };
    }

    // Test with models endpoint to verify authentication
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: `API returned status ${response.status}: ${errorData.error?.message || response.statusText}`,
      };
    }

    const data = await response.json();
    
    return {
      success: true,
      message: 'OpenAI API is connected and authenticated',
      data: {
        availableModels: data.data?.length || 0,
        sampleModels: data.data?.slice(0, 3).map((m: any) => m.id) || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Send a chat completion request to OpenAI
 */
export async function chatCompletion(
  message: string,
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response';
}
