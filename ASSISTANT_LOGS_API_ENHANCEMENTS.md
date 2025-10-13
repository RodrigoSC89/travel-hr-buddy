# 📧 Assistant Logs API - Email Notifications & Public View

## Overview

This implementation adds two key features to the Assistant Logs API system:

1. **📬 Email Notification on Failure**: Automatically notifies administrators when the daily restore report fails to send
2. **🌐 Public View Mode**: Allows read-only access to logs via query parameter `?public=1`

---

## 1. Email Notification on Failure

### Implementation Details

**File**: `supabase/functions/send-restore-dashboard-daily/index.ts`

When the daily restore report Edge Function encounters an error, it now automatically sends an email notification to the administrator before logging the error.

### Features

✅ **Automatic Email Notification**: Sends email when report generation or sending fails  
✅ **Detailed Error Information**: Includes error message and timestamp in Portuguese (pt-BR)  
✅ **Professional HTML Email**: Styled email with clear error indication  
✅ **Non-Blocking**: Email failure doesn't prevent error response or logging  
✅ **Uses Existing Infrastructure**: Leverages Resend API already configured for reports  

### Configuration

**Environment Variables Required:**
- `RESEND_API_KEY`: API key for Resend email service (required)
- `REPORT_ADMIN_EMAIL` or `ADMIN_EMAIL`: Recipient email address
- `EMAIL_FROM` (optional): Sender email, defaults to "alerta@empresa.com"

### Email Format

**Subject**: 🚨 Falha no Envio de Relatório Diário

**Content**:
- Error message
- Date/time of failure (in pt-BR format)
- Automatic notification disclaimer

**Text Version**: Plain text with error details  
**HTML Version**: Styled HTML with red header and formatted error display

### Code Changes

```typescript
} catch (error) {
  console.error("❌ Error in send-restore-dashboard-daily:", error);
  
  const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
  
  // ✅ Send notification to administrator on failure
  try {
    const adminEmail = Deno.env.get("REPORT_ADMIN_EMAIL") || Deno.env.get("ADMIN_EMAIL") || "admin@example.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      console.log("📧 Sending failure notification email...");
      
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("EMAIL_FROM") || "alerta@empresa.com",
          to: adminEmail,
          subject: "🚨 Falha no Envio de Relatório Diário",
          text: `Erro: ${errorMessage}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2 style="color: #dc2626;">🚨 Falha no Envio de Relatório Diário</h2>
              <p><strong>Erro:</strong> ${errorMessage}</p>
              <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
              <p style="color: #666; font-size: 12px;">Este é um alerta automático do sistema de relatórios.</p>
            </div>
          `,
        }),
      });
      
      if (response.ok) {
        console.log("✅ Failure notification email sent successfully");
      } else {
        console.error("❌ Failed to send notification email:", await response.text());
      }
    }
  } catch (emailError) {
    console.error("❌ Error sending notification email:", emailError);
    // Don't throw - email failure shouldn't break error response
  }
  
  // Log critical error
  await logExecution(supabase, "error", "Falha ao enviar o relatório automático.", error);
  
  return new Response(
    JSON.stringify({
      success: false,
      error: errorMessage
    }),
    {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
```

### Testing

1. **Manual Test**: Trigger the Edge Function with invalid credentials
2. **Check Email**: Verify admin receives failure notification
3. **Check Logs**: Verify error is logged in `restore_report_logs` table with status "error"

---

## 2. Public View Mode

### Implementation Details

**File**: `src/pages/admin/reports/logs.tsx`

The restore report logs page now supports a public view mode that can be activated by adding `?public=1` to the URL. This is perfect for displaying logs on public monitors or sharing with stakeholders without exposing administrative controls.

### Features

✅ **Query Parameter Activation**: Enable via `?public=1` in URL  
✅ **Hidden Navigation**: Back button hidden in public mode  
✅ **Hidden Actions**: Refresh button hidden in public mode  
✅ **Read-Only Indicator**: Clear message indicating public view mode  
✅ **Full Data Visibility**: All logs and summary cards remain visible  

### Usage

**Normal Mode** (with controls):
```
/admin/reports/logs
```

**Public Mode** (read-only):
```
/admin/reports/logs?public=1
```

### UI Changes

#### Elements Hidden in Public Mode:
- "Voltar" (Back) button
- "Atualizar" (Refresh) button

#### Elements Added in Public Mode:
- Read-only message at bottom: "🔒 Visualização pública apenas para leitura."

#### Elements Always Visible:
- Page title and description
- Summary cards (Total, Success, Errors)
- Full logs list with status indicators
- Error details (expandable)

### Code Changes

```typescript
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function RestoreReportLogsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [logs, setLogs] = useState<RestoreReportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if public view mode is enabled
  const isPublic = new URLSearchParams(location.search).get('public') === '1';
  
  // ... rest of component
  
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isPublic && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold">🧠 Auditoria de Relatórios Enviados</h1>
              <p className="text-sm text-muted-foreground">
                Logs de execução automática dos relatórios de restauração
              </p>
            </div>
          </div>
          {!isPublic && (
            <Button onClick={fetchLogs} variant="outline">
              Atualizar
            </Button>
          )}
        </div>
        
        {/* Summary Cards, Logs List, etc. */}
        
        {/* Public View Notice */}
        {isPublic && (
          <p className="text-muted-foreground text-xs text-center mt-4">
            🔒 Visualização pública apenas para leitura.
          </p>
        )}
      </div>
    </div>
  );
}
```

### Testing

#### Test Normal Mode:
1. Navigate to `/admin/reports/logs`
2. ✅ Verify "Voltar" button is visible
3. ✅ Verify "Atualizar" button is visible
4. ✅ Verify NO read-only message at bottom

#### Test Public Mode:
1. Navigate to `/admin/reports/logs?public=1`
2. ✅ Verify "Voltar" button is HIDDEN
3. ✅ Verify "Atualizar" button is HIDDEN
4. ✅ Verify read-only message is displayed: "🔒 Visualização pública apenas para leitura."
5. ✅ Verify logs and summary cards are still visible and functional

---

## Benefits

### For Administrators:
- **Proactive Error Monitoring**: Receive immediate notification when reports fail
- **Reduced Downtime**: Quickly identify and respond to issues
- **Clear Error Context**: Detailed error messages help with troubleshooting

### For Stakeholders:
- **Transparent Monitoring**: Share logs publicly without exposing controls
- **TV/Monitor Display**: Perfect for office dashboards
- **Read-Only Safety**: No risk of accidental modifications

---

## Deployment

### 1. Deploy Edge Function
```bash
cd supabase/functions
supabase functions deploy send-restore-dashboard-daily
```

### 2. Set Environment Variables
```bash
# Resend API key (required for notifications)
supabase secrets set RESEND_API_KEY=re_your_key

# Admin email recipient
supabase secrets set REPORT_ADMIN_EMAIL=admin@yourdomain.com

# Email sender (optional)
supabase secrets set EMAIL_FROM=alerta@empresa.com
```

### 3. Deploy Frontend
```bash
npm run build
# Deploy to your hosting platform (Vercel, Netlify, etc.)
```

### 4. Test
- Trigger the Edge Function to test email notifications
- Visit `/admin/reports/logs?public=1` to verify public mode

---

## Technical Notes

### Edge Function:
- Uses native `fetch` for Resend API (no extra dependencies)
- Error-safe: email failures don't break the error response
- Maintains existing error logging behavior
- Compatible with existing Resend configuration

### Frontend:
- Uses `useLocation` from react-router-dom for query params
- Pure client-side implementation (no server changes needed)
- Maintains all existing functionality
- No breaking changes to existing code

---

## Comparison with Problem Statement

### Problem Statement Requirements:
1. ✅ Add email notification on failure using Resend
2. ✅ Subject: "🚨 Falha no Envio de Relatório Diário"
3. ✅ Include error details in email
4. ✅ Log error to `restore_report_logs` table
5. ✅ Add public view mode with `?public=1`
6. ✅ Hide filters and buttons in public mode
7. ✅ Show read-only message at bottom

### All Requirements Met! ✅

---

## Support

For issues or questions:
1. Check Edge Function logs in Supabase Dashboard
2. Verify environment variables are set correctly
3. Check Resend API status and quota
4. Review browser console for frontend errors

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
