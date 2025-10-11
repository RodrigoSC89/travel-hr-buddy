# Daily Restore Report Edge Function

## 📋 Visão Geral

Esta função Edge do Supabase executa automaticamente o envio diário de relatórios de restauração com gráficos. A função captura uma imagem do gráfico de análise e envia por e-mail para o administrador configurado.

## ✨ Características

- ✅ **Logging Detalhado**: Todos os passos são registrados no painel do Supabase
- ✅ **Alertas de Erro**: Envia e-mails automáticos quando ocorrem falhas
- ✅ **Tratamento de Erros Robusto**: Captura e registra todos os tipos de erros
- ✅ **Execução Agendada**: Pode ser configurada para executar diariamente via cron
- ✅ **Monitoramento Fácil**: Logs visíveis em Supabase Dashboard → Logs → Edge Functions

## 🔧 Configuração

### Variáveis de Ambiente

Configure estas variáveis no Supabase Dashboard → Project Settings → Edge Functions → Environment Variables:

```bash
# Obrigatório - Email do administrador
EMAIL_TO=admin@empresa.com

# Ou use ADMIN_EMAIL como alternativa
ADMIN_EMAIL=admin@empresa.com

# Obrigatório - Chave API do SendGrid para alertas de erro
SENDGRID_API_KEY=SG.your_api_key_here

# Opcional - Email remetente (padrão: noreply@nautilusone.com)
EMAIL_FROM=noreply@nautilusone.com

# Opcional - URL do site (padrão: auto-detectado)
SITE_URL=https://seusite.com

# Opcional - URL do Supabase (geralmente auto-detectado)
VITE_SUPABASE_URL=https://your-project.supabase.co
```

### Deploy da Função

```bash
# Instalar Supabase CLI (se necessário)
npm install -g supabase

# Login no Supabase
supabase login

# Conectar ao projeto
supabase link --project-ref your-project-ref

# Deploy da função
supabase functions deploy daily-restore-report

# Configurar secrets
supabase secrets set EMAIL_TO=admin@empresa.com
supabase secrets set SENDGRID_API_KEY=SG.your_api_key_here
supabase secrets set EMAIL_FROM=noreply@nautilusone.com
```

## 📅 Agendamento com Cron

### Opção 1: Supabase Cron (Recomendado)

Configure no arquivo `supabase/config.toml`:

```toml
[functions.daily-restore-report.schedule]
# Executa todos os dias às 9:00 AM UTC
cron = "0 9 * * *"
```

### Opção 2: Serviço Externo de Cron

Use serviços como:
- **Cron-job.org**: https://cron-job.org
- **EasyCron**: https://www.easycron.com
- **GitHub Actions**: Workflow agendado

Exemplo de GitHub Actions (`.github/workflows/daily-report.yml`):

```yaml
name: Daily Restore Report
on:
  schedule:
    - cron: '0 9 * * *'  # 9:00 AM UTC diariamente
  workflow_dispatch:  # Permite execução manual

jobs:
  send-report:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Edge Function
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/daily-restore-report" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Opção 3: Vercel Cron Jobs

Se hospedado no Vercel, adicione ao `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/trigger-daily-report",
    "schedule": "0 9 * * *"
  }]
}
```

## 📊 Logs e Monitoramento

### Onde Ver os Logs

1. Acesse o **Supabase Dashboard**
2. Vá para **Logs** no menu lateral
3. Filtre por **Edge Functions**
4. Selecione **daily-restore-report**

### Tipos de Logs

#### ✅ Logs de Sucesso

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

#### ❌ Logs de Erro

```
🟢 Iniciando execução da função diária...
📅 Data/Hora: 2025-10-11T09:00:00.000Z
📊 URL do gráfico: https://seusite.com/api/generate-chart-image
🔄 Capturando gráfico...
❌ Erro ao capturar o gráfico
   Status: 404 Not Found
   Detalhes: Endpoint não encontrado
📧 Enviando alerta de erro para admin@empresa.com...
✅ Alerta de erro enviado com sucesso
```

#### ⚠️ Logs de Erro Crítico

```
🟢 Iniciando execução da função diária...
❌ Erro geral na execução: TypeError: Cannot read property 'arrayBuffer' of undefined
   Stack trace: TypeError: Cannot read property 'arrayBuffer' of undefined
       at file:///src/functions/daily-restore-report/index.ts:95:32
📧 Enviando alerta de erro para admin@empresa.com...
✅ Alerta de erro enviado com sucesso
```

## 🔔 Alertas de Erro por E-mail

Quando ocorre um erro, a função envia automaticamente um e-mail de alerta com:

- **Assunto**: Tipo de erro (ex: "❌ Falha ao capturar gráfico")
- **Conteúdo**: 
  - Data/Hora do erro
  - Nome da função
  - Mensagem de erro detalhada
  - Stack trace (se disponível)
  - Link para verificar logs no Supabase

### Tipos de Alertas

1. **❌ Falha ao capturar gráfico**: Quando a URL do gráfico não responde ou retorna erro
2. **❌ Falha no envio de relatório**: Quando o e-mail não pode ser enviado
3. **❌ Erro crítico na função Edge**: Erros inesperados ou exceções não tratadas

## 🧪 Testes

### Teste Manual

```bash
# Testar localmente
supabase functions serve daily-restore-report

# Chamar a função
curl -X POST http://localhost:54321/functions/v1/daily-restore-report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Teste em Produção

```bash
# Chamar função em produção
curl -X POST "https://your-project.supabase.co/functions/v1/daily-restore-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Verificar Logs

```bash
# Ver logs em tempo real
supabase functions logs daily-restore-report --tail

# Ver últimos logs
supabase functions logs daily-restore-report
```

## 🔒 Segurança

- ✅ **CORS Configurado**: Permite chamadas do frontend
- ✅ **Autenticação**: Requer token válido do Supabase
- ✅ **Credenciais Protegidas**: Todas as chaves em variáveis de ambiente
- ✅ **Logs Estruturados**: Não expõem informações sensíveis
- ⚠️ **Rate Limiting**: Considere adicionar em produção

## 🐛 Troubleshooting

### Problema: "EMAIL_TO não configurado"

**Solução**:
```bash
supabase secrets set EMAIL_TO=admin@empresa.com
# ou
supabase secrets set ADMIN_EMAIL=admin@empresa.com
```

### Problema: "SENDGRID_API_KEY não configurado"

**Solução**:
```bash
# Criar conta no SendGrid: https://sendgrid.com
# Obter API Key em Settings → API Keys
supabase secrets set SENDGRID_API_KEY=SG.your_key_here
```

### Problema: "Falha ao capturar gráfico - 404"

**Possíveis causas**:
1. Endpoint `/api/generate-chart-image` não existe
2. URL do site incorreta
3. Serviço não está rodando

**Solução**:
```bash
# Verificar se o endpoint existe
curl https://seusite.com/api/generate-chart-image

# Configurar URL correta
supabase secrets set SITE_URL=https://seusite.com
```

### Problema: "Falha no envio de e-mail"

**Possíveis causas**:
1. Endpoint `/api/send-restore-report` não existe
2. Serviço de e-mail não configurado

**Solução**:
- Usar a função Edge `send-chart-report` existente
- Ou criar endpoint `/api/send-restore-report`

### Problema: Alertas de erro não são enviados

**Solução**:
```bash
# Verificar se SENDGRID_API_KEY está configurado
supabase secrets list

# Testar SendGrid API diretamente
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_SENDGRID_KEY" \
  -H "Content-Type: application/json" \
  -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@test.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
```

## 📈 Métricas e Performance

### Métricas Monitoradas

- **Tempo de Execução**: Geralmente < 10 segundos
- **Tamanho da Imagem**: Tipicamente 100-500 KB
- **Taxa de Sucesso**: Deve ser > 95%
- **Alertas Enviados**: Todos os erros geram alertas

### Verificar Métricas

No Supabase Dashboard:
1. Vá para **Edge Functions**
2. Selecione **daily-restore-report**
3. Veja:
   - Invocações totais
   - Taxa de erro
   - Tempo médio de execução
   - Logs detalhados

## 🔄 Fluxo de Execução

```
1. 🟢 Função inicia
   ↓
2. 📊 Captura gráfico da URL
   ↓
   ├─ ✅ Sucesso → Converte para base64
   │                ↓
   │              3. 📧 Envia e-mail
   │                ↓
   │                ├─ ✅ Sucesso → Retorna 200
   │                └─ ❌ Erro → Envia alerta, retorna 500
   │
   └─ ❌ Erro → Envia alerta, retorna 500
```

## 📚 Referências

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Cron Jobs](https://supabase.com/docs/guides/functions/schedule-functions)
- [SendGrid API](https://docs.sendgrid.com/api-reference/mail-send/mail-send)
- [Deno Deploy](https://deno.com/deploy/docs)

## 🆘 Suporte

Se você encontrar problemas:

1. Verifique os logs no Supabase Dashboard
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste a função manualmente com `curl`
4. Verifique se os endpoints `/api/generate-chart-image` e `/api/send-restore-report` existem
5. Consulte a documentação da função `send-chart-report` para integração

## ✅ Checklist de Deploy

- [ ] Função criada em `supabase/functions/daily-restore-report/`
- [ ] Deploy realizado: `supabase functions deploy daily-restore-report`
- [ ] Variáveis configuradas: `EMAIL_TO`, `SENDGRID_API_KEY`, `EMAIL_FROM`
- [ ] Teste manual executado com sucesso
- [ ] Logs verificados no Supabase Dashboard
- [ ] Cron job configurado (diário)
- [ ] E-mail de teste recebido
- [ ] Alerta de erro testado (opcional)
- [ ] Documentação revisada

## 📝 Notas Adicionais

- A função usa SendGrid para enviar alertas de erro por e-mail
- Logs detalhados ajudam na depuração e monitoramento
- Configure a função para rodar diariamente via cron
- Monitore os logs regularmente para identificar problemas
- Considere adicionar métricas personalizadas para análise avançada
