/**
 * Encryption Vault v6.0
 * End-to-end encryption and secrets management
 */

interface EncryptedData {
  iv: string;
  ciphertext: string;
  tag?: string;
  algorithm: string;
}

interface VaultSecret {
  id: string;
  name: string;
  encryptedValue: EncryptedData;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    accessCount: number;
    lastAccessed?: Date;
  };
}

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

class EncryptionVault {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_SIZE = 256;
  private masterKey: CryptoKey | null = null;
  private keyPair: KeyPair | null = null;
  private secrets = new Map<string, VaultSecret>();

  async initialize(passphrase?: string): Promise<boolean> {
    try {
      // Generate or derive master key
      if (passphrase) {
        this.masterKey = await this.deriveKeyFromPassphrase(passphrase);
      } else {
        this.masterKey = await this.generateMasterKey();
      }

      // Generate asymmetric key pair for key exchange
      this.keyPair = await this.generateKeyPair();

      // Load secrets from storage
      await this.loadSecretsFromStorage();

      console.log('[EncryptionVault] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[EncryptionVault] Initialization failed:', error);
      return false;
    }
  }

  private async generateMasterKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      { name: this.ALGORITHM, length: this.KEY_SIZE },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async deriveKeyFromPassphrase(passphrase: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const salt = encoder.encode('nauti-one-vault-salt');
    
    // Import passphrase as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive key using PBKDF2
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_SIZE },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private async generateKeyPair(): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );

    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };
  }

  async encrypt(data: string): Promise<EncryptedData> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      this.masterKey,
      encoder.encode(data)
    );

    return {
      iv: this.arrayBufferToBase64(iv.buffer),
      ciphertext: this.arrayBufferToBase64(ciphertext),
      algorithm: this.ALGORITHM
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Vault not initialized');
    }

    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);

    const decrypted = await crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv },
      this.masterKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  async storeSecret(name: string, value: string, expiresIn?: number): Promise<string> {
    const encryptedValue = await this.encrypt(value);
    const id = crypto.randomUUID();

    const secret: VaultSecret = {
      id,
      name,
      encryptedValue,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn) : undefined,
        accessCount: 0
      }
    };

    this.secrets.set(id, secret);
    await this.saveSecretsToStorage();

    return id;
  }

  async getSecret(id: string): Promise<string | null> {
    const secret = this.secrets.get(id);
    if (!secret) return null;

    // Check expiration
    if (secret.metadata.expiresAt && secret.metadata.expiresAt < new Date()) {
      await this.deleteSecret(id);
      return null;
    }

    // Update access metadata
    secret.metadata.accessCount++;
    secret.metadata.lastAccessed = new Date();

    return this.decrypt(secret.encryptedValue);
  }

  async deleteSecret(id: string): Promise<boolean> {
    const deleted = this.secrets.delete(id);
    if (deleted) {
      await this.saveSecretsToStorage();
    }
    return deleted;
  }

  listSecrets(): Array<{ id: string; name: string; metadata: VaultSecret['metadata'] }> {
    return Array.from(this.secrets.values()).map(({ id, name, metadata }) => ({
      id,
      name,
      metadata
    }));
  }

  async rotateSecret(id: string, newValue: string): Promise<boolean> {
    const secret = this.secrets.get(id);
    if (!secret) return false;

    secret.encryptedValue = await this.encrypt(newValue);
    secret.metadata.updatedAt = new Date();

    await this.saveSecretsToStorage();
    return true;
  }

  async encryptForRecipient(data: string, recipientPublicKey: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      encoder.encode(data)
    );

    return this.arrayBufferToBase64(encrypted);
  }

  async decryptFromSender(encryptedData: string): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const ciphertext = this.base64ToArrayBuffer(encryptedData);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      this.keyPair.privateKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  async exportPublicKey(): Promise<string> {
    if (!this.keyPair) {
      throw new Error('Key pair not initialized');
    }

    const exported = await crypto.subtle.exportKey('spki', this.keyPair.publicKey);
    return this.arrayBufferToBase64(exported);
  }

  async importPublicKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    
    return crypto.subtle.importKey(
      'spki',
      keyBuffer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );
  }

  // Hash for integrity verification
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    return this.arrayBufferToBase64(hashBuffer);
  }

  async verifyHash(data: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.hash(data);
    return actualHash === expectedHash;
  }

  private async loadSecretsFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('vault_secrets_encrypted');
      if (!stored) return;

      const encryptedSecrets = JSON.parse(stored) as EncryptedData;
      const decrypted = await this.decrypt(encryptedSecrets);
      const secrets = JSON.parse(decrypted) as VaultSecret[];

      secrets.forEach(secret => {
        this.secrets.set(secret.id, secret);
      });
    } catch (error) {
      console.error('[EncryptionVault] Failed to load secrets:', error);
    }
  }

  private async saveSecretsToStorage(): Promise<void> {
    try {
      const secretsArray = Array.from(this.secrets.values());
      const serialized = JSON.stringify(secretsArray);
      const encrypted = await this.encrypt(serialized);
      
      localStorage.setItem('vault_secrets_encrypted', JSON.stringify(encrypted));
    } catch (error) {
      console.error('[EncryptionVault] Failed to save secrets:', error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async destroy(): Promise<void> {
    this.masterKey = null;
    this.keyPair = null;
    this.secrets.clear();
  }
}

export const encryptionVault = new EncryptionVault();
export type { EncryptedData, VaultSecret };
