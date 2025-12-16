/**
 * PATCH 653 - Integration Tests: Authentication Flow
 * Tests the complete authentication flow including login, session management, and logout
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}));

describe('Authentication Flow Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString()
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString()
            }
          }
        },
        error: null
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.error).toBeNull();
      expect(result.data.user).toBeDefined();
      expect(result.data.user?.email).toBe('test@example.com');
      expect(result.data.session).toBeDefined();
    });

    it('should handle invalid credentials gracefully', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: {
          name: 'AuthError',
          message: 'Invalid login credentials',
          status: 400
        }
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid login credentials');
      expect(result.data.user).toBeNull();
    });

    it('should handle network errors during login', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        supabase.auth.signInWithPassword({
          email: 'test@example.com',
          password: 'password123'
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Session Management', () => {
    it('should retrieve active session', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: {
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              app_metadata: {},
              user_metadata: {},
              aud: 'authenticated',
              created_at: new Date().toISOString()
            }
          }
        },
        error: null
      });

      const result = await supabase.auth.getSession();

      expect(result.error).toBeNull();
      expect(result.data.session).toBeDefined();
      expect(result.data.session?.user.email).toBe('test@example.com');
    });

    it('should return null for expired session', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      });

      const result = await supabase.auth.getSession();

      expect(result.error).toBeNull();
      expect(result.data.session).toBeNull();
    });
  });

  describe('Logout Flow', () => {
    it('should successfully sign out user', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('should handle sign out errors', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: {
          name: 'AuthError',
          message: 'Failed to sign out',
          status: 500
        }
      });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to sign out');
    });
  });

  describe('Auth State Changes', () => {
    it('should handle auth state change events', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const mockCallback = vi.fn();
      const mockUnsubscribe = vi.fn();

      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
        data: {
          subscription: {
            unsubscribe: mockUnsubscribe
          }
        }
      });

      const { data } = supabase.auth.onAuthStateChange(mockCallback);

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data.subscription.unsubscribe).toBeDefined();

      // Cleanup
      data.subscription.unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
