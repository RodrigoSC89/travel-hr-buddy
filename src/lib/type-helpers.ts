/**
 * Type Helper Utilities
 * Helper functions to safely convert between null and undefined types
 * PATCH: strictNullChecks Phase 1 - Enhanced null safety
 */

/**
 * Converts null values to undefined
 * Useful for handling Supabase data where null is returned but TypeScript expects undefined
 */
export function nullToUndefined<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * Converts undefined values to null
 * Useful for preparing data to send to Supabase where undefined is not allowed
 */
export function undefinedToNull<T>(value: T | undefined): T | null {
  return value === undefined ? null : value;
}

/**
 * Deep converts all null values in an object to undefined
 */
export function deepNullToUndefined<T>(obj: T): T {
  if (obj === null) return undefined as T;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => deepNullToUndefined(item)) as T;
  }
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = deepNullToUndefined(value);
  }
  return result as T;
}

/**
 * Safely coerce null | undefined to a specific type with a default value
 */
export function withDefault<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * Assert that a value is not null or undefined
 * Throws if value is nullish - use only when you're certain the value exists
 */
export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (value == null) {
    throw new Error(message ?? "Expected non-null value");
  }
  return value;
}

/**
 * Type guard to check if a value is defined (not null and not undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Safe access to nested object properties
 * Returns undefined if any part of the path is null/undefined
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  return obj?.[key];
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Convert optional array to non-null array
 */
export function toArray<T>(value: T[] | null | undefined): T[] {
  return value ?? [];
}

/**
 * Convert optional string to non-null string
 */
export function toString(value: string | null | undefined, fallback: string = ""): string {
  return value ?? fallback;
}

/**
 * Convert optional number to non-null number
 */
export function toNumber(value: number | null | undefined, fallback: number = 0): number {
  if (value == null || isNaN(value)) return fallback;
  return value;
}
