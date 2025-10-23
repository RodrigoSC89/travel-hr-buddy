# Comunicação Module

## Purpose / Description

The Comunicação (Communication) module is the **central communication and messaging hub** for the organization. It provides unified messaging, notifications, and collaboration tools for internal and external communication.

**Key Use Cases:**
- Send and receive internal messages
- Create and manage announcements
- Real-time chat and collaboration
- Push notifications and alerts
- Email integration and management
- Team channels and group messaging
- Communication history and archiving

## Folder Structure

```bash
src/modules/comunicacao/
├── components/      # Communication UI components (ChatBox, MessageList, NotificationCenter)
├── pages/           # Communication pages (Inbox, Chat, Announcements)
├── hooks/           # Hooks for messaging, notifications, real-time updates
├── services/        # Communication services and real-time messaging
├── types/           # TypeScript types for messages, notifications, channels
└── utils/           # Utilities for message formatting and notifications
```

## Main Components / Files

- **ChatBox.tsx** — Real-time chat interface
- **MessageList.tsx** — Display message threads
- **NotificationCenter.tsx** — Manage all notifications
- **AnnouncementCard.tsx** — Display company announcements
- **messagingService.ts** — Real-time messaging service
- **notificationService.ts** — Push notification management

## External Integrations

- **Supabase Realtime** — Real-time messaging and presence
- **Push Notifications API** — Web and mobile notifications
- **Centro Notificações Module** — Integration with notification center

## Status

🟢 **Functional** — Communication features operational

## TODOs / Improvements

- [ ] Add video call integration (Zoom, Meet)
- [ ] Implement message search and filters
- [ ] Add file sharing in messages
- [ ] Create message templates
- [ ] Add read receipts and typing indicators
- [ ] Implement message reactions and emojis
- [ ] Add communication analytics
