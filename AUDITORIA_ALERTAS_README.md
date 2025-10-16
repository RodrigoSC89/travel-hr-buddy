# Sistema de Alertas Críticos para Auditorias IMCA

## 📋 Visão Geral

Sistema automatizado de detecção e registro de alertas críticos em auditorias IMCA, utilizando Inteligência Artificial para monitorar comentários e identificar falhas que requerem atenção imediata.

## 🎯 Funcionalidades

### 1. Comentários em Auditorias (`auditoria_comentarios`)
- Permite que usuários e IA adicionem comentários às auditorias
- Suporte especial para respostas automáticas da IA (user_id = 'ia-auto-responder')
- Rastreamento completo com timestamps
- Segurança: Row Level Security (RLS) garante que usuários só vejam comentários das auditorias que têm acesso

### 2. Alertas Automáticos (`auditoria_alertas`)
- Criação automática de alertas quando a IA detecta falhas críticas
- Vinculação direta entre alerta, comentário e auditoria
- Tipo padrão: "Falha Crítica"
- Descrição completa do problema detectado

### 3. Detecção Inteligente
O sistema monitora automaticamente todos os comentários criados pela IA e cria alertas quando detecta o padrão:

```
⚠️ Atenção: [descrição da falha crítica]
```

## 🔧 Estrutura Técnica

### Tabela: `auditoria_comentarios`
```sql
CREATE TABLE auditoria_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES auditorias_imca(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  comentario TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Tabela: `auditoria_alertas`
```sql
CREATE TABLE auditoria_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditoria_id UUID REFERENCES auditorias_imca(id) ON DELETE CASCADE,
  comentario_id UUID REFERENCES auditoria_comentarios(id) ON DELETE CASCADE,
  tipo TEXT DEFAULT 'Falha Crítica',
  descricao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Trigger Automática
```sql
CREATE TRIGGER trigger_alerta_ia
  AFTER INSERT ON auditoria_comentarios
  FOR EACH ROW
  EXECUTE FUNCTION inserir_alerta_critico();
```

## 🔐 Segurança (Row Level Security)

### Políticas de Acesso - Comentários:
1. **Visualização**: Usuários podem ver comentários em auditorias que têm acesso
2. **Inserção**: 
   - Usuários podem inserir comentários em suas próprias auditorias
   - Admins podem inserir comentários em qualquer auditoria
   - Sistema pode inserir comentários da IA
3. **Atualização/Exclusão**: Usuários podem modificar apenas seus próprios comentários

### Políticas de Acesso - Alertas:
1. **Visualização**:
   - Admins podem ver todos os alertas
   - Usuários podem ver alertas em suas próprias auditorias
2. **Inserção**: Sistema pode inserir alertas automaticamente (via trigger)

## 🚀 Como Usar

### Para Usuários

1. **Visualizar Alertas de suas Auditorias**:
```sql
SELECT 
  a.tipo,
  a.descricao,
  a.criado_em,
  ai.title as auditoria_titulo
FROM auditoria_alertas a
JOIN auditorias_imca ai ON a.auditoria_id = ai.id
WHERE ai.user_id = auth.uid()
ORDER BY a.criado_em DESC;
```

2. **Ver Comentários com Alertas**:
```sql
SELECT 
  c.comentario,
  c.user_id,
  c.created_at,
  a.tipo as alerta_tipo
FROM auditoria_comentarios c
LEFT JOIN auditoria_alertas a ON c.id = a.comentario_id
WHERE c.auditoria_id = '[ID_DA_AUDITORIA]'
ORDER BY c.created_at DESC;
```

### Para Admins

**Dashboard de Alertas Críticos**:
```sql
SELECT 
  a.tipo,
  a.descricao,
  a.criado_em,
  ai.title as auditoria,
  p.email as usuario
FROM auditoria_alertas a
JOIN auditorias_imca ai ON a.auditoria_id = ai.id
JOIN profiles p ON ai.user_id = p.id
WHERE a.criado_em >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.criado_em DESC;
```

### Para Integrações de IA

**Criar Comentário com Alerta Automático**:
```javascript
// Exemplo usando Supabase Client
const { data, error } = await supabase
  .from('auditoria_comentarios')
  .insert({
    auditoria_id: 'uuid-da-auditoria',
    user_id: 'ia-auto-responder',
    comentario: '⚠️ Atenção: Falha crítica detectada no sistema de emergência. Intervenção imediata requerida.'
  });

// O alerta será criado automaticamente pela trigger!
```

## 📊 Métricas e Monitoramento

### Consultas Úteis

**Total de Alertas por Período**:
```sql
SELECT 
  DATE(criado_em) as data,
  COUNT(*) as total_alertas
FROM auditoria_alertas
WHERE criado_em >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(criado_em)
ORDER BY data DESC;
```

**Auditorias com Mais Alertas**:
```sql
SELECT 
  ai.id,
  ai.title,
  COUNT(aa.id) as total_alertas
FROM auditorias_imca ai
LEFT JOIN auditoria_alertas aa ON ai.id = aa.auditoria_id
GROUP BY ai.id, ai.title
HAVING COUNT(aa.id) > 0
ORDER BY total_alertas DESC;
```

**Taxa de Detecção de Falhas pela IA**:
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN user_id = 'ia-auto-responder' THEN id END) as comentarios_ia,
  COUNT(DISTINCT aa.id) as alertas_gerados,
  ROUND(
    100.0 * COUNT(DISTINCT aa.id) / 
    NULLIF(COUNT(DISTINCT CASE WHEN user_id = 'ia-auto-responder' THEN ac.id END), 0),
    2
  ) as taxa_alerta_percent
FROM auditoria_comentarios ac
LEFT JOIN auditoria_alertas aa ON ac.id = aa.comentario_id
WHERE ac.created_at >= CURRENT_DATE - INTERVAL '30 days';
```

## 🧪 Testes

O sistema inclui 64 testes automatizados cobrindo:
- ✅ Estrutura das tabelas
- ✅ Políticas RLS (Row Level Security)
- ✅ Lógica da trigger
- ✅ Detecção de padrões
- ✅ Cenários de integração
- ✅ Performance e índices
- ✅ Segurança e controle de acesso

Para executar os testes:
```bash
npm test -- auditoria-alertas.test.ts
```

## 🎨 Padrão de Mensagens da IA

Para que um comentário da IA gere um alerta automático, ele deve seguir o padrão:

```
⚠️ Atenção: [Descrição detalhada da falha crítica]
```

**Exemplos**:
- ✅ `⚠️ Atenção: Sistema de emergência apresentando falhas críticas`
- ✅ `⚠️ Atenção: Certificação STCW vencida há 30 dias`
- ✅ `⚠️ Atenção: Equipamento de segurança fora dos padrões regulatórios`
- ❌ `Sistema funcionando normalmente`
- ❌ `Verificação concluída com sucesso`

## 📈 Performance

### Índices Criados
O sistema inclui índices otimizados para garantir performance:

**Tabela auditoria_comentarios**:
- `idx_auditoria_comentarios_auditoria_id`
- `idx_auditoria_comentarios_user_id`
- `idx_auditoria_comentarios_created_at`

**Tabela auditoria_alertas**:
- `idx_auditoria_alertas_auditoria_id`
- `idx_auditoria_alertas_comentario_id`
- `idx_auditoria_alertas_criado_em`
- `idx_auditoria_alertas_tipo`

## 🔄 Fluxo Completo

```
1. IA analisa auditoria
   ↓
2. IA detecta falha crítica
   ↓
3. IA cria comentário com padrão ⚠️ Atenção:
   ↓
4. Trigger detecta padrão no comentário
   ↓
5. Função inserir_alerta_critico() é executada
   ↓
6. Alerta é criado automaticamente
   ↓
7. Admin/Usuário é notificado
   ↓
8. Ação corretiva é tomada
```

## 📝 Notas de Implementação

- **Linguagem**: PL/pgSQL
- **Banco de Dados**: PostgreSQL (Supabase)
- **Segurança**: SECURITY DEFINER na função da trigger
- **Integridade**: Foreign keys com CASCADE delete
- **Documentação**: Comentários SQL em todas as tabelas e colunas

## 🚨 Importante

- Apenas comentários com `user_id = 'ia-auto-responder'` podem gerar alertas automáticos
- O padrão `⚠️ Atenção:` é case-sensitive
- Alertas são criados APÓS a inserção do comentário (AFTER INSERT)
- A exclusão de uma auditoria remove automaticamente comentários e alertas relacionados (CASCADE)

## 📚 Referências

- Migração SQL: `supabase/migrations/20251016162500_create_auditoria_alertas.sql`
- Testes: `src/tests/auditoria-alertas.test.ts`
- Tabela Base: `auditorias_imca` (migration: `20251016154800_create_auditorias_imca_rls.sql`)

---

**Versão**: 1.0.0  
**Data de Criação**: 16 de Outubro de 2025  
**Status**: ✅ Implementado e Testado
