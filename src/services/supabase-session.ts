/**
 * Supabase Session Check Service
 * Test session authentication endpoint
 */

export interface SessionCheckResult {
  success: boolean;
  message: string;
  responseTime?: number;
  data?: any;
  error?: string;
}

/**
 * Test Supabase Session Check API endpoint
 */
export async function testSessionCheck(): Promise<SessionCheckResult> {
  const startTime = Date.now();

  try {
    // Get the current session token from localStorage
    const supabaseAuth = localStorage.getItem(
      "sb-vnbptmixvwropvanyhdb-auth-token"
    );
    
    let token = null;
    if (supabaseAuth) {
      try {
        const authData = JSON.parse(supabaseAuth);
        token = authData?.access_token;
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Call the check-session API endpoint
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/auth/check-session", {
      method: "GET",
      headers,
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `Session check failed: ${response.status} ${response.statusText}`,
        responseTime,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (data.error) {
      return {
        success: false,
        message: "Session check returned an error",
        responseTime,
        error: data.error,
        data,
      };
    }

    const hasSession = data.session !== null && data.session !== undefined;

    return {
      success: true,
      message: hasSession
        ? "Session is active and valid"
        : "No active session found",
      responseTime,
      data: {
        hasSession,
        user: hasSession ? data.session.user?.email || "authenticated" : null,
      },
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      message: "Failed to test session check endpoint",
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
