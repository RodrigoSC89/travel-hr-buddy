/**
 * PATCH 102.0 - Collaborative Workspace Types
 */

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  isEdited?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
  url?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  isOnline?: boolean;
}

export interface Notification {
  id: string;
  type: 'mention' | 'message' | 'file' | 'event' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  userId: string;
}
