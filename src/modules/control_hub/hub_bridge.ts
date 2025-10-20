/**
 * Hub Bridge - BridgeLink Integration
 * Manages connection and communication with BridgeLink shore-based system
 */

import { ConnectionQuality } from './types';
import config from './hub_config.json';

export class HubBridge {
  private connectionQuality: ConnectionQuality = 'offline';
  private lastCheck: Date | null = null;
  private token: string | null = null;

  /**
   * Check connection quality
   */
  async checkConnection(): Promise<ConnectionQuality> {
    this.lastCheck = new Date();

    try {
      const startTime = Date.now();
      const response = await fetch('/api/bridgelink/ping', {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      const latency = Date.now() - startTime;

      if (!response.ok) {
        this.connectionQuality = 'offline';
        return this.connectionQuality;
      }

      // Classify connection quality based on latency
      if (latency < 200) {
        this.connectionQuality = 'excellent';
      } else if (latency < 500) {
        this.connectionQuality = 'good';
      } else {
        this.connectionQuality = 'poor';
      }

      return this.connectionQuality;
    } catch (error) {
      this.connectionQuality = 'offline';
      return this.connectionQuality;
    }
  }

  /**
   * Send data to BridgeLink with retry logic
   */
  async sendData(data: any, retryCount = 0): Promise<boolean> {
    try {
      const response = await fetch(config.bridgelink.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(config.bridgelink.timeout),
      });

      return response.ok;
    } catch (error) {
      // Retry with exponential backoff
      if (retryCount < config.sync.retryAttempts) {
        const delay = config.sync.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendData(data, retryCount + 1);
      }
      return false;
    }
  }

  /**
   * Authenticate with BridgeLink
   */
  async authenticate(token: string): Promise<boolean> {
    this.token = token;
    try {
      const response = await fetch('/api/bridgelink/auth', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ token }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current connection quality
   */
  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  /**
   * Get last check timestamp
   */
  getLastCheck(): Date | null {
    return this.lastCheck;
  }

  /**
   * Get HTTP headers for requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token && config.bridgelink.authRequired) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }
}

export const hubBridge = new HubBridge();
