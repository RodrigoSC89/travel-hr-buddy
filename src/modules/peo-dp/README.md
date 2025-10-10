# PEO-DP Module

## Purpose / Description

The PEO-DP (Gestão de RH e Pessoal) module is the **comprehensive HR and personnel management system**. It handles all aspects of human resources including employee records, payroll, benefits, and workforce management.

**Key Use Cases:**

- Manage employee records and profiles
- Process payroll and compensation
- Administer benefits and insurance
- Track time and attendance
- Performance management and reviews
- Recruitment and onboarding
- Training and development
- HR compliance and reporting

## Folder Structure

```bash
src/modules/peo-dp/
├── components/      # HR UI components (EmployeeCard, PayrollTable, BenefitsPanel)
├── pages/           # HR management pages (Employees, Payroll, Benefits)
├── hooks/           # Hooks for HR operations
├── services/        # HR services and integrations
├── types/           # TypeScript types for employees, payroll, benefits
└── utils/           # HR utilities and calculations
```

## Main Components / Files

- **EmployeeCard.tsx** — Display employee information
- **PayrollTable.tsx** — Payroll processing interface
- **BenefitsPanel.tsx** — Benefits administration
- **TimeTracker.tsx** — Time and attendance tracking
- **PerformanceReview.tsx** — Performance evaluation interface
- **hrService.ts** — HR operations service
- **payrollCalculator.ts** — Payroll calculations

## External Integrations

- **Supabase** — Employee data storage
- **Portal Funcionário Module** — Employee self-service integration
- **External HR Systems** — ADP, Workday (future)

## Status

🟡 **In Progress** — Core HR features implemented, integrations pending

## TODOs / Improvements

- [ ] Complete Supabase database schema for PEO-DP
- [ ] Add payroll integration with accounting systems
- [ ] Implement benefits enrollment workflow
- [ ] Add recruitment and ATS features
- [ ] Create succession planning tools
- [ ] Add workforce analytics
- [ ] Implement compliance reporting (labor laws)
