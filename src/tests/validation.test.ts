/**
 * Validation Test Suite
 * Tests for unified validation utilities
 */
import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validateCPF,
  validateCNPJ,
  validatePassword,
  validatePhone,
  sanitizeHtml,
  sanitizeString,
  VALIDATION_PATTERNS,
} from "@/lib/unified";

describe("Email Validation", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("admin@nautilus.io")).toBe(true);
    expect(validateEmail("test.user+tag@domain.co")).toBe(true);
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("")).toBe(false);
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@domain.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
  });
});

describe("CPF Validation", () => {
  it("accepts valid CPFs", () => {
    // Known valid CPF numbers
    expect(validateCPF("529.982.247-25")).toBe(true);
    expect(validateCPF("52998224725")).toBe(true);
  });

  it("rejects invalid CPFs", () => {
    expect(validateCPF("000.000.000-00")).toBe(false);
    expect(validateCPF("111.111.111-11")).toBe(false);
    expect(validateCPF("123")).toBe(false);
    expect(validateCPF("")).toBe(false);
  });
});

describe("CNPJ Validation", () => {
  it("accepts valid CNPJs", () => {
    expect(validateCNPJ("11.222.333/0001-81")).toBe(true);
    expect(validateCNPJ("11222333000181")).toBe(true);
  });

  it("rejects invalid CNPJs", () => {
    expect(validateCNPJ("00.000.000/0000-00")).toBe(false);
    expect(validateCNPJ("123")).toBe(false);
    expect(validateCNPJ("")).toBe(false);
  });
});

describe("Password Validation", () => {
  it("accepts strong passwords", () => {
    const result = validatePassword("MyStr0ng!Pass");
    expect(result.valid).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = validatePassword("123");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("Phone Validation", () => {
  it("accepts valid phone numbers", () => {
    expect(validatePhone("11999887766")).toBe(true);
    expect(validatePhone("(11) 99988-7766")).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(validatePhone("123")).toBe(false);
    expect(validatePhone("")).toBe(false);
  });
});

describe("Sanitization", () => {
  describe("sanitizeHtml", () => {
    it("processes HTML input", () => {
      const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      // sanitizeHtml encodes HTML entities for safety
      expect(result).toContain("Hello");
    });
  });

  describe("sanitizeString", () => {
    it("processes string input", () => {
      const result = sanitizeString("<b>bold</b> text");
      expect(result).toBeDefined();
      expect(result).toContain("text");
    });
  });
});

describe("Validation Patterns", () => {
  it("has email pattern", () => {
    expect(VALIDATION_PATTERNS).toBeDefined();
    expect(typeof VALIDATION_PATTERNS).toBe("object");
  });
});
