# 🚀 Quick Setup Guide - Daily Restore Report com Gráfico PDF

## Setup Rápido (5 minutos)

### 1. Configurar Variáveis de Ambiente no Supabase

```bash
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-key
supabase secrets set SENDGRID_API_KEY=your-sendgrid-key
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set VITE_APP_URL=https://your-domain.com
supabase secrets set EMAIL_FROM=no-reply@nautilusone.com
```

### 2. Deploy da Função Edge

```bash
supabase functions deploy send_daily_restore_report
```

### 3. Agendar Execução Diária (7:00 AM)

```sql
SELECT cron.schedule(
  'daily-restore-report-with-chart',
  '0 7 * * *',
  $$SELECT net.http_post(
    'https://your-project.supabase.co/functions/v1/send_daily_restore_report',
    '{}',
    '{"Authorization": "Bearer YOUR_ANON_KEY"}'
  );$$
);
```

### 4. Testar Manualmente

```bash
# Teste via cURL
curl -X POST \
  "https://your-project.supabase.co/functions/v1/send_daily_restore_report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## URLs Importantes

| Recurso | URL |
|---------|-----|
| Página Embed (Dev) | http://localhost:5173/embed/restore-chart |
| Página Embed (Prod) | https://your-domain.com/embed/restore-chart |
| Função Edge | https://your-project.supabase.co/functions/v1/send_daily_restore_report |
| Dashboard Supabase | https://app.supabase.com/project/your-project/functions |

## Testes Rápidos

```bash
# Rodar testes
npm run test -- src/tests/pages/embed/RestoreChartEmbed.test.tsx

# Build
npm run build

# Preview
npm run preview
```

## Estrutura do Email

📧 **Assunto**: `📈 Restore Report with Chart - YYYY-MM-DD`

📎 **Anexos**:
- `restore-logs-YYYY-MM-DD.csv` - Logs em CSV
- `restore_report_YYYY-MM-DD.pdf` - Gráfico em PDF

## Verificação Checklist

- [ ] Variáveis de ambiente configuradas
- [ ] Função Edge deployada
- [ ] Cron job agendado
- [ ] Email de teste recebido
- [ ] Página embed acessível
- [ ] Gráfico renderizando corretamente

## Troubleshooting Comum

| Problema | Solução |
|----------|---------|
| Puppeteer não funciona | Verifique VITE_APP_URL configurado |
| Email não chega | Verifique SENDGRID_API_KEY e email verificado |
| Gráfico vazio | Verifique dados em restore_report_logs |
| Timeout | Aumente timeout na função (linha waitForFunction) |

## Comandos Úteis

```bash
# Ver logs da função
supabase functions logs send_daily_restore_report

# Testar localmente
supabase functions serve send_daily_restore_report

# Ver secrets configurados
supabase secrets list

# Deletar cron job
SELECT cron.unschedule('daily-restore-report-with-chart');
```

## Próximos Passos

1. ✅ Setup inicial completo
2. 📧 Receber primeiro email de teste
3. 📊 Verificar gráfico no PDF
4. ⏰ Confirmar cron job executando diariamente
5. 📈 Monitorar logs de execução

## Suporte

Para mais detalhes, consulte:
- [Documentação Completa](./SUPABASE_PUPPETEER_IMPLEMENTATION.md)
- [Testes](./src/tests/pages/embed/RestoreChartEmbed.test.tsx)
- [Função Edge](./supabase/functions/send_daily_restore_report/index.ts)
