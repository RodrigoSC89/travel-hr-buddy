# Visão Geral Module

## Purpose / Description

The Visão Geral (Overview) module provides an **executive-level overview and strategic dashboard** that consolidates high-level insights from all system modules for leadership and decision makers.

**Key Use Cases:**
- Executive summary dashboard
- Strategic KPI monitoring
- Cross-module insights aggregation
- High-level system status
- Organizational health metrics
- Quick access to critical information
- Executive reporting and briefings

## Folder Structure

```bash
src/modules/visao-geral/
├── components/      # Overview UI components (ExecutiveCard, StatusWidget, InsightPanel)
├── pages/           # Overview pages (Dashboard, Executive Summary)
├── hooks/           # Hooks for aggregated data
├── services/        # Overview aggregation services
├── types/           # TypeScript types for overview data
└── utils/           # Data aggregation and summary utilities
```

## Main Components / Files

- **ExecutiveCard.tsx** — High-level metric cards
- **StatusWidget.tsx** — System-wide status indicators
- **InsightPanel.tsx** — AI-generated executive insights
- **CrossModuleSummary.tsx** — Aggregated module summaries
- **overviewService.ts** — Data aggregation service
- **insightGenerator.ts** — Generate executive insights

## External Integrations

- **All Modules** — Data aggregation from all system modules
- **Supabase** — Overview data storage
- **Business Intelligence Module** — Strategic analytics integration
- **Dashboard Module** — Complementary dashboard features

## Status

🟢 **Functional** — Executive overview operational

## TODOs / Improvements

- [ ] Add customizable executive views
- [ ] Implement role-based dashboards
- [ ] Add executive briefing automation
- [ ] Create trend indicators and alerts
- [ ] Add drill-down capabilities
- [ ] Implement executive mobile app
- [ ] Add voice briefing feature
