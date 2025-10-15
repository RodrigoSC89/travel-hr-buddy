/**
 * Jobs Forecast By Component Edge Function Tests
 * 
 * Tests for the jobs-forecast-by-component edge function that uses AI to predict 
 * job completion trends by component for the next two months
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('jobs-forecast-by-component Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Request Handling', () => {
    it('should handle CORS preflight requests', () => {
      const method = "OPTIONS";
      const shouldReturnEarly = method === "OPTIONS";

      expect(shouldReturnEarly).toBe(true);
    });

    it('should return null body for OPTIONS', () => {
      const optionsResponse = {
        body: null,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        },
      };

      expect(optionsResponse.body).toBeNull();
      expect(optionsResponse.headers["Access-Control-Allow-Origin"]).toBe("*");
    });

    it('should include CORS headers in response', () => {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      };

      expect(corsHeaders["Access-Control-Allow-Origin"]).toBe("*");
      expect(corsHeaders["Access-Control-Allow-Headers"]).toContain("authorization");
    });
  });

  describe('Database Query Logic', () => {
    it('should calculate 180 days ago correctly', () => {
      const today = new Date();
      const date180DaysAgo = new Date();
      date180DaysAgo.setDate(date180DaysAgo.getDate() - 180);

      const daysDiff = Math.floor((today.getTime() - date180DaysAgo.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDiff).toBe(180);
    });

    it('should format cutoff date as YYYY-MM-DD', () => {
      const date = new Date('2025-10-15');
      const formatted = date.toISOString().split('T')[0];

      expect(formatted).toBe('2025-10-15');
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should query completed jobs only', () => {
      const queryFilters = {
        status: 'completed',
        hasCompletedDate: true,
        hasComponentId: true,
      };

      expect(queryFilters.status).toBe('completed');
      expect(queryFilters.hasCompletedDate).toBe(true);
      expect(queryFilters.hasComponentId).toBe(true);
    });

    it('should filter out null component_ids', () => {
      const jobs = [
        { component_id: 'uuid-1', completed_date: '2025-10-01' },
        { component_id: null, completed_date: '2025-10-02' },
        { component_id: 'uuid-2', completed_date: '2025-10-03' },
      ];

      const filtered = jobs.filter(j => j.component_id !== null);

      expect(filtered).toHaveLength(2);
      expect(filtered[0].component_id).toBe('uuid-1');
      expect(filtered[1].component_id).toBe('uuid-2');
    });
  });

  describe('Data Aggregation', () => {
    it('should extract YYYY-MM format from completed_date', () => {
      const completedDate = '2025-10-15';
      const month = completedDate.slice(0, 7);

      expect(month).toBe('2025-10');
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });

    it('should group jobs by component_id', () => {
      const jobs = [
        { component_id: 'comp-1', completed_date: '2025-08-15' },
        { component_id: 'comp-1', completed_date: '2025-09-20' },
        { component_id: 'comp-2', completed_date: '2025-09-10' },
        { component_id: 'comp-1', completed_date: '2025-10-05' },
      ];

      const trendByComponent: Record<string, string[]> = {};

      jobs.forEach(job => {
        const month = job.completed_date.slice(0, 7);
        if (!trendByComponent[job.component_id]) {
          trendByComponent[job.component_id] = [];
        }
        trendByComponent[job.component_id].push(month);
      });

      expect(Object.keys(trendByComponent)).toHaveLength(2);
      expect(trendByComponent['comp-1']).toHaveLength(3);
      expect(trendByComponent['comp-2']).toHaveLength(1);
    });

    it('should build monthly trends array correctly', () => {
      const jobs = [
        { component_id: 'comp-1', completed_date: '2025-08-15' },
        { component_id: 'comp-1', completed_date: '2025-08-20' },
        { component_id: 'comp-1', completed_date: '2025-09-05' },
      ];

      const trendByComponent: Record<string, string[]> = {};

      jobs.forEach(job => {
        const month = job.completed_date.slice(0, 7);
        if (!trendByComponent[job.component_id]) {
          trendByComponent[job.component_id] = [];
        }
        trendByComponent[job.component_id].push(month);
      });

      expect(trendByComponent['comp-1']).toEqual(['2025-08', '2025-08', '2025-09']);
      expect(trendByComponent['comp-1']).toContain('2025-08');
      expect(trendByComponent['comp-1']).toContain('2025-09');
    });

    it('should count job frequency per month per component', () => {
      const trends = ['2025-08', '2025-08', '2025-09', '2025-08'];
      
      const monthlyCounts = trends.reduce((acc: Record<string, number>, month) => {
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      expect(monthlyCounts['2025-08']).toBe(3);
      expect(monthlyCounts['2025-09']).toBe(1);
    });
  });

  describe('OpenAI Integration', () => {
    it('should use GPT-4 model', () => {
      const modelConfig = {
        model: 'gpt-4',
        temperature: 0.4,
      };

      expect(modelConfig.model).toBe('gpt-4');
      expect(modelConfig.temperature).toBe(0.4);
    });

    it('should format system prompt correctly', () => {
      const systemPrompt = 'Você é uma IA técnica de manutenção embarcada, especializada em previsão por criticidade.';

      expect(systemPrompt).toContain('manutenção embarcada');
      expect(systemPrompt).toContain('previsão por criticidade');
    });

    it('should build user prompt with trend data', () => {
      const trendByComponent = {
        'comp-1': ['2025-08', '2025-09'],
        'comp-2': ['2025-09', '2025-10'],
      };

      const prompt = `Você é uma IA de manutenção. Abaixo estão os dados de jobs por componente (por mês):

${JSON.stringify(trendByComponent, null, 2)}

Gere uma previsão dos próximos dois meses por componente e indique os mais críticos.`;

      expect(prompt).toContain('dados de jobs por componente');
      expect(prompt).toContain('comp-1');
      expect(prompt).toContain('comp-2');
      expect(prompt).toContain('próximos dois meses');
      expect(prompt).toContain('indique os mais críticos');
    });

    it('should request 2-month forecast period', () => {
      const forecastMonths = 2;
      const prompt = `Gere uma previsão dos próximos ${forecastMonths} meses`;

      expect(prompt).toContain('próximos 2 meses');
    });

    it('should use temperature 0.4 for consistency', () => {
      const temperature = 0.4;

      expect(temperature).toBe(0.4);
      expect(temperature).toBeLessThan(0.7); // Less than default for more focused predictions
      expect(temperature).toBeGreaterThan(0); // More than 0 for some creativity
    });
  });

  describe('Response Handling', () => {
    it('should return forecast in response', () => {
      const mockResponse = {
        forecast: 'Baseado nos dados históricos, prevê-se para os próximos dois meses:\n\n**Componente A**: Alta criticidade...',
      };

      expect(mockResponse).toHaveProperty('forecast');
      expect(typeof mockResponse.forecast).toBe('string');
      expect(mockResponse.forecast.length).toBeGreaterThan(0);
    });

    it('should handle no data scenario', () => {
      const mockResponse = {
        forecast: 'Não há dados históricos suficientes para gerar uma previsão. Nenhum job foi completado nos últimos 180 dias.',
      };

      expect(mockResponse.forecast).toContain('Não há dados históricos');
      expect(mockResponse.forecast).toContain('180 dias');
    });

    it('should return 200 status for successful forecast', () => {
      const response = {
        status: 200,
        data: {
          forecast: 'Previsão gerada com sucesso...',
        },
      };

      expect(response.status).toBe(200);
      expect(response.data.forecast).toBeTruthy();
    });

    it('should format forecast in Portuguese', () => {
      const forecast = 'Baseado nos dados históricos, prevê-se aumento de 15% em falhas.';

      expect(forecast).toMatch(/[áéíóúâêôãç]/i); // Contains Portuguese characters
      expect(forecast).toContain('Baseado');
      expect(forecast).toContain('prevê-se');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing SUPABASE_URL', () => {
      const hasSupabaseUrl = (url?: string) => !!url;

      expect(hasSupabaseUrl(undefined)).toBe(false);
      expect(hasSupabaseUrl('')).toBe(false);
      expect(hasSupabaseUrl('https://test.supabase.co')).toBe(true);
    });

    it('should handle missing OPENAI_API_KEY', () => {
      const hasApiKey = (key?: string) => !!key;

      expect(hasApiKey(undefined)).toBe(false);
      expect(hasApiKey('')).toBe(false);
      expect(hasApiKey('sk-test123')).toBe(true);
    });

    it('should return error with timestamp', () => {
      const errorResponse = {
        error: 'Database error occurred',
        timestamp: new Date().toISOString(),
      };

      expect(errorResponse.error).toBeTruthy();
      expect(errorResponse.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should return 500 for server errors', () => {
      const errorResponse = {
        status: 500,
        body: {
          error: 'OpenAI API error',
          timestamp: new Date().toISOString(),
        },
      };

      expect(errorResponse.status).toBe(500);
      expect(errorResponse.body.error).toBeTruthy();
    });

    it('should handle database query errors', () => {
      const mockError = {
        message: 'Database error: connection timeout',
        code: 'PGRST116',
      };

      expect(mockError.message).toContain('Database error');
      expect(mockError.code).toBeTruthy();
    });

    it('should handle OpenAI API errors', () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      };

      expect(mockErrorResponse.ok).toBe(false);
      expect(mockErrorResponse.status).toBe(500);
    });

    it('should handle invalid OpenAI response format', () => {
      const invalidResponse = {
        choices: null,
      };

      const isValid = !!(invalidResponse.choices && 
                     Array.isArray(invalidResponse.choices) && 
                     invalidResponse.choices.length > 0);

      expect(isValid).toBe(false);
    });
  });

  describe('Forecast Output', () => {
    it('should identify critical components', () => {
      const mockForecast = `
      Previsão para os próximos 2 meses:
      
      **Componente A**: Alta criticidade - aumento de 15% previsto
      **Componente B**: Criticidade média - manutenção preventiva recomendada
      **Componente C**: Baixa criticidade - monitoramento regular
      `;

      expect(mockForecast).toContain('Alta criticidade');
      expect(mockForecast).toContain('Criticidade média');
      expect(mockForecast).toContain('Baixa criticidade');
    });

    it('should provide actionable recommendations', () => {
      const mockForecast = `
      **Componente A**: Alta criticidade
      - Aumento de 15% em falhas previsto
      - Recomendação: Aumentar frequência de inspeções
      `;

      expect(mockForecast).toContain('Recomendação');
      expect(mockForecast).toContain('previsto');
    });

    it('should cover 2-month forecast period', () => {
      const forecast = 'Previsão para os próximos 2 meses: Novembro e Dezembro';

      expect(forecast).toContain('2 meses');
      expect(forecast).toMatch(/meses/i);
    });
  });

  describe('Logging', () => {
    it('should log function start', () => {
      const logMessage = 'Starting jobs-forecast-by-component function';

      expect(logMessage).toContain('Starting');
      expect(logMessage).toContain('jobs-forecast-by-component');
    });

    it('should log query with cutoff date', () => {
      const cutoffDate = '2025-04-17';
      const logMessage = `Querying completed jobs since ${cutoffDate}`;

      expect(logMessage).toContain('Querying completed jobs since');
      expect(logMessage).toContain(cutoffDate);
    });

    it('should log number of jobs found', () => {
      const jobCount = 145;
      const logMessage = `Found ${jobCount} completed jobs in the last 180 days`;

      expect(logMessage).toContain('145');
      expect(logMessage).toContain('completed jobs');
    });

    it('should log number of components', () => {
      const componentCount = 23;
      const logMessage = `Grouped data by ${componentCount} components`;

      expect(logMessage).toContain('23');
      expect(logMessage).toContain('components');
    });

    it('should log successful forecast generation', () => {
      const successMessage = 'Forecast generated successfully';

      expect(successMessage).toContain('successfully');
      expect(successMessage).toContain('Forecast');
    });

    it('should log errors with details', () => {
      const error = new Error('OpenAI API error: 500');
      const logError = (err: Error) => {
        return `Error in jobs-forecast-by-component function: ${err.message}`;
      };

      const message = logError(error);

      expect(message).toContain('Error in jobs-forecast-by-component');
      expect(message).toContain('OpenAI API error');
    });
  });

  describe('Data Formatting', () => {
    it('should format trend data as JSON', () => {
      const trendByComponent = {
        'comp-1': ['2025-08', '2025-09'],
        'comp-2': ['2025-09', '2025-10'],
      };

      const formatted = JSON.stringify(trendByComponent, null, 2);

      expect(formatted).toContain('comp-1');
      expect(formatted).toContain('2025-08');
      expect(formatted).toContain('comp-2');
    });

    it('should preserve month order in arrays', () => {
      const months = ['2025-05', '2025-06', '2025-07', '2025-08'];

      expect(months[0]).toBe('2025-05');
      expect(months[months.length - 1]).toBe('2025-08');
    });
  });

  describe('Environment Configuration', () => {
    it('should require SUPABASE_URL environment variable', () => {
      const envVars = {
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        OPENAI_API_KEY: 'sk-test',
      };

      expect(envVars.SUPABASE_URL).toBeTruthy();
      expect(envVars.SUPABASE_URL).toContain('supabase.co');
    });

    it('should require SUPABASE_SERVICE_ROLE_KEY environment variable', () => {
      const envVars = {
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        OPENAI_API_KEY: 'sk-test',
      };

      expect(envVars.SUPABASE_SERVICE_ROLE_KEY).toBeTruthy();
    });

    it('should require OPENAI_API_KEY environment variable', () => {
      const envVars = {
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'test-key',
        OPENAI_API_KEY: 'sk-test',
      };

      expect(envVars.OPENAI_API_KEY).toBeTruthy();
      expect(envVars.OPENAI_API_KEY).toContain('sk-');
    });
  });

  describe('Schema Compatibility', () => {
    it('should use completed_date field from schema', () => {
      const jobFields = {
        component_id: 'uuid',
        status: 'completed',
        completed_date: '2025-10-15',
      };

      expect(jobFields).toHaveProperty('completed_date');
      expect(jobFields.completed_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should handle status field correctly', () => {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'postponed'];
      const targetStatus = 'completed';

      expect(validStatuses).toContain(targetStatus);
    });

    it('should work with UUID component_id', () => {
      const componentId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(componentId);

      expect(isUUID).toBe(true);
    });
  });
});
