# Code Review Checklist

> Checklist obrigatório para todas as Pull Requests no Nautilus One.

---

## 📋 Antes de Submeter PR

### Código

- [ ] Zero erros TypeScript (`npx tsc --noEmit`)
- [ ] Zero warnings ESLint (`npm run lint`)
- [ ] Código formatado (Prettier)
- [ ] Sem `console.log` (usar `logger` em produção)
- [ ] Sem código comentado
- [ ] Sem TODOs (ou criou issue para cada)
- [ ] Sem `@ts-ignore` ou `@ts-nocheck` (ou justificativa documentada)
- [ ] Sem tipos `: any` (ou justificativa documentada)

### Testes

- [ ] Testes unitários adicionados para nova funcionalidade
- [ ] Testes passando localmente (`npm run test`)
- [ ] Coverage não diminuiu (meta: > 85%)
- [ ] Edge cases cobertos

### Performance

- [ ] Sem re-renders desnecessários (React DevTools)
- [ ] Memoização onde apropriado (`useMemo`, `useCallback`, `memo`)
- [ ] Lazy loading implementado para componentes pesados
- [ ] Bundle size não aumentou significativamente

### Segurança

- [ ] Inputs validados (Zod schemas)
- [ ] Sem hardcoded secrets ou API keys
- [ ] RLS verificado (se mudou estrutura do banco)
- [ ] XSS prevention verificado (`createSafeHTML` para HTML dinâmico)
- [ ] CSRF protection (se formulário sensível)

### Documentação

- [ ] JSDoc adicionado em funções públicas
- [ ] README atualizado (se necessário)
- [ ] CHANGELOG.md atualizado
- [ ] Exemplos de uso adicionados (se API nova)

---

## 🔍 Durante Code Review

### Revisor Deve Verificar

#### Qualidade do Código

- [ ] Código segue patterns estabelecidos do projeto
- [ ] Não introduz duplicação
- [ ] Nomenclatura clara e consistente
- [ ] Funções pequenas e focadas (< 50 linhas)
- [ ] Componentes com responsabilidade única

#### Lógica de Negócio

- [ ] Lógica de negócio correta
- [ ] Edge cases tratados
- [ ] Error handling apropriado
- [ ] Validações implementadas

#### Arquitetura

- [ ] Sem over-engineering
- [ ] Sem premature optimization
- [ ] Separação de concerns adequada
- [ ] Hooks customizados quando apropriado

#### UI/UX

- [ ] Acessibilidade considerada (WCAG 2.1 AA)
- [ ] Mobile responsiveness
- [ ] Loading states implementados
- [ ] Error states implementados
- [ ] Empty states implementados

#### Database (se aplicável)

- [ ] Migrations reversíveis
- [ ] Índices criados para queries frequentes
- [ ] RLS policies configuradas
- [ ] Foreign keys com ON DELETE apropriado

---

## ✅ Aprovação

### Critérios para Aprovar

- Todos os itens obrigatórios marcados
- Código compila sem erros
- Testes passam no CI
- Sem regressões de funcionalidade
- Documentação adequada

### Critérios para Solicitar Mudanças

- Bugs identificados
- Vulnerabilidades de segurança
- Violação de patterns do projeto
- Falta de testes para funcionalidade crítica
- Performance degradada

---

## 📝 Template de Comentário

### Para Issues Menores
```
💡 Suggestion: [descrição]
```

### Para Issues que Precisam Correção
```
🔧 Please fix: [descrição do problema e sugestão de correção]
```

### Para Bloqueadores
```
🚫 Blocking: [descrição do problema crítico]
```

### Para Elogios
```
✨ Nice: [o que ficou bom]
```

---

## 🚀 Merge

### Antes de Fazer Merge

- [ ] Todos os checks do CI passando
- [ ] Pelo menos 1 aprovação
- [ ] Conflitos resolvidos
- [ ] Branch atualizada com main/develop
- [ ] Squash commits (se muitos commits pequenos)

### Após o Merge

- [ ] Verificar deploy em staging
- [ ] Testar funcionalidade básica
- [ ] Monitorar logs por erros

---

## 📊 Métricas de Qualidade

| Métrica | Meta | Como Verificar |
|---------|------|----------------|
| TypeScript Coverage | 100% | `npx tsc --noEmit` |
| ESLint Warnings | 0 | `npm run lint` |
| Test Coverage | > 85% | `npm run test:coverage` |
| Bundle Size | < 500KB | Build output |
| Lighthouse Score | > 90 | Lighthouse CI |

---

*Última atualização: Janeiro 2026*
