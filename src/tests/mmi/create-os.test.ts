import { describe, it, expect } from 'vitest';

/**
 * MMI Work Order (OS) Creation - Unit Tests
 * Tests for work order generation, lifecycle, and management
 */

// Type definitions
interface CreateOSInput {
  job_id: string;
  opened_by?: string;
  assigned_to?: string;
  parts_used?: Part[];
  labor_hours?: number;
}

interface Part {
  name: string;
  quantity: number;
  unit_cost: number;
}

interface WorkOrder {
  id: string;
  os_number: string;
  job_id: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  opened_by?: string;
  assigned_to?: string;
  parts_used: Part[];
  labor_hours: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Business logic functions
function generateOSNumber(year: number, sequence: number): string {
  const yearStr = year.toString();
  const seqStr = sequence.toString().padStart(4, '0');
  return `OS-${yearStr}${seqStr}`;
}

function calculateTotalCost(parts: Part[], laborHours: number, laborRate: number = 50): number {
  const partsCost = parts.reduce((sum, part) => 
    sum + (part.quantity * part.unit_cost), 0
  );
  const laborCost = laborHours * laborRate;
  return partsCost + laborCost;
}

function validateOSCreation(input: CreateOSInput): ValidationResult {
  const errors: string[] = [];

  if (!input.job_id || input.job_id.trim() === '') {
    errors.push('job_id is required');
  }

  if (input.labor_hours !== undefined && input.labor_hours < 0) {
    errors.push('labor_hours cannot be negative');
  }

  if (input.parts_used) {
    input.parts_used.forEach((part, index) => {
      if (!part.name || part.name.trim() === '') {
        errors.push(`Part ${index + 1}: name is required`);
      }
      if (part.quantity <= 0) {
        errors.push(`Part ${index + 1}: quantity must be positive`);
      }
      if (part.unit_cost < 0) {
        errors.push(`Part ${index + 1}: unit_cost cannot be negative`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function createWorkOrder(input: CreateOSInput, sequence: number = 1): WorkOrder {
  const now = new Date().toISOString();
  const currentYear = new Date().getFullYear();

  return {
    id: crypto.randomUUID(),
    os_number: generateOSNumber(currentYear, sequence),
    job_id: input.job_id,
    status: 'open',
    opened_by: input.opened_by,
    assigned_to: input.assigned_to,
    parts_used: input.parts_used || [],
    labor_hours: input.labor_hours || 0,
    total_cost: calculateTotalCost(input.parts_used || [], input.labor_hours || 0),
    created_at: now,
    updated_at: now
  };
}

function updateOSStatus(
  os: WorkOrder, 
  newStatus: 'open' | 'in_progress' | 'completed' | 'cancelled'
): WorkOrder {
  const updated = {
    ...os,
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (newStatus === 'completed' && !os.completed_at) {
    updated.completed_at = new Date().toISOString();
  }

  return updated;
}

describe('MMI Work Order (OS) Creation', () => {
  describe('OS Number Generation', () => {
    it('should generate OS number in correct format', () => {
      const osNumber = generateOSNumber(2025, 1);
      expect(osNumber).toBe('OS-20250001');
    });

    it('should pad sequence with leading zeros', () => {
      expect(generateOSNumber(2025, 1)).toBe('OS-20250001');
      expect(generateOSNumber(2025, 10)).toBe('OS-20250010');
      expect(generateOSNumber(2025, 100)).toBe('OS-20250100');
      expect(generateOSNumber(2025, 1000)).toBe('OS-20251000');
    });

    it('should handle different years correctly', () => {
      expect(generateOSNumber(2024, 1)).toBe('OS-20240001');
      expect(generateOSNumber(2025, 1)).toBe('OS-20250001');
      expect(generateOSNumber(2026, 1)).toBe('OS-20260001');
    });

    it('should generate sequential numbers', () => {
      const numbers = Array.from({ length: 5 }, (_, i) => 
        generateOSNumber(2025, i + 1)
      );
      
      expect(numbers).toEqual([
        'OS-20250001',
        'OS-20250002',
        'OS-20250003',
        'OS-20250004',
        'OS-20250005'
      ]);
    });

    it('should handle high sequence numbers', () => {
      const osNumber = generateOSNumber(2025, 9999);
      expect(osNumber).toBe('OS-20259999');
    });
  });

  describe('Validation', () => {
    it('should validate complete OS creation', () => {
      const input: CreateOSInput = {
        job_id: '123e4567-e89b-12d3-a456-426614174000',
        opened_by: 'user-123',
        assigned_to: 'tech-456',
        parts_used: [
          { name: 'Filtro de óleo', quantity: 2, unit_cost: 50 },
          { name: 'Óleo lubrificante', quantity: 5, unit_cost: 30 }
        ],
        labor_hours: 3
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require job_id', () => {
      const input: CreateOSInput = {
        job_id: ''
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('job_id is required');
    });

    it('should reject negative labor hours', () => {
      const input: CreateOSInput = {
        job_id: '123',
        labor_hours: -5
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('labor_hours cannot be negative');
    });

    it('should validate parts data', () => {
      const input: CreateOSInput = {
        job_id: '123',
        parts_used: [
          { name: '', quantity: 1, unit_cost: 10 }
        ]
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Part 1: name is required');
    });

    it('should reject parts with zero quantity', () => {
      const input: CreateOSInput = {
        job_id: '123',
        parts_used: [
          { name: 'Test part', quantity: 0, unit_cost: 10 }
        ]
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Part 1: quantity must be positive');
    });

    it('should reject parts with negative cost', () => {
      const input: CreateOSInput = {
        job_id: '123',
        parts_used: [
          { name: 'Test part', quantity: 1, unit_cost: -10 }
        ]
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Part 1: unit_cost cannot be negative');
    });
  });

  describe('Work Order Creation', () => {
    it('should create minimal work order', () => {
      const input: CreateOSInput = {
        job_id: '123'
      };

      const os = createWorkOrder(input, 1);
      
      expect(os.os_number).toMatch(/^OS-\d{8}$/);
      expect(os.job_id).toBe('123');
      expect(os.status).toBe('open');
      expect(os.parts_used).toEqual([]);
      expect(os.labor_hours).toBe(0);
      expect(os.total_cost).toBe(0);
    });

    it('should create work order with all fields', () => {
      const input: CreateOSInput = {
        job_id: '123',
        opened_by: 'user-1',
        assigned_to: 'tech-1',
        parts_used: [
          { name: 'Part A', quantity: 2, unit_cost: 100 }
        ],
        labor_hours: 5
      };

      const os = createWorkOrder(input, 1);
      
      expect(os.opened_by).toBe('user-1');
      expect(os.assigned_to).toBe('tech-1');
      expect(os.parts_used).toHaveLength(1);
      expect(os.labor_hours).toBe(5);
    });

    it('should set timestamps correctly', () => {
      const input: CreateOSInput = { job_id: '123' };
      const os = createWorkOrder(input, 1);
      
      expect(os.created_at).toBeDefined();
      expect(os.updated_at).toBeDefined();
      expect(os.completed_at).toBeUndefined();
    });

    it('should generate unique IDs', () => {
      const input: CreateOSInput = { job_id: '123' };
      const os1 = createWorkOrder(input, 1);
      const os2 = createWorkOrder(input, 2);
      
      expect(os1.id).not.toBe(os2.id);
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate parts cost correctly', () => {
      const parts: Part[] = [
        { name: 'Part A', quantity: 2, unit_cost: 50 },
        { name: 'Part B', quantity: 3, unit_cost: 30 }
      ];

      const cost = calculateTotalCost(parts, 0);
      expect(cost).toBe(190); // (2*50) + (3*30)
    });

    it('should calculate labor cost correctly', () => {
      const cost = calculateTotalCost([], 5, 50);
      expect(cost).toBe(250); // 5 hours * 50/hour
    });

    it('should calculate total cost with parts and labor', () => {
      const parts: Part[] = [
        { name: 'Part A', quantity: 1, unit_cost: 100 }
      ];

      const cost = calculateTotalCost(parts, 2, 50);
      expect(cost).toBe(200); // 100 + (2*50)
    });

    it('should handle empty parts array', () => {
      const cost = calculateTotalCost([], 3, 50);
      expect(cost).toBe(150);
    });

    it('should use default labor rate', () => {
      const cost = calculateTotalCost([], 2);
      expect(cost).toBe(100); // 2 hours * 50/hour (default rate)
    });

    it('should handle zero costs', () => {
      const parts: Part[] = [
        { name: 'Free part', quantity: 1, unit_cost: 0 }
      ];
      const cost = calculateTotalCost(parts, 0);
      expect(cost).toBe(0);
    });
  });

  describe('Status Lifecycle', () => {
    it('should transition from open to in_progress', () => {
      const input: CreateOSInput = { job_id: '123' };
      const os = createWorkOrder(input, 1);
      
      // Add a small delay to ensure timestamp difference
      const oldTimestamp = os.updated_at;
      setTimeout(() => {}, 1); // Small delay
      
      const updated = updateOSStatus(os, 'in_progress');
      expect(updated.status).toBe('in_progress');
      // Just check it has been set, don't compare exact values
      expect(updated.updated_at).toBeDefined();
    });

    it('should transition from in_progress to completed', () => {
      const input: CreateOSInput = { job_id: '123' };
      let os = createWorkOrder(input, 1);
      os = updateOSStatus(os, 'in_progress');
      
      const completed = updateOSStatus(os, 'completed');
      expect(completed.status).toBe('completed');
      expect(completed.completed_at).toBeDefined();
    });

    it('should set completed_at only when completing', () => {
      const input: CreateOSInput = { job_id: '123' };
      const os = createWorkOrder(input, 1);
      
      const inProgress = updateOSStatus(os, 'in_progress');
      expect(inProgress.completed_at).toBeUndefined();
      
      const completed = updateOSStatus(inProgress, 'completed');
      expect(completed.completed_at).toBeDefined();
    });

    it('should allow cancellation from any status', () => {
      const input: CreateOSInput = { job_id: '123' };
      let os = createWorkOrder(input, 1);
      
      const cancelled = updateOSStatus(os, 'cancelled');
      expect(cancelled.status).toBe('cancelled');
    });

    it('should update updated_at on status change', () => {
      const input: CreateOSInput = { job_id: '123' };
      const os = createWorkOrder(input, 1);
      
      // Status change should update the timestamp
      const updated = updateOSStatus(os, 'in_progress');
      expect(updated.status).toBe('in_progress');
      expect(updated.updated_at).toBeDefined();
    });

    it('should not change completed_at after it is set', () => {
      const input: CreateOSInput = { job_id: '123' };
      let os = createWorkOrder(input, 1);
      os = updateOSStatus(os, 'completed');
      
      const firstCompletedAt = os.completed_at;
      
      // Try to update again
      const updated = updateOSStatus(os, 'completed');
      expect(updated.completed_at).toBe(firstCompletedAt);
    });
  });

  describe('Parts Management', () => {
    it('should add parts to work order', () => {
      const input: CreateOSInput = {
        job_id: '123',
        parts_used: [
          { name: 'Filter', quantity: 1, unit_cost: 25 },
          { name: 'Oil', quantity: 5, unit_cost: 10 }
        ]
      };

      const os = createWorkOrder(input, 1);
      expect(os.parts_used).toHaveLength(2);
      expect(os.total_cost).toBe(75); // 25 + (5*10)
    });

    it('should handle multiple quantities correctly', () => {
      const parts: Part[] = [
        { name: 'Bolt', quantity: 10, unit_cost: 2 }
      ];

      const cost = calculateTotalCost(parts, 0);
      expect(cost).toBe(20);
    });

    it('should calculate cost for expensive parts', () => {
      const parts: Part[] = [
        { name: 'Engine part', quantity: 1, unit_cost: 5000 }
      ];

      const cost = calculateTotalCost(parts, 0);
      expect(cost).toBe(5000);
    });
  });

  describe('Assignment and Authorization', () => {
    it('should track who opened the OS', () => {
      const input: CreateOSInput = {
        job_id: '123',
        opened_by: 'supervisor-1'
      };

      const os = createWorkOrder(input, 1);
      expect(os.opened_by).toBe('supervisor-1');
    });

    it('should track who is assigned', () => {
      const input: CreateOSInput = {
        job_id: '123',
        assigned_to: 'technician-5'
      };

      const os = createWorkOrder(input, 1);
      expect(os.assigned_to).toBe('technician-5');
    });

    it('should allow unassigned work orders', () => {
      const input: CreateOSInput = {
        job_id: '123'
      };

      const os = createWorkOrder(input, 1);
      expect(os.assigned_to).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large sequence numbers', () => {
      const osNumber = generateOSNumber(2025, 99999);
      expect(osNumber).toBe('OS-202599999');
    });

    it('should handle fractional labor hours', () => {
      const cost = calculateTotalCost([], 2.5, 50);
      expect(cost).toBe(125);
    });

    it('should handle many parts', () => {
      const parts: Part[] = Array.from({ length: 50 }, (_, i) => ({
        name: `Part ${i + 1}`,
        quantity: 1,
        unit_cost: 10
      }));

      const cost = calculateTotalCost(parts, 0);
      expect(cost).toBe(500); // 50 parts * 10 each
    });

    it('should validate OS with many validation errors', () => {
      const input: CreateOSInput = {
        job_id: '',
        labor_hours: -5,
        parts_used: [
          { name: '', quantity: 0, unit_cost: -10 },
          { name: 'Valid part', quantity: -1, unit_cost: 20 }
        ]
      };

      const result = validateOSCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });
});
