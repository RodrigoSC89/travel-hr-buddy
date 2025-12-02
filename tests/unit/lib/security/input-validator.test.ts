/**
 * Unit Tests - Input Validator
 * Tests for input validation and security patterns
 */

import { describe, it, expect } from 'vitest';
import {
  validateString,
  validateNumber,
  validateArray,
  validateObject,
  VALIDATION_PATTERNS,
  ValidationError
} from '@/lib/security/input-validator';

describe('ValidationError', () => {
  it('should create error with correct properties', () => {
    const error = new ValidationError('Invalid input', 'name');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Invalid input');
    expect(error.field).toBe('name');
    expect(error.name).toBe('ValidationError');
  });
});

describe('VALIDATION_PATTERNS', () => {
  describe('XSS_PATTERNS', () => {
    it('should detect script tags', () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.SCRIPT_TAG.test('<script>alert("xss")</script>')).toBe(true);
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.SCRIPT_TAG.test('normal text')).toBe(false);
    });

    it('should detect event handlers', () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.test('onclick="alert()"')).toBe(true);
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.test('onmouseover="alert()"')).toBe(true);
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.test('normal text')).toBe(false);
    });

    it('should detect javascript protocol', () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.JAVASCRIPT_PROTOCOL.test('javascript:alert()')).toBe(true);
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.JAVASCRIPT_PROTOCOL.test('https://example.com')).toBe(false);
    });

    it('should detect data protocol', () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.DATA_PROTOCOL.test('data:text/html,<script>alert()</script>')).toBe(true);
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.DATA_PROTOCOL.test('normal text')).toBe(false);
    });
  });

  describe('SQL_PATTERNS', () => {
    it('should detect SQL injection attempts', () => {
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("'; DROP TABLE users; --")).toBe(true);
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("1' OR '1'='1")).toBe(true);
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("SELECT * FROM users")).toBe(true);
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("normal text")).toBe(false);
    });
  });

  describe('EMAIL', () => {
    it('should validate email addresses', () => {
      expect(VALIDATION_PATTERNS.EMAIL.test('user@example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.EMAIL.test('user.name+tag@example.co.uk')).toBe(true);
      expect(VALIDATION_PATTERNS.EMAIL.test('invalid@')).toBe(false);
      expect(VALIDATION_PATTERNS.EMAIL.test('@invalid.com')).toBe(false);
      expect(VALIDATION_PATTERNS.EMAIL.test('notanemail')).toBe(false);
    });
  });

  describe('URL', () => {
    it('should validate URLs', () => {
      expect(VALIDATION_PATTERNS.URL.test('https://example.com')).toBe(true);
      expect(VALIDATION_PATTERNS.URL.test('http://example.com/path')).toBe(true);
      expect(VALIDATION_PATTERNS.URL.test('ftp://example.com')).toBe(false);
      expect(VALIDATION_PATTERNS.URL.test('not a url')).toBe(false);
    });
  });

  describe('UUID', () => {
    it('should validate UUIDs', () => {
      expect(VALIDATION_PATTERNS.UUID.test('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
      expect(VALIDATION_PATTERNS.UUID.test('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(VALIDATION_PATTERNS.UUID.test('not-a-uuid')).toBe(false);
      expect(VALIDATION_PATTERNS.UUID.test('123')).toBe(false);
    });
  });
});

describe('validateString', () => {
  it('should validate string with basic options', () => {
    const result = validateString('Hello World', {
      required: true,
      minLength: 5,
      maxLength: 20
    });
    
    expect(result).toBe('Hello World');
  });

  it('should throw error for required empty string', () => {
    expect(() => {
      validateString('', { required: true });
    }).toThrow(ValidationError);
  });

  it('should allow empty string when not required', () => {
    const result = validateString('', { required: false });
    expect(result).toBe('');
  });

  it('should throw error for string too short', () => {
    expect(() => {
      validateString('Hi', { minLength: 5 });
    }).toThrow('String must be at least 5 characters');
  });

  it('should throw error for string too long', () => {
    expect(() => {
      validateString('This is a very long string', { maxLength: 10 });
    }).toThrow('String must be at most 10 characters');
  });

  it('should detect XSS patterns', () => {
    expect(() => {
      validateString('<script>alert("xss")</script>', { checkXSS: true });
    }).toThrow('Input contains potentially dangerous content');
  });

  it('should detect SQL injection patterns', () => {
    expect(() => {
      validateString("'; DROP TABLE users; --", { checkSQL: true });
    }).toThrow('Input contains potentially dangerous SQL patterns');
  });

  it('should validate email pattern', () => {
    expect(validateString('user@example.com', { pattern: VALIDATION_PATTERNS.EMAIL })).toBe('user@example.com');
    
    expect(() => {
      validateString('invalid-email', { pattern: VALIDATION_PATTERNS.EMAIL });
    }).toThrow('String does not match required pattern');
  });

  it('should trim whitespace', () => {
    const result = validateString('  Hello  ', { trim: true });
    expect(result).toBe('Hello');
  });
});

describe('validateNumber', () => {
  it('should validate number with basic options', () => {
    const result = validateNumber(42, {
      required: true,
      min: 0,
      max: 100
    });
    
    expect(result).toBe(42);
  });

  it('should throw error for required null', () => {
    expect(() => {
      validateNumber(null, { required: true });
    }).toThrow(ValidationError);
  });

  it('should allow null when not required', () => {
    const result = validateNumber(null, { required: false });
    expect(result).toBeNull();
  });

  it('should throw error for number too small', () => {
    expect(() => {
      validateNumber(5, { min: 10 });
    }).toThrow('Number must be at least 10');
  });

  it('should throw error for number too large', () => {
    expect(() => {
      validateNumber(150, { max: 100 });
    }).toThrow('Number must be at most 100');
  });

  it('should enforce integer constraint', () => {
    expect(() => {
      validateNumber(42.5, { integer: true });
    }).toThrow('Number must be an integer');
  });

  it('should validate positive numbers', () => {
    expect(validateNumber(42, { positive: true })).toBe(42);
    
    expect(() => {
      validateNumber(-5, { positive: true });
    }).toThrow('Number must be positive');
  });
});

describe('validateArray', () => {
  it('should validate array with basic options', () => {
    const result = validateArray([1, 2, 3], {
      required: true,
      minLength: 2,
      maxLength: 5
    });
    
    expect(result).toEqual([1, 2, 3]);
  });

  it('should throw error for required empty array', () => {
    expect(() => {
      validateArray([], { required: true });
    }).toThrow(ValidationError);
  });

  it('should allow empty array when not required', () => {
    const result = validateArray([], { required: false });
    expect(result).toEqual([]);
  });

  it('should throw error for array too short', () => {
    expect(() => {
      validateArray([1], { minLength: 3 });
    }).toThrow('Array must contain at least 3 items');
  });

  it('should throw error for array too long', () => {
    expect(() => {
      validateArray([1, 2, 3, 4], { maxLength: 2 });
    }).toThrow('Array must contain at most 2 items');
  });

  it('should validate array items with validator function', () => {
    const validator = (item: any) => {
      if (typeof item !== 'string') throw new Error('Item must be string');
      return item;
    };

    expect(validateArray(['a', 'b', 'c'], { itemValidator: validator })).toEqual(['a', 'b', 'c']);
    
    expect(() => {
      validateArray([1, 2, 3], { itemValidator: validator });
    }).toThrow(ValidationError);
  });

  it('should validate unique items', () => {
    expect(validateArray([1, 2, 3], { unique: true })).toEqual([1, 2, 3]);
    
    expect(() => {
      validateArray([1, 2, 2, 3], { unique: true });
    }).toThrow('Array must contain unique items');
  });
});

describe('validateObject', () => {
  it('should validate object with schema', () => {
    const schema = {
      name: (val: any) => validateString(val, { required: true, maxLength: 50 }),
      age: (val: any) => validateNumber(val, { required: true, min: 0, max: 120 })
    };

    const result = validateObject({ name: 'John', age: 30 }, { schema });
    
    expect(result).toEqual({ name: 'John', age: 30 });
  });

  it('should throw error for missing required field', () => {
    const schema = {
      name: (val: any) => validateString(val, { required: true })
    };

    expect(() => {
      validateObject({}, { schema });
    }).toThrow(ValidationError);
  });

  it('should allow partial validation', () => {
    const schema = {
      name: (val: any) => validateString(val, { required: true }),
      age: (val: any) => validateNumber(val, { required: true })
    };

    const result = validateObject({ name: 'John' }, { schema, partial: true });
    
    expect(result).toEqual({ name: 'John' });
  });

  it('should throw error when strict mode enabled with extra fields', () => {
    const schema = {
      name: (val: any) => validateString(val, { required: true })
    };

    expect(() => {
      validateObject({ name: 'John', extra: 'field' }, { schema, strict: true });
    }).toThrow('Object contains unexpected fields: extra');
  });
});

describe('Debug Tool', () => {
  it('should expose validator globally for debugging', () => {
    expect((window as any).__NAUTILUS_VALIDATOR__).toBeDefined();
    expect((window as any).__NAUTILUS_VALIDATOR__.validateString).toBeDefined();
    expect((window as any).__NAUTILUS_VALIDATOR__.validateNumber).toBeDefined();
    expect((window as any).__NAUTILUS_VALIDATOR__.validateArray).toBeDefined();
    expect((window as any).__NAUTILUS_VALIDATOR__.validateObject).toBeDefined();
  });
});
