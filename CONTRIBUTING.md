# 🙌 Guia de Contribuição

Obrigado por querer contribuir com este projeto! Siga estas etapas para manter o código limpo e funcional.

## 📦 Instalação

```bash
npm install
```

## 🚀 Rodando localmente

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## ✅ Regras para Pull Requests

- Crie branches com nomes claros: `fix/auth-bug`, `feature/onboarding`
- Escreva commits descritivos seguindo o padrão Conventional Commits:
  - `feat:` para novas funcionalidades
  - `fix:` para correções de bugs
  - `docs:` para mudanças na documentação
  - `style:` para formatação de código
  - `refactor:` para refatorações
  - `test:` para adição/modificação de testes
  - `chore:` para tarefas de manutenção

- **Antes de abrir um PR, execute:**
  ```bash
  npm run lint        # Verifica problemas de código
  npm run test        # Executa testes
  npm run build       # Testa o build de produção
  ```

- Resolva todos os `TODO:` e `FIXME:` antes de submeter PR
- Garanta que a cobertura de testes não diminua
- Atualize a documentação se necessário

## 🧪 Testes

- Arquivos de teste devem seguir o padrão: `ComponentName.test.tsx`
- Utilize `@testing-library/react` e `vitest`
- Mantenha cobertura de testes acima de 80%

```bash
npm run test              # Roda todos os testes
npm run test:watch        # Modo watch
npm run test:coverage     # Gera relatório de cobertura
npm run test:ui           # Interface visual para testes
```

## 🛠️ Scripts disponíveis

```bash
npm run dev              # Inicia servidor de desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build
npm run lint             # Lint com ESLint
npm run lint:fix         # Corrige problemas automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação
npm run test             # Executa testes
npm run test:coverage    # Cobertura de testes
npm run test:ui          # Interface visual de testes
```

## 📝 Convenções de Código

### TypeScript
- Use tipagem estrita, evite `any`
- Prefira `interface` para objetos e `type` para uniões/interseções
- Use `const` por padrão, `let` apenas quando necessário
- Sempre exporte tipos/interfaces quando usados em múltiplos arquivos

### React
- Use componentes funcionais com hooks
- Extraia lógica complexa em hooks customizados
- Mantenha componentes pequenos e focados em uma responsabilidade
- Use `memo` apenas quando necessário para performance

### Logging
- **NUNCA** use `console.log` diretamente
- Use o logger centralizado: `import { logger } from '@/lib/logger'`
- Exemplos:
  ```typescript
  logger.info('User logged in', { userId: user.id });
  logger.warn('Rate limit approaching', { requests: count });
  logger.error('Failed to fetch data', error, { endpoint: '/api/users' });
  ```

### Estilização
- Use Tailwind CSS com design tokens do `index.css`
- Evite classes hardcoded como `text-white`, use tokens semânticos
- Componentes shadcn/ui devem ser customizados via variantes
- Mantenha responsividade em todos os componentes

### Banco de Dados
- Use RLS (Row Level Security) em todas as tabelas
- Crie migrações para mudanças no schema
- Documente funções e triggers no SQL
- Sempre valide dados no backend via edge functions

## 🔒 Segurança

- **NUNCA** commite credenciais ou secrets
- Use variáveis de ambiente para dados sensíveis
- Prefixe variáveis públicas com `VITE_`
- Revise RLS policies antes de fazer merge
- Sanitize inputs do usuário

## 📚 Recursos

- [Documentação Vite](https://vitejs.dev/)
- [Documentação React](https://react.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Tailwind CSS](https://tailwindcss.com/)

## 🆘 Precisa de Ajuda?

- Abra uma issue descrevendo o problema
- Entre no Discord da comunidade
- Consulte a documentação do projeto

---

Contribuições são muito bem-vindas! 🚀
