import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateAuditToken, verifyAuditToken } from "@/utils/auditToken";

describe("auditToken", () => {
  beforeEach(() => {
    // Mock current date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-10-13T19:36:50.131Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generateAuditToken", () => {
    it("should generate a base64 encoded token with email and timestamp", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      // Decode the token to verify contents
      const decoded = atob(token);
      expect(decoded).toContain(email);
      expect(decoded).toContain("2025-10-13T19:36:50.131Z");
    });

    it("should generate different tokens for different emails", () => {
      const token1 = generateAuditToken("admin1@empresa.com");
      const token2 = generateAuditToken("admin2@empresa.com");

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyAuditToken", () => {
    it("should verify a valid token and return the email", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      const verifiedEmail = verifyAuditToken(token);
      expect(verifiedEmail).toBe(email);
    });

    it("should return null for an expired token (>7 days old)", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      // Fast forward 8 days
      vi.setSystemTime(new Date("2025-10-21T19:36:50.131Z"));

      const verifiedEmail = verifyAuditToken(token);
      expect(verifiedEmail).toBeNull();
    });

    it("should accept a token within 7 days", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      // Fast forward 6 days (still valid)
      vi.setSystemTime(new Date("2025-10-19T19:36:50.131Z"));

      const verifiedEmail = verifyAuditToken(token);
      expect(verifiedEmail).toBe(email);
    });

    it("should return null for an invalid token format", () => {
      const invalidToken = "invalid-token-123";

      const verifiedEmail = verifyAuditToken(invalidToken);
      expect(verifiedEmail).toBeNull();
    });

    it("should handle malformed base64 tokens", () => {
      const malformedToken = "YWJjZGVmZ2hpams="; // Valid base64 but wrong format

      const verifiedEmail = verifyAuditToken(malformedToken);
      expect(verifiedEmail).toBeNull();
    });
  });

  describe("token security", () => {
    it("should embed timestamp in token for expiration checking", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      const decoded = atob(token);
      const parts = decoded.split(":");
      // The decoded string is "email:timestamp" but timestamp has colons too
      // So we need to reconstruct it properly
      const extractedEmail = parts[0];
      
      expect(extractedEmail).toBe(email);
      expect(decoded).toContain("2025-10-13T19");
    });

    it("should correctly calculate days difference for expiration", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      // Just under 7 days later
      vi.setSystemTime(new Date("2025-10-20T18:36:50.131Z"));

      const verifiedEmail = verifyAuditToken(token);
      expect(verifiedEmail).toBe(email); // Still valid
    });

    it("should expire just after 7 days", () => {
      const email = "admin@empresa.com";
      const token = generateAuditToken(email);

      // Just over 7 days later  
      vi.setSystemTime(new Date("2025-10-20T20:00:00.000Z"));

      const verifiedEmail = verifyAuditToken(token);
      expect(verifiedEmail).toBeNull(); // Expired
    });
  });
});
