/**
 * Security Utilities for Frontend
 * PATCH: Client-side security helpers
 */

/**
 * Sanitizes user input for display
 */
export function sanitizeForDisplay(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push("Mínimo 8 caracteres");

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push("Inclua letras minúsculas");

  if (/[A-Z]/.test(password)) score++;
  else feedback.push("Inclua letras maiúsculas");

  if (/[0-9]/.test(password)) score++;
  else feedback.push("Inclua números");

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push("Inclua caracteres especiais");

  // Check for common patterns
  const commonPatterns = [
    /^123/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];

  if (commonPatterns.some((pattern) => pattern.test(password))) {
    score = Math.max(0, score - 2);
    feedback.push("Evite padrões comuns");
  }

  return {
    valid: score >= 4,
    score,
    feedback,
  };
}

/**
 * Generates a secure random string
 */
export function generateSecureId(length = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Hashes a string using SHA-256 (for non-sensitive purposes)
 */
export async function hashString(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validates URL format and allowed domains
 */
export function isValidUrl(
  url: string,
  allowedDomains?: string[]
): { valid: boolean; reason?: string } {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, reason: "Protocolo inválido" };
    }

    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some(
        (domain) =>
          parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
      );
      if (!isAllowed) {
        return { valid: false, reason: "Domínio não permitido" };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "URL inválida" };
  }
}

/**
 * Masks sensitive data for display
 */
export function maskSensitiveData(
  data: string,
  type: "email" | "phone" | "passport" | "card" | "generic"
): string {
  if (!data) return "";

  switch (type) {
  case "email": {
    const [local, domain] = data.split("@");
    if (!domain) return "***";
    const maskedLocal =
        local.length > 2 ? local[0] + "***" + local.slice(-1) : "***";
    return `${maskedLocal}@${domain}`;
  }
  case "phone":
    return data.length > 4 ? "***" + data.slice(-4) : "***";
  case "passport":
    return data.length > 3 ? data.slice(0, 2) + "***" + data.slice(-1) : "***";
  case "card":
    return data.length > 4 ? "**** **** **** " + data.slice(-4) : "***";
  case "generic":
  default:
    return data.length > 4
      ? data.slice(0, 2) + "***" + data.slice(-2)
      : "***";
  }
}

/**
 * Checks if session is about to expire
 */
export function isSessionExpiringSoon(
  expiresAt: Date | string,
  thresholdMinutes = 5
): boolean {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  return diffMs > 0 && diffMs < thresholdMinutes * 60 * 1000;
}

/**
 * Rate limit tracker for client-side
 */
class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  check(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Remove old timestamps
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return true;
  }

  getRemainingRequests(
    key: string,
    maxRequests: number,
    windowMs: number
  ): number {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);
    return Math.max(0, maxRequests - validTimestamps.length);
  }
}

export const clientRateLimiter = new ClientRateLimiter();

/**
 * XSS prevention for dynamic content
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; reason?: string } {
  const { maxSizeMB = 10, allowedTypes, allowedExtensions } = options;

  // Check size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, reason: `Arquivo maior que ${maxSizeMB}MB` };
  }

  // Check MIME type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return { valid: false, reason: "Tipo de arquivo não permitido" };
  }

  // Check extension
  if (allowedExtensions) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return { valid: false, reason: "Extensão de arquivo não permitida" };
    }
  }

  return { valid: true };
}
