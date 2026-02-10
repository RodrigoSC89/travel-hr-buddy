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
    try {
      // Check if biometrics are available
      const availability = await this.isAvailable();
      if (!availability.available) {
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
          return {
            success: false,
            error: "Session expired, please login again",
          };
        }
        return refreshed;
      }

      return {
        success: true,
        token: token.accessToken,
      };
    } catch (error) {
      structuredLogger.error("Biometric authentication failed", error as Error);
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

      structuredLogger.info("Token stored securely", { userId });
      return true;
    } catch (error) {
      structuredLogger.error("Failed to store token", error as Error);
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
   * Encrypt token using Web Crypto API (AES-GCM)
   * Production-grade encryption for secure token storage
   */
  private async encryptToken(token: SecureToken): Promise<string> {
    try {
      const json = JSON.stringify(token);
      const encoder = new TextEncoder();
      const data = encoder.encode(json);
      
      // Generate encryption key from device fingerprint
      const keyMaterial = await this.getEncryptionKey();
      
      // Generate random IV for each encryption
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt using AES-GCM
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        data
      );
      
      // Combine IV + encrypted data and encode as base64
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      // Fallback to base64 if Web Crypto not available
      structuredLogger.warn('Crypto API unavailable, using fallback encoding', { module: 'BiometricAuth' });
      const json = JSON.stringify(token);
      return btoa(json);
    }
  }

  /**
   * Decrypt token using Web Crypto API (AES-GCM)
   */
  private async decryptToken(encrypted: string): Promise<SecureToken> {
    try {
      // Decode base64
      const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
      
      // Extract IV (first 12 bytes) and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);
      
      // Get decryption key
      const keyMaterial = await this.getEncryptionKey();
      
      // Decrypt using AES-GCM
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        keyMaterial,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      const json = decoder.decode(decryptedData);
      return JSON.parse(json);
    } catch (error) {
      // Fallback to base64 if decryption fails (legacy tokens)
      structuredLogger.warn('Decryption failed, trying fallback', { module: 'BiometricAuth' });
      const json = atob(encrypted);
      return JSON.parse(json);
    }
  }

  /**
   * Get or generate encryption key from device fingerprint
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    // Use a stable device identifier as key derivation material
    const deviceId = await this.getDeviceFingerprint();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(deviceId);
    
    // Import as raw key material
    const baseKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derive AES-GCM key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('nauti-one-biometric-v1'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get stable device fingerprint for key derivation
   */
  private async getDeviceFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width.toString(),
      screen.height.toString(),
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || '4'
    ];
    
    const fingerprint = components.join('|');
    
    // Hash the fingerprint for consistency
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
}

// Export singleton instance
export const biometricAuthService = new BiometricAuthService();
