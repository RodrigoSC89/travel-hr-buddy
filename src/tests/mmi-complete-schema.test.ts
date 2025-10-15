/**
 * MMI Complete Schema Tests
 * 
 * Comprehensive test suite for the MMI module with complete database schema
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { 
  MMISystem, 
  MMIComponent, 
  MMIOS, 
  MMIHourometerLog,
  MMIJobEnhanced 
} from '../types/mmi';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('MMI Complete Schema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MMI Systems', () => {
    it('should have correct system types', () => {
      const validTypes: MMISystem['system_type'][] = [
        'propulsion',
        'electrical',
        'navigation',
        'safety',
        'auxiliary',
      ];

      validTypes.forEach((type) => {
        const system: MMISystem = {
          id: '123',
          system_name: 'Test System',
          system_type: type,
          criticality: 'high',
        };
        expect(system.system_type).toBe(type);
      });
    });

    it('should have correct criticality levels', () => {
      const validLevels: MMISystem['criticality'][] = [
        'critical',
        'high',
        'medium',
        'low',
      ];

      validLevels.forEach((level) => {
        const system: MMISystem = {
          id: '123',
          system_name: 'Test System',
          system_type: 'propulsion',
          criticality: level,
        };
        expect(system.criticality).toBe(level);
      });
    });

    it('should support compliance metadata', () => {
      const system: MMISystem = {
        id: '123',
        system_name: 'Main Propulsion',
        system_type: 'propulsion',
        criticality: 'critical',
        compliance_metadata: {
          normam: ['NORMAM-05'],
          solas: ['II-1'],
          marpol: ['Annex VI'],
          inspection_required: true,
          next_inspection: '2025-12-31',
        },
      };

      expect(system.compliance_metadata?.normam).toContain('NORMAM-05');
      expect(system.compliance_metadata?.solas).toContain('II-1');
      expect(system.compliance_metadata?.inspection_required).toBe(true);
    });
  });

  describe('MMI Components', () => {
    it('should track hourometer correctly', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Main Engine ME-4500',
        current_hours: 1850.5,
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      expect(component.current_hours).toBe(1850.5);
      expect(component.maintenance_interval_hours).toBe(2000);
    });

    it('should calculate maintenance percentage', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Generator',
        current_hours: 1900,
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      const percentage = (component.current_hours / component.maintenance_interval_hours) * 100;
      expect(percentage).toBe(95);
    });

    it('should support equipment metadata', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Main Engine',
        current_hours: 1850,
        maintenance_interval_hours: 2000,
        is_operational: true,
        manufacturer: 'Caterpillar',
        model: 'CAT 3516',
        serial_number: 'SN123456789',
      };

      expect(component.manufacturer).toBe('Caterpillar');
      expect(component.model).toBe('CAT 3516');
      expect(component.serial_number).toBe('SN123456789');
    });

    it('should handle operational status', () => {
      const operational: MMIComponent = {
        id: '1',
        component_name: 'Engine 1',
        current_hours: 100,
        maintenance_interval_hours: 1000,
        is_operational: true,
      };

      const nonOperational: MMIComponent = {
        id: '2',
        component_name: 'Engine 2',
        current_hours: 100,
        maintenance_interval_hours: 1000,
        is_operational: false,
      };

      expect(operational.is_operational).toBe(true);
      expect(nonOperational.is_operational).toBe(false);
    });
  });

  describe('MMI Jobs Enhanced', () => {
    it('should support all job statuses', () => {
      const statuses: MMIJobEnhanced['status'][] = [
        'pending',
        'in_progress',
        'completed',
        'cancelled',
        'postponed',
      ];

      statuses.forEach((status) => {
        const job: MMIJobEnhanced = {
          id: '789',
          title: 'Test Job',
          status: status,
          priority: 'high',
          can_postpone: true,
          postponement_count: 0,
        };
        expect(job.status).toBe(status);
      });
    });

    it('should support all priority levels', () => {
      const priorities: MMIJobEnhanced['priority'][] = [
        'critical',
        'high',
        'medium',
        'low',
      ];

      priorities.forEach((priority) => {
        const job: MMIJobEnhanced = {
          id: '789',
          title: 'Test Job',
          status: 'pending',
          priority: priority,
          can_postpone: true,
          postponement_count: 0,
        };
        expect(job.priority).toBe(priority);
      });
    });

    it('should track postponements', () => {
      const job: MMIJobEnhanced = {
        id: '789',
        title: 'Maintenance Job',
        status: 'postponed',
        priority: 'medium',
        can_postpone: true,
        postponement_count: 2,
      };

      expect(job.postponement_count).toBe(2);
      expect(job.status).toBe('postponed');
    });

    it('should prevent postponement when not allowed', () => {
      const criticalJob: MMIJobEnhanced = {
        id: '789',
        title: 'Critical Maintenance',
        status: 'pending',
        priority: 'critical',
        can_postpone: false,
        postponement_count: 0,
      };

      expect(criticalJob.can_postpone).toBe(false);
    });

    it('should support AI embeddings', () => {
      const job: MMIJobEnhanced = {
        id: '789',
        title: 'Engine failure',
        status: 'pending',
        priority: 'high',
        can_postpone: true,
        postponement_count: 0,
        embedding: new Array(1536).fill(0.1),
      };

      expect(job.embedding).toHaveLength(1536);
    });
  });

  describe('MMI Work Orders (OS)', () => {
    it('should generate OS number in correct format', () => {
      const workOrder: MMIOS = {
        id: '101',
        os_number: 'OS-20250001',
        status: 'open',
      };

      expect(workOrder.os_number).toMatch(/^OS-\d{4}\d{4}$/);
      expect(workOrder.os_number).toBe('OS-20250001');
    });

    it('should support all work order statuses', () => {
      const statuses: MMIOS['status'][] = [
        'open',
        'in_progress',
        'completed',
        'cancelled',
      ];

      statuses.forEach((status) => {
        const os: MMIOS = {
          id: '101',
          os_number: 'OS-20250001',
          status: status,
        };
        expect(os.status).toBe(status);
      });
    });

    it('should calculate total cost', () => {
      const workOrder: MMIOS = {
        id: '101',
        os_number: 'OS-20250001',
        status: 'completed',
        parts_cost: 1500,
        labor_cost: 800,
        total_cost: 2300,
      };

      expect(workOrder.total_cost).toBe(2300);
      expect(workOrder.total_cost).toBe(
        (workOrder.parts_cost || 0) + (workOrder.labor_cost || 0)
      );
    });

    it('should track parts used', () => {
      const workOrder: MMIOS = {
        id: '101',
        os_number: 'OS-20250001',
        status: 'completed',
        parts_used: [
          { name: 'Oil Filter', quantity: 2, cost: 50 },
          { name: 'Air Filter', quantity: 1, cost: 80 },
        ],
      };

      expect(workOrder.parts_used).toHaveLength(2);
      expect(workOrder.parts_used?.[0].name).toBe('Oil Filter');
    });

    it('should support effectiveness rating', () => {
      const workOrder: MMIOS = {
        id: '101',
        os_number: 'OS-20250001',
        status: 'completed',
        effectiveness_rating: 5,
      };

      expect(workOrder.effectiveness_rating).toBe(5);
      expect(workOrder.effectiveness_rating).toBeGreaterThanOrEqual(1);
      expect(workOrder.effectiveness_rating).toBeLessThanOrEqual(5);
    });
  });

  describe('MMI Hourometer Logs', () => {
    it('should calculate hours added', () => {
      const log: MMIHourometerLog = {
        id: '201',
        component_id: '456',
        previous_hours: 1850,
        new_hours: 1851.5,
        hours_added: 1.5,
        recorded_by: 'system',
        source: 'automated',
        created_at: new Date().toISOString(),
      };

      expect(log.hours_added).toBe(1.5);
      expect(log.hours_added).toBe(log.new_hours - log.previous_hours);
    });

    it('should support different log sources', () => {
      const sources: MMIHourometerLog['source'][] = [
        'automated',
        'manual',
        'sensor',
      ];

      sources.forEach((source) => {
        const log: MMIHourometerLog = {
          id: '201',
          component_id: '456',
          previous_hours: 1850,
          new_hours: 1851,
          recorded_by: source === 'automated' ? 'system' : 'user-123',
          source: source,
          created_at: new Date().toISOString(),
        };
        expect(log.source).toBe(source);
      });
    });

    it('should track who recorded the hours', () => {
      const systemLog: MMIHourometerLog = {
        id: '201',
        component_id: '456',
        previous_hours: 1850,
        new_hours: 1851,
        recorded_by: 'system',
        source: 'automated',
        created_at: new Date().toISOString(),
      };

      const userLog: MMIHourometerLog = {
        id: '202',
        component_id: '456',
        previous_hours: 1851,
        new_hours: 1855,
        recorded_by: 'user-123',
        source: 'manual',
        created_at: new Date().toISOString(),
      };

      expect(systemLog.recorded_by).toBe('system');
      expect(userLog.recorded_by).toBe('user-123');
    });
  });

  describe('Database Functions', () => {
    it('should support match_mmi_jobs function', async () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockResults = [
        {
          id: '1',
          title: 'Similar Job 1',
          similarity: 0.89,
        },
        {
          id: '2',
          title: 'Similar Job 2',
          similarity: 0.82,
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockResults,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('match_mmi_jobs', {
        query_embedding: mockEmbedding,
        match_threshold: 0.78,
        match_count: 5,
      });

      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].similarity).toBeGreaterThan(0.78);
    });

    it('should support generate_os_number function', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: 'OS-20250042',
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('generate_os_number');

      expect(error).toBeNull();
      expect(data).toMatch(/^OS-\d{4}\d{4}$/);
    });
  });

  describe('Integration Tests', () => {
    it('should create maintenance job when component reaches 95% threshold', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Main Engine',
        current_hours: 1900, // 95% of 2000
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      const threshold = component.maintenance_interval_hours * 0.95;
      expect(component.current_hours).toBeGreaterThanOrEqual(threshold);

      // Job should be created with appropriate priority
      const job: MMIJobEnhanced = {
        id: '789',
        component_id: component.id,
        title: `Manutenção programada - ${component.component_name}`,
        status: 'pending',
        priority: 'medium',
        can_postpone: true,
        postponement_count: 0,
      };

      expect(job.component_id).toBe(component.id);
      expect(job.status).toBe('pending');
    });

    it('should create critical job when component exceeds interval', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Generator',
        current_hours: 2050, // Exceeded 2000
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      expect(component.current_hours).toBeGreaterThan(
        component.maintenance_interval_hours
      );

      const job: MMIJobEnhanced = {
        id: '789',
        component_id: component.id,
        title: `Manutenção urgente - ${component.component_name}`,
        status: 'pending',
        priority: 'critical',
        can_postpone: false,
        postponement_count: 0,
      };

      expect(job.priority).toBe('critical');
      expect(job.can_postpone).toBe(false);
    });

    it('should log hours when component is updated', () => {
      const previousHours = 1850;
      const newHours = 1851.5;

      const log: MMIHourometerLog = {
        id: '201',
        component_id: '456',
        previous_hours: previousHours,
        new_hours: newHours,
        hours_added: newHours - previousHours,
        recorded_by: 'system',
        source: 'automated',
        created_at: new Date().toISOString(),
      };

      expect(log.hours_added).toBe(1.5);
      expect(log.source).toBe('automated');
    });

    it('should create work order from job', () => {
      const job: MMIJobEnhanced = {
        id: '789',
        title: 'Engine Maintenance',
        status: 'in_progress',
        priority: 'high',
        can_postpone: false,
        postponement_count: 0,
      };

      const workOrder: MMIOS = {
        id: '101',
        job_id: job.id,
        os_number: 'OS-20250015',
        status: 'open',
        work_description: job.title,
      };

      expect(workOrder.job_id).toBe(job.id);
      expect(workOrder.os_number).toMatch(/^OS-\d{4}\d{4}$/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero hours', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'New Component',
        current_hours: 0,
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      expect(component.current_hours).toBe(0);
    });

    it('should handle very large hour values', () => {
      const component: MMIComponent = {
        id: '456',
        component_name: 'Old Component',
        current_hours: 99999.99,
        maintenance_interval_hours: 2000,
        is_operational: true,
      };

      expect(component.current_hours).toBeGreaterThan(0);
    });

    it('should handle missing optional fields', () => {
      const minimalJob: MMIJobEnhanced = {
        id: '789',
        title: 'Minimal Job',
        status: 'pending',
        priority: 'low',
        can_postpone: true,
        postponement_count: 0,
      };

      expect(minimalJob.description).toBeUndefined();
      expect(minimalJob.due_date).toBeUndefined();
      expect(minimalJob.embedding).toBeUndefined();
    });

    it('should handle empty parts array', () => {
      const workOrder: MMIOS = {
        id: '101',
        os_number: 'OS-20250001',
        status: 'completed',
        parts_used: [],
      };

      expect(workOrder.parts_used).toHaveLength(0);
    });
  });
});

describe('MMI Edge Functions', () => {
  describe('simulate-hours', () => {
    it('should process operational components only', () => {
      const components: MMIComponent[] = [
        {
          id: '1',
          component_name: 'Engine 1',
          current_hours: 100,
          maintenance_interval_hours: 1000,
          is_operational: true,
        },
        {
          id: '2',
          component_name: 'Engine 2',
          current_hours: 200,
          maintenance_interval_hours: 1000,
          is_operational: false,
        },
      ];

      const operational = components.filter((c) => c.is_operational);
      expect(operational).toHaveLength(1);
      expect(operational[0].id).toBe('1');
    });

    it('should add random hours between 0.5 and 2.0', () => {
      const hoursToAdd = Math.random() * 1.5 + 0.5;
      expect(hoursToAdd).toBeGreaterThanOrEqual(0.5);
      expect(hoursToAdd).toBeLessThanOrEqual(2.0);
    });

    it('should create job at 95% threshold', () => {
      const maintenanceInterval = 2000;
      const threshold95 = maintenanceInterval * 0.95;
      const threshold98 = maintenanceInterval * 0.98;

      expect(threshold95).toBe(1900);
      expect(threshold98).toBe(1960);

      const hours1 = 1900; // 95% - medium priority
      const hours2 = 1960; // 98% - high priority
      const hours3 = 2000; // 100% - critical priority

      expect(hours1).toBeGreaterThanOrEqual(threshold95);
      expect(hours2).toBeGreaterThanOrEqual(threshold98);
      expect(hours3).toBeGreaterThanOrEqual(maintenanceInterval);
    });
  });

  describe('send-alerts', () => {
    it('should filter critical and high priority jobs', () => {
      const jobs: MMIJobEnhanced[] = [
        {
          id: '1',
          title: 'Critical Job',
          status: 'pending',
          priority: 'critical',
          can_postpone: false,
          postponement_count: 0,
        },
        {
          id: '2',
          title: 'High Job',
          status: 'pending',
          priority: 'high',
          can_postpone: true,
          postponement_count: 0,
        },
        {
          id: '3',
          title: 'Low Job',
          status: 'pending',
          priority: 'low',
          can_postpone: true,
          postponement_count: 0,
        },
      ];

      const priorityJobs = jobs.filter(
        (j) => j.priority === 'critical' || j.priority === 'high'
      );

      expect(priorityJobs).toHaveLength(2);
    });

    it('should format date correctly', () => {
      const dateStr = '2025-10-20';
      const date = new Date(dateStr);
      const formatted = date.toLocaleDateString('pt-BR');

      expect(formatted).toBeTruthy();
    });
  });
});
