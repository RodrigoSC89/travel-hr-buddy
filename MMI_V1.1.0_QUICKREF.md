# MMI v1.1.0 - Guia Rápido

## 🚀 Quick Start

### Acesso ao Sistema
```
URL: /mmi/jobs
```

### Principais Funcionalidades

#### 1️⃣ Copilot IA
- **Como usar:** Clique no botão "Copilot IA" em qualquer job card
- **O que faz:** Analisa o job e histórico similar, gerando recomendação técnica detalhada
- **Tempo:** 2-3 segundos

#### 2️⃣ Relatório PDF
- **Como usar:** Clique em "Exportar Relatório PDF" no topo da página
- **Inclui:** Jobs, status, IA recommendations, estatísticas
- **Formato:** PDF A4 pronto para impressão

#### 3️⃣ Postergar Job
- **Como usar:** Clique em "Postergar com IA" no job card
- **O que faz:** Calcula nova data (+7 dias) e justifica com IA
- **Registra:** Ação no histórico para aprendizado futuro

#### 4️⃣ Criar OS
- **Como usar:** Clique em "Criar OS" no job card
- **O que faz:** Gera Ordem de Serviço automaticamente
- **Atualiza:** Status do job para "Em andamento"

---

## 🧠 Como Funciona a IA

### Vector Embeddings
1. Job é convertido em vetor de 1536 dimensões
2. Busca casos similares no histórico via pgvector
3. Encontra top 5 casos mais similares (threshold 0.7)

### Copilot IA
1. Coleta casos similares do histórico
2. Monta prompt enriquecido com contexto
3. GPT-4 analisa e gera recomendação estruturada
4. Retorna: ação, componente, prazo, necessidade de OS, justificativa

---

## 📊 Estrutura de Dados

### Job
```typescript
{
  id: string
  title: string
  status: 'Pendente' | 'Em andamento' | 'Aguardando peças' | 'Concluído'
  priority: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  due_date: string (YYYY-MM-DD)
  component_name: string
  asset_name: string
  vessel: string
  suggestion_ia?: string
  can_postpone: boolean
  embedding: vector(1536)
}
```

### AI Recommendation
```typescript
{
  technical_action: string
  component: string
  deadline: string
  requires_work_order: boolean
  reasoning: string
  similar_cases: Array<{
    job_id: string
    action: string
    outcome: string
    similarity: number
  }>
}
```

---

## 🔧 Configuração

### Variáveis de Ambiente
```bash
VITE_OPENAI_API_KEY=sk-...           # OpenAI API key
VITE_SUPABASE_URL=https://...        # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY=...    # Supabase anon key
```

### Extensão PostgreSQL
```sql
CREATE EXTENSION vector;
```

### Migrações
```bash
# Executar migration
cd supabase
supabase migration up
```

---

## 📈 Métricas

| Operação | Tempo | Cache |
|----------|-------|-------|
| Fetch Jobs | < 1s | ✓ |
| Embedding | < 1s | - |
| RPC Similarity | < 0.5s | ✓ |
| AI Recommendation | < 3s | - |
| PDF Generation | < 2s | - |

---

## 🧪 Testes

```bash
# Todos os testes
npm test

# Apenas MMI
npm test -- src/tests/mmi-*.test.ts

# Copilot
npm test -- src/tests/mmi-copilot.test.ts

# Embeddings
npm test -- src/tests/mmi-embedding.test.ts

# PDF
npm test -- src/tests/mmi-pdf-report.test.ts
```

**Resultado:** 51/64 testes passando (~80% cobertura)

---

## 🐛 Troubleshooting

### Problema: "OpenAI API key not configured"
**Solução:** Adicione `VITE_OPENAI_API_KEY` no `.env`

### Problema: "Error fetching jobs: fetch failed"
**Solução:** Sistema usa fallback para mock data automaticamente

### Problema: PDF não gera
**Solução:** Verifique console do navegador, pode ser bloqueio de popup

### Problema: Copilot muito lento
**Solução:** Normal em primeira execução, depois fica < 3s

### Problema: Casos similares vazios
**Solução:** Histórico ainda não povoado, recomendação funciona mesmo assim

---

## 🔗 Links Úteis

- **Supabase Docs:** https://supabase.com/docs
- **OpenAI Embeddings:** https://platform.openai.com/docs/guides/embeddings
- **pgvector:** https://github.com/pgvector/pgvector
- **html2pdf.js:** https://github.com/eKoopmans/html2pdf.js

---

## 📞 Suporte

- **Issues:** GitHub Issues
- **Docs:** MMI_V1.1.0_IMPLEMENTATION.md
- **Código:** Comentários inline

---

**Nautilus One v1.1.0** 🌊
