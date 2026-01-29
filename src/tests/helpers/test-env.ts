/**
 * Test Environment Helpers
 * Provides mock environment utilities for testing
 */

import { vi } from "vitest";

// Mock environment storage for tests
let mockEnvValues: Record<string, string | undefined> = {};

/**
 * Setup mock environment values for tests
 */
export function setupMockEnv(overrides: Record<string, string | undefined> = {}) {
  mockEnvValues = {
    VITE_OPENAI_API_KEY: "test-api-key",
    VITE_MQTT_URL: "ws://localhost:1883",
    VITE_MQTT_USER: undefined,
    VITE_MQTT_PASS: undefined,
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_PUBLISHABLE_KEY: "test-key",
    ...overrides,
  };
}

/**
 * Get mock env value
 */
export function getMockEnvVar(key: string, defaultValue = ""): string {
  return mockEnvValues[key] ?? defaultValue;
}

/**
 * Set mock env value for a specific test
 */
export function setMockEnvVar(key: string, value: string | undefined) {
  mockEnvValues[key] = value;
}

/**
 * Clear all mock env values
 */
export function clearMockEnv() {
  mockEnvValues = {};
}

/**
 * Check if API key is configured (not empty or placeholder)
 */
export function isApiKeyConfigured(key: string): boolean {
  const value = mockEnvValues[key];
  return Boolean(value && value !== "" && !value.includes("your_") && !value.includes("_here"));
}

/**
 * Create a mock for environment access functions
 */
export function createEnvMock() {
  return vi.fn((key: string, defaultValue = "") => {
    return getMockEnvVar(key, defaultValue);
  });
}
