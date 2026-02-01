/**
 * Webhook Types - Sprint 2 Type Safety
 * Strongly typed interfaces for webhook operations
 */

// Webhook event payload types
export interface DocumentEventPayload {
  documentId: string;
  documentName: string;
  action: 'uploaded' | 'updated' | 'deleted';
  uploadedBy?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface UserEventPayload {
  userId: string;
  email?: string;
  action: 'login' | 'logout' | 'created' | 'updated';
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SystemEventPayload {
  eventType: 'error' | 'warning' | 'info';
  message: string;
  module?: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Union type for all webhook payloads
export type WebhookPayload =
  | DocumentEventPayload
  | UserEventPayload
  | SystemEventPayload
  | Record<string, unknown>;

// Webhook event names
export type WebhookEventName =
  | 'document.uploaded'
  | 'document.updated'
  | 'document.deleted'
  | 'user.login'
  | 'user.logout'
  | 'user.created'
  | 'user.updated'
  | 'system.error'
  | 'system.warning'
  | 'system.info';
