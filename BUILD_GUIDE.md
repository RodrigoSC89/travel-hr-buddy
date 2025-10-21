# Nautilus One - Build and Deployment Guide

## Build Requirements

### Node.js Memory Configuration

Due to the large size of the Nautilus One application with multiple modules, the build process requires increased Node.js memory allocation.

**Required Memory**: 4GB (4096MB)

The build scripts in `package.json` have been configured with the appropriate memory settings:

```bash
# Production build
npm run build

# Development build
npm run build:dev

# CI/CD build
npm run build:ci
```

All build commands automatically set `NODE_OPTIONS='--max-old-space-size=4096'`.

### Manual Build (if needed)

If you need to run the build manually with custom settings:

```bash
NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

## TypeScript Stabilization

### Status: ✅ Complete

All TypeScript issues have been resolved:

- ✅ Removed all `@ts-nocheck` directives (37 files cleaned)
- ✅ All contexts fully typed (AuthContext, TenantContext, OrganizationContext)
- ✅ All hooks fully typed (use-users, use-enhanced-notifications, use-maritime-checklists)
- ✅ Zero TypeScript compilation errors
- ✅ Zero circular dependencies
- ✅ Centralized exports created for better import management

### Centralized Exports

The codebase now includes centralized export files for better organization:

- `src/contexts/index.ts` - All context exports
- `src/hooks/index.ts` - Common hook exports
- `src/types/index.ts` - All type exports

**Usage Example:**

```typescript
// Before
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";

// After (recommended)
import { useAuth, useTenant } from "@/contexts";
```

## Preview Mode

To test the build locally:

```bash
npm run build
npm run preview
```

The preview server will start on `http://localhost:4173`.

## Vercel Deployment

The project is configured for automatic deployment on Vercel:

1. Push to the main branch triggers automatic deployment
2. The `vercel.json` configuration handles routing and security headers
3. Build command: `npm run build` (with memory settings included)

### Environment Variables

Ensure the following environment variables are set in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SENTRY_ORG` (optional, for error tracking)
- `SENTRY_PROJECT` (optional)
- `SENTRY_AUTH_TOKEN` (optional)

## Module Structure

Nautilus One is built with a modular architecture:

- **BridgeLink** - Maritime operations bridge
- **Control Hub** - Central command center
- **DP Intelligence** - Dynamic Positioning analytics
- **SGSO** - Safety management system
- **MMI** - Maritime Maintenance Intelligence
- **PEOTRAM/PEODP** - Maritime audit systems
- **Travel** - Travel management
- **HR** - Human Resources
- **Documents** - Document management with AI
- **Analytics** - Business intelligence

Each module is code-split for optimal loading performance.

## Build Optimization

The build is optimized with:

- **Chunk Splitting**: Vendor and module-specific chunks
- **Tree Shaking**: Unused code elimination
- **Minification**: ESBuild for fast minification
- **Source Maps**: Enabled in production for debugging
- **PWA Support**: Service worker for offline functionality
- **Lazy Loading**: Route-based code splitting

## Success Criteria

✅ Build completes without errors
✅ TypeScript compilation passes
✅ All modules load in preview mode
✅ No console errors or warnings
✅ All routes accessible
✅ Contexts and hooks fully functional

## Support

For issues or questions, contact the development team or open an issue in the repository.

---

**Version**: Nautilus One Beta 3.3 - Preditivo
**Last Updated**: 2025-10-21
