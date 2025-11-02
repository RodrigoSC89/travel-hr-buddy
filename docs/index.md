# Nautilus One - Documentation Index

> **PATCH 621**: Comprehensive documentation for all production modules, services, and system architecture.

## 📚 Quick Navigation

### Core Modules
- [Document Hub](./modules/document-hub.md) - Document management and AI-powered templates
- [Dashboard](./modules/dashboard.md) - Main operational dashboard
- [Admin Control](./modules/admin-control.md) - Administrative control panel
- [Crew Management](./modules/crew-management.md) - HR and crew operations
- [AI Assistant](./modules/ai-assistant.md) - Intelligent assistance system

### Intelligence & AI
- [DP Intelligence](./modules/dp-intelligence.md) - Dynamic positioning intelligence
- [Forecast System](./modules/forecast.md) - Predictive analytics and forecasting
- [AI Compliance Engine](./engines/ai-compliance-engine.md) - Compliance automation

### Operations
- [SGSO Module](./modules/sgso.md) - Safety management system
- [PEO-DP Module](./modules/peo-dp.md) - Dynamic positioning operations
- [PEOTRAM Module](./modules/peotram.md) - Operational management
- [Maritime Operations](./modules/maritime.md) - Maritime-specific features

### Services
- [Authentication](./services/authentication.md) - Auth and security
- [Database](./services/database.md) - Supabase integration
- [API Services](./services/api.md) - External API integrations

### Development
- [Testing Guide](./TESTING-GUIDE.md) - How to run tests
- [Build Guide](./BUILD_GUIDE.md) - Building and deploying
- [Architecture](./architecture.md) - System architecture overview

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with your credentials

# Start development server
npm run dev
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests (PATCH 619)
npm run test:e2e

# All tests
npm run test:all
```

### Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📖 Module Documentation Structure

Each module documentation follows this standard structure:

1. **Objective** - What the module does
2. **File Structure** - Key files and directories
3. **Database Tables** - Supabase tables used
4. **Integrations** - External APIs and services
5. **UI Components** - Key user interface elements
6. **Status** - Current implementation status
7. **Usage Examples** - Code samples

## 🔧 Configuration

### Environment Variables

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete list.

Key variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `VITE_OPENAI_API_KEY` - OpenAI API key (optional)

### Theme Configuration (PATCH 620)

The application supports multiple themes:
- `light` - Standard light theme
- `dark` - Dark mode
- `nautilus` - Maritime blue theme
- `high-contrast` - High contrast for accessibility
- `system` - Follow system preference

Theme is persisted in localStorage and can be changed via the theme toggle in the header.

## 🏗️ Architecture

Nautilus One is built with:
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **State**: React Query + Context API
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Testing**: Vitest + Playwright
- **CI/CD**: GitHub Actions

## 🔒 Security

- Multi-tenant architecture with Row Level Security (RLS)
- JWT-based authentication via Supabase
- API key validation and rotation
- HTTPS only in production
- XSS and CSRF protection

## 📊 Monitoring & Health

- [Health Monitor](./modules/health-monitor.md) (PATCH 623) - System health dashboard
- [Anomaly Detection](./modules/anomaly-detection.md) (PATCH 625) - AI-powered alerts
- Web vitals tracking
- Error tracking via Sentry

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📝 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions:
- Create an issue in GitHub
- Contact the development team
- Check the troubleshooting guide: [TROUBLESHOOTING-GUIDE.md](./TROUBLESHOOTING-GUIDE.md)

---

**Last Updated**: 2025-11-02 (PATCH 621)
**Version**: 3.5.0
**Status**: Production Ready
