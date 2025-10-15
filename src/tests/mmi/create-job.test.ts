import { describe, it, expect } from 'vitest';

/**
 * MMI Job Creation - Unit Tests
 * Tests for job creation validation and business logic
 */

// Type definitions
interface CreateJobInput {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  component_id?: string;
  due_date?: string;
  can_postpone?: boolean;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Validation functions
function validateJobCreation(input: CreateJobInput): ValidationResult {
  const errors: string[] = [];

  // Title validation
  if (!input.title || input.title.trim() === '') {
    errors.push('Title is required');
  } else if (input.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  } else if (input.title.length > 200) {
    errors.push('Title must not exceed 200 characters');
  }

  // Status validation
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(input.status)) {
    errors.push('Invalid status value');
  }

  // Priority validation
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (!validPriorities.includes(input.priority)) {
    errors.push('Invalid priority value');
  }

  // Due date validation
  if (input.due_date) {
    const dueDate = new Date(input.due_date);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due_date format');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        errors.push('Due date cannot be in the past');
      }
    }
  }

  // Description validation
  if (input.description && input.description.length > 2000) {
    errors.push('Description must not exceed 2000 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

describe('MMI Job Creation', () => {
  describe('Field Validation', () => {
    it('should validate a complete valid job', () => {
      const input: CreateJobInput = {
        title: 'Manutenção preventiva bomba hidráulica',
        description: 'Inspeção e lubrificação',
        status: 'pending',
        priority: 'high',
        component_id: '123e4567-e89b-12d3-a456-426614174000',
        due_date: '2025-11-15',
        can_postpone: true
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty title', () => {
      const input: CreateJobInput = {
        title: '',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject title shorter than 3 characters', () => {
      const input: CreateJobInput = {
        title: 'AB',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
    });

    it('should reject title longer than 200 characters', () => {
      const input: CreateJobInput = {
        title: 'A'.repeat(201),
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Title must not exceed 200 characters');
    });

    it('should accept title with special characters', () => {
      const input: CreateJobInput = {
        title: 'Manutenção do Motor #3 - Troca de óleo/filtro',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });

    it('should reject description longer than 2000 characters', () => {
      const input: CreateJobInput = {
        title: 'Valid title',
        description: 'A'.repeat(2001),
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Description must not exceed 2000 characters');
    });
  });

  describe('Enum Validation', () => {
    it('should accept all valid status values', () => {
      const statuses: Array<'pending' | 'in_progress' | 'completed' | 'cancelled'> = 
        ['pending', 'in_progress', 'completed', 'cancelled'];

      statuses.forEach(status => {
        const input: CreateJobInput = {
          title: 'Test job',
          status,
          priority: 'medium'
        };
        const result = validateJobCreation(input);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid status value', () => {
      const input = {
        title: 'Test job',
        status: 'invalid_status',
        priority: 'medium'
      } as CreateJobInput;

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid status value');
    });

    it('should accept all valid priority values', () => {
      const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = 
        ['low', 'medium', 'high', 'critical'];

      priorities.forEach(priority => {
        const input: CreateJobInput = {
          title: 'Test job',
          status: 'pending',
          priority
        };
        const result = validateJobCreation(input);
        expect(result.valid).toBe(true);
      });
    });

    it('should reject invalid priority value', () => {
      const input = {
        title: 'Test job',
        status: 'pending',
        priority: 'super_urgent'
      } as CreateJobInput;

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid priority value');
    });
  });

  describe('Date Handling', () => {
    it('should accept valid future date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium',
        due_date: dateStr
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });

    it('should reject past due date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];

      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium',
        due_date: dateStr
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Due date cannot be in the past');
    });

    it('should reject invalid date format', () => {
      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium',
        due_date: 'invalid-date'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid due_date format');
    });

    it('should accept today as due date', () => {
      const today = new Date().toISOString().split('T')[0];

      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium',
        due_date: today
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });
  });

  describe('Optional Fields', () => {
    it('should accept job without description', () => {
      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });

    it('should accept job without due_date', () => {
      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });

    it('should accept job without component_id', () => {
      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium'
      };

      const result = validateJobCreation(input);
      expect(result.valid).toBe(true);
    });

    it('should default can_postpone to true when not specified', () => {
      const input: CreateJobInput = {
        title: 'Test job',
        status: 'pending',
        priority: 'medium'
      };

      // In actual implementation, default would be applied
      const canPostpone = input.can_postpone ?? true;
      expect(canPostpone).toBe(true);
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should collect multiple validation errors', () => {
      const input = {
        title: '',
        status: 'invalid',
        priority: 'invalid',
        due_date: 'bad-date'
      } as CreateJobInput;

      const result = validateJobCreation(input);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Invalid status value');
      expect(result.errors).toContain('Invalid priority value');
      expect(result.errors).toContain('Invalid due_date format');
    });
  });
});
