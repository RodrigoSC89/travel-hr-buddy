/**
 * PATCH 100.0 - API Key Management Service
 */

import { ApiKey } from "../types";

class ApiKeyManagerService {
  private keys: Map<string, ApiKey> = new Map();

  constructor() {
    // Initialize with demo keys
    this.createKey("Production API Key", ["*"], 365);
    this.createKey("Development API Key", ["documents", "analytics"], 180);
    this.createKey("Limited Access Key", ["auth", "profile"], 30);
  }

  createKey(name: string, scope: string[], expiresInDays?: number): ApiKey {
    const key: ApiKey = {
      id: this.generateId(),
      name,
      key: this.generateApiKey(),
      scope,
      createdAt: new Date(),
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : undefined,
      isActive: true,
      requestCount: 0
    };

    this.keys.set(key.id, key);
    return key;
  }

  revokeKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (key) {
      key.isActive = false;
      return true;
    }
    return false;
  }

  activateKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (key) {
      key.isActive = true;
      return true;
    }
    return false;
  }

  validateKey(apiKey: string, service?: string): { valid: boolean; key?: ApiKey; error?: string } {
    for (const key of this.keys.values()) {
      if (key.key === apiKey) {
        if (!key.isActive) {
          return { valid: false, error: "API key is inactive" };
        }

        if (key.expiresAt && key.expiresAt < new Date()) {
          return { valid: false, error: "API key has expired" };
        }

        if (service && !key.scope.includes("*") && !key.scope.includes(service)) {
          return { valid: false, error: `API key does not have access to ${service}` };
        }

        key.requestCount++;
        return { valid: true, key };
      }
    }

    return { valid: false, error: "Invalid API key" };
  }

  getAllKeys(): ApiKey[] {
    return Array.from(this.keys.values());
  }

  getKey(keyId: string): ApiKey | undefined {
    return this.keys.get(keyId);
  }

  deleteKey(keyId: string): boolean {
    return this.keys.delete(keyId);
  }

  private generateId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateApiKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let key = "sk_";
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }
}

export const apiKeyManager = new ApiKeyManagerService();
