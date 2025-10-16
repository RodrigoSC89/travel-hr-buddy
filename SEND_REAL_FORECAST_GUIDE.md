# 📅 Cron Job: Send Real Forecast

## ✅ Configuração Implementada

O cron job `send-real-forecast` foi configurado para enviar relatórios diários de previsão de manutenção por componente.

### 📁 Arquivos Criados

1. **supabase/functions/cron.yaml** - Configuração de agendamento
2. **supabase/functions/send-real-forecast/index.ts** - Edge Function
3. **supabase/config.toml** - Configuração do Supabase (atualizada)

### ⏰ Agendamento

```yaml
schedule: '0 8 * * *' # Todos os dias às 08:00 UTC (05:00 BRT)
endpoint: '/api/cron/send-real-forecast'
method: GET
```

O cron job executa:
- **Frequência:** Diariamente
- **Horário:** 08:00 UTC (05:00 horário de Brasília)
- **Função:** Gerar e enviar previsão de manutenção via email

## 🚀 Como Fazer o Deploy

### 1. Deploy da Edge Function

Execute o seguinte comando com o CLI do Supabase:

```bash
supabase functions deploy send-real-forecast
```

### 2. Verificar no Painel do Supabase

Acesse o painel do Supabase e navegue para:
- **Edge Functions** > **Cron Jobs**

Você verá o job `send-real-forecast` listado com o agendamento configurado.

### 3. Configurar Variáveis de Ambiente

Certifique-se de que as seguintes variáveis estejam configuradas no Supabase:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
OPENAI_API_KEY=your_openai_api_key
FORECAST_REPORT_EMAILS=email1@example.com,email2@example.com
EMAIL_FROM=noreply@nautilus.system
```

## 🔧 Funcionalidades

A função `send-real-forecast`:

1. 📊 **Coleta dados** dos últimos 6 meses de jobs completados
2. 📈 **Agrupa por componente** e mês
3. 🤖 **Gera previsão IA** usando OpenAI GPT-4
4. 📧 **Envia email** via Resend API
5. 📝 **Registra logs** na tabela `cron_execution_logs`

## 💡 Ajustes Opcionais

### Alterar o Horário

Para alterar o horário de execução, edite o campo `schedule` no arquivo `supabase/functions/cron.yaml`:

```yaml
schedule: '0 10 * * *' # Exemplo: 10:00 UTC
```

Ou no arquivo `supabase/config.toml`:

```toml
schedule = "0 10 * * *"  # Exemplo: 10:00 UTC
```

### Formato Cron

O formato segue o padrão cron:

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Dia da semana (0-7, 0 e 7 = domingo)
│ │ │ └───── Mês (1-12)
│ │ └─────── Dia do mês (1-31)
│ └───────── Hora (0-23)
└─────────── Minuto (0-59)
```

### Exemplos de Agendamento

- `0 8 * * *` - Todos os dias às 08:00 UTC
- `0 8 * * 1` - Toda segunda-feira às 08:00 UTC
- `0 8 1 * *` - Todo dia 1 do mês às 08:00 UTC
- `0 8 * * 1-5` - Segunda a sexta às 08:00 UTC
- `0 */6 * * *` - A cada 6 horas

## 📊 Monitoramento

### Ver Logs de Execução

```sql
SELECT * FROM cron_execution_logs 
WHERE function_name = 'send-real-forecast' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Verificar Status

Os logs incluem:
- ✅ **success** - Execução bem-sucedida
- ⚠️ **warning** - Execução com avisos
- ❌ **error** - Erro recuperável
- 🔴 **critical** - Erro crítico

## 🔍 Solução de Problemas

### Função não está executando

1. Verifique se o deploy foi feito corretamente:
   ```bash
   supabase functions list
   ```

2. Verifique as variáveis de ambiente no painel do Supabase

3. Verifique os logs de execução:
   ```bash
   supabase functions logs send-real-forecast
   ```

### Emails não estão sendo enviados

1. Verifique se `RESEND_API_KEY` está configurado
2. Verifique se `FORECAST_REPORT_EMAILS` contém emails válidos
3. Verifique os logs da função para erros específicos

## 📚 Documentação Adicional

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Formato Cron](https://crontab.guru/)
