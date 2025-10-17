# 📋 Quick Reference - Lista Auditorias IMCA

## URL de Acesso
```
/admin/lista-auditorias-imca
```

## Funcionalidades Principais

### 🔍 Filtrar
```
Campo: "🔍 Filtrar por navio, norma, item ou resultado..."
Busca em: navio, norma, item_auditado, resultado
```

### 📤 Exportar CSV
```
Botão: "Exportar CSV"
Arquivo: auditorias_imca_YYYY-MM-DD.csv
Formato: UTF-8, headers inclusos
```

### 📄 Exportar PDF
```
Botão: "Exportar PDF"
Arquivo: auditorias_imca_YYYY-MM-DD.pdf
Formato: A4 Portrait, margem 0.5"
```

### 🤖 Análise IA
```
Botão: "🧠 Análise IA e Plano de Ação"
Disponível: Apenas para "Não Conforme"
Tempo: 5-15 segundos
Retorna: Explicação técnica + Plano de ação
```

## Badges de Status

| Badge | Status | Cor |
|-------|--------|-----|
| 🟢 | Conforme | Verde |
| 🔴 | Não Conforme | Vermelho |
| ⚫ | Não Aplicável | Cinza |

## Estrutura do Card

```
┌─────────────────────────────────┐
│ 🚢 Navio            [Badge]     │
│ DD/MM/YYYY - Norma              │
├─────────────────────────────────┤
│ Item auditado: ...              │
│ Comentários: ...                │
│ [🧠 Análise IA (se não conf.)] │
│   └─ 📘 Explicação IA           │
│   └─ 📋 Plano de Ação           │
└─────────────────────────────────┘
```

## API Endpoints (Edge Functions)

### auditorias-explain
```bash
POST /functions/v1/auditorias-explain
Content-Type: application/json
Authorization: Bearer ANON_KEY

{
  "navio": "string",
  "item": "string",
  "norma": "string"
}

Response: { "success": true, "resultado": "..." }
```

### auditorias-plano
```bash
POST /functions/v1/auditorias-plano
Content-Type: application/json
Authorization: Bearer ANON_KEY

{
  "navio": "string",
  "item": "string",
  "norma": "string"
}

Response: { "success": true, "plano": "..." }
```

## Database Schema

```sql
-- Campos técnicos
navio           TEXT
norma           TEXT
item_auditado   TEXT
resultado       TEXT CHECK (resultado IN ('Conforme', 'Não Conforme', 'Não Aplicável'))
comentarios     TEXT
data            DATE

-- Índices
idx_auditorias_imca_navio
idx_auditorias_imca_norma
idx_auditorias_imca_resultado
idx_auditorias_imca_data
```

## Queries Supabase

### Carregar Auditorias
```typescript
const { data, error } = await supabase
  .from("auditorias_imca")
  .select("*")
  .not("navio", "is", null)
  .order("data", { ascending: false });
```

## Componentes

### Principal
```
src/components/auditorias/ListaAuditoriasIMCA.tsx
```

### Página
```
src/pages/admin/lista-auditorias-imca.tsx
```

### Rota
```typescript
<Route path="/admin/lista-auditorias-imca" element={<ListaAuditoriasIMCA />} />
```

## Testes

### Arquivo
```
src/tests/lista-auditorias-imca.test.tsx
```

### Cobertura
- Renderização ✅
- Carregamento ✅
- Filtragem ✅
- Exportação ✅
- Badges ✅
- AI Analysis ✅
- Acessibilidade ✅
- Erros ✅

### Executar Testes
```bash
npm test lista-auditorias-imca
```

## Deploy Checklist

- [ ] Migration executada
  ```bash
  supabase migration up
  ```

- [ ] Edge Functions deployadas
  ```bash
  supabase functions deploy auditorias-explain
  supabase functions deploy auditorias-plano
  ```

- [ ] OpenAI API Key configurada
  ```bash
  supabase secrets set OPENAI_API_KEY=sk-...
  ```

- [ ] Build frontend
  ```bash
  npm run build
  ```

- [ ] Deploy Vercel
  ```bash
  vercel --prod
  ```

## Troubleshooting Rápido

### Não carrega auditorias
```
1. Verificar autenticação
2. Verificar RLS policies
3. Console do navegador para erros
```

### Análise IA falha
```
1. Verificar OPENAI_API_KEY no Supabase
2. Verificar quota OpenAI
3. Verificar logs das Edge Functions
```

### Exportação não funciona
```
CSV: Verificar file-saver importado
PDF: Verificar html2pdf.js importado
```

### Performance lenta
```
1. Verificar número de registros
2. Aplicar filtros antes de visualizar
3. Verificar índices no banco
```

## Comandos Úteis

### Development
```bash
npm run dev                 # Iniciar dev server
npm test                    # Executar testes
npm run lint                # Lint código
npm run build               # Build produção
```

### Supabase
```bash
supabase start              # Iniciar local
supabase functions serve    # Servir functions local
supabase db reset           # Reset database local
supabase migration list     # Listar migrations
```

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Supabase Secrets**:
```bash
OPENAI_API_KEY=sk-xxx
```

## Performance Benchmarks

| Ação | Tempo Esperado |
|------|----------------|
| Carregamento inicial | < 2s |
| Filtragem | < 100ms |
| Exportar CSV | < 1s |
| Exportar PDF | 2-5s |
| Análise IA | 5-15s |

## Limites

- **RLS**: Usuários veem apenas suas auditorias (admins veem tudo)
- **Análise IA**: Apenas para "Não Conforme"
- **OpenAI**: Rate limits da API (60 req/min)
- **PDF**: Pode ser lento para >100 registros

## Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [IMCA Standards](https://www.imca-int.com/)
- [file-saver](https://github.com/eligrey/FileSaver.js/)
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)

---

**Versão**: 1.0.0  
**Última atualização**: Outubro 2025
