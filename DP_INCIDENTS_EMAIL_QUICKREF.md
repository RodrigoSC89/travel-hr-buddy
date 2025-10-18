# DP Incidents Email Feature - Quick Reference

## 🎯 What Was Added

Action plan email management for DP Intelligence Center incidents.

## 📋 Quick Overview

### Database Fields (3 new)
```sql
plan_sent_to    TEXT                       -- Email recipient
plan_status     TEXT                       -- pendente | em andamento | concluído  
plan_sent_at    TIMESTAMP WITH TIME ZONE   -- Send timestamp
```

### API Endpoint
```
POST /api/dp-incidents/send-plan
Body: { id: "imca-2025-014", email: "safety@company.com" }
```

### UI Changes
- ✅ Send email button on incident cards
- ✅ Email status display (sent date + status badge)
- ✅ Email prompt dialog
- ✅ Loading states

## 🚀 How to Use

### 1. Generate Action Plan
Click "Plano de Ação" button on incident card → AI generates plan

### 2. Send via Email
Click "📩 Enviar por E-mail" button → Enter recipient email → Send

### 3. Track Status
View send date and status badge on incident card

## 🔧 Environment Setup

Required variables:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx        # Required
EMAIL_FROM=nautilus@yourdomain.com     # Optional
NEXT_PUBLIC_SUPABASE_URL=https://...   # Required
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # Required
```

## 📧 Email Template

Includes:
- 🧠 Diagnóstico Técnico
- 🛠️ Causa Raiz
- ✅ Ações Corretivas (lista)
- 🔄 Ações Preventivas (lista)
- 📌 Responsável
- ⏱️ Prazo
- 🔗 Normas Referenciadas

## 🐛 Troubleshooting

### Email not sending?
1. Check RESEND_API_KEY is set
2. Verify email format is valid
3. Ensure action plan was generated

### Button not showing?
- Generate action plan first
- Refresh incidents list

### Database update fails?
- Run migration: `supabase migration up`
- Check service role key

## 📊 Status Values

| Status | Meaning |
|--------|---------|
| `pendente` | Plan sent, waiting for action |
| `em andamento` | Actions being implemented |
| `concluído` | Actions completed |

## 🎨 UI Components

### Incident Card - Before
```
[Relatório] [Plano de Ação] [Analisar IA]
```

### Incident Card - After (with plan)
```
[Relatório] [Plano de Ação] [Analisar IA]
[📩 Enviar por E-mail]
✓ Enviado em 18/10/2025
Status: [pendente]
```

## 📝 Code Examples

### Send Email (API)
```typescript
const response = await fetch('/api/dp-incidents/send-plan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'imca-2025-014',
    email: 'safety@company.com'
  })
});

const result = await response.json();
// { ok: true, emailId: "re_abc123", message: "..." }
```

### Check Email Status (UI)
```typescript
{incident.plan_sent_at && (
  <div>
    ✓ Enviado em {new Date(incident.plan_sent_at).toLocaleDateString("pt-BR")}
    {incident.plan_status && (
      <Badge>{incident.plan_status}</Badge>
    )}
  </div>
)}
```

## 🔒 Security Notes

- ✅ Email validation before sending
- ✅ Service role authentication for DB
- ✅ Input sanitization
- ✅ Error handling & logging

## 📁 Files Modified

```
supabase/migrations/
  └── 20251017193448_add_plan_fields_to_dp_incidents.sql

pages/api/dp-incidents/
  └── send-plan.ts

src/components/dp-intelligence/
  └── dp-intelligence-center.tsx

DP_INCIDENTS_PLAN_FIELDS_IMPLEMENTATION.md (full docs)
```

## ✅ Testing Checklist

- [x] Build passes
- [x] Linting passes
- [x] All tests pass (1515/1515)
- [x] TypeScript compiles
- [x] Email validation works
- [x] Status display works
- [x] Loading states work

## 🚀 Deployment

```bash
# 1. Run migration
supabase migration up

# 2. Set env vars in deployment platform

# 3. Deploy
npm run build
npm run deploy:vercel  # or deploy:netlify

# 4. Test in production
```

## 📚 Full Documentation

See: `DP_INCIDENTS_PLAN_FIELDS_IMPLEMENTATION.md`

---

**Last Updated:** October 18, 2025  
**Version:** 1.0.0
