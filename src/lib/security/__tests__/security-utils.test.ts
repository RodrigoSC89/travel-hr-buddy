/**
 * Security Utilities - Unit Tests
 * Tests for frontend security helpers
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  sanitizeForDisplay,
  isValidEmail,
  validatePasswordStrength,
  generateSecureId,
  hashString,
  isValidUrl,
  maskSensitiveData,
  isSessionExpiringSoon,
  escapeHtml,
  validateFileUpload,
  clientRateLimiter,
} from "@/lib/security/index";

describe("Security Utilities", () => {
  describe("sanitizeForDisplay", () => {
    it("should escape HTML entities", () => {
      const result = sanitizeForDisplay("<script>alert('xss')</script>");
      expect(result).not.toContain("<script>");
      expect(result).toContain("&lt;script&gt;");
    });

    it("should handle normal text", () => {
      const result = sanitizeForDisplay("Hello World");
      expect(result).toBe("Hello World");
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.org")).toBe(true);
      expect(isValidEmail("user+tag@company.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("notanemail")).toBe(false);
      expect(isValidEmail("@nodomain.com")).toBe(false);
      expect(isValidEmail("spaces in@email.com")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });

    it("should reject emails longer than 254 characters", () => {
      const longEmail = "a".repeat(250) + "@b.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("validatePasswordStrength", () => {
    it("should accept strong passwords", () => {
      const result = validatePasswordStrength("SecureP@ss123!");
      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(4);
    });

    it("should reject weak passwords", () => {
      const result = validatePasswordStrength("123");
      expect(result.valid).toBe(false);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it("should detect common patterns", () => {
      const result = validatePasswordStrength("password123");
      expect(result.feedback).toContain("Evite padrões comuns");
    });

    it("should require minimum length", () => {
      const result = validatePasswordStrength("Ab1!");
      expect(result.feedback).toContain("Mínimo 8 caracteres");
    });
  });

  describe("generateSecureId", () => {
    it("should generate hex string of correct length", () => {
      const id = generateSecureId(16);
      expect(id).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(/^[0-9a-f]+$/.test(id)).toBe(true);
    });

    it("should generate unique ids", () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });
  });

  describe("hashString", () => {
    it("should produce consistent hashes", async () => {
      const hash1 = await hashString("test");
      const hash2 = await hashString("test");
      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", async () => {
      const hash1 = await hashString("test1");
      const hash2 = await hashString("test2");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce 64-character SHA-256 hash", async () => {
      const hash = await hashString("test");
      expect(hash).toHaveLength(64);
    });
  });

  describe("isValidUrl", () => {
    it("should accept valid HTTP URLs", () => {
      expect(isValidUrl("https://example.com").valid).toBe(true);
      expect(isValidUrl("http://localhost:3000").valid).toBe(true);
    });

    it("should reject invalid protocols", () => {
      const result = isValidUrl("javascript:alert('xss')");
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Protocolo inválido");
    });

    it("should validate allowed domains", () => {
      const result = isValidUrl("https://evil.com", ["example.com"]);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Domínio não permitido");
    });

    it("should accept subdomains of allowed domains", () => {
      const result = isValidUrl("https://api.example.com", ["example.com"]);
      expect(result.valid).toBe(true);
    });
  });

  describe("maskSensitiveData", () => {
    it("should mask email addresses", () => {
      const result = maskSensitiveData("john.doe@example.com", "email");
      expect(result).toMatch(/j\*\*\*e@example\.com/);
    });

    it("should mask phone numbers", () => {
      const result = maskSensitiveData("+5511999887766", "phone");
      expect(result).toMatch(/\*\*\*7766$/);
    });

    it("should mask passport numbers", () => {
      const result = maskSensitiveData("AB123456", "passport");
      expect(result).toBe("AB***6");
    });

    it("should mask card numbers", () => {
      const result = maskSensitiveData("4111111111111111", "card");
      expect(result).toBe("**** **** **** 1111");
    });

    it("should handle empty input", () => {
      expect(maskSensitiveData("", "email")).toBe("");
    });
  });

  describe("isSessionExpiringSoon", () => {
    it("should return true when session expires within threshold", () => {
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
      expect(isSessionExpiringSoon(expiresAt, 5)).toBe(true);
    });

    it("should return false when session has plenty of time", () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      expect(isSessionExpiringSoon(expiresAt, 5)).toBe(false);
    });

    it("should return false when session already expired", () => {
      const expiresAt = new Date(Date.now() - 1000); // Already expired
      expect(isSessionExpiringSoon(expiresAt)).toBe(false);
    });
  });

  describe("escapeHtml", () => {
    it("should escape all HTML entities", () => {
      const result = escapeHtml('<script>"test" & \'more\'</script>');
      expect(result).toBe("&lt;script&gt;&quot;test&quot; &amp; &#039;more&#039;&lt;/script&gt;");
    });
  });

  describe("validateFileUpload", () => {
    it("should accept valid files", () => {
      const file = new File(["content"], "test.pdf", { type: "application/pdf" });
      const result = validateFileUpload(file, {
        maxSizeMB: 10,
        allowedTypes: ["application/pdf"],
        allowedExtensions: ["pdf"],
      });
      expect(result.valid).toBe(true);
    });

    it("should reject files exceeding size limit", () => {
      const largeContent = new Array(11 * 1024 * 1024).fill("a").join("");
      const file = new File([largeContent], "large.pdf", { type: "application/pdf" });
      const result = validateFileUpload(file, { maxSizeMB: 10 });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain("maior que");
    });

    it("should reject invalid MIME types", () => {
      const file = new File(["content"], "script.js", { type: "application/javascript" });
      const result = validateFileUpload(file, {
        allowedTypes: ["application/pdf", "image/png"],
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Tipo de arquivo não permitido");
    });

    it("should reject invalid extensions", () => {
      const file = new File(["content"], "script.exe", { type: "application/octet-stream" });
      const result = validateFileUpload(file, {
        allowedExtensions: ["pdf", "docx"],
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("Extensão de arquivo não permitida");
    });
  });

  describe("clientRateLimiter", () => {
    beforeEach(() => {
      // Reset rate limiter state
      vi.useFakeTimers();
    });

    it("should allow requests within limit", () => {
      expect(clientRateLimiter.check("test-key", 5, 60000)).toBe(true);
      expect(clientRateLimiter.check("test-key", 5, 60000)).toBe(true);
    });

    it("should block requests exceeding limit", () => {
      for (let i = 0; i < 5; i++) {
        clientRateLimiter.check("block-test", 5, 60000);
      }
      expect(clientRateLimiter.check("block-test", 5, 60000)).toBe(false);
    });

    it("should track remaining requests", () => {
      clientRateLimiter.check("remaining-test", 5, 60000);
      clientRateLimiter.check("remaining-test", 5, 60000);
      expect(clientRateLimiter.getRemainingRequests("remaining-test", 5, 60000)).toBe(3);
    });
  });
});
