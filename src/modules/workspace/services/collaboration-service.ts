/**
 * PATCH 102.0 - Collaboration Service
 */

import { WorkspaceMember, ChatMessage, UploadedFile, CalendarEvent, Notification } from '../types';
import { supabase } from '@/integrations/supabase/client';

class CollaborationService {
  private members: Map<string, WorkspaceMember> = new Map();
  private messages: ChatMessage[] = [];
  private files: UploadedFile[] = [];
  private events: CalendarEvent[] = [];
  private notifications: Notification[] = [];

  constructor() {
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Initialize with demo members
    const demoMembers: WorkspaceMember[] = [
      { id: '1', name: 'Ana Silva', email: 'ana@example.com', status: 'online' },
      { id: '2', name: 'Carlos Santos', email: 'carlos@example.com', status: 'online' },
      { id: '3', name: 'Maria Oliveira', email: 'maria@example.com', status: 'away' },
      { id: '4', name: 'João Costa', email: 'joao@example.com', status: 'offline' }
    ];

    demoMembers.forEach(member => this.members.set(member.id, member));

    // Initialize demo messages
    this.messages = [
      {
        id: '1',
        userId: '1',
        userName: 'Ana Silva',
        content: 'Welcome to the collaborative workspace!',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: '2',
        userId: '2',
        userName: 'Carlos Santos',
        content: 'Looking forward to working together',
        timestamp: new Date(Date.now() - 1800000)
      }
    ];
  }

  // Members management
  getOnlineMembers(): WorkspaceMember[] {
    return Array.from(this.members.values()).filter(m => m.status === 'online');
  }

  getAllMembers(): WorkspaceMember[] {
    return Array.from(this.members.values());
  }

  updateMemberStatus(userId: string, status: WorkspaceMember['status']) {
    const member = this.members.get(userId);
    if (member) {
      member.status = status;
      member.lastSeen = new Date();
    }
  }

  // Chat functionality
  sendMessage(userId: string, content: string): ChatMessage {
    const member = this.members.get(userId);
    const message: ChatMessage = {
      id: this.generateId(),
      userId,
      userName: member?.name || 'Unknown',
      userAvatar: member?.avatar,
      content,
      timestamp: new Date()
    };

    this.messages.push(message);
    
    // Trigger notification for other users
    this.createNotification('message', 'New Message', content, userId);

    return message;
  }

  getMessages(limit: number = 50): ChatMessage[] {
    return [...this.messages].slice(-limit);
  }

  // File upload
  uploadFile(file: File, uploadedBy: string): UploadedFile {
    const uploadedFile: UploadedFile = {
      id: this.generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedBy,
      uploadedAt: new Date()
    };

    this.files.push(uploadedFile);
    
    // Trigger notification
    this.createNotification('file', 'File Uploaded', `${file.name} was uploaded`, uploadedBy);

    return uploadedFile;
  }

  getFiles(): UploadedFile[] {
    return [...this.files].reverse();
  }

  // Calendar integration
  createEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      id: this.generateId(),
      ...event
    };

    this.events.push(newEvent);
    
    // Notify attendees
    event.attendees.forEach(attendeeId => {
      this.createNotification('event', 'New Event', event.title, attendeeId);
    });

    return newEvent;
  }

  getUpcomingEvents(limit: number = 10): CalendarEvent[] {
    const now = new Date();
    return this.events
      .filter(e => e.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, limit);
  }

  // Notifications
  private createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    userId: string
  ): void {
    // Create notification for all members except the triggering user
    this.members.forEach((member) => {
      if (member.id !== userId) {
        const notification: Notification = {
          id: this.generateId(),
          type,
          title,
          message,
          timestamp: new Date(),
          isRead: false,
          userId: member.id
        };

        this.notifications.push(notification);
      }
    });
  }

  getNotifications(userId: string, unreadOnly: boolean = false): Notification[] {
    let userNotifications = this.notifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
      userNotifications = userNotifications.filter(n => !n.isRead);
    }

    return userNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  markNotificationAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const collaborationService = new CollaborationService();
