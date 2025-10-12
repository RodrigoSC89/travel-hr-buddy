/**
 * Common type definitions for the Travel HR Buddy application
 * Use these types instead of 'any' to improve type safety
 */

// Generic API Response
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string | null;
  success: boolean;
  message?: string;
}

// Generic Error Response
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

// Supabase Query Response
export interface SupabaseResponse<T> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// Generic Data Record
export type DataRecord = Record<string, unknown>;

// Generic JSON Object
export type JsonObject = Record<string, JsonValue>;
export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

// Pagination
export interface PaginationParams {
  page: number;
  perPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

// Form Data
export type FormData = Record<string, string | number | boolean | null | undefined>;

// Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Event Handlers
export type EventHandler<T = unknown> = (event: T) => void;
export type AsyncEventHandler<T = unknown> = (event: T) => Promise<void>;

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Select Option
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

// Date Range
export interface DateRange {
  from: Date | null;
  to: Date | null;
}

// File Upload
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
}

// User Identity (minimal)
export interface UserIdentity {
  id: string;
  email: string;
  name?: string;
}

// Metadata
export type Metadata = Record<string, string | number | boolean | null>;

// Service Configuration
export interface ServiceConfig {
  apiKey?: string;
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// HTTP Method
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Async Operation Result
export interface AsyncResult<T = void, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

// Toast Notification
export interface ToastMessage {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}
