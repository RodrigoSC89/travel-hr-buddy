import { logger } from '@/lib/logger';
import { spaNavigate } from '@/lib/navigation/spa-navigate';

/**
 * Bunker Savings Notification Service
 * Sends push notifications when savings opportunities exceed $10k
 */

export interface BunkerSavingsAlert {
  id: string;
  port: string;
  currentPrice: number;
  averagePrice: number;
  savingsPerTon: number;
  estimatedTonnage: number;
  totalSavings: number;
  fuelType: "vlsfo" | "mgo" | "hfo";
  timestamp: Date;
}

const SAVINGS_THRESHOLD = 10000; // $10k threshold
const NOTIFICATION_COOLDOWN_KEY = "bunker_notification_cooldown";
const COOLDOWN_HOURS = 4;

class BunkerSavingsNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  async initialize(): Promise<boolean> {
    try {
      if ("serviceWorker" in navigator) {
        this.swRegistration = await navigator.serviceWorker.ready;
      }
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      logger.debug("BunkerSavingsNotificationService initialized");
      return true;
    } catch (error) {
      logger.error("Failed to initialize BunkerSavingsNotificationService", error);
      return false;
    }
  }

  private getCooldownKey(port: string): string {
    return `${NOTIFICATION_COOLDOWN_KEY}_${port}`;
  }

  private isInCooldown(port: string): boolean {
    const key = this.getCooldownKey(port);
    const lastNotification = sessionStorage.getItem(key);
    if (!lastNotification) return false;
    const lastTime = new Date(lastNotification).getTime();
    return Date.now() - lastTime < COOLDOWN_HOURS * 60 * 60 * 1000;
  }

  private setCooldown(port: string): void {
    sessionStorage.setItem(this.getCooldownKey(port), new Date().toISOString());
  }

  async checkAndNotify(alert: BunkerSavingsAlert): Promise<boolean> {
    if (alert.totalSavings < SAVINGS_THRESHOLD) return false;
    if (this.isInCooldown(alert.port)) return false;

    const success = await this.sendNotification(alert);
    if (success) this.setCooldown(alert.port);
    return success;
  }

  async sendNotification(alert: BunkerSavingsAlert): Promise<boolean> {
    if (!("Notification" in window) || Notification.permission !== "granted") return false;

    const title = `💰 Oportunidade de Economia - $${(alert.totalSavings / 1000).toFixed(1)}k`;
    const body = `${alert.port}: ${alert.fuelType.toUpperCase()} a $${alert.currentPrice}/MT (economia de $${alert.savingsPerTon}/MT)`;

    try {
      if (this.swRegistration) {
        await this.swRegistration.showNotification(title, {
          body,
          icon: "/favicon.ico",
          tag: `bunker-savings-${alert.port}-${alert.fuelType}`,
          data: { url: "/fuel-manager" },
          requireInteraction: true,
          vibrate: [200, 100, 200]
        } as NotificationOptions);
        return true;
      }

      const notification = new Notification(title, { body, icon: "/favicon.ico" });
      notification.onclick = () => {
        window.focus();
        spaNavigate("/fuel-management");
        notification.close();
      };
      return true;
    } catch (error) {
      logger.error("Failed to send bunker notification", error);
      return false;
    }
  }

  async checkOpportunities(
    prices: Array<{ port: string; vlsfo: number; mgo: number; hfo: number }>,
    globalAverage: { vlsfo: number; mgo: number; hfo: number },
    estimatedTonnage = 500
  ): Promise<BunkerSavingsAlert[]> {
    const alerts: BunkerSavingsAlert[] = [];
    const fuelTypes: Array<"vlsfo" | "mgo" | "hfo"> = ["vlsfo", "mgo", "hfo"];

    for (const portPrice of prices) {
      for (const fuelType of fuelTypes) {
        const savingsPerTon = globalAverage[fuelType] - portPrice[fuelType];
        const totalSavings = savingsPerTon * estimatedTonnage;

        if (totalSavings >= SAVINGS_THRESHOLD) {
          const alert: BunkerSavingsAlert = {
            id: `${portPrice.port}-${fuelType}-${Date.now()}`,
            port: portPrice.port,
            currentPrice: portPrice[fuelType],
            averagePrice: globalAverage[fuelType],
            savingsPerTon,
            estimatedTonnage,
            totalSavings,
            fuelType,
            timestamp: new Date()
          };
          alerts.push(alert);
          await this.checkAndNotify(alert);
        }
      }
    }
    return alerts;
  }
}

export const bunkerSavingsNotificationService = new BunkerSavingsNotificationService();
