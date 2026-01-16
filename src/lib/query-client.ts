/**
 * Query Client Configuration
 * Separated to ensure consistent React instance usage
 */
import { QueryClient } from "@tanstack/react-query";

// Create query client once
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 1000 * 60 * 5, 
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
