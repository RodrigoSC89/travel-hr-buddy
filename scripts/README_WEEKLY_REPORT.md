# 📊 Weekly Report Cron - Email Alert System

Este script automatiza a geração e envio semanal de relatórios de cobertura de testes CI por email.

## 📦 Funcionalidades

- ✅ Acessa dados de testes no Supabase
- ✅ Gera relatório PDF automático com jsPDF
- ✅ Envia por email usando nodemailer (padrão SMTP)
- ✅ Formatação HTML profissional para o relatório
- ✅ Logs detalhados do processo

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Supabase Backend (para scripts)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_secreta

# Configuração de Email
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha
EMAIL_FROM=relatorios@yourdomain.com
EMAIL_TO=equipe@yourdomain.com
```

### 2. Instalação de Dependências

As dependências já foram instaladas com o projeto. Se necessário, instale manualmente:

```bash
npm install nodemailer jsdom node-fetch
npm install --save-dev @types/nodemailer
```

## 🚀 Uso

### Execução Manual

Para executar o script manualmente:

```bash
npm run weekly-report
```

### Agendamento (Cron Job)

#### Opção 1: Cron Unix/Linux

Adicione ao crontab para executar toda segunda-feira às 8h:

```bash
# Editar crontab
crontab -e

# Adicionar linha (executa toda segunda-feira às 8h)
0 8 * * 1 cd /path/to/travel-hr-buddy && npm run weekly-report
```

#### Opção 2: GitHub Actions

Crie `.github/workflows/weekly-report.yml`:

```yaml
name: Weekly CI Report

on:
  schedule:
    # Executa toda segunda-feira às 8h (UTC)
    - cron: '0 8 * * 1'
  workflow_dispatch: # Permite execução manual

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install dependencies
        run: npm install
        
      - name: Generate and send report
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
          EMAIL_HOST: ${{ secrets.EMAIL_HOST }}
          EMAIL_PORT: ${{ secrets.EMAIL_PORT }}
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
        run: npm run weekly-report
```

#### Opção 3: Vercel Cron

Adicione ao `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/weekly-report",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

E crie o endpoint `/api/weekly-report.js` que executa o script.

## 📧 Provedores de Email Suportados

### Gmail

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu@gmail.com
EMAIL_PASS=sua_senha_de_app  # Use App Password, não a senha normal
```

### SendGrid

```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.sua_api_key
```

### Amazon SES

```bash
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=seu_smtp_user
EMAIL_PASS=sua_smtp_password
```

### Mailgun

```bash
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=seu_smtp_user
EMAIL_PASS=sua_smtp_password
```

## 🔐 Segurança

⚠️ **IMPORTANTE**: Nunca commite o arquivo `.env` com credenciais reais!

- Use `.env.example` como template
- Adicione `.env` ao `.gitignore`
- Use secrets do GitHub Actions para CI/CD
- Para Gmail, use [App Passwords](https://support.google.com/accounts/answer/185833)

## 📝 Personalização

### Modificar Template do Email

Edite a seção HTML no arquivo `scripts/weekly-report-cron.js`:

```javascript
const html = `
  <html>
    <head>
      <style>
        /* Adicione seus estilos aqui */
      </style>
    </head>
    <body>
      <!-- Personalize o conteúdo aqui -->
    </body>
  </html>
`;
```

### Alterar Destinatários

Você pode enviar para múltiplos destinatários separando por vírgula:

```bash
EMAIL_TO=equipe@yourdomain.com,gestao@yourdomain.com,dev@yourdomain.com
```

### Alterar Frequência

Ajuste a expressão cron conforme necessário:

- `0 8 * * 1` - Segunda-feira às 8h
- `0 8 * * 5` - Sexta-feira às 8h
- `0 9 * * *` - Diariamente às 9h
- `0 8 1 * *` - Primeiro dia do mês às 8h

## 🧪 Teste

Para testar o script sem enviar email real:

1. Configure um serviço de email de teste como [Mailtrap](https://mailtrap.io/)
2. Use as credenciais do Mailtrap no `.env`
3. Execute `npm run weekly-report`
4. Verifique o email recebido no Mailtrap

## 🐛 Troubleshooting

### Erro: "SUPABASE_KEY não está configurado"

Certifique-se de que a variável `SUPABASE_KEY` está definida no `.env`.

### Erro: "EMAIL_USER e EMAIL_PASS devem estar configurados"

Configure as credenciais de email no `.env`.

### Email não é enviado

1. Verifique se as credenciais estão corretas
2. Para Gmail, use App Password
3. Verifique se a porta está correta (587 para STARTTLS, 465 para SSL)
4. Teste a conectividade SMTP

### Erro ao gerar PDF

Certifique-se de que as dependências `html2canvas` e `jspdf` estão instaladas.

## 📊 Exemplo de Saída

Quando executado com sucesso, você verá:

```
🔄 Buscando dados de testes...
✅ Dados obtidos: 150 registros
📄 Gerando PDF...
📧 Enviando email...
✅ Relatório enviado com sucesso.
```

## 🔄 Próximos Passos

- [ ] Adicionar suporte para múltiplos tipos de relatório
- [ ] Implementar filtros de data customizados
- [ ] Adicionar gráficos mais complexos
- [ ] Suporte para templates personalizados
- [ ] Integração com Slack/Discord
- [ ] Dashboard web para visualizar histórico de relatórios

## 📚 Referências

- [Nodemailer Documentation](https://nodemailer.com/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Supabase API Documentation](https://supabase.com/docs/reference/javascript/introduction)
- [Cron Expression Guide](https://crontab.guru/)
