# 📧 Daily Restore Report - Supabase Edge Function

## Visão Geral

Esta Edge Function gera automaticamente um relatório diário de restaurações de documentos, incluindo:
- 📊 Gráfico de restaurações por dia (últimos 15 dias)
- 📈 Estatísticas resumidas (total, documentos únicos, média diária)
- 📧 Envio automático por email

## Funcionalidades

✅ **Geração Automática de Gráficos**
- Cria um gráfico SVG das restaurações dos últimos 15 dias
- Formato visual atraente com gradientes e cores

✅ **Estatísticas Completas**
- Total de restaurações
- Documentos únicos restaurados
- Média diária de restaurações

✅ **Email Profissional**
- Template HTML responsivo
- Versão em texto plano
- Gráfico embutido como imagem inline

✅ **Execução Agendada**
- Configurado via cron.yaml
- Executa diariamente às 08:00 UTC (05:00 horário de Brasília)

## Arquivos

```
supabase/functions/daily-restore-report/
├── index.ts      # Implementação da função
├── cron.yaml     # Configuração do agendamento
└── README.md     # Esta documentação
```

## Configuração

### Pré-requisitos

1. **Supabase CLI instalado**
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase**
   ```bash
   supabase login
   ```

3. **Projeto inicializado**
   ```bash
   supabase init
   ```

### Variáveis de Ambiente

Configure no Supabase Dashboard → Project Settings → Edge Functions → Secrets:

```bash
# Obrigatórias
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (obrigatórias para envio)
EMAIL_USER=your@email.com
EMAIL_PASS=your_password_or_app_password
EMAIL_HOST=smtp.gmail.com        # opcional, padrão: smtp.gmail.com
EMAIL_PORT=587                    # opcional, padrão: 587
EMAIL_FROM=noreply@nautilusone.com  # opcional
EMAIL_TO=admin@empresa.com       # opcional

# App URL (opcional, para links no email)
VITE_APP_URL=https://your-app.vercel.app
```

### Deploy

#### Método 1: Usar o Script Automatizado (Recomendado)

```bash
# Tornar o script executável
chmod +x scripts/setup-restore-cron.sh

# Executar o script
./scripts/setup-restore-cron.sh
```

O script irá:
1. ✅ Verificar se os arquivos necessários existem
2. 📦 Fazer deploy da função
3. ⏰ Configurar o cron job
4. ✅ Confirmar o sucesso

#### Método 2: Deploy Manual

```bash
# Deploy da função
supabase functions deploy daily-restore-report

# Configurar agendamento
supabase functions schedule daily-restore-report

# Verificar agendamentos
supabase functions list
```

### Configurar Variáveis de Ambiente

```bash
# Via CLI
supabase secrets set EMAIL_USER=your@email.com
supabase secrets set EMAIL_PASS=your_password
supabase secrets set EMAIL_FROM=noreply@nautilusone.com
supabase secrets set EMAIL_TO=admin@empresa.com

# Via Dashboard (recomendado para múltiplas variáveis)
# Acesse: Project Settings → Edge Functions → Environment Variables
```

## Uso

### Execução Automática (Cron)

Após o deploy e configuração do schedule, a função será executada automaticamente:
- **Horário:** 08:00 UTC (05:00 horário de Brasília)
- **Frequência:** Diariamente
- **Ação:** Gera relatório e prepara email

### Execução Manual

#### Via CLI

```bash
# Invocar a função manualmente
supabase functions invoke daily-restore-report
```

#### Via HTTP

```bash
curl -X POST \
  "https://your-project.supabase.co/functions/v1/daily-restore-report" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

#### Via Dashboard

1. Acesse Supabase Dashboard
2. Vá para Edge Functions → daily-restore-report
3. Clique em "Invoke"

### Teste Local

```bash
# Servir a função localmente
supabase functions serve daily-restore-report

# Em outro terminal, testar
curl -X POST http://localhost:54321/functions/v1/daily-restore-report \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Resposta da API

### Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Daily restore report generated successfully",
  "summary": {
    "total": 42,
    "unique_docs": 15,
    "avg_per_day": 2.8
  },
  "dataPoints": 15,
  "recipient": "admin@empresa.com",
  "timestamp": "2025-10-11T08:00:00.000Z",
  "note": "To complete email sending, integrate with SendGrid, Mailgun, AWS SES, or configure SMTP"
}
```

### Erro (500)

```json
{
  "error": "Error message",
  "details": "Detailed error description"
}
```

## Formato do Email

### HTML

O email HTML inclui:
- 🎨 Header com gradiente roxo
- 📊 Cards com estatísticas principais
- 📈 Gráfico SVG embutido
- 💡 Seção explicativa
- 🔗 Link para o dashboard
- 📝 Footer com informações

### Texto Plano

Versão simplificada com:
- Estatísticas principais
- Mensagem explicativa
- Informações de copyright

## Integrações de Email

A função atualmente **prepara** o email mas requer integração com um serviço de email para envio real.

### Opções Recomendadas

#### 1. SendGrid (Mais Popular)
```typescript
// Adicionar no index.ts
const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${SENDGRID_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ /* email data */ }),
});
```

#### 2. Resend (Moderna e Simples)
```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ /* email data */ }),
});
```

#### 3. Mailgun
```typescript
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY");
const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN");
// Implementar conforme API do Mailgun
```

## Funções RPC Utilizadas

A Edge Function utiliza duas funções RPC do Supabase:

### 1. `get_restore_count_by_day_with_email`
- **Retorna:** Lista de contagens por dia
- **Parâmetros:** `email_input` (string, pode ser vazio)
- **Período:** Últimos 15 dias
- **Formato:** `{day: date, count: int}[]`

### 2. `get_restore_summary`
- **Retorna:** Estatísticas resumidas
- **Parâmetros:** `email_input` (string, pode ser vazio)
- **Formato:** `{total: int, unique_docs: int, avg_per_day: numeric}[]`

Essas funções são criadas pela migration `20251011172000_create_restore_dashboard_functions.sql`.

## Monitoramento

### Logs

```bash
# Ver logs da função
supabase functions logs daily-restore-report

# Ver logs em tempo real
supabase functions logs daily-restore-report --follow
```

### Dashboard do Supabase

1. Acesse Edge Functions no Dashboard
2. Selecione `daily-restore-report`
3. Visualize:
   - Últimas execuções
   - Logs de erro
   - Performance
   - Invocações

## Troubleshooting

### ❌ "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"

**Solução:** Configure as variáveis de ambiente no Supabase Dashboard ou via CLI.

### ❌ "EMAIL_USER and EMAIL_PASS must be configured"

**Solução:** 
1. Configure EMAIL_USER e EMAIL_PASS
2. Para Gmail, use uma App Password (não a senha normal)

### ❌ "Error fetching restore count"

**Solução:**
1. Verifique se as migrations das funções RPC foram executadas
2. Confirme se a tabela `document_restore_logs` existe
3. Verifique permissões do service role key

### ⚠️ "Email prepared but not sent"

**Situação:** Normal no setup inicial
**Solução:** Integre com um serviço de email (SendGrid, Resend, etc.)

### 🐌 Função lenta

**Possíveis causas:**
- Muitos dados na tabela de logs
- Limite das migrations (15 dias é adequado)
- Geração do SVG para muitos pontos

**Solução:** Os limites atuais (15 dias) são adequados para performance.

## Segurança

✅ **Autenticação:** Usa Service Role Key (não exposta ao frontend)
✅ **CORS:** Configurado para permitir apenas origens necessárias
✅ **Variáveis:** Todas as credenciais em environment, não no código
✅ **RPC Functions:** Usam SECURITY DEFINER para controle de acesso
✅ **Email:** Validação de configurações antes do envio

## Manutenção

### Alterar Horário de Execução

Edite `cron.yaml`:
```yaml
# Para 09:00 UTC
schedule: "0 9 * * *"

# Para executar de hora em hora
schedule: "0 * * * *"

# Apenas dias úteis às 08:00 UTC
schedule: "0 8 * * 1-5"
```

Depois faça redeploy:
```bash
supabase functions deploy daily-restore-report
supabase functions schedule daily-restore-report
```

### Atualizar Template de Email

1. Edite a função `buildEmailHtml()` no `index.ts`
2. Faça redeploy: `supabase functions deploy daily-restore-report`

### Modificar Período de Dados

Altere a migration `20251011172000_create_restore_dashboard_functions.sql`:
```sql
-- Exemplo: últimos 30 dias
LIMIT 30
```

## Relacionados

- 📊 [Restore Dashboard](../../../src/pages/admin/documents/restore-dashboard.tsx)
- 📝 [Restore Logs](../../../src/pages/admin/documents/restore-logs.tsx)
- 🔄 [Document Versioning](../../../DOCUMENT_VERSIONING_GUIDE.md)
- 📧 [Weekly Report Cron](../../../scripts/weekly-report-cron.js)

## Status do Projeto

| Componente | Status | Notas |
|------------|--------|-------|
| Edge Function | ✅ Implementada | Gerando relatórios e charts |
| Cron Schedule | ✅ Configurado | Diário às 08:00 UTC |
| Geração de Gráficos | ✅ SVG inline | Alta performance |
| Email Preparation | ✅ HTML + Text | Template profissional |
| Email Sending | ⚠️ Pendente | Requer integração com serviço |
| Documentação | ✅ Completa | Este README |
| Script de Setup | ✅ Disponível | `setup-restore-cron.sh` |

## Licença

© 2025 Nautilus One - Travel HR Buddy
