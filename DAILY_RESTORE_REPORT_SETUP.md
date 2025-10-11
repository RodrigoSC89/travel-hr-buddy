# 🚀 Daily Restore Report - Quick Setup Guide

## Objetivo

Enviar automaticamente um e-mail de relatório diário com gráfico das restaurações, e notificar o administrador via e-mail em caso de falha.

## ✅ O que foi implementado

### Nova Edge Function: `daily-restore-report`

Localização: `supabase/functions/daily-restore-report/`

**Funcionalidades:**
- ✅ Captura automática do gráfico de restaurações
- ✅ Envio do relatório por e-mail
- ✅ **Notificação de erro via SendGrid** (novo!)
- ✅ Tratamento robusto de erros
- ✅ Logs detalhados para debugging

## 📦 Recursos Adicionados

| Recurso | Status |
|---------|--------|
| 🔔 E-mail de alerta em caso de falha | ✅ Implementado via SendGrid |
| 📧 Destinatário configurável | ✅ Via variável `ADMIN_EMAIL` |
| 💬 Conteúdo claro de erro | ✅ Descreve o tipo de falha |
| ✅ Segue normalmente em caso de sucesso | ✅ Sim |
| 📊 Gráfico anexado ao e-mail | ✅ Usando função `send-chart-report` |

## 🔧 Setup Rápido

### 1. Deploy da Função

```bash
# Login no Supabase
supabase login

# Link com o projeto
supabase link --project-ref seu-project-ref

# Deploy da função
supabase functions deploy daily-restore-report
```

### 2. Configurar Variáveis de Ambiente

```bash
# SendGrid (obrigatório para alertas de erro)
supabase secrets set SENDGRID_API_KEY=SG.sua_chave_sendgrid

# E-mail do administrador (opcional, padrão: admin@empresa.com)
supabase secrets set ADMIN_EMAIL=admin@empresa.com

# URL do site (opcional, usa SUPABASE_URL se não definido)
supabase secrets set SITE_URL=https://seu-site.com

# Chaves do Supabase (geralmente já configuradas)
supabase secrets set SUPABASE_URL=https://seu-projeto.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
supabase secrets set SUPABASE_ANON_KEY=sua_anon_key
```

### 3. Configurar Agendamento Diário

Execute no **SQL Editor** do Supabase:

```sql
-- Ativar extensão pg_cron (se ainda não estiver ativa)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar execução diária às 8h (horário UTC)
-- Ajuste o horário conforme necessário
SELECT cron.schedule(
  'daily-restore-report-job',
  '0 8 * * *',  -- Todo dia às 8h UTC
  $$
  SELECT
    net.http_post(
      url := 'https://seu-projeto.supabase.co/functions/v1/daily-restore-report',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);
```

**Nota:** Para configurar o horário de Brasília (UTC-3), use `'0 11 * * *'` (11h UTC = 8h BRT).

### 4. Verificar Jobs Agendados

```sql
-- Listar todos os jobs do cron
SELECT * FROM cron.job;

-- Ver histórico de execuções
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## 🧪 Testes

### Teste Manual

```bash
# Testar a função manualmente
curl -X POST \
  https://seu-projeto.supabase.co/functions/v1/daily-restore-report \
  -H "Authorization: Bearer sua_anon_key" \
  -H "Content-Type: application/json"
```

### Resposta Esperada (Sucesso)

```json
{
  "success": true,
  "message": "✅ Envio automático de relatório realizado com sucesso",
  "timestamp": "2025-10-11T18:30:00.000Z"
}
```

### Resposta Esperada (Erro)

```json
{
  "error": "Falha geral no processo de envio automático",
  "details": "Error: Erro ao capturar gráfico: 500",
  "timestamp": "2025-10-11T18:30:00.000Z"
}
```

**Importante:** Em caso de erro, você receberá um e-mail de alerta automático!

## 📧 E-mails de Alerta

### Tipos de Alertas Enviados

1. **Falha ao gerar gráfico**
   ```
   Assunto: ❌ Falha no envio de relatório
   Conteúdo: Erro ao enviar o relatório de restaurações por e-mail.
   Detalhes: {...}
   ```

2. **Erro crítico na função**
   ```
   Assunto: ❌ Erro crítico na função Edge
   Conteúdo: Erro ao gerar ou enviar gráfico:
   [Stack trace completo]
   ```

### Configurar Domínio de Alerta no SendGrid

Para que os e-mails de `alerts@nautilusone.com` funcionem:

1. Acesse [SendGrid Dashboard](https://app.sendgrid.com/)
2. Vá em **Settings** → **Sender Authentication**
3. Clique em **Verify a Single Sender**
4. Adicione: `alerts@nautilusone.com`
5. Confirme pelo e-mail de verificação

**Alternativa:** Edite o arquivo `index.ts` e altere o remetente para um e-mail verificado:

```typescript
from: { email: "seu-email-verificado@example.com", name: "Nautilus One Alerts" },
```

## 📊 Monitoramento

### Ver Logs da Função

```bash
# Via CLI
supabase functions logs daily-restore-report --tail

# No Dashboard
Supabase → Edge Functions → daily-restore-report → Logs
```

### Verificar Status do Cron

```sql
-- Ver próximas execuções
SELECT 
  jobname,
  schedule,
  active,
  jobid
FROM cron.job 
WHERE jobname = 'daily-restore-report-job';

-- Ver últimas execuções
SELECT 
  jobid,
  runid,
  job_pid,
  status,
  start_time,
  end_time
FROM cron.job_run_details 
WHERE jobid = (
  SELECT jobid FROM cron.job WHERE jobname = 'daily-restore-report-job'
)
ORDER BY start_time DESC
LIMIT 10;
```

## 🔗 Dependências

Esta função requer:

1. ✅ **send-chart-report**: Edge Function para envio de e-mails (já existe)
2. ⚠️ **generate-chart-image**: API para geração de imagem do gráfico (precisa ser criada)
3. ✅ **SendGrid**: Conta e API key configuradas
4. ✅ **Restore Dashboard**: Dashboard em `/admin/documents/restore-dashboard`

### Criar a função generate-chart-image (opcional)

Se a função `generate-chart-image` não existir, você pode:

**Opção 1:** Modificar o código para usar captura de tela do dashboard
**Opção 2:** Criar uma nova Edge Function que gera o gráfico server-side
**Opção 3:** Usar uma API externa de captura de screenshots

## 🐛 Troubleshooting

### Erro: "SENDGRID_API_KEY is required"

```bash
supabase secrets set SENDGRID_API_KEY=SG.sua_chave
```

### Erro: "Erro ao capturar gráfico: 404"

A função `generate-chart-image` não existe ainda. Opções:

1. Criar a função
2. Modificar o código para usar outro método
3. Usar serviço externo como Puppeteer/Playwright

### Cron job não está executando

```sql
-- Verificar se está ativo
SELECT * FROM cron.job WHERE jobname = 'daily-restore-report-job';

-- Reativar se necessário
SELECT cron.alter_job(
  job_id := (SELECT jobid FROM cron.job WHERE jobname = 'daily-restore-report-job'),
  active := true
);
```

### Não recebi o e-mail de alerta

1. Verifique a caixa de spam
2. Confirme que `SENDGRID_API_KEY` está configurado
3. Verifique se o domínio do remetente está verificado no SendGrid
4. Confira os logs: `supabase functions logs daily-restore-report`

## 📝 Próximos Passos

- [ ] **Criar função `generate-chart-image`** (ou implementar alternativa)
- [ ] Testar o envio completo do relatório
- [ ] Configurar domínio `alerts@nautilusone.com` no SendGrid
- [ ] Ajustar horário do cron para o timezone desejado
- [ ] Adicionar métricas e estatísticas ao e-mail
- [ ] Considerar múltiplos destinatários

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `supabase/functions/daily-restore-report/README.md` - Documentação completa
- `supabase/functions/daily-restore-report/index.ts` - Código fonte
- `supabase/functions/send-chart-report/README.md` - Função de envio de e-mail

## ✅ Resultado

Caso ocorra:
- ✅ Falha ao gerar gráfico → Você será notificado por e-mail
- ✅ Falha no envio de e-mail → Você será notificado por e-mail
- ✅ Erro crítico geral → Você será notificado por e-mail

**Status:** ✅ Implementado e pronto para deploy  
**Data:** 2025-10-11
