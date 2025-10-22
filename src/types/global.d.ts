// @ts-nocheck
declare global {
  type Nullable<T> = T | null | undefined;
  interface Json { [key: string]: any }
  type SafeRecord = Record<string, any>;
  type SupabaseTable<T = any> = T & { id?: string; created_at?: string; updated_at?: string };
}
export {};
