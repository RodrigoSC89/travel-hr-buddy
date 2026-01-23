/**
 * Unit Tests - OAuth Providers
 * PATCH: Audit Sprint 3 - Test coverage improvement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  OAUTH_PROVIDERS, 
  getAvailableProviders, 
  isProviderEnabled 
} from '@/lib/auth/oauth-providers';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: { user: { id: 'test' } } }, 
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
  },
}));

describe('OAuth Providers', () => {
  describe('OAUTH_PROVIDERS', () => {
    it('should have Google provider configured', () => {
      expect(OAUTH_PROVIDERS.google).toBeDefined();
      expect(OAUTH_PROVIDERS.google.displayName).toBe('Google');
      expect(OAUTH_PROVIDERS.google.scopes).toContain('email');
    });

    it('should have GitHub provider configured', () => {
      expect(OAUTH_PROVIDERS.github).toBeDefined();
      expect(OAUTH_PROVIDERS.github.displayName).toBe('GitHub');
    });

    it('should have Azure (Microsoft) provider configured', () => {
      expect(OAUTH_PROVIDERS.azure).toBeDefined();
      expect(OAUTH_PROVIDERS.azure.displayName).toBe('Microsoft');
    });
  });

  describe('getAvailableProviders', () => {
    it('should return all providers', () => {
      const providers = getAvailableProviders();
      expect(providers).toHaveLength(3);
    });

    it('should include required properties', () => {
      const providers = getAvailableProviders();
      providers.forEach((provider) => {
        expect(provider.provider).toBeDefined();
        expect(provider.displayName).toBeDefined();
        expect(provider.icon).toBeDefined();
      });
    });
  });

  describe('isProviderEnabled', () => {
    it('should return true for configured providers', async () => {
      const result = await isProviderEnabled('google');
      expect(result).toBe(true);
    });
  });
});
