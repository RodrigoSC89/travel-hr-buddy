# Travel HR Buddy - Module Structure v3.5

## 📁 Project Structure

```
travel-hr-buddy/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components (shadcn)
│   │   ├── dashboard/    # Dashboard components
│   │   ├── crew/         # Crew management
│   │   ├── feedback/     # Feedback system
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── CrewManagement.tsx
│   │   ├── ControlHub.tsx
│   │   └── ...
│   ├── modules/          # Feature modules
│   │   ├── ai/           # AI modules
│   │   ├── analytics/    # Analytics
│   │   ├── operations/   # Operations
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── services/         # Service layer
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── tests/                # Test files
│   ├── e2e/             # E2E tests (Playwright)
│   ├── unit/            # Unit tests (Vitest)
│   ├── load-tests/      # Load tests
│   └── stress/          # Stress tests
├── feedback/             # Feedback system
│   └── beta-phase-1/    # Beta feedback
├── performance_metrics/  # Performance logs
├── release/             # Release packages
│   └── v3.5/           # Current release
└── supabase/            # Supabase functions
    └── functions/       # Edge functions
```

## 🎯 Core Modules

### 1. Dashboard Module
- **Path**: `src/pages/Dashboard.tsx`
- **Description**: Main dashboard with widgets and metrics
- **Features**: Real-time updates, customizable layout

### 2. Crew Management
- **Path**: `src/pages/CrewManagement.tsx`
- **Description**: Complete crew lifecycle management
- **Features**: CRUD operations, schedule management, certifications

### 3. Control Hub
- **Path**: `src/pages/ControlHub.tsx`
- **Description**: Central operational control
- **Features**: Monitoring, alerts, system status

### 4. Quality Dashboard
- **Path**: `src/pages/dashboard/QualityDashboard.tsx`
- **Description**: Executive quality metrics dashboard
- **Features**: Test results, coverage, user feedback

## 🔌 Integration Points

### Database (Supabase)
- PostgreSQL with Row Level Security
- Real-time subscriptions
- Edge functions for serverless compute

### Authentication
- Supabase Auth
- JWT tokens
- Role-based access control

### External APIs
- OpenAI for AI features
- Mapbox for maps
- Email services (Resend)

## 🧪 Testing Infrastructure

### Unit Tests (Vitest)
- Component tests
- Hook tests
- Utility function tests

### E2E Tests (Playwright)
- User flow tests
- Cross-browser testing
- Visual regression tests

### Load Tests
- Stress testing with 100+ sessions
- Performance monitoring
- Latency measurement

## 📦 Build & Deploy

### Build Process
1. TypeScript compilation
2. Vite bundling
3. Asset optimization
4. Source map generation

### Deployment Targets
- Vercel (primary)
- Netlify (backup)
- Docker containers (optional)

### Environment Variables
See `.env.example` for required configuration

## 🔒 Security Features

- Input validation with Zod
- XSS protection
- CSRF tokens
- Secure headers
- Rate limiting
- SQL injection prevention (via Supabase)

---
**Generated**: 2025-10-29T20:07:29.829Z
**Version**: v3.5
