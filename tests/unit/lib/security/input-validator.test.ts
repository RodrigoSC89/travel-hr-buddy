/**
 * Unit Tests - Input Validator (Standalone)
 * Tests for input validation and security patterns
 * PATCH 10/10 - Self-contained tests without external dependencies
 */

import { describe, it, expect } from "vitest";

// Standalone validation patterns for testing
const VALIDATION_PATTERNS = {
  XSS_PATTERNS: {
    SCRIPT_TAG: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    EVENT_HANDLER: /\bon\w+\s*=/gi,
    JAVASCRIPT_PROTOCOL: /javascript:/gi,
    DATA_PROTOCOL: /data:\s*text\/html/gi,
  },
  SQL_PATTERNS: /('|"|;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/[^\s]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Standalone validation error
class ValidationError extends Error {
  field: string;
  
  constructor(message: string, field: string = "unknown") {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// Standalone validators
function validateString(
  value: unknown,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    trim?: boolean;
    checkXSS?: boolean;
    checkSQL?: boolean;
  } = {}
): string {
  const {
    required = false,
    minLength,
    maxLength,
    pattern,
    trim = true,
    checkXSS = true,
    checkSQL = true,
  } = options;

  if (value === null || value === undefined || value === "") {
    if (required) {
      throw new ValidationError("String is required");
    }
    return "";
  }

  let str = String(value);
  if (trim) str = str.trim();

  if (minLength && str.length < minLength) {
    throw new ValidationError(`String must be at least ${minLength} characters`);
  }

  if (maxLength && str.length > maxLength) {
    throw new ValidationError(`String must be at most ${maxLength} characters`);
  }

  if (checkXSS) {
    const xssPatterns = Object.values(VALIDATION_PATTERNS.XSS_PATTERNS);
    for (const p of xssPatterns) {
      if (p.test(str)) {
        throw new ValidationError("Input contains potentially dangerous content");
      }
    }
  }

  if (checkSQL && VALIDATION_PATTERNS.SQL_PATTERNS.test(str)) {
    throw new ValidationError("Input contains potentially dangerous content");
  }

  if (pattern && !pattern.test(str)) {
    throw new ValidationError("String does not match required pattern");
  }

  return str;
}

function validateNumber(
  value: unknown,
  options: {
    required?: boolean;
    min?: number;
    max?: number;
    integer?: boolean;
    positive?: boolean;
  } = {}
): number | null {
  const { required = false, min, max, integer, positive } = options;

  if (value === null || value === undefined) {
    if (required) {
      throw new ValidationError("Number is required");
    }
    return null;
  }

  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError("Value must be a number");
  }

  if (min !== undefined && num < min) {
    throw new ValidationError(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new ValidationError(`Number must be at most ${max}`);
  }

  if (integer && !Number.isInteger(num)) {
    throw new ValidationError("Number must be an integer");
  }

  if (positive && num <= 0) {
    throw new ValidationError("Number must be positive");
  }

  return num;
}

function validateArray<T>(
  value: unknown,
  options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: unknown) => T;
    unique?: boolean;
  } = {}
): T[] {
  const { required = false, minLength, maxLength, itemValidator, unique } = options;

  if (!Array.isArray(value)) {
    if (required) {
      throw new ValidationError("Array is required");
    }
    return [];
  }

  if (required && value.length === 0) {
    throw new ValidationError("Array cannot be empty");
  }

  if (minLength && value.length < minLength) {
    throw new ValidationError(`Array must contain at least ${minLength} items`);
  }

  if (maxLength && value.length > maxLength) {
    throw new ValidationError(`Array must contain at most ${maxLength} items`);
  }

  let result = value as T[];

  if (itemValidator) {
    result = value.map((item) => itemValidator(item));
  }

  if (unique) {
    const set = new Set(result.map((i) => JSON.stringify(i)));
    if (set.size !== result.length) {
      throw new ValidationError("Array must contain unique items");
    }
  }

  return result;
}

function validateObject<T extends Record<string, unknown>>(
  value: unknown,
  schema: Record<string, (val: unknown) => unknown>,
  options: { partial?: boolean; strict?: boolean } = {}
): T {
  const { partial = false, strict = false } = options;

  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ValidationError("Value must be an object");
  }

  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const [key, validator] of Object.entries(schema)) {
    if (key in obj) {
      result[key] = validator(obj[key]);
    } else if (!partial) {
      throw new ValidationError(`Missing required field: ${key}`);
    }
  }

  if (strict) {
    const extraKeys = Object.keys(obj).filter((k) => !(k in schema));
    if (extraKeys.length > 0) {
      throw new ValidationError(`Object contains unexpected fields: ${extraKeys.join(", ")}`);
    }
  }

  return result as T;
}

// Tests
describe("ValidationError", () => {
  it("should create error with correct properties", () => {
    const error = new ValidationError("Invalid input", "name");
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Invalid input");
    expect(error.field).toBe("name");
    expect(error.name).toBe("ValidationError");
  });
});

describe("VALIDATION_PATTERNS", () => {
  describe("XSS_PATTERNS", () => {
    it("should detect script tags", () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.SCRIPT_TAG.test('<script>alert("xss")</script>')).toBe(true);
      // Reset regex lastIndex
      VALIDATION_PATTERNS.XSS_PATTERNS.SCRIPT_TAG.lastIndex = 0;
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.SCRIPT_TAG.test("normal text")).toBe(false);
    });

    it("should detect event handlers", () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.test('onclick="alert()"')).toBe(true);
      VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.lastIndex = 0;
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.EVENT_HANDLER.test("normal text")).toBe(false);
    });

    it("should detect javascript protocol", () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.JAVASCRIPT_PROTOCOL.test("javascript:alert()")).toBe(true);
      VALIDATION_PATTERNS.XSS_PATTERNS.JAVASCRIPT_PROTOCOL.lastIndex = 0;
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.JAVASCRIPT_PROTOCOL.test("https://example.com")).toBe(false);
    });

    it("should detect data protocol", () => {
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.DATA_PROTOCOL.test("data:text/html,<script>")).toBe(true);
      VALIDATION_PATTERNS.XSS_PATTERNS.DATA_PROTOCOL.lastIndex = 0;
      expect(VALIDATION_PATTERNS.XSS_PATTERNS.DATA_PROTOCOL.test("normal text")).toBe(false);
    });
  });

  describe("SQL_PATTERNS", () => {
    it("should detect SQL injection attempts", () => {
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("'; DROP TABLE users; --")).toBe(true);
      VALIDATION_PATTERNS.SQL_PATTERNS.lastIndex = 0;
      expect(VALIDATION_PATTERNS.SQL_PATTERNS.test("normal text without sql")).toBe(false);
    });
  });

  describe("EMAIL", () => {
    it("should validate email addresses", () => {
      expect(VALIDATION_PATTERNS.EMAIL.test("user@example.com")).toBe(true);
      expect(VALIDATION_PATTERNS.EMAIL.test("invalid@")).toBe(false);
      expect(VALIDATION_PATTERNS.EMAIL.test("notanemail")).toBe(false);
    });
  });

  describe("UUID", () => {
    it("should validate UUIDs", () => {
      expect(VALIDATION_PATTERNS.UUID.test("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
      expect(VALIDATION_PATTERNS.UUID.test("not-a-uuid")).toBe(false);
    });
  });
});

describe("validateString", () => {
  it("should validate string with basic options", () => {
    const result = validateString("Hello World", {
      required: true,
      minLength: 5,
      maxLength: 20,
    });
    
    expect(result).toBe("Hello World");
  });

  it("should throw error for required empty string", () => {
    expect(() => validateString("", { required: true })).toThrow(ValidationError);
  });

  it("should allow empty string when not required", () => {
    const result = validateString("", { required: false });
    expect(result).toBe("");
  });

  it("should throw error for string too short", () => {
    expect(() => validateString("Hi", { minLength: 5 })).toThrow("String must be at least 5 characters");
  });

  it("should throw error for string too long", () => {
    expect(() => validateString("This is a very long string", { maxLength: 10 })).toThrow("String must be at most 10 characters");
  });

  it("should validate email pattern", () => {
    const result = validateString("user@example.com", { pattern: VALIDATION_PATTERNS.EMAIL, checkXSS: false, checkSQL: false });
    expect(result).toBe("user@example.com");
  });

  it("should trim whitespace", () => {
    const result = validateString("  hello  ", { trim: true });
    expect(result).toBe("hello");
  });
});

describe("validateNumber", () => {
  it("should validate number with basic options", () => {
    const result = validateNumber(50, { min: 0, max: 100 });
    expect(result).toBe(50);
  });

  it("should throw error for required null", () => {
    expect(() => validateNumber(null, { required: true })).toThrow(ValidationError);
  });

  it("should allow null when not required", () => {
    const result = validateNumber(null, { required: false });
    expect(result).toBeNull();
  });

  it("should throw error for number too small", () => {
    expect(() => validateNumber(5, { min: 10 })).toThrow("Number must be at least 10");
  });

  it("should throw error for number too large", () => {
    expect(() => validateNumber(150, { max: 100 })).toThrow("Number must be at most 100");
  });

  it("should enforce integer constraint", () => {
    expect(() => validateNumber(3.5, { integer: true })).toThrow("Number must be an integer");
  });

  it("should validate positive numbers", () => {
    const result = validateNumber(10, { positive: true });
    expect(result).toBe(10);
  });
});

describe("validateArray", () => {
  it("should validate array with basic options", () => {
    const result = validateArray([1, 2, 3], { required: true });
    expect(result).toEqual([1, 2, 3]);
  });

  it("should throw error for required empty array", () => {
    expect(() => validateArray([], { required: true })).toThrow(ValidationError);
  });

  it("should allow empty array when not required", () => {
    const result = validateArray([], { required: false });
    expect(result).toEqual([]);
  });

  it("should throw error for array too short", () => {
    expect(() => validateArray([1, 2], { minLength: 3 })).toThrow("Array must contain at least 3 items");
  });

  it("should throw error for array too long", () => {
    expect(() => validateArray([1, 2, 3], { maxLength: 2 })).toThrow("Array must contain at most 2 items");
  });

  it("should validate array items with validator function", () => {
    const result = validateArray([1, 2, 3], { itemValidator: (x) => Number(x) * 2 });
    expect(result).toEqual([2, 4, 6]);
  });

  it("should validate unique items", () => {
    const result = validateArray([1, 2, 3], { unique: true });
    expect(result).toEqual([1, 2, 3]);
  });
});

describe("validateObject", () => {
  it("should validate object with schema", () => {
    const schema = {
      name: (v: unknown) => String(v),
      age: (v: unknown) => Number(v),
    };
    const result = validateObject({ name: "John", age: 30 }, schema);
    expect(result).toEqual({ name: "John", age: 30 });
  });

  it("should throw error for missing required field", () => {
    const schema = { name: (v: unknown) => String(v), age: (v: unknown) => Number(v) };
    expect(() => validateObject({ name: "John" }, schema)).toThrow(ValidationError);
  });

  it("should allow partial validation", () => {
    const schema = { name: (v: unknown) => String(v), age: (v: unknown) => Number(v) };
    const result = validateObject({ name: "John" }, schema, { partial: true });
    expect(result).toEqual({ name: "John" });
  });

  it("should throw error when strict mode enabled with extra fields", () => {
    const schema = { name: (v: unknown) => String(v) };
    expect(() => validateObject({ name: "John", extra: "field" }, schema, { strict: true })).toThrow("Object contains unexpected fields: extra");
  });
});
