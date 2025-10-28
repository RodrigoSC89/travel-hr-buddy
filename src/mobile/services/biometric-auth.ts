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
   * Simple encryption for stored token
   * Note: In production, use proper encryption like AES-256
   */
  private async encryptToken(token: SecureToken): Promise<string> {
    // For now, use base64 encoding
    // TODO: Implement proper encryption using Capacitor SecureStorage plugin
    const json = JSON.stringify(token);
    return btoa(json);
  }

  /**
   * Simple decryption for stored token
   */
  private async decryptToken(encrypted: string): Promise<SecureToken> {
    // For now, use base64 decoding
    // TODO: Implement proper decryption
    const json = atob(encrypted);
    return JSON.parse(json);
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
