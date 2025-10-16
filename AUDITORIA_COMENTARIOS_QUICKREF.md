# Auditoria Comentários - Quick Reference

## 🚀 Endpoints

### 1. Listar Comentários
```
GET /api/auditoria/[id]/comentarios
```
Retorna todos os comentários de uma auditoria ordenados por data (mais recentes primeiro).

### 2. Adicionar Comentário
```
POST /api/auditoria/[id]/comentarios
Authorization: Bearer {token}
Body: { "comentario": "texto" }
```
Adiciona comentário e gera análise automática por IA.

### 3. Exportar PDF
```
GET /api/auditoria/[id]/export-comentarios-pdf
```
Baixa relatório completo em PDF com auditoria e comentários.

## 🤖 Comportamento da IA

- **Modelo**: GPT-4
- **Especialização**: Normas IMCA
- **Função**: Análise técnica automática
- **Output**: Comentário de resposta técnica
- **Alertas**: Prefixo "⚠️ Atenção: " para falhas críticas

## 🗄️ Banco de Dados

**Tabela**: `auditoria_comentarios`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificador único |
| auditoria_id | UUID | FK para auditorias_imca |
| comentario | TEXT | Texto do comentário |
| user_id | TEXT | UUID do usuário ou "ia-auto-responder" |
| created_at | TIMESTAMP | Data/hora de criação |

## 🔒 Segurança

**RLS Políticas:**
- ✅ Usuários veem comentários de suas auditorias
- ✅ Admins veem todos os comentários
- ✅ Usuários podem inserir em suas auditorias
- ✅ Sistema pode inserir comentários IA

## 📊 PDF Features

**Conteúdo:**
- Título da auditoria
- Descrição e metadados
- Data, status, pontuação
- Tabela de comentários (Data/Hora, Autor, Comentário)
- Rodapé com timestamp

**Destaques:**
- 🔵 Comentários IA em azul (bold)
- 🔴 Warnings (⚠️) em vermelho
- Linhas alternadas para legibilidade

## 🧪 Testes

```bash
# Testes de comentários (67 testes)
npm test auditoria-comentarios-api.test.ts

# Testes de PDF (79 testes)
npm test auditoria-export-pdf.test.ts
```

## 🔧 Configuração

**Variáveis de Ambiente:**
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 📝 Exemplo de Uso

```typescript
// 1. Adicionar comentário
const res = await fetch(`/api/auditoria/${id}/comentarios`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ comentario: 'Falha detectada' })
});

// 2. IA responde automaticamente

// 3. Listar todos
const comentarios = await fetch(`/api/auditoria/${id}/comentarios`)
  .then(r => r.json());

// 4. Exportar PDF
window.open(`/api/auditoria/${id}/export-comentarios-pdf`);
```

## ⚡ Principais Features

✅ Comentários com autenticação  
✅ Análise técnica automática por IA  
✅ Detecção de falhas críticas  
✅ Exportação profissional em PDF  
✅ Row Level Security  
✅ 146 testes unitários  
✅ Build validado  

## 📁 Arquivos Criados

```
pages/api/auditoria/[id]/
├── comentarios.ts              # API de comentários
└── export-comentarios-pdf.ts   # API de export PDF

supabase/migrations/
└── 20251016162100_create_auditoria_comentarios.sql

src/tests/
├── auditoria-comentarios-api.test.ts  # 67 testes
└── auditoria-export-pdf.test.ts       # 79 testes
```

## 🎯 Status

- [x] Database migration
- [x] API comentários (GET/POST)
- [x] Integração OpenAI IA
- [x] PDF export
- [x] Testes completos
- [x] Linting OK
- [x] Build OK
- [x] Documentação

## 🆘 Troubleshooting

**Erro 401 - Não autenticado**
- Verificar header Authorization
- Validar token Bearer

**Erro 404 - Auditoria não encontrada**
- Verificar UUID da auditoria
- Confirmar permissões RLS

**IA não responde**
- Verificar OPENAI_API_KEY
- Erro não impede criação do comentário
- Checar logs do servidor

**PDF não gera**
- Verificar dependências jspdf
- Confirmar dados da auditoria
- Revisar logs de erro
