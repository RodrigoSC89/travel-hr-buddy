# Auditoria IMCA - Quick Reference

## 🚀 Quick Start

### Access the Form
```
URL: /auditoria-imca
```

### Import Component
```tsx
import { AuditoriaIMCAForm } from "@/components/auditorias"
```

## 📁 File Locations

| Type | Path |
|------|------|
| Component | `/src/components/auditorias/AuditoriaIMCAForm.tsx` |
| Page | `/src/pages/AuditoriaIMCA.tsx` |
| API | `/pages/api/auditorias/create.ts` |
| Migration | `/supabase/migrations/20251016200800_add_imca_audit_fields.sql` |
| Tests | `/src/tests/auditoria-imca-form.test.tsx` |

## 📊 Database Schema

### Table: `auditorias_imca`

| Column | Type | Required | Default | Notes |
|--------|------|----------|---------|-------|
| id | UUID | Yes | auto | Primary Key |
| user_id | UUID | Yes | - | Foreign Key to auth.users |
| navio | TEXT | No | - | Vessel name |
| data | DATE | No | - | Audit date |
| norma | TEXT | No | - | IMCA standard |
| item_auditado | TEXT | No | - | Audited item |
| resultado | TEXT | No | - | Result: Conforme/Não Conforme/Observação |
| comentarios | TEXT | No | - | Comments |
| status | TEXT | No | completed | Status of audit |
| created_at | TIMESTAMP | Yes | now() | Auto-generated |
| updated_at | TIMESTAMP | Yes | now() | Auto-updated |

## 🔌 API Endpoint

### Create Audit

**Endpoint:** `POST /api/auditorias/create`

**Request:**
```json
{
  "navio": "DP Vessels Alpha",
  "data": "2024-10-16",
  "norma": "IMCA M103",
  "itemAuditado": "DP System Test",
  "resultado": "Conforme",
  "comentarios": "All systems OK",
  "userId": "uuid-here"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Auditoria registrada com sucesso!",
  "data": { /* audit record */ }
}
```

**Response (Error):**
```json
{
  "error": "Error message here"
}
```

## 📝 Form Fields

### Required Fields (*)
- ✅ Navio (Vessel)
- ✅ Data (Date)
- ✅ Norma IMCA (Standard)
- ✅ Item Auditado (Audited Item)
- ✅ Resultado (Result)

### Optional Fields
- 📄 Comentários / Ações Corretivas

## 🎨 Component Props

The component doesn't accept any props - it's self-contained.

## 🔐 Authentication

Requires authenticated user via `useAuth()` hook.

## 🧪 Testing

Run tests:
```bash
npm test -- auditoria-imca-form
```

**Test Coverage:**
- ✅ Form rendering
- ✅ Field presence validation
- ✅ Button functionality
- ✅ Dropdown options
- ✅ IMCA standards list
- ✅ Result options display

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| react | Core framework |
| @/components/ui/* | UI components (Button, Input, Card, etc.) |
| @/contexts/AuthContext | User authentication |
| sonner | Toast notifications |

## 🎯 IMCA Standards Supported

- IMCA M103
- IMCA M117
- IMCA M140
- IMCA M190
- IMCA M166
- IMCA MSF182
- IMCA M206
- IMCA M216
- IMCA M220

## 🚢 Vessels Available

- DP Vessels Alpha
- DP Vessels Beta
- DP Vessels Gamma

## ⚡ Result Options

- ✅ Conforme (Compliant)
- ❌ Não Conforme (Non-compliant)
- ⚠️ Observação (Observation)

## 🔒 Security (RLS)

Row Level Security ensures:
- Users can only view their own audits
- Users can only edit their own audits
- Admins can view/edit all audits

## 🎬 User Flow

1. Navigate to `/auditoria-imca`
2. Fill required fields
3. Add optional comments
4. Click "Salvar Auditoria"
5. Receive confirmation
6. Form resets for next entry

## 💡 Tips

- Form validates on submit
- Toast notifications provide feedback
- Form disables during submission
- Auto-resets after successful save
- Requires authentication

## 🐛 Common Issues

### "User not authenticated"
**Solution:** Ensure user is logged in before accessing form

### "Campos obrigatórios faltando"
**Solution:** Fill all fields marked with asterisk (*)

### API Error
**Solution:** Check network connection and server status

## 📚 Documentation

- Full README: `/src/components/auditorias/README.md`
- Visual Guide: `/AUDITORIA_IMCA_VISUAL_GUIDE.md`
- This File: `/AUDITORIA_IMCA_QUICKREF.md`

## 🔄 Future Enhancements

- [ ] File attachments
- [ ] Edit existing audits
- [ ] Audit history view
- [ ] Photo capture
- [ ] Offline support
- [ ] PDF report generation
- [ ] Audit templates
- [ ] Scheduling & reminders

## 📞 Support

For issues or questions, refer to the component README or contact the development team.

---

**Last Updated:** 2024-10-16  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
