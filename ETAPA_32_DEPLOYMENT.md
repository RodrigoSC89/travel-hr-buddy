# ETAPA 32 - Guia de Deployment

## 🚀 Deployment Completo

Este guia cobre o deployment completo do Sistema de Auditoria Externa (ETAPA 32) do zero até produção.

---

## 📋 Pré-requisitos

### Software Necessário

```bash
# Node.js e npm
node --version  # >= 22.x
npm --version   # >= 8.x

# Supabase CLI
npm install -g supabase
supabase --version

# Git
git --version
```

### Contas e Credenciais

- [ ] Conta Supabase (https://supabase.com)
- [ ] Conta OpenAI (https://platform.openai.com)
- [ ] Conta Vercel/Netlify (opcional para deploy frontend)

---

## 🔧 Passo 1: Setup do Projeto

### 1.1 Clonar Repositório

```bash
git clone https://github.com/RodrigoSC89/travel-hr-buddy.git
cd travel-hr-buddy
git checkout copilot/refactor-external-audit-module
```

### 1.2 Instalar Dependências

```bash
npm install
```

### 1.3 Configurar Variáveis de Ambiente

Crie arquivo `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# OpenAI (para desenvolvimento local)
VITE_OPENAI_API_KEY=sk-proj-...
```

---

## 🗄️ Passo 2: Setup do Banco de Dados

### 2.1 Inicializar Supabase (se necessário)

```bash
# Se primeiro deploy
supabase init

# Link ao projeto remoto
supabase link --project-ref seu-projeto-ref
```

### 2.2 Aplicar Migrations

```bash
# Revisar migration
cat supabase/migrations/20251018174100_create_etapa_32_audit_system.sql

# Aplicar ao banco
supabase db push

# Verificar tabelas criadas
supabase db status
```

### 2.3 Verificar Dados Seed

As migrations já incluem seed de templates. Verificar:

```sql
SELECT COUNT(*) FROM audit_norm_templates;
-- Deve retornar ~40 registros
```

---

## 📦 Passo 3: Setup do Storage

### 3.1 Criar Bucket

Via Supabase Dashboard:
1. Acesse Storage
2. Crie bucket `evidence-files`
3. Marque como **privado** ✅
4. Habilite RLS

Ou via CLI:

```bash
supabase storage create evidence-files --private
```

### 3.2 Configurar Políticas de Storage

```sql
-- Permitir uploads autenticados
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence-files');

-- Permitir leitura autenticada
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence-files');

-- Permitir deleção própria
CREATE POLICY "Allow own deletes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'evidence-files' AND auth.uid() = owner);
```

---

## ⚡ Passo 4: Deploy Edge Function

### 4.1 Verificar Edge Function

```bash
# Testar localmente (opcional)
supabase functions serve audit-simulate --env-file .env.local

# Em outro terminal
curl -i --location 'http://localhost:54321/functions/v1/audit-simulate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"vesselId":"test","vesselName":"Test","auditType":"ISO","norms":["ISO-9001"]}'
```

### 4.2 Deploy para Produção

```bash
# Deploy
supabase functions deploy audit-simulate

# Verificar
supabase functions list
```

### 4.3 Configurar Secrets

```bash
# Configurar OpenAI API Key
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Verificar secrets
supabase secrets list
```

### 4.4 Testar em Produção

```bash
curl -i --location 'https://seu-projeto.supabase.co/functions/v1/audit-simulate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "vesselId": "test-vessel",
    "vesselName": "Test Vessel",
    "auditType": "ISO",
    "norms": ["ISO-9001"]
  }'
```

---

## 🌐 Passo 5: Deploy Frontend

### 5.1 Build Local

```bash
# Build de produção
npm run build

# Verificar dist/
ls -lh dist/

# Preview local
npm run preview
```

### 5.2 Deploy para Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Configurar environment variables na dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

### 5.3 Deploy para Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist

# Configurar environment variables na dashboard
```

---

## ✅ Passo 6: Verificação Pós-Deploy

### 6.1 Checklist de Funcionalidades

```bash
# Database
✅ Tabelas criadas (4 tables)
✅ Functions criadas (2 functions)
✅ Templates seed (40+ registros)
✅ RLS policies ativas

# Storage
✅ Bucket evidence-files criado
✅ Políticas configuradas

# Edge Functions
✅ audit-simulate deployed
✅ OPENAI_API_KEY configurada
✅ Logs acessíveis

# Frontend
✅ Build sem erros
✅ Deploy bem-sucedido
✅ Routes funcionando
```

### 6.2 Testes de Sanidade

**Teste 1: Simulação de Auditoria**

1. Acesse `/admin/audit-system`
2. Vá para aba "Simulação de Auditoria"
3. Preencha:
   - Embarcação: "Navio Teste"
   - Tipo: "ISO"
4. Clique "Simular Auditoria"
5. Aguarde ~30s
6. ✅ Deve exibir resultado com scores, conformidades, etc.

**Teste 2: Dashboard de Performance**

1. Aba "Performance por Embarcação"
2. Selecione embarcação existente
3. Configure período
4. Clique "Calcular"
5. ✅ Deve exibir KPIs e gráficos

**Teste 3: Upload de Evidência**

1. Aba "Evidências"
2. Selecione norma e embarcação
3. Clique "Upload" em uma cláusula faltante
4. Selecione arquivo (PDF, DOC, etc.)
5. ✅ Upload deve ser bem-sucedido
6. ✅ Arquivo deve aparecer na lista

### 6.3 Verificar Logs

```bash
# Edge function logs
supabase functions logs audit-simulate --tail

# Database logs
supabase db logs --tail

# Storage logs (via dashboard)
```

---

## 🔧 Passo 7: Configurações Avançadas

### 7.1 Rate Limiting

Configure rate limiting no Supabase Dashboard:
- Functions → audit-simulate → Settings
- Max requests: 100/min
- Burst: 10

### 7.2 Monitoring

Configure alertas:
- Supabase: Alerts para falhas de function
- Vercel: Integração com Sentry
- OpenAI: Monitoring de uso

### 7.3 Backup

```bash
# Backup manual
supabase db dump -f backup_$(date +%Y%m%d).sql

# Backup automático (via Supabase)
# Dashboard → Database → Backups
# Habilitar daily backups
```

---

## 🐛 Troubleshooting

### Problema: Edge function timeout

**Sintoma**: Simulação demora >60s e falha

**Solução**:
```typescript
// Em audit-simulate/index.ts
// Aumentar timeout do OpenAI
const openaiResponse = await fetch('...', {
  // ...
  timeout: 45000 // 45s
});
```

### Problema: Upload falha com 413

**Sintoma**: Arquivo grande não faz upload

**Solução**:
```sql
-- Aumentar limite no Supabase
-- Dashboard → Storage → evidence-files → Settings
-- Max file size: 50MB
```

### Problema: RLS bloqueia acesso

**Sintoma**: Queries retornam vazio

**Solução**:
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'audit_simulations';

-- Temporariamente desabilitar para debug
ALTER TABLE audit_simulations DISABLE ROW LEVEL SECURITY;

-- IMPORTANTE: Re-habilitar depois!
ALTER TABLE audit_simulations ENABLE ROW LEVEL SECURITY;
```

### Problema: OpenAI rate limit

**Sintoma**: Erro 429 da OpenAI

**Solução**:
- Verificar tier da conta OpenAI
- Implementar retry com exponential backoff
- Considerar cache de resultados

---

## 📊 Monitoramento em Produção

### Métricas Chave

```sql
-- Auditorias por dia
SELECT DATE(simulated_at), COUNT(*)
FROM audit_simulations
WHERE simulated_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(simulated_at);

-- Taxa de sucesso
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE non_conformities IS NOT NULL) as success
FROM audit_simulations
WHERE simulated_at > NOW() - INTERVAL '24 hours';

-- Top embarcações
SELECT vessel_name, COUNT(*) as audit_count
FROM audit_simulations
GROUP BY vessel_name
ORDER BY audit_count DESC
LIMIT 10;
```

### Custos OpenAI

```bash
# Via OpenAI Dashboard
# Usage → API Usage
# Filtrar por date range

# Custo estimado:
# - GPT-4: ~$0.05 por auditoria
# - Média 100 auditorias/mês = ~$5/mês
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] RLS habilitado em todas as tabelas
- [ ] Storage bucket privado
- [ ] OPENAI_API_KEY em secrets (nunca em código)
- [ ] HTTPS habilitado (via Vercel/Netlify)
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs de auditoria habilitados

### Rotação de Secrets

```bash
# Rotacionar OpenAI key
supabase secrets set OPENAI_API_KEY=nova-key

# Redeploy function
supabase functions deploy audit-simulate

# Testar
curl ...
```

---

## 📈 Performance Tuning

### Otimização de Queries

```sql
-- Adicionar índices se necessário
CREATE INDEX CONCURRENTLY idx_audit_simulations_org_vessel 
ON audit_simulations(organization_id, vessel_id);

-- Vacuum periódico
VACUUM ANALYZE audit_simulations;
```

### Caching

```typescript
// Em PerformanceDashboard.tsx
// Adicionar cache de métricas
const { data, error } = await supabase
  .from('vessel_performance_metrics')
  .select('*')
  .eq('vessel_id', vesselId)
  .single()
  .cache(3600); // 1 hora
```

---

## 🎯 Próximos Passos

Após deployment bem-sucedido:

1. **Treinamento de Usuários**
   - Sessão de onboarding
   - Documentação entregue (ETAPA_32_QUICKSTART.md)
   - Videos tutoriais

2. **Coleta de Feedback**
   - Setup analytics (PostHog, Mixpanel)
   - Formulário de feedback
   - Métricas de uso

3. **Iteração**
   - Ajustes baseados em uso real
   - Performance tuning
   - Novas features (roadmap v1.1)

---

## 📞 Suporte

**Documentação Técnica**: [ETAPA_32_IMPLEMENTATION.md](./ETAPA_32_IMPLEMENTATION.md)  
**Guia do Usuário**: [ETAPA_32_QUICKSTART.md](./ETAPA_32_QUICKSTART.md)  
**Issues**: GitHub Issues  
**Email**: suporte@nautilusone.com  

---

**Última Atualização**: 2025-10-18  
**Versão**: 1.0.0  
**Status**: ✅ Produção Ready
