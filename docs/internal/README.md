# 🚢 Nautilus One - Internal Documentation

## Overview

Nautilus One is a comprehensive maritime operations platform built with modern web technologies, providing intelligent workflows, fleet logistics, AI-powered assistance, and travel operations management.

## 🧰 Tech Stack

### Frontend
- **Vite** (v5.4.19) - Fast build tool and development server
- **React** (v18.3.1) + **TypeScript** (v5.8.3) - Modern UI framework with type safety
- **Tailwind CSS** (v3.4.17) - Utility-first CSS framework
- **React Query** (@tanstack/react-query v5.83.0) - Data fetching and state management
- **React Router** (v6.30.1) - Client-side routing

### Backend
- **Supabase** - Backend as a service
  - PostgreSQL database with Row-Level Security (RLS)
  - Authentication and authorization
  - Edge Functions for serverless compute
  - Real-time subscriptions
  - Storage for files and media

### AI & External Services
- **OpenAI APIs** (v6.3.0) - GPT-4, embeddings, and AI-powered features
- **Mapbox** - Interactive maps and geolocation
- **Resend** - Email delivery service
- **Sentry** - Error tracking and monitoring

### Development & Deployment
- **ESLint** (v8.57.1) - Code linting
- **Prettier** (v3.6.2) - Code formatting
- **Vitest** (v2.1.9) - Unit testing framework
- **Vercel** - Production hosting and CI/CD
- **PWA** (vite-plugin-pwa v0.20.5) - Progressive Web App support

## 📦 Common Commands

### Development
```bash
npm install           # Install dependencies
npm run dev          # Start development server (localhost:8080)
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:ui      # Open Vitest UI
```

### Code Quality
```bash
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run clean:logs   # Remove console.logs from production code
```

### Deployment
```bash
npm run deploy:vercel  # Deploy to Vercel production
npm run deploy:netlify # Deploy to Netlify production
```

### API Validation
```bash
npm run validate:api-keys     # Validate all required API keys
npm run demo:api-validation   # Demo API validation system
```

### Maintenance
```bash
npm run weekly-report         # Generate weekly system report
npm run setup:daily-report    # Setup daily report cron job
npm run alert:low-coverage    # Alert if test coverage is low
```

## 🏗️ Project Structure

```
/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── auth/       # Authentication components
│   │   ├── layout/     # Layout components (SmartLayout, ErrorBoundary)
│   │   └── ...         # Feature-specific components
│   ├── pages/          # Route pages and views
│   ├── modules/        # 32 business domain modules
│   ├── contexts/       # React Context providers (Auth, Tenant, Organization)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # External API integrations
│   ├── lib/            # Core utilities and helpers
│   ├── integrations/   # Third-party service integrations
│   │   └── supabase/   # Supabase client and types
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions and utilities
├── pages/
│   └── api/            # API routes (Next.js compatible for Vercel)
├── supabase/
│   ├── functions/      # Supabase Edge Functions (80+ functions)
│   ├── migrations/     # Database migrations
│   └── schema/         # Database schema definitions
├── public/             # Static assets
├── scripts/            # Build and maintenance scripts
└── docs/               # Documentation
    ├── internal/       # Internal technical documentation
    └── public/         # Public-facing documentation
```

## 🔑 Environment Setup

### Required Variables
Copy `.env.example` to `.env` and configure:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# OpenAI (Required for AI features)
VITE_OPENAI_API_KEY=sk-proj-...

# Sentry (Recommended for production)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### Optional Variables
- **Mapbox**: For maps and geolocation features
- **Resend/SendGrid**: For email notifications
- **ElevenLabs**: For text-to-speech features
- **Travel APIs**: Amadeus, Skyscanner (for travel features)
- **Maritime APIs**: MarineTraffic, VesselFinder (for fleet tracking)

See `.env.example` for complete list of variables.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
   cd travel-hr-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Verify health**
   Visit `http://localhost:8080/health` to check system configuration

## 🧬 Core Modules (32 Total)

### Administrative
- **Dashboard** - Central control panel and system overview
- **Admin** - System administration and configuration
- **Settings** - User and organization settings

### Maritime & Fleet
- **Sistema Marítimo** - Maritime fleet and vessel management
- **NautilusOne** - Integrated maritime operations
- **MaritimeSupremo** - Advanced maritime features

### Safety & Compliance
- **SGSO** - Safety Management System (SGSO/SMS)
- **PEOTRAM** - Oil Spill Prevention and Emergency Response
- **PEODP** - Offshore Drilling Emergency Response
- **DPIncidents** - Dynamic Positioning incident management
- **DPIntelligence** - DP system intelligence and analytics

### Human Resources
- **Human Resources** - Crew management and HR operations
- **Gamification** - Crew engagement and achievement system
- **Portal** - Employee self-service portal

### Operations & Logistics
- **Checklists Inteligentes** - AI-powered operational checklists
- **Documents** - Document management system
- **IntelligentDocuments** - AI-enhanced document processing
- **Collaboration** - Team collaboration tools
- **Communication** - Internal communications

### Travel Management
- **Travel** - Travel booking and management
- **Reservations** - Reservation tracking
- **PriceAlerts** - Travel price monitoring

### Intelligence & Analytics
- **AI Assistant** - AI-powered assistance and insights
- **Intelligence** - Business intelligence and analytics
- **Analytics** - Data analytics and reporting
- **Reports** - Customizable reporting
- **PredictiveAnalytics** - Predictive modeling and forecasting

### Innovation
- **Innovation** - Innovation management
- **Optimization** - Process optimization
- **Voice** - Voice command interface
- **AR** - Augmented reality features
- **IoT** - IoT device integration
- **Blockchain** - Blockchain document verification

## 🏥 Health & Monitoring

### Health Check Endpoint
Visit `/health` to verify system configuration:
- Local: `http://localhost:8080/health`
- Production: `https://your-deployment.vercel.app/health`

The health check validates:
- ✅ System status
- 🔑 Required environment variables
- 🎁 Optional environment variables
- 📝 Configuration instructions

### Monitoring Tools
- **Sentry** - Error tracking and performance monitoring
- **Supabase Logs** - Edge function and database logs
- **Vercel Analytics** - Page performance and usage metrics

## 📚 Additional Documentation

- [SECURITY.md](./SECURITY.md) - Authentication, authorization, and RLS policies
- [API.md](./API.md) - API endpoints and integration guide
- [DEPLOY.md](./DEPLOY.md) - Deployment procedures and configuration
- [MONITORING.md](./MONITORING.md) - Monitoring and observability setup

## 🔗 Related Resources

### Main README
See [../../README.md](../../README.md) for user-facing documentation

### External Guides
- [Health Check Guide](../../HEALTH_CHECK_GUIDE.md)
- [Deploy Guide](../../DEPLOY_GUIDE.md)
- [Contributing Guide](../../CONTRIBUTING.md)

## 👥 Team & Support

For questions or support:
1. Check documentation in `/docs`
2. Review existing issues on GitHub
3. Contact the development team
4. Create a new issue with details

## 📄 License

Proprietary - All rights reserved
