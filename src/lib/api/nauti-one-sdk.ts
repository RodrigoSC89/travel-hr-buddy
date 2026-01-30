/**
 * Nauti One TypeScript SDK
 * Client library for external API integrations
 */

export interface NautiOneConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
  message?: string;
}

export interface Vessel {
  id: string;
  name: string;
  type: string;
  imo_number: string;
  flag: string;
  built_year: number;
  gross_tonnage: number;
  status: string;
  current_location: string;
  created_at: string;
}

export interface CrewMember {
  id: string;
  full_name: string;
  position: string;
  rank: string;
  status: string;
  nationality: string;
  vessel_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  document_type: string;
  status: string;
  file_path: string;
  created_at: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string;
  vessel_id: string;
  created_at: string;
}

export interface Certificate {
  id: string;
  certificate_type: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  status: string;
  employee_id: string;
}

export interface AnalyticsSummary {
  total_vessels: number;
  total_crew: number;
  total_documents: number;
  pending_maintenance: number;
  generated_at: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export class NautiOneApiError extends Error {
  public status: number;
  public code: string;
  
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "NautiOneApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Nauti One SDK Client
 * 
 * @example
 * ```typescript
 * const client = new NautiOneClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://your-project.supabase.co/functions/v1/public-api'
 * });
 * 
 * const vessels = await client.vessels.list();
 * const crew = await client.crew.list({ limit: 10 });
 * ```
 */
export class NautiOneClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  
  constructor(config: NautiOneConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://vnbptmixvwropvanyhdb.supabase.co/functions/v1/public-api";
    this.timeout = config.timeout || 30000;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "X-API-Key": this.apiKey,
          "Content-Type": "application/json",
          ...options.headers
        }
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new NautiOneApiError(
          data.error || "Request failed",
          response.status,
          data.code || "UNKNOWN_ERROR"
        );
      }
      
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof NautiOneApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === "AbortError") {
        throw new NautiOneApiError("Request timeout", 408, "TIMEOUT");
      }
      
      throw new NautiOneApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        "NETWORK_ERROR"
      );
    }
  }
  
  /**
   * Get API status and health
   */
  async status() {
    return this.request<{ status: string; version: string; timestamp: string }>("/v1/status");
  }
  
  /**
   * Vessels API
   */
  vessels = {
    /**
     * List all vessels
     */
    list: (params?: PaginationParams) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set("limit", params.limit.toString());
      if (params?.offset) query.set("offset", params.offset.toString());
      
      const queryString = query.toString();
      return this.request<Vessel[]>(`/v1/vessels${queryString ? `?${queryString}` : ""}`);
    },
    
    /**
     * Get a specific vessel by ID
     */
    get: (id: string) => {
      return this.request<Vessel & { vessel_parts?: unknown[]; vessel_manuals?: unknown[] }>(
        `/v1/vessels/${id}`
      );
    },
    
    /**
     * Create a new vessel
     */
    create: (data: Partial<Vessel>) => {
      return this.request<Vessel>("/v1/vessels", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    
    /**
     * Update a vessel
     */
    update: (id: string, data: Partial<Vessel>) => {
      return this.request<Vessel>(`/v1/vessels/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    }
  };
  
  /**
   * Crew API
   */
  crew = {
    /**
     * List all crew members
     */
    list: (params?: PaginationParams) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set("limit", params.limit.toString());
      if (params?.offset) query.set("offset", params.offset.toString());
      
      const queryString = query.toString();
      return this.request<CrewMember[]>(`/v1/crew${queryString ? `?${queryString}` : ""}`);
    },
    
    /**
     * Get a specific crew member
     */
    get: (id: string) => {
      return this.request<CrewMember>(`/v1/crew/${id}`);
    },
    
    /**
     * Create a new crew member
     */
    create: (data: Partial<CrewMember>) => {
      return this.request<CrewMember>("/v1/crew", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    
    /**
     * Update a crew member
     */
    update: (id: string, data: Partial<CrewMember>) => {
      return this.request<CrewMember>(`/v1/crew/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
    }
  };
  
  /**
   * Documents API
   */
  documents = {
    /**
     * List all documents
     */
    list: (params?: PaginationParams) => {
      const query = new URLSearchParams();
      if (params?.limit) query.set("limit", params.limit.toString());
      
      const queryString = query.toString();
      return this.request<Document[]>(`/v1/documents${queryString ? `?${queryString}` : ""}`);
    }
  };
  
  /**
   * Maintenance API
   */
  maintenance = {
    /**
     * List all maintenance tasks
     */
    list: () => {
      return this.request<MaintenanceTask[]>("/v1/maintenance");
    }
  };
  
  /**
   * Certificates API
   */
  certificates = {
    /**
     * List all certificates
     */
    list: () => {
      return this.request<Certificate[]>("/v1/certificates");
    }
  };
  
  /**
   * Analytics API
   */
  analytics = {
    /**
     * Get summary statistics
     */
    summary: () => {
      return this.request<AnalyticsSummary>("/v1/analytics/summary");
    }
  };
  
  /**
   * Webhooks API
   */
  webhooks = {
    /**
     * Dispatch a webhook event
     */
    dispatch: (eventType: string, eventData: Record<string, unknown>) => {
      return this.request<{ success: boolean; dispatched: number }>("/v1/webhooks/dispatch", {
        method: "POST",
        body: JSON.stringify({ event_type: eventType, event_data: eventData })
      });
    }
  };
}

/**
 * Create a new Nauti One client instance
 */
export function createNautiOneClient(config: NautiOneConfig): NautiOneClient {
  return new NautiOneClient(config);
}

export default NautiOneClient;
