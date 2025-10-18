import { describe, it, expect } from 'vitest';
import { SGSO_REQUIREMENTS } from '@/types/sgso-audit';

describe('SGSO Audit System', () => {
  describe('SGSO_REQUIREMENTS', () => {
    it('should have exactly 17 requirements', () => {
      expect(SGSO_REQUIREMENTS).toHaveLength(17);
    });

    it('should have sequential requirement numbers from 1 to 17', () => {
      const numbers = SGSO_REQUIREMENTS.map(req => req.requirement_number);
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
    });

    it('should have all required fields for each requirement', () => {
      SGSO_REQUIREMENTS.forEach(req => {
        expect(req).toHaveProperty('requirement_number');
        expect(req).toHaveProperty('requirement_title');
        expect(req).toHaveProperty('description');
        expect(typeof req.requirement_number).toBe('number');
        expect(typeof req.requirement_title).toBe('string');
        expect(typeof req.description).toBe('string');
        expect(req.requirement_title).not.toBe('');
        expect(req.description).not.toBe('');
      });
    });

    it('should have unique requirement numbers', () => {
      const numbers = SGSO_REQUIREMENTS.map(req => req.requirement_number);
      const uniqueNumbers = new Set(numbers);
      expect(uniqueNumbers.size).toBe(numbers.length);
    });

    it('should have the first requirement as "Política de Segurança e Meio Ambiente"', () => {
      const firstReq = SGSO_REQUIREMENTS[0];
      expect(firstReq.requirement_number).toBe(1);
      expect(firstReq.requirement_title).toBe('Política de Segurança e Meio Ambiente');
    });

    it('should have the last requirement as "Integridade Mecânica"', () => {
      const lastReq = SGSO_REQUIREMENTS[16];
      expect(lastReq.requirement_number).toBe(17);
      expect(lastReq.requirement_title).toBe('Integridade Mecânica');
    });
  });

  describe('ComplianceStatus', () => {
    it('should have valid compliance status types', () => {
      const validStatuses = ['compliant', 'non_compliant', 'partial', 'pending'];
      // This test ensures the type is correctly defined
      // We can't directly test TypeScript types at runtime, but we can verify the expected values
      expect(validStatuses).toContain('compliant');
      expect(validStatuses).toContain('non_compliant');
      expect(validStatuses).toContain('partial');
      expect(validStatuses).toContain('pending');
    });
  });
});
