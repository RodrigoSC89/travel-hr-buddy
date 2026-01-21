# 🔧 Supabase Setup Guide - NAUTI ONE v4.0

> **⚠️ OBRIGATÓRIO:** Estas configurações DEVEM ser aplicadas manualmente no Supabase Dashboard antes do deploy em produção.

## 📋 Checklist Rápido

- [ ] Site URL configurado
- [ ] Redirect URLs configuradas (7 URLs)
- [ ] Leaked Password Protection ativado
- [ ] OAuth providers configurados (opcional)
- [ ] Edge Functions secrets adicionados

---

## 1. Configuração de URLs de Autenticação

### Acesse:
🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/url-configuration

### Site URL
```
https://nautione.com.br
```

### Redirect URLs (adicionar todas)
```
https://nautione.com.br
https://nautione.com.br/**
https://www.nautione.com.br/**
https://id-preview--ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovable.app
https://id-preview--ead06aad-a7d4-45d3-bdf7-e23796c6ac50.lovable.app/**
https://travel-hr-buddy.lovable.app
https://travel-hr-buddy.lovable.app/**
http://localhost:5173
http://localhost:5173/**
```

> **Nota:** O padrão `/**` permite qualquer path após o domínio, necessário para callbacks de OAuth e deep links.

---

## 2. Leaked Password Protection

### Acesse:
🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers

### Passos:
1. Role até **"Security"** ou **"Leaked Password Protection"**
2. Toggle para **ON**
3. Clique em **Save**

> **⚠️ CRÍTICO:** Sem isso, usuários podem usar senhas comprometidas em vazamentos de dados.

---

## 3. OAuth Providers (Opcional)

### Google OAuth

🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/providers

1. **Google Cloud Console:**
   - Acesse https://console.cloud.google.com
   - Crie um projeto ou selecione existente
   - Vá em **APIs & Services > Credentials**
   - Crie **OAuth 2.0 Client ID**
   - Adicione as Redirect URIs:
     ```
     https://vnbptmixvwropvanyhdb.supabase.co/auth/v1/callback
     ```

2. **Supabase Dashboard:**
   - Ative o provider Google
   - Cole Client ID e Client Secret
   - Save

### GitHub OAuth

1. **GitHub Developer Settings:**
   - Acesse https://github.com/settings/developers
   - Crie **OAuth App**
   - Callback URL:
     ```
     https://vnbptmixvwropvanyhdb.supabase.co/auth/v1/callback
     ```

2. **Supabase Dashboard:**
   - Ative o provider GitHub
   - Cole Client ID e Client Secret
   - Save

### Microsoft/Azure OAuth

1. **Azure Portal:**
   - Acesse https://portal.azure.com
   - App registrations > New registration
   - Redirect URI:
     ```
     https://vnbptmixvwropvanyhdb.supabase.co/auth/v1/callback
     ```

2. **Supabase Dashboard:**
   - Ative o provider Azure
   - Cole Client ID e Client Secret
   - Save

---

## 4. Edge Functions Secrets

### Acesse:
🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/settings/functions

### Secrets Obrigatórios:
```
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
ELEVENLABS_API_KEY=...
```

### Secrets Opcionais:
```
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
SENDGRID_API_KEY=...
STRIPE_SECRET_KEY=sk_live_...
MARINE_TRAFFIC_API_KEY=...
STORMGLASS_API_KEY=...
DOCUSIGN_INTEGRATION_KEY=...
```

---

## 5. Configurações de Email

### Acesse:
🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/templates

### Templates Recomendados:

**Confirm Email:**
```
Olá,

Clique no link abaixo para confirmar seu email no NAUTI ONE:

{{ .ConfirmationURL }}

Se você não criou esta conta, ignore este email.

Equipe NAUTI ONE
```

**Reset Password:**
```
Olá,

Clique no link abaixo para redefinir sua senha:

{{ .ConfirmationURL }}

Este link expira em 24 horas.

Equipe NAUTI ONE
```

---

## 6. Configurações de Segurança Adicionais

### MFA (Multi-Factor Authentication)
🔗 https://supabase.com/dashboard/project/vnbptmixvwropvanyhdb/auth/mfa

1. Ative **TOTP** para autenticação em dois fatores
2. Configure política: **Recommended** ou **Required**

### Rate Limiting
As configurações padrão do Supabase são adequadas para produção.

---

## 7. Verificação Pós-Setup

Execute este checklist após configurar:

```bash
# 1. Teste login com email/senha
# 2. Teste OAuth (Google/GitHub/Microsoft)
# 3. Teste reset de senha
# 4. Verifique Edge Functions funcionando
# 5. Teste em iOS Safari (modo PWA)
```

### Teste de Login iOS PWA:
1. Abra Safari no iPhone
2. Acesse https://nautione.com.br
3. Toque em "Compartilhar" > "Adicionar à Tela Início"
4. Abra o app da tela inicial
5. Tente fazer login

---

## 📞 Troubleshooting

### Erro: "Failed to fetch" no login
1. Verifique se Redirect URLs estão corretas
2. Limpe cache do Safari: Ajustes > Safari > Limpar Histórico
3. Reinstale o PWA

### Erro: "Email not confirmed"
1. Verifique email de confirmação (pode estar em spam)
2. Ou desative confirmação: Auth > Providers > Email > Confirm email OFF (dev only)

### OAuth redireciona para localhost
1. Verifique Client ID/Secret
2. Verifique Redirect URIs no provedor OAuth
3. Verifique Redirect URLs no Supabase

---

## 📊 Status

| Configuração | Status | Responsável |
|-------------|--------|-------------|
| Site URL | ⏳ Pendente | DevOps |
| Redirect URLs | ⏳ Pendente | DevOps |
| Leaked Password | ⏳ Pendente | Security |
| Google OAuth | ⏳ Opcional | DevOps |
| Edge Secrets | ⏳ Pendente | DevOps |

---

*Última atualização: Janeiro 2026*
*Versão: NAUTI ONE v4.0*
