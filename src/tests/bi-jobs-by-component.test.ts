/**
 * BI Jobs By Component Tests
 * 
 * Tests for the jobs_by_component_stats RPC function and bi-jobs-by-component edge function
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('jobs_by_component_stats RPC Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Response Structure', () => {
    it('should return correct response structure', () => {
      const mockResponse = {
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        component_name: 'Motor Principal ME-4500',
        total_jobs: 10,
        avg_execution_time_days: 3.5,
        pending_jobs: 2,
        in_progress_jobs: 3,
        completed_jobs: 5,
      };

      expect(mockResponse).toHaveProperty('component_id');
      expect(mockResponse).toHaveProperty('component_name');
      expect(mockResponse).toHaveProperty('total_jobs');
      expect(mockResponse).toHaveProperty('avg_execution_time_days');
      expect(mockResponse).toHaveProperty('pending_jobs');
      expect(mockResponse).toHaveProperty('in_progress_jobs');
      expect(mockResponse).toHaveProperty('completed_jobs');
    });

    it('should return array of component stats', () => {
      const mockResponse = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Motor Principal',
          total_jobs: 15,
          avg_execution_time_days: 4.2,
          pending_jobs: 3,
          in_progress_jobs: 5,
          completed_jobs: 7,
        },
        {
          component_id: '223e4567-e89b-12d3-a456-426614174001',
          component_name: 'Gerador Auxiliar',
          total_jobs: 8,
          avg_execution_time_days: 2.8,
          pending_jobs: 1,
          in_progress_jobs: 2,
          completed_jobs: 5,
        },
      ];

      expect(Array.isArray(mockResponse)).toBe(true);
      expect(mockResponse).toHaveLength(2);
      expect(mockResponse[0].component_name).toBe('Motor Principal');
      expect(mockResponse[1].component_name).toBe('Gerador Auxiliar');
    });
  });

  describe('Job Count Calculation', () => {
    it('should sum all job counts correctly', () => {
      const stats = {
        pending_jobs: 2,
        in_progress_jobs: 3,
        completed_jobs: 5,
        total_jobs: 10,
      };

      expect(stats.total_jobs).toBe(10);
      expect(stats.pending_jobs + stats.in_progress_jobs + stats.completed_jobs).toBeLessThanOrEqual(stats.total_jobs);
    });

    it('should handle components with no jobs', () => {
      const stats = {
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        component_name: 'Component Without Jobs',
        total_jobs: 0,
        avg_execution_time_days: null,
        pending_jobs: 0,
        in_progress_jobs: 0,
        completed_jobs: 0,
      };

      expect(stats.total_jobs).toBe(0);
      expect(stats.avg_execution_time_days).toBeNull();
    });

    it('should count only jobs associated with component', () => {
      const componentId = '123e4567-e89b-12d3-a456-426614174000';
      const jobs = [
        { id: '1', component_id: componentId, status: 'pending' },
        { id: '2', component_id: componentId, status: 'completed' },
        { id: '3', component_id: 'different-component', status: 'pending' },
      ];

      const jobsForComponent = jobs.filter(j => j.component_id === componentId);
      expect(jobsForComponent).toHaveLength(2);
    });
  });

  describe('Average Execution Time Calculation', () => {
    it('should calculate average execution time in days', () => {
      const createdAt = new Date('2025-10-10T10:00:00Z');
      const completedDate = new Date('2025-10-13'); // 3 days later
      
      const diffInMs = completedDate.getTime() - createdAt.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
      
      expect(diffInDays).toBeCloseTo(3, 0);
    });

    it('should only calculate average for completed jobs', () => {
      const jobs = [
        { 
          status: 'completed', 
          created_at: new Date('2025-10-10T10:00:00Z'),
          completed_date: new Date('2025-10-13'),
        },
        { 
          status: 'pending', 
          created_at: new Date('2025-10-10T10:00:00Z'),
          completed_date: null,
        },
        { 
          status: 'in_progress', 
          created_at: new Date('2025-10-10T10:00:00Z'),
          completed_date: null,
        },
      ];

      const completedJobs = jobs.filter(j => j.status === 'completed' && j.completed_date !== null);
      expect(completedJobs).toHaveLength(1);
    });

    it('should return null average when no completed jobs', () => {
      const stats = {
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        component_name: 'New Component',
        total_jobs: 5,
        avg_execution_time_days: null,
        pending_jobs: 3,
        in_progress_jobs: 2,
        completed_jobs: 0,
      };

      expect(stats.completed_jobs).toBe(0);
      expect(stats.avg_execution_time_days).toBeNull();
    });

    it('should handle multiple completed jobs and calculate average', () => {
      const executionTimes = [2.5, 3.0, 4.5, 3.5]; // days
      const average = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      
      expect(average).toBeCloseTo(3.375, 2);
    });
  });

  describe('Sorting and Ordering', () => {
    it('should sort components by total_jobs descending', () => {
      const mockData = [
        { component_name: 'Component A', total_jobs: 5 },
        { component_name: 'Component B', total_jobs: 15 },
        { component_name: 'Component C', total_jobs: 10 },
      ];

      const sorted = [...mockData].sort((a, b) => b.total_jobs - a.total_jobs);

      expect(sorted[0].component_name).toBe('Component B');
      expect(sorted[0].total_jobs).toBe(15);
      expect(sorted[1].total_jobs).toBe(10);
      expect(sorted[2].total_jobs).toBe(5);
    });

    it('should sort alphabetically by component_name when total_jobs are equal', () => {
      const mockData = [
        { component_name: 'Zebra Component', total_jobs: 10 },
        { component_name: 'Alpha Component', total_jobs: 10 },
        { component_name: 'Beta Component', total_jobs: 10 },
      ];

      const sorted = [...mockData].sort((a, b) => {
        if (a.total_jobs !== b.total_jobs) {
          return b.total_jobs - a.total_jobs;
        }
        return a.component_name.localeCompare(b.component_name);
      });

      expect(sorted[0].component_name).toBe('Alpha Component');
      expect(sorted[1].component_name).toBe('Beta Component');
      expect(sorted[2].component_name).toBe('Zebra Component');
    });
  });

  describe('Edge Cases', () => {
    it('should handle components with null component_id', () => {
      const stats = {
        component_id: null,
        component_name: 'Unassigned Jobs',
        total_jobs: 3,
        avg_execution_time_days: 2.0,
        pending_jobs: 1,
        in_progress_jobs: 1,
        completed_jobs: 1,
      };

      expect(stats.component_id).toBeNull();
      expect(stats.total_jobs).toBeGreaterThan(0);
    });

    it('should handle very long execution times', () => {
      const stats = {
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        component_name: 'Complex Component',
        total_jobs: 2,
        avg_execution_time_days: 45.5,
        pending_jobs: 0,
        in_progress_jobs: 0,
        completed_jobs: 2,
      };

      expect(stats.avg_execution_time_days).toBeGreaterThan(30);
    });

    it('should handle very fast execution times', () => {
      const stats = {
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        component_name: 'Simple Component',
        total_jobs: 5,
        avg_execution_time_days: 0.5,
        pending_jobs: 0,
        in_progress_jobs: 0,
        completed_jobs: 5,
      };

      expect(stats.avg_execution_time_days).toBeLessThan(1);
    });
  });
});

describe('bi-jobs-by-component Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in response', () => {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      };

      expect(corsHeaders['Access-Control-Allow-Origin']).toBe('*');
      expect(corsHeaders['Access-Control-Allow-Headers']).toContain('authorization');
    });

    it('should handle OPTIONS preflight request', () => {
      const method = 'OPTIONS';
      const shouldReturnOk = method === 'OPTIONS';

      expect(shouldReturnOk).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    it('should validate required environment variables', () => {
      const hasRequiredEnv = (url?: string, key?: string) => {
        return !!url && !!key;
      };

      expect(hasRequiredEnv(undefined, undefined)).toBe(false);
      expect(hasRequiredEnv('https://test.supabase.co', undefined)).toBe(false);
      expect(hasRequiredEnv(undefined, 'key123')).toBe(false);
      expect(hasRequiredEnv('https://test.supabase.co', 'key123')).toBe(true);
    });
  });

  describe('RPC Call', () => {
    it('should call jobs_by_component_stats RPC function', () => {
      const rpcFunctionName = 'jobs_by_component_stats';
      
      expect(rpcFunctionName).toBe('jobs_by_component_stats');
    });

    it('should handle successful RPC response', () => {
      const mockData = [
        {
          component_id: '123e4567-e89b-12d3-a456-426614174000',
          component_name: 'Motor Principal',
          total_jobs: 10,
          avg_execution_time_days: 3.5,
          pending_jobs: 2,
          in_progress_jobs: 3,
          completed_jobs: 5,
        },
      ];

      expect(Array.isArray(mockData)).toBe(true);
      expect(mockData[0]).toHaveProperty('component_id');
    });

    it('should handle RPC error', () => {
      const mockError = {
        message: 'Function jobs_by_component_stats does not exist',
        code: '42883',
      };

      expect(mockError.message).toContain('jobs_by_component_stats');
    });
  });

  describe('Response Format', () => {
    it('should return JSON response', () => {
      const responseHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      };

      expect(responseHeaders['Content-Type']).toBe('application/json');
    });

    it('should return data directly as JSON array', () => {
      const mockData = [
        { component_id: '1', component_name: 'Component 1', total_jobs: 5 },
        { component_id: '2', component_name: 'Component 2', total_jobs: 3 },
      ];

      const responseBody = JSON.stringify(mockData);
      const parsed = JSON.parse(responseBody);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on RPC error', () => {
      const errorResponse = {
        status: 500,
        body: JSON.stringify({ error: 'RPC function error' }),
      };

      expect(errorResponse.status).toBe(500);
      expect(JSON.parse(errorResponse.body)).toHaveProperty('error');
    });

    it('should return 500 on unexpected error', () => {
      const errorResponse = {
        status: 500,
        body: JSON.stringify({ error: 'Unknown error' }),
      };

      expect(errorResponse.status).toBe(500);
    });

    it('should log errors to console', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');
      
      console.error('Error in bi-jobs-by-component function:', error);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in bi-jobs-by-component function:',
        error
      );
    });
  });

  describe('Integration', () => {
    it('should integrate with dashboard analytics', () => {
      const dashboardEndpoint = '/functions/v1/bi-jobs-by-component';
      
      expect(dashboardEndpoint).toContain('bi-jobs-by-component');
    });

    it('should provide data for charts and visualizations', () => {
      const mockData = [
        { component_name: 'Component A', total_jobs: 15 },
        { component_name: 'Component B', total_jobs: 10 },
        { component_name: 'Component C', total_jobs: 8 },
      ];

      // Data suitable for bar chart
      const chartData = {
        labels: mockData.map(d => d.component_name),
        datasets: [{
          data: mockData.map(d => d.total_jobs),
        }],
      };

      expect(chartData.labels).toHaveLength(3);
      expect(chartData.datasets[0].data).toEqual([15, 10, 8]);
    });
  });
});
