# Admin Alertas API - Implementation Summary

## Overview
This implementation adds a new API endpoint `/api/admin/alertas` for retrieving AI-detected critical alerts from audit comments, along with the necessary database schema.

## Files Created

### 1. API Endpoint
**File:** `pages/api/admin/alertas.ts`
- **Method:** GET only
- **Authentication:** Required (Bearer token)
- **Authorization:** Admin role required
- **Response:** Array of alerts ordered by creation date (descending)

**Fields returned:**
```typescript
{
  id: UUID
  auditoria_id: UUID
  comentario_id: UUID
  descricao: string
  criado_em: timestamp
}
```

### 2. Database Migration
**File:** `supabase/migrations/20251016192544_create_auditoria_alertas.sql`

**Table Schema:**
```sql
CREATE TABLE public.auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES public.auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Security:**
- Row Level Security (RLS) enabled
- Admin-only access policies for SELECT, INSERT, UPDATE, DELETE
- Role verification via `profiles.role = 'admin'`

**Indexes:**
- `idx_auditoria_alertas_auditoria_id` - For filtering by audit
- `idx_auditoria_alertas_criado_em` - For ordering by creation date
- `idx_auditoria_alertas_comentario_id` - For filtering by comment

### 3. Test Suite
**File:** `src/tests/admin-alertas-api.test.ts`
- 49 comprehensive tests covering:
  - Request handling (GET method, 405 for other methods)
  - Authentication (token validation, 401 errors)
  - Authorization (admin role check, 403 errors)
  - Database queries (table, fields, ordering)
  - Response format (data structure, status codes)
  - Error handling (various error scenarios)
  - Security (auth/authz checks)
  - Integration (Supabase, Next.js)

## API Usage

### Request
```bash
GET /api/admin/alertas
Authorization: Bearer <token>
```

### Response (Success - 200)
```json
[
  {
    "id": "uuid-1",
    "auditoria_id": "audit-uuid-1",
    "comentario_id": "comment-uuid-1",
    "descricao": "Falha crítica detectada pela IA",
    "criado_em": "2025-10-16T12:00:00Z"
  }
]
```

### Error Responses
- **401 Unauthorized:** `{ "error": "Não autenticado." }`
- **403 Forbidden:** `{ "error": "Acesso negado." }`
- **405 Method Not Allowed:** `{ "error": "Método não permitido." }`
- **500 Internal Server Error:** `{ "error": "Erro ao buscar alertas." }`

## Authentication & Authorization Flow

1. **Extract Token:** Bearer token from Authorization header
2. **Verify User:** Call `supabase.auth.getUser(token)`
3. **Check Role:** Query `profiles` table for user's role
4. **Validate Admin:** Ensure `role === 'admin'`
5. **Query Data:** Fetch from `auditoria_alertas` table
6. **Return Results:** JSON array ordered by `criado_em DESC`

## Integration with Admin Dashboard

The API endpoint is designed to work with the `/admin/alerts` page mentioned in the codebase. The page can:
- Display critical failures detected by AI
- Auto-update based on comments
- Restrict access to administrators only

## Code Quality

✅ **Lint:** No errors (verified with eslint)
✅ **Build:** Successful (verified with vite build)
✅ **Tests:** 49/49 passing (verified with vitest)
✅ **TypeScript:** Properly typed with Next.js types
✅ **Security:** RLS policies and role-based access control

## Dependencies

- `next` - Next.js framework
- `@supabase/supabase-js` - Supabase client
- Existing database tables: `profiles`, `auditorias_imca`

## Environment Variables Required

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

## Notes

- The implementation follows the existing API pattern in the repository
- Uses service role key for admin operations (not the auth-helpers package from problem statement)
- Portuguese error messages for consistency with rest of codebase
- Comprehensive RLS policies ensure security at database level
- Foreign key relationship to `auditorias_imca` table with CASCADE delete
