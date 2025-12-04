# Plano de Auditoria e Otimização Contínua (2025)

Este documento consolida as estratégias de otimização para manter a aplicação performática em redes de ~2 Mb e uso eficiente de LLMs.

## Status de Implementação

| Item | Status | Arquivo/Script |
|------|--------|----------------|
| Lighthouse 2Mb preset | ✅ Implementado | `lighthouserc-2mb.json` |
| CI Performance Gate | ✅ Implementado | `scripts/ci-performance-gate.sh` |
| Bundle Budget Check | ✅ Implementado | `scripts/bundle-budget-check.sh` |
| LLM Optimizer | ✅ Implementado | `src/lib/llm-optimizer.ts` |
| Network-aware Hooks | ✅ Implementado | `src/hooks/useNetworkAwareLoading.ts` |
| PWA Caching otimizado | ✅ Configurado | `vite.config.ts` |

## 1. Orçamento de Bundle

### Limites Atuais (CI Gate)
- **Initial JS (gzipped)**: máx. 250KB
- **Chunk individual**: máx. 400KB
- **CSS (gzipped)**: máx. 40KB
- **Total assets**: máx. 2.5MB

### Comandos
```bash
# Verificar orçamento
chmod +x scripts/ci-performance-gate.sh
./scripts/ci-performance-gate.sh

# Analisar bundle detalhado
npm run analyze
```

## 2. Performance em Conexões Lentas (~2Mb)

### Lighthouse para 2Mb
```bash
# Rodar Lighthouse com simulação de 2Mb
npx lhci autorun --config=lighthouserc-2mb.json
```

### Thresholds para 2Mb
| Métrica | Limite |
|---------|--------|
| FCP | < 3.5s |
| LCP | < 4.5s |
| TTI | < 6s |
| TBT | < 500ms |
| Speed Index | < 5s |

## 3. Uso Eficiente de LLMs

### Biblioteca: `src/lib/llm-optimizer.ts`

```typescript
import { 
  selectModel, 
  getTokenBudget, 
  truncateContext,
  getCachedResponse,
  cacheResponse,
  withRetry,
  isSlowConnection
} from '@/lib/llm-optimizer';

// Selecionar modelo baseado na conexão
const model = selectModel('balanced'); // auto-degrada em conexões lentas

// Limitar tokens por rota
const budget = getTokenBudget('/ai/chat');

// Truncar contexto para caber no orçamento
const messages = truncateContext(fullHistory, budget);

// Cache de respostas
const cached = await getCachedResponse(prompt);
if (!cached) {
  const response = await withRetry(() => callLLM(prompt));
  await cacheResponse(prompt, response, model);
}
```

### Boas Práticas
1. **Prompts compactos**: Use `compressPrompt()` para remover espaços extras
2. **Cache agressivo**: Respostas idempotentes são cacheadas por 30min
3. **Retry com backoff**: Máximo 3 tentativas com exponential backoff
4. **Degradação graceful**: Modelos menores em conexões lentas

## 4. Hooks de Rede Adaptativa

### `useNetworkState`
```typescript
const { isSlowConnection, effectiveType, downlink, isOnline } = useNetworkState();

if (isSlowConnection) {
  // Reduzir qualidade de imagens
  // Desabilitar prefetch
  // Usar modelos LLM menores
}
```

### `useAdaptiveLoading`
```typescript
const { data, loading, error } = useAdaptiveLoading(
  () => fetchHeavyData(),
  {
    slowConnectionDelay: 500, // Delay em conexões lentas
    reducedQualityOnSlow: true
  }
);
```

### `usePrefetch`
```typescript
// Prefetch apenas em conexões boas
usePrefetch(['/dashboard', '/hr/crew']);
```

## 5. PWA e Caching

### Estratégias Configuradas (vite.config.ts)
| Asset | Estratégia | TTL |
|-------|------------|-----|
| Fonts | CacheFirst | 1 ano |
| Images | CacheFirst | 30 dias |
| JS/CSS | StaleWhileRevalidate | 7 dias |
| API | NetworkFirst | 10 min |
| Supabase | NetworkFirst | 15 min |

### Limite de Cache
- `maximumFileSizeToCacheInBytes`: 10MB
- Precache: favicon, robots, placeholder, módulos

## 6. Checklist de CI/CD

### Gates Obrigatórios
- [ ] `npm run lint` passa
- [ ] `npm run type-check` passa
- [ ] `npm run test` passa
- [ ] `./scripts/ci-performance-gate.sh` passa
- [ ] Bundle inicial < 250KB gzipped

### Gates Recomendados
- [ ] Cobertura de testes > 80%
- [ ] Lighthouse performance > 70 (2Mb)
- [ ] Lighthouse accessibility > 90
- [ ] Zero chunks > 400KB

## 7. Monitoramento

### Web Vitals em Produção
```typescript
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

onLCP(metric => reportToAnalytics('LCP', metric));
onFID(metric => reportToAnalytics('FID', metric));
onCLS(metric => reportToAnalytics('CLS', metric));
onTTFB(metric => reportToAnalytics('TTFB', metric));
```

### Alertas Sugeridos
- LCP > 2.5s em 10% das sessões
- CLS > 0.1 em 5% das sessões
- Taxa de erro LLM > 5%

## 8. Próximos Passos

1. **Converter imagens para WebP/AVIF** (TODO)
2. **Implementar streaming de respostas LLM** (TODO)
3. **Adicionar E2E tests para rotas críticas** (TODO)
4. **Configurar alertas de Web Vitals** (TODO)

---

Última atualização: Dezembro 2025
