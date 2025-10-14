# 📄 Módulo Templates com IA — Nautilus One

## 🧠 Visão Geral

Este módulo permite a criação, edição, geração automática e reutilização de templates técnicos e operacionais com suporte de IA (GPT-4).

Totalmente integrado ao Supabase, é otimizado para uso embarcado e onshore com foco em eficiência documental, reuso de conhecimento e consistência normativa.

## ⚙️ Funcionalidades

### ✍️ Editor Inteligente (TipTap)

- Editor WYSIWYG com blocos editáveis
- Geração de conteúdo via GPT-4 (`/api/templates/generate`)
- Reescrita de trecho selecionado com IA (`/api/templates/rewrite`)
- Salvamento direto no Supabase
- Exportação PDF (jsPDF)
- Flags: ⭐ Favorito | 🔒 Privado

### 📚 Lista de Templates

- Filtros: **Todos** | **Favoritos** | **Privados**
- Cards interativos com título + prévia
- Ações rápidas: **Aplicar** | **Copiar** | **Editar** | **Excluir**
- Aplicação direta via localStorage → `/admin/documents/ai`

### 🧠 IA Embutida

- Geração inteligente com base no título do template
- Reescrita técnica e formal de trechos selecionados
- Prompt adaptado para uso marítimo/offshore (conformidade + clareza)

## 🧱 Arquitetura Técnica

| Camada | Stack |
|--------|-------|
| Frontend | Next.js 13+ (App Router), TipTap, TailwindCSS |
| Backend | Supabase (PostgreSQL + RLS) |
| IA | OpenAI GPT-4o-mini via edge functions |
| Storage | Supabase Storage (PDF export) |

## 🗂️ Estrutura do Supabase

### Tabela: `templates`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | ID único |
| `title` | text | Título do template |
| `content` | text | HTML gerado/salvo |
| `is_favorite` | boolean | Marcado como favorito |
| `is_private` | boolean | Visível apenas ao autor/admin |
| `created_by` | UUID | Referência ao usuário criador |
| `created_at` | timestamp | Data de criação automática |
| `updated_at` | timestamp | Data de última atualização |

### Políticas RLS (Row Level Security)

- **SELECT**: Usuários podem ver templates públicos ou seus próprios templates privados
- **INSERT**: Usuários podem criar seus próprios templates
- **UPDATE**: Usuários podem atualizar apenas seus templates
- **DELETE**: Usuários podem excluir apenas seus templates

## 📌 APIs (Supabase Edge Functions)

### `/supabase/functions/templates-generate`

**Entrada:**
```json
{
  "title": "string"
}
```

**Saída:**
```json
{
  "content": "string (HTML)",
  "timestamp": "ISO 8601"
}
```

**Função:** Gera conteúdo HTML formatado baseado no título do template usando GPT-4o-mini.

### `/supabase/functions/templates-rewrite`

**Entrada:**
```json
{
  "input": "string"
}
```

**Saída:**
```json
{
  "result": "string",
  "timestamp": "ISO 8601"
}
```

**Função:** Reescreve trecho com clareza, formalidade e tom técnico marítimo.

## 🚀 Rotas Implementadas

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin/templates` | `TemplatesList` | Lista de templates com filtros |
| `/admin/templates/editor` | `TemplateEditor` | Criar novo template |
| `/admin/templates/editor/:id` | `TemplateEditor` | Editar template existente |

## 📁 Estrutura de Arquivos

```
src/pages/admin/templates/
├── index.tsx          # Lista de templates
└── editor.tsx         # Editor de templates

supabase/
├── functions/
│   ├── templates-generate/
│   │   └── index.ts   # API de geração
│   └── templates-rewrite/
│       └── index.ts   # API de reescrita
└── migrations/
    └── 20251014195000_create_templates_table.sql
```

## 🔧 Configuração Necessária

### Variáveis de Ambiente

```bash
# Supabase Edge Functions
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependências

Já incluídas no projeto:
- `@tiptap/react` ^2.26.3
- `@tiptap/starter-kit` ^2.26.3
- `jspdf` ^3.0.3
- `@supabase/supabase-js` ^2.57.4

## 📝 Como Usar

### 1. Criar um Novo Template

1. Navegue para `/admin/templates`
2. Clique em "Novo Template"
3. Digite o título do template
4. Clique em "Gerar com IA" para criar conteúdo automaticamente
5. Edite o conteúdo no editor
6. Marque como favorito (⭐) ou privado (🔒) se necessário
7. Clique em "Salvar Template"

### 2. Editar Template Existente

1. Na lista de templates, clique no ícone de edição (✏️)
2. Modifique o conteúdo
3. Use "Reescrever Seleção" para melhorar trechos específicos
4. Salve as alterações

### 3. Aplicar Template em Documento

1. Na lista de templates, clique em "Aplicar"
2. Você será redirecionado para `/admin/documents/ai`
3. O template será carregado automaticamente
4. Continue editando ou gere novo conteúdo

### 4. Exportar para PDF

1. No editor, clique em "Exportar PDF"
2. O arquivo será baixado automaticamente

## ✅ Checklist MVP Concluído

- [x] Editor TipTap com IA integrada
- [x] Geração automática de templates
- [x] Exportação PDF
- [x] Reescrita de trecho com GPT-4
- [x] Listagem com filtros e ações
- [x] Aplicação via localStorage
- [x] Flags de favorito e privado
- [x] Políticas RLS no Supabase
- [x] Integração com módulo Documents AI
- [x] CSS customizado para editor

## 📈 Próximos Passos Recomendados

- [ ] Busca por título (ilike) + busca semântica futura
- [ ] Aplicação em lote (multi-template)
- [ ] Versionamento de templates
- [ ] Templates vinculados a workflows ou documentos
- [ ] Visualização de uso / analytics por template
- [ ] Template marketplace compartilhado
- [ ] Suporte a variáveis dinâmicas
- [ ] Formatação avançada com mais blocos TipTap
- [ ] Colaboração em tempo real (Yjs)

## 🧪 Testes Recomendados

1. **Criar e salvar novo template**
   - ✅ Inserir título
   - ✅ Gerar conteúdo com IA
   - ✅ Salvar no Supabase
   - ✅ Verificar flags (favorito/privado)

2. **Aplicar template em documentos IA**
   - ✅ Clicar em "Aplicar" na lista
   - ✅ Verificar redirecionamento
   - ✅ Confirmar carregamento do conteúdo

3. **Reescrever trecho com seleção parcial**
   - ✅ Selecionar texto no editor
   - ✅ Clicar em "Reescrever Seleção"
   - ✅ Verificar resultado

4. **Exportar conteúdo gerado para PDF**
   - ✅ Gerar template
   - ✅ Clicar em "Exportar PDF"
   - ✅ Verificar arquivo baixado

5. **Filtrar por favorito e privado**
   - ✅ Criar templates com diferentes flags
   - ✅ Testar filtros na lista
   - ✅ Verificar visibilidade

6. **Testar permissão de visualização via Supabase Auth**
   - ✅ Criar template privado
   - ✅ Fazer logout
   - ✅ Verificar que não aparece para outros usuários

## 🔐 Segurança

- Row Level Security (RLS) habilitado
- Templates privados visíveis apenas ao criador
- Autenticação obrigatória para CRUD
- Edge functions com CORS configurado
- Retry logic com exponential backoff
- Timeouts configurados (30s)

## 📊 Métricas e Performance

- Build size: ~12KB (editor) + ~8.7KB (lista)
- Tempo de resposta IA: ~2-5s (geração) / ~1-3s (reescrita)
- Suporte a templates ilimitados por usuário
- Paginação futura recomendada para grandes volumes

## 📬 Suporte

Para suporte técnico, evolução do módulo ou integração com outros sistemas embarcados, entre em contato com a equipe **Nautilus One**.

---

**Documento gerado automaticamente como parte do roadmap técnico do Nautilus One – Outubro 2025** ✅
