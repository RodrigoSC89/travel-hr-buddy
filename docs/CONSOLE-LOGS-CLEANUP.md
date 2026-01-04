# Console Logs Cleanup - Guia de Execução

## Status: Pronto para Execução

O script `scripts/cleanup-console-logs.js` está pronto para remover console.log/debug/info do código de produção.

---

## Comandos

### 1. Preview (Dry Run) - RECOMENDADO PRIMEIRO
```bash
node scripts/cleanup-console-logs.js --dry-run
```

Este comando mostra o que seria alterado sem fazer modificações.

### 2. Preview Detalhado
```bash
node scripts/cleanup-console-logs.js --dry-run --verbose
```

Mostra cada arquivo que seria modificado.

### 3. Executar Limpeza
```bash
node scripts/cleanup-console-logs.js
```

**⚠️ ATENÇÃO**: Este comando modifica os arquivos. Faça commit antes!

---

## O que o Script Faz

### Remove:
- `console.log(...)` - Removido completamente
- `console.debug(...)` - Removido completamente
- `console.info(...)` - Removido completamente

### Preserva:
- `console.error(...)` - Mantido (erros críticos)
- `console.warn(...)` - Mantido (avisos importantes)
- `logger.*` - Mantido (sistema de logging estruturado)

### Arquivos Ignorados:
- `src/lib/logger.ts` - Implementação do logger
- `node_modules/`, `dist/`, `build/` - Diretórios de build
- `e2e/`, `__tests__/`, `stories/` - Testes e storybook

---

## Resultados Esperados

Baseado na análise do código:
- **~1300+ console.logs** a serem removidos
- **Melhoria de performance** em produção
- **Bundle menor** após tree-shaking

---

## Após Execução

1. Verifique as mudanças:
```bash
git diff --stat
```

2. Teste a aplicação:
```bash
npm run dev
```

3. Faça commit:
```bash
git add -A
git commit -m "chore: remove console.logs for production"
```

---

## Rollback

Se algo der errado:
```bash
git checkout -- src/
```

---

## Integração com CI/CD

Adicione ao pipeline de build para prevenir novos console.logs:

```yaml
# .github/workflows/lint.yml
- name: Check for console.logs
  run: |
    if grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" | grep -v "logger.ts"; then
      echo "❌ Found console.log statements in production code"
      exit 1
    fi
```
