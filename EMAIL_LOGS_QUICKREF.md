# Email Logs Page - Quick Reference

## 🚀 Quick Access

**URL**: `/admin/reports/email-logs`

**Route**: Added to `src/App.tsx`

**Component**: `src/pages/admin/reports/email-logs.tsx`

## 📊 What It Does

Displays audit logs of all email reports sent by the system with:
- Status filtering
- Date range filtering
- Real-time log display
- Color-coded badges

## 🎯 Usage

### View All Logs
1. Navigate to `/admin/reports/email-logs`
2. All logs display automatically (newest first)

### Filter by Status
1. Enter status in "Filtrar por status" field
2. Click "🔍 Atualizar" button

### Filter by Date Range
1. Select start date
2. Select end date
3. Click "🔍 Atualizar" button

## 💾 Database

**Table**: `report_email_logs`

**Key Fields**:
- `sent_at`: Timestamp
- `status`: success, error, etc.
- `message`: Description
- `recipient_email`: Email address

## 🔑 Insert a Log

```typescript
await supabase.from("report_email_logs").insert({
  status: "success",
  message: "Email sent to user@example.com",
  recipient_email: "user@example.com",
});
```

## 🎨 UI Components

- Status Badge: Green (success), Red (error), Gray (other)
- Date Format: dd/MM/yyyy HH:mm
- Scrollable area for long lists
- Card layout for each log

## 🔒 Security

- Admin role required
- RLS enabled
- Service role can insert
- Admins can view

## ✅ Testing

```bash
npm run test src/tests/pages/admin/reports/email-logs.test.tsx
```

**Results**: 7/7 tests passing

## 📦 Files

| File | Purpose |
|------|---------|
| `src/pages/admin/reports/email-logs.tsx` | Main page component |
| `src/tests/pages/admin/reports/email-logs.test.tsx` | Tests |
| `supabase/migrations/20251012004018_create_report_email_logs.sql` | Database schema |

## 🎯 Status

✅ **COMPLETE** - All tests passing, build successful

---

**Quick Start**: Just navigate to `/admin/reports/email-logs` and start viewing logs!
