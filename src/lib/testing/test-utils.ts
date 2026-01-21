/**
 * Test Utilities
 * PATCH v27: Shared testing utilities for unit and integration tests
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a test query client with sensible defaults
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Mock Supabase client for testing
 */
export const mockSupabaseClient = {
  auth: {
    getSession: async () => ({
      data: { session: null },
      error: null,
    }),
    getUser: async () => ({
      data: { user: null },
      error: null,
    }),
    signInWithPassword: async () => ({
      data: { session: null, user: null },
      error: null,
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        limit: () => ({ data: [], error: null }),
      }),
      limit: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
    }),
    insert: () => ({
      select: () => ({ data: null, error: null }),
    }),
    update: () => ({
      eq: () => ({ data: null, error: null }),
    }),
    delete: () => ({
      eq: () => ({ data: null, error: null }),
    }),
  }),
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      download: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  
  throw new Error(`waitFor timed out after ${timeout}ms`);
}

/**
 * Create a mock user for testing
 */
export function createMockUser(overrides = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'authenticated',
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create a mock session for testing
 */
export function createMockSession(overrides = {}) {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: createMockUser(),
    ...overrides,
  };
}

/**
 * Flush promises - useful for testing async code
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
