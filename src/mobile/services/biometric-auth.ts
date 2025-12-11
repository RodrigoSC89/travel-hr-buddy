/**
 * PATCH 187.0 - Biometric Authentication Service
 * 
 * Secure authentication using device biometrics (fingerprint, face ID)
 * with encrypted token persistence
 */

// Capacitor imports with fallbacks for web
const Preferences = typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.Preferences || {
  set: async (opts: any) => localStorage.setItem(opts.key, opts.value),
  get: async (opts: any) => ({ value: localStorage.getItem(opts.key) }),
  remove: async (opts: any) => localStorage.removeItem(opts.key),
};

const BiometricAuth = typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.BiometricAuth || {
  checkBiometry: async () => ({ isAvailable: false, biometryType: "none" as BiometryType }),
  authenticate: async (opts: any) => Promise.reject(new Error("Biometric auth not available")),
};

type BiometryType = "none" | "touchId" | "faceId" | "fingerprintAuthentication" | "faceAuthentication" | "irisAuthentication";
import { structuredLogger } from "@/lib/logger/structured-logger";
import { supabase } from "@/integrations/supabase/client";

interface BiometricAuthResult {
  success: boolean;
  token?: string;
  error?: string;
}

interface SecureToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export class BiometricAuthService {
  private readonly STORAGE_KEY = "nautilus_secure_token";
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_AUTH_ATTEMPTS = 5;
  private readonly RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
  private authAttempts: Map<string, { count: number; firstAttempt: number }> = new Map();

  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<{
    available: boolean;
    biometryType?: BiometryType;
    error?: string;
  }> {
    try {
      const result = await BiometricAuth.checkBiometry();
      return {
        available: result.isAvailable,
        biometryType: result.biometryType,
      };
    } catch (error) {
      structuredLogger.error("Biometric check failed", error as Error);
      return {
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(
    reason: string = "Autenticar no Nautilus One"
  ): Promise<BiometricAuthResult> {
    const operation = "authenticate";
    
    try {
      // Input validation
      if (reason && (typeof reason !== "string" || reason.length > 200)) {
        structuredLogger.error("Invalid authentication reason", new Error("Validation failed"), {
          operation,
        });
        return {
          success: false,
          error: "Invalid authentication parameters",
        };
      }

      // Check rate limiting
      const rateLimitKey = "auth_attempt";
      if (!this.checkRateLimit(rateLimitKey)) {
        structuredLogger.error("Rate limit exceeded for authentication", 
          new Error("Rate limit exceeded"), {
            operation,
          });
        return {
          success: false,
          error: "Too many authentication attempts. Please try again later.",
        };
      }

      // Check if biometrics are available
      const availability = await this.isAvailable();
      if (!availability.available) {
        this.recordAuthAttempt(rateLimitKey, false);
        return {
          success: false,
          error: "Biometric authentication not available",
        };
      }

      // Perform biometric authentication
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: "Cancelar",
        allowDeviceCredential: true,
        iosFallbackTitle: "Usar senha",
      });

      // Retrieve stored token
      const token = await this.getStoredToken();
      
      if (!token) {
        this.recordAuthAttempt(rateLimitKey, false);
        return {
          success: false,
          error: "No stored credentials found",
        };
      }

      // Check if token is still valid
      if (this.isTokenExpired(token)) {
        // Attempt to refresh token
        const refreshed = await this.refreshToken(token.refreshToken);
        if (!refreshed.success) {
          this.recordAuthAttempt(rateLimitKey, false);
          return {
            success: false,
            error: "Session expired, please login again",
          };
        }
        
        this.recordAuthAttempt(rateLimitKey, true);
        structuredLogger.info("Biometric authentication successful (token refreshed)", {
          operation,
          userId: token.userId,
        });
        return refreshed;
      }

      this.recordAuthAttempt(rateLimitKey, true);
      structuredLogger.info("Biometric authentication successful", {
        operation,
        userId: token.userId,
      });

      return {
        success: true,
        token: token.accessToken,
      };
    } catch (error) {
      this.recordAuthAttempt("auth_attempt", false);
      structuredLogger.error("Biometric authentication failed", error as Error, {
        operation,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  /**
   * Store authentication token securely
   */
  async storeToken(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    userId: string
  ): Promise<boolean> {
    try {
      // Input validation
      if (!accessToken || typeof accessToken !== "string" || accessToken.length < 10) {
        structuredLogger.error("Invalid access token provided", new Error("Validation failed"), {
          operation: "storeToken",
        });
        return false;
      }

      if (!refreshToken || typeof refreshToken !== "string" || refreshToken.length < 10) {
        structuredLogger.error("Invalid refresh token provided", new Error("Validation failed"), {
          operation: "storeToken",
        });
        return false;
      }

      if (!userId || typeof userId !== "string" || userId.length === 0) {
        structuredLogger.error("Invalid user ID provided", new Error("Validation failed"), {
          operation: "storeToken",
        });
        return false;
      }

      if (typeof expiresIn !== "number" || expiresIn <= 0 || expiresIn > 31536000) {
        structuredLogger.error("Invalid expiration time", new Error("Validation failed"), {
          operation: "storeToken",
          expiresIn,
        });
        return false;
      }

      const token: SecureToken = {
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000,
        userId,
      };

      // Encrypt and store token
      const encrypted = await this.encryptToken(token);
      await Preferences.set({
        key: this.STORAGE_KEY,
        value: encrypted,
      });

      structuredLogger.info("Token stored securely", { 
        userId,
        operation: "storeToken",
      });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to store token", error as Error, {
        operation: "storeToken",
      });
      return false;
    }
  }

  /**
   * Get stored token
   */
  private async getStoredToken(): Promise<SecureToken | null> {
    try {
      const { value } = await Preferences.get({ key: this.STORAGE_KEY });
      
      if (!value) {
        return null;
      }

      return await this.decryptToken(value);
    } catch (error) {
      structuredLogger.error("Failed to retrieve token", error as Error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: SecureToken): boolean {
    return Date.now() >= token.expiresAt - this.TOKEN_EXPIRY_BUFFER;
  }

  /**
   * Refresh access token
   */
  private async refreshToken(refreshToken: string): Promise<BiometricAuthResult> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw error || new Error("Failed to refresh session");
      }

      // Store new token
      await this.storeToken(
        data.session.access_token,
        data.session.refresh_token,
        data.session.expires_in || 3600,
        data.session.user.id
      );

      return {
        success: true,
        token: data.session.access_token,
      };
    } catch (error) {
      structuredLogger.error("Token refresh failed", error as Error);
      return {
        success: false,
        error: "Failed to refresh session",
      };
    }
  }

  /**
   * Remove stored credentials
   */
  async clearStoredCredentials(): Promise<void> {
    try {
      await Preferences.remove({ key: this.STORAGE_KEY });
      structuredLogger.info("Stored credentials cleared");
    } catch (error) {
      structuredLogger.error("Failed to clear credentials", error as Error);
    }
  }

  /**
   * AES-GCM Encryption for stored token
   * Uses Web Crypto API with AES-256-GCM for authenticated encryption
   */
  private async encryptToken(token: SecureToken): Promise<string> {
    try {
      // Validate input
      if (!token?.accessToken || !token?.refreshToken || !token?.userId) {
        throw new Error("Invalid token structure for encryption");
      }

      const json = JSON.stringify(token);
      const encoder = new TextEncoder();
      const data = encoder.encode(json);

      // Generate a random salt (16 bytes)
      const salt = crypto.getRandomValues(new Uint8Array(16));
      
      // Generate a random IV (12 bytes for GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Derive encryption key from device identifier using PBKDF2
      const keyMaterial = await this.getKeyMaterial();
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt"]
      );

      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        data
      );

      // Combine salt + IV + encrypted data
      const combined = new Uint8Array(
        salt.length + iv.length + encryptedData.byteLength
      );
      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

      // Convert to base64 for storage
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      structuredLogger.error("Token encryption failed", error as Error, {
        operation: "encryptToken",
      });
      throw new Error("Failed to encrypt token securely");
    }
  }

  /**
   * AES-GCM Decryption for stored token
   * Decrypts data encrypted with encryptToken method
   */
  private async decryptToken(encrypted: string): Promise<SecureToken> {
    try {
      // Validate input
      if (!encrypted || typeof encrypted !== "string") {
        throw new Error("Invalid encrypted data");
      }

      // Convert from base64
      const combined = this.base64ToArrayBuffer(encrypted);

      // Extract salt (first 16 bytes)
      const salt = combined.slice(0, 16);
      
      // Extract IV (next 12 bytes)
      const iv = combined.slice(16, 28);
      
      // Extract encrypted data (remaining bytes)
      const encryptedData = combined.slice(28);

      // Derive the same encryption key
      const keyMaterial = await this.getKeyMaterial();
      const key = await crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        encryptedData
      );

      // Convert back to JSON
      const decoder = new TextDecoder();
      const json = decoder.decode(decryptedData);
      const token = JSON.parse(json) as SecureToken;

      // Validate decrypted structure
      if (!token?.accessToken || !token?.refreshToken || !token?.userId) {
        throw new Error("Decrypted token has invalid structure");
      }

      return token;
    } catch (error) {
      structuredLogger.error("Token decryption failed", error as Error, {
        operation: "decryptToken",
      });
      throw new Error("Failed to decrypt token - data may be corrupted");
    }
  }

  /**
   * Get cryptographic key material based on device/user context
   * Uses a combination of device ID and app identifier
   */
  private async getKeyMaterial(): Promise<CryptoKey> {
    try {
      // Create a device-specific key material
      // In a real mobile app, this would use device-specific identifiers
      const deviceId = await this.getDeviceIdentifier();
      const encoder = new TextEncoder();
      const keyData = encoder.encode(deviceId);

      return await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
      );
    } catch (error) {
      structuredLogger.error("Failed to generate key material", error as Error);
      throw new Error("Cryptographic key generation failed");
    }
  }

  /**
   * Get device-specific identifier for key derivation
   * In production, use Capacitor Device plugin for true device ID
   */
  private async getDeviceIdentifier(): Promise<string> {
    // Try to get device ID from Capacitor if available
    if (typeof window !== "undefined" && (window as any).Capacitor?.Plugins?.Device) {
      try {
        const Device = (window as any).Capacitor.Plugins.Device;
        const info = await Device.getId();
        return `nautilus_${info.identifier}`;
      } catch {
        // Fallback to browser-based identifier
      }
    }

    // Fallback: Generate or retrieve a persistent device ID
    const storageKey = "nautilus_device_id";
    let deviceId = localStorage.getItem(storageKey);
    
    if (!deviceId) {
      // Generate a cryptographically random device ID
      const randomBytes = crypto.getRandomValues(new Uint8Array(32));
      deviceId = Array.from(randomBytes, byte => 
        byte.toString(16).padStart(2, "0")
      ).join("");
      localStorage.setItem(storageKey, deviceId);
    }

    return `nautilus_web_${deviceId}`;
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Enable biometric authentication for current user
   */
  async enableBiometric(
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check availability
      const availability = await this.isAvailable();
      if (!availability.available) {
        return {
          success: false,
          error: "Biometric authentication not available on this device",
        };
      }

      // Perform initial authentication to verify biometrics work
      const authResult = await BiometricAuth.authenticate({
        reason: "Ativar autenticação biométrica",
        cancelTitle: "Cancelar",
        allowDeviceCredential: true,
      });

      if (!authResult) {
        return {
          success: false,
          error: "Biometric authentication failed",
        };
      }

      // Store credentials
      const stored = await this.storeToken(
        accessToken,
        refreshToken,
        expiresIn,
        userId
      );

      if (!stored) {
        return {
          success: false,
          error: "Failed to store credentials",
        };
      }

      structuredLogger.info("Biometric authentication enabled", { userId });
      return { success: true };
    } catch (error) {
      structuredLogger.error("Failed to enable biometric", error as Error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    await this.clearStoredCredentials();
    structuredLogger.info("Biometric authentication disabled");
  }

  /**
   * Check if operation is within rate limit
   */
  private checkRateLimit(key: string): boolean {
    const now = Date.now();
    const attempt = this.authAttempts.get(key);

    if (!attempt) {
      return true; // No previous attempts
    }

    // Check if window has expired
    if (now - attempt.firstAttempt > this.RATE_LIMIT_WINDOW) {
      this.authAttempts.delete(key);
      return true;
    }

    // Check if limit exceeded
    if (attempt.count >= this.MAX_AUTH_ATTEMPTS) {
      structuredLogger.warn("Rate limit active", {
        key,
        attempts: attempt.count,
        timeRemaining: Math.ceil((this.RATE_LIMIT_WINDOW - (now - attempt.firstAttempt)) / 1000 / 60),
      });
      return false;
    }

    return true;
  }

  /**
   * Record authentication attempt
   */
  private recordAuthAttempt(key: string, success: boolean): void {
    const now = Date.now();
    const attempt = this.authAttempts.get(key);

    if (success) {
      // Clear attempts on success
      this.authAttempts.delete(key);
      return;
    }

    if (!attempt) {
      this.authAttempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
    } else {
      // Check if window has expired
      if (now - attempt.firstAttempt > this.RATE_LIMIT_WINDOW) {
        this.authAttempts.set(key, {
          count: 1,
          firstAttempt: now,
        });
      } else {
        attempt.count++;
      }
    }

    structuredLogger.info("Authentication attempt recorded", {
      key,
      count: this.authAttempts.get(key)?.count || 0,
      success,
    });
  }
}

// Export singleton instance
export const biometricAuthService = new BiometricAuthService();
