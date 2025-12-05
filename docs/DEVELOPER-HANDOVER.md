# Nautilus One - Developer Handover Documentation

## 📋 Overview

Sistema completo de gestão marítima com otimizações para redes de até 2Mbps.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🏗️ Architecture

### Core Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (React Query)
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)

### Key Directories
```
src/
├── components/       # UI Components
│   ├── ui/          # Base shadcn components
│   ├── performance/ # Performance components
│   └── layout/      # Layout components
├── hooks/           # Custom React hooks
├── lib/             # Core utilities
│   ├── performance/ # Performance optimizations
│   └── monitoring/  # System monitoring
├── pages/           # Route pages
└── contexts/        # React contexts
```

## ⚡ Performance Features

### 1. Low Bandwidth Optimizer
- Automatic quality adjustment based on connection speed
- Image quality reduction on slow networks
- Animation disabling for 2G/3G connections

### 2. Service Worker (v4)
- Intelligent caching strategies
- Offline support with background sync
- Push notifications ready

### 3. Lazy Loading
- All routes are lazy loaded
- Component-level code splitting
- Smart prefetching on hover

### 4. Memory Management
- Automatic memory monitoring
- Cleanup on low memory
- Query cache optimization

## 🔧 Environment Variables

```env
# Required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional - Performance
VITE_ENABLE_CLIENT_METRICS=false
VITE_ENABLE_AUTONOMY=false
VITE_ENABLE_WATCHDOG=false
VITE_ENABLE_HEAVY_MONITORING=false

# Optional - Features
VITE_USE_HASH_ROUTER=false
```

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ✅ Optimized |
| FID | < 100ms | ✅ Optimized |
| CLS | < 0.1 | ✅ Optimized |
| Bundle Size | < 500KB | ✅ Code Split |

## 🔒 Security

- Row Level Security (RLS) enabled
- JWT authentication
- API rate limiting
- Input sanitization

## 📱 PWA Support

- Installable on mobile/desktop
- Offline-first architecture
- Background sync
- Push notifications

## 🧪 Testing

```bash
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run lighthouse  # Performance audit
```

## 📝 Pending Tasks

### High Priority
- [ ] Implement remaining edge functions
- [ ] Complete i18n translations
- [ ] Add comprehensive unit tests

### Medium Priority
- [ ] Optimize large lists virtualization
- [ ] Add more loading skeletons
- [ ] Improve error boundaries

### Low Priority
- [ ] Dark mode refinements
- [ ] Animation polish
- [ ] Documentation updates

## 🔄 Deployment

```bash
npm run build       # Production build
npm run preview     # Preview build
```

## 📚 Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main application entry |
| `src/lib/performance/init.ts` | Performance initialization |
| `public/sw.js` | Service Worker |
| `src/hooks/useSystemOptimizer.ts` | Unified performance hook |

## 👥 Support

For questions, contact the development team.

---

**Version**: 68.3  
**Last Updated**: December 2024
