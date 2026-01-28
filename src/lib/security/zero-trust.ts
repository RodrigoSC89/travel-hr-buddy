/**
 * Zero-Trust Security Architecture
 * Continuous verification and threat detection
 * Phase 3: Enterprise Security
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { auditTrail } from "./blockchain-audit";

export interface DeviceFingerprint {
  browser: string;
  os: string;
  screen: string;
  timezone: string;
  language: string;
  webgl: string;
  canvas: string;
  audio: string;
  hash: string;
}

export interface SessionRisk {
  level: "low" | "medium" | "high" | "critical";
  score: number;
  factors: RiskFactor[];
  action_required: "none" | "verify" | "mfa" | "block";
}

export interface RiskFactor {
  type: string;
  description: string;
  weight: number;
  details?: Record<string, unknown>;
}

export interface TrustContext {
  user_id: string;
  device_fingerprint: string;
  ip_address: string;
  location?: { country: string; city: string };
  session_age: number;
  last_activity: Date;
  mfa_verified: boolean;
  risk_score: number;
}

/**
 * Zero-Trust Security Manager
 * Implements continuous verification and threat detection
 */
export class ZeroTrustManager {
  private deviceFingerprint: DeviceFingerprint | null = null;
  private trustContext: TrustContext | null = null;
  private verificationInterval: number | null = null;

  /**
   * Initialize zero-trust monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Generate device fingerprint
      this.deviceFingerprint = await this.generateFingerprint();

      // Start continuous verification
      this.startContinuousVerification();

      // Setup activity monitoring
      this.setupActivityMonitoring();

      logger.info("[ZeroTrust] Initialized");
    } catch (error) {
      logger.error("[ZeroTrust] Initialization failed", error);
    }
  }

  /**
   * Generate device fingerprint
   */
  private async generateFingerprint(): Promise<DeviceFingerprint> {
    const components = {
      browser: navigator.userAgent,
      os: navigator.platform,
      screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      webgl: await this.getWebGLFingerprint(),
      canvas: await this.getCanvasFingerprint(),
      audio: await this.getAudioFingerprint(),
      hash: "",
    };

    // Generate hash of all components
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(components));
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    components.hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return components;
  }

  /**
   * Get WebGL fingerprint
   */
  private async getWebGLFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return "no-webgl";

      const debugInfo = (gl as WebGLRenderingContext).getExtension(
        "WEBGL_debug_renderer_info"
      );
      if (!debugInfo) return "no-debug-info";

      const vendor = (gl as WebGLRenderingContext).getParameter(
        debugInfo.UNMASKED_VENDOR_WEBGL
      );
      const renderer = (gl as WebGLRenderingContext).getParameter(
        debugInfo.UNMASKED_RENDERER_WEBGL
      );

      return `${vendor}~${renderer}`;
    } catch {
      return "error";
    }
  }

  /**
   * Get canvas fingerprint
   */
  private async getCanvasFingerprint(): Promise<string> {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "no-canvas";

      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(0, 0, 100, 50);
      ctx.fillStyle = "#069";
      ctx.fillText("Nauti One 🚢", 2, 15);

      return canvas.toDataURL().slice(-50);
    } catch {
      return "error";
    }
  }

  /**
   * Get audio context fingerprint
   */
  private async getAudioFingerprint(): Promise<string> {
    try {
      const audioContext = new (window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gain = audioContext.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      gain.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.connect(analyser);
      analyser.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(0);

      const dataArray = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(dataArray);

      oscillator.stop();
      await audioContext.close();

      return dataArray.slice(0, 10).join(",");
    } catch {
      return "no-audio";
    }
  }

  /**
   * Start continuous session verification
   */
  private startContinuousVerification(): void {
    // Verify session every 5 minutes
    this.verificationInterval = window.setInterval(async () => {
      await this.verifySession();
    }, 5 * 60 * 1000);
  }

  /**
   * Setup user activity monitoring
   */
  private setupActivityMonitoring(): void {
    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    const updateActivity = () => {
      if (this.trustContext) {
        this.trustContext.last_activity = new Date();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  /**
   * Verify current session
   */
  async verifySession(): Promise<SessionRisk> {
    const riskFactors: RiskFactor[] = [];
    let riskScore = 0;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return {
          level: "critical",
          score: 100,
          factors: [
            { type: "no_session", description: "No active session", weight: 100 },
          ],
          action_required: "block",
        };
      }

      // Check device fingerprint
      const currentFingerprint = await this.generateFingerprint();
      if (
        this.deviceFingerprint &&
        currentFingerprint.hash !== this.deviceFingerprint.hash
      ) {
        riskFactors.push({
          type: "device_change",
          description: "Device fingerprint changed during session",
          weight: 30,
        });
        riskScore += 30;
      }

      // Check for session age
      const sessionAge =
        Date.now() - new Date(session.expires_at! * 1000).getTime();
      if (sessionAge > 24 * 60 * 60 * 1000) {
        // 24 hours
        riskFactors.push({
          type: "long_session",
          description: "Session active for more than 24 hours",
          weight: 15,
        });
        riskScore += 15;
      }

      // Check for inactivity
      if (this.trustContext) {
        const inactiveTime =
          Date.now() - this.trustContext.last_activity.getTime();
        if (inactiveTime > 30 * 60 * 1000) {
          // 30 minutes
          riskFactors.push({
            type: "inactive",
            description: "Extended period of inactivity",
            weight: 10,
          });
          riskScore += 10;
        }
      }

      // Check MFA status
      const { data: mfaData } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (
        mfaData?.currentLevel === "aal1" &&
        mfaData?.nextLevel === "aal2"
      ) {
        riskFactors.push({
          type: "mfa_pending",
          description: "MFA verification pending",
          weight: 25,
        });
        riskScore += 25;
      }

      // Determine risk level and action
      let level: SessionRisk["level"];
      let action: SessionRisk["action_required"];

      if (riskScore >= 70) {
        level = "critical";
        action = "block";
      } else if (riskScore >= 50) {
        level = "high";
        action = "mfa";
      } else if (riskScore >= 25) {
        level = "medium";
        action = "verify";
      } else {
        level = "low";
        action = "none";
      }

      // Log high-risk sessions
      if (level === "high" || level === "critical") {
        await auditTrail.logSecurityEvent("high_risk_session", {
          risk_score: riskScore,
          factors: riskFactors,
        });
      }

      return {
        level,
        score: riskScore,
        factors: riskFactors,
        action_required: action,
      };
    } catch (error) {
      logger.error("[ZeroTrust] Session verification failed", error);
      return {
        level: "high",
        score: 50,
        factors: [
          {
            type: "verification_error",
            description: "Could not verify session",
            weight: 50,
          },
        ],
        action_required: "verify",
      };
    }
  }

  /**
   * Check if action is allowed based on current trust level
   */
  async isActionAllowed(
    action: string,
    requiredTrustLevel: "low" | "medium" | "high" = "medium"
  ): Promise<{ allowed: boolean; reason?: string }> {
    const risk = await this.verifySession();

    const trustLevels = { low: 25, medium: 50, high: 75 };
    const requiredScore = 100 - trustLevels[requiredTrustLevel];

    if (risk.score > requiredScore) {
      return {
        allowed: false,
        reason: `Action "${action}" requires ${requiredTrustLevel} trust level. Current risk score: ${risk.score}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Request step-up authentication
   */
  async requestStepUp(
    reason: string
  ): Promise<{ required: boolean; method?: "mfa" | "password" }> {
    const risk = await this.verifySession();

    if (risk.action_required === "none") {
      return { required: false };
    }

    await auditTrail.logSecurityEvent("step_up_requested", { reason });

    return {
      required: true,
      method: risk.action_required === "mfa" ? "mfa" : "password",
    };
  }

  /**
   * Report suspicious activity
   */
  async reportSuspiciousActivity(
    type: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await auditTrail.logSecurityEvent("suspicious_activity", {
      type,
      details,
      fingerprint: this.deviceFingerprint?.hash,
    });

    // Trigger immediate session verification
    const risk = await this.verifySession();

    if (risk.level === "critical") {
      // Force logout
      await supabase.auth.signOut();
      logger.warn("[ZeroTrust] Forced logout due to suspicious activity");
    }
  }

  /**
   * Cleanup on logout
   */
  destroy(): void {
    if (this.verificationInterval) {
      clearInterval(this.verificationInterval);
    }
    this.deviceFingerprint = null;
    this.trustContext = null;
  }
}

// Singleton instance
export const zeroTrust = new ZeroTrustManager();
