# 📋 Daily Restore Report - Guia Rápido

## ✅ O que foi implementado

Nova função Edge `daily-restore-report` com **logging detalhado** para monitoramento no Supabase Console.

## 🎯 Objetivo

Capturar gráfico de análise diariamente e enviar por e-mail com logs completos visíveis no painel do Supabase.

## 📊 Onde ver os logs?

1. Acesse **Supabase Project Dashboard**
2. Vá para **Logs** no menu lateral
3. Filtro por: **Edge Functions**
4. Selecione: **daily-restore-report**

## 🟢 Logs de Sucesso

Você verá mensagens como:

```
🟢 Iniciando execução da função diária...
📅 Data/Hora: 2025-10-11T09:00:00.000Z
👤 Admin Email: admin@empresa.com
📊 URL do gráfico: https://seusite.com/api/generate-chart-image
🔄 Capturando gráfico...
✅ Gráfico capturado com sucesso
   Tamanho da imagem: 125432 bytes
   Tamanho em base64: 167243 caracteres
📧 Enviando e-mail...
   Endpoint de e-mail: https://seusite.com/api/send-restore-report
✅ Relatório enviado com sucesso!
   Destinatário: admin@empresa.com
   Timestamp: 2025-10-11T09:00:15.234Z
```

## ❌ Logs de Erro

Em caso de falha, você verá:

```
🟢 Iniciando execução da função diária...
📊 URL do gráfico: https://seusite.com/api/generate-chart-image
🔄 Capturando gráfico...
❌ Erro ao capturar o gráfico
   Status: 404 Not Found
   Detalhes: Endpoint não encontrado
📧 Enviando alerta de erro para admin@empresa.com...
✅ Alerta de erro enviado com sucesso
```

Ou:

```
❌ Erro ao enviar o e-mail
   Status: 500 Internal Server Error
   Detalhes: SMTP connection failed
```

Ou:

```
❌ Erro geral na execução: TypeError: Cannot read property 'arrayBuffer' of undefined
   Stack trace: TypeError: Cannot read property 'arrayBuffer' of undefined
       at file:///src/functions/daily-restore-report/index.ts:95:32
```

## 🔔 Notificações de Erro

Além dos logs, **e-mails de alerta** são enviados automaticamente quando há falhas:

| Tipo de Erro | E-mail de Alerta | Logs no Supabase |
|--------------|------------------|-------------------|
| ❌ Falha ao capturar gráfico | ✅ Sim | ✅ Sim |
| ❌ Falha no envio de e-mail | ✅ Sim | ✅ Sim |
| ❌ Erro crítico geral | ✅ Sim | ✅ Sim |

## 🚀 Deploy

```bash
# 1. Deploy da função
supabase functions deploy daily-restore-report

# 2. Configurar variáveis de ambiente
supabase secrets set EMAIL_TO=admin@empresa.com
supabase secrets set SENDGRID_API_KEY=SG.your_api_key_here
supabase secrets set EMAIL_FROM=noreply@nautilusone.com

# 3. Testar manualmente
curl -X POST "https://your-project.supabase.co/functions/v1/daily-restore-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 4. Verificar logs
supabase functions logs daily-restore-report
```

## 📅 Agendamento (Cron)

Para executar automaticamente todos os dias, adicione ao `supabase/config.toml`:

```toml
[functions.daily-restore-report.schedule]
# Executa todos os dias às 9:00 AM UTC
cron = "0 9 * * *"
```

## 🔧 Variáveis de Ambiente Necessárias

| Variável | Obrigatória | Descrição | Padrão |
|----------|-------------|-----------|--------|
| `EMAIL_TO` | ✅ Sim | Email do administrador | `admin@empresa.com` |
| `SENDGRID_API_KEY` | ✅ Sim | Chave API do SendGrid para alertas | - |
| `EMAIL_FROM` | ⚠️ Recomendado | Email remetente | `noreply@nautilusone.com` |
| `SITE_URL` | ⚠️ Recomendado | URL base do site | Auto-detectado |

## ✅ Funcionalidades Implementadas

| Funcionalidade | Status | Descrição |
|----------------|--------|-----------|
| 📋 Logging detalhado | ✅ | Todos os passos registrados |
| 🟢 Log de início | ✅ | "Iniciando execução da função diária..." |
| 📊 Log de captura | ✅ | Status e tamanho da imagem |
| 📧 Log de envio | ✅ | Confirmação de e-mail enviado |
| ❌ Log de erros | ✅ | Erros detalhados com stack trace |
| 🔔 Alertas por e-mail | ✅ | E-mails automáticos em caso de falha |
| 📍 Localização de logs | ✅ | Supabase Console > Logs > Functions |

## 🧪 Teste Rápido

### 1. Teste Local
```bash
supabase functions serve daily-restore-report
curl -X POST http://localhost:54321/functions/v1/daily-restore-report
```

### 2. Verificar Logs
```bash
supabase functions logs daily-restore-report --tail
```

### 3. Teste em Produção
```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/daily-restore-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## 🐛 Troubleshooting

### Não vejo logs no Supabase

**Solução**: 
- Espere alguns segundos após a execução
- Atualize a página de logs
- Verifique se a função foi realmente executada

### E-mails de alerta não são enviados

**Solução**:
```bash
# Verificar se SENDGRID_API_KEY está configurado
supabase secrets list | grep SENDGRID

# Se não estiver, configurar
supabase secrets set SENDGRID_API_KEY=SG.your_key_here
```

### Erro "Endpoint não encontrado"

**Solução**:
- Verifique se `/api/generate-chart-image` existe
- Configure `SITE_URL` corretamente:
  ```bash
  supabase secrets set SITE_URL=https://seusite.com
  ```

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [`supabase/functions/daily-restore-report/README.md`](supabase/functions/daily-restore-report/README.md) - Documentação completa
- [`supabase/functions/daily-restore-report/index.ts`](supabase/functions/daily-restore-report/index.ts) - Código fonte

## 🎉 Conclusão

Agora você tem:

| Log | Destino | Status |
|-----|---------|--------|
| 📋 Execução detalhada | Supabase Console > Logs | ✅ |
| 📧 Notificação de falha | E-mail (SendGrid) | ✅ |

**Todos os logs ficam visíveis no painel do Supabase!** 🎊
