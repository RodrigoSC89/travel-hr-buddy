# 🚀 Send Restore Dashboard - Quick Start Guide

## 📌 Overview

This guide shows you how to quickly start using the send-restore-dashboard API endpoint to send restore reports via email.

## 🎯 3 Ways to Use

### 1️⃣ Manual Call (JavaScript/TypeScript)

```typescript
// Send to specific email address
const sendReport = async (recipientEmail: string) => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email: recipientEmail 
      })
    }
  );

  const result = await response.json();
  
  if (result.status === "ok") {
    console.log("✅ Email sent successfully!");
    console.log(`Recipient: ${result.recipient}`);
    console.log(`Data points: ${result.dataCount}`);
  } else {
    console.error("❌ Error:", result.error);
  }
};

// Usage
sendReport("admin@empresa.com");
```

### 2️⃣ With Authentication (User's Email)

```typescript
import { supabase } from "@/lib/supabase";

const sendReportToCurrentUser = async () => {
  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error("User not authenticated");
    return;
  }

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({})  // Email auto-detected from session
    }
  );

  const result = await response.json();
  console.log("Report sent to:", result.recipient);
};
```

### 3️⃣ Scheduled (Cron Job)

```sql
-- Run daily at 7:00 AM
SELECT cron.schedule(
  'daily-restore-dashboard-report',
  '0 7 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-restore-dashboard',
      headers := jsonb_build_object(
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'email', 'admin@empresa.com'
      )
    ) as request_id;
  $$
);

-- Check scheduled jobs
SELECT * FROM cron.job WHERE jobname = 'daily-restore-dashboard-report';

-- Unschedule if needed
SELECT cron.unschedule('daily-restore-dashboard-report');
```

## ⚙️ Configuration

### Step 1: Set Environment Variables

```bash
# Option A: Via Supabase CLI
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EMAIL_FROM=dash@empresa.com

# Option B: Via Supabase Dashboard
# Go to: Project Settings > Edge Functions > Secrets
# Add: RESEND_API_KEY, EMAIL_FROM
```

### Step 2: Deploy Function (if not deployed)

```bash
# Deploy the function
supabase functions deploy send-restore-dashboard

# Verify deployment
supabase functions list
```

### Step 3: Test

```bash
# Test with curl
curl -X POST https://your-project.supabase.co/functions/v1/send-restore-dashboard \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Expected response
# {
#   "status": "ok",
#   "message": "Relatório enviado por e-mail com sucesso!",
#   "recipient": "test@example.com",
#   "dataCount": 15
# }
```

## 📧 What Gets Sent

### Email Subject
```
📊 Relatório Diário de Restaurações
```

### Email Content
- Professional header with gradient
- Summary statistics (total restores, period)
- Detailed table with restore counts by day
- Branded footer

### Attachment
```
relatorio-restauracoes-2025-10-13.csv
```

**CSV Format:**
```csv
"Data","Restaurações"
"13/10/2025","45"
"12/10/2025","38"
"11/10/2025","42"
...
```

## 🎨 React Component Example

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SendRestoreDashboard() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendReport = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/send-restore-dashboard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const result = await response.json();

      if (result.status === "ok") {
        toast.success(`Report sent to ${result.recipient}!`);
        setEmail(""); // Clear input
      } else {
        toast.error(result.error || "Failed to send report");
      }
    } catch (error) {
      toast.error("An error occurred while sending the report");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="admin@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <Button 
          onClick={handleSendReport} 
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Report"}
        </Button>
      </div>
    </div>
  );
}
```

## 🔍 Monitoring & Troubleshooting

### View Logs
```bash
# Real-time logs
supabase functions logs send-restore-dashboard --tail

# Recent logs (last 100)
supabase functions logs send-restore-dashboard --limit 100
```

### Common Issues

#### 1. Email Not Sent
```
Error: RESEND_API_KEY or SENDGRID_API_KEY must be configured
```
**Solution:** Set the API key via `supabase secrets set RESEND_API_KEY=re_...`

#### 2. No Data Returned
```json
{
  "status": "ok",
  "message": "No restore data found",
  "dataCount": 0
}
```
**Solution:** This is normal if there's no restore data in the database.

#### 3. Invalid Email
```json
{
  "error": "Email is required"
}
```
**Solution:** Provide a valid email in the request body or authenticate the user.

### Debug Checklist
- [ ] API keys configured (RESEND_API_KEY or SENDGRID_API_KEY)
- [ ] EMAIL_FROM configured
- [ ] Function deployed
- [ ] Database RPC function exists (`get_restore_count_by_day_with_email`)
- [ ] Network connectivity to Supabase
- [ ] Valid email address provided

## 📊 Response Reference

### Success Response
```json
{
  "status": "ok",
  "message": "Relatório enviado por e-mail com sucesso!",
  "recipient": "admin@empresa.com",
  "dataCount": 15
}
```

### No Data Response
```json
{
  "status": "ok",
  "message": "No restore data found for the specified criteria",
  "recipient": "admin@empresa.com",
  "dataCount": 0
}
```

### Error Response
```json
{
  "error": "RESEND_API_KEY or SENDGRID_API_KEY must be configured"
}
```

## 🎯 Best Practices

1. **Email Validation**
   ```typescript
   const isValidEmail = (email: string) => 
     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
   ```

2. **Rate Limiting**
   - Implement client-side debouncing
   - Limit requests to once per minute per user

3. **Error Handling**
   ```typescript
   try {
     const result = await sendReport(email);
     // Handle success
   } catch (error) {
     // Handle error
     console.error("Failed to send report:", error);
   }
   ```

4. **User Feedback**
   - Show loading state while sending
   - Display success/error messages
   - Provide confirmation before sending

## 🔗 Additional Resources

- **Implementation Guide:** `SEND_RESTORE_DASHBOARD_API_IMPLEMENTATION.md`
- **Quick Reference:** `SEND_RESTORE_DASHBOARD_QUICKREF.md`
- **Visual Summary:** `SEND_RESTORE_DASHBOARD_VISUAL_SUMMARY.md`
- **Complete Guide:** `SEND_RESTORE_DASHBOARD_IMPLEMENTATION_COMPLETE.md`

## 🚀 Ready to Use!

You're all set! The send-restore-dashboard API is:
- ✅ Deployed and ready
- ✅ Documented with examples
- ✅ Tested and verified
- ✅ Production-ready

Just configure your email service API key and start sending reports! 🎉

---

**Questions?** Check the full documentation or contact support.
