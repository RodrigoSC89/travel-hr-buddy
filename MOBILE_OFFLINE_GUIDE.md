# 📱 Nautilus One - Mobile & Offline Features

## Overview

Nautilus One now supports hybrid mobile app deployment with full offline capabilities. This document covers the implementation of PATCHES 136.0-140.0.

## PATCH 136.0 - Capacitor Mobile Integration

### Features
- ✅ Native Android app support
- ✅ Native iOS app support
- ✅ Seamless web-to-native integration
- ✅ Native device features (Camera, Haptics, Notifications)

### Configuration
The app is configured in `capacitor.config.ts`:
- **App ID**: `com.nautilus.one`
- **App Name**: Nautilus One
- **Web Directory**: `dist`

### Build Commands
```bash
# Build the web app
npm run build

# Sync web assets to native platforms
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios

# Build and sync
npm run build && npx cap sync
```

### Native Plugins
- **@capacitor/camera** - Camera and photo access
- **@capacitor/haptics** - Haptic feedback
- **@capacitor/local-notifications** - Local notifications
- **@capacitor/push-notifications** - Push notifications

---

## PATCH 137.0 - Offline Mode with IndexedDB

### Features
- ✅ IndexedDB for local data storage
- ✅ Offline data caching
- ✅ Sync queue for offline actions
- ✅ PWA support with Workbox

### Implementation
**File**: `src/lib/localSync.ts`

The LocalSyncManager provides:
- `saveLocally()` - Save data for later sync
- `cacheData()` - Cache data for offline access
- `getCachedData()` - Retrieve cached data
- `getUnsyncedRecords()` - Get pending sync items
- `markAsSynced()` - Mark records as synchronized

### Usage Example
```typescript
import { localSync } from '@/lib/localSync';

// Save data offline
await localSync.saveLocally(
  { name: 'New Checklist', status: 'pending' },
  'checklists',
  'create'
);

// Cache data for offline access
await localSync.cacheData(
  'vessel-123',
  { id: 123, name: 'MV Neptune' },
  'vessels'
);

// Retrieve cached data
const vessel = await localSync.getCachedData('vessel-123');
```

---

## PATCH 138.0 - Firebase Push Notifications

### Features
- ✅ Firebase Cloud Messaging integration
- ✅ Background notifications
- ✅ Foreground message handling
- ✅ Token management with Supabase

### Setup
1. **Create Firebase Project** at [Firebase Console](https://console.firebase.google.com)
2. **Enable Cloud Messaging** in Project Settings
3. **Generate Web Push Certificate** (VAPID key)
4. **Add environment variables** to `.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### Implementation
**File**: `src/lib/firebase.ts`

```typescript
import { 
  initializeFirebase, 
  requestNotificationPermission,
  onForegroundMessage,
  saveFCMTokenToSupabase 
} from '@/lib/firebase';

// Initialize Firebase
await initializeFirebase();

// Request permission and get token
const token = await requestNotificationPermission();

// Save token to Supabase
if (token) {
  await saveFCMTokenToSupabase(token, userId, supabase);
}

// Listen for foreground messages
onForegroundMessage((payload) => {
  console.log('Notification received:', payload);
  // Show notification or update UI
});
```

### Database Schema
Create this table in Supabase:

```sql
CREATE TABLE user_fcm_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  fcm_token text NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('web', 'android', 'ios')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_type)
);

-- Enable RLS
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own tokens
CREATE POLICY "Users can manage own tokens"
  ON user_fcm_tokens
  FOR ALL
  USING (auth.uid() = user_id);
```

---

## PATCH 139.0 - Offline Data Sync Strategy

### Features
- ✅ Automatic sync on reconnection
- ✅ Manual sync trigger
- ✅ Periodic sync every 5 minutes
- ✅ Sync progress tracking

### Implementation
**File**: `src/lib/syncEngine.ts`

```typescript
import { syncEngine } from '@/lib/syncEngine';

// Save data with offline support
await syncEngine.saveOffline(
  'incidents',
  { title: 'New Incident', severity: 'high' },
  'create'
);

// Manually trigger sync
const stats = await syncEngine.pushLocalChanges();
console.log(`Synced ${stats.synced} records`);

// Check pending changes
const hasPending = await syncEngine.hasPendingChanges();
const count = await syncEngine.getPendingCount();

// Listen for sync progress
const unsubscribe = syncEngine.onSyncProgress((stats) => {
  console.log(`Progress: ${stats.synced}/${stats.total}`);
});
```

### Automatic Behaviors
- ✅ Auto-sync when connection is restored
- ✅ Periodic sync every 5 minutes (if online)
- ✅ Retry failed syncs on next opportunity
- ✅ Clean up old synced records after 24 hours

---

## PATCH 140.0 - Network Awareness & UI

### Features
- ✅ Real-time network status detection
- ✅ Visual offline banner
- ✅ Pending changes counter
- ✅ Manual sync button
- ✅ Automatic UI adaptations

### Components

#### useNetworkStatus Hook
**File**: `src/hooks/useNetworkStatus.ts`

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, wasOffline, pendingChanges } = useNetworkStatus();
  
  return (
    <div>
      Status: {isOnline ? 'Online' : 'Offline'}
      {pendingChanges > 0 && <span>{pendingChanges} pending</span>}
    </div>
  );
}
```

#### OfflineBanner Component
**File**: `src/components/OfflineBanner.tsx`

The banner automatically appears when:
- User goes offline
- There are pending changes to sync
- Connection is restored

Features:
- Shows network status (online/offline)
- Displays pending changes count
- Provides manual sync button
- Auto-hides when online with no pending changes

---

## Testing

### Test Offline Mode
1. Open Developer Tools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Create or modify data
5. Check that changes are saved locally
6. Go back "Online"
7. Verify automatic sync

### Test PWA Installation
1. Open app in Chrome/Edge
2. Look for install icon in address bar
3. Click "Install" to add to home screen
4. Launch as standalone app

### Test Push Notifications
1. Open app and allow notifications
2. Send test notification from Firebase Console
3. Verify notification appears
4. Click notification to open app

---

## Production Checklist

### Before Deployment
- [ ] Configure Firebase project
- [ ] Add all Firebase environment variables
- [ ] Update `firebase-messaging-sw.js` with real config
- [ ] Create `user_fcm_tokens` table in Supabase
- [ ] Test offline functionality
- [ ] Test push notifications
- [ ] Build and test Android app
- [ ] Build and test iOS app (requires macOS)

### Mobile App Store Requirements

#### Android (Google Play)
- [ ] Generate signed APK/AAB
- [ ] Configure app icons and splash screens
- [ ] Add privacy policy URL
- [ ] Complete Play Console listing

#### iOS (App Store)
- [ ] Configure provisioning profiles
- [ ] Add app icons (all sizes)
- [ ] Configure launch screens
- [ ] Complete App Store Connect listing
- [ ] Submit for review

---

## Architecture

### Offline-First Flow
```
User Action
    ↓
Check Online Status
    ↓
┌─────────────────┬─────────────────┐
│   If Online     │   If Offline    │
├─────────────────┼─────────────────┤
│ Try save to API │ Save to IndexDB │
│      ↓          │       ↓         │
│  If Success     │  Show toast     │
│    Done ✓       │  Queue for sync │
│      ↓          │       ↓         │
│  If Fails       │  Wait for online│
│ Save locally    │  Auto-sync      │
└─────────────────┴─────────────────┘
```

### Sync Process
```
Connection Restored
    ↓
Check Pending Changes
    ↓
For Each Record:
  1. Validate data
  2. Send to Supabase
  3. Mark as synced
  4. Update UI
    ↓
Clean up old records
    ↓
Show success toast
```

---

## Troubleshooting

### IndexedDB Issues
- **Error**: "Database not initialized"
  - **Fix**: Ensure `localSync.init()` is called before use

### Firebase Issues
- **Error**: "Firebase not configured"
  - **Fix**: Add all Firebase environment variables
  
- **Error**: "Messaging not supported"
  - **Fix**: Check browser compatibility (requires modern browsers)

### Sync Issues
- **Problem**: Changes not syncing
  - **Check**: Network connection
  - **Check**: Supabase credentials
  - **Check**: Console for error messages

### Capacitor Build Issues
- **Android**: Ensure Android Studio is installed
- **iOS**: Requires macOS with Xcode
- **Both**: Run `npx cap sync` after code changes

---

## Performance Considerations

- **IndexedDB**: Stores up to 50MB by default
- **Service Worker Cache**: Configured for 10MB max
- **Sync Frequency**: Every 5 minutes when online
- **Cleanup**: Synced records removed after 24 hours

---

## Security Notes

- Firebase config is public but restricted by domain
- FCM tokens are user-specific and expire
- Supabase RLS policies protect user data
- Service worker only caches approved resources
- Sensitive data should not be cached offline

---

## Support

For issues or questions:
1. Check logs in browser console
2. Verify environment variables
3. Test network connectivity
4. Review Supabase policies
5. Check Firebase Console for errors

---

## Version History

- **PATCH 136.0**: Capacitor integration
- **PATCH 137.0**: IndexedDB offline storage
- **PATCH 138.0**: Firebase push notifications
- **PATCH 139.0**: Sync engine implementation
- **PATCH 140.0**: Network awareness UI
