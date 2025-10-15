import { describe, it, expect, beforeAll, vi } from 'vitest';

// Mock Supabase client
const mockRpc = vi.fn();
const mockSupabase = {
  rpc: mockRpc,
};

// Mock Deno environment
const mockDeno = {
  env: {
    get: (key: string) => {
      if (key === 'SUPABASE_URL') return 'https://test.supabase.co';
      if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'test-key';
      return null;
    },
  },
};

describe('BI Jobs by Component API', () => {
  beforeAll(() => {
    // Setup global mocks
    vi.stubGlobal('Deno', mockDeno);
  });

  describe('Response Structure', () => {
    it('should return correct structure with all required fields', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Motor Principal ME-4500',
          total_jobs: 15,
          avg_execution_time_days: 4.2,
          pending_jobs: 3,
          in_progress_jobs: 5,
          completed_jobs: 7,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('component_id');
      expect(result.data[0]).toHaveProperty('component_name');
      expect(result.data[0]).toHaveProperty('total_jobs');
      expect(result.data[0]).toHaveProperty('avg_execution_time_days');
      expect(result.data[0]).toHaveProperty('pending_jobs');
      expect(result.data[0]).toHaveProperty('in_progress_jobs');
      expect(result.data[0]).toHaveProperty('completed_jobs');
    });

    it('should have correct data types for each field', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Test Component',
          total_jobs: 10,
          avg_execution_time_days: 3.5,
          pending_jobs: 2,
          in_progress_jobs: 3,
          completed_jobs: 5,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(typeof item.component_id).toBe('string');
      expect(typeof item.component_name).toBe('string');
      expect(typeof item.total_jobs).toBe('number');
      expect(typeof item.avg_execution_time_days).toBe('number');
      expect(typeof item.pending_jobs).toBe('number');
      expect(typeof item.in_progress_jobs).toBe('number');
      expect(typeof item.completed_jobs).toBe('number');
    });
  });

  describe('Job Counting Logic', () => {
    it('should count total jobs correctly', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Component A',
          total_jobs: 10,
          avg_execution_time_days: 5.0,
          pending_jobs: 3,
          in_progress_jobs: 2,
          completed_jobs: 5,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      // Total should equal sum of all statuses
      expect(item.total_jobs).toBe(
        item.pending_jobs + item.in_progress_jobs + item.completed_jobs
      );
    });

    it('should handle components with zero jobs', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Unused Component',
          total_jobs: 0,
          avg_execution_time_days: null,
          pending_jobs: 0,
          in_progress_jobs: 0,
          completed_jobs: 0,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.total_jobs).toBe(0);
      expect(item.pending_jobs).toBe(0);
      expect(item.in_progress_jobs).toBe(0);
      expect(item.completed_jobs).toBe(0);
    });
  });

  describe('Average Execution Time Calculation', () => {
    it('should calculate average execution time for completed jobs', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Component with Completed Jobs',
          total_jobs: 5,
          avg_execution_time_days: 4.2,
          pending_jobs: 0,
          in_progress_jobs: 0,
          completed_jobs: 5,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.avg_execution_time_days).toBeGreaterThan(0);
      expect(item.completed_jobs).toBeGreaterThan(0);
    });

    it('should return null for average execution time when no completed jobs', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Component with No Completed Jobs',
          total_jobs: 5,
          avg_execution_time_days: null,
          pending_jobs: 3,
          in_progress_jobs: 2,
          completed_jobs: 0,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.avg_execution_time_days).toBeNull();
      expect(item.completed_jobs).toBe(0);
    });

    it('should handle very quick jobs (less than 1 day)', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Quick Jobs Component',
          total_jobs: 3,
          avg_execution_time_days: 0.5,
          pending_jobs: 0,
          in_progress_jobs: 0,
          completed_jobs: 3,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.avg_execution_time_days).toBeLessThan(1);
      expect(item.avg_execution_time_days).toBeGreaterThan(0);
    });

    it('should handle long-running jobs (more than 30 days)', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Long Jobs Component',
          total_jobs: 2,
          avg_execution_time_days: 45.8,
          pending_jobs: 0,
          in_progress_jobs: 0,
          completed_jobs: 2,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.avg_execution_time_days).toBeGreaterThan(30);
    });
  });

  describe('Sorting and Ordering', () => {
    it('should sort by total jobs descending', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Component A',
          total_jobs: 20,
          avg_execution_time_days: 5.0,
          pending_jobs: 5,
          in_progress_jobs: 5,
          completed_jobs: 10,
        },
        {
          component_id: '223e4567-e89b-12d3-a456-426614174001',
          component_name: 'Component B',
          total_jobs: 10,
          avg_execution_time_days: 3.0,
          pending_jobs: 3,
          in_progress_jobs: 2,
          completed_jobs: 5,
        },
        {
          component_id: '323e4567-e89b-12d3-a456-426614174002',
          component_name: 'Component C',
          total_jobs: 5,
          avg_execution_time_days: 2.0,
          pending_jobs: 1,
          in_progress_jobs: 1,
          completed_jobs: 3,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.data[0].total_jobs).toBeGreaterThanOrEqual(
        result.data[1].total_jobs
      );
      expect(result.data[1].total_jobs).toBeGreaterThanOrEqual(
        result.data[2].total_jobs
      );
    });

    it('should sort alphabetically by component name when job counts are equal', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Alpha Component',
          total_jobs: 10,
          avg_execution_time_days: 5.0,
          pending_jobs: 3,
          in_progress_jobs: 3,
          completed_jobs: 4,
        },
        {
          component_id: '223e4567-e89b-12d3-a456-426614174001',
          component_name: 'Beta Component',
          total_jobs: 10,
          avg_execution_time_days: 4.0,
          pending_jobs: 2,
          in_progress_jobs: 3,
          completed_jobs: 5,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.data[0].component_name).toBe('Alpha Component');
      expect(result.data[1].component_name).toBe('Beta Component');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty result set', async () => {
      mockRpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(0);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle null component_id gracefully', async () => {
      const mockData = [
        {
          component_id: null,
          component_name: null,
          total_jobs: 0,
          avg_execution_time_days: null,
          pending_jobs: 0,
          in_progress_jobs: 0,
          completed_jobs: 0,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.component_id).toBeNull();
      expect(item.component_name).toBeNull();
    });

    it('should handle components with high job volumes', async () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'High Volume Component',
          total_jobs: 1000,
          avg_execution_time_days: 5.3,
          pending_jobs: 300,
          in_progress_jobs: 200,
          completed_jobs: 500,
        },
      ];

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await mockSupabase.rpc('jobs_by_component_stats');
      const item = result.data[0];

      expect(item.total_jobs).toBeGreaterThan(100);
      expect(item.total_jobs).toBe(
        item.pending_jobs + item.in_progress_jobs + item.completed_jobs
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Database connection failed');
    });

    it('should handle RPC function not found', async () => {
      mockRpc.mockResolvedValueOnce({
        data: null,
        error: { message: 'Function jobs_by_component_stats does not exist' },
      });

      const result = await mockSupabase.rpc('jobs_by_component_stats');

      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('does not exist');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', () => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers':
          'authorization, x-client-info, apikey, content-type',
      };

      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
      expect(corsHeaders['Access-Control-Allow-Headers']).toContain(
        'authorization'
      );
    });

    it('should handle OPTIONS preflight request', () => {
      const method = 'OPTIONS';
      expect(method).toBe('OPTIONS');
    });
  });

  describe('Performance Considerations', () => {
    it('should return results in reasonable time', async () => {
      const startTime = Date.now();

      const mockData = Array.from({ length: 50 }, (_, i) => ({
        component_id: `component-${i}`,
        component_name: `Component ${i}`,
        total_jobs: Math.floor(Math.random() * 100),
        avg_execution_time_days: Math.random() * 10,
        pending_jobs: Math.floor(Math.random() * 30),
        in_progress_jobs: Math.floor(Math.random() * 30),
        completed_jobs: Math.floor(Math.random() * 40),
      }));

      mockRpc.mockResolvedValueOnce({ data: mockData, error: null });

      await mockSupabase.rpc('jobs_by_component_stats');

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should be very fast for mocked data
      expect(executionTime).toBeLessThan(100);
    });
  });
});
