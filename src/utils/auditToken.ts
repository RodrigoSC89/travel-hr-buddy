/**
 * Generate audit token for public access to reports
 * Uses base64 encoding with email and timestamp
 * Note: This is a simple token for demo purposes - in production use JWT or similar
 */
export function generateAuditToken(email: string): string {
  const base64 = btoa(`${email}:${new Date().toISOString()}`);
  return base64;
}

/**
 * Verify audit token
 * Returns email if valid, null otherwise
 */
export function verifyAuditToken(token: string): string | null {
  try {
    const decoded = atob(token);
    const [email, timestamp] = decoded.split(':');
    
    // Check if token is expired (e.g., 7 days)
    const tokenDate = new Date(timestamp);
    const now = new Date();
    const daysDiff = (now.getTime() - tokenDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > 7) {
      return null; // Token expired
    }
    
    return email;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
