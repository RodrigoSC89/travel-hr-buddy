# Supabase Schema Directory

Este diretório contém schemas SQL modulares que estendem a funcionalidade do sistema Travel HR Buddy com recursos avançados.

## 📋 Schemas Disponíveis

### workflow_ai_extension.sql

**Descrição**: Extensão de inteligência artificial para o módulo de Workflows

**Funcionalidades**:
- ✅ Armazena sugestões geradas por IA para otimização de workflows
- ✅ Rastreia tipos de sugestão (criar tarefa, ajustar prazo, trocar responsável)
- ✅ Registra fonte da sugestão (MMI, Logs, Checklists, Manual)
- ✅ Inclui níveis de criticidade para priorização
- ✅ Otimizado para integração com Kanban board
- ✅ Seguro com Row Level Security (RLS)
- ✅ Performance otimizada com 3 índices

**Tabelas**:
- `workflow_ai_suggestions`: Armazena todas as sugestões de IA

**Views**:
- `workflow_ai_recent`: Sugestões dos últimos 30 dias

**Índices**:
- `idx_workflow_ai_suggestions_workflow_id`: Busca rápida por workflow
- `idx_workflow_ai_suggestions_gerada_em`: Ordenação por data
- `idx_workflow_ai_suggestions_tipo_sugestao`: Filtro por tipo de sugestão

## 🚀 Como Usar

### 1. Aplicar Schema ao Banco de Dados

Para desenvolvimento local com Supabase CLI:
```bash
supabase db reset
```

Para produção, execute o schema manualmente no SQL Editor do Supabase:
```sql
-- Cole o conteúdo do arquivo workflow_ai_extension.sql
```

### 2. Integração com IA

O schema foi projetado para funcionar com o Copilot IA. Veja a seção de documentação no arquivo SQL para exemplos de prompts e respostas esperadas.

### 3. Consultar Sugestões Recentes

```sql
-- Via view otimizada
SELECT * FROM workflow_ai_recent;

-- Ou diretamente
SELECT * FROM workflow_ai_suggestions 
WHERE gerada_em > now() - INTERVAL '30 days'
ORDER BY gerada_em DESC;
```

### 4. Inserir Sugestão de IA

```sql
INSERT INTO workflow_ai_suggestions (
    workflow_id,
    etapa,
    tipo_sugestao,
    conteudo,
    criticidade,
    responsavel_sugerido,
    origem
) VALUES (
    'uuid-do-workflow',
    'Nome da Etapa',
    'Criar tarefa',
    'Descrição da sugestão',
    'alta',
    'Responsável Sugerido',
    'MMI'
);
```

## 🔒 Segurança

Todos os schemas incluem políticas RLS (Row Level Security) que:
- Permitem leitura para usuários autenticados
- Permitem inserção pelo sistema/IA
- Permitem atualização por usuários autenticados
- Permitem deleção por usuários autenticados

## 📊 Performance

Os índices foram criados para otimizar as consultas mais comuns:
- Busca por workflow específico
- Ordenação por data de geração
- Filtro por tipo de sugestão

## 🔄 Manutenção

Para adicionar novos schemas ao diretório:
1. Crie um arquivo `.sql` com nome descritivo
2. Inclua comentários detalhados no SQL
3. Adicione RLS policies apropriadas
4. Crie índices para performance
5. Documente neste README
6. Teste localmente antes de aplicar em produção

## 📚 Referências

- [Documentação Supabase](https://supabase.com/docs)
- [PostgREST API](https://postgrest.org/)
- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
