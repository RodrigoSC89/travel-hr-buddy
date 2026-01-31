# QA - Quality Assurance

Este diretório contém as ferramentas de garantia de qualidade e interatividade do sistema NAUTI ONE.

## Arquivos

### `nauti-qa-spec.json`
Especificação completa do contrato de QA, incluindo:
- Critérios obrigatórios (must_have)
- Testes de tortura (torture_tests)
- Matriz de pontuação (scoring)
- Lista de módulos e seus status

### `scan-interactivity.mjs`
Scanner automático que detecta:
- Botões sem ação (dead buttons)
- Textos de placeholder/mock
- Erros silenciosos (catch vazio)
- TODOs bloqueadores

**Uso:**
```bash
node qa/scan-interactivity.mjs
```

### `out/`
Diretório de saída com relatórios gerados:
- `interactivity-scan.json` - Resultado do scanner
- `module-scores.json` - Scores por módulo (0-100)

## CI/CD

O workflow `.github/workflows/qa-interactivity.yml` executa automaticamente em PRs e bloqueia merge se houver problemas críticos.

## Scoreboard

Acesse `/system/interactivity` para visualizar o dashboard de scores por módulo.

## Critérios de Aceite

Um módulo só é considerado **Pronto para Teste** quando:
- Score = 100%
- Nenhum bloqueador ativo
- Fluxo ponta-a-ponta executável
