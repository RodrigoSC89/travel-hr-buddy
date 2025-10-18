# 🚀 Guia de Deploy para Produção - Nautilus One

## 📋 Visão Geral

Este guia fornece instruções passo a passo para realizar o deploy do sistema Nautilus One em produção usando Vercel (frontend) e Supabase (backend).

## ✅ Pré-requisitos

### Contas e Serviços
- [ ] Conta Vercel (https://vercel.com)
- [ ] Conta Supabase (https://supabase.com)
- [ ] Repositório GitHub conectado
- [ ] Acesso de administrador ao repositório

### Ferramentas Necessárias
```bash
# Node.js 22.x
node --version

# NPM >= 8.0.0
npm --version

# Git
git --version

# Vercel CLI (opcional para deploy manual)
npm install -g vercel

# Supabase CLI (para configurar Edge Functions)
npm install -g supabase
```

---

## 🔐 Parte 1: Configuração do Supabase

### 1.1 Criar Projeto no Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Configure:
   - **Nome**: nautilus-one-production
   - **Região**: South America (São Paulo) ou mais próxima
   - **Senha do Banco**: Gere uma senha forte e salve em local seguro

### 1.2 Configurar Row Level Security (RLS)

Execute no SQL Editor do Supabase:

```sql
-- Habilitar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para documents
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas similares para outras tabelas...
```

### 1.3 Configurar Storage

1. No Supabase Dashboard, vá para **Storage**
2. Crie os seguintes buckets:
   - `documents` (para PDFs e documentos)
   - `images` (para imagens e fotos)
   - `avatars` (para fotos de perfil)
   - `exports` (para relatórios exportados)

3. Configure políticas de acesso:

```sql
-- Política para bucket documents
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas similares para outros buckets...
```

### 1.4 Deploy das Edge Functions

```bash
# Login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Fazer deploy de todas as functions
supabase functions deploy

# Ou fazer deploy de uma function específica
supabase functions deploy send-chart-report
supabase functions deploy daily-restore-report
supabase functions deploy send-assistant-report
```

### 1.5 Configurar Secrets das Edge Functions

```bash
# OpenAI
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Email/Resend
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set EMAIL_FROM=nautilus@empresa.com

# Mapbox
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...

# OpenWeather
supabase secrets set OPENWEATHER_API_KEY=...

# Listar secrets configurados
supabase secrets list
```

### 1.6 Configurar Cron Jobs

No Supabase Dashboard:
1. Vá para **Edge Functions**
2. Selecione a function desejada
3. Configure o cron schedule:

```yaml
# Exemplo em supabase/functions/cron.yaml
- name: daily-restore-report
  schedule: "0 8 * * *"  # Todo dia às 8h
  
- name: send-assistant-report
  schedule: "0 9 * * 1"  # Segunda-feira às 9h

- name: weekly-metrics
  schedule: "0 10 * * 1"  # Segunda-feira às 10h
```

### 1.7 Obter Credenciais do Supabase

No Dashboard do Supabase:
1. Vá para **Settings** → **API**
2. Copie:
   - **Project URL**: `https://seu-projeto.supabase.co`
   - **anon/public key**: `eyJ...` (começa com eyJ)
   - **service_role key**: `eyJ...` (Use com cuidado, apenas no backend)

---

## 🌐 Parte 2: Configuração do Vercel

### 2.1 Conectar Repositório ao Vercel

1. Acesse https://vercel.com/new
2. Clique em **Import Git Repository**
3. Selecione `RodrigoSC89/travel-hr-buddy`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (deixe padrão)
   - **Build Command**: `npm run build` (já detectado)
   - **Output Directory**: `dist` (já detectado)

### 2.2 Configurar Environment Variables no Vercel

Na tela de configuração do projeto ou em **Settings** → **Environment Variables**, adicione:

#### Variáveis Essenciais (Obrigatórias)

```bash
# === SUPABASE ===
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id

# === SENTRY (Monitoramento) ===
VITE_SENTRY_DSN=https://...@o0.ingest.sentry.io/...
SENTRY_ORG=sua-organizacao
SENTRY_PROJECT=nautilus-one
SENTRY_AUTH_TOKEN=...

# === APP CONFIG ===
VITE_APP_URL=https://nautilus.vercel.app
VITE_NODE_ENV=production
```

#### Variáveis Opcionais (Recursos Avançados)

```bash
# === OPENAI ===
VITE_OPENAI_API_KEY=sk-proj-...

# === MAPBOX ===
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...

# === WEATHER ===
VITE_OPENWEATHER_API_KEY=...

# === TRAVEL APIs ===
VITE_AMADEUS_API_KEY=...
VITE_AMADEUS_API_SECRET=...

# === VOICE ===
VITE_ELEVENLABS_API_KEY=...

# === EMBED TOKENS ===
VITE_EMBED_ACCESS_TOKEN=generate_secure_token_here

# === NOTIFICATIONS ===
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
VITE_TELEGRAM_BOT_TOKEN=...
VITE_TELEGRAM_CHAT_ID=...
```

#### Variáveis para Backend (Service Role)

```bash
# === SUPABASE SERVICE ROLE (Apenas para scripts backend) ===
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Nunca exponha no frontend!

# === EMAIL (para scripts locais) ===
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=seu@email.com
EMAIL_PASS=sua_senha
EMAIL_FROM=nautilus@empresa.com
EMAIL_TO=equipe@empresa.com
```

**⚠️ Importante**: 
- Variáveis começando com `VITE_` são expostas no frontend
- Variáveis sem `VITE_` são apenas para build-time ou backend
- Nunca exponha `SERVICE_ROLE_KEY` no frontend

### 2.3 Configurar Domínio Personalizado (Opcional)

1. No Vercel Dashboard, vá para **Settings** → **Domains**
2. Adicione seu domínio: `nautilus.sua-empresa.com`
3. Configure DNS no seu provedor:
   ```
   Tipo: CNAME
   Nome: nautilus
   Valor: cname.vercel-dns.com
   ```
4. Aguarde propagação DNS (até 48h, geralmente alguns minutos)
5. SSL é configurado automaticamente pela Vercel

---

## 🤖 Parte 3: Configuração do GitHub Actions

### 3.1 Adicionar Secrets do GitHub

No repositório, vá para **Settings** → **Secrets and variables** → **Actions**

Adicione os seguintes secrets:

```bash
# Vercel
VERCEL_TOKEN=...  # Token do Vercel (https://vercel.com/account/tokens)
VERCEL_ORG_ID=...  # Em Settings do projeto no Vercel
VERCEL_PROJECT_ID=...  # Em Settings do projeto no Vercel
```

### 3.2 Workflow já está configurado

O workflow `.github/workflows/deploy-vercel.yml` já está pronto e será executado automaticamente quando você fizer push para `main`.

O workflow irá:
1. ✅ Rodar testes
2. ✅ Fazer build do projeto
3. ✅ Fazer deploy para Vercel
4. ✅ Verificar se o deploy está funcionando
5. ✅ Criar comentário com status do deploy

---

## 🚀 Parte 4: Fazer o Deploy

### Opção 1: Deploy Automático (Recomendado)

```bash
# Certifique-se de estar na branch main
git checkout main

# Faça suas alterações
git add .
git commit -m "feat: prepare for production deployment"

# Push para main (dispara deploy automático)
git push origin main
```

O GitHub Actions irá:
1. Executar os testes
2. Fazer build
3. Fazer deploy para Vercel
4. Verificar o deploy
5. Notificar você sobre o resultado

### Opção 2: Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy para produção
vercel --prod

# Ou linkar ao projeto existente
vercel link
vercel --prod
```

---

## ✅ Parte 5: Verificação Pós-Deploy

### 5.1 Checklist de Validação

Execute o checklist de verificação:

```bash
# Rodar script de validação
node scripts/production-verification.js

# Ou acessar o dashboard de saúde
# https://seu-app.vercel.app/admin/system-health
```

Verifique manualmente:

- [ ] **Build**: Deploy concluído sem erros
- [ ] **Acesso**: Site acessível via URL de produção
- [ ] **Autenticação**: Login funciona corretamente
- [ ] **Database**: Conexão com Supabase OK
- [ ] **Edge Functions**: Cron jobs configurados
- [ ] **Storage**: Upload de arquivos funciona
- [ ] **APIs Externas**: Integrações funcionando
- [ ] **Monitoramento**: Sentry recebendo dados
- [ ] **Performance**: Lighthouse Score > 80
- [ ] **Segurança**: Headers de segurança configurados
- [ ] **SSL**: HTTPS ativo e certificado válido

### 5.2 Testar Funcionalidades Core

Teste os módulos principais:

1. **Autenticação**
   - Login com email/senha
   - Recuperação de senha
   - Perfis de usuário

2. **Documentos**
   - Criar documento
   - Upload de arquivo
   - Visualizar documento
   - Compartilhar documento

3. **Templates**
   - Visualizar templates
   - Aplicar template
   - Criar template personalizado

4. **Auditoria**
   - Criar auditoria IMCA
   - Visualizar checklist
   - Exportar relatório PDF

5. **MMI (Manutenção)**
   - Visualizar jobs
   - Criar job
   - Buscar jobs similares com IA

6. **Assistente IA**
   - Fazer pergunta
   - Visualizar histórico
   - Gerar relatório

7. **Dashboard Admin**
   - Visualizar métricas
   - Verificar status dos serviços
   - Visualizar logs

### 5.3 Monitoramento em Produção

Configure alertas no Sentry:

1. Acesse https://sentry.io
2. Vá para **Alerts** → **Create Alert**
3. Configure alertas para:
   - Taxa de erro > 1%
   - Response time > 2s
   - Downtime

Configure monitoramento no Vercel:

1. No Vercel Dashboard, vá para **Analytics**
2. Configure alertas para:
   - Build failures
   - Deployment failures
   - Performance degradation

---

## 🔄 Parte 6: Manutenção e Atualizações

### 6.1 Processo de Atualização

```bash
# Desenvolver em branch feature
git checkout -b feature/nova-funcionalidade

# Desenvolver e testar localmente
npm run dev
npm run test

# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# Criar Pull Request no GitHub
# Revisar código
# Merge para main → Deploy automático
```

### 6.2 Rollback em Caso de Problema

**Opção 1: Via Vercel Dashboard (Mais Rápido)**

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto Nautilus One
3. Vá para **Deployments**
4. Encontre o deploy anterior estável
5. Clique nos **três pontos** → **Promote to Production**

**Opção 2: Via Git**

```bash
# Reverter último commit
git revert HEAD
git push origin main

# Ou reverter para commit específico
git revert <commit-hash>
git push origin main
```

### 6.3 Backup e Recuperação

**Backup do Supabase:**

```bash
# Backup manual do banco de dados
pg_dump -h db.seu-projeto.supabase.co -U postgres -d postgres > backup.sql

# Ou use o Supabase CLI
supabase db dump > backup.sql
```

Configure backups automáticos no Supabase:
- Backups diários são feitos automaticamente
- Disponível em **Database** → **Backups**
- Retenção: 7 dias (plano gratuito) ou mais (plano pago)

---

## 📊 Parte 7: Métricas de Sucesso

### KPIs de Produção

Monitore estas métricas:

| Métrica | Target | Crítico |
|---------|--------|---------|
| Uptime | > 99.9% | < 99% |
| Response Time | < 500ms | > 2s |
| Error Rate | < 0.1% | > 1% |
| Build Time | < 3 min | > 5 min |
| Bundle Size | < 7MB | > 10MB |
| Lighthouse Score | > 80 | < 60 |
| Active Users | - | - |
| API Success Rate | > 99% | < 95% |

### Ferramentas de Monitoramento

1. **Vercel Analytics**: Performance e uso
2. **Sentry**: Erros e crashes
3. **Supabase Dashboard**: Database e Edge Functions
4. **Google Lighthouse**: Performance e SEO
5. **Custom Dashboard**: `/admin/system-health`

---

## 🆘 Troubleshooting

### Problema: Build Failing

```bash
# Limpar cache e reinstalar
rm -rf node_modules dist .next
npm ci
npm run build

# Verificar TypeScript
npx tsc --noEmit

# Verificar lint
npm run lint
```

### Problema: Variáveis de Ambiente Não Funcionando

1. Certifique-se que variáveis frontend começam com `VITE_`
2. Redeploy após adicionar novas variáveis
3. Verifique se não há espaços extras
4. Limpe cache do browser

### Problema: Edge Functions Falhando

```bash
# Testar localmente
supabase functions serve function-name

# Verificar logs
supabase functions logs function-name --tail

# Verificar secrets
supabase secrets list

# Redeployar function
supabase functions deploy function-name
```

### Problema: Performance Issues

1. Analise bundle size: `npm run build`
2. Use lazy loading para componentes pesados
3. Otimize imagens (use WebP)
4. Habilite compression no Vercel
5. Configure cache headers apropriadamente

### Problema: Database Connection Issues

1. Verifique se RLS está configurado corretamente
2. Verifique políticas de acesso
3. Verifique limites de conexão do Supabase
4. Use connection pooling se necessário

---

## 📞 Suporte

### Recursos

- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Supabase**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/RodrigoSC89/travel-hr-buddy/issues
- **Discord Vercel**: https://vercel.com/discord
- **Discord Supabase**: https://supabase.com/discord

### Contatos

- **Email Suporte**: (configure conforme necessário)
- **Slack Interno**: (configure conforme necessário)
- **On-call**: (configure conforme necessário)

---

## 📝 Changelog de Produção

Mantenha registro de deploys importantes:

```markdown
### 2025-10-18 - v1.0.0 - Initial Production Deployment
- ✅ Sistema Nautilus One lançado em produção
- ✅ Todos os módulos funcionais
- ✅ Monitoramento configurado
- ✅ Backups configurados

### 2025-XX-XX - v1.1.0 - Feature Update
- ✨ Nova funcionalidade X
- 🐛 Correção de bug Y
- ⚡️ Performance improvement Z
```

---

**Última atualização**: 2025-10-18
**Versão do Guia**: 1.0.0
**Status**: ✅ Production Ready

---

## 🎉 Conclusão

Seguindo este guia, você terá o sistema Nautilus One rodando em produção de forma:

- ✅ **Confiável**: Com 99.9% uptime
- ✅ **Segura**: Com SSL, RLS e headers de segurança
- ✅ **Monitorada**: Com Sentry e analytics
- ✅ **Automatizada**: Com CI/CD via GitHub Actions
- ✅ **Escalável**: Com Vercel e Supabase

**Boa sorte com o lançamento! 🚀**
