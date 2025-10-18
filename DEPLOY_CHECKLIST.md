# 🚀 Checklist de Deploy - Nautilus One

Guia rápido para deployment em produção. Para detalhes completos, consulte [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) ou [ENV_PRODUCTION_SETUP_GUIDE.md](./ENV_PRODUCTION_SETUP_GUIDE.md).

---

## ✅ PRÉ-DEPLOYMENT

### 1. Configuração de Contas e Projetos

- [ ] Conta Vercel criada e ativa
- [ ] Projeto Supabase configurado
- [ ] Repositório GitHub conectado ao Vercel
- [ ] API Keys obtidas (ver seção abaixo)

### 2. Variáveis de Ambiente Obrigatórias

Configure no **Vercel Dashboard** → **Settings** → **Environment Variables**:

#### ✅ Essenciais (Build falhará sem estas)

- [ ] `VITE_SUPABASE_URL` - URL do projeto Supabase
- [ ] `VITE_SUPABASE_PUBLISHABLE_KEY` - Anon key do Supabase
- [ ] `VITE_SUPABASE_PROJECT_ID` - ID do projeto Supabase
- [ ] `VITE_OPENAI_API_KEY` - Key da OpenAI (assistente IA)
- [ ] `VITE_SENTRY_DSN` - DSN do Sentry (monitoramento)
- [ ] `VITE_APP_URL` - URL da aplicação (https://seu-app.vercel.app)
- [ ] `VITE_NODE_ENV` - Definir como `production`
- [ ] `RESEND_API_KEY` - Key do Resend (envio de emails)

#### ⚡ Recomendadas (Features importantes)

- [ ] `VITE_MAPBOX_ACCESS_TOKEN` - Mapbox (mapas)
- [ ] `VITE_OPENWEATHER_API_KEY` - OpenWeather (clima)
- [ ] `VITE_EMBED_ACCESS_TOKEN` - Token para rotas embed
- [ ] `SENTRY_AUTH_TOKEN` - Sentry (upload source maps)

#### 🔧 Opcionais (Features avançadas)

- [ ] `VITE_AMADEUS_API_KEY` - Amadeus (viagens)
- [ ] `VITE_ELEVENLABS_API_KEY` - ElevenLabs (voz)
- [ ] `VITE_SLACK_WEBHOOK_URL` - Slack (notificações)
- [ ] `VITE_TELEGRAM_BOT_TOKEN` - Telegram (notificações)

> 💡 **Dica**: Use `.env.production` como referência para todas as variáveis disponíveis

### 3. Configuração Supabase Edge Functions

Configure secrets via Supabase CLI:

```bash
# Instalar CLI (se necessário)
npm install -g supabase

# Login e link
supabase login
supabase link --project-ref SEU_PROJECT_ID

# Configurar secrets essenciais
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

- [ ] Supabase CLI instalado
- [ ] Projeto linkado (`supabase link`)
- [ ] Secrets configurados (`supabase secrets set`)
- [ ] Verificar secrets (`supabase secrets list`)

### 4. Verificação Local

Antes de fazer deploy, teste localmente:

```bash
# Instalar dependências
npm install

# Rodar testes
npm run test

# Build de produção
npm run build

# Preview do build
npm run preview
```

- [ ] ✅ Testes passando (1767 testes)
- [ ] ✅ Build sem erros
- [ ] ✅ Preview funcionando

---

## 🚀 DEPLOYMENT

### Opção 1: Deploy Automático (Recomendado)

```bash
git add .
git commit -m "feat: deploy to production"
git push origin main
```

- [ ] Push para `main` realizado
- [ ] GitHub Actions iniciado automaticamente
- [ ] Build bem-sucedido no Vercel

### Opção 2: Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

- [ ] Vercel CLI instalado
- [ ] Login realizado
- [ ] Deploy executado

---

## ✅ PÓS-DEPLOYMENT

### 1. Verificação Básica

- [ ] ✅ URL de produção acessível
- [ ] ✅ Página inicial carrega sem erros
- [ ] ✅ Console do navegador sem erros críticos

### 2. Verificação de Autenticação

- [ ] ✅ Login funciona corretamente
- [ ] ✅ Logout funciona
- [ ] ✅ Sessão persiste após reload

### 3. Verificação de Health Check

Acesse: `https://seu-app.vercel.app/admin/system-health`

- [ ] ✅ Página carrega
- [ ] ✅ Status "System Running" ou similar
- [ ] ✅ Variáveis essenciais marcadas como configuradas
- [ ] ⚠️ Verificar avisos de variáveis opcionais faltando

### 4. Verificação de Features Core

- [ ] ✅ Dashboard principal carrega
- [ ] ✅ Módulos principais acessíveis
- [ ] ✅ Supabase conectado (dados carregam)
- [ ] ✅ Assistente IA responde (se configurado)
- [ ] ✅ Mapas carregam (se configurado)

### 5. Verificação de Integrations

- [ ] ✅ Sentry recebendo eventos (teste erro intencional)
- [ ] ✅ Edge Functions funcionando (teste envio de relatório)
- [ ] ✅ Email service funcionando (teste email)
- [ ] ✅ Notificações funcionando (se configurado)

### 6. Verificação de Performance

Execute Lighthouse (Chrome DevTools):

- [ ] ✅ Performance Score > 80
- [ ] ✅ Accessibility Score > 80
- [ ] ✅ Best Practices Score > 80
- [ ] ✅ SEO Score > 80
- [ ] ✅ First Contentful Paint < 2s
- [ ] ✅ Time to Interactive < 4s

### 7. Verificação de Segurança

- [ ] ✅ HTTPS ativo (cadeado verde)
- [ ] ✅ Headers de segurança configurados
- [ ] ✅ Sem credenciais expostas no código
- [ ] ✅ API Keys não aparecem no bundle frontend

---

## 🐛 TROUBLESHOOTING COMUM

### Build Falhando

**Problema**: Build falha no Vercel

**Soluções**:
1. Verificar logs no Vercel Dashboard
2. Testar build local: `npm run build`
3. Verificar TypeScript: `npm run lint`
4. Limpar e reinstalar: `rm -rf node_modules && npm install`

### Variáveis Não Funcionando

**Problema**: Variáveis de ambiente não são reconhecidas

**Soluções**:
1. Verificar se começam com `VITE_` (para frontend)
2. Redeploy após adicionar novas variáveis
3. Verificar espaços extras ou typos
4. Aguardar 2-3 minutos após configurar

### Edge Functions Falhando

**Problema**: Supabase Edge Functions retornam erro

**Soluções**:
1. Verificar secrets: `supabase secrets list`
2. Testar localmente: `supabase functions serve FUNCTION_NAME`
3. Ver logs: `supabase functions logs FUNCTION_NAME --tail`
4. Verificar permissões no Supabase Dashboard

### Performance Issues

**Problema**: Site lento ou bundle grande

**Soluções**:
1. Verificar bundle size: `npm run build` (ver dist/assets)
2. Ativar compression no Vercel
3. Lazy loading para componentes pesados
4. Otimizar imagens (usar WebP, comprimir)

---

## 🔄 ROLLBACK

Se houver problemas após deploy:

### Via Vercel Dashboard

1. Acesse **Deployments**
2. Encontre deploy anterior estável
3. Clique **"..."** → **"Promote to Production"**

### Via Git

```bash
git revert HEAD
git push origin main
# Aguardar novo deploy automático
```

---

## 📚 Recursos Adicionais

- 📖 [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Guia completo
- 🔧 [ENV_PRODUCTION_SETUP_GUIDE.md](./ENV_PRODUCTION_SETUP_GUIDE.md) - Setup detalhado
- 📋 [.env.production](./.env.production) - Template de variáveis
- 🏗️ [PRODUCTION_DEPLOYMENT_GUIDE.md](./PRODUCTION_DEPLOYMENT_GUIDE.md) - Guia oficial
- ✅ [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) - Checklist completo

---

## 📊 Métricas de Sucesso

Após deployment bem-sucedido:

- **Uptime**: > 99.9%
- **Response Time**: < 500ms
- **Build Time**: < 3 minutos
- **Bundle Size**: < 7MB
- **Lighthouse Score**: > 80
- **Error Rate**: < 1%

---

## 🆘 Precisa de Ajuda?

1. ✅ Verificar logs do Vercel e Sentry
2. ✅ Consultar documentação detalhada
3. ✅ Revisar issues do repositório
4. ✅ Contatar equipe de desenvolvimento

---

**Última atualização**: 2025-10-18  
**Versão**: 1.0

> 💡 **Dica Final**: Mantenha este checklist marcado durante o deployment para não esquecer nenhum passo crítico!
