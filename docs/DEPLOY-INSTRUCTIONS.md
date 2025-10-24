# 🚀 INSTRUÇÕES DE DEPLOY - NAUTILUS ONE

## PATCH 68.5 - Deploy Crítico

---

## ✅ MUDANÇAS APLICADAS

### 1. Alto Contraste (WCAG AAA) ✅
- Botão de contraste no header
- Toggle funcional com persistência
- Classe `.high-contrast` aplicada ao HTML

### 2. Logo Atualizada ✅
- Logo SVG criada em `src/assets/nautilus-logo.svg`
- Integração com contexto de organização
- Suporte a logos customizadas

### 3. Deduplicação de Módulos ✅
- Sistema de aliases de URLs (19 aliases)
- Deduplicação automática de navegação
- Prevenção de duplicatas hardcoded

### 4. Otimização Vercel ✅
- Métricas de cliente desabilitadas por padrão
- Feature flag `VITE_ENABLE_CLIENT_METRICS=false`
- Redução de overhead e crashes

---

## 📋 PASSO A PASSO PARA DEPLOY

### Passo 1: Commit e Push
```bash
git add .
git commit -m "PATCH 68.5: High contrast + Logo SVG + Dedup + Vercel fix"
git push origin main
```

### Passo 2: GitHub Actions
O workflow `.github/workflows/deploy-vercel.yml` será acionado automaticamente e:
1. Executará `npm ci`
2. Rodará `npm run test`
3. Fará `npm run build`
4. Deploy no Vercel Production

### Passo 3: Verificar Deploy
Aguardar 5-10 minutos e acessar:
- **URL:** https://travel-hr-buddy.vercel.app

### Passo 4: Validação
Verificar:
- [ ] Botão "Contraste" no header (canto superior direito)
- [ ] Logo SVG no sidebar (lado esquerdo)
- [ ] Menu sem duplicatas
- [ ] Console sem erros
- [ ] Deploy sem crashes

---

## 🔧 VARIÁVEIS DE AMBIENTE NO VERCEL

Já configuradas no `vercel.json`:
```json
{
  "VITE_APP_URL": "https://travel-hr-buddy.vercel.app",
  "VITE_MQTT_URL": "wss://broker.hivemq.com:8884/mqtt",
  "VITE_SUPABASE_URL": "https://vnbptmixvwropvanyhdb.supabase.co",
  "VITE_SUPABASE_ANON_KEY": "...",
  "VITE_ENABLE_CLIENT_METRICS": "false"
}
```

**Importante:** A variável `VITE_ENABLE_CLIENT_METRICS=false` desabilita métricas pesadas que causavam crashes no Vercel.

---

## 🧪 COMO TESTAR LOCALMENTE

Antes do deploy, teste localmente:

```bash
# 1. Build
npm run build

# 2. Preview
npm run preview

# 3. Acessar
# http://localhost:4173
```

Verificar:
- Botão de contraste funciona
- Logo SVG aparece
- Menu sem duplicatas
- Build sem erros

---

## 🎯 O QUE ESPERAR APÓS O DEPLOY

### No Vercel Preview (https://travel-hr-buddy.vercel.app):

1. **Header (topo):**
   - Botão "Contraste" aparece ao lado do ThemeToggle
   - Clique alterna o modo de alto contraste
   - Estado persiste ao recarregar a página

2. **Sidebar (esquerda):**
   - Logo SVG "NAUTILUS ONE" no topo
   - Menu organizado em grupos (Core, Operações, etc.)
   - **SEM** itens duplicados

3. **Console:**
   - Sem erros de metrics
   - Sem warnings de duplicatas
   - Log: `[MetricsDaemon] Client metrics disabled`

4. **Performance:**
   - Deploy completa sem timeouts
   - Página carrega rapidamente
   - Sem crashes ou memory leaks

---

## 🐛 TROUBLESHOOTING

### Problema: Deploy falha no Vercel
**Solução:**
- Verificar logs do GitHub Actions
- Confirmar que `VITE_ENABLE_CLIENT_METRICS=false` está configurada
- Limpar cache do Vercel: Settings → Clear Build Cache

### Problema: Botão de contraste não aparece
**Solução:**
- Verificar que `src/components/layout/header.tsx` foi atualizado
- Confirmar que `useHighContrastTheme` está importado
- Hard refresh no navegador (Ctrl+Shift+R)

### Problema: Logo não aparece
**Solução:**
- Verificar que `src/assets/nautilus-logo.svg` existe
- Confirmar import em `app-sidebar.tsx`
- Verificar console para erros de import

### Problema: Ainda tem duplicatas no menu
**Solução:**
- Verificar que `dedupeNavigation()` está sendo chamado
- Confirmar que `URL_ALIASES` está atualizado
- Verificar que `hasUrl()` está sendo usado nos itens hardcoded

---

## 📊 MÉTRICAS DE SUCESSO

Após o deploy, espera-se:

- ✅ **Build Time:** <5 minutos
- ✅ **Bundle Size:** <2MB
- ✅ **Lighthouse Score:** >90
- ✅ **Acessibilidade:** WCAG AAA quando alto contraste ativado
- ✅ **Uptime:** 99.9%

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verificar logs do GitHub Actions
2. Verificar logs do Vercel
3. Abrir issue no GitHub
4. Contatar equipe de desenvolvimento

---

**Status:** 🟢 PRONTO PARA DEPLOY

**Data:** 2025-10-24

**Aprovação:** Aguardando confirmação do usuário
