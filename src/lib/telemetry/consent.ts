/**
 * PATCH 499: Telemetry Consent Management
 * GDPR-compliant consent management for telemetry
 */

const CONSENT_KEY = 'telemetry_consent';
const CONSENT_TIMESTAMP_KEY = 'telemetry_consent_timestamp';

export interface ConsentState {
  granted: boolean;
  timestamp: string;
  version: string;
}

export class ConsentManager {
  private static readonly CONSENT_VERSION = '1.0';

  /**
   * Check if user has granted consent
   */
  static hasConsent(): boolean {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      return consent === 'true';
    } catch (error) {
      console.warn('Failed to check telemetry consent:', error);
      return false;
    }
  }

  /**
   * Grant telemetry consent
   */
  static grantConsent(): void {
    try {
      localStorage.setItem(CONSENT_KEY, 'true');
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
      localStorage.setItem('telemetry_consent_version', this.CONSENT_VERSION);
    } catch (error) {
      console.error('Failed to grant telemetry consent:', error);
    }
  }

  /**
   * Revoke telemetry consent
   */
  static revokeConsent(): void {
    try {
      localStorage.setItem(CONSENT_KEY, 'false');
      localStorage.setItem(CONSENT_TIMESTAMP_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Failed to revoke telemetry consent:', error);
    }
  }

  /**
   * Get consent state
   */
  static getConsentState(): ConsentState | null {
    try {
      const granted = this.hasConsent();
      const timestamp = localStorage.getItem(CONSENT_TIMESTAMP_KEY);
      const version = localStorage.getItem('telemetry_consent_version') || '1.0';

      if (!timestamp) {
        return null;
      }

      return {
        granted,
        timestamp,
        version,
      };
    } catch (error) {
      console.warn('Failed to get consent state:', error);
      return null;
    }
  }

  /**
   * Check if consent needs to be requested
   */
  static needsConsent(): boolean {
    const state = this.getConsentState();
    return state === null;
  }

  /**
   * Clear all consent data
   */
  static clearConsent(): void {
    try {
      localStorage.removeItem(CONSENT_KEY);
      localStorage.removeItem(CONSENT_TIMESTAMP_KEY);
      localStorage.removeItem('telemetry_consent_version');
    } catch (error) {
      console.error('Failed to clear consent data:', error);
    }
  }
}
