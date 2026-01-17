/**
 * API Client - PATCH 854
 * Resilient API client for slow connections with retry logic
 */

import { fetchWithRetry, API_CONFIG, getConnectionConfig } from '@/config/api.config';

interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  
  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }
  
  /**
   * Get authorization token
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }
  
  /**
   * Build full URL
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    return `${this.baseUrl}${path}`;
  }
  
  /**
   * Make a request with retry logic
   */
  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<{ data: T | null; error: Error | null; status: number }> {
    const { timeout, retries, skipAuth, ...fetchOptions } = options;
    
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...(fetchOptions.headers as Record<string, string>),
    };
    
    // Add auth token if available and not skipped
    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    const url = this.buildUrl(path);
    
    try {
      const response = await fetchWithRetry(
        url,
        {
          method,
          headers,
          ...fetchOptions,
        },
        retries
      );
      
      const status = response.status;
      
      // Handle no content
      if (status === 204) {
        return { data: null, error: null, status };
      }
      
      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T | null = null;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = (await response.text()) as unknown as T;
      }
      
      // Check for error responses
      if (!response.ok) {
        const errorMessage = (data as any)?.message || (data as any)?.error || `Request failed with status ${status}`;
        return { data: null, error: new Error(errorMessage), status };
      }
      
      return { data, error: null, status };
      
    } catch (error: any) {
      console.error('[ApiClient] Request failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error(String(error)), 
        status: 0 
      };
    }
  }
  
  /**
   * GET request
   */
  async get<T>(path: string, options?: RequestOptions) {
    return this.request<T>('GET', path, options);
  }
  
  /**
   * POST request
   */
  async post<T>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>('POST', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>('PUT', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  
  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: any, options?: RequestOptions) {
    return this.request<T>('PATCH', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>('DELETE', path, options);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export { ApiClient };
