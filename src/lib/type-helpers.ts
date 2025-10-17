/**
 * Type Helper Utilities
 * Helper functions to safely convert between null and undefined types
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
  if (typeof obj !== 'object') return obj;
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
