# MMI (Manutenção Inteligente) Module

## Purpose / Description

The MMI (Módulo Manutenção Inteligente) module implements the **Intelligent Maintenance Management System** for the Nautilus One platform. It provides AI-powered maintenance planning, job management, work order creation, and predictive maintenance capabilities for maritime assets.

**Key Use Cases:**
- Create and manage maintenance jobs (preventive, corrective, inspection, emergency)
- Track asset health and operational status
- Generate automatic work orders (OS - Ordem de Serviço)
- AI-powered postponement recommendations
- Equipment and component lifecycle management
- Maintenance history tracking
- Hour meter readings (manual, OCR, IoT)
- Predictive failure analysis
- Cost tracking and KPI reporting

## Folder Structure

```bash
src/modules/mmi/
├── components/      # MMI UI components (MaintenanceCopilot, JobCards, AssetList, OSManager)
├── pages/           # MMI pages (Dashboard, Jobs, Assets, Work Orders, Reports)
├── hooks/           # Hooks for MMI operations and real-time updates
├── services/        # MMI services and API integrations
├── types/           # TypeScript types for jobs, assets, work orders, history
└── utils/           # MMI utilities and calculations (KPIs, health scores, risk analysis)
```

## Main Components / Files

### Components
- **MaintenanceCopilot.tsx** — AI-powered chat interface for maintenance management
- **JobCards.tsx** — Display maintenance job cards with status and actions
- **AssetList.tsx** — List and manage fleet assets
- **OSManager.tsx** — Work order (OS) creation and management
- **ComponentHealth.tsx** — Component health score visualization
- **HourMeterReader.tsx** — Hour meter reading interface

### Services
- **mmiService.ts** — Main MMI operations service
- **postponementService.ts** — AI-powered postponement evaluation
- **osService.ts** — Work order management service
- **healthAnalysisService.ts** — Asset health analysis and prediction

### Types
- **job.types.ts** — Job-related TypeScript interfaces
- **asset.types.ts** — Asset and component interfaces
- **os.types.ts** — Work order interfaces
- **history.types.ts** — Maintenance history interfaces

## Database Schema

The MMI module uses 6 main Supabase tables:

1. **mmi_assets** — Assets (vessels, generators, engines, pumps, etc.)
2. **mmi_components** — Individual components requiring maintenance
3. **mmi_jobs** — Maintenance jobs (pending, in progress, completed)
4. **mmi_os** — Work orders linked to jobs
5. **mmi_history** — Technical history of failures and interventions
6. **mmi_hours** — Hour meter readings (manual, OCR, IoT)

See [mmi-readme.md](../../../mmi-readme.md) for detailed schema documentation.

## API Routes

### Supabase Edge Functions

1. **mmi-postpone-job** — Evaluate if a job can be safely postponed
   - Endpoint: `POST /functions/v1/mmi-postpone-job`
   - Uses GPT-4 to analyze risk and provide recommendations

2. **mmi-create-os** — Create a new work order from a job
   - Endpoint: `POST /functions/v1/mmi-create-os`
   - Generates OS number and initializes work order

3. **mmi-analyze-health** — Analyze asset health and predict failures
   - Endpoint: `POST /functions/v1/mmi-analyze-health`
   - Returns health score, risk level, and recommendations

### Integration with Global Assistant

The global assistant (`assistant-query`) now includes MMI awareness with commands:
- `manutenção` / `manutencao` → Navigate to MMI module
- `jobs` → List maintenance jobs
- `criar job` → Job creation instructions
- `os` / `ordem de serviço` → Work order management
- `postergar` → Postponement evaluation
- `equipamentos` → Asset management

## External Integrations

- **Supabase** — Database, Edge Functions, Storage, Real-time
- **OpenAI GPT-4** — AI-powered recommendations and analysis
- **Resend / SendGrid** — Email notifications for work orders and alerts
- **Twilio** — SMS alerts for critical maintenance
- **Tesseract.js / Google Cloud Vision** — OCR for hour meter reading
- **MQTT/WebSocket** — Real-time IoT sensor data

## AI Features

### 1. Intelligent Postponement
- Analyzes maintenance history, current hours, and asset criticality
- Provides risk assessment (low, medium, high, critical)
- Suggests monitoring conditions if postponement is approved
- Recommends maximum postponement date

### 2. Natural Language Job Creation
User can create jobs via chat:
- "Criar job de troca de óleo no gerador BB"
- "Registrar inspeção visual no motor STBD"
- "Agendar manutenção preventiva do sistema hidráulico"

### 3. Predictive Maintenance
- Calculates failure probability based on historical data
- Identifies patterns in maintenance history
- Provides early warning alerts for critical assets
- Optimizes maintenance scheduling

### 4. Technical Recommendations
- Suggests parts and materials needed
- Estimates labor hours
- Recommends preventive actions
- Provides step-by-step maintenance procedures

## Status

🟡 **In Development** — Core documentation complete, implementation in progress

### Completed
- ✅ Technical documentation (mmi-readme.md)
- ✅ Database schema design
- ✅ API route specifications
- ✅ Component architecture
- ✅ Global assistant integration
- ✅ Module structure

### In Progress
- 🟡 MaintenanceCopilot.tsx component
- 🟡 Edge Functions implementation
- 🟡 Database migrations
- 🟡 JobCards component

### Pending
- ⏳ Frontend components (AssetList, OSManager)
- ⏳ Route configuration
- ⏳ Integration tests
- ⏳ OCR for hour meter reading
- ⏳ IoT sensor integration
- ⏳ Analytics dashboards

## KPIs and Metrics

The MMI module tracks several key performance indicators:

- **MTBF** (Mean Time Between Failures) — Average time between failures
- **MTTR** (Mean Time To Repair) — Average repair time
- **Availability** — Percentage of operational time
- **Postponement Rate** — Percentage of jobs postponed vs. completed on time
- **Preventive Effectiveness** — Percentage of failures prevented by preventive maintenance
- **Cost per Hour** — Average maintenance cost per hour
- **AI Accuracy** — Percentage of correct AI recommendations

## Usage Examples

### Creating a Job via Copilot
```typescript
// User types in MaintenanceCopilot:
"Criar job de troca de filtros no gerador principal"

// AI Response:
✅ Job criado com sucesso!
📋 Job #2494 - Troca de filtros - Gerador Principal
📅 Data prevista: 2025-10-20
⚡ Prioridade: Média
```

### Evaluating Postponement
```typescript
// User types:
"Postergar job #2493"

// AI analyzes and responds:
⚠️ POSTERGAR COM CONDIÇÕES (Risco Médio)
- Monitorar temperatura do óleo diariamente
- Verificar pressão hidráulica a cada turno
- Nova avaliação em 7 dias
📅 Data máxima recomendada: 30/10/2025
```

### Creating a Work Order
```typescript
// User clicks "Criar OS" on JobCard or types:
"Gerar OS para o job 2493"

// System creates work order:
✅ OS-2025-001848 criada com sucesso!
📋 Job: #2493 - Troca de filtros
⏱️ Tempo estimado: 4 horas
```

## TODOs / Improvements

### Phase 1: Core Implementation
- [ ] Create database migrations for all MMI tables
- [ ] Implement Edge Functions (postpone-job, create-os, analyze-health)
- [ ] Build MaintenanceCopilot.tsx with full AI integration
- [ ] Create JobCards.tsx component

### Phase 2: Advanced Features
- [ ] Add OCR integration for hour meter reading
- [ ] Connect IoT sensors for real-time monitoring
- [ ] Implement vector embeddings for technical history
- [ ] Create predictive failure models

### Phase 3: Analytics & Reporting
- [ ] Build KPI dashboards
- [ ] Implement PDF/CSV export with insights
- [ ] Add trend analysis charts
- [ ] Create automated alert system

### Phase 4: Mobile & Offline
- [ ] PWA support for offline maintenance logging
- [ ] Mobile-optimized interface
- [ ] Photo upload for inspections
- [ ] Barcode/QR code scanning for assets

## Related Documentation

- [Main Technical Documentation](../../../mmi-readme.md) — Comprehensive MMI documentation
- [Implementation Complete Summary](../../../MMI_IMPLEMENTATION_COMPLETE.md) — Implementation status
- [Quick Reference Guide](../../../MMI_QUICKREF.md) — Quick command reference

---

**Module Owner:** Maintenance & Fleet Operations Team  
**Last Updated:** October 2025  
**Status:** 🟡 In Development
