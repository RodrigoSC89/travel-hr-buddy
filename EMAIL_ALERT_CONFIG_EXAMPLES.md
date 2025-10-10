# 📧 Weekly Report Cron - Configuration Examples

## Table of Contents
1. [Gmail Configuration](#gmail-configuration)
2. [Outlook Configuration](#outlook-configuration)
3. [SendGrid Configuration](#sendgrid-configuration)
4. [Amazon SES Configuration](#amazon-ses-configuration)
5. [Custom SMTP Configuration](#custom-smtp-configuration)
6. [Testing Commands](#testing-commands)

---

## Gmail Configuration

### Step-by-Step Setup

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Configure .env**
```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # App password (16 chars)
EMAIL_FROM=seu-email@gmail.com
EMAIL_TO=destinatario@example.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

### Testing
```bash
npm run weekly-report
```

### Expected Output
```
🚀 Iniciando geração de relatório semanal...
📡 Conectando ao Supabase...
✅ 45 registros recuperados do Supabase
📄 Gerando HTML do relatório...
🎨 Convertendo HTML para PDF...
✅ PDF gerado com sucesso (256.34 KB)
📧 Enviando email...
✅ Relatório enviado com sucesso para: destinatario@example.com
```

---

## Outlook Configuration

### Setup

1. **Get Outlook Credentials**
   - Use your Microsoft account email and password
   - Or generate app password if 2FA is enabled

2. **Configure .env**
```env
# Outlook SMTP Configuration
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua_senha_ou_app_password
EMAIL_FROM=seu-email@outlook.com
EMAIL_TO=destinatario@example.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

### Alternative Ports
```env
# TLS/STARTTLS (recommended)
EMAIL_PORT=587

# SSL
EMAIL_PORT=465
```

---

## SendGrid Configuration

### Setup

1. **Get SendGrid API Key**
   - Sign up at: https://sendgrid.com
   - Create API Key in Settings > API Keys
   - Give it "Mail Send" permission

2. **Configure .env**
```env
# SendGrid SMTP Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey  # Literally the word "apikey"
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Your actual API key
EMAIL_FROM=seu-email-verificado@yourdomain.com
EMAIL_TO=destinatario@example.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

### Important Notes
- ⚠️ **FROM address must be verified** in SendGrid
- Use "apikey" as username (not your email)
- API key is the password

### Verify Sender
1. Go to SendGrid Dashboard > Settings > Sender Authentication
2. Verify your email or domain

---

## Amazon SES Configuration

### Setup

1. **Get SES SMTP Credentials**
   - AWS Console > SES > Account Dashboard
   - Create SMTP Credentials
   - Note the username and password (shown once)

2. **Verify Email/Domain**
   - SES > Email Addresses > Verify New Email Address
   - Or verify entire domain

3. **Configure .env**
```env
# Amazon SES SMTP Configuration
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=AKIAXXXXXXXXXXXXXXXX  # SMTP username
EMAIL_PASS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # SMTP password
EMAIL_FROM=seu-email-verificado@yourdomain.com
EMAIL_TO=destinatario@example.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

### Regional Endpoints
```env
# US East (N. Virginia)
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com

# EU (Ireland)
EMAIL_HOST=email-smtp.eu-west-1.amazonaws.com

# Asia Pacific (Sydney)
EMAIL_HOST=email-smtp.ap-southeast-2.amazonaws.com
```

### Production Mode
- SES starts in "Sandbox" mode (limited to verified addresses)
- Request production access to send to any address

---

## Custom SMTP Configuration

### Generic SMTP Server

```env
# Custom SMTP Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASS=your-password
EMAIL_FROM=from@yourdomain.com
EMAIL_TO=to@example.com

# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_supabase
```

### Common Providers

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
```

#### Postmark
```env
EMAIL_HOST=smtp.postmarkapp.com
EMAIL_PORT=587
EMAIL_USER=your-server-token
EMAIL_PASS=your-server-token  # Same as user
```

#### Brevo (formerly Sendinblue)
```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
```

#### Zoho Mail
```env
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
```

---

## Testing Commands

### 1. Check Script Syntax
```bash
node --check scripts/weekly-report-cron.js
```

### 2. Run Linter
```bash
npm run lint
```

### 3. Run Tests
```bash
npm test src/tests/weekly-report-cron.test.js
```

### 4. Dry Run (with test env)
```bash
# Create test.env
cp .env.example test.env
nano test.env  # Edit with test values

# Run with test env
ENV_FILE=test.env npm run weekly-report
```

### 5. Test with Verbose Output
```bash
npm run weekly-report 2>&1 | tee report-test.log
```

### 6. Test Email Only (no real send)
```javascript
// Temporarily modify script to skip actual sending
// Replace in weekly-report-cron.js:
await transporter.sendMail(mailOptions);

// With:
console.log('Would send email:', mailOptions);
// await transporter.sendMail(mailOptions);
```

---

## GitHub Secrets Configuration

For GitHub Actions automation, add these secrets:

1. Go to: Repository > Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Add each of these:

```yaml
Secrets to Add:
  - EMAIL_HOST: smtp.gmail.com
  - EMAIL_PORT: 587
  - EMAIL_USER: seu@gmail.com
  - EMAIL_PASS: xxxx xxxx xxxx xxxx
  - EMAIL_FROM: seu@gmail.com
  - EMAIL_TO: destinatario@example.com
  - VITE_SUPABASE_URL: https://seu-projeto.supabase.co
  - SUPABASE_KEY: sua_chave_supabase
```

### Verify Secrets
```bash
# Secrets should show as "****" in GitHub
# You cannot view them again after setting
```

---

## Troubleshooting Configuration

### Test Connection to SMTP Server
```bash
# Using telnet (Linux/Mac)
telnet smtp.gmail.com 587

# Using openssl (for SSL)
openssl s_client -connect smtp.gmail.com:465

# Expected: Connection successful
```

### Test DNS Resolution
```bash
nslookup smtp.gmail.com
# Should resolve to IP addresses
```

### Verify Environment Loading
```javascript
// Add to script temporarily:
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
```

### Test Supabase Connection
```bash
curl -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_KEY" \
     "https://your-project.supabase.co/rest/v1/test_results?select=*&limit=1"
```

---

## Multiple Recipients

### Comma-separated
```env
EMAIL_TO=recipient1@example.com,recipient2@example.com,recipient3@example.com
```

### With Display Names
```env
EMAIL_TO=Team <team@example.com>, Manager <manager@example.com>
```

### CC/BCC (requires script modification)
```javascript
const mailOptions = {
  from: EMAIL_FROM,
  to: EMAIL_TO,
  cc: 'cc@example.com',
  bcc: 'bcc@example.com',
  // ... rest of options
};
```

---

## Advanced Configuration

### Custom Schedule (GitHub Actions)
```yaml
# Daily at 9 AM
schedule:
  - cron: '0 9 * * *'

# Weekly on Friday at 5 PM
schedule:
  - cron: '0 17 * * 5'

# First day of month at 8 AM
schedule:
  - cron: '0 8 1 * *'
```

### Environment-Specific Configs
```bash
# Production
cp .env.example .env.production
nano .env.production

# Staging
cp .env.example .env.staging
nano .env.staging

# Run with specific env
ENV_FILE=.env.production npm run weekly-report
```

---

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use app passwords instead of account passwords
3. ✅ Rotate secrets regularly
4. ✅ Use environment-specific credentials
5. ✅ Monitor failed login attempts
6. ✅ Use SSL/TLS for SMTP connections
7. ✅ Restrict GitHub Actions to specific branches
8. ✅ Use least-privilege access for API keys

---

## Configuration Checklist

Before running in production:

- [ ] SMTP credentials configured and tested
- [ ] Supabase URL and key verified
- [ ] Email addresses verified (if using SES/SendGrid)
- [ ] `.env` file excluded from git
- [ ] GitHub Secrets configured (if using Actions)
- [ ] Test email sent successfully
- [ ] Recipients confirmed
- [ ] Schedule verified (if using cron)
- [ ] Error handling tested
- [ ] Logs monitored

---

This configuration guide covers all major email providers and use cases!
