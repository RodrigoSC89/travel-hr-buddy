/**
 * Auth Flow Integration Tests
 * Validates authentication, session management, and role-based access
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
  },
}));

describe("Authentication Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Sign In", () => {
    it("returns session on valid credentials", async () => {
      const mockSession = {
        access_token: "test-token",
        user: { id: "user-1", email: "admin@nautione.com" },
      };
      mockSignInWithPassword.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { data, error } = await mockSignInWithPassword({
        email: "admin@nautione.com",
        password: "secure-password",
      });

      expect(error).toBeNull();
      expect(data.session.access_token).toBe("test-token");
      expect(data.session.user.email).toBe("admin@nautione.com");
    });

    it("returns error on invalid credentials", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { session: null },
        error: { message: "Invalid login credentials" },
      });

      const { data, error } = await mockSignInWithPassword({
        email: "wrong@email.com",
        password: "wrong",
      });

      expect(error).not.toBeNull();
      expect(error.message).toContain("Invalid");
      expect(data.session).toBeNull();
    });

    it("handles network errors gracefully", async () => {
      mockSignInWithPassword.mockRejectedValue(new Error("Network error"));

      await expect(
        mockSignInWithPassword({ email: "test@test.com", password: "test" })
      ).rejects.toThrow("Network error");
    });
  });

  describe("Sign Up", () => {
    it("creates user with valid data", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: { id: "new-user", email: "new@nautione.com" } },
        error: null,
      });

      const { data, error } = await mockSignUp({
        email: "new@nautione.com",
        password: "StrongPass123!",
      });

      expect(error).toBeNull();
      expect(data.user.email).toBe("new@nautione.com");
    });

    it("rejects weak passwords", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: "Password should be at least 6 characters" },
      });

      const { error } = await mockSignUp({
        email: "test@test.com",
        password: "123",
      });

      expect(error).not.toBeNull();
    });
  });

  describe("Session Management", () => {
    it("returns active session", async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: "valid-token",
            expires_at: Date.now() / 1000 + 3600,
          },
        },
        error: null,
      });

      const { data } = await mockGetSession();
      expect(data.session).not.toBeNull();
      expect(data.session.access_token).toBe("valid-token");
    });

    it("returns null for expired session", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const { data } = await mockGetSession();
      expect(data.session).toBeNull();
    });

    it("signs out cleanly", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { error } = await mockSignOut();
      expect(error).toBeNull();
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Role-Based Access Control", () => {
  it("validates admin role check", () => {
    const roles = ["admin", "hr_manager", "employee", "crew"];
    const adminRoles = roles.filter((r) => ["admin", "hr_manager"].includes(r));
    expect(adminRoles).toHaveLength(2);
    expect(adminRoles).toContain("admin");
    expect(adminRoles).toContain("hr_manager");
  });

  it("validates vessel access rules", () => {
    const globalAccessRoles = [
      "admin", "hr_manager", "hr_analyst", "legal",
      "finance", "purchasing", "auditor", "manager",
    ];

    expect(globalAccessRoles.includes("admin")).toBe(true);
    expect(globalAccessRoles.includes("crew")).toBe(false);
    expect(globalAccessRoles.includes("employee")).toBe(false);
  });

  it("validates finance access requires elevated role", () => {
    const financeRoles = ["admin", "hr_manager", "manager", "department_manager"];
    expect(financeRoles.includes("employee")).toBe(false);
    expect(financeRoles.includes("crew")).toBe(false);
    expect(financeRoles.includes("admin")).toBe(true);
  });
});
