# 🚢 Nautilus One

A smart, modular, and extensible platform for managing maritime systems, intelligent workflows, fleet logistics, AI-powered assistance, and travel operations — all in one.

---

## 🌐 Live Preview

> Coming soon via Vercel deployment

---

## 🧰 Tech Stack

* **Vite** - Fast build tool and dev server
* **React + TypeScript** - Modern UI framework with type safety
* **Tailwind CSS** - Utility-first CSS framework
* **Supabase (Auth + DB)** - Backend as a service with real-time capabilities
* **OpenAI APIs (Chat, Whisper)** - AI-powered features and voice assistance
* **Mapbox, Windy, Skyscanner, MarineTraffic, and others** - External integrations
* **Vercel** (CI/CD + Hosting) - Deployment and hosting platform

---

## ⚙️ Getting Started

```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
npm install
cp .env.example .env
# Edit .env with your API keys (see Environment Variables section below)
npm run dev
```

After starting the dev server, visit `http://localhost:8080/health` to verify your environment configuration.

### 📦 Common Scripts

```json
{
  "dev": "vite --host",
  "build": "vite build",
  "start": "vite preview --host",
  "test": "echo \"No tests specified\" && exit 0",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  "format:check": "prettier --check \"src/**/*.{js,jsx,ts,tsx,json,css,scss,md}\"",
  "clean:logs": "node scripts/clean-console-logs.cjs",
  "validate:api-keys": "node scripts/validate-api-keys.js"
}
```

### 🔑 API Keys Validation

After configuring your API keys, verify they work correctly:

```bash
npm run validate:api-keys
```

This will:
- ✅ Test each configured API key against its service
- ✅ Report validity, expiration, and authorization status
- ✅ Show response times and connectivity
- ✅ Provide recommendations for any issues

See [scripts/README_API_VALIDATION.md](./scripts/README_API_VALIDATION.md) for details.

---

## 🏥 System Health & Diagnostics

### Health Check Page

Visit `/health` to verify your system configuration:
- **Local**: `http://localhost:8080/health`
- **Production**: `https://your-deployment.vercel.app/health`

The health check page shows:
- ✅ System status (running/issues)
- 🔑 Required environment variables status
- 🎁 Optional environment variables status
- 📝 Configuration instructions

See [HEALTH_CHECK_GUIDE.md](./HEALTH_CHECK_GUIDE.md) for detailed documentation.

---

## 🗂 Project Structure

```
src/
├── modules/           # All 32 business modules (domain-driven)
├── components/        # Shared UI elements
├── pages/             # Routes and app entry points
├── services/          # External API integrations
├── hooks/             # Custom React hooks
├── lib/               # Core utilities and helpers
├── integrations/      # Third-party service integrations
├── types/             # TypeScript type definitions
├── contexts/          # React context providers
└── utils/             # Helper functions and utilities
```

---

## 🧬 Modules (All 32)

* **Dashboard** - Central control panel and system overview
* **Sistema Marítimo** - Maritime fleet and vessel management
* **IA & Inovação** - AI innovation and intelligent features
* **Portal do Funcionário** - Employee self-service portal
* **Viagens** - Travel booking and management
* **Alertas de Preços** - Price monitoring and alerts
* **Hub de Integrações** - External API integration hub
* **Reservas** - Reservation and booking management
* **Comunicação** - Internal communication platform
* **Configurações** - System settings and preferences
* **Otimização** - Process optimization tools
* **Assistente de Voz** - Voice assistant with AI
* **Centro de Notificações** - Notification management center
* **Monitor de Sistema** - System health monitoring
* **Documentos** - Document management system
* **Colaboração** - Team collaboration tools
* **Otimização Mobile** - Mobile optimization features
* **Checklists Inteligentes** - Smart checklist system
* **PEOTRAM** - Maritime crew training program
* **PEO-DP** - Personnel department operations
* **SGSO** - Occupational health and safety system
* **Templates** - Document and form templates
* **Analytics Avançado** - Advanced analytics and reporting
* **Analytics Tempo Real** - Real-time analytics dashboard
* **Monitor Avançado** - Advanced system monitoring
* **Documentos IA** - AI-powered document processing
* **Assistente IA** - AI assistant for business intelligence
* **Business Intelligence** - Strategic BI and decision support
* **Smart Workflow** - Intelligent workflow automation
* **Centro de Ajuda** - Help center and support
* **Automação IA** - AI-driven automation tools
* **Visão Geral** - System overview and quick access

> See each module's README in `/src/modules/<name>/README.md`

---

## 🔐 Environment Variables

Set all required keys in `.env` using `.env.example` as a reference.

> **💡 Tip:** Run `npm run validate:api-keys` after configuring to verify all keys are working!

Example keys:

### Core Services

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-...
```

### Maps & Weather

```env
# Mapbox - Interactive maps and geolocation
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
MAPBOX_PUBLIC_TOKEN=pk.eyJ...

# OpenWeather - Weather data and forecasts
VITE_OPENWEATHER_API_KEY=...
OPENWEATHER_API_KEY=...

# Windy - Advanced weather visualization (Future)
WINDY_API_KEY=...
```

### Travel & Booking

```env
# Amadeus - Travel and flight data
VITE_AMADEUS_API_KEY=...

# Skyscanner
VITE_SKYSCANNER_API_KEY=...
```

### Fleet & Maritime

```env
# Marine Traffic - Vessel tracking
MARINE_TRAFFIC_API_KEY=...
VESSEL_FINDER_API_KEY=...
```

See `.env.example` for the complete list of all available configuration options.

---

## 🥪 Testing & Quality

* **Unit + integration tests:** Currently uses placeholder test command
* **Code linting:** `eslint` configured with TypeScript support
* **Formatting:** `prettier` for consistent code style
* **CI:** GitHub Actions (auto run on PR via `.github/workflows/run-tests.yml`)

### Running Quality Checks

```bash
# Lint code
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run tests
npm run test
```

---

## 🚀 Deployment

* Auto-deployed via **Vercel** on push to `main`
* Build errors are linted and tested in CI before deployment
* Environment variables must be configured in Vercel dashboard

### Manual Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (requires Vercel CLI)
npm run deploy:vercel
```

---

## 🤝 Contributing

1. Fork or clone this repository
2. Follow structure conventions
3. Use provided prompts for AI-assisted development
4. Submit PRs to `main` branch (tested automatically)

### Development Workflow

1. Create a feature branch
2. Make your changes following the existing code style
3. Run linting and formatting before committing
4. Ensure the build succeeds
5. Submit a pull request with a clear description

---

## 📍 License

[MIT License](LICENSE) © Nautilus One Team

---

## ✅ Technical Completion Checklist

### 📁 Structure and Organization

- [x] 32 modules organized and named correctly
- [x] Standardized folders with structure: `components/`, `pages/`, `services/`, `hooks/`
- [x] Global README.md created with all sections and complete module list
- [x] Each module with its own README.md

### 🧪 Tests and Quality

- [x] ESLint configured for automated code quality
- [x] Scripts for `npm run test` and `npm run lint` added
- [x] GitHub Actions configured to run tests on push/pull request (`run-tests.yml`)

### 🧼 Code and Performance

- [x] ESLint and Prettier configured with `.eslintrc.json` and `.prettierrc`
- [x] Standardization and cleanup via ESLint
- [x] Performance optimized with lazy loading and dynamic imports
- [x] Removal of duplicate code and unnecessary imports

### 🔌 External Integrations

- [x] APIs connected or prepared: OpenAI, Mapbox, Windy, Skyscanner, Supabase, MarineTraffic, etc.
- [x] `.env.example` with all variables organized

### 🖥️ Internal Panels and Tools

- [x] Admin dashboard with module management
- [x] Control panel with system status overview
- [x] API integration hub for testing and monitoring

### 📦 Production Ready

- [x] Vercel deployment enabled (build corrected)
- [x] Clean, documented, modular code
- [x] Ready for collaboration, expansion, and continuous evolution

---

## 🧾 Suggested Next Steps (V2 Expansion)

- [ ] Add complete authentication system and RBAC (admin, user, operator)
- [ ] Create real-time analytics dashboard with charts and reports
- [ ] Integrate logs with Sentry or LogRocket
- [ ] Finalize full mobile adaptation (PWA/hybrid)
- [ ] Refine voice assistant with continuous context (Thread Memory)
- [ ] Implement Jest testing framework with comprehensive test coverage
- [ ] Add end-to-end testing with Playwright or Cypress
- [ ] Create API documentation with Swagger/OpenAPI
- [ ] Implement internationalization (i18n) support
- [ ] Add dark mode support across all modules

---

## 📚 Additional Documentation

For more detailed information, see:

- **[NAUTILUS_ONE_IMPLEMENTATION.md](./NAUTILUS_ONE_IMPLEMENTATION.md)** - Complete implementation details
- **[NAUTILUS_ONE_README.md](./NAUTILUS_ONE_README.md)** - Nautilus One quick start guide
- **[VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)** - 5-minute visual setup guide
- **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** - Quick deployment guide for all platforms
- **[DEPLOYMENT_CONFIG_REPORT.md](./DEPLOYMENT_CONFIG_REPORT.md)** - Detailed configuration report
- **[API_KEYS_SETUP_GUIDE.md](./API_KEYS_SETUP_GUIDE.md)** - API keys setup guide
