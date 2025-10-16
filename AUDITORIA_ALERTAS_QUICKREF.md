# Auditoria Alertas - Quick Reference

## 🔔 Critical Alerts System

### Tables Created
1. **auditoria_comentarios** - Comments on audits
2. **auditoria_alertas** - AI-detected critical alerts

### Key Features
- ✅ RLS security enabled
- ✅ Admin-only alert viewing
- ✅ Automatic system insertion
- ✅ Cascade deletion
- ✅ Performance indexes

## 📊 Alert Types

| Type | Description | Use Case |
|------|-------------|----------|
| **Falha Crítica** | Critical failure | Immediate attention required |
| **Alerta** | Alert | Important issue to review |
| **Aviso** | Warning | Potential problem |
| **Informação** | Information | FYI message |

## 🔐 Security Policies

### auditoria_comentarios
- Users: Own audit comments only
- Admins: All comments

### auditoria_alertas  
- Users: No access
- Admins: Full access (SELECT, UPDATE, DELETE)
- System: Can INSERT automatically

## 🗃️ Database Schema

```sql
-- Comments Table
auditoria_comentarios (
  id UUID,
  auditoria_id UUID → auditorias_imca.id,
  user_id UUID → auth.users.id,
  comentario TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Alerts Table
auditoria_alertas (
  id UUID,
  auditoria_id UUID → auditorias_imca.id,
  comentario_id UUID → auditoria_comentarios.id (optional),
  tipo TEXT CHECK(...),
  descricao TEXT,
  criado_em TIMESTAMPTZ
)
```

## 📂 Files Created

```
supabase/migrations/
  ├── 20251016162400_create_auditoria_comentarios.sql
  └── 20251016162500_create_auditoria_alertas.sql

src/tests/
  └── auditoria-alertas.test.ts (59 tests)

documentation/
  └── AUDITORIA_ALERTAS_IMPLEMENTATION.md
```

## ✅ Testing

```bash
# Run specific tests
npm test -- src/tests/auditoria-alertas.test.ts

# Run all tests
npm test
```

**Results:**
- ✅ 59 new tests passing
- ✅ 1103 total tests passing
- ✅ No lint errors

## 🔍 Query Examples

### Get all critical alerts
```sql
SELECT * FROM auditoria_alertas 
WHERE tipo = 'Falha Crítica'
ORDER BY criado_em DESC;
```

### Get alerts for specific audit
```sql
SELECT a.*, c.comentario
FROM auditoria_alertas a
LEFT JOIN auditoria_comentarios c ON a.comentario_id = c.id
WHERE a.auditoria_id = 'YOUR-UUID'
ORDER BY a.criado_em DESC;
```

### Get alerts with audit details
```sql
SELECT 
  a.id,
  a.tipo,
  a.descricao,
  a.criado_em,
  ai.title as audit_title,
  ai.status as audit_status
FROM auditoria_alertas a
JOIN auditorias_imca ai ON a.auditoria_id = ai.id
ORDER BY a.criado_em DESC;
```

## 🚀 AI Integration (Future)

```typescript
// Example: Auto-detect critical patterns
async function analyzeComment(comment: string, auditId: string) {
  const isCritical = await detectCriticalPattern(comment);
  
  if (isCritical) {
    await supabase
      .from('auditoria_alertas')
      .insert({
        auditoria_id: auditId,
        comentario_id: commentId,
        tipo: 'Falha Crítica',
        descricao: 'AI detected critical pattern in comment'
      });
  }
}
```

## 📊 Indexes for Performance

**auditoria_comentarios:**
- auditoria_id ⚡
- user_id ⚡  
- created_at DESC ⚡

**auditoria_alertas:**
- auditoria_id ⚡
- comentario_id ⚡
- tipo ⚡
- criado_em DESC ⚡

## 🎯 Requirements Checklist

- [x] Table `auditoria_alertas` created
- [x] Foreign keys to `auditorias_imca` and `auditoria_comentarios`
- [x] RLS enabled with admin-only policies
- [x] System can auto-insert alerts
- [x] Proper indexes for performance
- [x] Cascade delete configured
- [x] Comprehensive tests (59 passing)
- [x] Documentation created

## 💡 Tips

1. **Admins only**: Remember alerts are visible only to admins
2. **Optional comment**: `comentario_id` can be NULL
3. **System insert**: No user check needed for INSERT (allows automation)
4. **Cascade**: Deleting audit removes all comments and alerts
5. **Types**: Always use one of the 4 defined alert types

## 🔗 Related Tables

```
auditorias_imca (main audit)
    ├── auditoria_comentarios (comments)
    └── auditoria_alertas (alerts)
            └── opcional: link to comentario
```
