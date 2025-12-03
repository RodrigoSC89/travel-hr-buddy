# Build Guide - Nautilus One

Complete guide for building and deploying the Nautilus One system.

## Prerequisites

- **Node.js**: 22.x (required)
- **npm**: >=8.0.0
- **Memory**: Minimum 4GB RAM for build process

## Build Commands

### Development Build
```bash
npm run build:dev
```
Builds the application in development mode with source maps and debugging enabled.

### Production Build
```bash
npm run build
```
Builds the application in production mode with optimizations enabled.

### CI/CD Build
```bash
npm run build:ci
```
Builds the application with memory configuration optimized for CI/CD environments.

## Memory Configuration

All build commands are configured with `NODE_OPTIONS='--max-old-space-size=4096'` to ensure reliable builds without manual memory configuration. This is especially critical for:

- CI/CD environments (GitHub Actions, GitLab CI, etc.)
- Container-based deployments
- Resource-constrained environments

## Module Structure

The application is organized into the following modules:

### Core Modules
1. **BridgeLink** - Maritime bridge integration
2. **Control Hub** - Central control panel
3. **DP Intelligence** - Dynamic positioning intelligence
4. **SGSO** - Safety management system

### Operational Modules
5. **MMI** - Maritime management intelligence
6. **PEOTRAM/PEODP** - Personnel and equipment tracking
7. **Travel** - Travel management
8. **HR** - Human resources

### Feature Modules
9. **Documents** - Document management with AI
10. **Analytics** - Business intelligence
11. **Maritime** - Maritime operations
12. **Communication** - Team communication

### Advanced Modules
13. **Innovation** - Innovation tracking
14. **Optimization** - Performance optimization
15. **Collaboration** - Team collaboration
16. **Voice** - Voice interface

### System Modules
17. **Portal** - Employee portal
18. **Admin** - Administration panel

## Centralized Exports

The system now uses centralized exports for better code organization:

### Contexts (`src/contexts/index.ts`)
```typescript
import { AuthProvider, useAuth, TenantProvider, useTenant } from '@/contexts';
```

### Hooks (`src/hooks/index.ts`)
```typescript
import { useUsers, useEnhancedNotifications, useMaritimeChecklists } from '@/hooks';
```

### Types (`src/types/index.ts`)
```typescript
import type { AIModel, DashboardMetric, WorkflowStep } from '@/types';
```

## Build Process

1. **Type Checking**: `npm run type-check`
   - Runs TypeScript compiler without emitting files
   - Zero errors expected

2. **Linting**: `npm run lint`
   - Checks code quality and style
   - Only minor warnings acceptable (unused variables)

3. **Building**: `npm run build`
   - Transforms ~5234 modules
   - Build time: ~55-60 seconds
   - Generates PWA with 188 entries (8.2 MB)

4. **Preview**: `npm run preview`
   - Starts local preview server
   - Tests production build locally

## Success Criteria

✅ **TypeScript**: Zero compilation errors  
✅ **Build**: Completes in under 2 minutes  
✅ **Bundle**: All modules properly chunked  
✅ **PWA**: Service worker generated  
✅ **Lint**: No errors, only minor warnings  

## Deployment

### Vercel
```bash
npm run deploy:vercel
```

### Netlify
```bash
npm run deploy:netlify
```

## Troubleshooting

### Out of Memory Errors
If you encounter heap memory errors:
- Ensure NODE_OPTIONS is set correctly
- Increase to 6144 or 8192 if needed
- Close other applications during build

### Module Resolution Errors
- Clear node_modules: `rm -rf node_modules`
- Clear build cache: `rm -rf dist .vite node_modules/.vite`
- Reinstall: `npm install`
- Rebuild: `npm run build`

### Type Errors
- Run type check: `npm run type-check`
- Check centralized exports are being used
- Verify imports use correct paths

## Performance Notes

- Build is optimized for production
- Code splitting enabled for all modules
- Tree shaking removes unused code
- Gzip compression reduces bundle size by ~70%
- PWA caching improves load times

## Version Information

- **Version**: Nautilus One Beta 3.3 - Preditivo
- **Status**: ✅ Production Ready
- **Quality**: Professional Grade
- **TypeScript**: 100% typed (zero @ts-nocheck)
