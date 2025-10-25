# PATCH 156.0 – Stress Testing & Load Simulation
**Status:** ✅ READY FOR VALIDATION  
**Objetivo:** Validar performance sob carga extrema  
**Data:** 2025-01-20

---

## 📋 Resumo

Implementação de testes de stress completos usando K6, Playwright e ferramentas de simulação de carga para validar:
- Latência de banco de dados
- Throughput de API
- Consumo de recursos
- Performance de dashboard sob carga

---

## ✅ Checklist de Validação

### 1. Stress Test Supabase (K6)
- [ ] K6 instalado e configurado
- [ ] Script `tests/stress/k6-supabase-stress.js` executado
- [ ] Report gerado em `reports/stress-test-supabase.json`
- [ ] P95 latency < 2000ms
- [ ] Failure rate < 10%
- [ ] Throughput > 50 req/s

### 2. AI API Stress Test
- [ ] Script `tests/stress/ai-api-stress.js` executado
- [ ] Batching funcionando corretamente
- [ ] Report gerado em `reports/stress-test-ai-api.json`
- [ ] Average latency < 3000ms
- [ ] P95 latency < 5000ms
- [ ] Failure rate < 5%
- [ ] Token efficiency > 100 tokens/request

### 3. Dashboard Stress Test
- [ ] Script `tests/stress/dashboard-stress.js` executado
- [ ] Screenshots capturados em `reports/stress-screenshots/`
- [ ] Report gerado em `reports/stress-test-dashboard.json`
- [ ] Page load < 3000ms
- [ ] First Contentful Paint < 1500ms
- [ ] Zero console errors
- [ ] Memory usage < 100MB

### 4. Performance Targets
- [ ] Database: P95 < 2s, Failure < 10%, Throughput > 50/s
- [ ] AI API: Avg < 3s, P95 < 5s, Failure < 5%
- [ ] Dashboards: Load < 3s, FCP < 1.5s, Memory < 100MB

### 5. CI/CD Integration
- [ ] Workflow `.github/workflows/stress-tests.yml` configurado
- [ ] Testes executam automaticamente em PRs
- [ ] Reports gerados como artifacts
- [ ] Alertas configurados para degradação

---

## 🧪 Cenários de Teste

### Cenário 1: Load Test de Leitura
```bash
export VITE_SUPABASE_URL="https://vnbptmixvwropvanyhdb.supabase.co"
export VITE_SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
k6 run tests/stress/k6-supabase-stress.js
```

**Expected:**
- 100 VUs simultâneos
- 95% requests < 2s
- < 10% failures
- Report JSON gerado

### Cenário 2: AI API Batch Test
```bash
export VITE_OPENAI_API_KEY="sk-..."
node tests/stress/ai-api-stress.js
```

**Expected:**
- 50 requests totais
- 10 concurrent requests
- Batching em grupos de 5
- Latency metrics coletados

### Cenário 3: Dashboard Performance
```bash
export VITE_APP_URL="http://localhost:5173"
node tests/stress/dashboard-stress.js
```

**Expected:**
- 20 iterações por dashboard
- Screenshots salvos
- Memory metrics coletados
- No console errors

---

## 📂 Arquivos Relacionados

- `tests/stress/k6-supabase-stress.js` – K6 load test script
- `tests/stress/ai-api-stress.js` – AI API stress test
- `tests/stress/dashboard-stress.js` – Dashboard performance test
- `tests/stress/README.md` – Documentação completa
- `reports/` – Diretório de reports gerados

---

## 📊 Métricas de Sucesso

| Métrica | Target | Atual | Status |
|---------|--------|-------|--------|
| DB P95 Latency | < 2000ms | TBD | ⏳ |
| DB Failure Rate | < 10% | TBD | ⏳ |
| DB Throughput | > 50/s | TBD | ⏳ |
| AI Avg Latency | < 3000ms | TBD | ⏳ |
| AI P95 Latency | < 5000ms | TBD | ⏳ |
| Dashboard Load | < 3000ms | TBD | ⏳ |
| Dashboard FCP | < 1500ms | TBD | ⏳ |
| Memory Usage | < 100MB | TBD | ⏳ |

---

## 🐛 Problemas Conhecidos

1. **K6 não instalado**
   - Solução: `brew install k6` (macOS) ou seguir README
   
2. **Rate limiting em APIs**
   - Solução: Reduzir concurrent requests ou aumentar delays

3. **Memory leaks em loops longos**
   - Solução: Aumentar `NODE_OPTIONS="--max-old-space-size=4096"`

---

## ✅ Critérios de Aprovação

- [ ] Todos os 3 scripts executam sem erros
- [ ] Reports JSON gerados com métricas completas
- [ ] Todos os targets de performance atingidos
- [ ] Zero critical errors durante testes
- [ ] CI/CD workflow funcionando
- [ ] Documentação README.md completa

---

## 📝 Notas Técnicas

### K6 Configuration
```javascript
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'failed_requests': ['rate<0.1'],
  },
};
```

### AI Stress Config
```javascript
const CONFIG = {
  CONCURRENT_REQUESTS: 10,
  TOTAL_REQUESTS: 50,
  BATCH_SIZE: 5,
  TIMEOUT_MS: 30000,
};
```

### Dashboard Config
```javascript
const CONFIG = {
  NUM_ITERATIONS: 20,
  DASHBOARDS: ['/analytics', '/dashboard', '/bi-jobs'],
};
```

---

## 🚀 Próximos Passos

1. Executar todos os 3 scripts de stress
2. Analisar reports e identificar bottlenecks
3. Otimizar queries/components com problemas
4. Re-executar testes para validar melhorias
5. Integrar no CI/CD pipeline
6. Configurar alertas de performance

---

## 📚 Referências

- [K6 Documentation](https://k6.io/docs/)
- [Playwright Performance](https://playwright.dev/docs/intro)
- [Supabase Performance](https://supabase.com/docs/guides/platform/performance)
- `/tests/stress/README.md`
