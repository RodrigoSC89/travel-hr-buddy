import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { TenantProvider } from "@/contexts/TenantContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { vi, beforeEach, afterEach } from "vitest";

/**
 * Create a new QueryClient for each test to ensure isolation
 */
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: React.ReactNode;
}

/**
 * Wrapper component with all necessary providers
 */
export const AllTheProviders = memo(({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            <OrganizationProvider>
              {children}
            </OrganizationProvider>
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function that includes all providers
 */
export const renderWithProviders = memo((
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

/**
 * Wait for all loading states to finish
 */
export const waitForLoadingToFinish = async () => {
  const { findByTestId, queryByTestId } = await import("@testing-library/react");
  
  // Wait for any loading spinners to disappear
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return new Promise<void>((resolve) => {
    const checkLoading = () => {
      const loadingElements = document.querySelectorAll("[data-loading=\"true\"]");
      if (loadingElements.length === 0) {
        resolve();
      } else {
        setTimeout(checkLoading, 50);
      };
    };
    checkLoading();
  });
};

/**
 * Mock Supabase client for testing
 */
export const createMockSupabaseClient = () => ({
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
  })),
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signIn: vi.fn().mockResolvedValue({ data: null, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: "mock-url" } }),
    })),
  },
});

/**
 * Create mock user for authentication tests
 */
export const createMockUser = (overrides = {}) => ({
  id: "test-user-id",
  email: "test@nautilus.com",
  user_metadata: {
    name: "Test User",
    role: "operator",
  },
  ...overrides,
});

/**
 * Create mock session for authentication tests
 */
export const createMockSession = (userOverrides = {}) => ({
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_at: Date.now() + 3600000,
  user: createMockUser(userOverrides),
});

/**
 * Suppress console errors during tests
 */
export const suppressConsoleError = memo(() => {
  const originalError = console.error;
  beforeEach(() => {
  });
  afterEach(() => {
  });
};

/**
 * Mock fetch for API tests
 */
export const mockFetch = memo((response: SupabaseResponse<unknown>, options = {}) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      ...options,
    })
  ) as unknown;
};

/**
 * Reset all mocks between tests
 */
export const resetAllMocks = memo(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
};

// Re-export testing library utilities
export * from "@testing-library/react";
