# Sistema de Alertas Críticos - Guia Rápido

## 🎯 O que é?
Sistema automático que detecta e registra alertas críticos quando a IA identifica falhas em auditorias IMCA.

## ⚡ Como Funciona

### 1. IA Cria Comentário
```javascript
await supabase.from('auditoria_comentarios').insert({
  auditoria_id: 'uuid-auditoria',
  user_id: 'ia-auto-responder',
  comentario: '⚠️ Atenção: Falha crítica detectada'
});
```

### 2. Alerta É Criado Automaticamente
A trigger detecta o padrão `⚠️ Atenção:` e cria o alerta.

## 📋 Tabelas

### `auditoria_comentarios`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| auditoria_id | UUID | FK para auditorias_imca |
| user_id | TEXT | ID do usuário ou 'ia-auto-responder' |
| comentario | TEXT | Texto do comentário |
| created_at | TIMESTAMP | Data/hora de criação |

### `auditoria_alertas`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| auditoria_id | UUID | FK para auditorias_imca |
| comentario_id | UUID | FK para auditoria_comentarios |
| tipo | TEXT | Tipo de alerta (padrão: 'Falha Crítica') |
| descricao | TEXT | Descrição completa |
| criado_em | TIMESTAMP | Data/hora de criação |

## 🔐 Permissões

### Comentários
- **Usuários**: Ver/inserir/editar comentários em suas auditorias
- **Admins**: Ver/inserir comentários em todas as auditorias
- **Sistema (IA)**: Inserir comentários com user_id = 'ia-auto-responder'

### Alertas
- **Usuários**: Ver alertas em suas auditorias
- **Admins**: Ver todos os alertas
- **Sistema**: Inserir alertas automaticamente

## 📊 Consultas Úteis

### Ver Alertas de uma Auditoria
```sql
SELECT * FROM auditoria_alertas 
WHERE auditoria_id = '[UUID]'
ORDER BY criado_em DESC;
```

### Dashboard Admin - Últimos Alertas
```sql
SELECT 
  aa.tipo,
  aa.descricao,
  aa.criado_em,
  ai.title,
  p.email
FROM auditoria_alertas aa
JOIN auditorias_imca ai ON aa.auditoria_id = ai.id
JOIN profiles p ON ai.user_id = p.id
ORDER BY aa.criado_em DESC
LIMIT 50;
```

### Total de Alertas Hoje
```sql
SELECT COUNT(*) FROM auditoria_alertas
WHERE DATE(criado_em) = CURRENT_DATE;
```

## ⚠️ Padrão de Detecção

Para criar alerta automático, o comentário deve:
1. Ter `user_id = 'ia-auto-responder'`
2. Começar com `⚠️ Atenção:`

**Exemplos**:
- ✅ `⚠️ Atenção: Sistema crítico falhando`
- ✅ `⚠️ Atenção: Certificação vencida`
- ❌ `Sistema OK` (não gera alerta)
- ❌ `Atenção: problema` (falta emoji, não gera alerta)

## 🧪 Testar

```bash
npm test -- auditoria-alertas.test.ts
```

## 📁 Arquivos

- **Migração SQL**: `supabase/migrations/20251016162500_create_auditoria_alertas.sql`
- **Testes**: `src/tests/auditoria-alertas.test.ts`
- **Documentação**: `AUDITORIA_ALERTAS_README.md`

## 🚀 Status

✅ **Implementado e Testado**  
✅ **64 testes passando**  
✅ **RLS configurado**  
✅ **Trigger automática funcionando**

---

📅 **Criado**: 16/10/2025  
🔖 **Versão**: 1.0.0
