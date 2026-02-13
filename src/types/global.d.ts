// PATCH 68.2 - Extended global type declarations
// Handles Supabase type mismatches and flexible typing
declare global {
  type Nullable<T> = T | null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Json interface must match Supabase Json type for assignment compatibility
  interface Json { [key: string]: any }
  type SafeRecord = Record<string, unknown>;
  type SupabaseTable<T = Record<string, unknown>> = T & { id?: string; created_at?: string; updated_at?: string };
  
  // Allow flexible ResultOne type from Supabase queries
  interface ResultOne {
    [key: string]: unknown;
  }
  
  // Allow flexible type for MqttClient
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- MqttClient external library interop
  interface MqttClient {
    [key: string]: any;
  }
}
export {};