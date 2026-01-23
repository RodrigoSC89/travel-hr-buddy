/**
 * Unit Tests - Enhanced Auth Service
 * PATCH: Audit Sprint 3 - Test coverage improvement
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  secureLogout, 
  getActiveSession, 
  isAuthenticated,
  getSessionMetadata,
  initializeTokenRefresh,
  destroyTokenRefresh 
} from '@/services/enhanced-auth-service';

// Mock supabase client
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signOut: () => mockSignOut(),
      getSession: () => mockGetSession(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      refreshSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
    },
  },
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Enhanced Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    destroyTokenRefresh();
  });

  describe('secureLogout', () => {
    it('should logout successfully when session exists', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: { user: { id: 'test' } } }, 
        error: null 
      });
      mockSignOut.mockResolvedValue({ error: null });

      const result = await secureLogout();
      expect(result.success).toBe(true);
    });

    it('should handle logout when no session exists', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      });

      const result = await secureLogout();
      expect(result.success).toBe(true);
    });

    it('should return error when signOut fails', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: { user: { id: 'test' } } }, 
        error: null 
      });
      mockSignOut.mockResolvedValue({ 
        error: { message: 'Logout failed' } 
      });

      const result = await secureLogout();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Logout failed');
    });
  });

  describe('getActiveSession', () => {
    it('should return session info when authenticated', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      mockGetSession.mockResolvedValue({ 
        data: { 
          session: { 
            user: { id: 'test' },
            expires_at: futureTime
          } 
        }, 
        error: null 
      });

      const result = await getActiveSession();
      expect(result.session).not.toBeNull();
      expect(result.expiresIn).toBeGreaterThan(0);
      expect(result.isExpiringSoon).toBe(false);
    });

    it('should return null session when not authenticated', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      });

      const result = await getActiveSession();
      expect(result.session).toBeNull();
      expect(result.expiresIn).toBe(0);
    });

    it('should detect expiring sessions', async () => {
      const soonTime = Math.floor(Date.now() / 1000) + 120; // 2 minutes from now
      mockGetSession.mockResolvedValue({ 
        data: { 
          session: { 
            user: { id: 'test' },
            expires_at: soonTime
          } 
        }, 
        error: null 
      });

      const result = await getActiveSession();
      expect(result.isExpiringSoon).toBe(true);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: { user: { id: 'test' } } }, 
        error: null 
      });

      const result = await isAuthenticated();
      expect(result).toBe(true);
    });

    it('should return false when no session', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      });

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockGetSession.mockRejectedValue(new Error('Network error'));

      const result = await isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getSessionMetadata', () => {
    it('should return metadata for active session', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours
      mockGetSession.mockResolvedValue({ 
        data: { 
          session: { 
            user: { 
              id: 'test-user-id',
              email: 'test@example.com',
              created_at: new Date().toISOString()
            },
            expires_at: futureTime
          } 
        }, 
        error: null 
      });

      const result = await getSessionMetadata();
      expect(result).not.toBeNull();
      expect(result?.userId).toBe('test-user-id');
      expect(result?.email).toBe('test@example.com');
      expect(result?.tokenType).toBe('Bearer');
    });

    it('should return null when no session', async () => {
      mockGetSession.mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      });

      const result = await getSessionMetadata();
      expect(result).toBeNull();
    });
  });

  describe('Token Refresh Manager', () => {
    it('should initialize without errors', () => {
      expect(() => initializeTokenRefresh()).not.toThrow();
    });

    it('should destroy without errors', () => {
      initializeTokenRefresh();
      expect(() => destroyTokenRefresh()).not.toThrow();
    });
  });
});
