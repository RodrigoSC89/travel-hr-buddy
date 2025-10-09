/**
 * OpenAI API Service
 * Provides AI chat and assistant features
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
        error: 'OpenAI API key not configured'
      };
    }

    // Test with a simple models list request
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      message: 'OpenAI API is working correctly',
      data: {
        modelsAvailable: data.data?.length || 0
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get OpenAI API status
 */
export function getOpenAIStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
