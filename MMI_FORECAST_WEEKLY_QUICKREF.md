# 🚀 Forecast Weekly - Quick Reference

## 📌 Resumo Rápido

**Função:** `forecast-weekly`  
**Tipo:** Supabase Edge Function (Cron)  
**Frequência:** Toda semana (Domingos, 03:00 UTC)  
**Propósito:** Gerar forecasts de IA para jobs de manutenção e criar OS automaticamente

---

## 🔧 Configuração

### Local
```
supabase/functions/forecast-weekly/index.ts
```

### Cron Schedule
```toml
schedule = "0 3 * * 0"  # Domingos às 03:00 UTC
```

---

## 📊 O Que a Função Faz

1. **Busca** jobs ativos (`pending`, `in_progress`)
2. **Gera** forecast simulado (IA mock) para cada job
3. **Calcula** próxima data de execução (7 ou 30 dias)
4. **Insere** forecast em `mmi_forecasts`
5. **Cria** OS em `mmi_orders` se risco = alto

---

## 🎯 Tabelas Afetadas

### Input
- `mmi_jobs` → Busca jobs ativos

### Output
- `mmi_forecasts` → Insere forecasts
- `mmi_orders` → Cria OS para alto risco

---

## 🔍 Simulação de Risco

```typescript
const risco = Math.random() > 0.7 ? 'alto' : 'moderado'
```

- **70%** chance → risco moderado (próxima: +30 dias)
- **30%** chance → risco alto (próxima: +7 dias, cria OS)

---

## 📋 Resposta JSON

```json
{
  "success": true,
  "timestamp": "ISO 8601 date",
  "jobs_processed": 15,
  "forecasts_created": 15,
  "orders_created": 4,
  "forecast_summary": {
    "high_risk": 4,
    "moderate_risk": 11
  }
}
```

---

## 🧪 Como Testar

### Via Supabase CLI
```bash
supabase functions invoke forecast-weekly
```

### Via cURL
```bash
curl -X POST \
  https://[projeto].supabase.co/functions/v1/forecast-weekly \
  -H "Authorization: Bearer [anon-key]"
```

### Via SQL (Verificar Resultados)
```sql
-- Forecasts dos últimos 7 dias
SELECT * FROM mmi_forecasts 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- OS criadas automaticamente
SELECT * FROM mmi_orders 
WHERE created_at >= NOW() - INTERVAL '7 days';
```

---

## ⚙️ Próximos Passos (Melhorias)

- [ ] Substituir `Math.random()` por chamada real ao GPT-4
- [ ] Adicionar notificações por e-mail
- [ ] Criar dashboard de visualização
- [ ] Personalizar intervalos por sistema

---

## 🐛 Troubleshooting

### Função não está executando
- Verificar cron config em `supabase/config.toml`
- Checar logs: Dashboard → Edge Functions → Logs

### Forecasts não estão sendo criados
- Verificar se existem jobs ativos
- Checar RLS policies em `mmi_forecasts`

### OS não estão sendo criadas
- Confirmar que forecast tem `risco = 'alto'`
- Verificar RLS policies em `mmi_orders`

---

## 📚 Documentação Completa

Veja `MMI_FORECAST_WEEKLY_README.md` para documentação detalhada.

---

✅ **Status:** Pronto para Produção  
📅 **Versão:** 1.0.0  
🔗 **PR:** #[número]
