/**
 * Centralized API Manager for external service integrations
 */

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class APIManager {
  private baseURL: string;
  private apiKey: string;
  private retryCount = 0;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor(baseURL?: string, apiKey?: string) {
    this.baseURL = baseURL || import.meta.env.VITE_API_BASE_URL || '';
    this.apiKey = apiKey || import.meta.env.VITE_API_KEY || '';
  }

  /**
   * Make an API request with retry logic
   */
  async makeRequest<T>(
    endpoint: string,
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new APIError(
          `Request failed: ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return response.json();
    } catch (error) {
      if (retryCount < this.maxRetries && error instanceof APIError) {
        // Retry on 5xx errors or network errors
        if (error.status >= 500 || !error.status) {
          const delay = this.retryDelay * Math.pow(2, retryCount);
          console.warn(
            `API request failed, retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`,
            error
          );
          
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.makeRequest<T>(endpoint, options, retryCount + 1);
        }
      }
      
      console.error('API request failed after max retries', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const apiManager = new APIManager();
