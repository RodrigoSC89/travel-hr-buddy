# 🔍 Sentry Error Monitoring - Setup Guide

This guide will help you configure Sentry for error monitoring and performance tracking in Nautilus One.

## 📋 Overview

Sentry has been integrated into Nautilus One to provide:
- **Runtime error tracking** - Catch and report JavaScript exceptions
- **Performance monitoring** - Track page load times and API response times
- **Session replay** - Visual playback of user sessions with errors
- **Error context** - User information, breadcrumbs, and stack traces
- **Server-side tracking** - Error monitoring for Supabase Edge Functions

## 🚀 Quick Start

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io) and sign up for a free account
2. Create a new project and select **React** as the platform
3. Copy your DSN (Data Source Name) - it looks like:
   ```
   https://xxxxxxxxxxxxx@o1234567.ingest.sentry.io/1234567
   ```

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
# Required: Sentry DSN for error reporting
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id

# Optional: For source maps upload in production (CI/CD)
SENTRY_ORG=your-organization-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token

# Optional: Set environment name
VITE_NODE_ENV=production
```

### 3. For Supabase Edge Functions

Add to your Supabase project settings:

```env
# Server-side Sentry DSN (can be the same as client-side)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ENVIRONMENT=production
```

### 4. Deploy

Push your changes and deploy. Sentry will automatically start capturing errors!

## 🧪 Testing the Integration

1. Navigate to `/admin/sentry-test` in your application
2. Click any of the test buttons to trigger different error scenarios
3. Check your Sentry dashboard to see the captured errors

### Test Scenarios Available

- **Throw Synchronous Error** - Tests ErrorBoundary integration
- **Throw Async Error** - Tests Promise rejection handling
- **Capture Exception Manually** - Tests manual error reporting with context
- **Send Test Message** - Tests message logging
- **Trigger Network Error** - Tests API failure tracking
- **Set User Context** - Tests user information tracking
- **Add Breadcrumb** - Tests breadcrumb trail functionality

## 📊 What Sentry Captures

### Automatic Capture

- Unhandled JavaScript exceptions
- Unhandled Promise rejections
- React component errors (via ErrorBoundary)
- Performance metrics and transactions
- Network request failures

### Manual Capture

You can manually capture errors and add context using the utility functions:

```typescript
import * as Sentry from "@sentry/react";
import { captureAPIError, setSentryUser, addSentryBreadcrumb } from "@/utils/sentry";

// Capture API errors
try {
  await api.call();
} catch (error) {
  captureAPIError(error, "/api/endpoint", { requestId: "123" });
}

// Set user context
setSentryUser("user-id-123", "user@example.com", "John Doe");

// Add breadcrumbs
addSentryBreadcrumb("User clicked export button", "user-action");

// Capture custom exception
Sentry.captureException(new Error("Something went wrong"), {
  tags: { component: "Dashboard" },
  extra: { data: "additional context" }
});
```

## 🔧 Advanced Configuration

### Source Maps

Source maps are enabled in production builds and will be automatically uploaded to Sentry if you configure the auth token. This allows you to see the actual source code in error stack traces instead of minified code.

To set up source maps upload:

1. Generate an auth token in Sentry: Settings → Auth Tokens → Create Token
2. Grant the token these scopes:
   - `project:read`
   - `project:releases`
   - `org:read`
3. Add the token to your environment variables (`.env` or CI/CD secrets)

### Environment-Specific Configuration

The integration automatically adjusts based on environment:

- **Development**: 100% of transactions sampled, logs to console
- **Production**: 10% of transactions sampled, silent operation

You can customize this in `src/sentry.config.ts`

### Filtering Errors

Sentry is configured to ignore common noise:

- Browser extension errors
- Third-party script errors
- Network errors from blocked domains
- Known false positives

You can customize filters in `src/sentry.config.ts`

## 📝 Edge Functions Integration

For Supabase Edge Functions, import the shared Sentry utilities:

```typescript
// In your edge function
import { captureException, withSentryTracking } from "../_shared/sentry-edge.ts";

// Wrap your handler
const handler = async (req: Request) => {
  try {
    // Your code
  } catch (error) {
    await captureException(error, {
      functionName: "my-function",
      tags: { severity: "high" }
    });
    throw error;
  }
};

// Or use the wrapper
export default withSentryTracking(handler, "my-function");
```

## 🎯 Best Practices

1. **Set User Context**: Always identify users when they log in
   ```typescript
   setSentryUser(user.id, user.email, user.name);
   ```

2. **Clear on Logout**: Remove user context when logging out
   ```typescript
   import { clearSentryUser } from "@/utils/sentry";
   clearSentryUser();
   ```

3. **Add Breadcrumbs**: Track important user actions
   ```typescript
   addSentryBreadcrumb("Started data export", "user-action");
   ```

4. **Tag Errors**: Use tags for filtering in Sentry dashboard
   ```typescript
   Sentry.setTag("feature", "reports");
   ```

5. **Add Context**: Include relevant data for debugging
   ```typescript
   Sentry.setContext("report", { id: reportId, type: "monthly" });
   ```

## 🔒 Privacy Considerations

- Sentry is configured to **not** mask text in session replays by default
- Sensitive data should be sanitized before being sent to Sentry
- User emails and IDs are tracked for error context
- Configure `beforeSend` in `sentry.config.ts` to filter sensitive data

## 📚 Additional Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Error Filtering](https://docs.sentry.io/platforms/javascript/configuration/filtering/)

## 🆘 Troubleshooting

### Errors not appearing in Sentry

1. Check that `VITE_SENTRY_DSN` is set correctly
2. Verify the DSN is valid in your Sentry project settings
3. Check browser console for Sentry initialization logs
4. Test using the `/admin/sentry-test` page

### Source maps not working

1. Verify `SENTRY_AUTH_TOKEN` is configured
2. Check the token has correct permissions
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry setup
4. Build the project and check for Sentry upload logs

### Too many errors

1. Adjust sample rates in `sentry.config.ts`
2. Add filters for known issues
3. Set up proper error boundaries in your React components
4. Use `ignoreErrors` configuration to filter noise

## 📞 Support

If you encounter issues:
1. Check the [Sentry documentation](https://docs.sentry.io/)
2. Review the test page at `/admin/sentry-test`
3. Check the Sentry dashboard for integration status
4. Contact the Nautilus One team for assistance
