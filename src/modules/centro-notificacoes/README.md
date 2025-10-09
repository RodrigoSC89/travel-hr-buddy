# Centro de Notificações Module

## Purpose / Description

The Centro de Notificações (Notification Center) module is the **centralized notification management system** that handles all types of alerts, notifications, and user communications across the platform.

**Key Use Cases:**

- Display system-wide notifications
- Manage notification preferences
- Push notifications to web and mobile
- Real-time alert delivery
- Notification history and archive
- Priority-based notification routing
- Notification read/unread status tracking

## Folder Structure

```bash
src/modules/centro-notificacoes/
├── components/      # Notification UI components (NotificationBell, NotificationCard, PreferencesPanel)
├── pages/           # Notification center pages and settings
├── hooks/           # Hooks for notification subscriptions and management
├── services/        # Notification services and delivery
├── types/           # TypeScript types for notifications and preferences
└── utils/           # Notification formatting and priority utilities
```

## Main Components / Files

- **NotificationBell.tsx** — Notification icon with unread count
- **NotificationCard.tsx** — Individual notification display
- **NotificationList.tsx** — Scrollable list of notifications
- **PreferencesPanel.tsx** — Configure notification preferences
- **notificationService.ts** — Notification management service
- **pushService.ts** — Push notification delivery

## External Integrations

- **Supabase Realtime** — Real-time notification delivery
- **Push Notifications API** — Web and mobile push notifications
- **Comunicação Module** — Integration with messaging system

## Status

🟢 **Functional** — Notification system operational

## TODOs / Improvements

- [ ] Add notification grouping and summarization
- [ ] Implement smart notification timing
- [ ] Add notification action buttons
- [ ] Create notification templates
- [ ] Add notification scheduling
- [ ] Implement do-not-disturb mode
- [ ] Add notification analytics
