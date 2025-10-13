/**
 * Audit Token Utilities
 * 
 * Generates and verifies time-limited tokens for public access to audit logs.
 * Tokens are base64-encoded strings containing email and timestamp for audit trail.
 * 
 * Security Features:
 * - Time-limited tokens (7 days expiration)
 * - Embedded email for audit trail
 * - URL-safe base64 encoding
 * - Read-only access
 * 
 * Note: For production use, consider using JWT instead of base64 for enhanced security
 */

const TOKEN_EXPIRY_DAYS = 7;

interface TokenPayload {
  email: string;
  timestamp: number;
}

/**
 * Generate a time-limited audit token
 * @param email - Email address for audit trail
 * @returns Base64-encoded token string
 */
export function generateAuditToken(email: string): string {
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required");
  }

  const payload: TokenPayload = {
    email,
    timestamp: Date.now(),
  };

  const jsonString = JSON.stringify(payload);
  const base64Token = btoa(jsonString);
  
  // Make URL-safe
  return base64Token.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Verify and decode an audit token
 * @param token - Base64-encoded token string
 * @returns Decoded payload if valid, null if invalid or expired
 */
export function verifyAuditToken(token: string): TokenPayload | null {
  if (!token) {
    return null;
  }

  try {
    // Restore base64 from URL-safe format
    let base64Token = token.replace(/-/g, "+").replace(/_/g, "/");
    
    // Add padding if needed
    while (base64Token.length % 4) {
      base64Token += "=";
    }

    const jsonString = atob(base64Token);
    const payload: TokenPayload = JSON.parse(jsonString);

    // Validate payload structure
    if (!payload.email || !payload.timestamp) {
      return null;
    }

    // Check expiration
    const expiryTime = payload.timestamp + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    if (Date.now() > expiryTime) {
      return null; // Token expired
    }

    return payload;
  } catch (error) {
    // Invalid token format
    return null;
  }
}

/**
 * Check if a token is expired
 * @param token - Base64-encoded token string
 * @returns true if expired, false if valid
 */
export function isTokenExpired(token: string): boolean {
  const payload = verifyAuditToken(token);
  return payload === null;
}

/**
 * Get days until token expires
 * @param token - Base64-encoded token string
 * @returns Number of days until expiration, or -1 if invalid/expired
 */
export function getDaysUntilExpiry(token: string): number {
  const payload = verifyAuditToken(token);
  if (!payload) {
    return -1;
  }

  const expiryTime = payload.timestamp + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const daysRemaining = Math.ceil((expiryTime - Date.now()) / (24 * 60 * 60 * 1000));
  
  return Math.max(0, daysRemaining);
}
