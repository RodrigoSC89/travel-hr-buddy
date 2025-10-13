# ⚠️ DEPRECATED: Next.js API Routes

**This directory contains deprecated Next.js API route implementations.**

## Status: Reference Only

These API routes are **NOT ACTIVE** in the current Vite-based application. They are kept for reference purposes only.

## Active Implementation

The currently active backend implementation uses **Supabase Edge Functions**:
- Location: `supabase/functions/`
- Runtime: Deno
- All API functionality has been migrated to Supabase Edge Functions

## Migration Complete

The frontend has been updated to use Supabase Edge Functions instead of these Next.js routes:
- ✅ `assistant-query` → `supabase/functions/assistant-query`
- ✅ `cron-status` → `supabase/functions/cron-status`
- ✅ `generate-document` → `supabase/functions/generate-document`
- ✅ `generate-chart-image` → Handled client-side or via Supabase functions

## If Migrating to Next.js

If you decide to migrate this project from Vite to Next.js in the future, these routes can serve as a starting point. However, you will need to:

1. Install Next.js and its dependencies
2. Update imports and exports to Next.js conventions
3. Migrate Supabase Edge Functions to Next.js API routes
4. Update environment variable handling
5. Test all endpoints thoroughly

## Current Architecture

This is a **Vite + React + Supabase** application:
- **Frontend**: Vite with React (SPA)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage

## Removal Recommendation

These files can be safely removed if you want to clean up the repository. They are not used by the application.
