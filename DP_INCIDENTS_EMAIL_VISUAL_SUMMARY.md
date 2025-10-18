# DP Incidents Email Feature - Visual Summary

## 🎨 UI Changes Overview

### 1. Incident Card - Enhanced Layout

#### BEFORE Implementation
```
┌─────────────────────────────────────────────┐
│ 🔴 Loss of Position Due to Gyro Drift       │
│ DP Class 2  [Pendente]                      │
│ 2025-09-12                                  │
│                                             │
│ Embarcação: DP Shuttle Tanker X            │
│ Local: Campos Basin                         │
│ Causa Raiz: Sensor drift not compensated   │
│                                             │
│ [gyro] [drive off] [sensor] ...            │
│                                             │
│ [Relatório] [Plano de Ação] [Analisar IA]  │
│                                             │
│ 📋 Plano de Ação Gerado                     │
│   🧠 Diagnóstico: ...                       │
│   🛠️ Causa Raiz: ...                        │
│   ✅ Ações Corretivas: ...                  │
└─────────────────────────────────────────────┘
```

#### AFTER Implementation
```
┌─────────────────────────────────────────────┐
│ 🔴 Loss of Position Due to Gyro Drift       │
│ DP Class 2  [Pendente]                      │
│ 2025-09-12                                  │
│                                             │
│ Embarcação: DP Shuttle Tanker X            │
│ Local: Campos Basin                         │
│ Causa Raiz: Sensor drift not compensated   │
│                                             │
│ [gyro] [drive off] [sensor] ...            │
│                                             │
│ [Relatório] [Plano de Ação] [Analisar IA]  │
│                                             │
│ 📩 [Enviar por E-mail]          ← NEW!     │
│                                             │
│ ✓ Enviado em 18/10/2025        ← NEW!     │
│ Status: [pendente]              ← NEW!     │
│                                             │
│ 📋 Plano de Ação Gerado                     │
│   🧠 Diagnóstico: ...                       │
│   🛠️ Causa Raiz: ...                        │
│   ✅ Ações Corretivas: ...                  │
└─────────────────────────────────────────────┘
```

### 2. Email Send Flow

```
User Action                    System Response
───────────────────────────────────────────────

[Click "Enviar por E-mail"]
         │
         ▼
   ┌─────────────┐
   │ Enter Email │ ← Prompt Dialog
   │  📧         │
   │ [Send]      │
   └─────────────┘
         │
         ▼
   Validate Email
         │
         ├─── Valid ──────┐
         │                ▼
         │         [Button: "Enviando..."]
         │                │
         │                ▼
         │         POST /api/dp-incidents/send-plan
         │                │
         │                ▼
         │         Send Email via Resend
         │                │
         │                ▼
         │         Update Database
         │                │
         │                ▼
         │         ✓ Success Toast
         │                │
         │                ▼
         │         Refresh Incidents
         │                │
         │                ▼
         │         Show Status: ✓ Enviado em DD/MM/YYYY
         │
         └─── Invalid ───► ❌ Error Toast
```

### 3. Email Status States

#### State 1: No Plan Generated
```
┌─────────────────────────────────────┐
│ [Relatório] [Plano de Ação] [...]  │
│                                     │
│ (No additional buttons or status)   │
└─────────────────────────────────────┘
```

#### State 2: Plan Generated, Not Sent
```
┌─────────────────────────────────────┐
│ [Relatório] [Plano de Ação] [...]  │
│                                     │
│ 📩 [Enviar por E-mail]              │
│                                     │
│ Não enviado                         │
└─────────────────────────────────────┘
```

#### State 3: Plan Sent - Pending
```
┌─────────────────────────────────────┐
│ [Relatório] [Plano de Ação] [...]  │
│                                     │
│ 📩 [Enviar por E-mail]              │
│                                     │
│ ✓ Enviado em 18/10/2025            │
│ Status: [pendente]                  │
└─────────────────────────────────────┘
```

#### State 4: Plan Sent - In Progress
```
┌─────────────────────────────────────┐
│ [Relatório] [Plano de Ação] [...]  │
│                                     │
│ 📩 [Enviar por E-mail]              │
│                                     │
│ ✓ Enviado em 18/10/2025            │
│ Status: [em andamento]              │
└─────────────────────────────────────┘
```

#### State 5: Plan Sent - Completed
```
┌─────────────────────────────────────┐
│ [Relatório] [Plano de Ação] [...]  │
│                                     │
│ 📩 [Enviar por E-mail]              │
│                                     │
│ ✓ Enviado em 18/10/2025            │
│ Status: [concluído]                 │
└─────────────────────────────────────┘
```

### 4. Email Template Structure

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│  📄 Plano de Ação para Incidente:                    │
│     Loss of Position Due to Gyro Drift                │
│     (Navio: DP Shuttle Tanker X)                     │
│                                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Incidente: Loss of Position Due to Gyro Drift       │
│  Navio: DP Shuttle Tanker X                          │
│  Data: 2025-09-12                                    │
│  Local: Campos Basin                                 │
│  Classe DP: DP Class 2                               │
│                                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  🧠 Diagnóstico Técnico                              │
│  The vessel experienced gradual loss of position...   │
│                                                       │
│  🛠️ Causa Raiz Provável                              │
│  Undetected gyro drift during tandem loading...      │
│                                                       │
│  ✅ Ações Corretivas                                 │
│  • Recalibrate gyro system                           │
│  • Implement drift monitoring                        │
│  • Review sensor configurations                      │
│                                                       │
│  🔄 Ações Preventivas                                │
│  • Regular gyro drift checks                         │
│  • Enhanced sensor monitoring                        │
│  • Operator training updates                         │
│                                                       │
│  📌 Responsável: DPO Department                      │
│  ⏱️ Prazo: 30 days                                    │
│                                                       │
│  🔗 Normas Referenciadas                             │
│  [IMCA M103] [IMCA M117] [IMCA M190]                │
│                                                       │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Por favor, revise este plano e atualize o status    │
│  na plataforma Nautilus One.                         │
│                                                       │
│  ℹ️ Nota: Este é um plano de ação gerado            │
│  automaticamente por IA baseado nas normas IMCA      │
│  e IMO. Recomenda-se revisão técnica antes da       │
│  implementação.                                      │
│                                                       │
└───────────────────────────────────────────────────────┘
```

### 5. Button States

#### Normal State
```
┌─────────────────────────┐
│ 📩 Enviar por E-mail    │
└─────────────────────────┘
```

#### Loading State
```
┌─────────────────────────┐
│ 🔄 Enviando...          │
└─────────────────────────┘
```

#### Disabled State (when sending)
```
┌─────────────────────────┐
│ 📩 Enviar por E-mail    │  (grayed out, not clickable)
└─────────────────────────┘
```

### 6. Status Badge Colors

```
┌──────────────┐  ← Yellow/Amber background
│  pendente    │     (waiting for action)
└──────────────┘

┌──────────────┐  ← Blue background
│ em andamento │     (work in progress)
└──────────────┘

┌──────────────┐  ← Green background
│  concluído   │     (completed)
└──────────────┘
```

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│     UI      │
└──────┬──────┘
       │ User clicks "Enviar por E-mail"
       │ Enters email: "safety@company.com"
       ▼
┌─────────────────────────────────────┐
│ POST /api/dp-incidents/send-plan    │
│                                     │
│ Body: {                             │
│   id: "imca-2025-014",              │
│   email: "safety@company.com"       │
│ }                                   │
└──────┬──────────────────────────────┘
       │
       ├──► Validate inputs
       │
       ├──► Fetch incident from Supabase
       │         ├─── Not found ──► 404 Error
       │         └─── Found ─────► Continue
       │
       ├──► Check plan_of_action exists
       │         ├─── Null ──────► 400 Error
       │         └─── Exists ────► Continue
       │
       ├──► Send email via Resend API
       │         ├─── Fails ─────► 500 Error
       │         └─── Success ───► Continue
       │
       └──► Update database
                 │
                 ▼
           ┌─────────────────────────┐
           │ dp_incidents table      │
           ├─────────────────────────┤
           │ plan_sent_to:           │
           │   "safety@company.com"  │
           │ plan_sent_at:           │
           │   "2025-10-18T14:30:00" │
           │ plan_status:            │
           │   "pendente"            │
           └─────────────────────────┘
                 │
                 ▼
           Return success
                 │
                 ▼
        ┌──────────────┐
        │ Toast Success │
        │ Refresh Data  │
        │ Update UI     │
        └──────────────┘
```

## 🎯 Key Visual Features

### Color Coding
- 🟢 **Green** - Enviado (sent successfully)
- 🟡 **Yellow/Amber** - Pendente (pending action)
- 🔵 **Blue** - Em andamento (in progress)
- 🟢 **Green** - Concluído (completed)
- ⚫ **Gray** - Não enviado (not sent)

### Icons
- 📩 - Email/Send action
- ✓ - Success indicator
- 🧠 - Diagnosis
- 🛠️ - Root cause
- ✅ - Corrective actions
- 🔄 - Preventive actions
- 📌 - Responsibility
- ⏱️ - Timeline
- 🔗 - Standards/References

### Typography
- **Bold** - Labels and section headers
- Regular - Content
- Small/muted - Status and metadata

## 📱 Responsive Behavior

### Desktop View
```
[Relatório] [Plano de Ação] [Analisar IA]
         [📩 Enviar por E-mail]
    ✓ Enviado em 18/10/2025
       Status: [pendente]
```

### Mobile View
```
[Relatório]
[Plano de Ação]
[Analisar IA]

[📩 Enviar por E-mail]

✓ Enviado em 18/10/2025
Status: [pendente]
```

---

**Visual Summary Complete** ✅  
All UI components and flows documented with ASCII diagrams
