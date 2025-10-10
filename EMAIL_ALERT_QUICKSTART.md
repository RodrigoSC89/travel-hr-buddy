# Email Alert Cron - Quick Reference

## 🚀 Início Rápido

### Instalação
As dependências já estão instaladas. Se precisar reinstalar:
```bash
npm install
```

### Configuração Mínima
Crie um arquivo `.env` com:
```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_aqui

# Email (Gmail)
EMAIL_USER=seu@gmail.com
EMAIL_PASS=sua_senha_de_app_do_gmail
EMAIL_TO=destinatario@example.com
```

### Executar
```bash
npm run weekly-report
```

## 📋 Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run weekly-report` | Gera e envia relatório semanal por email |

## 🔧 Configurações Gmail

1. Acesse https://myaccount.google.com/apppasswords
2. Gere uma senha de app para "Mail"
3. Use essa senha no `EMAIL_PASS` do `.env`

## 📚 Documentação Completa

Consulte [WEEKLY_REPORT_SETUP.md](./WEEKLY_REPORT_SETUP.md) para:
- Configuração detalhada
- Agendamento automático (GitHub Actions, Vercel Cron, Cron Job)
- Troubleshooting
- Personalização do relatório

## 🤖 Automação

O workflow `weekly-report.yml` está configurado para executar automaticamente toda segunda às 9:00 UTC.

Para usar, configure os seguintes secrets no GitHub:
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`
- `VITE_SUPABASE_URL`
- `SUPABASE_KEY`

## 📊 O que o Relatório Contém

- Total de testes executados
- Número de sucessos e falhas
- Cobertura média de código
- Tabela detalhada com histórico de builds
- Formato: PDF anexado ao email

## 🐛 Problemas Comuns

**"SUPABASE_KEY não configurado"**
→ Adicione `SUPABASE_KEY` no `.env`

**"EMAIL_USER ou EMAIL_PASS não configurados"**
→ Configure credenciais de email no `.env`

**"Invalid login"** (Gmail)
→ Use senha de app, não a senha normal
→ Ative verificação em 2 etapas primeiro
