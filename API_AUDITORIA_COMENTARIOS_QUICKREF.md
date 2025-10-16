# 📝 API Auditoria Comentários - Guia Rápido

## 🎯 Endpoint

```
/api/auditoria/[id]/comentarios
```

## 📋 Métodos

### GET - Buscar Comentários
```bash
curl http://localhost:5173/api/auditoria/uuid-123/comentarios
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "comentario": "texto",
    "created_at": "2025-10-16T12:00:00Z",
    "user_id": "user-id"
  }
]
```

---

### POST - Criar Comentário + IA

```bash
curl -X POST http://localhost:5173/api/auditoria/uuid-123/comentarios \
  -H "Content-Type: application/json" \
  -d '{"comentario":"Verificar equipamentos"}'
```

**Resposta:**
```json
{
  "sucesso": true,
  "comentario": { /* dados do comentário */ }
}
```

**IA gera resposta automática com user_id = "ia-auto-responder"**

---

## ⚡ Características Principais

| Recurso | Descrição |
|---------|-----------|
| 🤖 **IA Auto-Responder** | GPT-4 gera resposta técnica baseada em normas IMCA |
| 🔐 **Autenticação** | POST requer autenticação, GET é público |
| ✅ **Validação** | Comentários vazios rejeitados (400) |
| 📊 **Ordenação** | Comentários ordenados por data DESC |
| 🛡️ **Segurança** | RLS policies no Supabase |
| 🎯 **IMCA Standards** | IA configurada como auditor offshore IMCA |

---

## 🔧 Setup Rápido

### 1. Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
VITE_OPENAI_API_KEY=sk-proj-...
```

### 2. Executar Migração
```bash
# Aplicar migration no Supabase
supabase db push
```

### 3. Testar
```bash
npm test src/tests/auditoria-comentarios-api.test.ts
```

---

## 📦 Estrutura de Dados

```typescript
interface AuditoriaComentario {
  id: string;              // UUID
  auditoria_id: string;    // UUID da auditoria
  comentario: string;      // Texto do comentário
  user_id: string;         // UUID do usuário ou "ia-auto-responder"
  created_at: string;      // Timestamp ISO
  updated_at?: string;     // Timestamp ISO
}
```

---

## 🎨 Exemplo de Uso React

```typescript
// Buscar comentários
const fetchComentarios = async (auditoriaId: string) => {
  const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`);
  return res.json();
};

// Criar comentário
const criarComentario = async (auditoriaId: string, texto: string) => {
  const res = await fetch(`/api/auditoria/${auditoriaId}/comentarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comentario: texto })
  });
  return res.json();
};

// Identificar comentários da IA
const isAIComment = (comment) => comment.user_id === 'ia-auto-responder';
```

---

## 🚨 Códigos de Status

| Código | Descrição |
|--------|-----------|
| **200** | GET bem-sucedido |
| **201** | POST bem-sucedido |
| **400** | ID inválido ou comentário vazio |
| **401** | Usuário não autenticado (POST) |
| **405** | Método não permitido (não GET/POST) |
| **500** | Erro no servidor/banco de dados |

---

## 🧪 Testes

```bash
# Rodar testes específicos
npm test src/tests/auditoria-comentarios-api.test.ts

# Rodar todos os testes
npm test

# Cobertura de testes
npm run test:coverage
```

**65 testes implementados** cobrindo:
- Request handling
- Autenticação
- Validação
- Integração OpenAI
- Schema do banco
- Tratamento de erros

---

## 🤖 Configuração da IA

**Modelo:** GPT-4

**System Message:**
```
"Você é um engenheiro auditor da IMCA."
```

**User Prompt:**
```
"Você é um auditor técnico baseado nas normas IMCA. 
Dado o seguinte comentário de um usuário:
'[comentário]'
Gere uma resposta técnica sucinta com base nas 
melhores práticas de auditoria offshore."
```

---

## 📂 Arquivos Criados

```
pages/api/auditoria/[id]/comentarios.ts
supabase/migrations/20251016160000_create_auditoria_comentarios.sql
src/tests/auditoria-comentarios-api.test.ts
API_AUDITORIA_COMENTARIOS.md
API_AUDITORIA_COMENTARIOS_QUICKREF.md
```

---

## 🔍 Troubleshooting

### Erro: "Usuário não autenticado"
- ✅ Verificar se está enviando token de autenticação
- ✅ Confirmar que o usuário está logado no Supabase

### Erro: "Comentário vazio"
- ✅ Verificar se `comentario` está presente no body
- ✅ Garantir que não é apenas espaços em branco

### IA não responde
- ✅ Verificar `VITE_OPENAI_API_KEY` configurado
- ✅ Verificar limites de uso da API OpenAI
- ✅ Checar logs do servidor para erros de IA
- ⚠️ Comentário do usuário é salvo mesmo se IA falhar

### Erro: "ID inválido"
- ✅ Verificar se o ID é uma string válida
- ✅ Confirmar formato UUID correto

---

## 💡 Dicas

1. **Identificar comentários da IA:** `user_id === "ia-auto-responder"`
2. **Ordenação:** Comentários vêm ordenados do mais recente ao mais antigo
3. **Performance:** Índices criados em `auditoria_id` e `created_at`
4. **Segurança:** RLS policies aplicadas automaticamente
5. **Resiliência:** Sistema continua funcionando mesmo se IA falhar

---

## 🔗 Links Úteis

- [Documentação Completa](./API_AUDITORIA_COMENTARIOS.md)
- [Testes](./src/tests/auditoria-comentarios-api.test.ts)
- [Migração SQL](./supabase/migrations/20251016160000_create_auditoria_comentarios.sql)
- [IMCA Standards](https://www.imca-int.com/)

---

**Status:** ✅ Implementado e testado  
**Versão:** 1.0.0  
**Data:** 2025-10-16
