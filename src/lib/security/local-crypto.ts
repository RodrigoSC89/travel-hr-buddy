/**
 * Local Cryptography - PATCH 960
 * Criptografia local para dados sensíveis offline
 * Utiliza Web Crypto API (AES-GCM)
 */

import { logger } from '@/lib/logger';

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

interface EncryptedData {
  iv: string;
  salt: string;
  data: string;
  version: number;
}

interface CryptoConfig {
  // Key derivation iterations (higher = more secure but slower)
  iterations?: number;
  // Whether to use device-bound key
  useDeviceKey?: boolean;
}

class LocalCrypto {
  private masterKey: CryptoKey | null = null;
  private deviceId: string | null = null;
  private config: CryptoConfig;

  constructor(config: CryptoConfig = {}) {
    this.config = {
      iterations: config.iterations || ITERATIONS,
      useDeviceKey: config.useDeviceKey ?? true,
    };
    
    this.initializeDeviceId();
  }

  /**
   * Initialize or retrieve device-bound ID
   */
  private initializeDeviceId(): void {
    const stored = localStorage.getItem('nautilus_device_id');
    
    if (stored) {
      this.deviceId = stored;
    } else {
      // Generate persistent device ID
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('nautilus_device_id', this.deviceId);
    }
  }

  private generateDeviceId(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derive encryption key from password/passphrase
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    // Combine password with device ID for device-bound encryption
    const combinedPassword = this.config.useDeviceKey 
      ? `${password}:${this.deviceId}`
      : password;

    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(combinedPassword);

    // Import password as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive actual encryption key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt.buffer as ArrayBuffer,
        iterations: this.config.iterations!,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with password
   */
  async encrypt(data: string, password: string): Promise<EncryptedData> {
    try {
      const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      const key = await this.deriveKey(password, salt);

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
        key,
        dataBuffer
      );

      return {
        iv: this.bufferToBase64(iv),
        salt: this.bufferToBase64(salt),
        data: this.bufferToBase64(new Uint8Array(encrypted)),
        version: 1,
      };
    } catch (error) {
      logger.error('[LocalCrypto] Encryption failed', { error });
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data with password
   */
  async decrypt(encrypted: EncryptedData, password: string): Promise<string> {
    try {
      const salt = this.base64ToBuffer(encrypted.salt);
      const iv = this.base64ToBuffer(encrypted.iv);
      const data = this.base64ToBuffer(encrypted.data);
      const key = await this.deriveKey(password, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv.buffer as ArrayBuffer },
        key,
        data.buffer as ArrayBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      logger.error('[LocalCrypto] Decryption failed', { error });
      throw new Error('Decryption failed - invalid password or corrupted data');
    }
  }

  /**
   * Encrypt and store in localStorage
   */
  async encryptAndStore(key: string, data: any, password: string): Promise<void> {
    const jsonData = JSON.stringify(data);
    const encrypted = await this.encrypt(jsonData, password);
    localStorage.setItem(`encrypted_${key}`, JSON.stringify(encrypted));
  }

  /**
   * Retrieve and decrypt from localStorage
   */
  async retrieveAndDecrypt<T>(key: string, password: string): Promise<T | null> {
    const stored = localStorage.getItem(`encrypted_${key}`);
    
    if (!stored) {
      return null;
    }

    try {
      const encrypted = JSON.parse(stored) as EncryptedData;
      const decrypted = await this.decrypt(encrypted, password);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      logger.error('[LocalCrypto] Failed to retrieve and decrypt', { key, error });
      return null;
    }
  }

  /**
   * Remove encrypted data
   */
  removeEncrypted(key: string): void {
    localStorage.removeItem(`encrypted_${key}`);
  }

  /**
   * Encrypt sensitive fields in an object
   */
  async encryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    password: string
  ): Promise<T> {
    const result = { ...obj };

    for (const field of fields) {
      if (result[field] !== undefined && result[field] !== null) {
        const encrypted = await this.encrypt(String(result[field]), password);
        (result as any)[field] = encrypted;
      }
    }

    return result;
  }

  /**
   * Decrypt sensitive fields in an object
   */
  async decryptFields<T extends Record<string, any>>(
    obj: T,
    fields: (keyof T)[],
    password: string
  ): Promise<T> {
    const result = { ...obj };

    for (const field of fields) {
      if (result[field] && typeof result[field] === 'object' && 'iv' in result[field]) {
        try {
          const decrypted = await this.decrypt(result[field] as EncryptedData, password);
          (result as any)[field] = decrypted;
        } catch {
          // Keep encrypted if decryption fails
        }
      }
    }

    return result;
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Hash data with SHA-256
   */
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    return this.bufferToBase64(new Uint8Array(hashBuffer));
  }

  /**
   * Verify hash
   */
  async verifyHash(data: string, expectedHash: string): Promise<boolean> {
    const hash = await this.hash(data);
    return hash === expectedHash;
  }

  // Utility methods
  private bufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode(...buffer));
  }

  private base64ToBuffer(base64: string): Uint8Array {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  }

  /**
   * Check if Web Crypto API is available
   */
  static isSupported(): boolean {
    return !!(
      typeof crypto !== 'undefined' &&
      crypto.subtle &&
      typeof crypto.subtle.encrypt === 'function'
    );
  }

  /**
   * Get device ID (for authentication binding)
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }
}

export const localCrypto = new LocalCrypto();

// Secure storage wrapper
export const secureStorage = {
  async set(key: string, value: any, password: string): Promise<void> {
    await localCrypto.encryptAndStore(key, value, password);
  },

  async get<T>(key: string, password: string): Promise<T | null> {
    return localCrypto.retrieveAndDecrypt<T>(key, password);
  },

  remove(key: string): void {
    localCrypto.removeEncrypted(key);
  },

  async setWithPin(key: string, value: any, pin: string): Promise<void> {
    // PIN-based encryption (less secure, for convenience)
    const deviceId = localCrypto.getDeviceId() || '';
    const password = `${pin}:${deviceId}`;
    await localCrypto.encryptAndStore(key, value, password);
  },

  async getWithPin<T>(key: string, pin: string): Promise<T | null> {
    const deviceId = localCrypto.getDeviceId() || '';
    const password = `${pin}:${deviceId}`;
    return localCrypto.retrieveAndDecrypt<T>(key, password);
  },
};

// React hook for secure storage
import { useState, useCallback } from 'react';

export function useSecureStorage<T>(key: string, password: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await secureStorage.get<T>(key, password);
      setData(result);
    } catch (err) {
      setError('Falha ao carregar dados criptografados');
    } finally {
      setLoading(false);
    }
  }, [key, password]);

  const save = useCallback(async (value: T) => {
    setLoading(true);
    setError(null);
    
    try {
      await secureStorage.set(key, value, password);
      setData(value);
    } catch (err) {
      setError('Falha ao salvar dados criptografados');
    } finally {
      setLoading(false);
    }
  }, [key, password]);

  const remove = useCallback(() => {
    secureStorage.remove(key);
    setData(null);
  }, [key]);

  return { data, loading, error, load, save, remove };
}
