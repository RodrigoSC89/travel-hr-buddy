/**
 * Multi-Factor Authentication Engine
 * TOTP, WebAuthn/Passkeys, and backup codes
 * Phase 3: Enterprise Security
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export type MFAMethod = "totp" | "webauthn" | "sms" | "email" | "backup_code";

export interface MFAFactor {
  id: string;
  type: MFAMethod;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
  verified: boolean;
}

export interface MFAEnrollment {
  id: string;
  type: MFAMethod;
  totp?: {
    qr_code: string;
    secret: string;
    uri: string;
  };
  webauthn?: {
    challenge: string;
    options: PublicKeyCredentialCreationOptions;
  };
}

export interface MFAChallenge {
  id: string;
  type: MFAMethod;
  expires_at: string;
}

/**
 * MFA Engine - Handles all multi-factor authentication operations
 */
export class MFAEngine {
  private factors: MFAFactor[] = [];

  /**
   * Get user's enrolled MFA factors
   */
  async getFactors(): Promise<MFAFactor[]> {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) throw error;

      this.factors = (data.totp || []).map((f) => ({
        id: f.id,
        type: "totp" as MFAMethod,
        friendly_name: f.friendly_name || "Authenticator App",
        created_at: f.created_at,
        verified: f.status === "verified",
      }));

      return this.factors;
    } catch (error) {
      logger.error("[MFA] Failed to get factors", error);
      return [];
    }
  }

  /**
   * Enroll new TOTP factor (Authenticator app)
   */
  async enrollTOTP(friendlyName?: string): Promise<MFAEnrollment | null> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: friendlyName || "Authenticator App",
      });

      if (error) throw error;

      return {
        id: data.id,
        type: "totp",
        totp: {
          qr_code: data.totp.qr_code,
          secret: data.totp.secret,
          uri: data.totp.uri,
        },
      };
    } catch (error) {
      logger.error("[MFA] TOTP enrollment failed", error);
      return null;
    }
  }

  /**
   * Verify TOTP enrollment with code
   */
  async verifyTOTPEnrollment(
    factorId: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: data.id,
        code,
      });

      if (verifyError) throw verifyError;

      logger.info("[MFA] TOTP factor verified", { factorId });
      return { success: true };
    } catch (error) {
      logger.error("[MFA] TOTP verification failed", error);
      return { success: false, error: "Invalid verification code" };
    }
  }

  /**
   * Enroll WebAuthn/Passkey factor
   */
  async enrollWebAuthn(): Promise<MFAEnrollment | null> {
    try {
      // Check WebAuthn support
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn not supported in this browser");
      }

      // Get registration options from server
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Create credential
      const credential = (await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: {
            name: "Nauti One",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(user.id),
            name: user.email || "user",
            displayName: user.user_metadata?.full_name || user.email || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" }, // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          timeout: 60000,
          attestation: "none",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required",
          },
        },
      })) as PublicKeyCredential;

      if (!credential) throw new Error("Failed to create credential");

      // Store credential (simplified - in production, send to server)
      const credentialData = {
        id: credential.id,
        rawId: Array.from(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          clientDataJSON: Array.from(
            new Uint8Array(
              (credential.response as AuthenticatorAttestationResponse)
                .clientDataJSON
            )
          ),
          attestationObject: Array.from(
            new Uint8Array(
              (credential.response as AuthenticatorAttestationResponse)
                .attestationObject
            )
          ),
        },
      };

      // Store in user metadata or dedicated table
      await supabase.auth.updateUser({
        data: {
          webauthn_credentials: [
            ...(user.user_metadata?.webauthn_credentials || []),
            credentialData,
          ],
        },
      });

      logger.info("[MFA] WebAuthn credential enrolled");

      return {
        id: credential.id,
        type: "webauthn",
      };
    } catch (error) {
      logger.error("[MFA] WebAuthn enrollment failed", error);
      return null;
    }
  }

  /**
   * Authenticate with WebAuthn/Passkey
   */
  async authenticateWebAuthn(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!window.PublicKeyCredential) {
        throw new Error("WebAuthn not supported");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const credentials = user?.user_metadata?.webauthn_credentials || [];

      if (credentials.length === 0) {
        throw new Error("No WebAuthn credentials enrolled");
      }

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          rpId: window.location.hostname,
          userVerification: "required",
          allowCredentials: credentials.map((c: { id: string; rawId: number[] }) => ({
            id: new Uint8Array(c.rawId).buffer,
            type: "public-key" as const,
          })),
        },
      });

      if (!assertion) throw new Error("Authentication cancelled");

      logger.info("[MFA] WebAuthn authentication successful");
      return { success: true };
    } catch (error) {
      logger.error("[MFA] WebAuthn authentication failed", error);
      return { success: false, error: "WebAuthn authentication failed" };
    }
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(): Promise<string[]> {
    const codes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }

    // Store hashed codes
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: {
          backup_codes_hash: await this.hashCodes(codes),
          backup_codes_count: codes.length,
        },
      });
    }

    logger.info("[MFA] Backup codes generated");
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  private async hashCodes(codes: string[]): Promise<string[]> {
    return Promise.all(
      codes.map(async (code) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(code);
        const hash = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      })
    );
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(
    code: string
  ): Promise<{ success: boolean; remaining?: number }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const storedHashes = user?.user_metadata?.backup_codes_hash || [];

      const codeHash = (await this.hashCodes([code]))[0];
      const index = storedHashes.indexOf(codeHash);

      if (index === -1) {
        return { success: false };
      }

      // Remove used code
      storedHashes.splice(index, 1);
      await supabase.auth.updateUser({
        data: {
          backup_codes_hash: storedHashes,
          backup_codes_count: storedHashes.length,
        },
      });

      logger.info("[MFA] Backup code used", { remaining: storedHashes.length });
      return { success: true, remaining: storedHashes.length };
    } catch (error) {
      logger.error("[MFA] Backup code verification failed", error);
      return { success: false };
    }
  }

  /**
   * Challenge user for MFA verification
   */
  async createChallenge(factorId: string): Promise<MFAChallenge | null> {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;

      const factor = this.factors.find((f) => f.id === factorId);

      return {
        id: data.id,
        type: factor?.type || "totp",
        expires_at: String(data.expires_at),
      };
    } catch (error) {
      logger.error("[MFA] Challenge creation failed", error);
      return null;
    }
  }

  /**
   * Verify MFA challenge
   */
  async verifyChallenge(
    factorId: string,
    challengeId: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;

      logger.info("[MFA] Challenge verified successfully");
      return { success: true };
    } catch (error) {
      logger.error("[MFA] Challenge verification failed", error);
      return { success: false, error: "Invalid verification code" };
    }
  }

  /**
   * Remove MFA factor
   */
  async removeFactor(factorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      this.factors = this.factors.filter((f) => f.id !== factorId);
      logger.info("[MFA] Factor removed", { factorId });
      return true;
    } catch (error) {
      logger.error("[MFA] Failed to remove factor", error);
      return false;
    }
  }

  /**
   * Check if MFA is required for user
   */
  async isMFARequired(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      return (
        data?.currentLevel === "aal1" && data?.nextLevel === "aal2"
      );
    } catch {
      return false;
    }
  }

  /**
   * Get current MFA assurance level
   */
  async getAssuranceLevel(): Promise<string | null> {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      return data?.currentLevel || null;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const mfaEngine = new MFAEngine();
