# Assistant Logs API - Public Link & Multi-User Reports

## 📋 Overview

This implementation adds two key features to the Assistant Logs API:

1. **🔗 Public Link with Token + QR Code** - Generate secure, time-limited public access links with QR codes
2. **📤 Scheduled Automated Reports by User** - Send personalized restore summary reports to multiple users

---

## 🔗 Feature 1: Public Link with Token + QR Code

### Purpose
Enable sharing of the assistant logs audit page with external viewers (monitors, TVs, auditors) via a secure, time-limited token.

### How It Works

#### 1. Token Generation
```typescript
export function generateAuditToken(email: string): string {
  const base64 = btoa(`${email}:${new Date().toISOString()}`);
  return base64;
}
```

The token contains:
- User's email (for tracking)
- Timestamp (for expiration validation)
- Base64 encoded for URL safety

#### 2. Token Verification
```typescript
export function verifyAuditToken(token: string): string | null {
  // Decodes token and checks if expired (7 days)
}
```

#### 3. Usage Flow

**Admin Page** (`/admin/assistant-logs`):
1. Click "Gerar Link Público" button
2. System generates token with current user's email
3. Creates URL: `/admin/reports/logs?public=1&token={token}`
4. Displays QR code for easy mobile/TV access
5. Copy link to clipboard

**Public Access Page** (`/admin/reports/logs`):
1. Detects `public=1` and `token` query parameters
2. Verifies token validity (not expired)
3. Shows public view badge with authorized email
4. Allows viewing logs without authentication

### Security Features
- ✅ Time-limited tokens (7 days expiration)
- ✅ Embedded user email for audit trail
- ✅ Read-only access
- ✅ No sensitive data exposure

### UI Components

**Public Link Generator**:
```jsx
<Card className="border-2 border-blue-200 bg-blue-50/50">
  <CardHeader>
    <CardTitle>🔗 Link Público com QR Code</CardTitle>
  </CardHeader>
  <CardContent>
    <Button onClick={handleGeneratePublicLink}>
      <QrCode className="w-4 h-4 mr-2" />
      Gerar Link Público
    </Button>
    {publicUrl && (
      <div>
        <Input value={publicUrl} readOnly />
        <QRCodeSVG value={publicUrl} size={200} level="H" />
      </div>
    )}
  </CardContent>
</Card>
```

**Public View Badge**:
```jsx
{isPublicView && (
  <Alert className="border-blue-200 bg-blue-50">
    <Eye className="h-4 w-4 text-blue-600" />
    <AlertDescription>
      Modo de Visualização Pública • Acesso autorizado para {authorizedEmail}
    </AlertDescription>
  </Alert>
)}
```

### Example URL
```
https://app.example.com/admin/reports/logs?public=1&token=YWRtaW5AZW1wcmVzYS5jb206MjAyNS0xMC0xM1QxOTozNjo1MC4xMzFa
```

---

## 📤 Feature 2: Scheduled Automated Reports by User

### Purpose
Automatically send personalized restore summary reports to multiple users on a schedule.

### How It Works

#### 1. Supabase RPC Function (Already Exists)
```sql
CREATE FUNCTION get_restore_summary(email_input text)
RETURNS TABLE(total int, unique_docs int, avg_per_day numeric)
```

This function:
- Filters restore logs by user email
- Calculates total restorations
- Counts unique documents
- Computes average per day

#### 2. Multi-User Edge Function

**Location**: `/supabase/functions/send-multi-user-restore-reports/index.ts`

**Process**:
1. Receives list of user emails
2. For each user:
   - Calls `get_restore_summary(email)`
   - Generates personalized HTML email
   - Sends via Resend API
3. Returns results for all users

**Request Body**:
```json
{
  "users": ["ana@empresa.com", "joao@empresa.com", "maria@empresa.com"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Multi-user reports processed",
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
  "total_users": 3,
  "successful": 3,
  "failed": 0
}
```

#### 3. Email Template

The function sends a beautiful HTML email with:

```html
<div class="header">
  <h1>📊 Relatório de Restaurações Individual</h1>
  <p>Nautilus One - Travel HR Buddy</p>
</div>

<div class="summary-box">
  <h2>Olá, {email}!</h2>
  
  <div class="stat">
    <div class="stat-value">150</div>
    <div class="stat-label">Total de Restaurações</div>
  </div>
  
  <div class="stat">
    <div class="stat-value">45</div>
    <div class="stat-label">Documentos Únicos</div>
  </div>
  
  <div class="stat">
    <div class="stat-value">12.5</div>
    <div class="stat-label">Média por Dia</div>
  </div>
</div>
```

### Scheduling with pg_cron

To run daily at 8 AM UTC:

```sql
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

### Manual Testing

```bash
curl -X POST \
  'https://YOUR_SUPABASE_URL/functions/v1/send-multi-user-restore-reports' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "users": ["ana@empresa.com", "joao@empresa.com"]
  }'
```

---

## 🔧 Configuration

### Environment Variables

For **Public Link**:
- No additional variables needed (uses existing Supabase auth)

For **Multi-User Reports**:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key
- `RESEND_API_KEY` - Resend API key for emails
- `EMAIL_FROM` - Sender email (default: relatorios@nautilus.ai)

### Dependencies Added

```json
{
  "dependencies": {
    "qrcode.react": "^3.1.0"
  }
}
```

---

## 📂 Files Modified/Created

### New Files
- ✅ `/src/utils/auditToken.ts` - Token generation/verification utilities
- ✅ `/supabase/functions/send-multi-user-restore-reports/index.ts` - Multi-user report function
- ✅ `/supabase/functions/send-multi-user-restore-reports/README.md` - Function documentation

### Modified Files
- ✅ `/src/pages/admin/assistant-logs.tsx` - Added public link generator UI
- ✅ `/src/pages/admin/reports/logs.tsx` - Added public access support
- ✅ `package.json` - Added qrcode.react dependency

---

## ✅ Implementation Checklist

### Public Link Feature
- [x] Token generation utility (`generateAuditToken`)
- [x] Token verification utility (`verifyAuditToken`)
- [x] QR Code component integration (`QRCodeSVG`)
- [x] Public link generator UI on assistant-logs page
- [x] Public view detection on logs page
- [x] Public view badge/indicator
- [x] Copy to clipboard functionality
- [x] Token expiration (7 days)

### Multi-User Reports Feature
- [x] Multi-user edge function created
- [x] Loop through user emails
- [x] Call `get_restore_summary` RPC per user
- [x] Generate personalized HTML emails
- [x] Send via Resend API
- [x] Error handling per user
- [x] Response with success/failure summary
- [x] Documentation and examples

---

## 🎯 Use Cases

### Public Link with QR Code
1. **TV Dashboard Display** - Display logs on office TVs without authentication
2. **Mobile Access** - Scan QR code for quick mobile access
3. **Auditor Access** - Share time-limited access with external auditors
4. **Monitor Stations** - Display on monitoring dashboards

### Multi-User Scheduled Reports
1. **Daily Summaries** - Automated daily restore summaries per user
2. **Team Reports** - Send to entire team automatically
3. **Individual Tracking** - Each user gets their own statistics
4. **Performance Monitoring** - Track individual restore patterns

---

## 🔒 Security Considerations

1. **Token Security**
   - Time-limited (7 days expiration)
   - Not suitable for production without JWT
   - Consider implementing proper JWT in production
   - Tokens should be one-time use in production

2. **Public Access**
   - Read-only access (no mutations)
   - No sensitive data exposed
   - Audit trail via embedded email
   - Consider IP whitelisting for production

3. **Email Security**
   - Uses Resend API with TLS
   - No credentials in email content
   - Individual emails (no BCC leaks)

---

## 🚀 Future Enhancements

1. **Enhanced Token Security**
   - Implement JWT instead of base64
   - Add refresh token mechanism
   - Implement one-time use tokens
   - Add IP whitelisting

2. **Extended Features**
   - Custom expiration times
   - Revokable tokens
   - Token usage analytics
   - Multiple QR code formats

3. **Report Enhancements**
   - PDF attachment option
   - Chart/graph in email
   - Custom date ranges
   - Comparison with previous period

---

## 📞 Support

For issues or questions:
1. Check the README files in each function directory
2. Review the implementation code
3. Test with provided curl examples
4. Check Supabase logs for errors
