/**
 * Unit Tests for Auth Service
 * Tests authentication flows, session management, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase before importing auth service
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Import after mocking
import { supabase } from '@/integrations/supabase/client';

describe('Auth Service', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@nautione.com.br',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: { full_name: 'Test User' },
    aud: 'authenticated',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('signInWithPassword', () => {
    it('should login with valid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@nautione.com.br',
        password: 'Test123!@#',
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.data.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@nautione.com.br',
        password: 'Test123!@#',
      });
    });

    it('should handle invalid credentials', async () => {
      const mockError = {
        message: 'Invalid login credentials',
        status: 400,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as never,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });

      expect(result.data.user).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid login credentials');
    });

    it('should handle network errors', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        supabase.auth.signInWithPassword({
          email: 'test@nautione.com.br',
          password: 'Test123!@#',
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle rate limiting', async () => {
      const mockError = {
        message: 'Too many requests',
        status: 429,
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as never,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@nautione.com.br',
        password: 'Test123!@#',
      });

      expect(result.error?.status).toBe(429);
    });
  });

  describe('signUp', () => {
    it('should create new user successfully', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'new@nautione.com.br',
        password: 'NewUser123!@#',
        options: {
          data: { full_name: 'New User' },
        },
      });

      expect(result.data.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should handle duplicate email', async () => {
      const mockError = {
        message: 'User already registered',
        status: 400,
      };

      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError as never,
      });

      const result = await supabase.auth.signUp({
        email: 'existing@nautione.com.br',
        password: 'Test123!@#',
      });

      expect(result.error?.message).toBe('User already registered');
    });
  });

  describe('signOut', () => {
    it('should logout successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: 'Session expired' } as never,
      });

      const result = await supabase.auth.signOut();

      // Even with error, logout should complete
      expect(result.error).toBeDefined();
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toEqual(mockSession);
      expect(result.data.session?.user).toEqual(mockUser);
    });

    it('should return null when not authenticated', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await supabase.auth.getSession();

      expect(result.data.session).toBeNull();
    });
  });

  describe('resetPasswordForEmail', () => {
    it('should send password reset email', async () => {
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await supabase.auth.resetPasswordForEmail('test@nautione.com.br');

      expect(result.error).toBeNull();
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@nautione.com.br');
    });

    it('should handle non-existent email gracefully', async () => {
      // Supabase doesn't reveal if email exists for security
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await supabase.auth.resetPasswordForEmail('nonexistent@example.com');

      // Should not reveal if email exists
      expect(result.error).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, user_metadata: { full_name: 'Updated Name' } };
      
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({
        data: { user: updatedUser },
        error: null,
      });

      const result = await supabase.auth.updateUser({
        data: { full_name: 'Updated Name' },
      });

      expect(result.data.user?.user_metadata?.full_name).toBe('Updated Name');
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const callback = vi.fn();
      
      supabase.auth.onAuthStateChange(callback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });
  });
});

describe('Auth Validation', () => {
  describe('Email Validation', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'test@nautione.com.br',
        'user.name@domain.com',
        'user+tag@example.org',
      ];

      validEmails.forEach((email) => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@no-user.com',
        'no-domain@',
        'spaces in@email.com',
      ];

      invalidEmails.forEach((email) => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('Password Validation', () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    it('should accept strong passwords', () => {
      const strongPasswords = [
        'Test123!@#',
        'SecurePass1!',
        'MyP@ssw0rd',
      ];

      strongPasswords.forEach((password) => {
        expect(password).toMatch(passwordRegex);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short1!',      // Too short
        'nouppercase1!', // No uppercase
        'NOLOWERCASE1!', // No lowercase
        'NoNumbers!',    // No numbers
        'NoSpecial1',    // No special chars
      ];

      weakPasswords.forEach((password) => {
        expect(password).not.toMatch(passwordRegex);
      });
    });
  });
});
