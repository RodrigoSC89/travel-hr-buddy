/**
 * WebAuthn Service - Enterprise Excellence v5.0
 * FIDO2/Passkeys authentication support
 */

import { logger } from "@/lib/logger";

interface WebAuthnCredential {
  id: string;
  publicKey: string;
  counter: number;
  deviceType: string;
  createdAt: Date;
  lastUsed: Date;
  name: string;
}

interface RegistrationOptions {
  challenge: string;
  rpId: string;
  rpName: string;
  userId: string;
  userName: string;
  userDisplayName: string;
  attestationType: 'none' | 'indirect' | 'direct';
  authenticatorSelection: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'required' | 'preferred' | 'discouraged';
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
}

interface AuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: { id: string; type: 'public-key' }[];
  userVerification: 'required' | 'preferred' | 'discouraged';
  timeout: number;
}

class WebAuthnService {
  private static instance: WebAuthnService;
  private rpId: string;
  private rpName: string;

  private constructor() {
    this.rpId = window.location.hostname;
    this.rpName = 'Nautilus One';
  }

  static getInstance(): WebAuthnService {
    if (!WebAuthnService.instance) {
      WebAuthnService.instance = new WebAuthnService();
    }
    return WebAuthnService.instance;
  }

  /**
   * Check if WebAuthn is supported
   */
  isSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      typeof window.PublicKeyCredential === 'function'
    );
  }

  /**
   * Check if platform authenticator is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Check if conditional UI is supported (Passkeys)
   */
  async isConditionalUIAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      return await (PublicKeyCredential as unknown as { isConditionalMediationAvailable?: () => Promise<boolean> })
        .isConditionalMediationAvailable?.() ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Generate registration options
   */
  async generateRegistrationOptions(
    userId: string,
    userName: string,
    userDisplayName: string
  ): Promise<RegistrationOptions> {
    const challenge = this.generateChallenge();
    
    return {
      challenge,
      rpId: this.rpId,
      rpName: this.rpName,
      userId,
      userName,
      userDisplayName,
      attestationType: 'none', // Privacy-preserving
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    };
  }

  /**
   * Register a new credential
   */
  async registerCredential(options: RegistrationOptions): Promise<WebAuthnCredential | null> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported');
    }

    try {
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        challenge: this.base64ToBuffer(options.challenge),
        rp: {
          id: options.rpId,
          name: options.rpName
        },
        user: {
          id: this.stringToBuffer(options.userId),
          name: options.userName,
          displayName: options.userDisplayName
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 }  // RS256
        ],
        authenticatorSelection: options.authenticatorSelection,
        timeout: 60000,
        attestation: options.attestationType
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!credential) return null;

      const response = credential.response as AuthenticatorAttestationResponse;
      
      const webAuthnCredential: WebAuthnCredential = {
        id: this.bufferToBase64(credential.rawId),
        publicKey: this.bufferToBase64(response.getPublicKey()!),
        counter: 0,
        deviceType: this.detectDeviceType(),
        createdAt: new Date(),
        lastUsed: new Date(),
        name: this.generateCredentialName()
      };

      logger.info('WebAuthn credential registered', { 
        deviceType: webAuthnCredential.deviceType 
      });

      return webAuthnCredential;

    } catch (error) {
      logger.error('WebAuthn registration failed', error as Error);
      throw error;
    }
  }

  /**
   * Generate authentication options
   */
  async generateAuthenticationOptions(
    allowedCredentials: string[]
  ): Promise<AuthenticationOptions> {
    return {
      challenge: this.generateChallenge(),
      rpId: this.rpId,
      allowCredentials: allowedCredentials.map(id => ({
        id,
        type: 'public-key'
      })),
      userVerification: 'preferred',
      timeout: 60000
    };
  }

  /**
   * Authenticate with a credential
   */
  async authenticate(options: AuthenticationOptions): Promise<{
    credentialId: string;
    signature: string;
    authenticatorData: string;
    clientDataJSON: string;
    counter: number;
  } | null> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported');
    }

    try {
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: this.base64ToBuffer(options.challenge),
        rpId: options.rpId,
        allowCredentials: options.allowCredentials.map(cred => ({
          id: this.base64ToBuffer(cred.id),
          type: cred.type
        })),
        userVerification: options.userVerification,
        timeout: options.timeout
      };

      const credential = await navigator.credentials.get({
        publicKey: publicKeyOptions
      }) as PublicKeyCredential;

      if (!credential) return null;

      const response = credential.response as AuthenticatorAssertionResponse;
      const authenticatorData = new Uint8Array(response.authenticatorData);
      
      // Extract counter from authenticator data (bytes 33-36)
      const counter = new DataView(authenticatorData.buffer).getUint32(33, false);

      logger.info('WebAuthn authentication successful');

      return {
        credentialId: this.bufferToBase64(credential.rawId),
        signature: this.bufferToBase64(response.signature),
        authenticatorData: this.bufferToBase64(response.authenticatorData),
        clientDataJSON: this.bufferToBase64(response.clientDataJSON),
        counter
      };

    } catch (error) {
      logger.error('WebAuthn authentication failed', error as Error);
      throw error;
    }
  }

  /**
   * Authenticate with conditional UI (Passkeys autofill)
   */
  async authenticateWithConditionalUI(): Promise<{
    credentialId: string;
    signature: string;
    authenticatorData: string;
    clientDataJSON: string;
  } | null> {
    if (!await this.isConditionalUIAvailable()) {
      throw new Error('Conditional UI not supported');
    }

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: this.base64ToBuffer(this.generateChallenge()),
          rpId: this.rpId,
          userVerification: 'preferred',
          timeout: 60000
        },
        mediation: 'conditional'
      } as CredentialRequestOptions) as PublicKeyCredential;

      if (!credential) return null;

      const response = credential.response as AuthenticatorAssertionResponse;

      return {
        credentialId: this.bufferToBase64(credential.rawId),
        signature: this.bufferToBase64(response.signature),
        authenticatorData: this.bufferToBase64(response.authenticatorData),
        clientDataJSON: this.bufferToBase64(response.clientDataJSON)
      };

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return null; // User cancelled
      }
      throw error;
    }
  }

  /**
   * Abort any pending WebAuthn operation
   */
  abort(): void {
    // WebAuthn operations can be aborted by calling get/create again
    // or by the timeout
  }

  /**
   * Generate random challenge
   */
  private generateChallenge(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.bufferToBase64(array.buffer);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const result = new ArrayBuffer(bytes.length);
    new Uint8Array(result).set(bytes);
    return result;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private bufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Convert string to ArrayBuffer
   */
  private stringToBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer as ArrayBuffer;
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): string {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
    if (/android/.test(ua)) return 'Android';
    if (/macintosh/.test(ua)) return 'macOS';
    if (/windows/.test(ua)) return 'Windows';
    if (/linux/.test(ua)) return 'Linux';
    return 'Unknown';
  }

  /**
   * Generate credential name
   */
  private generateCredentialName(): string {
    const device = this.detectDeviceType();
    const date = new Date().toLocaleDateString();
    return `${device} - ${date}`;
  }
}

export const webAuthnService = WebAuthnService.getInstance();
export { WebAuthnService };
export type { WebAuthnCredential, RegistrationOptions, AuthenticationOptions };
