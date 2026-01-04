/**
 * Digital Signature Service
 * 
 * Provides cryptographic digital signatures using ECDSA P-256.
 * Used for compliance evidence, audit trails, and document signing.
 * 
 * Security Level: Production-ready ECDSA with SHA-256
 */

import { logger } from "@/lib/logger";

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface ExportedKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface SignatureResult {
  signature: string;
  algorithm: string;
  signedAt: string;
  publicKeyId?: string;
}

export interface VerificationResult {
  isValid: boolean;
  verifiedAt: string;
  error?: string;
}

/**
 * Digital Signature Service using Web Crypto API
 * Implements ECDSA with P-256 curve and SHA-256 hash
 */
export class DigitalSignatureService {
  private static cachedKeyPair: KeyPair | null = null;
  
  static readonly ALGORITHM = {
    name: "ECDSA",
    namedCurve: "P-256",
  } as const;
  
  static readonly SIGN_ALGORITHM = {
    name: "ECDSA",
    hash: "SHA-256",
  } as const;

  /**
   * Generate a new ECDSA key pair
   */
  static async generateKeyPair(): Promise<KeyPair> {
    try {
      const keyPair = await crypto.subtle.generateKey(
        this.ALGORITHM,
        true, // extractable
        ["sign", "verify"]
      );

      this.cachedKeyPair = keyPair;
      
      logger.info("🔐 New ECDSA key pair generated");
      
      return keyPair;
    } catch (error) {
      logger.error("Failed to generate key pair", error);
      throw new Error("Key pair generation failed");
    }
  }

  /**
   * Get or generate key pair (singleton pattern for session)
   */
  static async getOrCreateKeyPair(): Promise<KeyPair> {
    if (this.cachedKeyPair) {
      return this.cachedKeyPair;
    }
    return this.generateKeyPair();
  }

  /**
   * Sign data using ECDSA with SHA-256
   */
  static async sign(data: string, privateKey: CryptoKey): Promise<SignatureResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const signatureBuffer = await crypto.subtle.sign(
        this.SIGN_ALGORITHM,
        privateKey,
        dataBuffer
      );

      // Convert to base64
      const signature = btoa(
        String.fromCharCode(...new Uint8Array(signatureBuffer))
      );

      return {
        signature,
        algorithm: "ECDSA-P256-SHA256",
        signedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to sign data", error);
      throw new Error("Digital signature failed");
    }
  }

  /**
   * Verify signature using ECDSA
   */
  static async verify(
    data: string,
    signature: string,
    publicKey: CryptoKey
  ): Promise<VerificationResult> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      // Decode base64 signature
      const signatureBuffer = Uint8Array.from(
        atob(signature),
        (c) => c.charCodeAt(0)
      );

      const isValid = await crypto.subtle.verify(
        this.SIGN_ALGORITHM,
        publicKey,
        signatureBuffer,
        dataBuffer
      );

      return {
        isValid,
        verifiedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Signature verification failed", error);
      return {
        isValid: false,
        verifiedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  /**
   * Export public key to base64 (SPKI format)
   */
  static async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    try {
      const exported = await crypto.subtle.exportKey("spki", publicKey);
      return btoa(String.fromCharCode(...new Uint8Array(exported)));
    } catch (error) {
      logger.error("Failed to export public key", error);
      throw new Error("Public key export failed");
    }
  }

  /**
   * Export private key to base64 (PKCS8 format)
   * WARNING: Handle with care - never log or expose private keys
   */
  static async exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    try {
      const exported = await crypto.subtle.exportKey("pkcs8", privateKey);
      return btoa(String.fromCharCode(...new Uint8Array(exported)));
    } catch (error) {
      logger.error("Failed to export private key", error);
      throw new Error("Private key export failed");
    }
  }

  /**
   * Export full key pair
   */
  static async exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
    const [publicKey, privateKey] = await Promise.all([
      this.exportPublicKey(keyPair.publicKey),
      this.exportPrivateKey(keyPair.privateKey),
    ]);
    return { publicKey, privateKey };
  }

  /**
   * Import public key from base64 (SPKI format)
   */
  static async importPublicKey(base64Key: string): Promise<CryptoKey> {
    try {
      const keyBuffer = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
      
      return await crypto.subtle.importKey(
        "spki",
        keyBuffer,
        this.ALGORITHM,
        true,
        ["verify"]
      );
    } catch (error) {
      logger.error("Failed to import public key", error);
      throw new Error("Public key import failed");
    }
  }

  /**
   * Import private key from base64 (PKCS8 format)
   */
  static async importPrivateKey(base64Key: string): Promise<CryptoKey> {
    try {
      const keyBuffer = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
      
      return await crypto.subtle.importKey(
        "pkcs8",
        keyBuffer,
        this.ALGORITHM,
        true,
        ["sign"]
      );
    } catch (error) {
      logger.error("Failed to import private key", error);
      throw new Error("Private key import failed");
    }
  }

  /**
   * Create a SHA-256 hash of data
   */
  static async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Generate a unique key ID for tracking
   */
  static async generateKeyId(publicKey: CryptoKey): Promise<string> {
    const exported = await this.exportPublicKey(publicKey);
    const hash = await this.hash(exported);
    return hash.substring(0, 16); // Short ID for display
  }

  /**
   * Clear cached key pair (for logout/security reset)
   */
  static clearCache(): void {
    this.cachedKeyPair = null;
    logger.info("🔐 Key pair cache cleared");
  }
}

/**
 * Convenience function to sign data with auto-generated keys
 */
export async function signData(data: string): Promise<SignatureResult & { publicKey: string }> {
  const keyPair = await DigitalSignatureService.getOrCreateKeyPair();
  const result = await DigitalSignatureService.sign(data, keyPair.privateKey);
  const publicKey = await DigitalSignatureService.exportPublicKey(keyPair.publicKey);
  
  return {
    ...result,
    publicKey,
    publicKeyId: await DigitalSignatureService.generateKeyId(keyPair.publicKey),
  };
}

/**
 * Convenience function to verify signature
 */
export async function verifySignature(
  data: string,
  signature: string,
  publicKeyBase64: string
): Promise<VerificationResult> {
  const publicKey = await DigitalSignatureService.importPublicKey(publicKeyBase64);
  return DigitalSignatureService.verify(data, signature, publicKey);
}
