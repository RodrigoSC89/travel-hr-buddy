# 🚢 Nautilus One

> **Revolutionary Maritime HR Management Platform**  
> Enterprise-grade system for maritime crew management, compliance, and AI-powered automation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e.svg)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Architecture](#architecture)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## 🎯 Overview

**Nautilus One** is a comprehensive maritime HR management platform designed for shipping companies, crew managers, and maritime operations. Built with modern technologies and optimized for low-bandwidth networks (2 Mbps+).

### Key Highlights

- 🤖 **AI-Powered** - GPT-4o integration for document analysis and automation
- 🌐 **Offline-First** - PWA with full offline support
- 📱 **Mobile-Ready** - Responsive design + native app capabilities
- 🔒 **Enterprise Security** - RLS, MFA, audit logging
- ⚡ **High Performance** - Optimized for 2 Mbps networks
- 🌍 **Multi-Tenant** - SaaS architecture with tenant isolation

---

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Crew Management** | Complete crew lifecycle management |
| **Document Control** | Digital document storage with OCR |
| **Payroll & Finance** | Multi-currency payroll processing |
| **Compliance** | MLC 2006 & STCW compliance tracking |
| **Training** | Certificate tracking and renewals |
| **Scheduling** | Crew rotation and voyage planning |

### AI Capabilities

- 📄 Intelligent document analysis
- 🔍 Compliance monitoring
- 📊 Predictive analytics
- 🤖 Automated workflows
- 💬 Natural language queries

### Integrations

- SAP / ADP connectivity
- Email services (SendGrid, SMTP)
- Payment gateways
- Maritime APIs (StarFix, Terrastar)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or bun
- Supabase account (or use Lovable Cloud)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/nautilus-one.git
cd nautilus-one

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
nano .env
```

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

---

## 📚 Documentation

### Quick Links

| Document | Description |
|----------|-------------|
| [Getting Started](./docs/getting-started.md) | First-time setup guide |
| [Developer Guide](./docs/development/DEVELOPER_GUIDE.md) | Development workflow |
| [API Reference](./docs/api/API-REFERENCE.md) | Complete API documentation |
| [Deployment Guide](./docs/deployment/DEPLOYMENT-GUIDE.md) | Production deployment |

### Documentation Structure

```
docs/
├── getting-started.md      # Quick start guide
├── STRUCTURE.md            # Repository structure
│
├── api/                    # API documentation
│   └── API-REFERENCE.md
│
├── development/            # Developer guides
│   ├── DEVELOPER_GUIDE.md
│   ├── CONTRIBUTING.md
│   └── TESTING-GUIDE.md
│
├── deployment/             # Deployment guides
│   ├── DEPLOYMENT-GUIDE.md
│   ├── CI-CD-SETUP.md
│   └── PRODUCTION-CHECKLIST.md
│
├── features/               # Feature documentation
│   └── README.md
│
├── performance/            # Performance guides
│   ├── README.md
│   └── PERFORMANCE-OPTIMIZATION-2MB.md
│
├── security/               # Security documentation
│   ├── SECURITY.md
│   └── OAUTH_INTEGRATION_GUIDE.md
│
├── mobile/                 # Mobile documentation
│   └── README.md
│
└── handoff/                # Developer handoff
    ├── TECHNICAL-HANDOFF.md
    └── FINAL-SYSTEM-STATUS.md
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Tailwind CSS |
| **State** | TanStack Query, Zustand |
| **Backend** | Supabase (PostgreSQL + Edge Functions) |
| **Auth** | Supabase Auth + RLS |
| **AI** | OpenAI GPT-4o |
| **Mobile** | PWA + Capacitor |

### Project Structure

```
nautilus-one/
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Route pages
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── lib/                # Utilities and integrations
│   ├── types/              # TypeScript types
│   └── modules/            # Feature modules
│
├── supabase/
│   ├── functions/          # Edge Functions
│   └── migrations/         # Database migrations
│
├── docs/                   # Documentation
├── tests/                  # Test files
├── e2e/                    # E2E tests (Playwright)
└── public/                 # Static assets
```

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run format           # Prettier

# Testing
npm test                 # Unit tests
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report
```

### Code Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - Airbnb config with custom rules
- **Prettier** - Automatic formatting
- **Husky** - Pre-commit hooks

---

## 🚀 Deployment

### Lovable (Recommended)

1. Click **Publish** in Lovable editor
2. Configure custom domain (optional)
3. Deploy automatically on push

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Manual

```bash
# Build
npm run build

# Serve dist/ folder with any static host
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📊 Status

| Metric | Value |
|--------|-------|
| **System Completion** | 95% |
| **Test Coverage** | 85%+ |
| **TypeScript Strict** | ✅ |
| **Lighthouse Score** | 92+ |

---

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: GitHub Issues
- **Security**: security@nautilus.app

---

## 📝 License

Proprietary - All rights reserved.

---

<p align="center">
  <strong>Nautilus One</strong> - Revolutionizing Maritime HR Management
  <br>
  <sub>Built with ❤️ for the maritime industry</sub>
</p>
