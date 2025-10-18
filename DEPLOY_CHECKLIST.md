# ✅ Checklist de Deploy em Produção

Este documento fornece um guia rápido para configurar e fazer deploy do Nautilus One em produção.

## 📋 Verificações Antes do Deploy

| Item | Status | Descrição |
|------|--------|-----------|
| ✅ `.env.production` preenchido | ⬜ Pendente | Preencher todas as variáveis necessárias conforme template |
| ✅ Build local funcionando | ⬜ Pendente | Executar `npm run build` e verificar sucesso |
| ✅ Testes automatizados passando | ⬜ Pendente | Executar `npm run test` e verificar 100% de aprovação |
| ✅ Painel de saúde operacional | ⬜ Pendente | Verificar `/admin/system-health` após deploy |
| ✅ Supabase configurado e online | ⬜ Pendente | Projeto Supabase criado e acessível |

## 🚀 Processo de Deploy

### 1️⃣ Preparar Variáveis de Ambiente

Consulte o arquivo `.env.production` no repositório e preencha todas as variáveis necessárias:

#### Variáveis Obrigatórias:

```bash
# 🔐 Supabase
VITE_SUPABASE_URL=https://<YOUR_PROJECT>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
SUPABASE_KEY=your-service-role-key

# 🤖 OpenAI
VITE_OPENAI_API_KEY=sk-...

# 🔧 Configurações do sistema
VITE_APP_NAME=Nautilus One
VITE_DEFAULT_TENANT=global
VITE_ENVIRONMENT=production
NODE_ENV=production
```

#### Variáveis Opcionais (mas Recomendadas):

```bash
# 📤 Resend (envio de emails IA)
RESEND_API_KEY=re_...

# 🚨 Sentry (monitoramento de erros)
VITE_SENTRY_DSN=https://your-sentry-dsn@o0.ingest.sentry.io/0000000
SENTRY_ORG=your-organization
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token

# 🗺️ Mapbox (mapas)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ...
VITE_MAPBOX_TOKEN=pk.eyJ...

# 🌤️ OpenWeather (clima)
VITE_OPENWEATHER_API_KEY=...
```

### 2️⃣ Configurar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Conecte o repositório `RodrigoSC89/travel-hr-buddy`
3. Selecione a branch `main`
4. Configure o framework como **Vite**
5. Vá em **Settings** → **Environment Variables**
6. Adicione todas as variáveis do `.env.production` (uma por uma)
7. Selecione o ambiente: **Production**

### 3️⃣ Configurar Supabase Edge Functions

As Edge Functions precisam de secrets separados. Configure via CLI:

```bash
# Instalar Supabase CLI (se necessário)
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-id

# Configurar secrets
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set ADMIN_EMAIL=admin@empresa.com
supabase secrets set OPENWEATHER_API_KEY=...
supabase secrets set MAPBOX_PUBLIC_TOKEN=pk.eyJ...
```

### 4️⃣ Fazer Deploy

**Opção A: Deploy Automático (Recomendado)**

Cada push para `main` dispara automaticamente um deploy:

```bash
git add .
git commit -m "chore: configuração para produção"
git push origin main
```

**Opção B: Deploy Manual via Vercel Dashboard**

1. Acesse o projeto na Vercel
2. Clique em **Deploy**
3. Aguarde o build completar

**Opção C: Deploy via CLI**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## ✅ Validação Pós-Deploy

Após o deploy bem-sucedido, verifique:

### 1. Build e Deploy
- [ ] Build completado sem erros
- [ ] Deploy finalizado com sucesso
- [ ] URL de produção acessível

### 2. Funcionalidades Básicas
- [ ] Página inicial carrega
- [ ] Login/autenticação funciona
- [ ] Dashboard principal acessível
- [ ] Navegação entre módulos funciona

### 3. Integrações
- [ ] Conexão com Supabase: `/admin/system-health`
- [ ] Sentry recebendo erros (testar erro intencional)
- [ ] PWA instalável no navegador
- [ ] Service Worker ativo

### 4. APIs Externas (se configuradas)
- [ ] OpenAI respondendo (teste no assistente de IA)
- [ ] Mapbox carregando mapas
- [ ] OpenWeather fornecendo dados climáticos
- [ ] Email notifications funcionando (teste send-assistant-report)

### 5. Performance
- [ ] Lighthouse Score > 80
- [ ] First Contentful Paint < 2s
- [ ] Tempo de carregamento aceitável
- [ ] PWA funcional

## 🐛 Troubleshooting

### Build Falhando

```bash
# Limpar cache e reinstalar
rm -rf node_modules dist
npm install
npm run build
```

### Variáveis de Ambiente Não Funcionam

- ✅ Certifique-se de que variáveis frontend começam com `VITE_`
- ✅ Redeploy após adicionar novas variáveis
- ✅ Verifique se não há espaços extras nos valores

### Edge Functions Falhando

```bash
# Verificar secrets configurados
supabase secrets list

# Testar localmente
supabase functions serve send-chart-report

# Ver logs
supabase functions logs send-chart-report --tail
```

### Erro de Autenticação Supabase

- ✅ Confirme que as URLs e keys estão corretas
- ✅ Verifique se a chave anon está usando `VITE_SUPABASE_PUBLISHABLE_KEY`
- ✅ Teste a conexão no painel `/admin/system-health`

## 📚 Recursos Adicionais

- **Arquivo de Variáveis**: [`.env.production`](./.env.production)
- **Guia Completo de Deploy**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)
- **Documentação Vercel**: https://vercel.com/docs
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Vite**: https://vitejs.dev/

## 💡 Dicas de Produção

1. **Segurança**
   - Nunca commit credenciais reais no repositório
   - Use `.env.production` apenas como template
   - Configure variáveis sensíveis direto na Vercel

2. **Monitoramento**
   - Configure Sentry para capturar erros em produção
   - Monitore logs do Vercel regularmente
   - Verifique métricas de performance com Lighthouse

3. **Manutenção**
   - Mantenha dependências atualizadas
   - Faça deploy de hotfixes em branches separadas
   - Teste sempre em ambiente de preview antes de produção

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs da Vercel: Dashboard → Deployments → [Seu Deploy] → Logs
2. Verifique os logs do Supabase: `supabase functions logs --tail`
3. Consulte a documentação: VERCEL_DEPLOYMENT_GUIDE.md
4. Revise as issues do repositório
5. Contate o time de desenvolvimento

---

**Última atualização**: 2025-10-18  
**Versão**: 1.0.0
