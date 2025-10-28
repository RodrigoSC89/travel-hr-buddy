/**
 * Regulatory Channel - Type Definitions
 * PATCH 155.0 - Secure communication with regulatory bodies
 */

export interface RegulatoryAuthority {
  id: string;
  name: string;
  type: "Marinha" | "ANTAQ" | "Port Authority" | "Other";
  email: string;
  phone?: string;
  whatsapp?: string;
  contactPerson?: string;
}

export interface SecureSubmission {
  id: string;
  authorityId: string;
  submittedBy: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "sent" | "acknowledged" | "responded" | "closed";
  documents: SecureDocument[];
  encryptedData: string;
  encryptionKey: string;
  submittedAt: string;
  acknowledgedAt?: string;
  respondedAt?: string;
}

export interface SecureDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  encryptedUrl: string;
  checksum: string;
  uploadedAt: string;
}

export interface NotificationLog {
  id: string;
  submissionId: string;
  channel: "email" | "whatsapp" | "sms";
  recipient: string;
  message: string;
  sentAt: string;
  delivered: boolean;
  deliveredAt?: string;
}

export interface TrackingInfo {
  submissionId: string;
  status: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  action: string;
  description: string;
  performedBy?: string;
  timestamp: string;
}
