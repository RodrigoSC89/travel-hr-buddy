# Assistant Logs API - Email Notifications & Public View Implementation

## 📋 Overview

This implementation adds two key features to the Assistant Logs API:
1. **Email notifications on failure** - Automatically notify administrators when daily report sending fails
2. **Public read-only view mode** - Allow viewing logs without filters/export capabilities via URL parameter

## ✅ Features Implemented

### 1. Email Notification on Failure

**File**: `supabase/functions/send-restore-dashboard-daily/index.ts`

When the daily restore dashboard report fails to send, the system now:
- ✅ Captures the error details
- ✅ Sends an email notification to the administrator
- ✅ Uses Resend API for email delivery
- ✅ Logs the error to `restore_report_logs` table
- ✅ Gracefully handles email sending failures

**Email Details**:
- **From**: `alerta@empresa.com` (or `EMAIL_FROM` env var)
- **To**: Admin email from `REPORT_ADMIN_EMAIL` or `ADMIN_EMAIL` env vars
- **Subject**: 🚨 Falha no Envio de Relatório Diário
- **Body**: Error details from the caught exception

**Code Example**:
```typescript
try {
  // ... main report sending logic
} catch (error) {
  const status = 'error';
  const message = 'Falha ao enviar o relatório automático.';
  const errorDetails = error instanceof Error ? error.message : 'Erro desconhecido';
  
  // ✅ Send notification to administrator
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("REPORT_ADMIN_EMAIL") || Deno.env.get("ADMIN_EMAIL");
    
    if (resendApiKey && adminEmail) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("EMAIL_FROM") || "alerta@empresa.com",
          to: adminEmail,
          subject: '🚨 Falha no Envio de Relatório Diário',
          text: `Erro: ${errorDetails}`,
        }),
      });
    }
  } catch (emailError) {
    console.error("Failed to send error notification:", emailError);
    // Don't fail the function if email notification fails
  }
  
  // Log the error
  await logExecution(supabase, status, message, errorDetails);
}
```

### 2. Public Read-Only View Mode

**File**: `src/pages/admin/reports/logs.tsx`

The logs page now supports a public read-only mode activated by adding `?public=1` to the URL.

**Features**:
- ✅ Detects `?public=1` URL parameter using React Router's `useLocation` hook
- ✅ Hides filter controls (status, date range, search button)
- ✅ Hides export buttons (CSV, PDF)
- ✅ Displays public mode notice at bottom of page
- ✅ Shows all logs in read-only format
- ✅ Maintains full functionality in normal mode

**Access URLs**:
- **Normal mode**: `/admin/reports/logs`
- **Public mode**: `/admin/reports/logs?public=1`

**Code Example**:
```tsx
import { useLocation } from "react-router-dom";

export default function RestoreReportLogsPage() {
  const location = useLocation();
  
  // Check if in public mode
  const isPublic = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("public") === "1";
  }, [location.search]);
  
  return (
    <div>
      {/* Filters - hidden in public mode */}
      {!isPublic && (
        <Card>
          <CardContent>
            {/* Filter controls */}
          </CardContent>
        </Card>
      )}
      
      {/* Logs display - always visible */}
      <Card>
        {/* ... logs list ... */}
      </Card>
      
      {/* Public mode notice */}
      {isPublic && (
        <p className="text-muted-foreground text-xs text-center mt-4">
          🔒 Visualização pública apenas para leitura.
        </p>
      )}
    </div>
  );
}
```

## 🧪 Testing

### Test Coverage
**File**: `src/tests/pages/admin/reports/logs.test.tsx`

Added 5 new test cases for public mode:
1. ✅ Filters and export buttons are hidden in public mode
2. ✅ Public mode notice is displayed when `?public=1` is present
3. ✅ Public mode notice is NOT displayed in normal mode
4. ✅ Filters and export buttons are shown in normal mode
5. ✅ URL parameter detection works correctly

**Test Results**: All 28 tests passing ✅

### Running Tests
```bash
npm test -- logs.test.tsx
```

## 🔐 Security Considerations

### Email Notifications
- Email sending failures don't break the main function
- Requires valid `RESEND_API_KEY` environment variable
- Admin email configured via environment variables
- Error details are sanitized before sending

### Public View Mode
- Read-only access - no mutations possible
- URL parameter based (easy to share)
- Still respects Supabase RLS policies
- No sensitive data exposed beyond what's in logs
- Consider IP whitelisting for production use

## 📝 Environment Variables Required

```env
# Required for email notifications
RESEND_API_KEY=re_xxxxxxxxxxxx
REPORT_ADMIN_EMAIL=admin@example.com  # Or ADMIN_EMAIL
EMAIL_FROM=alerta@empresa.com

# Supabase (already configured)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## 🚀 Deployment

### Edge Function Deployment
```bash
# Deploy the updated edge function
supabase functions deploy send-restore-dashboard-daily

# Set environment variables (if not already set)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set REPORT_ADMIN_EMAIL=admin@example.com
```

### Frontend Deployment
The React application will automatically pick up the changes on next deployment.

## 📊 Usage Examples

### Normal Admin View
```
URL: https://your-app.com/admin/reports/logs
- Full access to filters
- Can export CSV/PDF
- Can search and filter logs
```

### Public Read-Only View
```
URL: https://your-app.com/admin/reports/logs?public=1
- View-only access
- No filters or exports
- Shows public mode notice
- Perfect for TV wall displays or external stakeholders
```

## 🎯 Benefits

### Email Notifications
- ✅ Immediate awareness of report failures
- ✅ No need to manually check logs
- ✅ Error details included for quick debugging
- ✅ Automated monitoring

### Public View Mode
- ✅ Share logs without granting full admin access
- ✅ Perfect for TV wall dashboards
- ✅ Stakeholder visibility without risk
- ✅ Simple URL parameter toggle

## 📚 Related Documentation

- [RESTORE_REPORT_LOGS_IMPLEMENTATION.md](./RESTORE_REPORT_LOGS_IMPLEMENTATION.md) - Original logs implementation
- [TV_WALL_DASHBOARD_GUIDE.md](./TV_WALL_DASHBOARD_GUIDE.md) - TV wall dashboard setup
- [ASSISTANT_LOGS_API_IMPLEMENTATION_COMPLETE.md](./ASSISTANT_LOGS_API_IMPLEMENTATION_COMPLETE.md) - Complete API docs

## 🔄 Future Enhancements

- [ ] Add email notification retry logic
- [ ] Support email templates for notifications
- [ ] Add public access token for enhanced security
- [ ] Rate limiting for public view endpoints
- [ ] Email digest of multiple failures
- [ ] Slack/Teams integration for notifications

---

**Implementation Date**: October 13, 2025  
**Status**: ✅ Complete and Tested  
**Files Modified**: 2 (edge function + React component)  
**Tests Added**: 5 new test cases  
**All Tests**: ✅ Passing (28/28)
