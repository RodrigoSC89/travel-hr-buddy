# E2E Tests - PEOTRAM & PEO-DP

## Comandos para Executar

```bash
# Instalar dependências do Playwright
npx playwright install --with-deps chromium

# Executar testes PEOTRAM
npx playwright test e2e/peotram.spec.ts --project=chromium

# Executar testes PEO-DP
npx playwright test e2e/peo-dp.spec.ts --project=chromium

# Executar todos os testes E2E
npx playwright test e2e/ --project=chromium

# Executar com relatório HTML
npx playwright test e2e/ --reporter=html
```

## Testes PEOTRAM (10 casos)

| # | Teste | Descrição |
|---|-------|-----------|
| 1 | Dashboard PEOTRAM | Verifica exibição do dashboard principal |
| 2 | 13 Elementos | Verifica tabs dos 13 elementos |
| 3 | Score de Compliance | Verifica exibição da pontuação |
| 4 | Botão Nova Auditoria | Verifica clique no botão de nova auditoria |
| 5 | Lista de Auditorias | Verifica tabela de auditorias |
| 6 | Assistente IA | Verifica tab do assistente de IA |
| 7 | Gerador de Evidências | Verifica tab de evidências |
| 8 | Botão Exportar | Verifica funcionalidade de exportação |
| 9 | Relatório PDF | Verifica navegação para relatório PDF |
| 10 | Não Conformidades | Verifica seção de não conformidades |

## Testes PEO-DP (10 casos)

| # | Teste | Descrição |
|---|-------|-----------|
| 1 | Dashboard PEO-DP | Verifica exibição do dashboard principal |
| 2 | 7 Pilares | Verifica overview dos 7 pilares |
| 3 | Status ASOG | Verifica exibição do status ASOG |
| 4 | Seletor DP Class | Verifica seletor DP1/DP2/DP3 |
| 5 | Métricas Compliance | Verifica cards de métricas |
| 6 | Integração FMEA | Verifica tab FMEA |
| 7 | AI Advisor | Verifica seção do AI Advisor |
| 8 | Logbook | Verifica seção de logbook |
| 9 | DP Trials | Verifica seção de testes DP |
| 10 | Exportar | Verifica funcionalidade de exportação |

## Monitoramento Sentry Configurado

### Eventos Monitorados
- ✅ Erros de clique em botões
- ✅ Botões não funcionais
- ✅ Performance lenta de ações (>1000ms)
- ✅ Session Replay para erros
- ✅ Breadcrumbs de clicks UI

### Tags Sentry
- `error_type`: button_click | non_functional_button
- `module`: Nome do módulo
- `component`: Nome do componente
- `action`: Tipo de ação
- `app_version`: 3.2.0

### Configuração Necessária
```env
VITE_SENTRY_DSN=your-sentry-dsn-here
```

## Status: ✅ PRONTO PARA PRODUÇÃO

- Testes E2E: 20 casos configurados
- Monitoramento: Sentry integrado
- Cobertura: PEOTRAM + PEO-DP completos
