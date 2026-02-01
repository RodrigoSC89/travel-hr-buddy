/**
 * Audit Protocol Types - Sprint 2 Type Safety
 * Strongly typed interfaces for offline audit operations
 */

// Resource value types (for create/update/delete operations)
export interface AuditResourceValue {
  id?: string;
  [key: string]: unknown;
}

// Audit entry details - operation is optional for flexibility
export interface AuditEntryDetails {
  operation?: 'create' | 'update' | 'delete' | 'access' | 'logout';
  changedFields?: string[];
  method?: string;
  success?: boolean;
  action?: string;
  inputLength?: number;
  outputLength?: number;
  [key: string]: unknown;
}

// Stored audit entry (for JSON parsing)
export interface StoredAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName?: string;
  action: string;
  module: string;
  resourceType: string;
  resourceId?: string;
  details: AuditEntryDetails;
  previousValue?: AuditResourceValue;
  newValue?: AuditResourceValue;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  synced: boolean;
  syncedAt?: string;
  hash?: string;
}

// Encrypted data structure - compatible with local-crypto
export interface EncryptedData {
  iv: string;
  ciphertext: string;
  data?: string;
  version?: number;
  salt?: string;
}

// Change detection helper
export interface FieldChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}
