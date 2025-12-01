// PATCH 68.2 - Extended global type declarations
// Handles Supabase type mismatches and flexible typing
declare global {
  type Nullable<T> = T | null | undefined;
  interface Json { [key: string]: any }
  type SafeRecord = Record<string, any>;
  type SupabaseTable<T = any> = T & { id?: string; created_at?: string; updated_at?: string };
  
  // Allow flexible ResultOne type from Supabase queries
  interface ResultOne {
    [key: string]: any;
  }
  
  // Allow flexible type for MqttClient
  interface MqttClient {
    [key: string]: any;
  }
}
export {};
