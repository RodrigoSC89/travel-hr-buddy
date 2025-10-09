# 🚨 Sentry Quick Reference

## 🔧 Setup (2 Steps)

1. Add to `.env`:
   ```
   VITE_SENTRY_DSN=https://your-key@sentry.io/project-id
   ```

2. Deploy - that's it! 🎉

## 🧪 Test Integration

Visit: `/admin/sentry-test`

## 📝 Usage Examples

### Track User
```typescript
import { setSentryUser, clearSentryUser } from "@/utils/sentry";

// On login
setSentryUser(user.id, user.email, user.name);

// On logout
clearSentryUser();
```

### Capture API Errors
```typescript
import { captureAPIError } from "@/utils/sentry";

try {
  await api.fetchData();
} catch (error) {
  captureAPIError(error, "/api/data", { userId: user.id });
  throw error;
}
```

### Add Breadcrumbs
```typescript
import { addSentryBreadcrumb } from "@/utils/sentry";

// Track important actions
addSentryBreadcrumb("User exported report", "user-action");
```

### Manual Capture
```typescript
import * as Sentry from "@sentry/react";

Sentry.captureException(error, {
  tags: { feature: "reports" },
  extra: { reportId: 123 }
});
```

### Edge Functions
```typescript
import { captureException } from "../_shared/sentry-edge.ts";

try {
  // your code
} catch (error) {
  await captureException(error, { functionName: "my-function" });
  throw error;
}
```

## 🎯 What's Automatically Captured

- ✅ Unhandled exceptions
- ✅ Promise rejections
- ✅ React component errors
- ✅ Network failures
- ✅ Performance metrics

## 📚 Full Documentation

See `SENTRY_SETUP.md` for complete guide.
