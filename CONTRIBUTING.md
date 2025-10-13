# 🙌 Guia de Contribuição

Obrigado por querer contribuir com este projeto! Siga estas etapas para manter o código limpo e funcional:

## 📦 Instalação

```bash
npm install
```

## 🚀 Rodando localmente

```bash
npm run dev # Inicia o servidor de desenvolvimento na porta 8080
```

## 🧪 Testes

- Arquivos de teste devem seguir o padrão: `ComponentName.test.tsx`
- Utilize `@testing-library/react` e `vitest`

```bash
npm run test           # Roda os testes uma vez
npm run test:watch     # Modo watch para desenvolvimento
npm run test:coverage  # Cobertura de testes
npm run test:ui        # Interface visual dos testes
```

## 🛠️ Scripts úteis

```bash
npm run dev              # Inicia o projeto em modo desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build de produção
npm run lint             # Lint com ESLint
npm run lint:fix         # Corrige erros de lint automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação sem alterar arquivos
```

## ✅ Regras para Pull Requests

- Crie branches com nomes claros: `fix/auth-bug`, `feature/onboarding`, `refactor/use-logger`
- Escreva commits descritivos e em português
- Rode `npm run lint`, `npm run build` e `npm run test` antes de abrir PR
- Resolva todos os conflitos antes de solicitar review
- Mantenha PRs pequenos e focados (máximo 500 linhas quando possível)

## 📝 Convenções de Código

### TypeScript
- Use tipos explícitos sempre que possível
- Evite usar `any` - prefira `unknown` e faça type narrowing
- Use interfaces para objetos públicos e types para unions/intersections

### Logging
- **NUNCA use `console.log`, `console.error`, `console.warn` diretamente**
- Use `logger` de `@/lib/logger`:
  ```typescript
  import { logger } from "@/lib/logger";
  
  logger.info("Informação de debug"); // Apenas em desenvolvimento
  logger.warn("Aviso importante");     // Sempre aparece
  logger.error("Erro crítico", error); // Sempre aparece + Sentry
  ```

### Error Handling
- **NUNCA deixe blocos catch vazios**
- Sempre trate erros adequadamente:
  ```typescript
  try {
    await someOperation();
  } catch (error) {
    logger.error("Falha ao executar operação", error);
    toast({
      title: "Erro",
      description: "Não foi possível completar a operação",
      variant: "destructive"
    });
  }
  ```

### React Components
- Use function components com hooks
- Extraia lógica complexa para custom hooks
- Prefira composição ao invés de herança
- Mantenha componentes pequenos e focados

### Imports
- Organize imports por categoria:
  1. React e bibliotecas externas
  2. Componentes internos
  3. Hooks e utils
  4. Tipos e interfaces
  5. Estilos

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
├── pages/          # Páginas da aplicação
├── hooks/          # Custom hooks
├── lib/            # Utilitários e configurações
├── services/       # Chamadas a APIs externas
├── integrations/   # Integrações (Supabase, etc)
├── tests/          # Testes unitários e de integração
└── types/          # Definições de tipos TypeScript
```

## 🔐 Segurança

- **NUNCA commite secrets, API keys ou senhas**
- Use variáveis de ambiente para configurações sensíveis
- Prefixe variáveis do frontend com `VITE_`
- Mantenha o arquivo `.env.example` atualizado

## 🚀 Deploy

O projeto usa Vercel para deploys automáticos:
- Branch `main`: Deploy de produção
- Pull Requests: Preview deployments automáticos

## 📚 Documentação

- Documente funções complexas com JSDoc
- Atualize o README.md quando adicionar features importantes
- Mantenha comentários relevantes e atualizados

## 🐛 Reportando Bugs

Ao reportar um bug, inclua:
- Descrição clara do problema
- Passos para reproduzir
- Comportamento esperado vs atual
- Screenshots (se aplicável)
- Ambiente (browser, OS, etc)

## 💡 Solicitando Features

Ao solicitar uma feature:
- Descreva o caso de uso
- Explique o valor/benefício
- Forneça exemplos de uso
- Considere alternativas

---

**Dúvidas?** Abra uma issue ou entre em contato com a equipe de desenvolvimento.

✨ Contribuições são muito bem-vindas! 🚀
