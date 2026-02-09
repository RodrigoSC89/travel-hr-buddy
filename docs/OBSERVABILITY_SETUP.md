# NAUTI ONE — Observability Setup

## Architecture

### Error Tracking: Sentry
- **Config**: `sentry.client.config.ts`
- **DSN**: Set via `VITE_SENTRY_DSN` environment variable
- **Features**:
  - Exception capture (frontend)
  - Navigation breadcrumbs
  - Performance tracing (routes + API calls)
  - Session replay on errors (100%)
  - Release tagging (`nautilus-one@3.2.0`)
  - User feedback integration

### Query Instrumentation
- **File**: `src/lib/observability.ts`
- **Functions**:
  - `trackQuery()` — Logs query duration, success/failure, row count
  - `instrumentQuery()` — Wraps Supabase calls with auto-timing
  - `trackUserAction()` — Breadcrumb logging for user actions
  - `trackPageLoad()` — Page performance metrics

### Structured Logging
- **File**: `src/lib/logger.ts`
- **Levels**: info, warn, error, debug
- **Pattern**: `[Module] Operation: details`

### Error Normalization
- **File**: `src/contracts/error-normalization.ts`
- **Maps**: Supabase/Edge Function errors → PT-BR user messages
- **Categories**: auth, network, validation, permission, not_found, conflict, server

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SENTRY_DSN` | Sentry error tracking | No (disabled if missing) |
| `VITE_STRICT_PROD` | Block mocks in production | No (default: true) |

## How to Debug

1. **Check Sentry dashboard** for exceptions and performance issues
2. **Check browser console** for structured `[Module]` logs
3. **Use `normalizeError()`** to get user-friendly error messages
4. **Wrap Supabase calls** with `instrumentQuery()` for automatic tracking

## Health Panel
- **Route**: `/health-monitor`
- **Checks**: Supabase connectivity, Edge Functions, Storage, Realtime
