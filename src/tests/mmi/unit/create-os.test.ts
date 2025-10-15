import { describe, it, expect, beforeEach } from 'vitest';

// Types for Work Orders
interface WorkOrder {
  id?: string;
  job_id: string;
  os_number?: string;
  opened_by: string;
  assigned_to?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  opened_at?: string;
  started_at?: string;
  completed_at?: string;
  parts_used?: Part[];
  labor_hours?: number;
  notes?: string;
}

interface Part {
  name: string;
  quantity: number;
  unit_cost?: number;
}

// Mock Work Order Service
class WorkOrderService {
  private workOrders: WorkOrder[] = [];
  private osCounter = 1;

  createWorkOrder(wo: Omit<WorkOrder, 'id' | 'os_number'>): WorkOrder {
    // Validation
    if (!wo.job_id) {
      throw new Error('Job ID is required');
    }
    if (!wo.opened_by) {
      throw new Error('Opened by user ID is required');
    }

    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(wo.status)) {
      throw new Error('Invalid status');
    }

    // Generate OS number
    const year = new Date().getFullYear();
    const osNumber = `OS-${year}${String(this.osCounter++).padStart(4, '0')}`;

    // Create work order
    const newWO: WorkOrder = {
      ...wo,
      id: `wo-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      os_number: osNumber,
      opened_at: new Date().toISOString(),
    };

    this.workOrders.push(newWO);
    return newWO;
  }

  getWorkOrderById(id: string): WorkOrder | undefined {
    return this.workOrders.find(wo => wo.id === id);
  }

  getWorkOrderByOSNumber(osNumber: string): WorkOrder | undefined {
    return this.workOrders.find(wo => wo.os_number === osNumber);
  }

  updateStatus(id: string, status: WorkOrder['status']): WorkOrder {
    const wo = this.getWorkOrderById(id);
    if (!wo) {
      throw new Error('Work order not found');
    }

    wo.status = status;
    
    if (status === 'in_progress' && !wo.started_at) {
      wo.started_at = new Date().toISOString();
    } else if (status === 'completed' && !wo.completed_at) {
      wo.completed_at = new Date().toISOString();
    }

    return wo;
  }

  addParts(id: string, parts: Part[]): WorkOrder {
    const wo = this.getWorkOrderById(id);
    if (!wo) {
      throw new Error('Work order not found');
    }

    wo.parts_used = [...(wo.parts_used || []), ...parts];
    return wo;
  }

  calculateTotalCost(id: string): number {
    const wo = this.getWorkOrderById(id);
    if (!wo) {
      throw new Error('Work order not found');
    }

    const partsCost = (wo.parts_used || []).reduce((sum, part) => {
      return sum + (part.unit_cost || 0) * part.quantity;
    }, 0);

    const laborCost = (wo.labor_hours || 0) * 50; // $50/hour default rate

    return partsCost + laborCost;
  }

  reset() {
    this.workOrders = [];
    this.osCounter = 1;
  }
}

describe('MMI Unit Tests: Work Order (OS) Creation', () => {
  let service: WorkOrderService;

  beforeEach(() => {
    service = new WorkOrderService();
  });

  describe('Basic Work Order Creation', () => {
    it('should create a work order with required fields', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      expect(wo).toBeDefined();
      expect(wo.id).toBeDefined();
      expect(wo.os_number).toBeDefined();
      expect(wo.job_id).toBe('job-001');
      expect(wo.opened_by).toBe('user-001');
      expect(wo.status).toBe('open');
      expect(wo.opened_at).toBeDefined();
    });

    it('should create work order with optional fields', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        assigned_to: 'tech-001',
        status: 'open',
        labor_hours: 4,
        notes: 'Urgent maintenance required',
      });

      expect(wo.assigned_to).toBe('tech-001');
      expect(wo.labor_hours).toBe(4);
      expect(wo.notes).toBe('Urgent maintenance required');
    });
  });

  describe('OS Number Generation', () => {
    it('should generate unique OS number', () => {
      const wo1 = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const wo2 = service.createWorkOrder({
        job_id: 'job-002',
        opened_by: 'user-001',
        status: 'open',
      });

      expect(wo1.os_number).not.toBe(wo2.os_number);
    });

    it('should generate OS number with year prefix', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const year = new Date().getFullYear();
      expect(wo.os_number).toMatch(new RegExp(`^OS-${year}\\d{4}$`));
    });

    it('should generate sequential OS numbers', () => {
      const wo1 = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const wo2 = service.createWorkOrder({
        job_id: 'job-002',
        opened_by: 'user-001',
        status: 'open',
      });

      const num1 = parseInt(wo1.os_number!.split('-')[1].slice(4));
      const num2 = parseInt(wo2.os_number!.split('-')[1].slice(4));

      expect(num2).toBe(num1 + 1);
    });

    it('should pad OS number with zeros', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const numPart = wo.os_number!.split('-')[1].slice(4);
      expect(numPart.length).toBe(4);
    });
  });

  describe('Validation Tests', () => {
    it('should throw error if job_id is missing', () => {
      expect(() => {
        service.createWorkOrder({
          job_id: '',
          opened_by: 'user-001',
          status: 'open',
        });
      }).toThrow('Job ID is required');
    });

    it('should throw error if opened_by is missing', () => {
      expect(() => {
        service.createWorkOrder({
          job_id: 'job-001',
          opened_by: '',
          status: 'open',
        });
      }).toThrow('Opened by user ID is required');
    });

    it('should throw error for invalid status', () => {
      expect(() => {
        service.createWorkOrder({
          job_id: 'job-001',
          opened_by: 'user-001',
          status: 'invalid' as any,
        });
      }).toThrow('Invalid status');
    });
  });

  describe('Status Management', () => {
    it('should update work order status', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const updated = service.updateStatus(wo.id!, 'in_progress');

      expect(updated.status).toBe('in_progress');
    });

    it('should set started_at when status changes to in_progress', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const updated = service.updateStatus(wo.id!, 'in_progress');

      expect(updated.started_at).toBeDefined();
    });

    it('should set completed_at when status changes to completed', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      service.updateStatus(wo.id!, 'in_progress');
      const completed = service.updateStatus(wo.id!, 'completed');

      expect(completed.completed_at).toBeDefined();
    });

    it('should handle all valid status transitions', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const statuses: Array<WorkOrder['status']> = ['in_progress', 'completed', 'cancelled'];

      statuses.forEach(status => {
        const updated = service.updateStatus(wo.id!, status);
        expect(updated.status).toBe(status);
      });
    });
  });

  describe('Parts Management', () => {
    it('should add parts to work order', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const parts: Part[] = [
        { name: 'Filtro hidráulico', quantity: 2, unit_cost: 50 },
        { name: 'Óleo lubrificante', quantity: 5, unit_cost: 20 },
      ];

      const updated = service.addParts(wo.id!, parts);

      expect(updated.parts_used).toHaveLength(2);
      expect(updated.parts_used![0].name).toBe('Filtro hidráulico');
    });

    it('should append parts to existing parts list', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
        parts_used: [{ name: 'Part A', quantity: 1 }],
      });

      const newParts: Part[] = [{ name: 'Part B', quantity: 2 }];
      const updated = service.addParts(wo.id!, newParts);

      expect(updated.parts_used).toHaveLength(2);
    });

    it('should track part quantities', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const parts: Part[] = [
        { name: 'Parafuso', quantity: 20 },
      ];

      const updated = service.addParts(wo.id!, parts);

      expect(updated.parts_used![0].quantity).toBe(20);
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate total cost from parts', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const parts: Part[] = [
        { name: 'Part A', quantity: 2, unit_cost: 50 },
        { name: 'Part B', quantity: 3, unit_cost: 30 },
      ];

      service.addParts(wo.id!, parts);
      const total = service.calculateTotalCost(wo.id!);

      // 2*50 + 3*30 = 100 + 90 = 190
      expect(total).toBe(190);
    });

    it('should calculate labor cost', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
        labor_hours: 4,
      });

      const total = service.calculateTotalCost(wo.id!);

      // 4 hours * $50/hour = $200
      expect(total).toBe(200);
    });

    it('should calculate combined parts and labor cost', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
        labor_hours: 4,
      });

      const parts: Part[] = [
        { name: 'Part A', quantity: 1, unit_cost: 100 },
      ];

      service.addParts(wo.id!, parts);
      const total = service.calculateTotalCost(wo.id!);

      // 100 (parts) + 200 (labor) = 300
      expect(total).toBe(300);
    });
  });

  describe('Lookup Operations', () => {
    it('should find work order by ID', () => {
      const created = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const found = service.getWorkOrderById(created.id!);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should find work order by OS number', () => {
      const created = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      const found = service.getWorkOrderByOSNumber(created.os_number!);

      expect(found).toBeDefined();
      expect(found?.os_number).toBe(created.os_number);
    });

    it('should return undefined for non-existent work order', () => {
      const found = service.getWorkOrderById('non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('Job Relationship', () => {
    it('should link work order to job', () => {
      const jobId = 'job-hydraulic-001';

      const wo = service.createWorkOrder({
        job_id: jobId,
        opened_by: 'user-001',
        status: 'open',
      });

      expect(wo.job_id).toBe(jobId);
    });

    it('should allow multiple work orders for same job', () => {
      const jobId = 'job-001';

      const wo1 = service.createWorkOrder({
        job_id: jobId,
        opened_by: 'user-001',
        status: 'open',
      });

      const wo2 = service.createWorkOrder({
        job_id: jobId,
        opened_by: 'user-002',
        status: 'open',
      });

      expect(wo1.job_id).toBe(jobId);
      expect(wo2.job_id).toBe(jobId);
      expect(wo1.os_number).not.toBe(wo2.os_number);
    });
  });

  describe('Assignment', () => {
    it('should assign work order to technician', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        assigned_to: 'tech-001',
        status: 'open',
      });

      expect(wo.assigned_to).toBe('tech-001');
    });

    it('should allow work order without assignment', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      expect(wo.assigned_to).toBeUndefined();
    });
  });

  describe('Notes and Documentation', () => {
    it('should store notes', () => {
      const notes = 'Componente mostrou sinais de desgaste prematuro';

      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
        notes,
      });

      expect(wo.notes).toBe(notes);
    });

    it('should allow empty notes', () => {
      const wo = service.createWorkOrder({
        job_id: 'job-001',
        opened_by: 'user-001',
        status: 'open',
      });

      expect(wo.notes).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error when updating non-existent work order', () => {
      expect(() => {
        service.updateStatus('non-existent', 'in_progress');
      }).toThrow('Work order not found');
    });

    it('should throw error when adding parts to non-existent work order', () => {
      expect(() => {
        service.addParts('non-existent', [{ name: 'Part', quantity: 1 }]);
      }).toThrow('Work order not found');
    });

    it('should throw error when calculating cost for non-existent work order', () => {
      expect(() => {
        service.calculateTotalCost('non-existent');
      }).toThrow('Work order not found');
    });
  });
});
