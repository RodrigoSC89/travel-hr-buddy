/**
 * PII Sanitizer Tests
 * PATCH: Audit Plan 2025
 */

import { describe, it, expect } from 'vitest';
import { 
  sanitizePII, 
  containsPII, 
  sanitizeMessages,
  createSafePrompt 
} from '@/lib/pii-sanitizer';

describe('PII Sanitizer', () => {
  describe('sanitizePII', () => {
    it('should mask CPF numbers', () => {
      const input = 'Meu CPF é 123.456.789-01';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe('Meu CPF é [CPF_MASKED]');
      expect(result.maskedCount).toBe(1);
      expect(result.maskedTypes).toContain('CPF (Brazilian ID)');
    });

    it('should mask CNPJ numbers', () => {
      const input = 'A empresa tem CNPJ 12.345.678/0001-90';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe('A empresa tem CNPJ [CNPJ_MASKED]');
      expect(result.maskedCount).toBe(1);
    });

    it('should mask email addresses', () => {
      const input = 'Contato: joao.silva@empresa.com.br';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe('Contato: [EMAIL_MASKED]');
      expect(result.maskedCount).toBe(1);
    });

    it('should mask phone numbers', () => {
      const input = 'Ligue para (11) 98765-4321';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toContain('[PHONE_MASKED]');
      expect(result.maskedCount).toBeGreaterThanOrEqual(1);
    });

    it('should mask credit card numbers', () => {
      const input = 'Cartão: 4111-1111-1111-1111';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe('Cartão: [CARD_MASKED]');
      expect(result.maskedCount).toBe(1);
    });

    it('should mask multiple PII types in same text', () => {
      const input = 'CPF: 123.456.789-01, Email: teste@test.com';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe('CPF: [CPF_MASKED], Email: [EMAIL_MASKED]');
      expect(result.maskedCount).toBe(2);
    });

    it('should respect sensitivity levels', () => {
      const input = 'CPF: 123.456.789-01, Email: teste@test.com';
      
      // Only high sensitivity
      const highOnly = sanitizePII(input, { sensitivity: ['high'] });
      expect(highOnly.sanitized).toContain('[CPF_MASKED]');
      expect(highOnly.sanitized).toContain('teste@test.com'); // Email is medium
      
      // High and medium
      const highMedium = sanitizePII(input, { sensitivity: ['high', 'medium'] });
      expect(highMedium.sanitized).toContain('[CPF_MASKED]');
      expect(highMedium.sanitized).toContain('[EMAIL_MASKED]');
    });

    it('should handle text without PII', () => {
      const input = 'Este texto não contém dados pessoais';
      const result = sanitizePII(input);
      
      expect(result.sanitized).toBe(input);
      expect(result.maskedCount).toBe(0);
      expect(result.maskedTypes).toHaveLength(0);
    });
  });

  describe('containsPII', () => {
    it('should detect PII in text', () => {
      const result = containsPII('Meu CPF é 123.456.789-01');
      
      expect(result.hasPII).toBe(true);
      expect(result.types).toContain('CPF (Brazilian ID)');
    });

    it('should return false for clean text', () => {
      const result = containsPII('Texto sem dados pessoais');
      
      expect(result.hasPII).toBe(false);
      expect(result.types).toHaveLength(0);
    });

    it('should detect multiple PII types', () => {
      const result = containsPII('CPF 123.456.789-01 email@test.com');
      
      expect(result.hasPII).toBe(true);
      expect(result.types.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('sanitizeMessages', () => {
    it('should sanitize array of chat messages', () => {
      const messages = [
        { role: 'user', content: 'Meu CPF é 123.456.789-01' },
        { role: 'assistant', content: 'Entendi!' },
        { role: 'user', content: 'Email: teste@test.com' },
      ];

      const result = sanitizeMessages(messages);

      expect(result[0].content).toBe('Meu CPF é [CPF_MASKED]');
      expect(result[1].content).toBe('Entendi!');
      expect(result[2].content).toBe('Email: [EMAIL_MASKED]');
    });

    it('should preserve message structure', () => {
      const messages = [
        { role: 'system', content: 'You are a helper' },
        { role: 'user', content: 'Hello' },
      ];

      const result = sanitizeMessages(messages);

      expect(result[0].role).toBe('system');
      expect(result[1].role).toBe('user');
    });
  });

  describe('createSafePrompt', () => {
    it('should create sanitized prompt with warnings', () => {
      const result = createSafePrompt(
        'Meu CPF é 123.456.789-01',
        'You are a helpful assistant'
      );

      expect(result.prompt).toContain('[CPF_MASKED]');
      expect(result.prompt).toContain('PRIVACY NOTICE');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should have no warnings for clean input', () => {
      const result = createSafePrompt(
        'Como está o tempo hoje?',
        'You are a helpful assistant'
      );

      expect(result.warnings).toHaveLength(0);
    });
  });
});
