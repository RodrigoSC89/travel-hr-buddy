# 📁 Nauti One - Repository Structure

**Version:** 4.0  
**Last Updated:** January 30, 2026

---

## 📋 Overview

This document describes the standardized directory structure for the Nauti One maritime HR management platform.

---

## 🗂️ Directory Structure

```
nauti-one/
├── .github/                    # GitHub configuration
│   ├── workflows/              # CI/CD workflows
│   │   ├── test.yml           # Unit/integration tests
│   │   ├── lint.yml           # ESLint + Prettier
│   │   ├── deploy.yml         # Production deployment
│   │   └── quality-gates.yml  # Code quality checks
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── architecture/          # ADRs, diagrams
│   ├── setup/                 # Setup guides
│   └── troubleshooting/       # Common issues
│
├── public/                     # Static assets
│   ├── images/                # Optimized images
│   ├── fonts/                 # Subsetted fonts
│   └── icons/                 # App icons, favicons
│
├── src/                        # Source code
│   ├── app/                   # App entry point
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── features/         # Feature-specific components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Core utilities
│   │   ├── supabase.ts       # Supabase client
│   │   ├── logger.ts         # Logging utility
│   │   └── utils.ts          # General utilities
│   ├── modules/               # Feature modules
│   ├── pages/                 # Page components
│   ├── routes/                # Route definitions
│   ├── services/              # API services
│   ├── types/                 # TypeScript types
│   │   └── database.types.ts # Generated from Supabase
│   └── styles/                # Global styles
│
├── supabase/                   # Supabase configuration
│   ├── functions/             # Edge Functions
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data
│
├── scripts/                    # Utility scripts
│   ├── audit-codebase.ts      # Code quality audit
│   ├── find-dead-routes.ts    # Dead route analysis
│   ├── find-unused-components.ts
│   ├── remove-dead-code.ts    # Code cleanup
│   ├── reorganize-repo.sh     # Structure cleanup
│   └── standardize-naming.sh  # Naming conventions
│
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── e2e/                   # End-to-end tests
│
├── .env.example               # Environment template
├── .eslintrc.json             # ESLint config
├── .prettierrc                # Prettier config
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── README.md                  # Project readme
```

---

## 📝 Naming Conventions

### Files & Folders

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `UserCard.tsx` |
| **Hooks** | camelCase + `use` prefix | `useAuth.ts` |
| **Utilities** | camelCase | `formatDate.ts` |
| **Types** | PascalCase | `User.ts` |
| **Constants** | UPPER_SNAKE_CASE | `API_ENDPOINTS.ts` |
| **Pages** | PascalCase | `Dashboard.tsx` |
| **Modules** | kebab-case (folder) | `crew-management/` |

### Code Style

```typescript
// ✅ Components: PascalCase
export function UserProfile() { }
export const DashboardCard = () => { };

// ✅ Hooks: camelCase with 'use' prefix
export function useAuth() { }
export const useCrewMembers = () => { };

// ✅ Utils: camelCase
export function formatCurrency(amount: number) { }
export const calculateDuration = () => { };

// ✅ Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = 'https://api.example.com';
export const MAX_RETRY_ATTEMPTS = 3;

// ✅ Types/Interfaces: PascalCase
interface UserProfile { }
type CrewMember = { };
```

---

## 🧩 Module Structure

Each feature module follows this structure:

```
src/modules/crew-management/
├── components/          # Module-specific components
│   ├── CrewList.tsx
│   ├── CrewCard.tsx
│   └── CrewForm.tsx
├── hooks/               # Module-specific hooks
│   └── useCrewData.ts
├── services/            # API/data services
│   └── crewService.ts
├── types/               # Module types
│   └── crew.types.ts
├── utils/               # Module utilities
│   └── crewUtils.ts
└── index.ts             # Public exports
```

---

## 🔧 Scripts Reference

### Analysis Scripts

```bash
# Complete codebase audit
npx ts-node scripts/audit-codebase.ts

# Find unused routes
npx ts-node scripts/find-dead-routes.ts

# Find unused components
npx ts-node scripts/find-unused-components.ts

# Remove dead code (dry run first!)
npx ts-node scripts/remove-dead-code.ts --dry-run
npx ts-node scripts/remove-dead-code.ts
```

### Maintenance Scripts

```bash
# Reorganize repository structure
./scripts/reorganize-repo.sh --dry-run
./scripts/reorganize-repo.sh

# Standardize file naming
./scripts/standardize-naming.sh --dry-run
./scripts/standardize-naming.sh

# Check dependencies
./scripts/check-dependencies.sh
```

---

## 📊 Code Quality Metrics

Target metrics for a healthy codebase:

| Metric | Target | Current |
|--------|--------|---------|
| Dead Routes | 0 | ✅ 0 |
| Unused Components | 0 | ✅ 0 |
| Console.logs | 0 | ✅ 0 |
| TODO Comments | < 20 | ✅ OK |
| Large Files (>500 lines) | < 10 | ✅ OK |
| Test Coverage | > 80% | 🎯 WIP |

---

## 🚀 Quick Commands

```bash
# Development
npm run dev           # Start dev server
npm run build         # Production build
npm run preview       # Preview build

# Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # TypeScript check
npm run test          # Run tests

# Supabase
npm run db:generate   # Generate types
npm run db:migrate    # Run migrations
npm run functions:deploy  # Deploy edge functions
```

---

*Last updated: January 30, 2026*
