import { describe, it, expect, beforeEach } from 'vitest';

// Types for MMI Jobs
interface MMIJob {
  id?: string;
  component_id: string;
  title: string;
  description?: string;
  job_type: 'preventive' | 'corrective' | 'predictive' | 'inspection';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  due_date: string;
  estimated_hours?: number;
  assigned_to?: string;
  created_by?: string;
  can_postpone?: boolean;
  suggestion_ia?: string;
}

// Mock job creation service
class JobService {
  private jobs: MMIJob[] = [];

  createJob(job: Omit<MMIJob, 'id'>): MMIJob {
    // Validation
    if (!job.title || job.title.trim().length === 0) {
      throw new Error('Job title is required');
    }
    if (!job.component_id) {
      throw new Error('Component ID is required');
    }
    if (!job.due_date) {
      throw new Error('Due date is required');
    }

    // Validate enums
    const validJobTypes = ['preventive', 'corrective', 'predictive', 'inspection'];
    if (!validJobTypes.includes(job.job_type)) {
      throw new Error(`Invalid job_type. Must be one of: ${validJobTypes.join(', ')}`);
    }

    const validPriorities = ['critical', 'high', 'medium', 'low'];
    if (!validPriorities.includes(job.priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }

    const validStatuses = ['pending', 'scheduled', 'in_progress', 'completed', 'postponed', 'cancelled'];
    if (!validStatuses.includes(job.status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate date
    const dueDate = new Date(job.due_date);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due_date format');
    }

    // Create job with ID
    const newJob: MMIJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    };

    this.jobs.push(newJob);
    return newJob;
  }

  getJobs(): MMIJob[] {
    return this.jobs;
  }

  getJobById(id: string): MMIJob | undefined {
    return this.jobs.find(job => job.id === id);
  }

  reset() {
    this.jobs = [];
  }
}

describe('MMI Unit Tests: Job Creation', () => {
  let jobService: JobService;

  beforeEach(() => {
    jobService = new JobService();
  });

  describe('Basic Job Creation', () => {
    it('should create a job with all required fields', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Troca de filtro hidráulico',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });

      expect(job).toBeDefined();
      expect(job.id).toBeDefined();
      expect(job.title).toBe('Troca de filtro hidráulico');
      expect(job.component_id).toBe('comp-001');
      expect(job.job_type).toBe('preventive');
      expect(job.priority).toBe('high');
      expect(job.status).toBe('pending');
    });

    it('should create a job with optional fields', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Inspeção de segurança',
        description: 'Inspeção trimestral do sistema',
        job_type: 'inspection',
        priority: 'medium',
        status: 'pending',
        due_date: '2025-12-01T08:00:00Z',
        estimated_hours: 4,
        can_postpone: true,
        suggestion_ia: 'Recomenda-se realizar durante próxima parada programada',
      });

      expect(job.description).toBe('Inspeção trimestral do sistema');
      expect(job.estimated_hours).toBe(4);
      expect(job.can_postpone).toBe(true);
      expect(job.suggestion_ia).toBeDefined();
    });

    it('should assign unique IDs to different jobs', () => {
      const job1 = jobService.createJob({
        component_id: 'comp-001',
        title: 'Job 1',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });

      const job2 = jobService.createJob({
        component_id: 'comp-002',
        title: 'Job 2',
        job_type: 'corrective',
        priority: 'critical',
        status: 'pending',
        due_date: '2025-11-16T10:00:00Z',
      });

      expect(job1.id).not.toBe(job2.id);
    });
  });

  describe('Validation Tests', () => {
    it('should throw error if title is missing', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: '',
          job_type: 'preventive',
          priority: 'high',
          status: 'pending',
          due_date: '2025-11-15T10:00:00Z',
        });
      }).toThrow('Job title is required');
    });

    it('should throw error if component_id is missing', () => {
      expect(() => {
        jobService.createJob({
          component_id: '',
          title: 'Test Job',
          job_type: 'preventive',
          priority: 'high',
          status: 'pending',
          due_date: '2025-11-15T10:00:00Z',
        });
      }).toThrow('Component ID is required');
    });

    it('should throw error if due_date is missing', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: 'Test Job',
          job_type: 'preventive',
          priority: 'high',
          status: 'pending',
          due_date: '',
        });
      }).toThrow('Due date is required');
    });

    it('should throw error for invalid job_type', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: 'Test Job',
          job_type: 'invalid' as any,
          priority: 'high',
          status: 'pending',
          due_date: '2025-11-15T10:00:00Z',
        });
      }).toThrow('Invalid job_type');
    });

    it('should throw error for invalid priority', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: 'Test Job',
          job_type: 'preventive',
          priority: 'urgent' as any,
          status: 'pending',
          due_date: '2025-11-15T10:00:00Z',
        });
      }).toThrow('Invalid priority');
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: 'Test Job',
          job_type: 'preventive',
          priority: 'high',
          status: 'finished' as any,
          due_date: '2025-11-15T10:00:00Z',
        });
      }).toThrow('Invalid status');
    });

    it('should throw error for invalid date format', () => {
      expect(() => {
        jobService.createJob({
          component_id: 'comp-001',
          title: 'Test Job',
          job_type: 'preventive',
          priority: 'high',
          status: 'pending',
          due_date: 'not-a-date',
        });
      }).toThrow('Invalid due_date format');
    });
  });

  describe('Job Type Tests', () => {
    it('should accept preventive job type', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Preventive Maintenance',
        job_type: 'preventive',
        priority: 'medium',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });
      expect(job.job_type).toBe('preventive');
    });

    it('should accept corrective job type', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Corrective Maintenance',
        job_type: 'corrective',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });
      expect(job.job_type).toBe('corrective');
    });

    it('should accept predictive job type', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Predictive Maintenance',
        job_type: 'predictive',
        priority: 'medium',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });
      expect(job.job_type).toBe('predictive');
    });

    it('should accept inspection job type', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Safety Inspection',
        job_type: 'inspection',
        priority: 'low',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });
      expect(job.job_type).toBe('inspection');
    });
  });

  describe('Priority Tests', () => {
    it('should handle all priority levels', () => {
      const priorities: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
      
      priorities.forEach(priority => {
        const job = jobService.createJob({
          component_id: 'comp-001',
          title: `${priority} priority job`,
          job_type: 'preventive',
          priority: priority,
          status: 'pending',
          due_date: '2025-11-15T10:00:00Z',
        });
        expect(job.priority).toBe(priority);
      });
    });
  });

  describe('Date Handling Tests', () => {
    it('should accept ISO 8601 date format', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Test Job',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });
      expect(job.due_date).toBe('2025-11-15T10:00:00Z');
    });

    it('should accept date with timezone', () => {
      const job = jobService.createJob({
        component_id: 'comp-001',
        title: 'Test Job',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00-03:00',
      });
      expect(new Date(job.due_date)).toBeInstanceOf(Date);
    });
  });

  describe('Component Relationship Tests', () => {
    it('should link job to component', () => {
      const componentId = 'comp-hydraulic-001';
      const job = jobService.createJob({
        component_id: componentId,
        title: 'Hydraulic System Maintenance',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });

      expect(job.component_id).toBe(componentId);
    });

    it('should allow multiple jobs for same component', () => {
      const componentId = 'comp-001';
      
      const job1 = jobService.createJob({
        component_id: componentId,
        title: 'Job 1',
        job_type: 'preventive',
        priority: 'high',
        status: 'pending',
        due_date: '2025-11-15T10:00:00Z',
      });

      const job2 = jobService.createJob({
        component_id: componentId,
        title: 'Job 2',
        job_type: 'corrective',
        priority: 'medium',
        status: 'pending',
        due_date: '2025-11-20T10:00:00Z',
      });

      expect(job1.component_id).toBe(componentId);
      expect(job2.component_id).toBe(componentId);
      expect(job1.id).not.toBe(job2.id);
    });
  });
});
