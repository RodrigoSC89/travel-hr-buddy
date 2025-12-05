/**
 * PATCH 838: Smart Notification System
 * Intelligent, contextual notifications with priority management
 */

import { useState, useEffect, useCallback } from 'react';

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low';
export type NotificationCategory = 
  | 'safety' 
  | 'maintenance' 
  | 'crew' 
  | 'compliance' 
  | 'system' 
  | 'performance'
  | 'alert';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  category: NotificationCategory;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  groupId?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  categories: Record<NotificationCategory, boolean>;
  quietHours: { start: number; end: number } | null;
  groupSimilar: boolean;
  maxVisible: number;
}

class SmartNotificationManager {
  private notifications: SmartNotification[] = [];
  private preferences: NotificationPreferences;
  private listeners: Set<(notifications: SmartNotification[]) => void> = new Set();
  private permission: NotificationPermission = 'default';

  constructor() {
    this.preferences = this.loadPreferences();
    this.checkPermission();
  }

  private loadPreferences(): NotificationPreferences {
    const saved = localStorage.getItem('notification-preferences');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      enabled: true,
      sound: true,
      vibration: true,
      categories: {
        safety: true,
        maintenance: true,
        crew: true,
        compliance: true,
        system: true,
        performance: true,
        alert: true,
      },
      quietHours: null,
      groupSimilar: true,
      maxVisible: 5,
    };
  }

  private savePreferences(): void {
    localStorage.setItem('notification-preferences', JSON.stringify(this.preferences));
  }

  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      this.permission = 'denied';
      return this.permission;
    }

    this.permission = Notification.permission;
    return this.permission;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  // Add a notification
  add(notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newNotification: SmartNotification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };

    // Check if should show
    if (!this.shouldShow(newNotification)) {
      return id;
    }

    // Group similar notifications
    if (this.preferences.groupSimilar && notification.groupId) {
      const existingIndex = this.notifications.findIndex(
        n => n.groupId === notification.groupId && !n.read
      );
      if (existingIndex !== -1) {
        this.notifications[existingIndex] = newNotification;
        this.notifyListeners();
        return id;
      }
    }

    this.notifications.unshift(newNotification);
    
    // Limit stored notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }

    this.notifyListeners();
    this.showNativeNotification(newNotification);
    this.playNotificationSound(newNotification);

    return id;
  }

  // Mark as read
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  // Remove notification
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all
  clearAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all notifications
  getAll(): SmartNotification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get by category
  getByCategory(category: NotificationCategory): SmartNotification[] {
    return this.notifications.filter(n => n.category === category);
  }

  // Get by priority
  getByPriority(priority: NotificationPriority): SmartNotification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  // Update preferences
  updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  // Get preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Subscribe to changes
  subscribe(callback: (notifications: SmartNotification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(cb => cb(notifications));
  }

  private shouldShow(notification: SmartNotification): boolean {
    // Check if notifications are enabled
    if (!this.preferences.enabled) return false;

    // Check category preference
    if (!this.preferences.categories[notification.category]) return false;

    // Check quiet hours
    if (this.preferences.quietHours && notification.priority !== 'urgent') {
      const now = new Date();
      const hour = now.getHours();
      const { start, end } = this.preferences.quietHours;
      
      if (start < end) {
        if (hour >= start && hour < end) return false;
      } else {
        if (hour >= start || hour < end) return false;
      }
    }

    // Check expiration
    if (notification.expiresAt && new Date() > notification.expiresAt) {
      return false;
    }

    return true;
  }

  private async showNativeNotification(notification: SmartNotification): Promise<void> {
    if (this.permission !== 'granted') return;
    if (!this.preferences.enabled) return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: notification.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.groupId || notification.id,
      requireInteraction: notification.priority === 'urgent',
      data: { url: notification.actionUrl },
    };

    try {
      const native = new Notification(notification.title, options);
      
      native.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        this.markAsRead(notification.id);
        native.close();
      };
    } catch (error) {
      console.error('Failed to show native notification:', error);
    }
  }

  private playNotificationSound(notification: SmartNotification): void {
    if (!this.preferences.sound) return;

    // Play different sounds based on priority
    const soundUrl = notification.priority === 'urgent'
      ? '/sounds/urgent.mp3'
      : '/sounds/notification.mp3';

    try {
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // Sound playback failed
    }

    // Vibration for mobile
    if (this.preferences.vibration && 'vibrate' in navigator) {
      const pattern = notification.priority === 'urgent'
        ? [200, 100, 200, 100, 200]
        : [100, 50, 100];
      navigator.vibrate(pattern);
    }
  }
}

export const smartNotifications = new SmartNotificationManager();

// React hooks
export function useNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setNotifications(smartNotifications.getAll());
    setUnreadCount(smartNotifications.getUnreadCount());

    const unsubscribe = smartNotifications.subscribe((notifs) => {
      setNotifications(notifs);
      setUnreadCount(smartNotifications.getUnreadCount());
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    add: smartNotifications.add.bind(smartNotifications),
    markAsRead: smartNotifications.markAsRead.bind(smartNotifications),
    markAllAsRead: smartNotifications.markAllAsRead.bind(smartNotifications),
    remove: smartNotifications.remove.bind(smartNotifications),
    clearAll: smartNotifications.clearAll.bind(smartNotifications),
  };
}

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    smartNotifications.checkPermission().then(setPermission);
  }, []);

  const requestPermission = useCallback(async () => {
    const perm = await smartNotifications.requestPermission();
    setPermission(perm);
    return perm;
  }, []);

  return { permission, requestPermission };
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState(smartNotifications.getPreferences());

  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    smartNotifications.updatePreferences(updates);
    setPreferences(smartNotifications.getPreferences());
  }, []);

  return { preferences, updatePreferences };
}
