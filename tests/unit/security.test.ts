/**
 * Unit Tests: Security Utilities
 * PATCH: Security function testing
 */

import { describe, it, expect, vi } from "vitest";
import {
  sanitizeForDisplay,
  isValidEmail,
  validatePasswordStrength,
  generateSecureId,
  isValidUrl,
  maskSensitiveData,
  isSessionExpiringSoon,
  escapeHtml,
  validateFileUpload,
} from "@/lib/security";

describe("Security Utilities", () => {
  describe("sanitizeForDisplay", () => {
    it("should escape HTML entities", () => {
      const input = "<script>alert('xss')</script>";
      const result = sanitizeForDisplay(input);
      expect(result).not.toContain("<script>");
    });

    it("should handle normal text", () => {
      const input = "Hello World";
      const result = sanitizeForDisplay(input);
      expect(result).toBe("Hello World");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });

    it("should reject emails over 254 characters", () => {
      const longEmail = "a".repeat(250) + "@b.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    it("should reject weak passwords", () => {
      const result = validatePasswordStrength("123");
      expect(result.valid).toBe(false);
      expect(result.score).toBeLessThan(4);
    });

    it("should accept strong passwords", () => {
      const result = validatePasswordStrength("MyStr0ng!Pass#2024");
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it("should detect common patterns", () => {
      const result = validatePasswordStrength("password123");
      expect(result.feedback).toContain("Evite padrões comuns");
    });
  });

  describe("generateSecureId", () => {
    it("should generate correct length", () => {
      const id = generateSecureId(32);
      expect(id).toHaveLength(64); // hex encoding doubles the length
    });

    it("should generate unique ids", () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com").valid).toBe(true);
      expect(isValidUrl("http://localhost:3000").valid).toBe(true);
    });

    it("should reject invalid protocols", () => {
      expect(isValidUrl("javascript:alert(1)").valid).toBe(false);
      expect(isValidUrl("file:///etc/passwd").valid).toBe(false);
    });

    it("should validate allowed domains", () => {
      const result = isValidUrl("https://google.com", ["example.com"]);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Domínio não permitido");
    });
  });

  describe("maskSensitiveData", () => {
    it("should mask email correctly", () => {
      expect(maskSensitiveData("test@example.com", "email")).toBe("t***t@example.com");
    });

    it("should mask phone correctly", () => {
      expect(maskSensitiveData("11999887766", "phone")).toBe("***7766");
    });

    it("should mask passport correctly", () => {
      expect(maskSensitiveData("AB123456", "passport")).toBe("AB***6");
    });

    it("should mask card correctly", () => {
      expect(maskSensitiveData("4111111111111111", "card")).toBe("**** **** **** 1111");
    });
  });

  describe("isSessionExpiringSoon", () => {
    it("should detect expiring sessions", () => {
      const soon = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      expect(isSessionExpiringSoon(soon, 5)).toBe(true);
    });

    it("should not flag non-expiring sessions", () => {
      const later = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      expect(isSessionExpiringSoon(later, 5)).toBe(false);
    });
  });

  describe("escapeHtml", () => {
    it("should escape all HTML entities", () => {
      const input = '<div class="test">Hello & "World"</div>';
      const result = escapeHtml(input);
      expect(result).toBe("&lt;div class=&quot;test&quot;&gt;Hello &amp; &quot;World&quot;&lt;/div&gt;");
    });
  });

  describe("validateFileUpload", () => {
    it("should reject large files", () => {
      const file = new File(["x".repeat(20 * 1024 * 1024)], "large.pdf", { type: "application/pdf" });
      Object.defineProperty(file, "size", { value: 20 * 1024 * 1024 });
      
      const result = validateFileUpload(file, { maxSizeMB: 10 });
      expect(result.valid).toBe(false);
    });

    it("should reject disallowed types", () => {
      const file = new File(["test"], "script.exe", { type: "application/x-msdownload" });
      
      const result = validateFileUpload(file, { allowedTypes: ["application/pdf"] });
      expect(result.valid).toBe(false);
    });

    it("should accept valid files", () => {
      const file = new File(["test"], "document.pdf", { type: "application/pdf" });
      Object.defineProperty(file, "size", { value: 1024 });
      
      const result = validateFileUpload(file, { maxSizeMB: 10, allowedTypes: ["application/pdf"] });
      expect(result.valid).toBe(true);
    });
  });
});
