/**
 * API Response Types
 * Centralized type definitions for API responses and data structures
 * Replaces 'any' types with proper TypeScript interfaces
 */

// ============================================================================
// GENERIC API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Error response from API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

// ============================================================================
// COMMON DATA TYPES
// ============================================================================

/**
 * Generic data item with ID and timestamps
 */
export interface DataItem {
  id: string | number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

/**
 * Generic list item for .map() operations
 */
export interface ListItem<T = unknown> {
  id: string | number;
  label?: string;
  value?: T;
  [key: string]: unknown;
}

/**
 * Generic option for select/dropdown components
 */
export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  [key: string]: unknown;
}

/**
 * Generic form data
 */
export interface FormData {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Generic filter/search parameters
 */
export interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

// ============================================================================
// SUPABASE TYPES
// ============================================================================

/**
 * Supabase response for database operations
 */
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
}

/**
 * Supabase error object
 */
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

/**
 * Supabase realtime update payload
 */
export interface RealtimePayload<T> {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  record: T | null;
  oldRecord: T | null;
  errors?: string[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Generic component props
 */
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

/**
 * Generic event handler
 */
export type EventHandler<T = unknown> = (event: T) => void;

/**
 * Generic change handler
 */
export type ChangeHandler<T = unknown> = (value: T) => void;

/**
 * Generic callback function
 */
export type Callback<T = void, P = unknown> = (param?: P) => T;

// ============================================================================
// STATE MANAGEMENT TYPES
// ============================================================================

/**
 * Generic reducer action
 */
export interface Action<T = string, P = unknown> {
  type: T;
  payload?: P;
}

/**
 * Generic state with loading and error
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Generic status type
 */
export type Status = 'idle' | 'loading' | 'success' | 'error';

// ============================================================================
// CHART AND DATA VISUALIZATION TYPES
// ============================================================================

/**
 * Generic chart data point
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

/**
 * Generic chart series
 */
export interface ChartSeries<T = ChartDataPoint> {
  name: string;
  data: T[];
  [key: string]: unknown;
}

/**
 * Generic chart configuration
 */
export interface ChartConfig {
  title?: string;
  xAxis?: string;
  yAxis?: string;
  [key: string]: unknown;
}

// ============================================================================
// ARRAY OPERATION TYPES
// ============================================================================

/**
 * Generic array item for .filter() operations
 */
export interface FilterableItem {
  id: string | number;
  [key: string]: unknown;
}

/**
 * Generic array item for .reduce() operations
 */
export interface ReducibleItem {
  value: number;
  [key: string]: unknown;
}

/**
 * Generic array item for .map() operations
 */
export interface MappableItem<T = unknown> {
  id: string | number;
  data: T;
  [key: string]: unknown;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make all properties of T optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Make all properties of T required
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Pick specific properties from T
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omit specific properties from T
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Record with string keys and values of type T
 */
export type Record<K extends string | number | symbol, T> = {
  [P in K]: T;
};

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

/**
 * Validator function
 */
export type Validator<T> = (value: T) => ValidationResult;

/**
 * Type guard function
 */
export type TypeGuard<T> = (value: unknown): value is T;
