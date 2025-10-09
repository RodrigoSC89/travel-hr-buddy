/**
 * Integration Manager for External Services
 * Manages connections to Amadeus, Mapbox, Stripe, HubSpot, and other external services
 */

interface ServiceConfig {
  name: string;
  apiKey?: string;
  baseUrl: string;
  status: "connected" | "disconnected" | "error";
  lastCheck?: Date;
  healthCheckUrl?: string;
}

interface ServiceTestResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export class IntegrationManager {
  private services: Map<string, ServiceConfig> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeServices();
  }

  /**
   * Initialize known services
   */
  private initializeServices() {
    // Amadeus API
    const amadeusKey = import.meta.env.VITE_AMADEUS_API_KEY;
    if (amadeusKey) {
      this.services.set("amadeus", {
        name: "Amadeus",
        apiKey: amadeusKey,
        baseUrl: "https://test.api.amadeus.com",
        status: "disconnected",
        healthCheckUrl: "/v1/reference-data/locations",
      });
    }

    // Mapbox
    const mapboxKey = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (mapboxKey) {
      this.services.set("mapbox", {
        name: "Mapbox",
        apiKey: mapboxKey,
        baseUrl: "https://api.mapbox.com",
        status: "disconnected",
      });
    }

    // Stripe
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (stripeKey) {
      this.services.set("stripe", {
        name: "Stripe",
        apiKey: stripeKey,
        baseUrl: "https://api.stripe.com",
        status: "disconnected",
      });
    }
  }

  /**
   * Test service connection
   */
  private async testConnection(
    serviceName: string,
    config: ServiceConfig
  ): Promise<ServiceTestResponse> {
    try {
      const url = config.healthCheckUrl 
        ? `${config.baseUrl}${config.healthCheckUrl}`
        : `${config.baseUrl}/health`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
        },
      });

      if (response.ok || response.status === 401) {
        // 401 means the service is up but needs auth
        return { 
          success: true, 
          message: `${serviceName} is reachable` 
        };
      }

      return { 
        success: false, 
        error: `Service returned status ${response.status}` 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  /**
   * Connect to a service
   */
  async connectService(
    serviceName: string,
    config?: Partial<ServiceConfig>
  ): Promise<ServiceTestResponse> {
    try {
      const existingConfig = this.services.get(serviceName);
      const finalConfig: ServiceConfig = {
        name: serviceName,
        baseUrl: config?.baseUrl || existingConfig?.baseUrl || "",
        apiKey: config?.apiKey || existingConfig?.apiKey,
        status: "disconnected",
        ...config,
      };

      const testResponse = await this.testConnection(serviceName, finalConfig);

      if (testResponse.success) {
        this.services.set(serviceName, {
          ...finalConfig,
          status: "connected",
          lastCheck: new Date(),
        });

        return { 
          success: true, 
          message: `${serviceName} conectado com sucesso` 
        };
      } else {
        this.services.set(serviceName, {
          ...finalConfig,
          status: "error",
          lastCheck: new Date(),
        });

        return { 
          success: false, 
          error: testResponse.error 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      };
    }
  }

  /**
   * Get service status
   */
  getServiceStatus(serviceName: string): ServiceConfig | undefined {
    return this.services.get(serviceName);
  }

  /**
   * Get all services
   */
  getAllServices(): Map<string, ServiceConfig> {
    return this.services;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs: number = 60000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const [name, config] of this.services) {
        await this.connectService(name, config);
      }
    }, intervalMs);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  /**
   * Check if a service is available
   */
  isServiceAvailable(serviceName: string): boolean {
    const service = this.services.get(serviceName);
    return service?.status === "connected";
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();
