# 🔐 Security Documentation

## Overview

Nautilus One implements a comprehensive security model using Supabase's Row-Level Security (RLS), authentication mechanisms, and API protection strategies to ensure data isolation, access control, and compliance with maritime industry standards.

## 🔒 Authentication & Authorization

### Authentication Provider
- **Supabase Auth** - JWT-based authentication
- **Session Management** - Automatic token refresh
- **Multi-factor Authentication** - Available for admin users

### Authentication Flow

#### Sign In Process
```typescript
// src/contexts/AuthContext.tsx
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return { error };
  }
  
  // Session is automatically set via onAuthStateChange listener
  return { error: null };
};
```

#### Session Validation
```typescript
// Automatic session validation on app load
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (event === 'TOKEN_REFRESHED') {
        // Token automatically refreshed
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, []);
```

### User Roles
Defined in `profiles` table:

| Role | Permissions | Description |
|------|-------------|-------------|
| `admin` | Full system access | System administrators |
| `manager` | Department management | Department managers and supervisors |
| `user` | Basic access | Standard users and crew members |
| `readonly` | Read-only access | Auditors and external viewers |

## 🛡️ Row-Level Security (RLS)

### RLS Strategy
All sensitive tables have RLS enabled with policies that enforce:
- **User Isolation** - Users can only access their own data
- **Tenant Isolation** - Multi-tenant data segregation via `tenant_id`
- **Role-Based Access** - Permissions based on user role
- **Created By** - Users access only records they created

### Key Tables with RLS

#### Documents Table
```sql
-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can view active documents
CREATE POLICY "Users can view active documents" 
ON public.documents FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND deleted_at IS NULL
);

-- Users can create their own documents
CREATE POLICY "Users can create their own documents"
ON public.documents FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
ON public.documents FOR UPDATE
USING (auth.uid() = created_by);
```

#### Checklists Table
```sql
-- Enable RLS
ALTER TABLE public.operational_checklists ENABLE ROW LEVEL SECURITY;

-- Tenant-based isolation
CREATE POLICY "Users can view checklists in their tenant"
ON public.operational_checklists FOR SELECT
USING (
  tenant_id = current_setting('app.current_tenant')::uuid
);
```

#### Logs Tables (Admin Only)
```sql
-- Enable RLS on assistant logs
ALTER TABLE public.assistant_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read all logs
CREATE POLICY "Admins can view all logs"
ON public.assistant_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

#### Vessels, Crew, and Evidence
```sql
-- Vessel-based segmentation
CREATE POLICY "Users can view vessels in their organization"
ON public.vessels FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Crew access to their own data
CREATE POLICY "Crew can view their own records"
ON public.crew_members FOR SELECT
USING (
  user_id = auth.uid()
  OR
  vessel_id IN (
    SELECT id FROM public.vessels
    WHERE organization_id IN (
      SELECT organization_id FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  )
);
```

#### Quiz Results (Individual Privacy)
```sql
-- Only the crew member can see their quiz results
CREATE POLICY "Crew can view own quiz results"
ON public.crew_performance_reviews FOR SELECT
USING (
  crew_member_id IN (
    SELECT id FROM public.crew_members
    WHERE user_id = auth.uid()
  )
);
```

### Complete RLS Coverage

The following tables have RLS enabled (150+ tables):

**Core Tables**
- `profiles` - User profiles and roles
- `documents`, `document_versions`, `document_restore_logs` - Document management
- `operational_checklists`, `checklist_items`, `checklist_evidence` - Checklists
- `vessels`, `crew_members`, `crew_assignments` - Maritime operations

**Audit & Compliance**
- `assistant_logs`, `assistant_report_logs` - AI assistant audit trail
- `audit_logs`, `error_logs` - System audit logs
- `auditorias_imca`, `auditoria_comentarios`, `auditoria_alertas` - IMCA audits
- `sgso_audits`, `peotram_audits` - Safety audits

**AI & Analytics**
- `ai_insights`, `ai_reports`, `ai_suggestions` - AI-generated content
- `ai_document_templates`, `ai_generated_documents` - AI templates
- `job_embeddings` - Vector embeddings for similarity search

**Communication & Collaboration**
- `conversations`, `messages`, `conversation_participants` - Messaging
- `communication_channels`, `channel_members` - Team channels
- `colab_comments`, `colab_replies` - Collaboration comments
- `document_comments` - Document comments

**Operations & Maintenance**
- `mmi_jobs`, `mmi_os`, `mmi_components` - Maintenance management
- `dp_incidents` - DP incident tracking
- `emergency_alerts`, `operational_alerts` - Alert systems

**Travel & Logistics**
- `reservations`, `expenses` - Travel management
- `price_alerts`, `flight_price_history`, `hotel_price_history` - Price tracking

See `supabase/migrations/` for complete RLS policy definitions.

## 🔐 API Protection

### API Route Authentication

All API routes in `pages/api/` are protected using Supabase authentication:

```typescript
// Example: pages/api/admin/alertas.ts
import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  // 2. Validate token and get user
  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Não autenticado." });
  }

  // 3. Check user role (if required)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return res.status(403).json({ error: "Acesso negado." });
  }

  // 4. Process request
  // ...
}
```

### Protected API Routes

All API routes follow this authentication pattern:

**Admin Routes** (Role: `admin` required)
- `/api/admin/alertas` - Alert management
- `/api/admin/metrics` - System metrics
- `/api/admin/sgso` - SGSO management

**Audit Routes** (Authenticated users)
- `/api/auditoria/resumo` - Audit summary
- `/api/auditoria/tendencia` - Audit trends
- `/api/auditoria/[id]/comentarios` - Audit comments

**BI Routes** (Authenticated users)
- `/api/bi/conformidade` - Compliance metrics
- `/api/bi/export` - Export reports
- `/api/bi/jobs-trend` - Jobs trend analysis

**Cron Routes** (Service-level authentication)
- `/api/cron/send-real-forecast` - Automated forecast reports

### Client-Side Authentication

```typescript
// Include authorization header in all API calls
const token = session?.access_token;

const response = await fetch('/api/admin/alertas', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## 🔑 Token Management

### Access Tokens
- **JWT Format** - Standard JSON Web Tokens
- **Expiration** - 1 hour (configurable)
- **Automatic Refresh** - Via Supabase client
- **Storage** - Secure HTTP-only cookies (production)

### Service Role Keys
```bash
# Never expose service role keys in client code!
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Usage:**
- Server-side API routes only
- Bypass RLS when necessary
- Admin operations
- Cron jobs and background tasks

### API Keys
```bash
# Embed access token for protected routes
VITE_EMBED_ACCESS_TOKEN=your_secure_token
```

Used for:
- Public embeds with authentication
- TV wall displays
- Dashboard embeds

## 🛡️ Security Headers

Configured in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

## 🔒 Data Protection

### Encryption
- **In Transit** - TLS 1.3 for all connections
- **At Rest** - AES-256 encryption via Supabase
- **Passwords** - Bcrypt hashing (handled by Supabase)

### Sensitive Data Handling
- **API Keys** - Stored in environment variables, never in code
- **PII** - Personal data protected by RLS
- **Audit Logs** - All sensitive operations logged

### Data Retention
- **Soft Deletes** - Records marked with `deleted_at` timestamp
- **Restore Logs** - Document restore operations tracked
- **Audit Trail** - Comprehensive logging for compliance

## 🚨 Security Best Practices

### For Developers

1. **Never commit secrets**
   ```bash
   # Use .env files (ignored by git)
   # Never hardcode API keys
   ```

2. **Always validate input**
   ```typescript
   // Use Zod or similar for validation
   import { z } from 'zod';
   
   const schema = z.object({
     email: z.string().email(),
     password: z.string().min(8),
   });
   ```

3. **Use prepared statements**
   ```typescript
   // Supabase queries are safe from SQL injection
   const { data } = await supabase
     .from('users')
     .select('*')
     .eq('email', userEmail); // Automatically parameterized
   ```

4. **Implement rate limiting**
   - Use Vercel rate limiting for API routes
   - Implement client-side request debouncing

5. **Log security events**
   ```typescript
   // Log authentication attempts, access denied, etc.
   await supabase.from('audit_logs').insert({
     event_type: 'auth_failed',
     user_id: null,
     metadata: { email, ip_address },
   });
   ```

### For Administrators

1. **Regular security audits**
   - Review RLS policies quarterly
   - Audit user permissions
   - Check for unused API keys

2. **Monitor logs**
   - Check Supabase logs daily
   - Review Sentry errors
   - Monitor authentication failures

3. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

4. **Backup strategies**
   - Daily Supabase database backups
   - Point-in-time recovery enabled
   - Test restore procedures quarterly

## 🔐 Compliance

### Standards
- **ISO 27001** - Information security management
- **GDPR** - Data protection and privacy
- **Maritime Regulations** - Industry-specific compliance

### Audit Trail
- All user actions logged in `audit_logs`
- Document changes tracked in `document_versions`
- Authentication events in Supabase Auth logs

### Data Privacy
- Users can request data export
- Users can request data deletion
- Data processing agreements in place

## 📞 Security Contacts

### Report Security Issues
- **Email**: security@nautilus.ai (if applicable)
- **GitHub**: Private security advisories
- **Response Time**: 24-48 hours

### Emergency Contacts
- **On-call Team**: Available 24/7
- **Escalation**: Direct to CTO for critical issues

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Vercel Security Documentation](https://vercel.com/docs/security)
