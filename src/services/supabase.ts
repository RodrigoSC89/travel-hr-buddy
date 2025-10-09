/**
 * Supabase API Service
 * Provides database and authentication services
 */

export interface SupabaseTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

/**
 * Test Supabase API connection
 */
export async function testSupabase(): Promise<SupabaseTestResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        success: false,
        error: 'Supabase URL or key not configured'
      };
    }

    // Test with a simple health check
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API returned status ${response.status}: ${response.statusText}`
      };
    }

    return {
      success: true,
      message: 'Supabase API is working correctly',
      data: {
        url: supabaseUrl,
        project: supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'
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
 * Get Supabase API status
 */
export function getSupabaseStatus(): { configured: boolean; url?: string } {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return {
    configured: !!(url && key),
    url: url ? `${url.substring(0, 30)}...` : undefined
  };
}
