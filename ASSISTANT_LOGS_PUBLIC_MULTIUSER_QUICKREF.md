# Assistant Logs API - Quick Reference

## 🔗 Public Link with Token + QR Code

### Generate Public Link
1. Navigate to `/admin/assistant-logs`
2. Scroll to "Link Público com QR Code" section
3. Click "Gerar Link Público"
4. Copy the generated URL or scan QR code

### Access Public View
- URL format: `/admin/reports/logs?public=1&token={token}`
- Token expires in 7 days
- Read-only access

### Code Examples

**Generate Token:**
```typescript
import { generateAuditToken } from "@/utils/auditToken";

const token = generateAuditToken("admin@empresa.com");
const url = `${window.location.origin}/admin/reports/logs?public=1&token=${token}`;
```

**Verify Token:**
```typescript
import { verifyAuditToken } from "@/utils/auditToken";

const email = verifyAuditToken(token);
if (email) {
  // Token is valid
  console.log("Authorized for:", email);
} else {
  // Token is invalid or expired
  console.log("Access denied");
}
```

---

## 📤 Multi-User Scheduled Reports

### Manual Invocation
```bash
curl -X POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "users": ["ana@empresa.com", "joao@empresa.com"]
  }'
```

### Schedule with pg_cron
```sql
-- Daily at 8 AM UTC
SELECT cron.schedule(
  'send-multi-user-restore-reports',
  '0 8 * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object(
        'users', ARRAY['ana@empresa.com', 'joao@empresa.com']
      )
    );
  $$
);
```

### Email Content
Each user receives:
- Total de Restaurações
- Documentos Únicos  
- Média por Dia

---

## 📋 Environment Variables

### Public Link (No additional vars needed)
- Uses existing Supabase auth

### Multi-User Reports
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=re_xxx
EMAIL_FROM=relatorios@nautilus.ai  # Optional
```

---

## 📂 File Locations

### Frontend
- `/src/utils/auditToken.ts` - Token utilities
- `/src/pages/admin/assistant-logs.tsx` - Public link UI
- `/src/pages/admin/reports/logs.tsx` - Public view support

### Backend
- `/supabase/functions/send-multi-user-restore-reports/` - Multi-user reports

### Documentation
- `/ASSISTANT_LOGS_PUBLIC_MULTIUSER_GUIDE.md` - Complete guide
- `/supabase/functions/send-multi-user-restore-reports/README.md` - Function docs

---

## ✅ Testing Checklist

### Public Link Feature
- [ ] Generate public link from assistant-logs page
- [ ] Verify QR code displays correctly
- [ ] Copy URL to clipboard
- [ ] Access logs via public URL
- [ ] Verify public view badge shows
- [ ] Test token expiration (mock date)

### Multi-User Reports
- [ ] Call function with test users
- [ ] Verify emails received
- [ ] Check email formatting
- [ ] Verify statistics are correct
- [ ] Test error handling (invalid email)
- [ ] Check response format

---

## 🐛 Troubleshooting

### Public Link Issues
**Token expired:**
- Generate new token (max 7 days)

**QR code not showing:**
- Check qrcode.react is installed
- Verify import: `import { QRCodeSVG } from "qrcode.react"`

### Multi-User Reports Issues
**Emails not sending:**
- Check `RESEND_API_KEY` is set
- Verify email addresses are valid
- Check Supabase logs for errors

**Empty summaries:**
- Verify `get_restore_summary` function exists
- Check user has restore data
- Test RPC directly: `SELECT * FROM get_restore_summary('user@email.com')`

---

## 📊 Response Examples

### Multi-User Success Response
```json
{
  "success": true,
  "results": [
    {
      "email": "ana@empresa.com",
      "success": true,
      "summary": {
        "total": 150,
        "unique_docs": 45,
        "avg_per_day": 12.5
      }
    }
  ],
  "total_users": 1,
  "successful": 1,
  "failed": 0
}
```

### Multi-User Error Response
```json
{
  "success": false,
  "error": "RESEND_API_KEY is not configured"
}
```

---

## 🔒 Security Notes

1. **Tokens are time-limited** (7 days)
2. **No sensitive data** in public view
3. **Audit trail** via email in token
4. **Consider JWT** for production
5. **IP whitelist** for public access (production)

---

## 📞 Quick Support

**Issue:** Token not working
**Fix:** Check token hasn't expired, regenerate if needed

**Issue:** QR code missing
**Fix:** Run `npm install qrcode.react`

**Issue:** Emails not sending
**Fix:** Verify RESEND_API_KEY environment variable

**Issue:** Wrong statistics
**Fix:** Check get_restore_summary RPC function
