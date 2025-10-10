# 📧 Weekly Report Cron - Email Alert System

## Visão Geral

Este sistema automatiza a geração e envio de relatórios semanais de CI/CD por e-mail. O script `weekly-report-cron.js` busca dados de testes do Supabase, gera um PDF com relatório visual e envia por e-mail para a equipe.

## 🎯 Funcionalidades

- ✅ Busca automática de dados de teste do Supabase
- 📊 Geração de relatório PDF visualmente atraente
- 📧 Envio automático por e-mail com SMTP
- 📈 Estatísticas resumidas (total, sucessos, falhas, cobertura média)
- 📋 Tabela detalhada de histórico de builds
- 🎨 Design profissional com CSS inline

## 📦 Dependências

Todas as dependências necessárias já estão instaladas:
- `nodemailer` - Para envio de e-mails
- `jspdf` - Para geração de PDFs
- `html2canvas` - Para conversão de HTML em imagem
- `jsdom` - Para manipulação de DOM no Node.js
- `dotenv` - Para carregar variáveis de ambiente

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no arquivo `.env`:

```env
# === OBRIGATÓRIAS ===

# Credenciais de e-mail
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha_ou_app_password

# URL e chave do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase

# === OPCIONAIS (com valores padrão) ===

# Configurações SMTP (padrão: Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Remetente e destinatário
EMAIL_FROM=relatorios@yourdomain.com
EMAIL_TO=equipe@yourdomain.com
```

### 2. Configuração do Gmail

Se usar Gmail, você precisa:
1. Ativar "Verificação em duas etapas" na sua conta Google
2. Gerar uma "Senha de app" específica: https://myaccount.google.com/apppasswords
3. Usar essa senha de app no `EMAIL_PASS`

### 3. Configuração de Outros Provedores SMTP

Para outros provedores, configure:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=sua_api_key_do_sendgrid
```

**Amazon SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=suas_credenciais_smtp
EMAIL_PASS=sua_senha_smtp
```

## 🚀 Uso

### Executar Manualmente

```bash
npm run weekly-report
```

Ou diretamente:

```bash
node scripts/weekly-report-cron.js
```

### Output Esperado

```
🚀 Iniciando geração de relatório semanal...

📡 Conectando ao Supabase...
✅ 45 registros recuperados do Supabase
📄 Gerando HTML do relatório...
🎨 Convertendo HTML para PDF...
✅ PDF gerado com sucesso (256.34 KB)
📧 Enviando email...
✅ Relatório enviado com sucesso para: equipe@yourdomain.com

✅ Relatório enviado com sucesso!
📊 Resumo:
   - Total de registros: 45
   - Sucessos: 38
   - Falhas: 7
   - Enviado para: equipe@yourdomain.com
```

## ⏰ Agendamento Automático

### Opção 1: GitHub Actions

Crie o arquivo `.github/workflows/weekly-report.yml`:

```yaml
name: Weekly CI/CD Report

on:
  schedule:
    # Executa toda segunda-feira às 9:00 UTC (6:00 BRT)
    - cron: '0 9 * * 1'
  workflow_dispatch: # Permite execução manual

jobs:
  send-report:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout código
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Gerar e enviar relatório
        env:
          EMAIL_USER: ${{ secrets.EMAIL_USER }}
          EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
          EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
        run: npm run weekly-report
```

**Configurar Secrets no GitHub:**
1. Vá em Settings > Secrets and variables > Actions
2. Adicione os secrets necessários

### Opção 2: Vercel Cron

Crie o arquivo `api/cron/weekly-report.js`:

```javascript
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req, res) {
  // Verificar autorização (recomendado)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Executar script
    const scriptPath = path.join(process.cwd(), 'scripts', 'weekly-report-cron.js');
    const child = spawn('node', [scriptPath], {
      env: process.env,
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      console.error('stderr:', data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        res.status(200).json({ 
          success: true, 
          message: 'Relatório enviado com sucesso',
          output 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Erro ao enviar relatório',
          code 
        });
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
```

Configure no `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/weekly-report",
    "schedule": "0 9 * * 1"
  }]
}
```

### Opção 3: Cron Job no Servidor

No servidor Linux/Unix, adicione ao crontab:

```bash
# Editar crontab
crontab -e

# Adicionar linha (executa toda segunda às 9:00)
0 9 * * 1 cd /caminho/do/projeto && npm run weekly-report >> /var/log/weekly-report.log 2>&1
```

## 📊 Formato do Relatório

O relatório PDF inclui:

### Cabeçalho
- Título e logo
- Data de geração
- Nome do projeto

### Cards de Resumo
- Total de testes executados
- Número de sucessos
- Número de falhas
- Cobertura média de código

### Tabela Detalhada
- Hash do commit (7 caracteres)
- Branch
- Status (✅/❌)
- Percentual de cobertura
- Quem executou
- Data e hora

### Rodapé
- Data/hora de geração
- Informações de copyright

## 🔍 Troubleshooting

### Erro: SUPABASE_KEY não configurado
```bash
❌ ERRO: SUPABASE_KEY não configurado no .env
```
**Solução:** Adicione `SUPABASE_KEY` no arquivo `.env`

### Erro: EMAIL_USER ou EMAIL_PASS não configurados
```bash
❌ ERRO: EMAIL_USER ou EMAIL_PASS não configurados no .env
```
**Solução:** Configure as credenciais de e-mail no `.env`

### Erro: Invalid login
```bash
❌ Erro ao enviar email: Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solução:** 
- Para Gmail: Use senha de app, não a senha normal
- Verifique se as credenciais estão corretas
- Certifique-se de que o SMTP está habilitado

### Erro: Connection timeout
```bash
❌ Erro ao enviar email: Error: Connection timeout
```
**Solução:**
- Verifique se a porta está correta (587 para TLS, 465 para SSL)
- Verifique se o firewall permite conexões SMTP
- Tente outro provedor SMTP

### Nenhum dado disponível
```bash
⚠️ Nenhum dado disponível para relatório. Abortando...
```
**Solução:** 
- Verifique se a tabela `test_results` tem dados
- Confirme que a conexão com Supabase está funcionando
- Execute alguns testes para popular a tabela

## 🧪 Testando o Sistema

### 1. Teste Manual
```bash
# Criar arquivo .env.test com configurações de teste
cp .env.example .env.test

# Editar e configurar
nano .env.test

# Executar com arquivo de teste
ENV_FILE=.env.test npm run weekly-report
```

### 2. Inserir Dados de Teste no Supabase
```sql
-- Inserir dados de exemplo na tabela test_results
INSERT INTO test_results (commit_hash, branch, status, coverage_percent, triggered_by)
VALUES 
  ('abc1234', 'main', 'success', 85, 'github-actions'),
  ('def5678', 'develop', 'success', 82, 'developer1'),
  ('ghi9012', 'feature/new', 'failure', 75, 'developer2');
```

### 3. Verificar Logs
```bash
# Ver saída detalhada
npm run weekly-report 2>&1 | tee weekly-report.log
```

## 📝 Personalização

### Modificar Template HTML
Edite a função `formatarHTMLRelatorio()` em `scripts/weekly-report-cron.js` para customizar:
- Cores e estilo CSS
- Estrutura da tabela
- Cards de resumo
- Rodapé

### Adicionar Mais Métricas
Modifique a query do Supabase para incluir mais dados:
```javascript
const res = await fetch(
  `${SUPABASE_URL}/rest/v1/test_results?select=*,builds(*)&order=created_at.desc&limit=100`,
  // ...
);
```

### Múltiplos Destinatários
```env
EMAIL_TO=equipe@yourdomain.com,gerente@yourdomain.com,dev@yourdomain.com
```

## 📚 Recursos Adicionais

- [Nodemailer Documentation](https://nodemailer.com/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

## 🤝 Suporte

Para problemas ou dúvidas:
1. Verifique os logs de erro
2. Consulte a seção de troubleshooting
3. Teste manualmente primeiro
4. Abra uma issue no repositório

## 📄 Licença

Este script faz parte do projeto Nautilus One - Travel HR Buddy.
