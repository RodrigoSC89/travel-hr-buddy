# ⚠️ DEPRECATED: Next.js App Router API Routes

**This directory contains deprecated Next.js App Router API route implementations.**

## Status: Reference Only

These API routes are **NOT ACTIVE** in the current Vite-based application. They are kept for reference purposes only.

## Active Implementation

The currently active backend implementation uses **Supabase Edge Functions**:
- Location: `supabase/functions/`
- Runtime: Deno
- All API functionality has been migrated to Supabase Edge Functions

## Files in This Directory

### `assistant/logs/route.ts`
- Deprecated Next.js route for assistant logs
- Active implementation: `supabase/functions/assistant-logs`

### `report/assistant-logs/route.ts`
- Deprecated Next.js route for assistant report logs
- Active implementation: `supabase/functions/assistant-report-logs`

### `send-restore-dashboard/route.ts`
- Deprecated Next.js route for sending restore dashboard
- Active implementation: `supabase/functions/send-restore-dashboard`

## Current Architecture

This is a **Vite + React + Supabase** application:
- **Frontend**: Vite with React (SPA)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## Removal Recommendation

These files can be safely removed if you want to clean up the repository. They are not used by the application.

## If Migrating to Next.js

If you decide to migrate this project to Next.js with App Router in the future, these routes can serve as examples. However, you will need to:

1. Install Next.js 13+ and its dependencies
2. Update all imports and exports to App Router conventions
3. Migrate Supabase Edge Functions to Next.js route handlers
4. Update environment variable handling
5. Test all endpoints thoroughly
