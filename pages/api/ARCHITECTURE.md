# Next.js API Routes in Vite Project - Documentation

## Overview

This project uses **Vite + React** as its primary build system, but contains Next.js API routes in the `pages/api/` directory. These routes serve as **fallback implementations** and reference examples.

## Purpose

The API routes in `pages/api/` are:

1. **Fallback Mechanisms**: Used when Supabase Edge Functions fail
2. **Reference Implementations**: Show how the same functionality could be implemented in Next.js
3. **Development Testing**: Allow local testing without deploying Edge Functions

## Current API Routes

### 1. `/api/assistant-query`
- **Purpose**: AI assistant query endpoint
- **Primary**: `supabase/functions/assistant-query/`
- **Fallback**: `pages/api/assistant-query.ts`
- **Status**: ✅ Active (fallback)

### 2. `/api/generate-document`
- **Purpose**: AI document generation
- **Primary**: `supabase/functions/generate-document/`
- **Fallback**: `pages/api/generate-document.ts`
- **Status**: ⚠️ Reference only

### 3. `/api/generate-chart-image`
- **Purpose**: Chart image generation
- **Primary**: Client-side rendering
- **Fallback**: `pages/api/generate-chart-image.ts`
- **Status**: ⚠️ Reference only

### 4. `/api/assistant/logs`
- **Purpose**: Assistant logs retrieval
- **Primary**: `supabase/functions/assistant-logs/`
- **Fallback**: `pages/api/assistant/logs/index.ts`
- **Status**: ⚠️ Reference only

## Architecture Decision

These files are **intentionally kept** in the codebase for the following reasons:

1. **Resilience**: Provide fallback when Supabase is unavailable
2. **Migration Path**: Easy transition if moving to Next.js in the future
3. **Documentation**: Living examples of the API contract
4. **No Impact**: Not included in Vite build output

## Build Impact

✅ **Zero Impact**: Vite ignores the `pages/` directory completely. These files do not affect:
- Bundle size
- Build time
- Production deployment

## Future Considerations

If migrating to Next.js:
1. Remove Supabase Edge Functions
2. Activate these API routes
3. Update environment variables
4. Update import paths in components

If staying with Vite:
1. Keep as reference/fallback
2. Consider moving to a `docs/` or `reference/` directory
3. Update fallback logic if needed

## Related Files

- `supabase/functions/` - Primary Edge Functions
- `src/pages/admin/assistant.tsx` - Uses fallback mechanism
- `app/api/assistant/logs/README.md` - Next.js App Router example

## Maintenance

These files should be:
- ✅ Kept in sync with Edge Function APIs
- ✅ Tested periodically
- ✅ Documented clearly
- ❌ Not removed (they provide value as fallbacks)

---

**Last Updated**: 2025-10-12  
**Status**: Active (as fallback implementations)
