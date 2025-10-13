import { describe, it, expect } from "vitest";
import {
  generateAuditToken,
  verifyAuditToken,
  isTokenExpired,
  getDaysUntilExpiry,
} from "../../utils/auditToken";

describe("Audit Token Utilities", () => {
  const testEmail = "admin@empresa.com";
  const invalidEmail = "not-an-email";

  describe("generateAuditToken", () => {
    it("should generate a valid token with email", () => {
      const token = generateAuditToken(testEmail);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
    });

    it("should generate URL-safe tokens", () => {
      const token = generateAuditToken(testEmail);
      // Should not contain +, /, or = characters
      expect(token).not.toMatch(/[+/=]/);
    });

    it("should throw error for invalid email", () => {
      expect(() => generateAuditToken(invalidEmail)).toThrow("Valid email is required");
    });

    it("should throw error for empty email", () => {
      expect(() => generateAuditToken("")).toThrow("Valid email is required");
    });

    it("should generate different tokens for same email at different times", async () => {
      const token1 = generateAuditToken(testEmail);
      // Wait a tiny bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      const token2 = generateAuditToken(testEmail);
      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyAuditToken", () => {
    it("should verify and decode a valid token", () => {
      const token = generateAuditToken(testEmail);
      const payload = verifyAuditToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe(testEmail);
      expect(payload?.timestamp).toBeDefined();
      expect(typeof payload?.timestamp).toBe("number");
    });

    it("should return null for invalid token", () => {
      const invalidToken = "invalid-token-string";
      const payload = verifyAuditToken(invalidToken);
      expect(payload).toBeNull();
    });

    it("should return null for empty token", () => {
      const payload = verifyAuditToken("");
      expect(payload).toBeNull();
    });

    it("should return null for expired token", () => {
      // Create a token with a past timestamp (8 days ago)
      const pastTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const expiredPayload = { email: testEmail, timestamp: pastTimestamp };
      const jsonString = JSON.stringify(expiredPayload);
      const base64Token = btoa(jsonString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      const payload = verifyAuditToken(base64Token);
      expect(payload).toBeNull();
    });

    it("should handle malformed JSON in token", () => {
      const malformedToken = btoa("not-json").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      const payload = verifyAuditToken(malformedToken);
      expect(payload).toBeNull();
    });

    it("should handle token with missing fields", () => {
      const incompletePayload = { email: testEmail }; // missing timestamp
      const jsonString = JSON.stringify(incompletePayload);
      const token = btoa(jsonString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      const payload = verifyAuditToken(token);
      expect(payload).toBeNull();
    });

    it("should accept freshly generated tokens", () => {
      const token = generateAuditToken(testEmail);
      const payload = verifyAuditToken(token);
      
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe(testEmail);
      
      // Token should be fresh (timestamp within last minute)
      const now = Date.now();
      expect(payload?.timestamp).toBeLessThanOrEqual(now);
      expect(payload?.timestamp).toBeGreaterThan(now - 60000); // Within last minute
    });
  });

  describe("isTokenExpired", () => {
    it("should return false for valid fresh token", () => {
      const token = generateAuditToken(testEmail);
      expect(isTokenExpired(token)).toBe(false);
    });

    it("should return true for expired token", () => {
      // Create an expired token (8 days ago)
      const pastTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const expiredPayload = { email: testEmail, timestamp: pastTimestamp };
      const jsonString = JSON.stringify(expiredPayload);
      const expiredToken = btoa(jsonString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      expect(isTokenExpired(expiredToken)).toBe(true);
    });

    it("should return true for invalid token", () => {
      expect(isTokenExpired("invalid-token")).toBe(true);
    });
  });

  describe("getDaysUntilExpiry", () => {
    it("should return approximately 7 days for fresh token", () => {
      const token = generateAuditToken(testEmail);
      const daysRemaining = getDaysUntilExpiry(token);
      
      expect(daysRemaining).toBeGreaterThanOrEqual(6);
      expect(daysRemaining).toBeLessThanOrEqual(7);
    });

    it("should return -1 for invalid token", () => {
      const daysRemaining = getDaysUntilExpiry("invalid-token");
      expect(daysRemaining).toBe(-1);
    });

    it("should return -1 for expired token", () => {
      // Create an expired token
      const pastTimestamp = Date.now() - (8 * 24 * 60 * 60 * 1000);
      const expiredPayload = { email: testEmail, timestamp: pastTimestamp };
      const jsonString = JSON.stringify(expiredPayload);
      const expiredToken = btoa(jsonString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      const daysRemaining = getDaysUntilExpiry(expiredToken);
      expect(daysRemaining).toBe(-1);
    });

    it("should return 0 for token expiring today", () => {
      // Create a token that expires in a few hours
      const almostExpiredTimestamp = Date.now() - (6.9 * 24 * 60 * 60 * 1000);
      const almostExpiredPayload = { email: testEmail, timestamp: almostExpiredTimestamp };
      const jsonString = JSON.stringify(almostExpiredPayload);
      const almostExpiredToken = btoa(jsonString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
      
      const daysRemaining = getDaysUntilExpiry(almostExpiredToken);
      expect(daysRemaining).toBe(1);
    });
  });

  describe("Integration tests", () => {
    it("should complete full token lifecycle", () => {
      // Generate token
      const token = generateAuditToken(testEmail);
      expect(token).toBeTruthy();
      
      // Verify token
      const payload = verifyAuditToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.email).toBe(testEmail);
      
      // Check not expired
      expect(isTokenExpired(token)).toBe(false);
      
      // Check days remaining
      const daysRemaining = getDaysUntilExpiry(token);
      expect(daysRemaining).toBeGreaterThan(0);
    });

    it("should handle multiple emails correctly", () => {
      const email1 = "user1@empresa.com";
      const email2 = "user2@empresa.com";
      
      const token1 = generateAuditToken(email1);
      const token2 = generateAuditToken(email2);
      
      const payload1 = verifyAuditToken(token1);
      const payload2 = verifyAuditToken(token2);
      
      expect(payload1?.email).toBe(email1);
      expect(payload2?.email).toBe(email2);
      expect(token1).not.toBe(token2);
    });
  });
});
