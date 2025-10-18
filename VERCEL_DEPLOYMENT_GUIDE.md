# 🚀 Guia de Deploy para Vercel - Travel HR Buddy

## 📋 Pré-requisitos

- Conta na Vercel (https://vercel.com)
- Projeto Supabase configurado
- Chaves de API necessárias

**📚 Documentação de Referência:**
- **[.env.production](./.env.production)** - Template completo de variáveis de produção
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist rápido de deploy (15 min)
- **[ENV_PRODUCTION_SETUP_GUIDE.md](./ENV_PRODUCTION_SETUP_GUIDE.md)** - Guia completo passo-a-passo

## ✅ Checklist Pré-Deploy

Antes de iniciar o deploy, verifique:

- [ ] Build local funciona: `npm run build`
- [ ] Testes passando: `npm test`
- [ ] Lint sem erros críticos: `npm run lint`
- [ ] Variáveis essenciais identificadas (ver [.env.production](./.env.production))
- [ ] Projeto Supabase criado e configurado
- [ ] Migrations do banco aplicadas

> 💡 **Dica:** Para um checklist completo, veja [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)

---

## 🔧 Configuração Inicial

### 1. Conectar Repositório à Vercel

1. Acesse https://vercel.com/new
2. Selecione o repositório `RodrigoSC89/travel-hr-buddy`
3. Configure o framework como **Vite**
4. Mantenha as configurações padrão (já estão corretas no `vercel.json`)

### 2. Configurar Variáveis de Ambiente

Na dashboard da Vercel, vá em **Settings** → **Environment Variables** e adicione as variáveis necessárias.

**📄 Use como referência:** [.env.production](./.env.production) - Template completo com 50+ variáveis organizadas

#### Variáveis Essenciais (Obrigatórias)

```bash
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
VITE_SUPABASE_PROJECT_ID=seu-projeto-id

# Sentry (Monitoramento)
VITE_SENTRY_DSN=https://your-sentry-dsn@o0.ingest.sentry.io/0000000
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

#### Variáveis Opcionais (Recomendadas)

```bash
# OpenAI (Assistente de IA)
VITE_OPENAI_API_KEY=sk-proj-...

# Mapbox (Mapas)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...

# OpenWeather (Clima)
VITE_OPENWEATHER_API_KEY=...

# Amadeus (Viagens)
VITE_AMADEUS_API_KEY=your-client-id
VITE_AMADEUS_API_SECRET=your-client-secret

# ElevenLabs (Voz)
VITE_ELEVENLABS_API_KEY=...

# App Config
VITE_APP_URL=https://seu-app.vercel.app
VITE_NODE_ENV=production

# Embed Access Token
VITE_EMBED_ACCESS_TOKEN=seu_token_secreto_aqui
```

#### Variáveis para Notificações (Admin Wall)

```bash
# Slack
VITE_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Telegram
VITE_TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
VITE_TELEGRAM_CHAT_ID=-1001234567890
```

### 3. Configurar Supabase Edge Functions

As Edge Functions do Supabase precisam de suas próprias variáveis. Configure via CLI:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-id

# Configurar secrets para Edge Functions
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

## 🏗️ Processo de Deploy

### Deploy Automático (Recomendado)

Cada push para a branch `main` dispara automaticamente um deploy na Vercel.

```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

### Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy de produção
vercel --prod
```

## ✅ Checklist de Validação Pós-Deploy

### 1. Verificar Build

- [ ] Build concluído sem erros
- [ ] Tamanho do bundle aceitável (~6.5MB)
- [ ] Source maps desabilitados em produção

### 2. Testar Funcionalidades Core

- [ ] Login/Autenticação funciona
- [ ] Dashboard carrega corretamente
- [ ] Módulos principais acessíveis
- [ ] API Supabase conectada

### 3. Verificar Integrações

- [ ] Sentry recebendo erros (testar erro intencional)
- [ ] Logs aparecendo corretamente
- [ ] PWA instalável
- [ ] Service Worker ativo

### 4. Performance

- [ ] Lighthouse Score > 80
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Cumulative Layout Shift < 0.1

### 5. Segurança

- [ ] Headers de segurança configurados
- [ ] HTTPS ativo
- [ ] Sem credenciais expostas no código
- [ ] CSP configurado

## 🔍 Monitoramento e Debug

### Verificar Logs da Vercel

1. Acesse https://vercel.com/dashboard
2. Selecione o projeto
3. Vá em **Deployments** → Selecione o deploy
4. Clique em **Functions** ou **Runtime Logs**

### Verificar Logs do Supabase

```bash
supabase functions logs send-chart-report --tail
supabase functions logs send-restore-dashboard-daily --tail
```

### Verificar Sentry

1. Acesse https://sentry.io
2. Selecione o projeto
3. Visualize erros em tempo real

## 🐛 Troubleshooting

### Build Falhando

```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build

# Verificar TypeScript
npm run lint
```

### Variáveis de Ambiente Não Funcionando

- Certifique-se de que variáveis começam com `VITE_`
- Redeploy após adicionar novas variáveis
- Verifique se não há espaços extras

### Edge Functions Falhando

```bash
# Testar localmente
supabase functions serve send-chart-report

# Verificar secrets
supabase secrets list
```

### Performance Issues

- Ative compression no Vercel
- Verifique bundle size com `npm run build`
- Use lazy loading para componentes pesados
- Otimize imagens

## 📊 Métricas de Sucesso

- **Uptime**: > 99.9%
- **Response Time**: < 500ms
- **Build Time**: < 3 minutos
- **Bundle Size**: < 7MB
- **Lighthouse Score**: > 80

## 🔄 Atualizações e Manutenção

### Deploy de Hotfix

```bash
# Criar branch de hotfix
git checkout -b hotfix/issue-description

# Fazer correção
git add .
git commit -m "hotfix: descrição"

# Merge para main
git checkout main
git merge hotfix/issue-description
git push origin main
```

### Rollback de Deploy

Na Vercel Dashboard:
1. Vá em **Deployments**
2. Encontre o deploy anterior estável
3. Clique nos três pontos → **Promote to Production**

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vite](https://vitejs.dev/)
- [Guia de Performance Web](https://web.dev/performance/)

## 🆘 Suporte

Em caso de problemas:
1. Verifique logs da Vercel e Sentry
2. Consulte este guia de troubleshooting
3. Revise as issues do repositório
4. Contate o time de desenvolvimento

---

**Última atualização**: 2025-10-13
**Versão do Guia**: 1.0
