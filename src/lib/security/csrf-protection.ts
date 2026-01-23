/**
 * CSRF Protection Utilities
 * PATCH: Audit Sprint 1 - CSRF token management
 */

const CSRF_KEY = 'nauti_csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  const token = crypto.randomUUID();
  sessionStorage.setItem(CSRF_KEY, token);
  return token;
}

/**
 * Get current CSRF token (or generate if not exists)
 */
export function getCSRFToken(): string {
  let token = sessionStorage.getItem(CSRF_KEY);
  if (!token) {
    token = generateCSRFToken();
  }
  return token;
}

/**
 * Validate CSRF token from request
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = sessionStorage.getItem(CSRF_KEY);
  return storedToken === token;
}

/**
 * Get CSRF headers for fetch requests
 */
export function getCSRFHeaders(): Record<string, string> {
  return {
    [CSRF_HEADER]: getCSRFToken(),
  };
}

/**
 * Clear CSRF token (on logout)
 */
export function clearCSRFToken(): void {
  sessionStorage.removeItem(CSRF_KEY);
}
