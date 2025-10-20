# 🕸️ IMCA Crawler - Etapa 11

## 🎯 Objetivo

Capturar automaticamente os últimos incidentes públicos do site oficial da IMCA:

🔗 https://www.imca-int.com/safety-events/

E salvar no Supabase na tabela `dp_incidents`.

## 📋 Campos da Tabela `dp_incidents`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| titulo (title) | text | Título do incidente |
| descricao (description) | text | Descrição extraída da página |
| sistema_afetado | text | (Opcional) detectado via NLP ou padrão textual |
| gravidade (severity) | text | Alta, Média ou Baixa |
| link_original | text | URL completa da fonte original |
| data_incidente (incident_date) | date | Data de publicação do evento |

## 🚀 Como Executar

### 1. Configurar variáveis de ambiente

Certifique-se de que o arquivo `.env.local` contém:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...seu-service-role-key
```

> ⚠️ **Importante**: O `SUPABASE_SERVICE_ROLE_KEY` é necessário para operações server-side e bypass de RLS (Row Level Security).

### 2. Executar o crawler

```bash
npm run crawler:imca
```

Ou diretamente:

```bash
npx tsx scripts/imca-crawler.ts
```

### 3. Resultado Esperado

O crawler irá:

1. ✅ Acessar https://www.imca-int.com/safety-events/
2. ✅ Extrair informações dos incidentes listados
3. ✅ Verificar duplicatas por `link_original`
4. ✅ Salvar apenas incidentes novos no Supabase
5. ✅ Exibir resumo da execução

Exemplo de saída:

```
🚀 Starting IMCA Crawler...

🌐 Fetching IMCA safety events from: https://www.imca-int.com/safety-events/
✅ Found 15 incidents on IMCA website

🆕 New incident saved: Loss of Position Due to Gyro Drift
⏭️  Already exists: Thruster Control Software Failure
🆕 New incident saved: Reference System Failure in Heavy Weather
...

📊 Summary:
   Total incidents found: 15
   New incidents saved: 8
   Duplicates skipped: 7

✅ IMCA Crawler completed successfully!
```

## 📊 Visualizar os Dados

Após a execução do crawler, os novos incidentes estarão disponíveis em:

🔗 **Painel**: `/dp-intelligence`

Os incidentes aparecem automaticamente na:
- Tab "Incidentes" - Lista completa de incidentes
- Tab "Dashboard Analítico" - Estatísticas e gráficos

## ⚙️ Executar Periodicamente (Opcional)

Para executar o crawler automaticamente 1x por semana:

### Opção 1: Supabase Edge Function com Cron

Crie uma Edge Function:

```typescript
// supabase/functions/imca-crawler-cron/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // Execute o mesmo código do crawler
  // ...
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Configure o cron no dashboard do Supabase para executar semanalmente.

### Opção 2: GitHub Actions (Workflow)

Crie um workflow em `.github/workflows/imca-crawler.yml`:

```yaml
name: IMCA Crawler

on:
  schedule:
    - cron: '0 9 * * 1' # Every Monday at 9:00 AM UTC
  workflow_dispatch: # Allow manual trigger

jobs:
  crawler:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm run crawler:imca
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Opção 3: Cron Job Local

Em um servidor Linux, adicione ao crontab:

```bash
# Run every Monday at 9:00 AM
0 9 * * 1 cd /path/to/travel-hr-buddy && npm run crawler:imca
```

## 🔧 Troubleshooting

### Erro: Missing environment variables

Certifique-se de que as variáveis `VITE_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão definidas no `.env.local`.

### Erro: Cannot insert into dp_incidents

Verifique se a migração `20251020000000_add_crawler_fields_to_dp_incidents.sql` foi aplicada:

```bash
# Se usando Supabase CLI local
supabase db push
```

### Nenhum incidente encontrado

O site da IMCA pode ter mudado sua estrutura HTML. Verifique os seletores CSS no arquivo `scripts/imca-crawler.ts`:

- `.news-list__item` - Container de cada incidente
- `.news-list__title` - Título do incidente
- `.news-list__date` - Data do incidente

## 📚 Dependências Instaladas

- `axios` - Para fazer requisições HTTP
- `cheerio` - Para parsing de HTML (DOM parsing server-side)
- `tsx` - Para executar TypeScript diretamente
- `@supabase/supabase-js` - Cliente Supabase

## 🔐 Segurança

⚠️ **Nunca commite o arquivo `.env.local` no Git!**

O `SUPABASE_SERVICE_ROLE_KEY` tem acesso completo ao banco de dados, incluindo bypass de RLS. Mantenha-o seguro.

## ✅ Próximos Passos

Após executar o crawler, você pode:

1. ✅ Visualizar os incidentes no painel `/dp-intelligence`
2. ✅ Aplicar análise de IA nos incidentes (GPT-4)
3. ✅ Criar planos de ação automaticamente
4. ✅ Enviar alertas por e-mail para incidentes críticos
5. ✅ Integrar com SGSO (Sistema de Gestão de Segurança Operacional)

---

**Desenvolvido para Travel HR Buddy - Sistema Náutico Inteligente** 🚢⚓
