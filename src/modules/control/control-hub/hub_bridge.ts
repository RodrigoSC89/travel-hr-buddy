/**
 * Hub Bridge - BridgeLink Integration
 * Manages connection and communication with BridgeLink via Supabase
 */

import { ConnectionQuality } from "./types";
import config from "./hub_config.json";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export class HubBridge {
  private connectionQuality: ConnectionQuality = "offline";
  private lastCheck: Date | null = null;

  /**
   * Check connection quality via Supabase health-check Edge Function
   */
  async checkConnection(): Promise<ConnectionQuality> {
    this.lastCheck = new Date();

    try {
      const startTime = Date.now();
      const { error } = await supabase.functions.invoke("health-check", {
        body: { source: "bridgelink" },
      });

      const latency = Date.now() - startTime;

      if (error) {
        this.connectionQuality = "poor";
        return this.connectionQuality;
      }

      if (latency < 200) {
        this.connectionQuality = "excellent";
      } else if (latency < 500) {
        this.connectionQuality = "good";
      } else {
        this.connectionQuality = "poor";
      }

      return this.connectionQuality;
    } catch (error) {
      this.connectionQuality = "poor";
      return this.connectionQuality;
    }
  }

  /**
   * Send data to BridgeLink with retry logic
   */
  async sendData(data: Record<string, unknown>, retryCount = 0): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("health-check", {
        body: { action: "bridge-data", payload: data },
      });
      return !error;
    } catch (error) {
      if (retryCount < config.sync.retryAttempts) {
        const delay = config.sync.retryDelay * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendData(data, retryCount + 1);
      }
      return false;
    }
  }

  /**
   * Authenticate - uses Supabase Auth natively (no custom endpoint needed)
   */
  async authenticate(_token: string): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      logger.error("BridgeLink auth error:", error);
      return false;
    }
  }

  getConnectionQuality(): ConnectionQuality {
    return this.connectionQuality;
  }

  getLastCheck(): Date | null {
    return this.lastCheck;
  }
}

export const hubBridge = new HubBridge();
