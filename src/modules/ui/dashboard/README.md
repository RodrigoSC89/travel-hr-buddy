# Dashboard Module

## Purpose / Description

The Dashboard module serves as the **main control panel and overview system** for Nautilus One. It provides a centralized view of key performance indicators (KPIs), system metrics, and quick access to all major functionalities.

**Key Use Cases:**
- View real-time system metrics and KPIs
- Quick navigation to all system modules
- Monitor operational health and alerts
- Access personalized widgets and shortcuts
- View summary cards for trips, employees, vessels, and documents

## Folder Structure

```bash
src/modules/dashboard/
├── components/      # Dashboard UI components (DashboardCard, MetricWidget, QuickActions)
├── pages/           # Main dashboard page and sub-pages
├── hooks/           # Custom hooks for dashboard data fetching
├── services/        # Dashboard data services and API calls
├── types/           # TypeScript types and interfaces
└── utils/           # Utility functions for data formatting
```

## Main Components / Files

- **DashboardCard.tsx** — Displays KPI summary cards with metrics
- **MetricWidget.tsx** — Shows individual metric visualization
- **QuickActions.tsx** — Quick access buttons to common actions
- **DashboardLayout.tsx** — Main layout structure for the dashboard
- **dashboardService.ts** — API service for fetching dashboard data

## External Integrations

- **Supabase** — Real-time data synchronization and backend queries
- **React Query** — Data caching and state management

## Status

🟢 **Functional** — Core dashboard features implemented

## TODOs / Improvements

- [ ] Add customizable widget system for user personalization
- [ ] Implement drag-and-drop dashboard layout
- [ ] Add more chart types and visualizations
- [ ] Improve performance with data virtualization
- [ ] Add export functionality for dashboard reports
