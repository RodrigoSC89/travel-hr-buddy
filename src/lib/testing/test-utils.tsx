/**
 * Test Utilities - PROMPT 7
 * Comprehensive testing helpers
 */

import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/layout/theme-provider";

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
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

interface AllTheProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="test-theme">
          <TooltipProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from "@testing-library/react";
export { customRender as render };

// Common test helpers
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  role: "admin",
  app_metadata: {},
  user_metadata: { full_name: "Test User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
};

export const mockSession = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: "bearer",
  user: mockUser,
};

// Mock Supabase responses
export const mockSupabaseResponse = <T>(data: T, error = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : null,
  status: 200,
  statusText: "OK",
});

// Mock vessel data
export const mockVessel = {
  id: "vessel-001",
  name: "Test Vessel",
  imo_number: "1234567",
  flag: "Panama",
  vessel_type: "Cargo",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Mock crew member data
export const mockCrewMember = {
  id: "crew-001",
  full_name: "John Doe",
  rank: "Captain",
  nationality: "Brazilian",
  vessel_id: "vessel-001",
  status: "active",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Performance test helpers
export const measureRenderTime = async (
  component: ReactElement
): Promise<number> => {
  const start = performance.now();
  render(component);
  await waitForLoadingToFinish();
  return performance.now() - start;
};

// Accessibility test helpers
export const a11yTestConfig = {
  rules: {
    "color-contrast": { enabled: true },
    "label": { enabled: true },
    "button-name": { enabled: true },
    "image-alt": { enabled: true },
  },
};
