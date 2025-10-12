/**
 * Common Type Definitions
 * 
 * Reusable TypeScript types to replace 'any' and improve type safety.
 * All types use double quotes for strings as per project standards.
 */

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

/**
 * Supabase response wrapper
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

/**
 * Generic data record with string keys
 */
export type DataRecord = Record<string, unknown>;

/**
 * JSON-compatible value types
 */
export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

/**
 * Async operation result with error handling
 */
export type AsyncResult<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Loading state for async operations
 */
export type LoadingState = "idle" | "loading" | "success" | "error";

/**
 * Generic select option for dropdowns
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  perPage: number;
  total?: number;
}

/**
 * Date range filter
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * File upload metadata
 */
export interface FileUpload {
  file: File;
  name: string;
  size: number;
  type: string;
  url?: string;
}

/**
 * User profile structure
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  day: string;
  count: number;
}

/**
 * Generic form values
 */
export type FormValues = Record<string, unknown>;

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Callback function type
 */
export type Callback<T = void> = () => T;

/**
 * Async callback function type
 */
export type AsyncCallback<T = void> = () => Promise<T>;
