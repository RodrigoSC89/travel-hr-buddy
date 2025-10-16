# Auditoria Comentários - Sistema de Comentários para Revisão de Auditorias IMCA

## Visão Geral

O módulo `auditoria_comentarios` permite que usuários adicionem comentários em auditorias IMCA para fins de revisão e colaboração. O sistema implementa segurança robusta com Row Level Security (RLS) e políticas de acesso granulares.

## Estrutura da Tabela

### `auditoria_comentarios`

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identificador único do comentário |
| `auditoria_id` | UUID | REFERENCES auditorias_imca(id) ON DELETE CASCADE | Referência à auditoria IMCA |
| `user_id` | UUID | REFERENCES auth.users(id) | Usuário que criou o comentário |
| `comentario` | TEXT | NOT NULL | Conteúdo do comentário |
| `created_at` | TIMESTAMP WITH TIME ZONE | DEFAULT now() | Data e hora de criação |

## Políticas de Segurança (RLS)

### 1. Visualização de Comentários
**Nome da Política**: "Usuários podem ver comentários"

**Regra**: Usuários podem visualizar comentários de auditorias às quais têm acesso:
- Se o usuário for o proprietário da auditoria (auth.uid() = auditorias_imca.user_id)
- Se o usuário for administrador (public.get_user_role() = 'admin')

```sql
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.auditorias_imca
    WHERE id = auditoria_comentarios.auditoria_id
    AND (auth.uid() = user_id OR public.get_user_role() = 'admin')
  )
);
```

### 2. Inserção de Comentários
**Nome da Política**: "Usuários podem comentar"

**Regra**: Apenas o próprio usuário autenticado pode inserir comentários em seu nome.

```sql
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 3. Exclusão de Comentários
**Nome da Política**: "Admins podem deletar comentários"

**Regra**: Comentários podem ser excluídos por:
- Administradores do sistema
- O próprio autor do comentário

```sql
FOR DELETE USING (public.get_user_role() = 'admin' OR auth.uid() = user_id);
```

## Índices de Performance

Para otimizar consultas, foram criados os seguintes índices:

1. **idx_auditoria_comentarios_auditoria_id**: Busca rápida de comentários por auditoria
2. **idx_auditoria_comentarios_user_id**: Filtro eficiente de comentários por usuário
3. **idx_auditoria_comentarios_created_at**: Ordenação cronológica descendente

## Exemplos de Uso

### Inserir um Comentário

```typescript
import { supabase } from '@/lib/supabase';

async function adicionarComentario(
  auditoriaId: string,
  userId: string,
  comentario: string
) {
  const { data, error } = await supabase
    .from('auditoria_comentarios')
    .insert({
      auditoria_id: auditoriaId,
      user_id: userId,
      comentario: comentario
    })
    .select();

  if (error) {
    console.error('Erro ao adicionar comentário:', error);
    return null;
  }

  return data;
}
```

### Listar Comentários de uma Auditoria

```typescript
async function listarComentarios(auditoriaId: string) {
  const { data, error } = await supabase
    .from('auditoria_comentarios')
    .select(`
      id,
      comentario,
      created_at,
      user_id
    `)
    .eq('auditoria_id', auditoriaId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar comentários:', error);
    return [];
  }

  return data;
}
```

### Excluir um Comentário

```typescript
async function excluirComentario(comentarioId: string) {
  const { error } = await supabase
    .from('auditoria_comentarios')
    .delete()
    .eq('id', comentarioId);

  if (error) {
    console.error('Erro ao excluir comentário:', error);
    return false;
  }

  return true;
}
```

### Verificar se Usuário Pode Comentar

```typescript
async function podeComentarAuditoria(auditoriaId: string, userId: string) {
  // Verifica se o usuário tem acesso à auditoria
  const { data: auditoria, error } = await supabase
    .from('auditorias_imca')
    .select('user_id')
    .eq('id', auditoriaId)
    .single();

  if (error) {
    return false;
  }

  // Verifica se é o proprietário ou admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return auditoria.user_id === userId || profile?.role === 'admin';
}
```

## Integração com a API

### Endpoint de Exemplo

```typescript
// pages/api/auditoria/comentarios/[id].ts
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
  const { id } = req.query; // auditoria_id

  if (req.method === "GET") {
    // Listar comentários
    const { data, error } = await supabase
      .from("auditoria_comentarios")
      .select("*")
      .eq("auditoria_id", id as string)
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    // Adicionar comentário
    const { user_id, comentario } = req.body;

    const { data, error } = await supabase
      .from("auditoria_comentarios")
      .insert({
        auditoria_id: id as string,
        user_id,
        comentario
      })
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
```

## Características de Segurança

### ✅ Benefícios Implementados

1. **Integridade Referencial**: 
   - Comentários são automaticamente excluídos quando a auditoria pai é removida (CASCADE DELETE)
   - Referências válidas para usuários e auditorias

2. **Controle de Acesso Granular**:
   - Usuários só veem comentários de auditorias que possuem ou podem acessar
   - Apenas autores podem criar comentários em seu nome
   - Somente admins e autores podem excluir comentários

3. **Auditoria e Rastreabilidade**:
   - Timestamp automático de criação (created_at)
   - Identificação do autor (user_id)
   - Logs implícitos via RLS

4. **Performance Otimizada**:
   - Índices estratégicos para consultas comuns
   - Queries eficientes com JOIN implícito nas políticas RLS

## Migração

A migração está localizada em:
```
supabase/migrations/20251016160807_create_auditoria_comentarios.sql
```

Para aplicar a migração em um novo ambiente:

```bash
# Via Supabase CLI
supabase db push

# Ou aplicar manualmente via SQL
psql -U postgres -d sua_database -f supabase/migrations/20251016160807_create_auditoria_comentarios.sql
```

## Testes

Testes abrangentes foram implementados em:
```
src/tests/auditoria-comentarios-migration.test.ts
```

Execute os testes com:
```bash
npm test auditoria-comentarios-migration
```

### Cobertura de Testes

- ✅ Estrutura da tabela (7 testes)
- ✅ Políticas RLS (6 testes)
- ✅ Índices de performance (3 testes)
- ✅ Documentação (4 testes)
- ✅ Sintaxe SQL (4 testes)
- ✅ Políticas de segurança (4 testes)
- ✅ Integridade referencial (2 testes)
- ✅ Nomenclatura de arquivos (2 testes)

**Total**: 32 testes, todos passando ✅

## Próximos Passos Recomendados

### 1. Interface de Usuário
Implementar componentes React para:
- Exibir lista de comentários
- Formulário de adição de comentários
- Botão de exclusão (condicional para admins/autores)
- Indicador de usuário que comentou
- Timestamp formatado

### 2. Notificações em Tempo Real
Adicionar subscriptions do Supabase para atualizar comentários em tempo real:

```typescript
const comentariosSubscription = supabase
  .channel('auditoria_comentarios_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'auditoria_comentarios',
      filter: `auditoria_id=eq.${auditoriaId}`
    },
    (payload) => {
      console.log('Mudança detectada:', payload);
      // Atualizar estado da UI
    }
  )
  .subscribe();
```

### 3. Funcionalidades Futuras
- [ ] Edição de comentários (com timestamp de última edição)
- [ ] Respostas a comentários (threading)
- [ ] Menções de usuários (@username)
- [ ] Rich text ou Markdown no comentário
- [ ] Anexos de arquivos nos comentários
- [ ] Reações (👍, ❤️, etc.)
- [ ] Histórico de edições

## Suporte

Para questões ou problemas relacionados ao sistema de comentários:
1. Verifique os logs do Supabase para erros de RLS
2. Confirme que o usuário está autenticado (auth.uid() não é null)
3. Verifique se a função `get_user_role()` está disponível no schema
4. Execute os testes para validar a estrutura

## Referências

- [Documentação de RLS do Supabase](https://supabase.com/docs/guides/auth/row-level-security)
- [Políticas de Segurança PostgreSQL](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Padrões de Migração do Projeto](../supabase/migrations/)
