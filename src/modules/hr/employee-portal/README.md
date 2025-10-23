# Portal do Funcionário Module

## Purpose / Description

The Portal do Funcionário (Employee Portal) module provides a **self-service platform for employees** to manage their HR-related tasks, access company information, and interact with various systems without requiring administrative intervention.

**Key Use Cases:**
- View and update personal information
- Request time off and manage vacation days
- Access pay stubs and tax documents
- Submit expense reports and reimbursements
- View and enroll in benefits
- Complete training courses and certifications
- Communicate with HR department
- Track personal performance and goals

## Folder Structure

```bash
src/modules/portal-funcionario/
├── components/      # Portal UI components (ProfileCard, RequestForm, DocumentViewer)
├── pages/           # Employee portal pages (Profile, TimeOff, Documents, Benefits)
├── hooks/           # Hooks for employee data and HR operations
├── services/        # Employee services and HR system integration
├── types/           # TypeScript types for employee data and requests
└── utils/           # Utilities for data formatting and validation
```

## Main Components / Files

- **ProfileCard.tsx** — Display and edit employee profile information
- **TimeOffRequest.tsx** — Request vacation and time off
- **ExpenseReport.tsx** — Submit and track expense reimbursements
- **DocumentLibrary.tsx** — Access personal documents and company policies
- **BenefitsEnrollment.tsx** — View and select benefits options
- **employeeService.ts** — API service for employee data management

## External Integrations

- **Supabase** — Employee data storage and authentication
- **PEO-DP Module** — Integration with HR management system

## Status

🟢 **Functional** — Employee self-service features operational

## TODOs / Improvements

- [ ] Add mobile app version for on-the-go access
- [ ] Implement push notifications for important updates
- [ ] Add goal tracking and performance reviews
- [ ] Integrate with external HR systems (ADP, Workday)
- [ ] Add employee directory and org chart
- [ ] Implement peer recognition system
