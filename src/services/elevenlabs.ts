/**
 * ElevenLabs API Service
 * Provides text-to-speech and voice services
 */

export interface ElevenLabsTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test ElevenLabs API connection
 */
export async function testElevenLabs(): Promise<ElevenLabsTestResponse> {
  try {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!apiKey) {
      return {
        success: false,
        error: 'ElevenLabs API key not configured'
      };
    }

    // Test with a simple user info request
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey
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
      message: 'ElevenLabs API is working correctly',
      data: {
        subscription: data.subscription?.tier || 'unknown',
        characterCount: data.subscription?.character_count || 0,
        characterLimit: data.subscription?.character_limit || 0
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
 * Get ElevenLabs API status
 */
export function getElevenLabsStatus(): { configured: boolean; key?: string } {
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY;
  return {
    configured: !!key,
    key: key ? `${key.substring(0, 10)}...` : undefined
  };
}
