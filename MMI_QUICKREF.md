# MMI Quick Reference Guide

## 🎯 Quick Access

### Files
- **Main Documentation:** `mmi-readme.md`
- **Module README:** `src/modules/mmi/README.md`
- **Copilot Component:** `src/components/mmi/MaintenanceCopilot.tsx`
- **Assistant Integration:** `supabase/functions/assistant-query/index.ts`

---

## 🗂️ Database Tables

| Table | Purpose |
|-------|---------|
| `mmi_assets` | Fleet assets (vessels, generators, engines) |
| `mmi_components` | Individual components requiring maintenance |
| `mmi_jobs` | Maintenance jobs (pending, in progress, completed) |
| `mmi_os` | Work orders (Ordens de Serviço) |
| `mmi_history` | Technical history and failure logs |
| `mmi_hours` | Hour meter readings (manual, OCR, IoT) |

---

## 🔌 API Endpoints

### 1. Postpone Job
**Endpoint:** `POST /functions/v1/mmi-postpone-job`

**Request:**
```json
{
  "jobId": 2493,
  "reason": "Equipamento ainda operacional"
}
```

**Response:**
```json
{
  "success": true,
  "recommendation": "✅ Pode postergar",
  "risk_level": "low",
  "suggested_date": "2025-11-15T00:00:00Z"
}
```

### 2. Create Work Order
**Endpoint:** `POST /functions/v1/mmi-create-os`

**Request:**
```json
{
  "jobId": 2493,
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "os_id": 1847,
  "os_number": "OS-2025-001847"
}
```

---

## 💬 Copilot Commands

### Quick Actions
- **Criar Job** → "Criar novo job de manutenção"
- **OS Críticas** → "Listar OS críticas"
- **Jobs Pendentes** → "Listar jobs pendentes"
- **Postergar** → "Avaliar postergação de job"

### Natural Language Commands
```
"Criar job de troca de óleo no gerador BB"
"Postergar job #2493"
"Listar OS críticas para a docagem"
"Quantos jobs críticos estão pendentes?"
"Gerar OS para o job 2445"
"Equipamentos com manutenção vencida"
```

---

## 🎮 Global Assistant Commands

| Command | Action |
|---------|--------|
| `manutenção` / `manutencao` | Navigate to MMI module |
| `jobs` | List maintenance jobs |
| `criar job` | Show job creation instructions |
| `os` / `ordem de serviço` | OS management |
| `postergar` | Postponement evaluation |
| `equipamentos` | Asset management |

---

## 🎨 Component Usage

### Import MaintenanceCopilot
```tsx
import MaintenanceCopilot from '@/components/mmi/MaintenanceCopilot';
```

### Use in Page
```tsx
function MMIPage() {
  return (
    <div className="container mx-auto p-4">
      <MaintenanceCopilot />
    </div>
  );
}
```

---

## 📊 Risk Levels

| Level | Color | Badge |
|-------|-------|-------|
| Low | 🟢 Green | `bg-green-500` |
| Medium | 🟡 Yellow | `bg-yellow-500` |
| High | 🟠 Orange | `bg-orange-500` |
| Critical | 🔴 Red | `bg-red-500` |

---

## 🔑 Job Types

- **preventive** — Preventive maintenance
- **corrective** — Corrective maintenance
- **inspection** — Inspection
- **emergency** — Emergency maintenance

---

## 📈 KPIs Tracked

- **MTBF** — Mean Time Between Failures
- **MTTR** — Mean Time To Repair
- **Availability** — % operational time
- **Postponement Rate** — % jobs postponed
- **Preventive Effectiveness** — % failures prevented
- **Cost per Hour** — Average maintenance cost
- **AI Accuracy** — % correct AI recommendations

---

## 🚀 Implementation Phases

### ✅ Phase 0: Documentation (COMPLETE)
- Technical documentation
- Component specifications
- Assistant integration

### 🟡 Phase 1: Backend (TODO)
- Edge Functions
- Database migrations
- RLS policies

### 🟡 Phase 2: Frontend (TODO)
- JobCards component
- AssetList component
- OSManager component

### 🟡 Phase 3: Advanced (TODO)
- OCR integration
- IoT sensors
- Predictive analytics

---

## 🛠️ Tech Stack

- **Frontend:** React 18+ + TypeScript
- **UI:** TailwindCSS + shadcn/ui
- **Backend:** Supabase
- **AI:** OpenAI GPT-4
- **Icons:** Lucide React

---

## 📞 Quick Links

- [Full Documentation](./mmi-readme.md)
- [Module README](./src/modules/mmi/README.md)
- [Implementation Complete](./MMI_IMPLEMENTATION_COMPLETE.md)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)

---

**Version:** 1.0.0  
**Last Updated:** October 2025
